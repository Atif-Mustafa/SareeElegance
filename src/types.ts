export type Currency = 'INR' | 'USD' | 'EUR';

export interface CurrencyRate {
  code: Currency;
  symbol: string;
  rateToINR: number; // 1 USD = 83.5 INR, 1 EUR = 91 INR
}

export type ZariType = 'Real Gold/Silver Zari' | 'Tested Zari' | 'Antique Metallic Zari' | 'Resham Threadwork';

export type FabricType = 'Banarasi Katan Silk' | 'Kanjivaram Silk' | 'Tissue Silk' | 'Organza Silk' | 'Georgette Silk' | 'Chiffon' | 'Chanderi';

export type OccasionType = 'Bridal' | 'Festive' | 'Reception & Party' | 'Casual Luxury' | 'Cocktail';

export interface ColorOption {
  name: string;
  hex: string;
  image?: string;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  location: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: 'banarasi' | 'kanjivaram' | 'tissue-silk' | 'ready-to-wear' | 'collections';
  categoryLabel: string;
  fabric: FabricType;
  weaveType: string;
  zariType: ZariType;
  occasion: OccasionType;
  priceINR: number;
  compareAtPriceINR?: number;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  isCelebrityChoice?: boolean;
  silkMarkCertified: boolean;
  inStock: boolean;
  stockCount: number;
  images: string[];
  colors: ColorOption[];
  primaryColorHex: string;
  sku: string;
  description: string;
  craftStory: string;
  specifications: {
    length: string; // e.g. "5.5 Meters"
    width: string;  // e.g. "44 Inches"
    blousePiece: string; // e.g. "Included (80cm - Unstitched Katan Silk)"
    washCare: string;
    weight: string;
  };
  rating: number;
  reviewsCount: number;
  reviews?: Review[];
}

export interface BlouseMeasurement {
  id?: string;
  profileName: string; // e.g. "Bridal Fit", "Standard Medium"
  bust: number; // inches
  underBust: number;
  waist: number;
  shoulder: number;
  frontNeckDepth: number;
  backNeckDepth: number;
  sleeveLength: number;
  armHole: number;
  style: 'Padded Royal Cut' | 'Boat Neck Classic' | 'Deep V-Back' | 'Sleeveless High Neck' | 'Standard Round';
}

export interface CustomizationSelection {
  fallAndPico: boolean; // +150 INR or FREE
  blouseOption: 'unstitched' | 'standard' | 'custom';
  standardBlouseSize?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  customMeasurements?: BlouseMeasurement;
  petticoatOption: boolean; // +499 INR
  petticoatFabric?: 'Cotton Satin' | 'Shimmer Silk';
  petticoatColor?: string;
  specialInstructions?: string;
}

export interface CartItem {
  id: string; // unique item id in cart (product.id + hash of customizations)
  product: Product;
  selectedColor: ColorOption;
  quantity: number;
  customization: CustomizationSelection;
  itemTotalPriceINR: number;
}

export interface FilterState {
  category: string;
  fabrics: FabricType[];
  occasions: OccasionType[];
  zariTypes: ZariType[];
  colors: string[];
  priceRange: [number, number]; // in INR
  inStockOnly: boolean;
  silkMarkOnly: boolean;
  sortBy: 'price-asc' | 'price-desc' | 'newest' | 'bestseller' | 'rating';
}

export interface OrderAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface TrackingCheckpoint {
  id: string;
  title: string;
  location: string;
  timestamp: string;
  completed: boolean;
  active?: boolean;
  description?: string;
}

export interface Order {
  orderId: string;
  date: string;
  items: CartItem[];
  subtotalINR: number;
  discountINR: number;
  shippingINR: number;
  taxINR: number;
  totalINR: number;
  currency: Currency;
  currencyAmount: number;
  shippingAddress: OrderAddress;
  paymentMethod: 'UPI' | 'CARD' | 'NETBANKING' | 'COD';
  paymentStatus: 'PAID' | 'PENDING' | 'COD_VERIFIED';
  orderStatus: 'PROCESSING' | 'HANDWOVEN_PREPARATION' | 'SHIPPED' | 'DELIVERED';
  trackingNumber?: string;
  carrierName?: string;
  carrierUrl?: string;
  estimatedDelivery: string;
  checkpoints?: TrackingCheckpoint[];
}

export interface VideoAppointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferredPlatform: 'WhatsApp Video' | 'Zoom Call';
  date: string;
  timeSlot: string;
  sareeInterest: string[];
  notes?: string;
  status: 'CONFIRMED' | 'PENDING';
}
