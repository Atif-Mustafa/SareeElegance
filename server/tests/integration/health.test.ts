import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { createApp } from '../../src/app';
import { requestIdMiddleware } from '../../src/common/middleware/requestId';
import { errorHandler } from '../../src/common/middleware/errorHandler';
import { HealthService } from '../../src/modules/health/health.service';
import { ERROR_CODES } from '@shared/errors/error-codes';

describe('Express API Foundation (PR 1)', () => {
  const app = createApp();

  describe('GET /api/v1/health', () => {
    it('returns 200 OK with valid API envelope and request ID', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          status: 'ok',
          service: 'saree-elegance-api',
        },
      });

      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.timestamp).toBeDefined();
      expect(typeof response.body.meta.requestId).toBe('string');
      expect(response.body.meta.requestId.length).toBeGreaterThan(0);

      // Verify X-Request-ID header matches
      expect(response.headers['x-request-id']).toEqual(response.body.meta.requestId);
    });
  });

  describe('GET /api/v1/health/ready', () => {
    it('returns 200 OK when database is connected successfully', async () => {
      // Mock successful database connection
      vi.spyOn(HealthService, 'checkDatabaseConnectivity').mockResolvedValueOnce(true);

      const response = await request(app)
        .get('/api/v1/health/ready')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          status: 'ready',
          database: 'available',
        },
      });
      expect(response.body.meta.requestId).toBeDefined();
    });

    it('returns 503 Service Unavailable when database connection fails', async () => {
      // Mock failed database connection
      vi.spyOn(HealthService, 'checkDatabaseConnectivity').mockResolvedValueOnce(false);

      const response = await request(app)
        .get('/api/v1/health/ready')
        .expect('Content-Type', /problem\+json/)
        .expect(503);

      expect(response.body).toMatchObject({
        type: 'about:blank',
        title: 'Service Unavailable',
        status: 503,
        code: ERROR_CODES.INFRA_001,
        detail: 'The database is currently unavailable.',
        instance: '/api/v1/health/ready',
      });
      expect(response.body.requestId).toBeDefined();
    });
  });

  describe('Request ID Middleware', () => {
    it('preserves a valid incoming X-Request-ID header', async () => {
      const customId = 'req-custom-test-12345';
      const response = await request(app)
        .get('/api/v1/health')
        .set('X-Request-ID', customId)
        .expect(200);

      expect(response.headers['x-request-id']).toBe(customId);
      expect(response.body.meta.requestId).toBe(customId);
    });

    it('replaces an invalid or excessively long X-Request-ID header', async () => {
      const invalidId = '<script>alert(1)</script>';
      const response = await request(app)
        .get('/api/v1/health')
        .set('X-Request-ID', invalidId)
        .expect(200);

      expect(response.headers['x-request-id']).not.toBe(invalidId);
      expect(response.body.meta.requestId).not.toBe(invalidId);
      expect(typeof response.body.meta.requestId).toBe('string');
    });

    it('generates a new UUID when no X-Request-ID is supplied', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.headers['x-request-id']).toBeDefined();
      expect(response.body.meta.requestId).toBeDefined();
    });
  });

  describe('Not-Found Handler (404)', () => {
    it('returns RFC 7807 problem details for unmapped routes', async () => {
      const response = await request(app)
        .get('/api/v1/non-existent-route')
        .expect('Content-Type', /problem\+json/)
        .expect(404);

      expect(response.body).toMatchObject({
        type: 'about:blank',
        title: 'Route Not Found',
        status: 404,
        code: 'API_ROUTE_NOT_FOUND',
        instance: '/api/v1/non-existent-route',
      });

      expect(response.body.detail).toContain('/api/v1/non-existent-route');
      expect(response.body.requestId).toBeDefined();
    });
  });

  describe('Centralized Error Handler (500)', () => {
    it('returns safe RFC 7807 problem details for unhandled exceptions without leaking stack traces', async () => {
      // Create a test app with an error-triggering route
      const testApp = express();
      testApp.use(requestIdMiddleware);
      testApp.get('/test-error', (_req: Request, _res: Response, next: NextFunction) => {
        next(new Error('Internal database connection failure secret_db_pass'));
      });
      testApp.use(errorHandler);

      const response = await request(testApp)
        .get('/test-error')
        .expect('Content-Type', /problem\+json/)
        .expect(500);

      expect(response.body).toMatchObject({
        type: 'about:blank',
        title: 'Internal Server Error',
        status: 500,
        code: 'INFRA_001',
        detail: 'An unexpected error occurred. Our engineering team has been notified.',
        instance: '/test-error',
      });

      expect(response.body.requestId).toBeDefined();
      expect(JSON.stringify(response.body)).not.toContain('secret_db_pass');
      expect(JSON.stringify(response.body)).not.toContain('stack');
    });
  });
});
