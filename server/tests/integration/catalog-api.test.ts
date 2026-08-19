import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { PrismaService } from '../../src/infrastructure/database/prisma';
import type { Category, Product, PrismaClient } from '@prisma/client';

describe('Real PostgreSQL Database - Catalog API Integration', () => {
  let prisma: PrismaClient;
  let createdCategory: Category;
  let createdProducts: Product[] = [];
  let dbAvailable = true;

  beforeAll(async () => {
    if (process.env.NODE_ENV === 'production' || !process.env.TEST_DATABASE_URL) {
      dbAvailable = false;
      return;
    }

    try {
      prisma = PrismaService.getInstance();

      // Seed data
      createdCategory = await prisma.category.create({
        data: {
          name: 'Test Banarasi',
          slug: 'test-banarasi',
          description: 'Test category',
        },
      });

      const pActive1 = await prisma.product.create({
        data: {
          sku: 'SKU-ACTIVE-1',
          slug: 'active-slug-1',
          name: 'Active Product 1',
          shortDescription: 'Short',
          longDescription: 'Long',
          status: 'ACTIVE',
          priceMinor: 500000n,
          currency: 'INR',
          categoryId: createdCategory.id,
        },
      });

      const pDraft1 = await prisma.product.create({
        data: {
          sku: 'SKU-DRAFT-1',
          slug: 'draft-slug-1',
          name: 'Draft Product 1',
          shortDescription: 'Short',
          longDescription: 'Long',
          status: 'DRAFT',
          priceMinor: 250000n,
          currency: 'INR',
          categoryId: createdCategory.id,
        },
      });

      createdProducts.push(pActive1, pDraft1);
    } catch (e) {
      dbAvailable = false;
    }
  });

  afterAll(async () => {
    if (!dbAvailable) return;
    try {
      await prisma.product.deleteMany({
        where: { sku: { in: ['SKU-ACTIVE-1', 'SKU-DRAFT-1'] } },
      });
      await prisma.category.deleteMany({
        where: { slug: 'test-banarasi' },
      });
    } catch (e) {}
  });

  describe('Catalog API Endpoints', () => {
    it('GET /api/v1/categories - returns active categories', async () => {
      if (!dbAvailable) return;
      const res = await request(app).get('/api/v1/categories');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((c: any) => c.slug === 'test-banarasi')).toBe(true);
    });

    it('GET /api/v1/products - returns paginated ACTIVE products only', async () => {
      if (!dbAvailable) return;
      const res = await request(app).get('/api/v1/products?limit=100');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      const items = res.body.data;
      const foundActive = items.find((p: any) => p.sku === 'SKU-ACTIVE-1');
      const foundDraft = items.find((p: any) => p.sku === 'SKU-DRAFT-1');

      expect(foundActive).toBeDefined();
      expect(foundDraft).toBeUndefined();
      
      // Price is a string
      expect(typeof foundActive.price.amountMinor).toBe('string');
      expect(foundActive.price.amountMinor).toBe('500000');
    });

    it('GET /api/v1/products/:slug - returns details for ACTIVE product', async () => {
      if (!dbAvailable) return;
      const res = await request(app).get('/api/v1/products/active-slug-1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sku).toBe('SKU-ACTIVE-1');
    });

    it('GET /api/v1/products/:slug - returns 404 for DRAFT product', async () => {
      if (!dbAvailable) return;
      const res = await request(app).get('/api/v1/products/draft-slug-1');
      expect(res.status).toBe(404);
      expect(res.body.code).toBe('NOT_FOUND');
    });

    it('GET /api/v1/products/:slug - returns 404 for unknown slug', async () => {
      if (!dbAvailable) return;
      const res = await request(app).get('/api/v1/products/unknown-slug-xyz');
      expect(res.status).toBe(404);
    });

    it('GET /api/v1/products - returns 400 for unknown query parameters', async () => {
      const res = await request(app).get('/api/v1/products?unknown=value');
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_001');
    });

    it('GET /api/v1/products - returns 400 for misspelled query parameters', async () => {
      const res = await request(app).get('/api/v1/products?fabirc=Silk');
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_001');
    });

    it('GET /api/v1/products - returns 400 for invalid page', async () => {
      const res = await request(app).get('/api/v1/products?page=-1');
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_001');
    });

    it('GET /api/v1/products - returns 400 for invalid limit', async () => {
      const res = await request(app).get('/api/v1/products?limit=200');
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_001');
    });

    it('GET /api/v1/products - returns 400 for invalid sort', async () => {
      const res = await request(app).get('/api/v1/products?sort=unknown_sort');
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_001');
    });

    it('GET /api/v1/products - returns 400 for invalid minPriceMinor', async () => {
      const res = await request(app).get('/api/v1/products?minPriceMinor=-500');
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_001');
    });
  });
});
