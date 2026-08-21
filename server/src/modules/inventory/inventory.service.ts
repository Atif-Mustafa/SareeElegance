import { prisma } from '../../infrastructure/database/prisma';
import { ApiError } from '../../common/errors/ApiError';
import { inventoryRepository } from './inventory.repository';

export class InventoryService {
  async reserveItems(productId: string, quantity: number) {
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      throw ApiError.badRequest('Quantity must be a positive integer', 'INVALID_QUANTITY');
    }
    if (quantity > 999) {
      throw ApiError.badRequest('Quantity exceeds maximum of 999', 'INVALID_QUANTITY');
    }
        
    const reservation = await inventoryRepository.reserve(productId, quantity, 15);
    return { 
      status: 'ACTIVE' as const,
      reservationId: reservation.id,
      productId,
      quantity,
      expiresAt: reservation.expiresAt.toISOString()
    };
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

  async checkAvailability(productId: string): Promise<{ available: number, onHand: number, status: string }> {
    const inv = await inventoryRepository.getAvailability(productId);
    if (!inv) throw ApiError.notFound('Product not found in inventory');
    return { available: inv.available, onHand: inv.onHand, status: inv.available > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK' };
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

export const inventoryService = new InventoryService();