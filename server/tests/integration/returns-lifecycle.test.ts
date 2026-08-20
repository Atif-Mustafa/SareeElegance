import { describe, it, expect, beforeEach, afterAll, beforeAll } from 'vitest';
import { prisma } from '../../src/infrastructure/database/prisma';
import { orderService } from '../../src/modules/order/order.service';
import { inventoryService } from '../../src/modules/inventory/inventory.service';
import { shippingService } from '../../src/modules/shipping/shipping.service';
import { returnsService } from '../../src/modules/returns/returns.service';
import { paymentService } from '../../src/modules/payment/payment.service';
import { randomUUID } from 'crypto';

describe('Returns Lifecycle Verification', () => {
  const hasTestDb = !!process.env.TEST_DATABASE_URL;

  describe.runIf(hasTestDb)('Returns API', () => {
    beforeAll(async () => {
      await prisma.returnShipment.deleteMany({});
      await prisma.returnLine.deleteMany({});
      await prisma.returnRequest.deleteMany({});
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

    const setupOrderAndDeliver = async () => {
      const product = await prisma.product.create({
        data: {
          id: randomUUID(),
          sku: `SKU-${randomUUID().slice(0, 8)}`,
          name: 'Test Saree Return',
          slug: `test-saree-ret-${randomUUID().slice(0, 8)}`,
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

      const reservation = await inventoryService.reserveItems(product.id, 2);

      const checkoutSession = await prisma.checkoutSession.create({
        data: {
          id: randomUUID(),
          idempotencyKey: randomUUID(),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60),
          status: 'OPEN',
          currency: 'USD',
          subtotalMinor: BigInt(100000),
          taxMinor: BigInt(0),
          shippingMinor: BigInt(0),
          discountMinor: BigInt(0),
          totalMinor: BigInt(100000),
          lines: {
            create: [{
              productId: product.id,
              sku: product.sku,
              name: product.name,
              quantity: 2,
              unitPriceMinor: BigInt(50000),
              lineSubtotalMinor: BigInt(100000),
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
          amountMinor: BigInt(100000),
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

      await orderService.prepareFulfillment(order.id);
      const shipment = await shippingService.createShipment(order.id);

      // Deliver the shipment
      const dbShipment = await prisma.shipment.findUnique({ where: { id: shipment.id } });
      await shippingService.processWebhook({
        providerShipmentId: dbShipment!.providerShipmentId,
        status: 'DELIVERED',
        timestamp: new Date().toISOString(),
        eventId: randomUUID()
      }, 'valid_signature');

      const deliveredOrder = await prisma.order.findUnique({ where: { id: order.id }, include: { lines: true } });

      return { product, inventory, order: deliveredOrder! };
    };

    it('delivered Order can request eligible return', async () => {
      const { order } = await setupOrderAndDeliver();
      const orderLineId = order.lines[0].id;

      const returnReq = await returnsService.createReturnRequest(order.id, {
        reason: 'Did not like it',
        lines: [{ orderLineId, quantity: 1, reason: 'Color mismatch' }]
      });

      expect(returnReq.status).toBe('REQUESTED');
      expect(returnReq.refundStatus).toBe('NOT_REQUESTED');
      expect(returnReq.refundAmountMinor).toBe('50000');
    });

    it('non-delivered Order rejected', async () => {
      const { order } = await setupOrderAndDeliver();
      const orderLineId = order.lines[0].id;

      // Un-deliver the shipment to test rejection
      await prisma.shipment.update({
        where: { orderId: order.id },
        data: { status: 'IN_TRANSIT', deliveredAt: null }
      });

      await expect(returnsService.createReturnRequest(order.id, {
        reason: 'Too early',
        lines: [{ orderLineId, quantity: 1 }]
      })).rejects.toThrow(/Return requested on non-delivered order/);
    });

    it('excessive quantity rejected', async () => {
      const { order } = await setupOrderAndDeliver();
      const orderLineId = order.lines[0].id;

      await expect(returnsService.createReturnRequest(order.id, {
        reason: 'Returning more than bought',
        lines: [{ orderLineId, quantity: 3 }] // Bought 2
      })).rejects.toThrow(/exceeds available returnable quantity/);
    });

    it('partial return quantities tracked correctly', async () => {
      const { order } = await setupOrderAndDeliver();
      const orderLineId = order.lines[0].id;

      // Return 1
      await returnsService.createReturnRequest(order.id, {
        reason: 'First return',
        lines: [{ orderLineId, quantity: 1 }]
      });

      // Returning another 1 should succeed
      await returnsService.createReturnRequest(order.id, {
        reason: 'Second return',
        lines: [{ orderLineId, quantity: 1 }]
      });

      // Returning 1 more should fail (2 total bought)
      await expect(returnsService.createReturnRequest(order.id, {
        reason: 'Third return',
        lines: [{ orderLineId, quantity: 1 }]
      })).rejects.toThrow(/exceeds available returnable quantity/);
    });

    it('refund amount calculated from Order snapshot', async () => {
      const { order } = await setupOrderAndDeliver();
      const orderLineId = order.lines[0].id;

      const returnReq = await returnsService.createReturnRequest(order.id, {
        reason: 'Refunding 1',
        lines: [{ orderLineId, quantity: 1 }]
      });

      expect(returnReq.refundAmountMinor).toBe('50000');
    });

    it('refund execution is idempotent', async () => {
      const { order } = await setupOrderAndDeliver();
      const orderLineId = order.lines[0].id;

      const returnReq = await returnsService.createReturnRequest(order.id, {
        reason: 'Refunding 1',
        lines: [{ orderLineId, quantity: 1 }]
      });

      await returnsService.issueRefund(returnReq.id);
      
      const updatedReq = await returnsService.getReturnRequest(returnReq.id);
      expect(updatedReq.refundStatus).toBe('SUCCEEDED');

      await expect(returnsService.issueRefund(returnReq.id)).rejects.toThrow(/Refund already succeeded/);
    });

    it('provider refund failure handled safely', async () => {
      const { order } = await setupOrderAndDeliver();
      const orderLineId = order.lines[0].id;

      // Simulate failure by modifying paymentAttemptId
      await prisma.paymentAttempt.update({
        where: { id: order.paymentAttemptId },
        data: { id: `FAIL_REFUND_${order.paymentAttemptId}` }
      });
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentAttemptId: `FAIL_REFUND_${order.paymentAttemptId}` }
      });

      const returnReq = await returnsService.createReturnRequest(order.id, {
        reason: 'Refunding 1',
        lines: [{ orderLineId, quantity: 1 }]
      });

      // We expect the function to return normal but set state to FAILED or throw an error?
      // Looking at returnsService.issueRefund, it throws the error and updates state to FAILED
      await expect(returnsService.issueRefund(returnReq.id)).rejects.toThrow();

      const failedReq = await returnsService.getReturnRequest(returnReq.id);
      expect(failedReq.refundStatus).toBe('FAILED');
    });

    it('restockable inspection restores inventory exactly once', async () => {
      const { order, product, inventory } = await setupOrderAndDeliver();
      const orderLineId = order.lines[0].id;
      const initialOnHand = inventory.onHand; // should be 8 since we consumed 2 out of 10

      const returnReq = await returnsService.createReturnRequest(order.id, {
        reason: 'Refunding 1',
        lines: [{ orderLineId, quantity: 1 }]
      });

      const returnLineId = returnReq.lines[0].id;

      await returnsService.processInspection(returnReq.id, [
        { returnLineId, disposition: 'RESTOCKABLE' }
      ]);

      const updatedInventory = await prisma.inventory.findUnique({ where: { productId: product.id } });
      // Initially 10 - 2 consumed = 8. +1 restored = 9.
      expect(updatedInventory?.onHand).toBe(9);

      await expect(returnsService.processInspection(returnReq.id, [
        { returnLineId, disposition: 'RESTOCKABLE' }
      ])).rejects.toThrow(/already inspected or closed/);
    });

    it('non-restockable item does not increment stock', async () => {
      const { order, product, inventory } = await setupOrderAndDeliver();
      const orderLineId = order.lines[0].id;
      
      const initialInventory = await prisma.inventory.findUnique({ where: { productId: product.id } });
      const currentOnHand = initialInventory!.onHand;

      const returnReq = await returnsService.createReturnRequest(order.id, {
        reason: 'Refunding 1',
        lines: [{ orderLineId, quantity: 1 }]
      });

      const returnLineId = returnReq.lines[0].id;

      await returnsService.processInspection(returnReq.id, [
        { returnLineId, disposition: 'DAMAGED' }
      ]);

      const updatedInventory = await prisma.inventory.findUnique({ where: { productId: product.id } });
      expect(updatedInventory?.onHand).toBe(currentOnHand);
    });

  });

  describe.runIf(!hasTestDb)('Skipped Returns Lifecycle tests', () => {
    it('skips real database connectivity because TEST_DATABASE_URL is absent', () => {
      console.warn('Real DB integration tests skipped: TEST_DATABASE_URL not provided.');
      expect(true).toBe(true);
    });
  });
});
