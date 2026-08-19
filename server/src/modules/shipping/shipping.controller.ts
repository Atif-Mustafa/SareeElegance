import { Request, Response, NextFunction } from 'express';
import { shippingService } from './shipping.service';
import { orderService } from '../order/order.service';

export const shippingController = {
  async getShipment(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const accessToken = req.query.accessToken as string || req.headers['x-order-token'] as string;
      
      if (!accessToken) {
        return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Order access token required' });
      }

      // Verify authorization
      await orderService.getOrderSecure(orderId, accessToken);

      const shipment = await shippingService.getShipmentForOrder(orderId);
      res.status(200).json(shipment);
    } catch (error) {
      next(error);
    }
  },

  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['x-shipping-signature'] as string;
      await shippingService.processWebhook(req.body, signature);
      res.status(200).json({ received: true });
    } catch (error) {
      next(error);
    }
  }
};
