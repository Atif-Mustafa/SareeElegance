import { Router, Request, Response, NextFunction } from 'express';
import type { ApiSuccess, ApiProblem } from '@shared/index';
import { HealthService } from './health.service';
import { ERROR_CODES } from '@shared/errors/error-codes';

export const healthRouter = Router();

healthRouter.get('/health', (req: Request, res: Response) => {
  const responsePayload: ApiSuccess<{ status: string; service: string }> = {
    success: true,
    data: {
      status: 'ok',
      service: 'saree-elegance-api',
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.requestId || 'unknown',
    },
  };

  res.setHeader('Content-Type', 'application/json; charset=utf-8')
     .status(200)
     .json(responsePayload);
});

healthRouter.get('/health/ready', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isDbReady = await HealthService.checkDatabaseConnectivity();
    const requestId = req.requestId || 'unknown';
    const timestamp = new Date().toISOString();

    if (isDbReady) {
      const responsePayload: ApiSuccess<{ status: string; database: string }> = {
        success: true,
        data: {
          status: 'ready',
          database: 'available',
        },
        meta: {
          timestamp,
          requestId,
        },
      };

      res.setHeader('Content-Type', 'application/json; charset=utf-8')
         .status(200)
         .json(responsePayload);
    } else {
      const errorPayload: ApiProblem = {
        type: 'about:blank',
        title: 'Service Unavailable',
        status: 503,
        code: ERROR_CODES.INFRA_001,
        detail: 'The database is currently unavailable.',
        instance: req.originalUrl,
        requestId,
      };

      res.setHeader('Content-Type', 'application/problem+json; charset=utf-8')
         .status(503)
         .json(errorPayload);
    }
  } catch (error) {
    next(error);
  }
});
