import { Request, Response, NextFunction } from 'express';
import { orderService } from './order.service';

export const orderController = {
  async getOrderSecure(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const accessToken = req.query.accessToken as string || req.headers['x-order-token'] as string;
      
      if (!accessToken) {
        return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Order access token required' });
      }

      const order = await orderService.getOrderSecure(id, accessToken);
      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  },

  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const accessToken = req.query.accessToken as string || req.headers['x-order-token'] as string;
      
      if (!accessToken) {
        return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Order access token required' });
      }

      // Verify token
      await orderService.getOrderSecure(id, accessToken);

      const { reason } = req.body;
      const order = await orderService.cancelOrder(id, reason || 'Customer request', 'CUSTOMER_REQUEST');
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
