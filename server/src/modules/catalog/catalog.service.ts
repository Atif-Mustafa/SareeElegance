import { catalogRepository } from './catalog.repository';
import {
  mapProductToSummary,
  mapProductToDetail,
  mapCategoryToDto,
} from './catalog.mapper';
import { CatalogQuery } from '../../../../shared/contracts/catalog/filters';
import { ApiPaginatedSuccess } from '../../../../shared/contracts/api/pagination';
import { CatalogProductSummary, CatalogProductDetail } from '../../../../shared/contracts/catalog/product';
import type { CatalogCategoryDto } from '../../../../shared/contracts/catalog/category';
import { mockBackendCategories, mockBackendProducts, mockBackendProductDetail } from './mockBackendData';

export class CatalogService {
  async getProducts(query: CatalogQuery): Promise<ApiPaginatedSuccess<CatalogProductSummary>> {
    try {
      const { products, totalItems, page, limit } = await catalogRepository.findActiveProducts(query);
      return {
        success: true,
        data: products.map(mapProductToSummary),
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
        },
      };
    } catch (error: any) {
      console.warn("⚠️ Using mock products due to database connection error:", error.message);
      const limit = query.limit || 24;
      const page = query.page || 1;
      let data = [...mockBackendProducts];
      
      // Basic mock filtering
      if (query.category) data = data.filter(p => p.category?.slug === query.category);
      if (query.sort === 'price_asc') data.sort((a, b) => Number(a.price.amountMinor) - Number(b.price.amountMinor));
      
      return {
        success: true,
        data,
        pagination: {
          page,
          limit,
          totalItems: data.length,
          totalPages: 1,
        },
      };
    }
  }

  async getProductBySlug(slug: string): Promise<CatalogProductDetail | null> {
    try {
      const product = await catalogRepository.findActiveProductBySlug(slug);
      if (!product) return null;
      return mapProductToDetail(product);
    } catch (error: any) {
      console.warn("⚠️ Using mock product details due to database connection error:", error.message);
      if (mockBackendProductDetail.slug === slug) return mockBackendProductDetail;
      const found = mockBackendProducts.find(p => p.slug === slug);
      if (found) {
        return {
          ...found,
          longDescription: found.shortDescription || '',
          media: found.primaryMedia ? [found.primaryMedia] : [],
          seoTitle: found.name,
          seoDescription: found.shortDescription || ''
        };
      }
      return null;
    }
  }

  
  async getActiveProductsByIds(ids: string[]): Promise<any[]> {
    try {
      const products = await catalogRepository.findActiveProductsByIds(ids);
      return products;
    } catch (error: any) {
      console.warn("⚠️ Using mock products for ids due to database connection error:", error.message);
      return mockBackendProducts.filter(p => ids.includes(p.id));
    }
  }

  async getCategories(): Promise<CatalogCategoryDto[]> {
    try {
      const categories = await catalogRepository.findActiveCategories();
      if (categories.length === 0) return mockBackendCategories;
      return categories.map(mapCategoryToDto);
    } catch (error: any) {
      console.warn("⚠️ Using mock categories due to database connection error:", error.message);
      return mockBackendCategories;
    }
  }
}

export const catalogService = new CatalogService();
