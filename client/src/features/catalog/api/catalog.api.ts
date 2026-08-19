import { CatalogQuery } from '../../../../../shared/contracts/catalog/filters';
import { ApiPaginatedSuccess } from '../../../../../shared/contracts/api/pagination';
import { CatalogProductSummary, CatalogProductDetail } from '../../../../../shared/contracts/catalog/product';
import { CatalogCategoryDto } from '../../../../../shared/contracts/catalog/category';

class ApiError extends Error {
  constructor(public status: number, public data: any) {
    super(data?.detail || 'An API error occurred');
  }
}

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData);
  }

  const data = await response.json();
  if (data.success && data.pagination) {
    return data as T;
  }
  return data.data as T;
}

export const catalogApi = {
  getProducts: async (query?: CatalogQuery) => {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, String(v)));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<ApiPaginatedSuccess<CatalogProductSummary>>(`/api/v1/products${queryString}`);
  },

  getProductBySlug: async (slug: string) => {
    return fetchApi<CatalogProductDetail>(`/api/v1/products/${slug}`);
  },

  getCategories: async () => {
    return fetchApi<CatalogCategoryDto[]>('/api/v1/categories');
  },
};
