import type { Money } from '../money/money';

export type CartLineStatus = 'VALID' | 'PRODUCT_UNAVAILABLE' | 'INVALID';

export interface ValidatedCartLine {
  productId: string;
  sku: string | null;
  slug: string;
  name: string;
  quantity: number;
  unitPrice: Money | null;
  lineSubtotal: Money | null;
  status: CartLineStatus;
}

export interface ValidatedCart {
  valid: boolean;
  reason?: 'CART_CURRENCY_MISMATCH' | string;
  lines: ValidatedCartLine[];
  totals: {
    subtotal: Money;
  };
}
