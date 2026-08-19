import { catalogRepository } from '../catalog/catalog.repository';
import { CartValidationRequestDto } from '../../../../shared/schemas/cart';
import { ValidatedCart, ValidatedCartLine } from '../../../../shared/contracts/cart/cart-response';
import { ERROR_CODES } from '../../../../shared/errors/error-codes';

export class CartService {
  async validateCart(request: CartValidationRequestDto): Promise<ValidatedCart> {
    const { lines } = request;
    
    // Merge duplicate lines
    const mergedLinesMap = new Map<string, number>();
    for (const line of lines) {
      const existingQty = mergedLinesMap.get(line.productId) || 0;
      const newQty = existingQty + line.quantity;
      if (newQty > 999) {
        const error = new Error(`Quantity for product ${line.productId} exceeds maximum of 999`);
        (error as any).status = 400;
        (error as any).code = ERROR_CODES.VALIDATION_001;
        throw error;
      }
      mergedLinesMap.set(line.productId, newQty);
    }
    
    const productIds = Array.from(mergedLinesMap.keys());
    let dbProducts: any[] = [];
    
    try {
      dbProducts = await catalogRepository.findActiveProductsByIds(productIds);
    } catch (error: any) {
      console.error("Database connection error during cart validation:", error);
      const customError = new Error("Service Unavailable: Unable to verify current cart total.");
      (customError as any).status = 503;
      (customError as any).code = ERROR_CODES.INFRA_001;
      throw customError;
    }

    const productMap = new Map<string, any>();
    for (const p of dbProducts) {
      productMap.set(p.id, p);
    }

    let subtotalMinor = BigInt(0);
    let currency: string | null = null;
    let valid = true;
    let reason: string | undefined;

    const validatedLines: ValidatedCartLine[] = [];

    for (const [productId, quantity] of mergedLinesMap.entries()) {
      const product = productMap.get(productId);

      if (!product || product.status !== 'ACTIVE') {
        valid = false;
        validatedLines.push({
          productId,
          sku: null,
          slug: '',
          name: 'Unknown Product',
          quantity,
          unitPrice: null,
          lineSubtotal: null,
          status: 'PRODUCT_UNAVAILABLE',
        });
        continue;
      }

      // Check currency consistency
      if (currency === null) {
        currency = product.currency;
      } else if (currency !== product.currency) {
        // Mixed currency cart is invalid
        valid = false;
        reason = 'CART_CURRENCY_MISMATCH';
        validatedLines.push({
          productId,
          sku: product.sku,
          slug: product.slug,
          name: product.name,
          quantity,
          unitPrice: {
            amountMinor: product.priceMinor.toString(),
            currency: product.currency as any
          },
          lineSubtotal: null,
          status: 'VALID',
        });
        continue;
      }

      const unitPriceMinor = typeof product.priceMinor === 'bigint' ? product.priceMinor : BigInt(product.priceMinor);
      const lineSubtotalMinor = unitPriceMinor * BigInt(quantity);
      subtotalMinor += lineSubtotalMinor;

      validatedLines.push({
        productId,
        sku: product.sku,
        slug: product.slug,
        name: product.name,
        quantity,
        unitPrice: {
          amountMinor: unitPriceMinor.toString(),
          currency: product.currency as any
        },
        lineSubtotal: {
          amountMinor: lineSubtotalMinor.toString(),
          currency: product.currency as any
        },
        status: 'VALID',
      });
    }

    return {
      valid,
      ...(reason ? { reason } : {}),
      lines: validatedLines,
      totals: {
        subtotal: {
          amountMinor: subtotalMinor.toString(),
          currency: (currency as any) || 'INR', // Default if empty
        }
      }
    };
  }
}

export const cartService = new CartService();
