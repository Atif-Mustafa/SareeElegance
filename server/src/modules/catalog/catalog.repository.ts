import { PrismaService } from '../../infrastructure/database/prisma';
import { Prisma } from '@prisma/client';
import { CatalogQuery } from '../../../../shared/contracts/catalog/filters';

export class CatalogRepository {
  private prisma = PrismaService.getInstance();

  private getProductIncludes() {
    return {
      category: true,
      sareeDetails: true,
      media: true,
      colors: true,
      occasions: true,
    };
  }

  async findActiveProducts(query: CatalogQuery) {
    const {
      page = 1,
      limit = 24,
      sort = 'newest',
      category,
      fabric,
      weave,
      region,
      color,
      occasion,
      minPriceMinor,
      maxPriceMinor,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      status: 'ACTIVE',
    };

    if (category) {
      where.category = { slug: category };
    }

    if (fabric || weave || region) {
      where.sareeDetails = {
        ...(fabric && { fabric }),
        ...(weave && { weave }),
        ...(region && { region }),
      };
    }

    if (color) {
      where.colors = { some: { name: color } };
    }

    if (occasion) {
      where.occasions = { some: { name: occasion } };
    }

    if (minPriceMinor || maxPriceMinor) {
      where.priceMinor = {
        ...(minPriceMinor && { gte: BigInt(minPriceMinor) }),
        ...(maxPriceMinor && { lte: BigInt(maxPriceMinor) }),
      };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { priceMinor: 'asc' };
    if (sort === 'price_desc') orderBy = { priceMinor: 'desc' };
    if (sort === 'name_asc') orderBy = { name: 'asc' };

    const [totalItems, products] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: this.getProductIncludes(),
        skip,
        take: limit,
        orderBy,
      }),
    ]);

    return { products, totalItems, page, limit };
  }

  async findActiveProductBySlug(slug: string) {
    return this.prisma.product.findFirst({
      where: {
        slug,
        status: 'ACTIVE',
      },
      include: this.getProductIncludes(),
    });
  }

  
  async findActiveProductsByIds(ids: string[]) {
    return this.prisma.product.findMany({
      where: {
        id: { in: ids },
        status: 'ACTIVE',
      },
      include: this.getProductIncludes(),
    });
  }

  async findActiveCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}

export const catalogRepository = new CatalogRepository();
