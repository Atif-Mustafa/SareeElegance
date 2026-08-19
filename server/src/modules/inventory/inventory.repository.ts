import { prisma } from '../../infrastructure/database/prisma';
import { ApiError } from '../../common/errors/ApiError';

export const inventoryRepository = {
  async getAvailability(productId: string) {
    try {
      const inventory = await prisma.inventory.findUnique({
        where: { productId }
      });
      if (!inventory) {
        return null;
      }

      const activeReservations = await prisma.reservation.aggregate({
        _sum: { quantity: true },
        where: {
          inventoryId: inventory.id,
          status: 'ACTIVE',
          expiresAt: { gt: new Date() }
        }
      });

      const reserved = activeReservations._sum.quantity || 0;
      return {
        inventoryId: inventory.id,
        productId,
        onHand: inventory.onHand,
        reserved,
        available: inventory.onHand - reserved
      };
    } catch (error) {
      throw ApiError.internal('Database connection failed', 'INFRA_001');
    }
  },

  async reserve(productId: string, quantity: number, expiresInMinutes: number) {
    try {
      return await prisma.$transaction(async (tx: any) => {
        // Find inventory ID first
        const inventoryRecord = await tx.inventory.findUnique({
          where: { productId }
        });

        if (!inventoryRecord) {
          throw ApiError.badRequest(`Product ${productId} not found in inventory`, 'INVALID_SKU');
        }

        // Lock the row
        await tx.$queryRaw`SELECT * FROM "Inventory" WHERE "id" = ${inventoryRecord.id} FOR UPDATE`;

        // Calculate reserved
        const activeReservations = await tx.reservation.aggregate({
          _sum: { quantity: true },
          where: {
            inventoryId: inventoryRecord.id,
            status: 'ACTIVE',
            expiresAt: { gt: new Date() }
          }
        });

        const reserved = activeReservations._sum.quantity || 0;
        const available = inventoryRecord.onHand - reserved;

        if (available < quantity) {
          throw ApiError.badRequest(`Insufficient stock for ${productId}`, 'INSUFFICIENT_STOCK');
        }

        const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

        const reservation = await tx.reservation.create({
          data: {
            inventoryId: inventoryRecord.id,
            quantity,
            status: 'ACTIVE',
            expiresAt
          }
        });

        return reservation;
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal('Database connection failed', 'INFRA_001');
    }
  },

  async release(reservationId: string) {
    try {
      return await prisma.reservation.updateMany({
        where: {
          id: reservationId,
          status: 'ACTIVE' // Only release if still active
        },
        data: {
          status: 'RELEASED'
        }
      });
    } catch (error) {
      throw ApiError.internal('Database connection failed', 'INFRA_001');
    }
  },

  async consume(reservationId: string) {
    try {
      return await prisma.$transaction(async (tx: any) => {
        const reservation = await tx.reservation.findUnique({
          where: { id: reservationId },
          include: { inventory: true }
        });

        if (!reservation) throw ApiError.notFound('Reservation not found');
        if (reservation.status === 'CONSUMED') return reservation;
        if (reservation.status !== 'ACTIVE') throw ApiError.badRequest(`Cannot consume reservation with status ${reservation.status}`, 'INVENTORY_RESERVATION_INVALID');

        // Update reservation to CONSUMED
        const updatedReservation = await tx.reservation.update({
          where: { id: reservationId },
          data: { status: 'CONSUMED' }
        });

        // Decrement onHand inventory permanently
        await tx.inventory.update({
          where: { id: reservation.inventoryId },
          data: { onHand: { decrement: reservation.quantity } }
        });

        return updatedReservation;
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.internal('Database connection failed', 'INFRA_001');
    }
  },

  async restore(reservationId: string) {
    try {
      return await prisma.$transaction(async (tx: any) => {
        await tx.$queryRaw`SELECT * FROM "Reservation" WHERE "id" = ${reservationId} FOR UPDATE`;
        const reservation = await tx.reservation.findUnique({
          where: { id: reservationId },
          include: { inventory: true }
        });
        
        if (!reservation) throw ApiError.notFound('Reservation not found');
        if (reservation.status === 'RESTORED') return reservation;
        if (reservation.status === 'RELEASED') return reservation;
        if (reservation.status !== 'CONSUMED') throw ApiError.badRequest(`Cannot restore reservation with status ${reservation.status}`, 'INVENTORY_RESERVATION_INVALID');

        const updatedReservation = await tx.reservation.update({
          where: { id: reservationId },
          data: { status: 'RESTORED' }
        });

        // Increment onHand inventory permanently
        await tx.inventory.update({
          where: { id: reservation.inventoryId },
          data: { onHand: { increment: reservation.quantity } }
        });

        return updatedReservation;
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.internal('Database connection failed', 'INFRA_001');
    }
  }
};
