import { Router } from 'express';
import { shippingController } from './shipping.controller';

export const shippingRoutes = Router();

shippingRoutes.get('/orders/:orderId/shipment', shippingController.getShipment);
shippingRoutes.post('/shipping/webhook', shippingController.handleWebhook);
