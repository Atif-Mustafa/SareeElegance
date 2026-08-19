export interface CheckoutAddressDto {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface CheckoutLineDto {
  id: string;
  productId: string;
  sku: string | null;
  name: string;
  quantity: number;
  unitPrice: {
    amountMinor: string;
    currency: string;
  };
  lineSubtotal: {
    amountMinor: string;
    currency: string;
  };
  reservationId: string | null;
}

export interface CheckoutSessionDto {
  id: string;
  status: 'OPEN' | 'EXPIRED' | 'CANCELLED' | 'COMPLETED';
  expiresAt: string;
  currency: string;
  
  subtotal: {
    amountMinor: string;
    currency: string;
  };
  tax: {
    amountMinor: string;
    currency: string;
  } | null;
  shipping: {
    amountMinor: string;
    currency: string;
  } | null;
  discount: {
    amountMinor: string;
    currency: string;
  } | null;
  total: {
    amountMinor: string;
    currency: string;
  } | null;

  shippingAddress: CheckoutAddressDto | null;
  billingAddress: CheckoutAddressDto | null;
  
  lines: CheckoutLineDto[];
  createdAt: string;
  updatedAt: string;
}
