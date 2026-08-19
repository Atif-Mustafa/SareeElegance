import { z } from 'zod';

export const CatalogSortOptionSchema = z.enum([
  'newest',
  'price_asc',
  'price_desc',
  'name_asc',
]);

const PriceMinorStringSchema = z
  .string()
  .regex(/^[0-9]+$/, 'Price must be a positive integer string (minor units)');

export const CatalogQuerySchema = z.object({
  category: z.string().optional(),
  fabric: z.string().optional(),
  weave: z.string().optional(),
  region: z.string().optional(),
  color: z.string().optional(),
  occasion: z.string().optional(),
  minPriceMinor: PriceMinorStringSchema.optional(),
  maxPriceMinor: PriceMinorStringSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(24),
  sort: CatalogSortOptionSchema.optional().default('newest'),
}).strict();
