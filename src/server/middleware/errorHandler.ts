import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  status?: number;
  statusCode?: number;
  code?: string;
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
  const code = err.code || (isServerError ? 'INFRA_001' : 'BAD_REQUEST');
  const detail = isServerError
    ? 'An unexpected error occurred. Our engineering team has been notified.'
    : (err.message || 'An unexpected error occurred.');

  res.status(statusCode)
     .setHeader('Content-Type', 'application/problem+json; charset=utf-8')
     .json({
       type: 'about:blank',
       title,
       status: statusCode,
       code,
       detail,
       instance: req.originalUrl,
       requestId: req.requestId || 'unknown',
     });
}
