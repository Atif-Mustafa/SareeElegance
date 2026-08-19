import type { Money } from '../money/money';
import type { CatalogCategoryDto } from './category';

export interface CatalogMediaDto {
  id: string;
  mediaType: string;
  url: string;
  altText: string | null;
}

export interface CatalogSareeDetailsDto {
  fabric: string;
  weave: string;
  zariType?: string | null;
  motif?: string | null;
  region?: string | null;
  artisanName?: string | null;
  certificateType?: string | null;
  certificateNumber?: string | null;
  length?: string | null;
  width?: string | null;
  blousePiece?: string | null;
  washCare?: string | null;
}

export interface CatalogProductSummary {
  id: string;
  sku: string;
  slug: string;
  name: string;
  shortDescription: string;
  price: Money;
  category: CatalogCategoryDto | null;
  saree: CatalogSareeDetailsDto | null;
  primaryMedia: CatalogMediaDto | null;
  colors: string[];
  occasions: string[];
  createdAt: string; // ISO 8601 string
}

export interface CatalogProductDetail {
  id: string;
  sku: string;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  price: Money;
  category: CatalogCategoryDto | null;
  saree: CatalogSareeDetailsDto | null;
  media: CatalogMediaDto[];
  colors: string[];
  occasions: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string; // ISO 8601 string
}
