import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().optional(),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
});

export const createAddressSchema = z.object({
  recipientName: z.string().min(1, 'Recipient name is required'),
  phone: z.string().optional(),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(3, 'Pincode is required'),
  country: z.string().optional().default('India'),
  isDefault: z.boolean().optional().default(false),
});

export const claimOrderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  accessToken: z.string().min(1, 'Order access token is required'),
});

export type RegisterInput = z.input<typeof registerSchema>;
export type LoginInput = z.input<typeof loginSchema>;
export type UpdateProfileInput = z.input<typeof updateProfileSchema>;
export type CreateAddressInput = z.input<typeof createAddressSchema>;
export type ClaimOrderInput = z.input<typeof claimOrderSchema>;
