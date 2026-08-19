export interface ReserveInventoryRequest {
  productId: string;
  quantity: number;
}

export interface BatchReserveInventoryRequest {
  items: ReserveInventoryRequest[];
}
