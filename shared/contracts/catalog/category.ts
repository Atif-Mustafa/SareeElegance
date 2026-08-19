export interface CatalogCategoryDto {
  id: string;
  name: string;
  slug: string;
  parentCategoryId: string | null;
}
