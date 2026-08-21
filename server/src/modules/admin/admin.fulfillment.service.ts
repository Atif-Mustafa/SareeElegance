import { prisma } from '../../infrastructure/database/prisma';
import { ApiError } from '../../common/errors/ApiError';
import { CustomerDto } from '../../../../shared/contracts/auth/auth.dto';
import { AdminOrderListItemDto } from '../../../../shared/contracts/admin/admin.dto';
import { orderService } from '../order/order.service';
import { shippingService } from '../shipping/shipping.service';
import { adminAuditService } from './admin.audit.service';

export class AdminFulfillmentService {
  async getOrders(query: { status?: string; search?: string; page?: number; limit?: number }): Promise<{
    orders: AdminOrderListItemDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          lines: true,
          fulfillmentHandoff: true,
          shipment: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ]);

    const mapped = orders.map(o => this.mapToAdminOrderDto(o));

    return {
      orders: mapped,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    };
  }

  async getOrderDetails(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        lines: true,
        fulfillmentHandoff: true,
        shipment: {
          include: {
            statusHistory: { orderBy: { createdAt: 'desc' } }
          }
        },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        returns: {
          include: { lines: true }
        }
      }
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    return {
      ...order,
      productSubtotalMinor: order.productSubtotalMinor.toString(),
      taxMinor: order.taxMinor.toString(),
      shippingMinor: order.shippingMinor.toString(),
      discountMinor: order.discountMinor.toString(),
      totalMinor: order.totalMinor.toString(),
      lines: order.lines.map(l => ({
        ...l,
        unitPriceMinor: l.unitPriceMinor.toString(),
        lineSubtotalMinor: l.lineSubtotalMinor.toString()
      }))
    };
  }

  async prepareOrderFulfillment(actor: CustomerDto, orderId: string) {
    const order = await orderService.prepareFulfillment(orderId);

    await adminAuditService.record({
      actor,
      action: 'FULFILLMENT_PREPARE',
      targetType: 'ORDER',
      targetId: orderId,
      metadata: { orderNumber: order.orderNumber, status: order.status }
    });

    return order;
  }

  async dispatchOrder(actor: CustomerDto, orderId: string) {
    const shipment = await shippingService.createShipment(orderId);

    await adminAuditService.record({
      actor,
      action: 'FULFILLMENT_DISPATCH',
      targetType: 'ORDER',
      targetId: orderId,
      metadata: {
        shipmentId: shipment.id,
        trackingNumber: shipment.trackingNumber,
        provider: shipment.provider
      }
    });

    return shipment;
  }

  async getHandoffs() {
    return prisma.fulfillmentHandoff.findMany({
      include: {
        order: {
          select: { id: true, orderNumber: true, status: true, email: true, createdAt: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  }

  private mapToAdminOrderDto(o: any): AdminOrderListItemDto {
    let fulfillmentStatus: AdminOrderListItemDto['fulfillmentStatus'] = 'NOT_STARTED';

    if (o.status === 'CANCELLED') {
      fulfillmentStatus = 'CANCELLED';
    } else if (o.shipment?.status === 'DELIVERED') {
      fulfillmentStatus = 'DELIVERED';
    } else if (o.shipment) {
      fulfillmentStatus = 'DISPATCHED';
    } else if (o.status === 'READY_FOR_FULFILLMENT') {
      fulfillmentStatus = 'READY_FOR_FULFILLMENT';
    } else if (o.fulfillmentHandoff) {
      fulfillmentStatus = 'PENDING_HANDOFF';
    }

    return {
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      email: o.email,
      phone: o.phone,
      total: { amountMinor: o.totalMinor.toString(), currency: o.currency },
      itemsCount: o.lines.reduce((sum: number, l: any) => sum + l.quantity, 0),
      shippingAddress: o.shippingAddress,
      fulfillmentStatus,
      shipment: o.shipment ? {
        id: o.shipment.id,
        trackingNumber: o.shipment.trackingNumber,
        status: o.shipment.status,
        provider: o.shipment.provider
      } : null,
      createdAt: o.createdAt.toISOString()
    };
  }
}

export const adminFulfillmentService = new AdminFulfillmentService();
