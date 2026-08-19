import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { env } from '../../src/config/env';
import { PrismaService } from '../../src/infrastructure/database/prisma';
import { createApp } from '../../src/app';

describe('Real PostgreSQL Database Connectivity Integration', () => {
  const isProd = env.NODE_ENV === 'production';
  const hasTestDb = !!process.env.TEST_DATABASE_URL;
  const shouldRunTest = !isProd && hasTestDb;

  // We only run this suite if explicitly opted in and NOT in production
  describe.runIf(shouldRunTest)('when TEST_DATABASE_URL is provided', () => {
    let app: any;

    beforeAll(() => {
      app = createApp();
    });

    afterAll(async () => {
      await PrismaService.disconnect();
    });

    it('successfully connects, executes SELECT 1, and reports readiness', async () => {
      // Direct Prisma connectivity check
      const prisma = PrismaService.getInstance();
      
      let selectSucceeded = false;
      try {
        await prisma.$queryRaw`SELECT 1`;
        selectSucceeded = true;
      } catch (error) {
        console.error('Failed to query database:', error);
      }
      expect(selectSucceeded).toBe(true);

      // Verify the readiness endpoint works without mocks
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
      expect(response.body.meta.timestamp).toBeDefined();
    });
    
    it('gracefully disconnects Prisma client', async () => {
      // By calling disconnect, we ensure it doesn't throw errors
      let disconnectSucceeded = false;
      try {
        await PrismaService.disconnect();
        disconnectSucceeded = true;
      } catch (error) {
        console.error('Failed to disconnect database:', error);
      }
      expect(disconnectSucceeded).toBe(true);
    });
  });

  describe.runIf(!shouldRunTest)('Skipped integration tests', () => {
    it('skips real database connectivity because TEST_DATABASE_URL is absent or environment is production', () => {
      if (isProd) {
        console.warn('Real DB integration tests skipped: Environment is production.');
      } else {
        console.warn('Real DB integration tests skipped: TEST_DATABASE_URL not provided.');
      }
      expect(true).toBe(true);
    });
  });
});
