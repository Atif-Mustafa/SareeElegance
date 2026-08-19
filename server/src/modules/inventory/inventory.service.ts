import { inventoryRepository } from './inventory.repository';
import { ApiError } from '../../common/errors/ApiError';
import type { InventoryAvailabilityDto, InventoryReservationDto } from '../../../../shared/contracts/inventory/inventory-response';

import { env } from '../../config/env';

const MAX_QUANTITY = 999;

export const inventoryService = {
  async checkAvailability(productId: string): Promise<InventoryAvailabilityDto> {
    const data = await inventoryRepository.getAvailability(productId);
    
    if (!data) {
      throw ApiError.notFound('Product inventory not found');
    }

    let status: 'AVAILABLE' | 'INSUFFICIENT_STOCK' | 'OUT_OF_STOCK' = 'AVAILABLE';
    if (data.available <= 0) {
      status = 'OUT_OF_STOCK';
    }

    return {
      productId,
      onHand: data.onHand,
      available: data.available,
      status
    };
  },

  async reserveItems(productId: string, quantity: number): Promise<InventoryReservationDto> {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw ApiError.badRequest('Quantity must be a positive integer', 'INVALID_QUANTITY');
    }

    if (quantity > MAX_QUANTITY) {
      throw ApiError.badRequest(`Quantity exceeds maximum of ${MAX_QUANTITY}`, 'QUANTITY_EXCEEDED');
    }

    const reservation = await inventoryRepository.reserve(productId, quantity, env.INVENTORY_HOLD_MINUTES);

    return {
      reservationId: reservation.id,
      productId,
      quantity: reservation.quantity,
      status: reservation.status,
      expiresAt: reservation.expiresAt.toISOString()
    };
  },

  async releaseReservation(reservationId: string): Promise<void> {
    await inventoryRepository.release(reservationId);
  },

  async consumeReservation(reservationId: string): Promise<void> {
    await inventoryRepository.consume(reservationId);
  },

  async restoreConsumedInventory(reservationId: string): Promise<void> {
    await inventoryRepository.restore(reservationId);
  }
};
