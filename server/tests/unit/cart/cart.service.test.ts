import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cartService } from '../../../src/modules/cart/cart.service';
import { catalogRepository } from '../../../src/modules/catalog/catalog.repository';

// Mock the catalog repository
vi.mock('../../../src/modules/catalog/catalog.repository', () => ({
  catalogRepository: {
    findActiveProductsByIds: vi.fn(),
  },
}));

describe('CartService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates a cart with a single item', async () => {
    vi.mocked(catalogRepository.findActiveProductsByIds).mockResolvedValue([{
      id: 'prod-1',
      sku: 'SKU-1',
      slug: 'slug-1',
      name: 'Product 1',
      priceMinor: 2450000n, // 24500.00
      currency: 'INR',
      status: 'ACTIVE',
    }] as any);

    const result = await cartService.validateCart({
      lines: [{ productId: 'prod-1', quantity: 2 }]
    });

    expect(result.valid).toBe(true);
    expect(result.totals.subtotal.amountMinor).toBe('4900000');
    expect(result.totals.subtotal.currency).toBe('INR');
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0].status).toBe('VALID');
    expect(result.lines[0].lineSubtotal?.amountMinor).toBe('4900000');
  });

  it('validates duplicate lines correctly by merging', async () => {
    vi.mocked(catalogRepository.findActiveProductsByIds).mockResolvedValue([{
      id: 'prod-1',
      sku: 'SKU-1',
      slug: 'slug-1',
      name: 'Product 1',
      priceMinor: 1000n,
      currency: 'INR',
      status: 'ACTIVE',
    }] as any);

    const result = await cartService.validateCart({
      lines: [
        { productId: 'prod-1', quantity: 2 },
        { productId: 'prod-1', quantity: 3 }
      ]
    });

    expect(result.valid).toBe(true);
    expect(result.totals.subtotal.amountMinor).toBe('5000');
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0].quantity).toBe(5);
  });

  it('throws validation error if merged quantity exceeds maximum', async () => {
    await expect(cartService.validateCart({
      lines: [
        { productId: 'prod-1', quantity: 500 },
        { productId: 'prod-1', quantity: 500 }
      ]
    })).rejects.toThrow('Quantity for product prod-1 exceeds maximum of 999');
  });

  it('handles unavailable products', async () => {
    vi.mocked(catalogRepository.findActiveProductsByIds).mockResolvedValue([]);

    const result = await cartService.validateCart({
      lines: [{ productId: 'unknown-id', quantity: 2 }]
    });

    expect(result.valid).toBe(false);
    expect(result.totals.subtotal.amountMinor).toBe('0');
    expect(result.lines[0].status).toBe('PRODUCT_UNAVAILABLE');
    expect(result.lines[0].productId).toBe('unknown-id');
  });

  it('handles mixed currencies', async () => {
    vi.mocked(catalogRepository.findActiveProductsByIds).mockResolvedValue([
      {
        id: 'prod-1',
        sku: 'SKU-1',
        slug: 'slug-1',
        name: 'Product 1',
        priceMinor: 1000n,
        currency: 'INR',
        status: 'ACTIVE',
      },
      {
        id: 'prod-2',
        sku: 'SKU-2',
        slug: 'slug-2',
        name: 'Product 2',
        priceMinor: 2000n,
        currency: 'USD',
        status: 'ACTIVE',
      }
    ] as any);

    const result = await cartService.validateCart({
      lines: [
        { productId: 'prod-1', quantity: 1 },
        { productId: 'prod-2', quantity: 1 }
      ]
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('CART_CURRENCY_MISMATCH');
    
    // Currency mismatch shouldn't mean the product itself is unavailable
    const usdItem = result.lines.find(l => l.productId === 'prod-2');
    expect(usdItem?.status).toBe('VALID');
  });

  it('fails safely and throws 503 when the database fails', async () => {
    vi.mocked(catalogRepository.findActiveProductsByIds).mockRejectedValue(new Error('Database connection failed'));

    await expect(cartService.validateCart({
      lines: [{ productId: 'prod-1', quantity: 1 }]
    })).rejects.toThrow('Service Unavailable: Unable to verify current cart total.');
  });
});
