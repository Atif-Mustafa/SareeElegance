export type ShipmentStatusDto = 'CREATED' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED' | 'CANCELLED';

export interface ShipmentDto {
  id: string;
  orderId: string;
  provider: string;
  trackingNumber: string | null;
  status: ShipmentStatusDto;
  shippingAddress: any;
  dispatchedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

export interface CreateShipmentRequest {
  orderId: string;
}

export interface WebhookEventDto {
  providerShipmentId: string;
  status: ShipmentStatusDto;
  timestamp: string;
  reason?: string;
  eventId: string;
}
