import { z } from 'zod';
import { CartValidationRequestSchema } from './cart';

export const checkoutAddressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(5, 'Valid phone is required'),
  addressLine1: z.string().min(1, 'Address Line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(4, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
});

export const createCheckoutSchema = z.object({
  idempotencyKey: z.string().min(1, 'Idempotency key is required'),
  cart: CartValidationRequestSchema,
  shippingAddress: checkoutAddressSchema.optional(),
  billingAddress: checkoutAddressSchema.optional(),
});

export type CreateCheckoutRequestDto = z.infer<typeof createCheckoutSchema>;
