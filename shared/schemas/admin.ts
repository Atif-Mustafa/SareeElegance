import { z } from 'zod';

export const AdminCreateProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens').optional(),
  sku: z.string().min(2).max(100).optional().nullable(),
  shortDescription: z.string().max(500).optional().nullable(),
  longDescription: z.string().max(5000).optional().nullable(),
  priceMinor: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]),
  compareAtPriceMinor: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]).optional().nullable(),
  currency: z.string().min(3).max(3).default('INR'),
  categoryId: z.string().uuid().optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  initialOnHand: z.number().int().min(0).default(0),
  primaryMedia: z.object({
    url: z.string().url(),
    altText: z.string().optional().nullable()
  }).optional().nullable(),
  media: z.array(z.object({
    url: z.string().url(),
    altText: z.string().optional().nullable()
  })).optional().default([]),
  sareeDetails: z.object({
    fabric: z.string().optional(),
    zariType: z.string().optional(),
    weaveType: z.string().optional(),
    origin: z.string().optional(),
    craftTechnique: z.string().optional(),
    blouseIncluded: z.boolean().optional(),
    careInstructions: z.string().optional()
  }).optional().nullable()
});

export type AdminCreateProductInput = z.infer<typeof AdminCreateProductSchema>;

export const AdminUpdateProductSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/).optional(),
  sku: z.string().min(2).max(100).optional().nullable(),
  shortDescription: z.string().max(500).optional().nullable(),
  longDescription: z.string().max(5000).optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  primaryMedia: z.object({
    url: z.string().url(),
    altText: z.string().optional().nullable()
  }).optional().nullable(),
  media: z.array(z.object({
    url: z.string().url(),
    altText: z.string().optional().nullable()
  })).optional(),
  sareeDetails: z.object({
    fabric: z.string().optional(),
    zariType: z.string().optional(),
    weaveType: z.string().optional(),
    origin: z.string().optional(),
    craftTechnique: z.string().optional(),
    blouseIncluded: z.boolean().optional(),
    careInstructions: z.string().optional()
  }).optional().nullable()
});

export type AdminUpdateProductInput = z.infer<typeof AdminUpdateProductSchema>;

export const AdminUpdateProductStatusSchema = z.object({
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED'])
});

export type AdminUpdateProductStatusInput = z.infer<typeof AdminUpdateProductStatusSchema>;

export const AdminUpdateProductPriceSchema = z.object({
  priceMinor: z.union([z.number().int().positive('Price must be greater than 0'), z.string().regex(/^\d+$/)]),
  compareAtPriceMinor: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]).optional().nullable(),
  currency: z.string().min(3).max(3).default('INR'),
  reason: z.string().max(500).optional().nullable()
});

export type AdminUpdateProductPriceInput = z.infer<typeof AdminUpdateProductPriceSchema>;

export const AdminInventoryAdjustSchema = z.object({
  productId: z.string().uuid('Valid product ID required'),
  quantityDelta: z.number().int().refine(val => val !== 0, 'Quantity delta cannot be zero'),
  reason: z.enum(['MANUAL_CORRECTION', 'STOCK_RECEIPT', 'DAMAGE', 'RETURN_RESTOCK', 'CYCLE_COUNT']),
  note: z.string().max(500).optional().nullable(),
  idempotencyKey: z.string().max(100).optional().nullable()
});

export type AdminInventoryAdjustInput = z.infer<typeof AdminInventoryAdjustSchema>;

export const AdminReturnInspectSchema = z.object({
  dispositions: z.array(z.object({
    returnLineId: z.string().uuid(),
    disposition: z.enum(['RESTOCKABLE', 'DAMAGED', 'NON_RESELLABLE'])
  })).min(1, 'At least one line item disposition required')
});

export type AdminReturnInspectInput = z.infer<typeof AdminReturnInspectSchema>;

export const AdminReturnRejectSchema = z.object({
  reason: z.string().min(2, 'Rejection reason is required').max(500)
});

export type AdminReturnRejectInput = z.infer<typeof AdminReturnRejectSchema>;
