import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { app } from '../../../src/app';
import { prisma } from '../../../src/infrastructure/database/prisma';

const runTest = process.env.TEST_DATABASE_URL ? describe : describe.skip;

runTest('Payment and Order Finalization API', () => {
  let checkoutSessionId: string;

  beforeAll(async () => {
    const product = await prisma.product.create({
      data: {
        sku: `TEST-SKU-PAY-${Date.now()}`,
        slug: `test-sku-pay-${Date.now()}`,
        name: 'Test Payment Product',
        shortDescription: 'Test',
        longDescription: 'Test',
        priceMinor: 1000n,
        currency: 'INR',
        status: 'ACTIVE'
      }
    });

    const inventory = await prisma.inventory.create({
      data: {
        productId: product.id,
        onHand: 10
      }
    });

    const reservation = await prisma.reservation.create({
      data: {
        inventoryId: inventory.id,
        quantity: 1,
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 100000)
      }
    });

    const checkout = await prisma.checkoutSession.create({
      data: {
        idempotencyKey: `pay-test-${Date.now()}`,
        status: 'OPEN',
        currency: 'INR',
        subtotalMinor: 1000n,
        totalMinor: 1000n,
        expiresAt: new Date(Date.now() + 100000),
        lines: {
          create: [{
            productId: product.id,
            name: product.name,
            quantity: 1,
            unitPriceMinor: 1000n,
            lineSubtotalMinor: 1000n,
            reservationId: reservation.id
          }]
        }
      }
    });
    checkoutSessionId = checkout.id;
  });

  afterAll(async () => {
    await prisma.orderLine.deleteMany();
    await prisma.order.deleteMany();
    await prisma.paymentAttempt.deleteMany();
    await prisma.checkoutLine.deleteMany();
    await prisma.checkoutSession.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.product.deleteMany();
  });

  it('should create a payment attempt', async () => {
    const res = await supertest(app)
      .post('/api/v1/payments')
      .send({ checkoutSessionId });

    expect(res.status).toBe(201);
    expect(res.body.paymentAttempt).toBeDefined();
    expect(res.body.paymentAttempt.status).toBe('CREATED');
    expect(res.body.providerData).toBeDefined();
  });

  it('should verify payment and create order idempotently', async () => {
    const attempts = await prisma.paymentAttempt.findMany({
      where: { checkoutSessionId }
    });
    const attempt = attempts[0];

    const res = await supertest(app)
      .post('/api/v1/payments/verify')
      .send({
        providerOrderId: attempt.providerOrderId,
        providerPaymentId: 'mock_pay_123',
        signature: 'mock_success_signature'
      });

    expect(res.status).toBe(200);
    expect(res.body.payment.status).toBe('SUCCEEDED');
    expect(res.body.order).toBeDefined();
    expect(res.body.order.status).toBe('CONFIRMED');

    const res2 = await supertest(app)
      .post('/api/v1/payments/verify')
      .send({
        providerOrderId: attempt.providerOrderId,
        providerPaymentId: 'mock_pay_123',
        signature: 'mock_success_signature'
      });

    expect(res2.status).toBe(200);
    expect(res2.body.order.id).toBe(res.body.order.id);

    const checkoutLines = await prisma.checkoutLine.findMany({
      where: { checkoutSessionId }
    });
    const reservation = await prisma.reservation.findUnique({
      where: { id: checkoutLines[0].reservationId! }
    });
    expect(reservation!.status).toBe('CONSUMED');
  });
});
