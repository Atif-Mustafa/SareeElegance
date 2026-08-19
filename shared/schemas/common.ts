import { z } from 'zod';

export const CurrencyCodeSchema = z
  .string()
  .regex(/^[A-Z]{3}$/, 'Currency code must be a 3-letter ISO 4217 uppercase string');

export const MoneySchema = z.object({
  amountMinor: z
    .string()
    .regex(/^[0-9]+$/, 'Amount minor must be a base-10 integer string without decimals or symbols'),
  currency: CurrencyCodeSchema,
});
