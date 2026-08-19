import { CatalogProductSummary, CatalogProductDetail } from '../../../../../shared/contracts/catalog/product';
import { Product, ColorOption, Review } from '@/types';

function mapColors(colors: string[]): ColorOption[] {
  if (!colors || colors.length === 0) {
    return [{ name: 'Standard', hex: '#E5E7EB' }];
  }
  return colors.map(c => ({
    name: c,
    hex: '#E5E7EB'
  }));
}

export function mapSummaryToLegacyProduct(summary: CatalogProductSummary): Product {
  return {
    id: summary.id,
    slug: summary.slug,
    title: summary.name,
    subtitle: summary.shortDescription || '',
    category: (summary.category?.slug as any) || 'banarasi',
    categoryLabel: summary.category?.name || '',
    fabric: (summary.saree?.fabric as any) || 'Banarasi Katan Silk',
    weaveType: summary.saree?.weave || '',
    zariType: (summary.saree?.zariType as any) || 'Real Gold/Silver Zari',
    occasion: (summary.occasions?.[0] as any) || 'Festive',
    priceINR: Math.round(Number(summary.price.amountMinor) / 100),
    priceMinor: summary.price.amountMinor,
    currency: summary.price.currency,
    compareAtPriceINR: undefined,
    silkMarkCertified: !!summary.saree?.certificateNumber,
    images: summary.primaryMedia ? [summary.primaryMedia.url] : [],
    colors: mapColors(summary.colors),
    primaryColorHex: '#E5E7EB',
    sku: summary.sku,
    description: summary.shortDescription || '',
    craftStory: '',
    specifications: {
      length: summary.saree?.length || '',
      width: summary.saree?.width || '',
      blousePiece: summary.saree?.blousePiece ? 'Included' : 'None',
      washCare: summary.saree?.washCare || '',
      weight: ''
    },
    rating: 0,
    reviewsCount: 0
  };
}

export function mapDetailToLegacyProduct(detail: CatalogProductDetail): Product {
  const summaryProduct = mapSummaryToLegacyProduct(detail as any);
  
  return {
    ...summaryProduct,
    description: detail.longDescription || summaryProduct.description,
    images: detail.media && detail.media.length > 0 
      ? detail.media.map(m => m.url) 
      : summaryProduct.images,
  };
}
