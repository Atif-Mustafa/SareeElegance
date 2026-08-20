import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service';

export const paymentController = {
  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { checkoutSessionId, amountMinor, currency, provider } = req.body;
      const attempt = await paymentService.createPaymentAttempt(checkoutSessionId, BigInt(amountMinor || 0), currency || 'USD', provider || 'STRIPE');
      res.status(201).json(attempt);
    } catch (error) {
      next(error);
    }
  },

  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await paymentService.verifyPayment(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      await paymentService.handleWebhook('stripe', req.body);
      res.status(200).send();
    } catch (error) {
      next(error);
    }
  }
};