export interface ShippingProvider {
  createShipment(request: { orderId: string, address: any, lines: any[] }): Promise<{ providerShipmentId: string, trackingNumber: string }>;
  getTracking(providerShipmentId: string): Promise<{ status: string }>;
  cancelShipment(providerShipmentId: string): Promise<void>;
}
