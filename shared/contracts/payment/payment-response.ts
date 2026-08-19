import { Money } from '../money/money';

export type PaymentStatusDto = 'CREATED' | 'PENDING' | 'AUTHORIZED' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';

export interface PaymentAttemptDto {
  id: string;
  checkoutSessionId: string;
  provider: 'STRIPE' | 'RAZORPAY' | 'PAYPAL';
  providerOrderId: string;
  amount: Money;
  status: PaymentStatusDto;
  createdAt: string;
}

export interface PaymentInitializationResponse {
  paymentAttempt: PaymentAttemptDto;
  providerData: {
    key: string;
    orderId: string;
    amount: number;
    currency: string;
  };
}
