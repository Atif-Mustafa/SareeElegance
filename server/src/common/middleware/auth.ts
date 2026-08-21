import { Request, Response, NextFunction } from 'express';
import { authService } from '../../modules/auth/auth.service';
import { ApiError } from '../errors/ApiError';
import { CustomerDto, UserRole } from '../../../../shared/contracts/auth/auth.dto';

declare global {
  namespace Express {
    interface Request {
      customer?: CustomerDto;
      sessionToken?: string;
    }
  }
}

export function extractSessionToken(req: Request): string | null {
  // 1. From Cookie
  if (req.cookies && req.cookies.session_token) {
    return req.cookies.session_token;
  }
  // 2. From Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return null;
}

export async function authenticateCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractSessionToken(req);
    if (!token) {
      throw ApiError.unauthorized('Authentication required', 'AUTHENTICATION_REQUIRED');
    }

    const customer = await authService.validateSession(token);
    if (!customer) {
      throw ApiError.unauthorized('Invalid or expired session', 'SESSION_EXPIRED');
    }

    req.customer = customer;
    req.sessionToken = token;
    next();
  } catch (err) {
    next(err);
  }
}

export async function optionalAuthenticateCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractSessionToken(req);
    if (token) {
      const customer = await authService.validateSession(token);
      if (customer) {
        req.customer = customer;
        req.sessionToken = token;
      }
    }
    next();
  } catch (err) {
    // In optional auth, invalid token simply means guest
    next();
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = extractSessionToken(req);
      if (!token) {
        throw ApiError.unauthorized('Authentication required for administrative operations', 'AUTHENTICATION_REQUIRED');
      }

      const customer = await authService.validateSession(token);
      if (!customer) {
        throw ApiError.unauthorized('Invalid or expired session', 'SESSION_EXPIRED');
      }

      req.customer = customer;
      req.sessionToken = token;

      if (!allowedRoles.includes(customer.role)) {
        throw ApiError.forbidden('Administrative privileges required', 'FORBIDDEN');
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

export const requireAdmin = requireRole(['ADMIN']);
export const requireOperationsOrAdmin = requireRole(['ADMIN', 'OPERATIONS']);

