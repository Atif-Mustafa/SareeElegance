import { Request, Response, NextFunction } from 'express';
import { inventoryService } from './inventory.service';
import { ApiError } from '../../common/errors/ApiError';
import { ReserveInventoryRequest } from '../../../../shared/contracts/inventory/inventory-request';

export const inventoryController = {
  async getAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const availability = await inventoryService.checkAvailability(productId);
      res.json({ success: true, data: availability });
    } catch (error) {
      next(error);
    }
  },

  async reserve(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId, quantity } = req.body as ReserveInventoryRequest;
      if (!productId || typeof quantity !== 'number') {
        throw ApiError.badRequest('Missing productId or quantity', 'INVALID_REQUEST');
      }

      const reservation = await inventoryService.reserveItems(productId, quantity);
      res.status(201).json({ success: true, data: reservation });
    } catch (error) {
      next(error);
    }
  },

  async release(req: Request, res: Response, next: NextFunction) {
    try {
      const { reservationId } = req.params;
      await inventoryService.releaseReservation(reservationId);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
};
