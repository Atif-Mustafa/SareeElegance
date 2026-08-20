import { Request, Response, NextFunction } from 'express';
import { returnsService } from './returns.service';
import { orderService } from '../order/order.service';

export const returnsController = {
  async createReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const accessToken = req.query.accessToken as string || req.headers['x-order-token'] as string;
      
      if (!accessToken) {
        return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Order access token required' });
      }

      await orderService.getOrderSecure(orderId, accessToken);
      
      const result = await returnsService.createReturnRequest(orderId, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getReturns(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const accessToken = req.query.accessToken as string || req.headers['x-order-token'] as string;

      if (!accessToken) {
        return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Order access token required' });
      }

      await orderService.getOrderSecure(orderId, accessToken);
      
      const returns = await returnsService.getReturnsForOrder(orderId);
      res.status(200).json(returns);
    } catch (error) {
      next(error);
    }
  }
};
