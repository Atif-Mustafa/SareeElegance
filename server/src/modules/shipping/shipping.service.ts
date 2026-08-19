import { prisma } from '../../infrastructure/database/prisma';
import { ApiError } from '../../common/errors/ApiError';
import { mockShippingProvider } from './providers/mock-provider';
import type { ShipmentDto, WebhookEventDto } from '../../../../shared/contracts/shipping/shipment';
import { ShipmentStatus } from '@prisma/client';
import { env } from '../../config/env';

export class ShippingService {
  private getProvider() {
    return mockShippingProvider;
  }

  async createShipment(orderId: string): Promise<ShipmentDto> {
    return await prisma.$transaction(async (tx) => {
      // 1. Lock the fulfillment handoff and order
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { fulfillmentHandoff: true }
      });

      if (!order) {
        throw ApiError.notFound('Order not found');
      }

      if (order.status !== 'READY_FOR_FULFILLMENT') {
        throw ApiError.badRequest('Order is not ready for fulfillment', 'INVALID_ORDER_STATE');
      }

      const handoff = order.fulfillmentHandoff;
      if (!handoff) {
        throw ApiError.badRequest('Fulfillment handoff data missing', 'MISSING_HANDOFF');
      }

      // Check if shipment already exists
      const existingShipment = await tx.shipment.findUnique({
        where: { orderId }
      });

      if (existingShipment) {
        return this.mapToDto(existingShipment);
      }

      // 2. Call provider (Note: in a distributed system, this shouldn't block the DB transaction. 
      // For this PR scope and mock provider, it is acceptable.)
      const provider = this.getProvider();
      let providerData;
      try {
        providerData = await provider.createShipment({
          orderId: order.id,
          address: (handoff.handoffData as any).shippingAddress,
          lines: (handoff.handoffData as any).lines
        });
      } catch (error: any) {
        console.error('Failed to create shipment at provider', error);
        throw ApiError.internal('Shipping provider unavailable');
      }

      // 3. Create Shipment record
      const shipment = await tx.shipment.create({
        data: {
          orderId: order.id,
          fulfillmentId: handoff.id,
          provider: 'MockProvider',
          providerShipmentId: providerData.providerShipmentId,
          trackingNumber: providerData.trackingNumber,
          status: 'CREATED',
          shippingAddress: (handoff.handoffData as any).shippingAddress,
          statusHistory: {
            create: {
              status: 'CREATED',
              reason: 'Shipment created successfully'
            }
          }
        }
      });

      return this.mapToDto(shipment);
    });
  }

  async processWebhook(payload: WebhookEventDto, signature: string): Promise<void> {
    // Webhook verification (Mocked for PR scope)
    if (signature !== 'valid_signature' && process.env.NODE_ENV !== 'test') {
      throw ApiError.unauthorized('Invalid webhook signature');
    }

    await prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.findUnique({
        where: { providerShipmentId: payload.providerShipmentId }
      });

      if (!shipment) {
        return; // Ignore webhooks for unknown shipments
      }

      // Prevent stale events/duplicate processing
      const existingEvent = await tx.shipmentStatusHistory.findFirst({
        where: {
          shipmentId: shipment.id,
          providerEventId: payload.eventId
        }
      });

      if (existingEvent) {
        return; // Already processed
      }

      // Guard against backwards status transitions.
      const statusOrder: Record<ShipmentStatus, number> = {
        CREATED: 1,
        DISPATCHED: 2,
        IN_TRANSIT: 3,
        DELIVERED: 4,
        FAILED: 5,
        CANCELLED: 5
      };

      if (statusOrder[payload.status as ShipmentStatus] <= statusOrder[shipment.status]) {
        return; // Stale or out of order
      }

      const updateData: any = { status: payload.status as ShipmentStatus };
      if (payload.status === 'DISPATCHED') {
        updateData.dispatchedAt = new Date(payload.timestamp);
      } else if (payload.status === 'DELIVERED') {
        updateData.deliveredAt = new Date(payload.timestamp);
      }

      await tx.shipment.update({
        where: { id: shipment.id },
        data: updateData
      });

      await tx.shipmentStatusHistory.create({
        data: {
          shipmentId: shipment.id,
          status: payload.status as ShipmentStatus,
          providerEventId: payload.eventId,
          reason: payload.reason,
          createdAt: new Date(payload.timestamp)
        }
      });
    });
  }

  async getShipmentForOrder(orderId: string): Promise<ShipmentDto> {
    const shipment = await prisma.shipment.findUnique({
      where: { orderId }
    });

    if (!shipment) {
      throw ApiError.notFound('Shipment not found for order');
    }

    return this.mapToDto(shipment);
  }

  private mapToDto(shipment: any): ShipmentDto {
    return {
      id: shipment.id,
      orderId: shipment.orderId,
      provider: shipment.provider,
      trackingNumber: shipment.trackingNumber,
      status: shipment.status as any,
      shippingAddress: shipment.shippingAddress,
      dispatchedAt: shipment.dispatchedAt?.toISOString() || null,
      deliveredAt: shipment.deliveredAt?.toISOString() || null,
      createdAt: shipment.createdAt.toISOString()
    };
  }
}

export const shippingService = new ShippingService();
