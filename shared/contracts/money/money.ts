import type { CurrencyCode } from './currency';

export interface Money {
  amountMinor: string;
  currency: CurrencyCode;
}
