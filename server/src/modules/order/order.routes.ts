import { Router } from 'express';
import { orderController } from './order.controller';

export const orderRoutes = Router();

orderRoutes.get('/:id', orderController.getOrderSecure);
orderRoutes.post('/:id/cancel', orderController.cancelOrder);
orderRoutes.post('/:id/fulfillment', orderController.prepareFulfillment);
