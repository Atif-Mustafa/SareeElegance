import { describe, it, expect } from 'vitest';
import { MoneySchema } from '../schemas/common';

describe('MoneySchema', () => {
  it('validates a correct money object', () => {
    const result = MoneySchema.safeParse({ amountMinor: '2450000', currency: 'INR' });
    expect(result.success).toBe(true);
  });

  it('rejects decimal amounts', () => {
    const result = MoneySchema.safeParse({ amountMinor: '24500.00', currency: 'USD' });
    expect(result.success).toBe(false);
  });

  it('rejects comma-formatted amounts', () => {
    const result = MoneySchema.safeParse({ amountMinor: '2,450,000', currency: 'INR' });
    expect(result.success).toBe(false);
  });

  it('rejects negative amounts', () => {
    const result = MoneySchema.safeParse({ amountMinor: '-100', currency: 'EUR' });
    expect(result.success).toBe(false);
  });

  it('rejects lowercase currency', () => {
    const result = MoneySchema.safeParse({ amountMinor: '100', currency: 'usd' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid length currency code', () => {
    const result = MoneySchema.safeParse({ amountMinor: '100', currency: 'US' });
    expect(result.success).toBe(false);
  });
});
