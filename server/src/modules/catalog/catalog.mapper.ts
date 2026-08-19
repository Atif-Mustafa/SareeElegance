import type {
  Product,
  Category,
  SareeDetails,
  ProductMedia,
  ProductColor,
  ProductOccasion,
} from '@prisma/client';
import type {
  CatalogProductSummary,
  CatalogProductDetail,
  CatalogMediaDto,
  CatalogSareeDetailsDto,
} from '../../../../shared/contracts/catalog/product';
import type { CatalogCategoryDto } from '../../../../shared/contracts/catalog/category';

type ProductWithRelations = Product & {
  category?: Category | null;
  sareeDetails?: SareeDetails | null;
  media?: ProductMedia[];
  colors?: ProductColor[];
  occasions?: ProductOccasion[];
};

function mapCategory(category: Category): CatalogCategoryDto {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    parentCategoryId: category.parentCategoryId,
  };
}

function mapSareeDetails(details: SareeDetails): CatalogSareeDetailsDto {
  return {
    fabric: details.fabric,
    weave: details.weave,
    zariType: details.zariType,
    motif: details.motif,
    region: details.region,
    artisanName: details.artisanName,
    certificateType: details.certificateType,
    certificateNumber: details.certificateNumber,
    length: details.length,
    width: details.width,
    blousePiece: details.blousePiece,
    washCare: details.washCare,
  };
}

function mapMedia(media: ProductMedia): CatalogMediaDto {
  return {
    id: media.id,
    mediaType: media.mediaType,
    url: media.url,
    altText: media.altText,
  };
}

export function sortAndSelectMedia(mediaList: ProductMedia[]): {
  primary: CatalogMediaDto | null;
  ordered: CatalogMediaDto[];
} {
  if (!mediaList || mediaList.length === 0) {
    return { primary: null, ordered: [] };
  }

  const orderedList = [...mediaList].sort((a, b) => a.sortOrder - b.sortOrder);
  
  const primaryItem = orderedList.find(m => m.isPrimary) || orderedList[0];
  
  return {
    primary: primaryItem ? mapMedia(primaryItem) : null,
    ordered: orderedList.map(mapMedia),
  };
}

export function mapProductToSummary(product: ProductWithRelations): CatalogProductSummary {
  const { primary } = sortAndSelectMedia(product.media || []);
  
  return {
    id: product.id,
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    price: {
      amountMinor: product.priceMinor.toString(),
      currency: product.currency as any, // CurrencyCode string
    },
    category: product.category ? mapCategory(product.category) : null,
    saree: product.sareeDetails ? mapSareeDetails(product.sareeDetails) : null,
    primaryMedia: primary,
    colors: product.colors?.map((c: any) => c.name) || [],
    occasions: product.occasions?.map((o: any) => o.name) || [],
    createdAt: product.createdAt.toISOString(),
  };
}

export function mapProductToDetail(product: ProductWithRelations): CatalogProductDetail {
  const { ordered } = sortAndSelectMedia(product.media || []);

  return {
    id: product.id,
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    longDescription: product.longDescription,
    price: {
      amountMinor: product.priceMinor.toString(),
      currency: product.currency as any,
    },
    category: product.category ? mapCategory(product.category) : null,
    saree: product.sareeDetails ? mapSareeDetails(product.sareeDetails) : null,
    media: ordered,
    colors: product.colors?.map((c: any) => c.name) || [],
    occasions: product.occasions?.map((o: any) => o.name) || [],
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    createdAt: product.createdAt.toISOString(),
  };
}

export function mapCategoryToDto(category: Category): CatalogCategoryDto {
  return mapCategory(category);
}
