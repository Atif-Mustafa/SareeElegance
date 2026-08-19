export interface InventoryAvailabilityDto {
  productId: string;
  onHand: number;
  available: number;
  status: 'AVAILABLE' | 'INSUFFICIENT_STOCK' | 'OUT_OF_STOCK';
}

export interface InventoryReservationDto {
  reservationId: string;
  productId: string;
  quantity: number;
  status: 'ACTIVE' | 'RELEASED' | 'EXPIRED' | 'CONSUMED';
  expiresAt: string; // ISO 8601
}
