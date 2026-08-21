import { describe, it, expect, beforeEach, afterAll, beforeAll } from 'vitest';
import { prisma } from '../../src/infrastructure/database/prisma';
import { authService } from '../../src/modules/auth/auth.service';
import { customerService } from '../../src/modules/customer/customer.service';
import { orderService } from '../../src/modules/order/order.service';
import { inventoryService } from '../../src/modules/inventory/inventory.service';
import { randomUUID } from 'crypto';

describe('Customer Account & Order History Lifecycle Verification', () => {
  const hasTestDb = !!process.env.TEST_DATABASE_URL;

  describe.runIf(hasTestDb)('Customer Auth & Self-Service', () => {
    beforeAll(async () => {
      await prisma.customerAddress.deleteMany({});
      await prisma.customerSession.deleteMany({});
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
      await prisma.customer.deleteMany({});
    });

    afterAll(async () => {
      await prisma.$disconnect();
    });

    const setupGuestOrder = async () => {
      const product = await prisma.product.create({
        data: {
          id: randomUUID(),
          sku: `SKU-${randomUUID().slice(0, 8)}`,
          name: 'Test Banarasi Silk Saree',
          slug: `test-banarasi-${randomUUID().slice(0, 8)}`,
          seoDescription: 'A test saree',
          shortDescription: 'short',
          longDescription: 'long',
          priceMinor: BigInt(250000),
          currency: 'INR',
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
          currency: 'INR',
          subtotalMinor: BigInt(250000),
          taxMinor: BigInt(0),
          shippingMinor: BigInt(0),
          discountMinor: BigInt(0),
          totalMinor: BigInt(250000),
          lines: {
            create: [{
              productId: product.id,
              sku: product.sku,
              name: product.name,
              quantity: 1,
              unitPriceMinor: BigInt(250000),
              lineSubtotalMinor: BigInt(250000),
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
          amountMinor: BigInt(250000),
          currency: 'INR',
          provider: 'STRIPE',
          providerPaymentId: `pi_${randomUUID()}`,
          status: 'SUCCEEDED'
        }
      });

      const order = await orderService.finalizeOrder(paymentAttempt.id);
      return { order, rawAccessToken: (order as any).rawAccessToken as string };
    };

    it('registers a customer and creates session with hashed credentials', async () => {
      const email = `customer_${randomUUID().slice(0, 6)}@example.com`;
      const result = await authService.register({
        email,
        password: 'securePassword123!',
        name: 'Priya Sharma',
        phone: '+919876543210'
      });

      expect(result.customer.id).toBeDefined();
      expect(result.customer.email).toBe(email);
      expect(result.customer.name).toBe('Priya Sharma');
      expect(result.sessionToken).toBeDefined();

      // Ensure password is not plain text in DB
      const dbCustomer = await prisma.customer.findUnique({
        where: { id: result.customer.id }
      });
      expect(dbCustomer?.passwordHash).not.toBe('securePassword123!');
      expect(dbCustomer?.passwordHash.startsWith('$2')).toBe(true);

      // Validate session token works
      const sessionCustomer = await authService.validateSession(result.sessionToken);
      expect(sessionCustomer?.id).toBe(result.customer.id);
    });

    it('rejects duplicate registration with 409 Conflict', async () => {
      const email = `dup_${randomUUID().slice(0, 6)}@example.com`;
      await authService.register({
        email,
        password: 'password123',
        name: 'First User'
      });

      await expect(authService.register({
        email,
        password: 'password456',
        name: 'Duplicate User'
      })).rejects.toThrow(/already exists/i);
    });

    it('logs in with correct credentials and rejects invalid credentials', async () => {
      const email = `login_${randomUUID().slice(0, 6)}@example.com`;
      await authService.register({
        email,
        password: 'correctPassword99',
        name: 'Login Tester'
      });

      // Valid login
      const loginRes = await authService.login({
        email,
        password: 'correctPassword99'
      });
      expect(loginRes.customer.email).toBe(email);
      expect(loginRes.sessionToken).toBeDefined();

      // Invalid password
      await expect(authService.login({
        email,
        password: 'wrongPassword'
      })).rejects.toThrow(/Invalid email or password/i);

      // Non-existent email (enumeration protection)
      await expect(authService.login({
        email: 'nonexistent@example.com',
        password: 'anyPassword'
      })).rejects.toThrow(/Invalid email or password/i);
    });

    it('logs out and invalidates active session', async () => {
      const email = `logout_${randomUUID().slice(0, 6)}@example.com`;
      const { sessionToken } = await authService.register({
        email,
        password: 'logoutPassword1',
      });

      // Should be valid initially
      const validBefore = await authService.validateSession(sessionToken);
      expect(validBefore).not.toBeNull();

      // Logout
      await authService.logout(sessionToken);

      // Should be invalid after logout
      const validAfter = await authService.validateSession(sessionToken);
      expect(validAfter).toBeNull();
    });

    it('updates customer profile and manages address book', async () => {
      const email = `profile_${randomUUID().slice(0, 6)}@example.com`;
      const { customer } = await authService.register({
        email,
        password: 'profilePassword1',
        name: 'Initial Name'
      });

      // Update Profile
      const updatedProfile = await customerService.updateProfile(customer.id, {
        name: 'Ananya Verma',
        phone: '+919988776655'
      });
      expect(updatedProfile.name).toBe('Ananya Verma');
      expect(updatedProfile.phone).toBe('+919988776655');

      // Add Address 1 (auto-default)
      const addr1 = await customerService.createAddress(customer.id, {
        recipientName: 'Ananya Verma',
        phone: '+919988776655',
        addressLine1: 'Flat 401, Silk Residency',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India',
        isDefault: false
      });
      expect(addr1.isDefault).toBe(true);

      // Add Address 2 with isDefault=true
      const addr2 = await customerService.createAddress(customer.id, {
        recipientName: 'Ananya Office',
        addressLine1: 'Tower B, Tech Park',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560100',
        isDefault: true
      });
      expect(addr2.isDefault).toBe(true);

      // Verify list orders default first
      const addresses = await customerService.getAddresses(customer.id);
      expect(addresses.length).toBe(2);
      expect(addresses[0].id).toBe(addr2.id);
      expect(addresses[0].isDefault).toBe(true);
      expect(addresses[1].isDefault).toBe(false);

      // Delete Address 1
      await customerService.deleteAddress(customer.id, addr1.id);
      const remaining = await customerService.getAddresses(customer.id);
      expect(remaining.length).toBe(1);
      expect(remaining[0].id).toBe(addr2.id);
    });

    it('claims a guest order securely with access token', async () => {
      const { order, rawAccessToken } = await setupGuestOrder();

      // Register customer
      const email = `claim_${randomUUID().slice(0, 6)}@example.com`;
      const { customer } = await authService.register({
        email,
        password: 'claimPassword1',
        name: 'Claim Customer'
      });

      // Claim order with invalid token fails
      await expect(customerService.claimGuestOrder(customer.id, order.id, 'bad-token'))
        .rejects.toThrow(/Invalid access token/i);

      // Claim order with valid token succeeds
      const claimed = await customerService.claimGuestOrder(customer.id, order.id, rawAccessToken);
      expect(claimed.customerId).toBe(customer.id);

      // Check in customer order history
      const history = await customerService.getCustomerOrders(customer.id);
      expect(history.orders.length).toBe(1);
      expect(history.orders[0].id).toBe(order.id);

      // Idempotent repeated claim by same customer succeeds
      const repeated = await customerService.claimGuestOrder(customer.id, order.id, rawAccessToken);
      expect(repeated.customerId).toBe(customer.id);

      // Claim by ANOTHER customer is rejected
      const { customer: otherCustomer } = await authService.register({
        email: `other_${randomUUID().slice(0, 6)}@example.com`,
        password: 'otherPassword1',
      });
      await expect(customerService.claimGuestOrder(otherCustomer.id, order.id, rawAccessToken))
        .rejects.toThrow(/already claimed/i);
    });

    it('allows authenticated customer to access their order without guest token', async () => {
      const { order, rawAccessToken } = await setupGuestOrder();

      const email = `access_${randomUUID().slice(0, 6)}@example.com`;
      const { customer } = await authService.register({
        email,
        password: 'accessPassword1',
      });

      // Claim order
      await customerService.claimGuestOrder(customer.id, order.id, rawAccessToken);

      // Assert access via customerId (no token provided)
      const accessibleOrder = await orderService.assertOrderAccess(order.id, customer.id);
      expect(accessibleOrder.id).toBe(order.id);

      // Unauthenticated / wrong customer without token fails
      await expect(orderService.assertOrderAccess(order.id, 'unauthorized-customer-id'))
        .rejects.toThrow(/Order access token required or unauthorized account/i);
    });
  });

  describe.runIf(!hasTestDb)('Skipped DB tests', () => {
    it('skips when TEST_DATABASE_URL is not set', () => {
      expect(true).toBe(true);
    });
  });
});
