import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { registerSchema, loginSchema } from '../../../../shared/schemas/auth';
import { ApiError } from '../../common/errors/ApiError';

const COOKIE_NAME = 'session_token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

function setSessionCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE
  });
}

function clearSessionCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
}

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        throw ApiError.badRequest(parsed.error.issues[0]?.message || 'Invalid registration data', 'VALIDATION_ERROR');
      }

      const { customer, sessionToken } = await authService.register(parsed.data);
      setSessionCookie(res, sessionToken);

      res.status(201).json({
        customer,
        token: sessionToken,
        message: 'Account registered successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw ApiError.badRequest(parsed.error.issues[0]?.message || 'Invalid login data', 'VALIDATION_ERROR');
      }

      const { customer, sessionToken } = await authService.login(parsed.data);
      setSessionCookie(res, sessionToken);

      res.status(200).json({
        customer,
        token: sessionToken,
        message: 'Logged in successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.sessionToken || req.cookies?.[COOKIE_NAME] || req.headers.authorization?.replace(/^Bearer\s+/i, '');
      if (token) {
        await authService.logout(token);
      }
      clearSessionCookie(res);
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.customer) {
        throw ApiError.unauthorized('Authentication required', 'AUTHENTICATION_REQUIRED');
      }
      res.status(200).json({ customer: req.customer });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
