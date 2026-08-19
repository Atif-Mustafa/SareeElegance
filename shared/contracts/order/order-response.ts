import { Money } from '../money/money';

export type OrderStatusDto = 'CONFIRMED' | 'PROCESSING' | 'READY_FOR_FULFILLMENT' | 'CANCELLED';

export interface OrderLineDto {
  id: string;
  productId: string;
  sku: string | null;
  name: string;
  quantity: number;
  unitPrice: Money;
  lineSubtotal: Money;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  accessToken?: string;
  status: OrderStatusDto;
  
  productSubtotal: Money;
  tax: Money;
  shipping: Money;
  discount: Money;
  total: Money;

  shippingAddress: any | null;
  billingAddress: any | null;
  email: string | null;
  phone: string | null;

  lines: OrderLineDto[];

  createdAt: string;
}
