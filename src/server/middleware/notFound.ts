import { Request, Response } from 'express';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404)
     .setHeader('Content-Type', 'application/problem+json; charset=utf-8')
     .json({
       type: 'about:blank',
       title: 'Route Not Found',
       status: 404,
       code: 'API_ROUTE_NOT_FOUND',
       detail: `The requested endpoint '${req.method} ${req.originalUrl}' does not exist.`,
       instance: req.originalUrl,
       requestId: req.requestId || 'unknown',
     });
}
