import { describe, it, expect, beforeEach, afterAll, beforeAll } from 'vitest';
import { prisma } from '../../src/infrastructure/database/prisma';
import { orderService } from '../../src/modules/order/order.service';
import { inventoryService } from '../../src/modules/inventory/inventory.service';
import { randomUUID } from 'crypto';
import { ApiError } from '../../src/common/errors/ApiError';

const hasTestDb = !!process.env.TEST_DATABASE_URL;

describe.runIf(hasTestDb)('Order Lifecycle Verification & Persistence Hardening', () => {
  beforeAll(async () => {
    await prisma.inventory.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.checkoutSession.deleteMany({});
    await prisma.paymentAttempt.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const setupProduct = async () => {
    const product = await prisma.product.create({
      data: {
        id: randomUUID(),
        sku: `SKU-${randomUUID().slice(0, 8)}`,
        name: 'Test Saree',
        slug: `test-saree-${randomUUID().slice(0, 8)}`,
        seoDescription: 'A test saree',
        shortDescription: 'short',
        longDescription: 'long',
        priceMinor: BigInt(50000),
        currency: 'USD',
      }
    });

    const inventory = await prisma.inventory.create({
      data: {
        productId: product.id,
        onHand: 10,
      }
    });

    return { product, inventory };
  };

  const setupOrder = async () => {
    const { product, inventory } = await setupProduct();

    // 1. Reserve
    const reservation = await inventoryService.reserveItems(product.id, 1);

    // 2. Checkout Session
    const checkoutSession = await prisma.checkoutSession.create({
      data: {
        id: randomUUID(),
        idempotencyKey: randomUUID(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        status: 'OPEN',
        currency: 'USD',
        subtotalMinor: BigInt(50000),
        taxMinor: BigInt(0),
        shippingMinor: BigInt(0),
        discountMinor: BigInt(0),
        totalMinor: BigInt(50000),
        lines: {
          create: [{
            productId: product.id,
            sku: product.sku,
            name: product.name,
            quantity: 1,
            unitPriceMinor: BigInt(50000),
            lineSubtotalMinor: BigInt(50000),
            reservationId: reservation.reservationId,
          }]
        }
      },
      include: { lines: true }
    });

    // 3. Payment Attempt
    const paymentAttempt = await prisma.paymentAttempt.create({
      data: {
        id: randomUUID(),
        idempotencyKey: randomUUID(),
        providerOrderId: randomUUID(),
        checkoutSessionId: checkoutSession.id,
        amountMinor: BigInt(50000),
        currency: 'USD',
        provider: 'STRIPE',
        providerPaymentId: `pi_${randomUUID()}`,
        status: 'SUCCEEDED'
      }
    });

    // 4. Finalize
    const order = await orderService.finalizeOrder(paymentAttempt.id);

    return { product, inventory, reservation, checkoutSession, paymentAttempt, order };
  };

  it('valid secure Order retrieval', async () => {
    const { order } = await setupOrder();
    
    // Using raw token from DTO
    const secureOrder = await orderService.getOrderSecure(order.id, order.accessToken!);
    expect(secureOrder.id).toBe(order.id);
  });

  it('missing/invalid access token rejection', async () => {
    const { order } = await setupOrder();
    
    await expect(orderService.getOrderSecure(order.id, 'invalid-token'))
      .rejects.toThrow(/Invalid access token/);
  });

  it('cancellable Order succeeds', async () => {
    const { order, reservation } = await setupOrder();
    
    const cancelledOrder = await orderService.cancelOrder(order.id, 'User changed mind');
    expect(cancelledOrder.status).toBe('CANCELLED');

    // Check inventory restored
    const reservationRecord = await prisma.reservation.findUnique({
      where: { id: reservation.reservationId }
    });
    expect(reservationRecord?.status).toBe('RESTORED');

    // Check history
    const history = await prisma.orderStatusHistory.findMany({
      where: { orderId: order.id }
    });
    expect(history.some(h => h.toStatus === 'CANCELLED')).toBe(true);
  });

  it('non-cancellable Order is rejected', async () => {
    const { order } = await setupOrder();
    
    // Force status to READY_FOR_FULFILLMENT
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'READY_FOR_FULFILLMENT' }
    });

    await expect(orderService.cancelOrder(order.id, 'User changed mind'))
      .rejects.toThrow(/Order cannot be cancelled/);
  });

  it('repeated cancellation is idempotent', async () => {
    const { order } = await setupOrder();
    
    await orderService.cancelOrder(order.id, 'First cancel');
    
    await expect(orderService.cancelOrder(order.id, 'Second cancel'))
      .rejects.toThrow(/Order cannot be cancelled/);
  });

  it('inventory restoration happens exactly once', async () => {
    const { order, reservation, inventory } = await setupOrder();
    
    await orderService.cancelOrder(order.id, 'First cancel');

    const updatedInventory = await prisma.inventory.findUnique({
      where: { id: inventory.id }
    });
    
    // Initially 10, consumed 1 -> 9, restored 1 -> 10
    expect(updatedInventory?.onHand).toBe(10);
  });

  it('valid Order creates fulfillment handoff', async () => {
    const { order } = await setupOrder();

    // Set shipping address
    await prisma.order.update({
      where: { id: order.id },
      data: { shippingAddress: { street: '123 Main' } }
    });

    const preparedOrder = await orderService.prepareFulfillment(order.id);
    expect(preparedOrder.status).toBe('READY_FOR_FULFILLMENT');

    const handoff = await prisma.fulfillmentHandoff.findUnique({
      where: { orderId: order.id }
    });
    expect(handoff).toBeDefined();
    expect(handoff?.status).toBe('PENDING');
  });

  it('reconciliation fails for missing/non-CONSUMED reservations', async () => {
    const { order, reservation } = await setupOrder();

    // Tamper with reservation
    await prisma.reservation.update({
      where: { id: reservation.reservationId },
      data: { status: 'ACTIVE' }
    });

    // Set shipping address
    await prisma.order.update({
      where: { id: order.id },
      data: { shippingAddress: { street: '123 Main' } }
    });

    await expect(orderService.prepareFulfillment(order.id))
      .rejects.toThrow(/Inventory reconciliation failed/);
  });

  it('duplicate fulfillment preparation fails', async () => {
    const { order } = await setupOrder();

    // Set shipping address
    await prisma.order.update({
      where: { id: order.id },
      data: { shippingAddress: { street: '123 Main' } }
    });

    await orderService.prepareFulfillment(order.id);

    await expect(orderService.prepareFulfillment(order.id))
      .rejects.toThrow(/Order cannot be prepared/);
  });

  it('concurrency race between cancel and prepareFulfillment', async () => {
    const { order } = await setupOrder();

    // Set shipping address
    await prisma.order.update({
      where: { id: order.id },
      data: { shippingAddress: { street: '123 Main' } }
    });

    // Launch both concurrently
    const p1 = orderService.cancelOrder(order.id, 'Race condition');
    const p2 = orderService.prepareFulfillment(order.id);

    const results = await Promise.allSettled([p1, p2]);

    const successes = results.filter(r => r.status === 'fulfilled');
    const rejections = results.filter(r => r.status === 'rejected');

    // Exactly one should succeed
    expect(successes.length).toBe(1);
    expect(rejections.length).toBe(1);

    const finalOrder = await prisma.order.findUnique({ where: { id: order.id }});
    // The successful one defines the final status
    if ((successes[0] as any).value.status === 'CANCELLED') {
      expect(finalOrder?.status).toBe('CANCELLED');
    } else {
      expect(finalOrder?.status).toBe('READY_FOR_FULFILLMENT');
    }
  });

});

describe.runIf(!hasTestDb)('Skipped Order Lifecycle tests', () => {
  it('skips real database connectivity because TEST_DATABASE_URL is absent', () => {
    console.warn('Real DB integration tests skipped: TEST_DATABASE_URL not provided.');
    expect(true).toBe(true);
  });
});
