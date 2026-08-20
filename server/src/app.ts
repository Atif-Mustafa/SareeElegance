import express, { Express } from 'express';
import { requestIdMiddleware } from './common/middleware/requestId';
import { notFoundHandler } from './common/middleware/notFound';
import { errorHandler } from './common/middleware/errorHandler';
import { healthRouter } from './modules/health/health.routes';
import { catalogRoutes } from './modules/catalog/catalog.routes';
import { cartRoutes } from './modules/cart/cart.routes';
import { inventoryRoutes } from './modules/inventory/inventory.routes';
import { checkoutRouter } from './modules/checkout/checkout.routes';
import { paymentRoutes } from './modules/payment/payment.routes';
import { orderRoutes } from './modules/order/order.routes';
import { shippingRoutes } from './modules/shipping/shipping.routes';
import { returnsRoutes } from './modules/returns/returns.routes';

export function createApp(): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));
  app.use(requestIdMiddleware);

  // API v1 Routes
  app.use('/api/v1', healthRouter);
  app.use('/api/v1', catalogRoutes);
  app.use('/api/v1', cartRoutes);
  app.use('/api/v1', inventoryRoutes);
  app.use('/api/v1/checkout', checkoutRouter);
  app.use('/api/v1/payments', paymentRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1', shippingRoutes);
  app.use('/api/v1', returnsRoutes);

  // Fallbacks & Error Handlers (API Only)
  app.use('/api', notFoundHandler);
  app.use('/api', errorHandler);

  return app;
}
export const app = createApp();
