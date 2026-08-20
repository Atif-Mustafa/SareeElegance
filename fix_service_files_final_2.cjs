const fs = require('fs');

let inv = fs.readFileSync('server/src/modules/inventory/inventory.service.ts', 'utf-8');
inv = `import { prisma } from '../../infrastructure/database/prisma';
import { ApiError } from '../../common/errors/ApiError';
import { inventoryRepository } from './inventory.repository';

export class InventoryService {
  async reserveItems(productId: string, quantity: number) {
    if (quantity <= 0) throw ApiError.badRequest('Quantity must be positive');
        
    return await prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({
        where: { productId }
      });
      if (!inventory) throw ApiError.notFound('Inventory not found');
      if (inventory.onHand < quantity) throw ApiError.badRequest('Insufficient inventory', 'INSUFFICIENT_STOCK');
      
      const updated = await tx.inventory.update({
        where: { productId },
        data: { onHand: inventory.onHand - quantity }
      });
      
      const reservation = await tx.reservation.create({
        data: {
          inventoryId: inventory.id,
          quantity,
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
        }
      });
      
      return { 
        status: 'ACTIVE',
        reservationId: reservation.id,
        productId,
        quantity,
        expiresAt: reservation.expiresAt
      };
    });
  }
  
  async consumeReservation(reservationId: string) {
    return await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId }
      });
      if (!reservation) throw ApiError.notFound('Reservation not found');
      if (reservation.status !== 'ACTIVE') {
        throw ApiError.badRequest('Reservation not active', 'INVALID_RESERVATION');
      }
      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: 'CONSUMED' }
      });
    });
  }
  
  async restoreConsumedInventory(reservationId: string) {
    await inventoryRepository.restore(reservationId);
  }
  
  async restockReturn(orderLineId: string, quantity: number) {
    return await prisma.$transaction(async (tx) => {
      const line = await tx.orderLine.findUnique({
        where: { id: orderLineId }
      });
      if (!line) throw ApiError.notFound('Order line not found');
      
      const inventory = await tx.inventory.findUnique({
        where: { productId: line.productId }
      });
      if (!inventory) throw ApiError.notFound('Inventory record not found for returned product');
      
      await tx.reservation.create({
        data: {
          inventoryId: inventory.id,
          quantity: quantity,
          status: 'RESTORED',
          expiresAt: new Date()
        }
      });
      await tx.inventory.update({
        where: { id: inventory.id },
        data: { onHand: { increment: quantity } }
      });
    });
  }

  async checkAvailability(productId: string, quantity: number = 1): Promise<{ available: boolean, onHand: number }> {
    const inventory = await prisma.inventory.findUnique({ where: { productId } });
    if (!inventory) return { available: false, onHand: 0 };
    return { available: inventory.onHand >= quantity, onHand: inventory.onHand };
  }

  async releaseReservation(reservationId: string) {
    return await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({ where: { id: reservationId } });
      if (!reservation) throw ApiError.notFound('Reservation not found');
      if (reservation.status !== 'ACTIVE') return;

      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: 'RELEASED' }
      });

      await tx.inventory.update({
        where: { id: reservation.inventoryId },
        data: { onHand: { increment: reservation.quantity } }
      });
    });
  }
}

export const inventoryService = new InventoryService();`;

fs.writeFileSync('server/src/modules/inventory/inventory.service.ts', inv);


let pay = `import { prisma } from '../../infrastructure/database/prisma';
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
      return { providerRefundId: \`ref_\${randomBytes(8).toString('hex')}\`, status: 'FAILED' };
    }

    return { providerRefundId: \`ref_\${randomBytes(8).toString('hex')}\`, status: 'SUCCEEDED' };
  }

  async createPaymentAttempt(checkoutSessionId: string, amountMinor: bigint, currency: string, provider: PaymentProvider): Promise<{ id: string, providerOrderId: string }> {
    const providerOrderId = \`po_\${randomBytes(8).toString('hex')}\`;
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

export const paymentService = new PaymentService();`;

fs.writeFileSync('server/src/modules/payment/payment.service.ts', pay);
