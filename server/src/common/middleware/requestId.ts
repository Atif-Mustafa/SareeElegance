import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

const SAFE_REQUEST_ID_REGEX = /^[a-zA-Z0-9._-]{1,128}$/;

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingHeader = req.headers['x-request-id'];
  let requestId: string | null = null;

  if (typeof incomingHeader === 'string' && SAFE_REQUEST_ID_REGEX.test(incomingHeader)) {
    requestId = incomingHeader;
  }

  if (!requestId) {
    requestId = randomUUID();
  }

  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}
