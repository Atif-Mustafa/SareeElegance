import { z } from 'zod';

export const CartValidationRequestSchema = z.object({
  lines: z.array(
    z.object({
      productId: z.string(), // Allowing string, can refine to uuid if IDs are strict UUIDs
      quantity: z.number().int().min(1).max(999),
    })
  ).max(100),
}).strict();

export type CartValidationRequestDto = z.infer<typeof CartValidationRequestSchema>;
