import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { env } from '../../../src/config/env';
import { inventoryService } from '../../../src/modules/inventory/inventory.service';
import { ApiError } from '../../../src/common/errors/ApiError';

const isProduction = env.NODE_ENV === 'production';
const hasTestDb = !!env.TEST_DATABASE_URL;
const shouldRunTest = !isProduction && hasTestDb;

const runIt = shouldRunTest ? it : it.skip;

describe('Inventory Concurrency Integration', () => {
  let testPrisma: PrismaClient;

  beforeAll(async () => {
    if (!shouldRunTest) {
      console.warn('Real DB integration tests skipped: TEST_DATABASE_URL not provided.');
      return;
    }
    testPrisma = new PrismaClient({
      // @ts-ignore
      datasourceUrl: env.TEST_DATABASE_URL,
    });
    await testPrisma.$connect();
  });

  afterAll(async () => {
    if (testPrisma) {
      await testPrisma.$disconnect();
    }
  });

  beforeEach(async () => {
    if (!shouldRunTest) return;

    // Clean up
    await testPrisma.reservation.deleteMany();
    await testPrisma.inventory.deleteMany();
    await testPrisma.product.deleteMany();
  });

  runIt('prevents overselling when two concurrent requests try to reserve the last item', async () => {
    // 1. Create a product and inventory with 1 item on hand
    const product = await testPrisma.product.create({
      data: {
        sku: 'TEST-SKU-1',
        slug: 'test-sku-1',
        name: 'Test Product',
        shortDescription: 'Test',
        longDescription: 'Test',
        priceMinor: BigInt(1000),
        currency: 'INR',
        inventory: {
          create: {
            onHand: 1
          }
        }
      }
    });

    // 2. Perform two concurrent reservations for 1 item
    // One should succeed, one should fail with INSUFFICIENT_STOCK
    const promise1 = inventoryService.reserveItems(product.id, 1);
    const promise2 = inventoryService.reserveItems(product.id, 1);

    const results = await Promise.allSettled([promise1, promise2]);

    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    if (rejected[0].status === 'rejected') {
      const error = rejected[0].reason as ApiError;
      expect(error.code).toBe('INSUFFICIENT_STOCK');
    }

    // 3. Verify final inventory state
    const availability = await inventoryService.checkAvailability(product.id);
    expect(availability.onHand).toBe(1);
    expect(availability.available).toBe(0);
    expect(availability.status).toBe('OUT_OF_STOCK');
  });

  runIt('expired reservations do not reduce availability', async () => {
    const product = await testPrisma.product.create({
      data: {
        sku: 'TEST-SKU-2',
        slug: 'test-sku-2',
        name: 'Test Product 2',
        shortDescription: 'Test',
        longDescription: 'Test',
        priceMinor: BigInt(1000),
        currency: 'INR',
        inventory: {
          create: {
            onHand: 2
          }
        }
      },
      include: { inventory: true }
    });

    // Create an expired reservation
    await testPrisma.reservation.create({
      data: {
        inventoryId: product.inventory!.id,
        quantity: 1,
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() - 10000) // Expired 10 seconds ago
      }
    });

    // Create a valid reservation
    await testPrisma.reservation.create({
      data: {
        inventoryId: product.inventory!.id,
        quantity: 1,
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 10000) // Valid for 10s
      }
    });

    const availability = await inventoryService.checkAvailability(product.id);
    expect(availability.onHand).toBe(2);
    // 1 expired, 1 active => 1 available
    expect(availability.available).toBe(1);
    expect(availability.status).toBe('AVAILABLE');
  });

  runIt('release restores availability idempotently', async () => {
    const product = await testPrisma.product.create({
      data: {
        sku: 'TEST-SKU-3',
        slug: 'test-sku-3',
        name: 'Test Product 3',
        shortDescription: 'Test',
        longDescription: 'Test',
        priceMinor: BigInt(1000),
        currency: 'INR',
        inventory: {
          create: {
            onHand: 1
          }
        }
      }
    });

    const reservation = await inventoryService.reserveItems(product.id, 1);
    
    let availability = await inventoryService.checkAvailability(product.id);
    expect(availability.available).toBe(0);

    // Release
    await inventoryService.releaseReservation(reservation.reservationId);
    
    availability = await inventoryService.checkAvailability(product.id);
    expect(availability.available).toBe(1);

    // Double release should be idempotent and not cause any negative reservations
    await inventoryService.releaseReservation(reservation.reservationId);

    availability = await inventoryService.checkAvailability(product.id);
    expect(availability.available).toBe(1);
  });
});
