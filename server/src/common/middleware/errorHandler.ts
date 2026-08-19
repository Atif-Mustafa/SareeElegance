import { Request, Response, NextFunction } from 'express';
import type { ApiProblem, ErrorCode } from '@shared/index';
import { ERROR_CODES } from '@shared/index';

interface CustomError extends Error {
  status?: number;
  statusCode?: number;
  code?: ErrorCode | string;
  title?: string;
}

export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const statusCode = err.status || err.statusCode || 500;
  const isServerError = statusCode >= 500;

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] [${req.requestId}] ${req.method} ${req.originalUrl}:`, err);
  }

  const title = isServerError ? 'Internal Server Error' : (err.title || 'Request Error');
  const code = (err.code as ErrorCode) || (isServerError ? ERROR_CODES.INFRA_001 : ERROR_CODES.BAD_REQUEST);

  const detail = isServerError
    ? 'An unexpected error occurred. Our engineering team has been notified.'
    : (err.message || 'An unexpected error occurred.');

  const problemResponse: ApiProblem = {
    type: 'about:blank',
    title,
    status: statusCode,
    code,
    detail,
    instance: req.originalUrl,
    requestId: req.requestId || 'unknown',
  };

  res.status(statusCode)
     .setHeader('Content-Type', 'application/problem+json; charset=utf-8')
     .json(problemResponse);
}
