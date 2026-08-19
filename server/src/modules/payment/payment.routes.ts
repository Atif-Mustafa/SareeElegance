import { Router } from 'express';
import { paymentController } from './payment.controller';

export const paymentRoutes = Router();

paymentRoutes.post('/', paymentController.createPayment);
paymentRoutes.post('/verify', paymentController.verifyPayment);
paymentRoutes.post('/webhook', paymentController.webhook);
