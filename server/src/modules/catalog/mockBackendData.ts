import { CatalogProductSummary, CatalogProductDetail } from '../../../../shared/contracts/catalog/product';
import type { CatalogCategoryDto } from '../../../../shared/contracts/catalog/category';

export const mockBackendCategories: CatalogCategoryDto[] = [
  { id: 'banarasi', name: 'Banarasi Katan Silk', slug: 'banarasi', parentCategoryId: null },
  { id: 'kanjivaram', name: 'Kanjivaram Pure Zari', slug: 'kanjivaram', parentCategoryId: null },
  { id: 'tissue-silk', name: 'Tissue Silk Collection', slug: 'tissue-silk', parentCategoryId: null },
  { id: 'chanderi', name: 'Chanderi Handloom', slug: 'chanderi', parentCategoryId: null }
];

export const mockBackendProducts: CatalogProductSummary[] = [
  {
    id: 'prod-1',
    sku: 'BNR-KAT-001',
    slug: 'crimson-red-bridal-banarasi',
    name: 'Crimson Red Bridal Banarasi Katan Silk Saree',
    shortDescription: 'Handwoven in Varanasi with Kadwa technique.',
    price: { amountMinor: '2450000', currency: 'INR' }, // 24500.00
    category: mockBackendCategories[0],
    saree: {
      fabric: 'Katan Silk',
      weave: 'Kadwa Banarasi',
      zariType: 'Pure Silver Zari with Gold Plating',
      motif: 'Shikargah',
      region: 'Varanasi, Uttar Pradesh',
      artisanName: 'Master Weaver Ansari',
      certificateType: 'Silk Mark India',
      certificateNumber: 'SM-2026-BAN-8392',
      length: '5.5 meters',
      width: '45 inches',
      blousePiece: '1 meter, Unstitched',
      washCare: 'Dry Clean Only',
    },
    primaryMedia: { id: 'm1', mediaType: 'IMAGE', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800', altText: 'Red Saree' },
    colors: ['Red'],
    occasions: ['Wedding'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    sku: 'KAN-PZ-002',
    slug: 'midnight-blue-korvai-kanjivaram',
    name: 'Midnight Blue Korvai Kanjivaram',
    shortDescription: 'Heavy mulberry silk with temple borders.',
    price: { amountMinor: '3200000', currency: 'INR' },
    category: mockBackendCategories[1],
    saree: {
      fabric: 'Mulberry Silk',
      weave: 'Korvai Kanjivaram',
      zariType: 'Tested Silver Zari',
      motif: 'Temple Border',
      region: 'Kanchipuram, Tamil Nadu',
      artisanName: 'Selvam Handlooms',
      certificateType: 'Silk Mark India',
      certificateNumber: 'SM-2026-KAN-1122',
      length: '5.5 meters',
      width: '48 inches',
      blousePiece: '0.8 meter, Unstitched',
      washCare: 'Dry Clean Only',
    },
    primaryMedia: { id: 'm2', mediaType: 'IMAGE', url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800', altText: 'Blue Saree' },
    colors: ['Blue'],
    occasions: ['Reception'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    sku: 'TIS-003',
    slug: 'rose-gold-tissue-silk',
    name: 'Rose Gold Tissue Silk Saree',
    shortDescription: 'Metallic sheen perfect for cocktail evenings.',
    price: { amountMinor: '1850000', currency: 'INR' },
    category: mockBackendCategories[2],
    saree: {
      fabric: 'Tissue Silk',
      weave: 'Metallic Weave',
      zariType: 'Copper Zari',
      motif: 'Floral Jaal',
      region: 'Bhagalpur, Bihar',
      artisanName: 'Weavers Co-op',
      certificateType: null,
      certificateNumber: null,
      length: '5.5 meters',
      width: '45 inches',
      blousePiece: '1 meter, Unstitched',
      washCare: 'Dry Clean Only',
    },
    primaryMedia: { id: 'm3', mediaType: 'IMAGE', url: 'https://images.unsplash.com/photo-1583391733958-62524d47d480?auto=format&fit=crop&q=80&w=800', altText: 'Rose Gold Saree' },
    colors: ['Gold', 'Pink'],
    occasions: ['Party'],
    createdAt: new Date().toISOString(),
  }
];

export const mockBackendProductDetail: CatalogProductDetail = {
  ...mockBackendProducts[0],
  longDescription: 'This stunning piece represents the pinnacle of Banarasi handloom weaving. It takes three master weavers over 45 days to weave a single Kadwa pattern Saree.',
  media: [
    { id: 'm1', mediaType: 'IMAGE', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800', altText: 'Red Saree Primary' },
    { id: 'm4', mediaType: 'IMAGE', url: 'https://images.unsplash.com/photo-1583391733958-62524d47d480?auto=format&fit=crop&q=80&w=800', altText: 'Detail view' }
  ],
  seoTitle: 'Buy Crimson Red Bridal Banarasi Saree | Saree Elegance',
  seoDescription: 'Shop authentic handwoven red bridal Banarasi Katan silk saree with Silk Mark India certification.',
};
