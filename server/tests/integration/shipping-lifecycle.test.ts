import { describe, it, expect, beforeEach, afterAll, beforeAll } from 'vitest';
import { prisma } from '../../src/infrastructure/database/prisma';
import { orderService } from '../../src/modules/order/order.service';
import { inventoryService } from '../../src/modules/inventory/inventory.service';
import { shippingService } from '../../src/modules/shipping/shipping.service';
import { randomUUID } from 'crypto';

describe('Shipping Lifecycle Verification', () => {
  const hasTestDb = !!process.env.TEST_DATABASE_URL;

  describe.runIf(hasTestDb)('Shipping API', () => {
    beforeAll(async () => {
      await prisma.shipmentStatusHistory.deleteMany({});
      await prisma.shipment.deleteMany({});
      await prisma.fulfillmentHandoff.deleteMany({});
      await prisma.orderStatusHistory.deleteMany({});
      await prisma.orderLine.deleteMany({});
      await prisma.order.deleteMany({});
      await prisma.checkoutSession.deleteMany({});
      await prisma.paymentAttempt.deleteMany({});
      await prisma.reservation.deleteMany({});
      await prisma.inventory.deleteMany({});
      await prisma.product.deleteMany({});
    });

    afterAll(async () => {
      await prisma.$disconnect();
    });

    const setupOrder = async () => {
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

      await prisma.inventory.create({
        data: {
          productId: product.id,
          onHand: 10,
        }
      });

      const reservation = await inventoryService.reserveItems(product.id, 1);

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

      const order = await orderService.finalizeOrder(paymentAttempt.id);

      await prisma.order.update({
        where: { id: order.id },
        data: { shippingAddress: { street: '123 Main St', city: 'Test City' } }
      });

      return { product, reservation, checkoutSession, paymentAttempt, order };
    };

    it('fulfillment-ready order creates one shipment', async () => {
      const { order } = await setupOrder();
      
      const preparedOrder = await orderService.prepareFulfillment(order.id);
      expect(preparedOrder.status).toBe('READY_FOR_FULFILLMENT');

      const shipment = await shippingService.createShipment(order.id);
      expect(shipment.status).toBe('CREATED');
      expect(shipment.provider).toBe('MockProvider');
      expect(shipment.trackingNumber).toMatch(/^AWB/);
    });

    it('duplicate shipment creation is idempotent', async () => {
      const { order } = await setupOrder();
      await orderService.prepareFulfillment(order.id);

      const shipment1 = await shippingService.createShipment(order.id);
      const shipment2 = await shippingService.createShipment(order.id);

      expect(shipment1.id).toBe(shipment2.id);
    });

    it('invalid Order state rejected', async () => {
      const { order } = await setupOrder();
      // Order is CONFIRMED, not READY_FOR_FULFILLMENT
      await expect(shippingService.createShipment(order.id)).rejects.toThrow(/Order is not ready for fulfillment/);
    });

    it('provider failure fails safely without creating shipment', async () => {
      const { order } = await setupOrder();
      
      // Our mock provider is setup to throw if orderId has FAIL_CREATE
      // Let's modify orderId temporarily for test, or just update mock-provider?
      // Wait, we can't change order.id easily. Let's just create a specific test order.
      await prisma.order.update({ where: { id: order.id }, data: { id: 'FAIL_CREATE_' + order.id } });
      await prisma.order.update({
        where: { id: 'FAIL_CREATE_' + order.id },
        data: { shippingAddress: { street: '123 Main St', city: 'Test City' } }
      });
      await orderService.prepareFulfillment('FAIL_CREATE_' + order.id);

      await expect(shippingService.createShipment('FAIL_CREATE_' + order.id))
        .rejects.toThrow(/Shipping provider unavailable/);

      const count = await prisma.shipment.count({ where: { orderId: 'FAIL_CREATE_' + order.id } });
      expect(count).toBe(0);
    });

    it('valid tracking update succeeds', async () => {
      const { order } = await setupOrder();
      await orderService.prepareFulfillment(order.id);
      const shipment = await shippingService.createShipment(order.id);

      const dbShipmentBefore = await prisma.shipment.findUnique({ where: { id: shipment.id } });

      await shippingService.processWebhook({
        providerShipmentId: dbShipmentBefore!.providerShipmentId,
        status: 'DISPATCHED',
        timestamp: new Date().toISOString(),
        eventId: 'evt_1'
      }, 'valid_signature');

      const dbShipmentAfter = await prisma.shipment.findUnique({ where: { id: shipment.id } });
      expect(dbShipmentAfter?.status).toBe('DISPATCHED');
      expect(dbShipmentAfter?.dispatchedAt).toBeDefined();
    });

    it('duplicate webhook does not duplicate transitions', async () => {
      const { order } = await setupOrder();
      await orderService.prepareFulfillment(order.id);
      const shipment = await shippingService.createShipment(order.id);

      const dbShipmentBefore = await prisma.shipment.findUnique({ where: { id: shipment.id } });

      await shippingService.processWebhook({
        providerShipmentId: dbShipmentBefore!.providerShipmentId,
        status: 'DISPATCHED',
        timestamp: new Date().toISOString(),
        eventId: 'evt_2'
      }, 'valid_signature');

      await shippingService.processWebhook({
        providerShipmentId: dbShipmentBefore!.providerShipmentId,
        status: 'DISPATCHED',
        timestamp: new Date().toISOString(),
        eventId: 'evt_2'
      }, 'valid_signature');

      const history = await prisma.shipmentStatusHistory.count({
        where: { shipmentId: shipment.id, providerEventId: 'evt_2' }
      });
      expect(history).toBe(1);
    });

    it('stale event does not regress status', async () => {
      const { order } = await setupOrder();
      await orderService.prepareFulfillment(order.id);
      const shipment = await shippingService.createShipment(order.id);
      const dbShipment = await prisma.shipment.findUnique({ where: { id: shipment.id } });

      await shippingService.processWebhook({
        providerShipmentId: dbShipment!.providerShipmentId,
        status: 'DELIVERED',
        timestamp: new Date().toISOString(),
        eventId: 'evt_3'
      }, 'valid_signature');

      await shippingService.processWebhook({
        providerShipmentId: dbShipment!.providerShipmentId,
        status: 'IN_TRANSIT',
        timestamp: new Date().toISOString(),
        eventId: 'evt_4'
      }, 'valid_signature');

      const finalShipment = await prisma.shipment.findUnique({ where: { id: shipment.id } });
      expect(finalShipment?.status).toBe('DELIVERED');
    });
  });

  describe.runIf(!hasTestDb)('Skipped Shipping Lifecycle tests', () => {
    it('skips real database connectivity because TEST_DATABASE_URL is absent', () => {
      console.warn('Real DB integration tests skipped: TEST_DATABASE_URL not provided.');
      expect(true).toBe(true);
    });
  });
});
