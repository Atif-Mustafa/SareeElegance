export interface CatalogFilters {
  category?: string;
  fabric?: string;
  weave?: string;
  region?: string;
  color?: string;
  occasion?: string;
  minPriceMinor?: string;
  maxPriceMinor?: string;
}

export type CatalogSortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc';

export interface CatalogQuery extends CatalogFilters {
  page?: number;
  limit?: number;
  sort?: CatalogSortOption;
}
