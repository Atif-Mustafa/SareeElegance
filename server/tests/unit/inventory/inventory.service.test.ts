import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inventoryService } from '../../../src/modules/inventory/inventory.service';
import { inventoryRepository } from '../../../src/modules/inventory/inventory.repository';
import { ApiError } from '../../../src/common/errors/ApiError';

vi.mock('../../../src/modules/inventory/inventory.repository', () => ({
  inventoryRepository: {
    getAvailability: vi.fn(),
    reserve: vi.fn(),
    release: vi.fn()
  }
}));

describe('InventoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkAvailability', () => {
    it('returns AVAILABLE when stock is positive', async () => {
      vi.mocked(inventoryRepository.getAvailability).mockResolvedValue({
        inventoryId: 'inv-1',
        productId: 'prod-1',
        onHand: 10,
        reserved: 2,
        available: 8
      });

      const result = await inventoryService.checkAvailability('prod-1');
      expect(result.status).toBe('AVAILABLE');
      expect(result.available).toBe(8);
    });

    it('returns OUT_OF_STOCK when available is 0', async () => {
      vi.mocked(inventoryRepository.getAvailability).mockResolvedValue({
        inventoryId: 'inv-1',
        productId: 'prod-1',
        onHand: 2,
        reserved: 2,
        available: 0
      });

      const result = await inventoryService.checkAvailability('prod-1');
      expect(result.status).toBe('OUT_OF_STOCK');
      expect(result.available).toBe(0);
    });

    it('throws 404 when product not found', async () => {
      vi.mocked(inventoryRepository.getAvailability).mockResolvedValue(null);

      await expect(inventoryService.checkAvailability('prod-unknown'))
        .rejects.toThrowError(ApiError);
    });
  });

  describe('reserveItems', () => {
    it('validates constraints before calling repository', async () => {
      await expect(inventoryService.reserveItems('prod-1', -5))
        .rejects.toThrow('Quantity must be a positive integer');
        
      await expect(inventoryService.reserveItems('prod-1', 1000))
        .rejects.toThrow('Quantity exceeds maximum of 999');

      expect(inventoryRepository.reserve).not.toHaveBeenCalled();
    });

    it('returns reservation on success', async () => {
      const mockDate = new Date();
      vi.mocked(inventoryRepository.reserve).mockResolvedValue({
        id: 'res-1',
        inventoryId: 'inv-1',
        quantity: 5,
        status: 'ACTIVE',
        createdAt: mockDate,
        updatedAt: mockDate,
        expiresAt: mockDate
      });

      const result = await inventoryService.reserveItems('prod-1', 5);
      expect(result.reservationId).toBe('res-1');
      expect(result.quantity).toBe(5);
      expect(result.status).toBe('ACTIVE');
    });
  });
});
