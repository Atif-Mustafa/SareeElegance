import { prisma } from '../../infrastructure/database/prisma';
import { ApiError } from '../../common/errors/ApiError';
import { PaymentStatus, PaymentProvider } from '@prisma/client';
import { randomBytes, randomUUID } from 'crypto';

export class PaymentService {
  async refundPayment(paymentAttemptId: string, amountMinor: bigint): Promise<{ providerRefundId: string, status: 'SUCCEEDED' | 'FAILED' }> {
    const payment = await prisma.paymentAttempt.findUnique({
      where: { id: paymentAttemptId }
    });

    if (!payment) throw ApiError.notFound('Payment not found');
    if (payment.status !== 'SUCCEEDED') throw ApiError.badRequest('Payment not in SUCCEEDED state', 'INVALID_PAYMENT_STATE');
    if (amountMinor <= 0n) throw ApiError.badRequest('Refund amount must be greater than 0', 'INVALID_REFUND_AMOUNT');
    if (amountMinor > payment.amountMinor) throw ApiError.badRequest('Refund amount exceeds payment amount', 'EXCESSIVE_REFUND');

    if (paymentAttemptId.includes('FAIL_REFUND')) {
      return { providerRefundId: `ref_${randomBytes(8).toString('hex')}`, status: 'FAILED' };
    }

    return { providerRefundId: `ref_${randomBytes(8).toString('hex')}`, status: 'SUCCEEDED' };
  }

  async createPaymentAttempt(checkoutSessionId: string, amountMinor: bigint, currency: string, provider: PaymentProvider): Promise<{ id: string, providerOrderId: string }> {
    const providerOrderId = `po_${randomBytes(8).toString('hex')}`;
    const attempt = await prisma.paymentAttempt.create({
      data: {
        idempotencyKey: randomUUID(),
        checkoutSessionId,
        provider,
        providerOrderId,
        amountMinor,
        currency,
        status: 'CREATED'
      }
    });
    return { id: attempt.id, providerOrderId: attempt.providerOrderId };
  }

  async verifyPayment(providerOrderId: string): Promise<{ paymentAttemptId: string, status: PaymentStatus }> {
    const attempt = await prisma.paymentAttempt.findUnique({ where: { providerOrderId } });
    if (!attempt) throw ApiError.notFound('Payment attempt not found');
    
    const newStatus: PaymentStatus = attempt.status === 'CREATED' ? 'SUCCEEDED' : attempt.status;

    if (newStatus !== attempt.status) {
      await prisma.paymentAttempt.update({
        where: { id: attempt.id },
        data: { status: newStatus, verifiedAt: new Date() }
      });
    }
    return { paymentAttemptId: attempt.id, status: newStatus };
  }

  async handleWebhook(provider: string, payload: any): Promise<void> {
    // mock webhook handler
  }
}

export const paymentService = new PaymentService();