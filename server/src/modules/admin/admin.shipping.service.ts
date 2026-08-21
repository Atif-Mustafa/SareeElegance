import { prisma } from '../../infrastructure/database/prisma';
import { ApiError } from '../../common/errors/ApiError';
import { CustomerDto } from '../../../../shared/contracts/auth/auth.dto';
import { shippingService } from '../shipping/shipping.service';
import { adminAuditService } from './admin.audit.service';

export class AdminShippingService {
  async getShipments(query?: { status?: string; search?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.status) {
      where.status = query.status;
    }
    if (query?.search) {
      where.OR = [
        { trackingNumber: { contains: query.search, mode: 'insensitive' } },
        { providerShipmentId: { contains: query.search, mode: 'insensitive' } },
        { order: { orderNumber: { contains: query.search, mode: 'insensitive' } } }
      ];
    }

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        include: {
          order: {
            select: { id: true, orderNumber: true, email: true, status: true }
          },
          statusHistory: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.shipment.count({ where })
    ]);

    return {
      shipments: shipments.map(s => ({
        id: s.id,
        orderId: s.orderId,
        orderNumber: s.order.orderNumber,
        orderStatus: s.order.status,
        customerEmail: s.order.email,
        provider: s.provider,
        providerShipmentId: s.providerShipmentId,
        trackingNumber: s.trackingNumber,
        status: s.status,
        shippingAddress: s.shippingAddress,
        dispatchedAt: s.dispatchedAt?.toISOString() || null,
        deliveredAt: s.deliveredAt?.toISOString() || null,
        latestEvent: s.statusHistory[0] ? {
          status: s.statusHistory[0].status,
          reason: s.statusHistory[0].reason,
          createdAt: s.statusHistory[0].createdAt.toISOString()
        } : null,
        createdAt: s.createdAt.toISOString()
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    };
  }

  async getShipmentById(id: string) {
    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            lines: true
          }
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!shipment) {
      throw ApiError.notFound('Shipment not found');
    }

    return {
      id: shipment.id,
      orderId: shipment.orderId,
      orderNumber: shipment.order.orderNumber,
      orderStatus: shipment.order.status,
      customerEmail: shipment.order.email,
      provider: shipment.provider,
      providerShipmentId: shipment.providerShipmentId,
      trackingNumber: shipment.trackingNumber,
      status: shipment.status,
      shippingAddress: shipment.shippingAddress,
      dispatchedAt: shipment.dispatchedAt?.toISOString() || null,
      deliveredAt: shipment.deliveredAt?.toISOString() || null,
      createdAt: shipment.createdAt.toISOString(),
      orderLines: shipment.order.lines.map(l => ({
        id: l.id,
        name: l.name,
        sku: l.sku,
        quantity: l.quantity
      })),
      statusHistory: shipment.statusHistory.map(h => ({
        id: h.id,
        status: h.status,
        reason: h.reason,
        providerEventId: h.providerEventId,
        createdAt: h.createdAt.toISOString()
      }))
    };
  }

  async retryShipment(actor: CustomerDto, orderId: string) {
    const shipment = await shippingService.createShipment(orderId);

    await adminAuditService.record({
      actor,
      action: 'SHIPMENT_RETRY',
      targetType: 'SHIPMENT',
      targetId: shipment.id,
      metadata: { orderId, trackingNumber: shipment.trackingNumber }
    });

    return shipment;
  }
}

export const adminShippingService = new AdminShippingService();
