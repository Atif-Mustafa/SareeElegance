export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiPaginatedSuccess<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}
