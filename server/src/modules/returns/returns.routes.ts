import { Router } from 'express';
import { returnsController } from './returns.controller';

export const returnsRoutes = Router();

returnsRoutes.post('/orders/:orderId/returns', returnsController.createReturn);
returnsRoutes.get('/orders/:orderId/returns', returnsController.getReturns);
