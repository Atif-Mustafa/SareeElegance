export interface CartValidationRequest {
  lines: Array<{
    productId: string;
    quantity: number;
  }>;
}
