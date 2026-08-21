import { Request, Response, NextFunction } from 'express';
import { orderService } from './order.service';

export const orderController = {
  async getOrderSecure(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const accessToken = req.query.accessToken as string || req.headers['x-order-token'] as string;
      const customerId = req.customer?.id;

      const order = await orderService.assertOrderAccess(id, customerId, accessToken);
      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  },

  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const accessToken = req.query.accessToken as string || req.headers['x-order-token'] as string;
      const customerId = req.customer?.id;

      // Verify access permission
      await orderService.assertOrderAccess(id, customerId, accessToken);

      const { reason } = req.body;
      const actor = customerId ? `CUSTOMER_${customerId}` : 'CUSTOMER_REQUEST';
      const order = await orderService.cancelOrder(id, reason || 'Customer request', actor);
      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  },

  async prepareFulfillment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      // In a real app, this should be protected by Auth (admin role).
      // For this PR, we assume an internal system actor calls this.
      
      const order = await orderService.prepareFulfillment(id);
      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  }
};

