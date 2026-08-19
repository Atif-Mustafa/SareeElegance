import { describe, it, expect } from 'vitest';
import { sortAndSelectMedia, mapProductToSummary } from '../../../src/modules/catalog/catalog.mapper';
import type { Product, ProductMedia } from '@prisma/client';

describe('Catalog Mapper', () => {
  describe('sortAndSelectMedia', () => {
    it('returns null primary and empty ordered list for empty input', () => {
      const result = sortAndSelectMedia([]);
      expect(result.primary).toBeNull();
      expect(result.ordered).toEqual([]);
    });

    it('selects the item with isPrimary=true as primary', () => {
      const media = [
        { id: '1', mediaType: 'IMAGE', url: '1.jpg', altText: null, isPrimary: false, sortOrder: 1 } as ProductMedia,
        { id: '2', mediaType: 'IMAGE', url: '2.jpg', altText: null, isPrimary: true, sortOrder: 0 } as ProductMedia,
      ];
      const result = sortAndSelectMedia(media);
      expect(result.primary?.id).toBe('2');
      expect(result.ordered.map(m => m.id)).toEqual(['2', '1']);
    });

    it('falls back to the first item ordered by sortOrder if no primary is set', () => {
      const media = [
        { id: '1', mediaType: 'IMAGE', url: '1.jpg', altText: null, isPrimary: false, sortOrder: 1 } as ProductMedia,
        { id: '2', mediaType: 'IMAGE', url: '2.jpg', altText: null, isPrimary: false, sortOrder: 0 } as ProductMedia,
      ];
      const result = sortAndSelectMedia(media);
      expect(result.primary?.id).toBe('2');
      expect(result.ordered.map(m => m.id)).toEqual(['2', '1']);
    });
  });

  describe('mapProductToSummary', () => {
    it('explicitly converts priceMinor BigInt to amountMinor string', () => {
      const product = {
        id: '123',
        sku: 'TEST-SKU',
        slug: 'test-slug',
        name: 'Test',
        shortDescription: 'Desc',
        longDescription: 'Long',
        status: 'ACTIVE',
        priceMinor: 9999999999999999999n,
        currency: 'INR',
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        updatedAt: new Date('2023-01-01T00:00:00.000Z'),
      } as Product;

      const result = mapProductToSummary(product);
      expect(result.price.amountMinor).toBe('9999999999999999999');
      expect(typeof result.price.amountMinor).toBe('string');
    });

    it('maps correctly with optional relations', () => {
      const product = {
        id: '123',
        sku: 'TEST-SKU',
        slug: 'test-slug',
        name: 'Test',
        shortDescription: 'Desc',
        longDescription: 'Long',
        status: 'ACTIVE',
        priceMinor: 5000n,
        currency: 'INR',
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        updatedAt: new Date('2023-01-01T00:00:00.000Z'),
        colors: [{ name: 'Red' }],
        occasions: [{ name: 'Wedding' }],
      } as any;

      const result = mapProductToSummary(product);
      expect(result.colors).toEqual(['Red']);
      expect(result.occasions).toEqual(['Wedding']);
    });
  });
});
