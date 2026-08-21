import { Request, Response, NextFunction } from 'express';
import { returnsService } from './returns.service';
import { orderService } from '../order/order.service';

export const returnsController = {
  async createReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const accessToken = req.query.accessToken as string || req.headers['x-order-token'] as string;
      const customerId = req.customer?.id;

      await orderService.assertOrderAccess(orderId, customerId, accessToken);
      
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
      const customerId = req.customer?.id;

      await orderService.assertOrderAccess(orderId, customerId, accessToken);
      
      const returns = await returnsService.getReturnsForOrder(orderId);
      res.status(200).json(returns);
    } catch (error) {
      next(error);
    }
  }
};
