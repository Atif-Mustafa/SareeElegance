import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service';
import { orderService } from '../order/order.service';

export const paymentController = {
  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { checkoutSessionId } = req.body;
      const result = await paymentService.createPaymentAttempt(checkoutSessionId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { providerOrderId, providerPaymentId, signature } = req.body;
      const attempt = await paymentService.verifyPayment(providerOrderId, providerPaymentId, signature);
      
      const order = await orderService.finalizeOrder(attempt.id);

      res.status(200).json({ payment: attempt, order });
    } catch (error) {
      next(error);
    }
  },

  async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      const event = req.body;
      await paymentService.handleWebhook(event);
      res.status(200).send('OK');
    } catch (error) {
      next(error);
    }
  }
};
