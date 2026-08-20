import { prisma } from '../../infrastructure/database/prisma';
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
          status: 'ACTIVE' as const,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
        }
      });
      
      return { 
        status: 'ACTIVE' as const,
        reservationId: reservation.id,
        productId,
        quantity,
        expiresAt: reservation.expiresAt.toISOString()
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

  async checkAvailability(productId: string, quantity: number = 1): Promise<{ available: boolean, onHand: number, status: string }> {
    const inventory = await prisma.inventory.findUnique({ where: { productId } });
    if (!inventory) return { available: false, onHand: 0, status: 'OUT_OF_STOCK' };
    const available = inventory.onHand >= quantity;
    return { available, onHand: inventory.onHand, status: available ? 'AVAILABLE' : 'OUT_OF_STOCK' };
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