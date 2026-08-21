import { prisma } from '../../infrastructure/database/prisma';
import { ApiError } from '../../common/errors/ApiError';
import { CustomerDto } from '../../../../shared/contracts/auth/auth.dto';
import { AdminInventoryItemDto, AdminInventoryAdjustmentRecordDto } from '../../../../shared/contracts/admin/admin.dto';
import { AdminInventoryAdjustInput } from '../../../../shared/schemas/admin';
import { adminAuditService } from './admin.audit.service';

export class AdminInventoryService {
  async getInventoryList(query?: { search?: string; status?: string }): Promise<AdminInventoryItemDto[]> {
    const where: any = {};
    if (query?.status) {
      where.status = query.status;
    }
    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        inventory: {
          include: {
            reservations: {
              where: {
                status: 'ACTIVE',
                expiresAt: { gt: new Date() }
              }
            },
            adjustments: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return products.map(p => {
      const onHand = p.inventory?.onHand ?? 0;
      const activeReservations = p.inventory?.reservations?.reduce((sum, r) => sum + r.quantity, 0) ?? 0;
      const available = Math.max(0, onHand - activeReservations);
      const lastAdj = p.inventory?.adjustments?.[0];

      return {
        productId: p.id,
        sku: p.sku,
        productName: p.name,
        productSlug: p.slug,
        productStatus: p.status as any,
        categoryName: p.category?.name || null,
        onHand,
        activeReservations,
        available,
        lastAdjustment: lastAdj ? {
          reason: lastAdj.reason,
          quantityDelta: lastAdj.quantityDelta,
          createdAt: lastAdj.createdAt.toISOString(),
          actorEmail: lastAdj.actorEmail
        } : null
      };
    });
  }

  async getProductInventoryHistory(productId: string): Promise<{
    product: { id: string; name: string; sku: string | null; onHand: number; available: number };
    adjustments: AdminInventoryAdjustmentRecordDto[];
    reservations: Array<{ id: string; quantity: number; status: string; expiresAt: string; createdAt: string }>;
  }> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        inventory: {
          include: {
            adjustments: { orderBy: { createdAt: 'desc' } },
            reservations: { orderBy: { createdAt: 'desc' }, take: 50 }
          }
        }
      }
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const onHand = product.inventory?.onHand ?? 0;
    const activeRes = product.inventory?.reservations
      ?.filter(r => r.status === 'ACTIVE' && r.expiresAt > new Date())
      ?.reduce((sum, r) => sum + r.quantity, 0) ?? 0;

    return {
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        onHand,
        available: Math.max(0, onHand - activeRes)
      },
      adjustments: (product.inventory?.adjustments || []).map(a => ({
        id: a.id,
        inventoryId: a.inventoryId,
        previousOnHand: a.previousOnHand,
        quantityDelta: a.quantityDelta,
        newOnHand: a.newOnHand,
        reason: a.reason as any,
        note: a.note,
        actorId: a.actorId,
        actorEmail: a.actorEmail,
        idempotencyKey: a.idempotencyKey,
        createdAt: a.createdAt.toISOString()
      })),
      reservations: (product.inventory?.reservations || []).map(r => ({
        id: r.id,
        quantity: r.quantity,
        status: r.status,
        expiresAt: r.expiresAt.toISOString(),
        createdAt: r.createdAt.toISOString()
      }))
    };
  }

  async adjustStock(actor: CustomerDto, input: AdminInventoryAdjustInput): Promise<{
    adjustment: AdminInventoryAdjustmentRecordDto;
    inventory: { onHand: number; available: number };
  }> {
    // 1. Check idempotency if key provided
    if (input.idempotencyKey) {
      const existing = await prisma.inventoryAdjustment.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        include: {
          inventory: {
            include: {
              reservations: {
                where: {
                  status: 'ACTIVE',
                  expiresAt: { gt: new Date() }
                }
              }
            }
          }
        }
      });

      if (existing) {
        const onHand = existing.inventory.onHand;
        const activeRes = existing.inventory.reservations.reduce((sum, r) => sum + r.quantity, 0);
        return {
          adjustment: {
            id: existing.id,
            inventoryId: existing.inventoryId,
            previousOnHand: existing.previousOnHand,
            quantityDelta: existing.quantityDelta,
            newOnHand: existing.newOnHand,
            reason: existing.reason as any,
            note: existing.note,
            actorId: existing.actorId,
            actorEmail: existing.actorEmail,
            idempotencyKey: existing.idempotencyKey,
            createdAt: existing.createdAt.toISOString()
          },
          inventory: {
            onHand,
            available: Math.max(0, onHand - activeRes)
          }
        };
      }
    }

    return await prisma.$transaction(async (tx) => {
      // Find or create inventory row
      let inventory = await tx.inventory.findUnique({
        where: { productId: input.productId },
        include: {
          reservations: {
            where: {
              status: 'ACTIVE',
              expiresAt: { gt: new Date() }
            }
          }
        }
      });

      if (!inventory) {
        // Verify product exists
        const product = await tx.product.findUnique({ where: { id: input.productId } });
        if (!product) throw ApiError.notFound('Product not found');

        inventory = await tx.inventory.create({
          data: {
            productId: input.productId,
            onHand: 0
          },
          include: {
            reservations: {
              where: {
                status: 'ACTIVE',
                expiresAt: { gt: new Date() }
              }
            }
          }
        });
      }

      // Lock the inventory row
      await tx.$queryRaw`SELECT * FROM "Inventory" WHERE "id" = ${inventory.id} FOR UPDATE`;

      const previousOnHand = inventory.onHand;
      const newOnHand = previousOnHand + input.quantityDelta;

      if (newOnHand < 0) {
        throw ApiError.badRequest(
          `Adjustment of ${input.quantityDelta} would result in negative on-hand stock (${newOnHand}). Current stock is ${previousOnHand}.`,
          'NEGATIVE_STOCK_NOT_ALLOWED'
        );
      }

      // Update Inventory
      const updatedInventory = await tx.inventory.update({
        where: { id: inventory.id },
        data: { onHand: newOnHand }
      });

      // Record InventoryAdjustment
      const adjustment = await tx.inventoryAdjustment.create({
        data: {
          inventoryId: inventory.id,
          previousOnHand,
          quantityDelta: input.quantityDelta,
          newOnHand,
          reason: input.reason as any,
          note: input.note || null,
          actorId: actor.id,
          actorEmail: actor.email,
          idempotencyKey: input.idempotencyKey || null
        }
      });

      // Record AdminAuditLog
      await adminAuditService.record({
        actor,
        action: 'INVENTORY_ADJUSTMENT',
        targetType: 'INVENTORY',
        targetId: inventory.id,
        metadata: {
          productId: input.productId,
          previousOnHand,
          quantityDelta: input.quantityDelta,
          newOnHand,
          reason: input.reason,
          note: input.note
        }
      }, tx);

      const activeRes = inventory.reservations.reduce((sum, r) => sum + r.quantity, 0);
      const available = Math.max(0, newOnHand - activeRes);

      return {
        adjustment: {
          id: adjustment.id,
          inventoryId: adjustment.inventoryId,
          previousOnHand: adjustment.previousOnHand,
          quantityDelta: adjustment.quantityDelta,
          newOnHand: adjustment.newOnHand,
          reason: adjustment.reason as any,
          note: adjustment.note,
          actorId: adjustment.actorId,
          actorEmail: adjustment.actorEmail,
          idempotencyKey: adjustment.idempotencyKey,
          createdAt: adjustment.createdAt.toISOString()
        },
        inventory: {
          onHand: newOnHand,
          available
        }
      };
    });
  }
}

export const adminInventoryService = new AdminInventoryService();
