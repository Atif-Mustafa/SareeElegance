import express, { Express } from 'express';
import { requestIdMiddleware } from './middleware/requestId';
import { notFoundHandler } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health.routes';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));
  app.use(requestIdMiddleware);

  // API v1 Routes
  app.use('/api/v1', healthRouter);

  // Fallbacks & Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
