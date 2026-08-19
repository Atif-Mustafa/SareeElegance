export interface CreatePaymentRequest {
  checkoutSessionId: string;
}

export interface VerifyPaymentRequest {
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
}
