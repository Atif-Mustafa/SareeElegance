import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '../../infrastructure/database/prisma';
import { ApiError } from '../../common/errors/ApiError';
import { checkoutService } from '../checkout/checkout.service';
import { PaymentAttemptDto } from '../../../../shared/contracts/payment/payment-response';
import { ERROR_CODES } from '../../../../shared/errors/error-codes';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';

let razorpay: any;
if (RAZORPAY_KEY_ID !== 'rzp_test_dummy') {
  razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
}

export class PaymentService {
  async createPaymentAttempt(checkoutId: string): Promise<{ paymentAttempt: PaymentAttemptDto, providerData: any }> {
    const checkout = await checkoutService.getCheckout(checkoutId);

    if (checkout.status !== 'OPEN') {
      throw ApiError.badRequest('Checkout is no longer open.', 'CHECKOUT_INVALID_STATE');
    }

    if (new Date(checkout.expiresAt) < new Date()) {
      throw ApiError.badRequest('Checkout has expired.', 'CHECKOUT_EXPIRED');
    }

    let amountMinor = BigInt(0);
    const dbCheckout = await prisma.checkoutSession.findUnique({ where: { id: checkoutId } });
    if (!dbCheckout) throw ApiError.notFound('Checkout not found');

    if (dbCheckout.totalMinor == null) {
      await prisma.checkoutSession.update({
        where: { id: checkoutId },
        data: { 
          totalMinor: dbCheckout.subtotalMinor,
          taxMinor: BigInt(0),
          shippingMinor: BigInt(0),
          discountMinor: BigInt(0),
        }
      });
      amountMinor = dbCheckout.subtotalMinor;
    } else {
      amountMinor = dbCheckout.totalMinor;
    }

    const idempotencyKey = `pay_init_${checkoutId}`;

    let attempt = await prisma.paymentAttempt.findUnique({
      where: { idempotencyKey }
    });

    if (!attempt) {
      let providerOrderId = `dummy_order_${Date.now()}`;
      if (razorpay) {
        try {
          const rzpOrder = await razorpay.orders.create({
            amount: Number(amountMinor),
            currency: dbCheckout.currency,
            receipt: checkoutId,
          });
          providerOrderId = rzpOrder.id;
        } catch (err) {
          console.error("Razorpay order creation failed:", err);
          throw new ApiError(503, 'Payment provider unavailable', ERROR_CODES.INFRA_001);
        }
      }

      attempt = await prisma.paymentAttempt.create({
        data: {
          idempotencyKey,
          checkoutSessionId: checkoutId,
          provider: 'RAZORPAY',
          providerOrderId,
          amountMinor,
          currency: dbCheckout.currency,
          status: 'CREATED',
        }
      });
    }

    return {
      paymentAttempt: this.mapToDto(attempt),
      providerData: {
        key: RAZORPAY_KEY_ID,
        orderId: attempt.providerOrderId,
        amount: Number(attempt.amountMinor),
        currency: attempt.currency,
      }
    };
  }

  async verifyPayment(providerOrderId: string, providerPaymentId: string, signature: string): Promise<PaymentAttemptDto> {
    const attempt = await prisma.paymentAttempt.findUnique({
      where: { providerOrderId }
    });

    if (!attempt) {
      throw ApiError.notFound('Payment attempt not found');
    }

    if (attempt.status === 'SUCCEEDED') {
      return this.mapToDto(attempt);
    }

    if (razorpay) {
      const body = providerOrderId + "|" + providerPaymentId;
      const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");
      
      if (expectedSignature !== signature) {
        await prisma.paymentAttempt.update({
          where: { id: attempt.id },
          data: { status: 'FAILED', failureReason: 'Invalid signature' }
        });
        throw ApiError.badRequest('Invalid payment signature', 'PAYMENT_VERIFICATION_FAILED');
      }
    } else {
      if (signature !== 'mock_success_signature') {
        throw ApiError.badRequest('Invalid payment signature', 'PAYMENT_VERIFICATION_FAILED');
      }
    }

    const updated = await prisma.paymentAttempt.update({
      where: { id: attempt.id },
      data: {
        status: 'SUCCEEDED',
        providerPaymentId,
        verifiedAt: new Date()
      }
    });

    return this.mapToDto(updated);
  }

  async handleWebhook(event: any): Promise<void> {
    if (event.event === 'order.paid') {
      const orderId = event.payload.order.entity.id;
      const paymentId = event.payload.payment.entity.id;

      const attempt = await prisma.paymentAttempt.findUnique({
        where: { providerOrderId: orderId }
      });

      if (!attempt) return;
      if (attempt.status === 'SUCCEEDED') return;

      const eventAmount = event.payload.order.entity.amount;
      if (BigInt(eventAmount) !== attempt.amountMinor) {
        console.error("Webhook amount mismatch", { expected: attempt.amountMinor, got: eventAmount });
        return;
      }

      await prisma.paymentAttempt.update({
        where: { id: attempt.id },
        data: {
          status: 'SUCCEEDED',
          providerPaymentId: paymentId,
          verifiedAt: new Date()
        }
      });
    }
  }

  private mapToDto(attempt: any): PaymentAttemptDto {
    return {
      id: attempt.id,
      checkoutSessionId: attempt.checkoutSessionId,
      provider: attempt.provider,
      providerOrderId: attempt.providerOrderId,
      amount: {
        amountMinor: attempt.amountMinor.toString(),
        currency: attempt.currency,
      },
      status: attempt.status,
      createdAt: attempt.createdAt.toISOString(),
    };
  }
}

export const paymentService = new PaymentService();
