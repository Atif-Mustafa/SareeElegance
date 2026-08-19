import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaService } from '../../src/infrastructure/database/prisma';
import { env } from '../../src/config/env';

describe('Real PostgreSQL Database - Catalog Schema Integration', () => {
  let prisma: any;
  let dbAvailable = true;

  beforeAll(async () => {
    const isProd = env.NODE_ENV === 'production';
    const hasTestDb = !!process.env.TEST_DATABASE_URL || !!process.env.DATABASE_URL;
    if (isProd || !hasTestDb) {
      dbAvailable = false;
      return;
    }
    try {
      prisma = PrismaService.getInstance();
      await prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      dbAvailable = false;
    }
  });

  afterAll(async () => {
    if (dbAvailable) {
      await PrismaService.disconnect();
    }
  });

  describe('Catalog Schema Verifications', () => {
    it('successfully inserts a Category and Product with minor-unit prices', async () => {
      if (!dbAvailable) return;
      const category = await prisma.category.create({
        data: {
          name: 'Banarasi Silk',
          slug: 'banarasi-silk-test',
          description: 'A test category',
        },
      });
      expect(category.id).toBeDefined();

      const product = await prisma.product.create({
        data: {
          sku: 'SE-TEST-BAN-01',
          slug: 'test-banarasi-katan-silk',
          name: 'Test Royal Maroon Banarasi',
          shortDescription: 'Short desc',
          longDescription: 'Long desc',
          priceMinor: 2500000n, // 25,000.00 INR
          currency: 'INR',
          categoryId: category.id,
          sareeDetails: {
            create: {
              fabric: 'Katan Silk',
              weave: 'Kadwa Jaal',
              zariType: 'Real Gold Zari',
              region: 'Varanasi',
            },
          },
        },
        include: {
          sareeDetails: true,
        },
      });
      expect(product.id).toBeDefined();
      expect(product.priceMinor).toBe(2500000n);
      expect(product.sareeDetails?.fabric).toBe('Katan Silk');

      // Cleanup
      await prisma.product.delete({ where: { id: product.id } });
      await prisma.category.delete({ where: { id: category.id } });
    });

    it('rejects duplicate SKUs', async () => {
      if (!dbAvailable) return;
      const p1 = await prisma.product.create({
        data: {
          sku: 'DUPLICATE-SKU',
          slug: 'dup-1',
          name: 'Dup 1',
          shortDescription: 'Desc',
          longDescription: 'Desc',
          priceMinor: 1000n,
          currency: 'INR',
        },
      });

      let err: any;
      try {
        await prisma.product.create({
          data: {
            sku: 'DUPLICATE-SKU',
            slug: 'dup-2',
            name: 'Dup 2',
            shortDescription: 'Desc',
            longDescription: 'Desc',
            priceMinor: 1000n,
            currency: 'INR',
          },
        });
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();
      expect(err.code).toBe('P2002'); // Unique constraint failed

      await prisma.product.delete({ where: { id: p1.id } });
    });
  });
});
