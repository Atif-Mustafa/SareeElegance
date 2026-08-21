import { prisma } from '../../infrastructure/database/prisma';
import { ApiError } from '../../common/errors/ApiError';
import { CustomerDto } from '../../../../shared/contracts/auth/auth.dto';
import { ReconciliationExceptionsDto } from '../../../../shared/contracts/admin/admin.dto';
import { orderService } from '../order/order.service';
import { adminAuditService } from './admin.audit.service';

export class AdminReconciliationService {
  async getExceptions(): Promise<ReconciliationExceptionsDto> {
    // 1. Orphaned payments (SUCCEEDED payment attempts with no order)
    const succeededAttempts = await prisma.paymentAttempt.findMany({
      where: {
        status: 'SUCCEEDED',
        order: null
      },
      include: {
        checkoutSession: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const orphanedPayments = succeededAttempts.map(p => ({
      id: p.id,
      checkoutSessionId: p.checkoutSessionId,
      amountMinor: p.amountMinor.toString(),
      currency: p.currency,
      status: p.status,
      createdAt: p.createdAt.toISOString()
    }));

    // 2. Unreconciled orders (e.g. missing consumed reservations or un-fulfilled confirmed orders)
    const confirmedOrders = await prisma.order.findMany({
      where: {
        status: { in: ['CONFIRMED', 'PROCESSING'] }
      },
      include: {
        checkoutSession: {
          include: { lines: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const unreconciledOrders: ReconciliationExceptionsDto['unreconciledOrders'] = [];
    for (const ord of confirmedOrders) {
      let isUnreconciled = false;
      let reason = 'Pending fulfillment preparation';

      if (!ord.shippingAddress) {
        isUnreconciled = true;
        reason = 'Missing shipping address';
      } else if (ord.checkoutSession?.lines) {
        for (const line of ord.checkoutSession.lines) {
          if (!line.reservationId) {
            isUnreconciled = true;
            reason = `Line item ${line.sku || line.name} has no reservation link`;
            break;
          }
        }
      }

      if (isUnreconciled) {
        unreconciledOrders.push({
          id: ord.id,
          orderNumber: ord.orderNumber,
          status: ord.status,
          email: ord.email,
          totalMinor: ord.totalMinor.toString(),
          currency: ord.currency,
          reason,
          createdAt: ord.createdAt.toISOString()
        });
      }
    }

    // 3. Stalled fulfillment handoffs (READY_FOR_FULFILLMENT orders without shipments)
    const readyOrdersWithoutShipment = await prisma.order.findMany({
      where: {
        status: 'READY_FOR_FULFILLMENT',
        shipment: null
      },
      include: {
        fulfillmentHandoff: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const stalledFulfillments = readyOrdersWithoutShipment.map(o => ({
      orderId: o.id,
      orderNumber: o.orderNumber,
      handoffId: o.fulfillmentHandoff?.id || 'MISSING_HANDOFF',
      handoffStatus: o.fulfillmentHandoff?.status || 'NOT_FOUND',
      createdAt: o.createdAt.toISOString()
    }));

    // 4. Failed/stalled refunds
    const failedOrPendingRefunds = await prisma.returnRequest.findMany({
      where: {
        refundStatus: { in: ['FAILED', 'PENDING'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const failedRefunds = failedOrPendingRefunds.map(r => ({
      returnId: r.id,
      orderId: r.orderId,
      refundStatus: r.refundStatus,
      refundAmountMinor: r.refundAmountMinor?.toString() || null,
      createdAt: r.createdAt.toISOString()
    }));

    // 5. Inventory anomalies
    const products = await prisma.product.findMany({
      include: {
        inventory: {
          include: {
            reservations: {
              where: {
                status: 'ACTIVE',
                expiresAt: { gt: new Date() }
              }
            }
          }
        }
      }
    });

    const inventoryAnomalies: ReconciliationExceptionsDto['inventoryAnomalies'] = [];
    for (const p of products) {
      const onHand = p.inventory?.onHand ?? 0;
      const activeRes = p.inventory?.reservations?.reduce((sum, r) => sum + r.quantity, 0) ?? 0;

      if (onHand < 0) {
        inventoryAnomalies.push({
          productId: p.id,
          productName: p.name,
          onHand,
          activeReservations: activeRes,
          issue: `Negative on-hand stock detected: ${onHand}`
        });
      } else if (onHand < activeRes) {
        inventoryAnomalies.push({
          productId: p.id,
          productName: p.name,
          onHand,
          activeReservations: activeRes,
          issue: `Active reservations (${activeRes}) exceed total on-hand stock (${onHand})`
        });
      }
    }

    return {
      orphanedPayments,
      unreconciledOrders,
      stalledFulfillments,
      failedRefunds,
      inventoryAnomalies
    };
  }

  async retryOrderFulfillment(actor: CustomerDto, orderId: string) {
    const order = await orderService.prepareFulfillment(orderId);

    await adminAuditService.record({
      actor,
      action: 'RECONCILIATION_RETRY_FULFILLMENT',
      targetType: 'ORDER',
      targetId: orderId,
      metadata: { orderNumber: order.orderNumber }
    });

    return order;
  }
}

export const adminReconciliationService = new AdminReconciliationService();
