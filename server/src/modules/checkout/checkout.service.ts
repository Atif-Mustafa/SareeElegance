import { prisma } from '../../infrastructure/database/prisma';
import { cartService } from '../cart/cart.service';
import { inventoryService } from '../inventory/inventory.service';
import { CreateCheckoutRequestDto } from '../../../../shared/schemas/checkout';
import { CheckoutSessionDto, CheckoutLineDto } from '../../../../shared/contracts/checkout/checkout-response';
import { ApiError } from '../../common/errors/ApiError';
import { ERROR_CODES } from '../../../../shared/errors/error-codes';
import { InventoryReservationDto } from '../../../../shared/contracts/inventory/inventory-response';
import { Prisma } from '@prisma/client';

export class CheckoutService {
  async createCheckout(request: CreateCheckoutRequestDto): Promise<CheckoutSessionDto> {
    const { idempotencyKey, cart, shippingAddress, billingAddress } = request;

    // 1. Check idempotency
    const existing = await prisma.checkoutSession.findUnique({
      where: { idempotencyKey },
      include: { lines: true }
    });

    if (existing) {
      // Recheck expiry
      if (existing.status === 'OPEN' && existing.expiresAt < new Date()) {
        await this.expireCheckout(existing.id);
        const expired = await prisma.checkoutSession.findUnique({
          where: { id: existing.id },
          include: { lines: true }
        });
        return this.mapToDto(expired!);
      }
      return this.mapToDto(existing);
    }

    // 2. Validate Cart (Server-Authoritative Pricing)
    let validatedCart;
    try {
      validatedCart = await cartService.validateCart(cart);
    } catch (error: any) {
      if (error?.status === 503) {
        throw error;
      }
      throw ApiError.badRequest('Cart validation failed', 'CART_INVALID');
    }

    if (!validatedCart.valid) {
      throw ApiError.badRequest('Cart is invalid', 'CART_INVALID');
    }

    if (validatedCart.lines.length === 0) {
      throw ApiError.badRequest('Cart is empty', 'CART_EMPTY');
    }

    // 3. Reserve Inventory
    const successfulReservations: InventoryReservationDto[] = [];
    try {
      for (const line of validatedCart.lines) {
        const res = await inventoryService.reserveItems(line.productId, line.quantity);
        successfulReservations.push(res);
      }
    } catch (error: any) {
      // Compensating action: Release any successfully acquired reservations
      for (const res of successfulReservations) {
        try {
          await inventoryService.releaseReservation(res.reservationId);
        } catch (releaseError) {
          console.error(`Failed to release reservation ${res.reservationId} during compensation:`, releaseError);
        }
      }
      // Re-throw (inventory logic already uses ApiError)
      throw error;
    }

    // Determine checkout expiration based on earliest reservation expiry
    let earliestExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // Default 1 day
    for (const res of successfulReservations) {
      const resExpiry = new Date(res.expiresAt);
      if (resExpiry < earliestExpiry) {
        earliestExpiry = resExpiry;
      }
    }

    // 4. Create Immutable Checkout Snapshot
    try {
      const session = await prisma.checkoutSession.create({
        data: {
          idempotencyKey,
          status: 'OPEN',
          currency: validatedCart.totals.subtotal.currency,
          subtotalMinor: BigInt(validatedCart.totals.subtotal.amountMinor),
          // Unresolved fields
          taxMinor: null,
          shippingMinor: null,
          discountMinor: null,
          totalMinor: null,
          expiresAt: earliestExpiry,
          shippingAddress: shippingAddress ? (shippingAddress as any) : null,
          billingAddress: billingAddress ? (billingAddress as any) : null,
          email: shippingAddress?.email || null,
          phone: shippingAddress?.phone || null,
          lines: {
            create: validatedCart.lines.map((line, index) => {
              const res = successfulReservations[index];
              return {
                productId: line.productId,
                sku: line.sku,
                name: line.name,
                quantity: line.quantity,
                unitPriceMinor: BigInt(line.unitPrice!.amountMinor),
                lineSubtotalMinor: BigInt(line.lineSubtotal!.amountMinor),
                reservationId: res.reservationId,
              };
            })
          }
        },
        include: { lines: true }
      });
      return this.mapToDto(session);
    } catch (error: any) {
      // Compensating action
      for (const res of successfulReservations) {
        try {
          await inventoryService.releaseReservation(res.reservationId);
        } catch (releaseError) {
          console.error(`Failed to release reservation ${res.reservationId} during compensation:`, releaseError);
        }
      }
      
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Someone else created it just now
        const existingNow = await prisma.checkoutSession.findUnique({
          where: { idempotencyKey },
          include: { lines: true }
        });
        if (existingNow) return this.mapToDto(existingNow);
      }
      
      console.error('Database error during checkout creation:', error);
      const customError = new Error("Service Unavailable: Unable to create checkout session.");
      (customError as any).status = 503;
      (customError as any).code = ERROR_CODES.INFRA_001;
      throw customError;
    }
  }

  async getCheckout(id: string): Promise<CheckoutSessionDto> {
    const session = await prisma.checkoutSession.findUnique({
      where: { id },
      include: { lines: true }
    });

    if (!session) {
      throw ApiError.notFound('Checkout session not found');
    }

    if (session.status === 'OPEN' && session.expiresAt < new Date()) {
      await this.expireCheckout(session.id);
      const expired = await prisma.checkoutSession.findUnique({
        where: { id: session.id },
        include: { lines: true }
      });
      return this.mapToDto(expired!);
    }

    return this.mapToDto(session);
  }

  async cancelCheckout(id: string): Promise<CheckoutSessionDto> {
    const session = await prisma.checkoutSession.findUnique({
      where: { id },
      include: { lines: true }
    });

    if (!session) {
      throw ApiError.notFound('Checkout session not found');
    }

    if (session.status === 'CANCELLED' || session.status === 'COMPLETED') {
      return this.mapToDto(session);
    }

    // Release reservations
    for (const line of session.lines) {
      if (line.reservationId) {
        try {
          await inventoryService.releaseReservation(line.reservationId);
        } catch (e) {
          console.error(`Failed to release reservation ${line.reservationId} during cancellation:`, e);
        }
      }
    }

    const updated = await prisma.checkoutSession.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { lines: true }
    });

    return this.mapToDto(updated);
  }

  private async expireCheckout(id: string): Promise<void> {
    const session = await prisma.checkoutSession.findUnique({
      where: { id },
      include: { lines: true }
    });
    if (!session || session.status !== 'OPEN') return;

    for (const line of session.lines) {
      if (line.reservationId) {
        try {
          await inventoryService.releaseReservation(line.reservationId);
        } catch (e) {
          console.error(`Failed to release reservation ${line.reservationId} during expiry:`, e);
        }
      }
    }

    await prisma.checkoutSession.update({
      where: { id },
      data: { status: 'EXPIRED' }
    });
  }

  private mapToDto(session: any): CheckoutSessionDto {
    return {
      id: session.id,
      status: session.status,
      expiresAt: session.expiresAt.toISOString(),
      currency: session.currency,
      subtotal: {
        amountMinor: session.subtotalMinor.toString(),
        currency: session.currency
      },
      tax: session.taxMinor ? {
        amountMinor: session.taxMinor.toString(),
        currency: session.currency
      } : null,
      shipping: session.shippingMinor ? {
        amountMinor: session.shippingMinor.toString(),
        currency: session.currency
      } : null,
      discount: session.discountMinor ? {
        amountMinor: session.discountMinor.toString(),
        currency: session.currency
      } : null,
      total: session.totalMinor ? {
        amountMinor: session.totalMinor.toString(),
        currency: session.currency
      } : null,
      shippingAddress: session.shippingAddress || null,
      billingAddress: session.billingAddress || null,
      lines: session.lines.map((l: any) => ({
        id: l.id,
        productId: l.productId,
        sku: l.sku,
        name: l.name,
        quantity: l.quantity,
        unitPrice: {
          amountMinor: l.unitPriceMinor.toString(),
          currency: session.currency
        },
        lineSubtotal: {
          amountMinor: l.lineSubtotalMinor.toString(),
          currency: session.currency
        },
        reservationId: l.reservationId
      })),
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    };
  }
}

export const checkoutService = new CheckoutService();
