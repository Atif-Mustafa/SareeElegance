import { Request, Response } from 'express';
import type { ApiProblem } from '@shared/index';
import { ERROR_CODES } from '@shared/index';

export function notFoundHandler(req: Request, res: Response): void {
  const problemResponse: ApiProblem = {
    type: 'about:blank',
    title: 'Route Not Found',
    status: 404,
    code: ERROR_CODES.API_ROUTE_NOT_FOUND,
    detail: `The requested endpoint '${req.method} ${req.originalUrl}' does not exist.`,
    instance: req.originalUrl,
    requestId: req.requestId || 'unknown',
  };

  res.status(404)
     .setHeader('Content-Type', 'application/problem+json; charset=utf-8')
     .json(problemResponse);
}
