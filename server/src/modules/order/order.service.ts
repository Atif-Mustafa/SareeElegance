import { prisma } from '../../infrastructure/database/prisma';
import { ApiError } from '../../common/errors/ApiError';
import { OrderDto } from '../../../../shared/contracts/order/order-response';
import { inventoryService } from '../inventory/inventory.service';
import { Prisma } from '@prisma/client';
import { randomBytes, createHash } from 'crypto';

export class OrderService {
  async finalizeOrder(paymentAttemptId: string): Promise<OrderDto> {
    const attempt = await prisma.paymentAttempt.findUnique({
      where: { id: paymentAttemptId },
      include: { checkoutSession: { include: { lines: true } }, order: true }
    });

    if (!attempt) {
      throw ApiError.notFound('Payment attempt not found');
    }
    if (attempt.status !== 'SUCCEEDED') {
      throw ApiError.badRequest('Payment not verified successfully', 'PAYMENT_NOT_VERIFIED');
    }
    if (attempt.order) {
      return this.getOrder(attempt.order.id);
    }

    const checkout = attempt.checkoutSession;

    for (const line of checkout.lines) {
      if (line.reservationId) {
        try {
          await inventoryService.consumeReservation(line.reservationId);
        } catch (err: any) {
           console.error("Failed to consume inventory for reservation", line.reservationId, err);
           throw ApiError.badRequest('Failed to finalize inventory', 'INVENTORY_CONSUMPTION_FAILED');
        }
      }
    }

    try {
      const orderNumber = `SE-${Math.floor(100000 + Math.random() * 900000)}`;
      const rawAccessToken = randomBytes(32).toString('hex');
      const hashedAccessToken = createHash('sha256').update(rawAccessToken).digest('hex');

      const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            accessToken: hashedAccessToken,
            checkoutSessionId: checkout.id,
            paymentAttemptId: attempt.id,
            status: 'CONFIRMED',
            currency: checkout.currency,
            productSubtotalMinor: checkout.subtotalMinor,
            taxMinor: checkout.taxMinor || BigInt(0),
            shippingMinor: checkout.shippingMinor || BigInt(0),
            discountMinor: checkout.discountMinor || BigInt(0),
            totalMinor: checkout.totalMinor || checkout.subtotalMinor,
            shippingAddress: checkout.shippingAddress || Prisma.JsonNull,
            billingAddress: checkout.billingAddress || Prisma.JsonNull,
            email: checkout.email,
            phone: checkout.phone,
            lines: {
              create: checkout.lines.map(l => ({
                productId: l.productId,
                sku: l.sku,
                name: l.name,
                quantity: l.quantity,
                unitPriceMinor: l.unitPriceMinor,
                lineSubtotalMinor: l.lineSubtotalMinor
              }))
            }
          },
          include: { lines: true }
        });

        await tx.checkoutSession.update({
          where: { id: checkout.id },
          data: { status: 'COMPLETED' }
        });

        return newOrder;
      });

      (order as any).rawAccessToken = rawAccessToken;
      return this.mapToDto(order);
    } catch (err) {
      console.error("Failed to create Order transactionally", err);
      throw ApiError.internal('Order finalization failed internally');
    }
  }

  async getOrderSecure(id: string, accessToken: string): Promise<OrderDto> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { lines: true }
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    const hashedInput = createHash('sha256').update(accessToken).digest('hex');
    if (order.accessToken !== hashedInput && order.accessToken !== accessToken) {
      throw ApiError.unauthorized('Invalid access token for order');
    }

    return this.mapToDto(order);
  }

  async getOrder(id: string): Promise<OrderDto> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { lines: true }
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }
    return this.mapToDto(order);
  }

  async cancelOrder(id: string, reason: string, actor: string = 'CUSTOMER_REQUEST'): Promise<OrderDto> {
    return await prisma.$transaction(async (tx) => {
      // Lock the order row to prevent concurrent prepareFulfillment
      await tx.$queryRaw`SELECT * FROM "Order" WHERE "id" = ${id} FOR UPDATE`;
      
      const order = await tx.order.findUnique({
        where: { id },
        include: { lines: true, checkoutSession: { include: { lines: true } } }
      });

      if (!order) throw ApiError.notFound('Order not found');
      if (order.status !== 'CONFIRMED' && order.status !== 'PROCESSING') {
        throw ApiError.badRequest(`Order cannot be cancelled from status ${order.status}`, 'ORDER_NOT_CANCELLABLE');
      }

      const checkoutSession = order.checkoutSession;
      if (checkoutSession && checkoutSession.lines) {
        for (const line of checkoutSession.lines) {
          if (line.reservationId) {
            try {
              await inventoryService.restoreConsumedInventory(line.reservationId);
            } catch (err: any) {
              console.error("Failed to restore inventory for reservation", line.reservationId, err);
              // Ignore restoration errors if already released/restored to keep it idempotent
            }
          }
        }
      }

      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          statusHistory: {
            create: {
              fromStatus: order.status,
              toStatus: 'CANCELLED',
              reason,
              actor
            }
          }
        },
        include: { lines: true }
      });

      return this.mapToDto(updatedOrder);
    });
  }

  async prepareFulfillment(id: string): Promise<OrderDto> {
    return await prisma.$transaction(async (tx) => {
      // Lock the order row to prevent concurrent cancelOrder
      await tx.$queryRaw`SELECT * FROM "Order" WHERE "id" = ${id} FOR UPDATE`;
      
      const order = await tx.order.findUnique({
        where: { id },
        include: { lines: true, checkoutSession: { include: { lines: true } } }
      });

      if (!order) throw ApiError.notFound('Order not found');
      if (order.status !== 'CONFIRMED' && order.status !== 'PROCESSING') {
        throw ApiError.badRequest(`Order cannot be prepared for fulfillment from status ${order.status}`, 'ORDER_NOT_FULFILLABLE');
      }

      // Reconciliation logic
      const checkoutSession = order.checkoutSession;
      let reconciliationFailed = false;
      if (checkoutSession && checkoutSession.lines) {
        for (const line of checkoutSession.lines) {
          if (!line.reservationId) {
            reconciliationFailed = true;
            break;
          }
          const reservation = await tx.reservation.findUnique({
            where: { id: line.reservationId }
          });
          if (!reservation || reservation.status !== 'CONSUMED') {
            reconciliationFailed = true;
            break;
          }
        }
      }

      if (reconciliationFailed) {
        throw ApiError.badRequest('Inventory reconciliation failed for order', 'RECONCILIATION_FAILED');
      }

      if (!order.shippingAddress) {
        throw ApiError.badRequest('Shipping address is required for fulfillment', 'MISSING_SHIPPING_ADDRESS');
      }

      const handoffData = {
        orderNumber: order.orderNumber,
        shippingAddress: order.shippingAddress,
        email: order.email,
        phone: order.phone,
        lines: order.lines.map(l => ({
          sku: l.sku,
          name: l.name,
          quantity: l.quantity
        }))
      };

      await tx.fulfillmentHandoff.create({
        data: {
          orderId: order.id,
          handoffData,
          status: 'PENDING'
        }
      });

      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: 'READY_FOR_FULFILLMENT',
          statusHistory: {
            create: {
              fromStatus: order.status,
              toStatus: 'READY_FOR_FULFILLMENT',
              reason: 'Reconciliation passed, ready for fulfillment',
              actor: 'SYSTEM'
            }
          }
        },
        include: { lines: true }
      });

      return this.mapToDto(updatedOrder);
    });
  }

  private mapToDto(order: any): OrderDto {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      accessToken: order.rawAccessToken || '***',
      status: order.status,
      productSubtotal: { amountMinor: order.productSubtotalMinor.toString(), currency: order.currency },
      tax: { amountMinor: order.taxMinor.toString(), currency: order.currency },
      shipping: { amountMinor: order.shippingMinor.toString(), currency: order.currency },
      discount: { amountMinor: order.discountMinor.toString(), currency: order.currency },
      total: { amountMinor: order.totalMinor.toString(), currency: order.currency },
      shippingAddress: order.shippingAddress === Prisma.JsonNull ? null : order.shippingAddress,
      billingAddress: order.billingAddress === Prisma.JsonNull ? null : order.billingAddress,
      email: order.email,
      phone: order.phone,
      lines: order.lines.map((l: any) => ({
        id: l.id,
        productId: l.productId,
        sku: l.sku,
        name: l.name,
        quantity: l.quantity,
        unitPrice: { amountMinor: l.unitPriceMinor.toString(), currency: order.currency },
        lineSubtotal: { amountMinor: l.lineSubtotalMinor.toString(), currency: order.currency },
      })),
      createdAt: order.createdAt.toISOString()
    };
  }
}

export const orderService = new OrderService();
