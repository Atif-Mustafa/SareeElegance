import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema, createAddressSchema, claimOrderSchema } from '../schemas/auth';

describe('Auth & Customer Schema Validation', () => {
  it('validates registration schema', () => {
    const valid = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
      name: 'User Name',
      phone: '+919876543210'
    });
    expect(valid.success).toBe(true);

    const invalidEmail = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'password123'
    });
    expect(invalidEmail.success).toBe(false);

    const shortPassword = registerSchema.safeParse({
      email: 'user@example.com',
      password: '123'
    });
    expect(shortPassword.success).toBe(false);
  });

  it('validates login schema', () => {
    const valid = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123'
    });
    expect(valid.success).toBe(true);

    const missingPass = loginSchema.safeParse({
      email: 'user@example.com',
      password: ''
    });
    expect(missingPass.success).toBe(false);
  });

  it('validates address creation schema', () => {
    const valid = createAddressSchema.safeParse({
      recipientName: 'Priya Sharma',
      addressLine1: '402 Regency Crest',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      country: 'India',
      isDefault: true
    });
    expect(valid.success).toBe(true);

    const missingCity = createAddressSchema.safeParse({
      recipientName: 'Priya Sharma',
      addressLine1: '402 Regency Crest',
      city: '',
      state: 'Maharashtra',
      pincode: '400050'
    });
    expect(missingCity.success).toBe(false);
  });

  it('validates claim order schema', () => {
    const valid = claimOrderSchema.safeParse({
      orderId: 'order-123',
      accessToken: 'token-abc'
    });
    expect(valid.success).toBe(true);

    const missingToken = claimOrderSchema.safeParse({
      orderId: 'order-123',
      accessToken: ''
    });
    expect(missingToken.success).toBe(false);
  });
});
