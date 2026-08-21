import { prisma } from '../../infrastructure/database/prisma';
import { ApiError } from '../../common/errors/ApiError';
import { CustomerDto } from '../../../../shared/contracts/auth/auth.dto';
import { AdminProductDto } from '../../../../shared/contracts/admin/admin.dto';
import {
  AdminCreateProductInput,
  AdminUpdateProductInput,
  AdminUpdateProductStatusInput,
  AdminUpdateProductPriceInput
} from '../../../../shared/schemas/admin';
import { adminAuditService } from './admin.audit.service';

export class AdminCatalogService {
  async getProducts(query: { status?: string; category?: string; search?: string; page?: number; limit?: number }): Promise<{ products: AdminProductDto[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.category) {
      where.category = { slug: query.category };
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          media: { orderBy: { sortOrder: 'asc' } },
          sareeDetails: true,
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    const mapped = products.map(p => this.mapToAdminDto(p));

    return {
      products: mapped,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    };
  }

  async getProductById(id: string): Promise<AdminProductDto> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        media: { orderBy: { sortOrder: 'asc' } },
        sareeDetails: true,
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

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    return this.mapToAdminDto(product);
  }

  async createProduct(actor: CustomerDto, data: AdminCreateProductInput): Promise<AdminProductDto> {
    const slug = data.slug || this.generateSlug(data.name);
    const sku = data.sku || `SKU-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Check slug uniqueness
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      throw ApiError.conflict(`A product with slug '${slug}' already exists`, 'SLUG_EXISTS');
    }

    const existingSku = await prisma.product.findUnique({ where: { sku } });
    if (existingSku) {
      throw ApiError.conflict(`A product with SKU '${sku}' already exists`, 'SKU_EXISTS');
    }

    const priceMinor = BigInt(data.priceMinor);

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: data.name,
          slug,
          sku,
          shortDescription: data.shortDescription || data.name,
          longDescription: data.longDescription || data.shortDescription || data.name,
          priceMinor,
          currency: data.currency || 'INR',
          status: data.status || 'DRAFT',
          categoryId: data.categoryId || null,
          sareeDetails: data.sareeDetails ? {
            create: {
              fabric: data.sareeDetails.fabric || 'Silk',
              weave: data.sareeDetails.weaveType || 'Handloom',
              zariType: data.sareeDetails.zariType || null,
              region: data.sareeDetails.origin || null,
              blousePiece: data.sareeDetails.blouseIncluded ? 'Included' : 'Unstitched',
              washCare: data.sareeDetails.careInstructions || 'Dry Clean Only'
            }
          } : undefined,
          media: {
            create: (data.media || []).map((m, idx) => ({
              mediaType: 'IMAGE',
              url: m.url,
              altText: m.altText || null,
              sortOrder: idx,
              isPrimary: idx === 0
            }))
          },
          inventory: {
            create: {
              onHand: data.initialOnHand || 0
            }
          }
        },
        include: {
          category: true,
          media: true,
          sareeDetails: true,
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

      await adminAuditService.record({
        actor,
        action: 'PRODUCT_CREATE',
        targetType: 'PRODUCT',
        targetId: created.id,
        metadata: {
          name: created.name,
          sku: created.sku,
          priceMinor: created.priceMinor.toString(),
          initialOnHand: data.initialOnHand || 0
        }
      }, tx);

      return created;
    });

    return this.mapToAdminDto(product);
  }

  async updateProduct(actor: CustomerDto, id: string, data: AdminUpdateProductInput): Promise<AdminProductDto> {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound('Product not found');

    if (data.slug && data.slug !== existing.slug) {
      const slugConflict = await prisma.product.findUnique({ where: { slug: data.slug } });
      if (slugConflict && slugConflict.id !== id) {
        throw ApiError.conflict(`Slug '${data.slug}' is already taken`, 'SLUG_EXISTS');
      }
    }

    if (data.sku && data.sku !== existing.sku) {
      const skuConflict = await prisma.product.findUnique({ where: { sku: data.sku } });
      if (skuConflict && skuConflict.id !== id) {
        throw ApiError.conflict(`SKU '${data.sku}' is already taken`, 'SKU_EXISTS');
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (data.media) {
        await tx.productMedia.deleteMany({ where: { productId: id } });
        await tx.productMedia.createMany({
          data: data.media.map((m, idx) => ({
            productId: id,
            mediaType: 'IMAGE',
            url: m.url,
            altText: m.altText || null,
            sortOrder: idx,
            isPrimary: idx === 0
          }))
        });
      }

      if (data.sareeDetails) {
        await tx.sareeDetails.upsert({
          where: { productId: id },
          create: {
            productId: id,
            fabric: data.sareeDetails.fabric || 'Silk',
            weave: data.sareeDetails.weaveType || 'Handloom',
            zariType: data.sareeDetails.zariType || null,
            region: data.sareeDetails.origin || null,
            blousePiece: data.sareeDetails.blouseIncluded ? 'Included' : 'Unstitched',
            washCare: data.sareeDetails.careInstructions || 'Dry Clean Only'
          },
          update: {
            fabric: data.sareeDetails.fabric || undefined,
            weave: data.sareeDetails.weaveType || undefined,
            zariType: data.sareeDetails.zariType !== undefined ? data.sareeDetails.zariType : undefined,
            region: data.sareeDetails.origin !== undefined ? data.sareeDetails.origin : undefined,
            blousePiece: data.sareeDetails.blouseIncluded !== undefined ? (data.sareeDetails.blouseIncluded ? 'Included' : 'Unstitched') : undefined,
            washCare: data.sareeDetails.careInstructions !== undefined ? data.sareeDetails.careInstructions : undefined
          }
        });
      }

      const res = await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          sku: data.sku || undefined,
          shortDescription: data.shortDescription || undefined,
          longDescription: data.longDescription || undefined,
          categoryId: data.categoryId !== undefined ? data.categoryId : undefined
        },
        include: {
          category: true,
          media: { orderBy: { sortOrder: 'asc' } },
          sareeDetails: true,
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

      await adminAuditService.record({
        actor,
        action: 'PRODUCT_UPDATE',
        targetType: 'PRODUCT',
        targetId: id,
        metadata: { updatedFields: Object.keys(data) }
      }, tx);

      return res;
    });

    return this.mapToAdminDto(updated);
  }

  async updateProductStatus(actor: CustomerDto, id: string, input: AdminUpdateProductStatusInput): Promise<AdminProductDto> {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound('Product not found');

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.product.update({
        where: { id },
        data: { status: input.status },
        include: {
          category: true,
          media: { orderBy: { sortOrder: 'asc' } },
          sareeDetails: true,
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

      await adminAuditService.record({
        actor,
        action: 'PRODUCT_STATUS_CHANGE',
        targetType: 'PRODUCT',
        targetId: id,
        metadata: { previousStatus: existing.status, newStatus: input.status }
      }, tx);

      return res;
    });

    return this.mapToAdminDto(updated);
  }

  async updateProductPrice(actor: CustomerDto, id: string, input: AdminUpdateProductPriceInput): Promise<AdminProductDto> {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound('Product not found');

    const newPriceMinor = BigInt(input.priceMinor);

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.product.update({
        where: { id },
        data: {
          priceMinor: newPriceMinor,
          currency: input.currency || existing.currency
        },
        include: {
          category: true,
          media: { orderBy: { sortOrder: 'asc' } },
          sareeDetails: true,
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

      await adminAuditService.record({
        actor,
        action: 'CATALOG_PRICE_CHANGE',
        targetType: 'PRODUCT',
        targetId: id,
        metadata: {
          previousPriceMinor: existing.priceMinor.toString(),
          newPriceMinor: newPriceMinor.toString(),
          currency: input.currency || existing.currency,
          reason: input.reason || 'Admin price update'
        }
      }, tx);

      return res;
    });

    return this.mapToAdminDto(updated);
  }

  async getCategories() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') + `-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  private mapToAdminDto(p: any): AdminProductDto {
    const onHand = p.inventory?.onHand ?? 0;
    const activeReservations = p.inventory?.reservations?.reduce((sum: number, r: any) => sum + r.quantity, 0) ?? 0;
    const available = Math.max(0, onHand - activeReservations);

    const primaryMedia = p.media?.find((m: any) => m.isPrimary) || p.media?.[0] || null;

    return {
      id: p.id,
      sku: p.sku,
      slug: p.slug,
      name: p.name,
      shortDescription: p.shortDescription,
      longDescription: p.longDescription,
      status: p.status,
      price: { amountMinor: p.priceMinor.toString(), currency: p.currency },
      currency: p.currency,
      primaryMedia: primaryMedia ? { url: primaryMedia.url, altText: primaryMedia.altText } : null,
      media: (p.media || []).map((m: any) => ({ url: m.url, altText: m.altText })),
      category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : null,
      sareeDetails: p.sareeDetails ? {
        fabric: p.sareeDetails.fabric,
        weave: p.sareeDetails.weave,
        zariType: p.sareeDetails.zariType,
        motif: p.sareeDetails.motif,
        region: p.sareeDetails.region,
        washCare: p.sareeDetails.washCare,
        blousePiece: p.sareeDetails.blousePiece
      } : null,
      inventorySummary: {
        onHand,
        activeReservations,
        available
      },
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString()
    };
  }
}

export const adminCatalogService = new AdminCatalogService();
