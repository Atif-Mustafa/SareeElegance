import { create } from 'zustand';
import {
  Currency,
  Product,
  CartItem,
  CustomizationSelection,
  FilterState,
  Order,
  BlouseMeasurement,
  VideoAppointment,
  ColorOption
} from '../types';
import { mockProducts, currencyRates } from '@/features/catalog/data/mockData';
import { LanguageCode, t as translateHelper } from '../lib/i18n';
import { cartApi } from '@/features/cart/api/cart.api';
import { authApi } from '@/features/auth/api/auth.api';
import { customerApi } from '@/features/account/api/customer.api';
import { CustomerDto, CustomerAddressDto } from '../../../shared/contracts/auth/auth.dto';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface StoreState {
  // Language & Translation
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;

  // Currency
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (amountINR: number) => string;

  // Products
  activeCategory: string;
  setActiveCategory: (cat: string) => void;

  // Cart
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (
    product: Product,
    color: ColorOption,
    customization: CustomizationSelection,
    quantity?: number
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  updateCartCustomization: (cartItemId: string, customization: CustomizationSelection) => void;
  clearCart: () => void;

  // Cart Server Validation
  validatedSubtotal: { amountMinor: string; currency: string } | null;
  isCartValidating: boolean;
  cartValidationStatus: 'valid' | 'stale' | 'invalid';
  cartValidationReason?: string;
  validateServerCart: () => Promise<void>;
  markCartStale: () => void;

  couponCode: string;
  couponDiscountPercent: number;
  applyCoupon: (code: string) => boolean;

  // Wishlist
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;

  // Filters
  filters: FilterState;
  setFilters: (fn: (prev: FilterState) => FilterState) => void;
  resetFilters: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Video Shopping Modal
  isVideoModalOpen: boolean;
  setIsVideoModalOpen: (open: boolean) => void;
  videoAppointments: VideoAppointment[];
  bookVideoAppointment: (appointment: Omit<VideoAppointment, 'id' | 'status'>) => void;

  // Silk Glossary Modal
  isGlossaryModalOpen: boolean;
  setIsGlossaryModalOpen: (open: boolean) => void;
  glossaryFocusTerm: string | null;
  openGlossaryModal: (term?: string) => void;

  // Account / Profiles / Orders
  currentUser: CustomerDto | null;
  setCurrentUser: (user: CustomerDto | null) => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  fetchCurrentUser: () => Promise<void>;
  logoutUser: () => Promise<void>;
  savedAddresses: CustomerAddressDto[];
  fetchAddresses: () => Promise<void>;
  serverOrders: any[];
  isServerOrdersLoading: boolean;
  fetchServerOrders: () => Promise<void>;
  userOrders: Order[];
  placeOrder: (orderData: Omit<Order, 'orderId' | 'date'>) => Order;
  initializeCheckout: (address?: any) => Promise<any>;
  checkoutSession: any | null;
  blouseProfiles: BlouseMeasurement[];
  saveBlouseProfile: (profile: BlouseMeasurement) => void;

  // Toast notifications
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const defaultFilterState: FilterState = {
  category: 'all',
  fabrics: [],
  occasions: [],
  zariTypes: [],
  colors: [],
  priceRange: [10000, 60000],
  inStockOnly: false,
  silkMarkOnly: false,
  sortBy: 'bestseller'
};

const defaultBlouseProfiles: BlouseMeasurement[] = [
  {
    id: 'blouse-prof-1',
    profileName: 'Bridal Fit (Padded)',
    bust: 36,
    underBust: 31,
    waist: 28,
    shoulder: 14.5,
    frontNeckDepth: 7.5,
    backNeckDepth: 10,
    sleeveLength: 11,
    armHole: 16,
    style: 'Padded Royal Cut'
  }
];

export const useStore = create<StoreState>((set, get) => ({
  language: 'en',
  setLanguage: (language) => {
    set({ language });
    const langObj = translateHelper('chat.welcome', language);
    get().addToast(`Language updated`, 'info');
  },
  t: (key: string) => translateHelper(key, get().language),

  currency: 'INR',
  setCurrency: (currency) => set({ currency }),
  formatPrice: (amountINR: number) => {
    const curr = get().currency;
    const rateInfo = currencyRates[curr] || currencyRates.INR;
    const converted = amountINR / rateInfo.rateToINR;
    if (curr === 'INR') {
      return `${rateInfo.symbol}${Math.round(converted).toLocaleString('en-IN')}`;
    }
    return `${rateInfo.symbol}${converted.toFixed(2)}`;
  },

  activeCategory: 'all',
  setActiveCategory: (cat) => set({ activeCategory: cat }),

  // Cart
  cart: [],
  isCartOpen: false,

  validatedSubtotal: null,
  isCartValidating: false,
  cartValidationStatus: 'valid',
  cartValidationReason: undefined,
  markCartStale: () => set({ cartValidationStatus: 'stale', validatedSubtotal: null }),
  validateServerCart: async () => {
    const { cart } = get();
    if (cart.length === 0) {
      set({ validatedSubtotal: { amountMinor: '0', currency: 'INR' }, cartValidationStatus: 'valid', cartValidationReason: undefined });
      return;
    }
    set({ isCartValidating: true });
    try {
      const response = await cartApi.validateCart({
        lines: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      });
      if (response.valid) {
        set({
          validatedSubtotal: response.totals.subtotal,
          cartValidationStatus: 'valid',
          cartValidationReason: undefined,
          isCartValidating: false
        });
      } else {
        set({
          validatedSubtotal: response.totals.subtotal,
          cartValidationStatus: 'invalid',
          cartValidationReason: response.reason,
          isCartValidating: false
        });
      }
    } catch (e) {
      set({ cartValidationStatus: 'invalid', cartValidationReason: 'SERVER_ERROR', isCartValidating: false, validatedSubtotal: null });
    }
  },

  setIsCartOpen: (isCartOpen) => set({ isCartOpen }),
  addToCart: (product, color, customization, quantity = 1) => {
    const cart = get().cart;
    // Calculate customization extra cost in INR
    let extraCost = 0;
    if (customization.fallAndPico) extraCost += 150;
    if (customization.blouseOption === 'standard') extraCost += 1200;
    if (customization.blouseOption === 'custom') extraCost += 1800;
    if (customization.petticoatOption) extraCost += 499;

    const itemPrice = product.priceINR + extraCost;
    const customizationHash = JSON.stringify({
      colorName: color.name,
      customization
    });
    const cartItemId = `${product.id}-${customizationHash}`;

    const existingIndex = cart.findIndex((item) => item.id === cartItemId);
    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += quantity;
      set({ cart: updatedCart, isCartOpen: true });
    } else {
      const newItem: CartItem = {
        id: cartItemId,
        product,
        selectedColor: color,
        quantity,
        customization,
        itemTotalPriceINR: itemPrice
      };
      set({ cart: [...cart, newItem], isCartOpen: true });
    }
    get().markCartStale();
    get().addToast(`Added "${product.title}" to your shopping bag`, 'success');
  },

  removeFromCart: (cartItemId) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== cartItemId)
    }));
    get().markCartStale();
    get().addToast('Item removed from cart', 'info');
  },

  updateCartQuantity: (cartItemId, delta) => {
    set((state) => ({
      cart: state.cart
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    }));
    get().markCartStale();
  },

  updateCartCustomization: (cartItemId, customization) => {
    set((state) => ({
      cart: state.cart.map((item) => {
        if (item.id === cartItemId) {
          let extraCost = 0;
          if (customization.fallAndPico) extraCost += 150;
          if (customization.blouseOption === 'standard') extraCost += 1200;
          if (customization.blouseOption === 'custom') extraCost += 1800;
          if (customization.petticoatOption) extraCost += 499;
          return {
            ...item,
            customization,
            itemTotalPriceINR: item.product.priceINR + extraCost
          };
        }
        return item;
      })
    }));
    get().markCartStale();
  },

  clearCart: () => { set({ cart: [], couponCode: '', couponDiscountPercent: 0 }); get().markCartStale(); },
  couponCode: '',
  couponDiscountPercent: 0,
  applyCoupon: (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'ROYALSILK10') {
      set({ couponCode: cleanCode, couponDiscountPercent: 10 });
      get().addToast('Coupon ROYALSILK10 applied! 10% discount added.', 'success');
      return true;
    } else if (cleanCode === 'FESTIVE15') {
      set({ couponCode: cleanCode, couponDiscountPercent: 15 });
      get().addToast('Festive Coupon applied! 15% discount added.', 'success');
      return true;
    } else {
      get().addToast('Invalid coupon code. Try ROYALSILK10 or FESTIVE15', 'error');
      return false;
    }
  },

  // Wishlist
  wishlist: [mockProducts[0]], // pre-populated with 1 favorite for immediate satisfaction
  toggleWishlist: (product) => {
    const wishlist = get().wishlist;
    const exists = wishlist.some((p) => p.id === product.id);
    if (exists) {
      set({ wishlist: wishlist.filter((p) => p.id !== product.id) });
      get().addToast(`Removed "${product.title}" from wishlist`, 'info');
    } else {
      set({ wishlist: [...wishlist, product] });
      get().addToast(`Saved "${product.title}" to your wishlist`, 'success');
    }
  },
  isInWishlist: (productId) => {
    return get().wishlist.some((p) => p.id === productId);
  },

  // Filters
  filters: defaultFilterState,
  setFilters: (fn) => set((state) => ({ filters: fn(state.filters) })),
  resetFilters: () => set({ filters: defaultFilterState }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  isSearchOpen: false,
  setIsSearchOpen: (isSearchOpen) => set({ isSearchOpen }),

  // Video Shopping Modal
  isVideoModalOpen: false,
  setIsVideoModalOpen: (isVideoModalOpen) => set({ isVideoModalOpen }),
  videoAppointments: [],
  bookVideoAppointment: (apptData) => {
    const newAppt: VideoAppointment = {
      ...apptData,
      id: `VA-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'CONFIRMED'
    };
    set((state) => ({
      videoAppointments: [newAppt, ...state.videoAppointments],
      isVideoModalOpen: false
    }));
    get().addToast(`Video Shopping booked for ${apptData.date} at ${apptData.timeSlot}! Details sent via SMS/WhatsApp.`, 'success');
  },

  // Silk Glossary Modal
  isGlossaryModalOpen: false,
  setIsGlossaryModalOpen: (isGlossaryModalOpen) => set({ isGlossaryModalOpen }),
  glossaryFocusTerm: null,
  openGlossaryModal: (term) => set({ isGlossaryModalOpen: true, glossaryFocusTerm: term || null }),

  // User Account & Orders
  userOrders: [
    {
      orderId: 'SE-894102',
      date: '20 July 2026',
      items: [
        {
          id: 'ord-item-1',
          product: mockProducts[0],
          selectedColor: mockProducts[0].colors[0],
          quantity: 1,
          customization: {
            fallAndPico: true,
            blouseOption: 'custom',
            customMeasurements: defaultBlouseProfiles[0],
            petticoatOption: true,
            petticoatFabric: 'Cotton Satin'
          },
          itemTotalPriceINR: 30799
        }
      ],
      subtotalINR: 28500,
      discountINR: 2850,
      shippingINR: 0,
      taxINR: 1282,
      totalINR: 26932,
      currency: 'INR',
      currencyAmount: 26932,
      shippingAddress: {
        fullName: 'Priya Sharma',
        email: 'priya.s@example.com',
        phone: '+91 98765 43210',
        addressLine1: '402 Regency Crest, Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050',
        country: 'India'
      },
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      orderStatus: 'SHIPPED',
      trackingNumber: 'DEL-99201481',
      carrierName: 'BlueDart Express Priority Air',
      carrierUrl: 'https://www.bluedart.com/tracking',
      estimatedDelivery: '30 July 2026 (Thursday, 2:00 PM - 6:00 PM)',
      checkpoints: [
        {
          id: 'chk-1',
          title: 'Order Confirmed & Silk Allocation',
          location: 'Varanasi Weaving Guild',
          timestamp: '20 July 2026, 10:30 AM',
          completed: true,
          description: 'Pure Mulberry silk yarns reserved and allocated to master weaver'
        },
        {
          id: 'chk-2',
          title: 'Handloom Crafting & Blouse Tailoring',
          location: 'Atelier Workshop, Varanasi',
          timestamp: '23 July 2026, 03:15 PM',
          completed: true,
          description: 'Zari weaving completed, fall & pico finished, padded blouse tailored'
        },
        {
          id: 'chk-3',
          title: 'Silk Mark Inspection & Hologram Affixed',
          location: 'Quality Control Hub, Varanasi',
          timestamp: '26 July 2026, 11:00 AM',
          completed: true,
          description: 'Passed 100% pure silk purity lab test. Certificate #SM-88391 attached'
        },
        {
          id: 'chk-4',
          title: 'Departed Regional Distribution Center',
          location: 'Air Hub, Mumbai',
          timestamp: '28 July 2026, 06:45 AM',
          completed: true,
          active: true,
          description: 'In transit via BlueDart Flight BD-402. Dispatched to local courier facility'
        },
        {
          id: 'chk-5',
          title: 'Out for Delivery & Client Handover',
          location: 'Bandra West Courier Hub, Mumbai',
          timestamp: 'Expected 30 July 2026',
          completed: false,
          description: 'Delivery executive assigned for doorstep delivery with OTP verification'
        }
      ]
    },
    {
      orderId: 'SE-783910',
      date: '15 July 2026',
      items: [
        {
          id: 'ord-item-2',
          product: mockProducts[1],
          selectedColor: mockProducts[1].colors[0],
          quantity: 1,
          customization: {
            fallAndPico: true,
            blouseOption: 'unstitched',
            petticoatOption: false
          },
          itemTotalPriceINR: 42150
        }
      ],
      subtotalINR: 42000,
      discountINR: 0,
      shippingINR: 0,
      taxINR: 1890,
      totalINR: 43890,
      currency: 'INR',
      currencyAmount: 43890,
      shippingAddress: {
        fullName: 'Priya Sharma',
        email: 'priya.s@example.com',
        phone: '+91 98765 43210',
        addressLine1: '402 Regency Crest, Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050',
        country: 'India'
      },
      paymentMethod: 'CARD',
      paymentStatus: 'PAID',
      orderStatus: 'HANDWOVEN_PREPARATION',
      trackingNumber: 'DEL-88310922',
      carrierName: 'DHL Express India',
      carrierUrl: 'https://www.dhl.com/track',
      estimatedDelivery: '05 August 2026',
      checkpoints: [
        {
          id: 'chk-21',
          title: 'Order Received & Artisan Assigned',
          location: 'Kanchipuram Heritage Guild',
          timestamp: '15 July 2026, 02:10 PM',
          completed: true,
          description: 'Master Weaver Srinivas assigned for 3-ply zari weave'
        },
        {
          id: 'chk-22',
          title: 'Loom Weaving & Zari Interlocking',
          location: 'Kanchipuram Loom Workshop',
          timestamp: '22 July 2026, 05:00 PM',
          completed: true,
          active: true,
          description: 'Korvai pallu weaving in progress (75% completed)'
        },
        {
          id: 'chk-23',
          title: 'Silk Mark Purity Verification',
          location: 'Kanchipuram Test Lab',
          timestamp: 'Scheduled 31 July 2026',
          completed: false,
          description: 'Gold & silver purity testing before packaging'
        },
        {
          id: 'chk-24',
          title: 'Handover to DHL Express',
          location: 'Chennai Air Hub',
          timestamp: 'Scheduled 02 August 2026',
          completed: false,
          description: 'Air shipment to final destination'
        }
      ]
    },
    {
      orderId: 'SE-651204',
      date: '02 June 2026',
      items: [
        {
          id: 'ord-item-3',
          product: mockProducts[2],
          selectedColor: mockProducts[2].colors[0],
          quantity: 1,
          customization: {
            fallAndPico: true,
            blouseOption: 'standard',
            petticoatOption: true,
            petticoatFabric: 'Cotton Satin'
          },
          itemTotalPriceINR: 19800
        }
      ],
      subtotalINR: 18500,
      discountINR: 1000,
      shippingINR: 0,
      taxINR: 832,
      totalINR: 18332,
      currency: 'INR',
      currencyAmount: 18332,
      shippingAddress: {
        fullName: 'Priya Sharma',
        email: 'priya.s@example.com',
        phone: '+91 98765 43210',
        addressLine1: '402 Regency Crest, Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050',
        country: 'India'
      },
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
      trackingNumber: 'DEL-44120982',
      carrierName: 'BlueDart Express',
      carrierUrl: 'https://www.bluedart.com',
      estimatedDelivery: '07 June 2026',
      checkpoints: [
        {
          id: 'chk-31',
          title: 'Order Confirmed',
          location: 'Varanasi',
          timestamp: '02 June 2026',
          completed: true
        },
        {
          id: 'chk-32',
          title: 'Handcrafted & Quality Checked',
          location: 'Varanasi',
          timestamp: '04 June 2026',
          completed: true
        },
        {
          id: 'chk-33',
          title: 'In Transit Air',
          location: 'Mumbai Hub',
          timestamp: '06 June 2026',
          completed: true
        },
        {
          id: 'chk-34',
          title: 'Delivered to Customer',
          location: 'Bandra West, Mumbai',
          timestamp: '07 June 2026, 01:45 PM',
          completed: true,
          active: true,
          description: 'Delivered & signed by Priya Sharma'
        }
      ]
    }
  ],
  checkoutSession: null,
  initializeCheckout: async (shippingAddress) => {
    try {
      const state = get();
      const cartForValidation = {
        lines: state.cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      };
      const idempotencyKey = 'checkout_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const response = await fetch('/api/v1/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idempotencyKey,
          cart: cartForValidation,
          shippingAddress
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to initialize checkout');
      }
      const data = await response.json();
      set({ checkoutSession: data });
      return data;
    } catch (error: any) {
      get().addToast(error.message, 'error');
      throw error;
    }
  },
  placeOrder: (orderData) => {
    const newOrder: Order = {
      ...orderData,
      orderId: `SE-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    };
    set((state) => ({
      userOrders: [newOrder, ...state.userOrders]
    }));
    get().clearCart();
    get().addToast(`Order ${newOrder.orderId} successfully placed!`, 'success');
    return newOrder;
  },

  // Account / Profiles / Orders
  currentUser: null,
  setCurrentUser: (currentUser) => set({ currentUser }),
  isAuthModalOpen: false,
  authModalMode: 'login',
  openAuthModal: (authModalMode = 'login') => set({ isAuthModalOpen: true, authModalMode }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  fetchCurrentUser: async () => {
    try {
      const data = await authApi.getMe();
      if (data?.customer) {
        set({ currentUser: data.customer });
        get().fetchAddresses();
        get().fetchServerOrders();
      } else {
        set({ currentUser: null, serverOrders: [], savedAddresses: [] });
      }
    } catch {
      set({ currentUser: null, serverOrders: [], savedAddresses: [] });
    }
  },

  logoutUser: async () => {
    try {
      await authApi.logout();
      set({ currentUser: null, serverOrders: [], savedAddresses: [] });
      get().addToast('Signed out of your account', 'info');
    } catch (e) {
      set({ currentUser: null, serverOrders: [], savedAddresses: [] });
    }
  },

  savedAddresses: [],
  fetchAddresses: async () => {
    try {
      if (!get().currentUser) return;
      const data = await customerApi.getAddresses();
      set({ savedAddresses: data.addresses });
    } catch {
      // Ignored if unauthenticated
    }
  },

  serverOrders: [],
  isServerOrdersLoading: false,
  fetchServerOrders: async () => {
    try {
      if (!get().currentUser) return;
      set({ isServerOrdersLoading: true });
      const data = await customerApi.getOrders(1, 20);
      set({ serverOrders: data.orders, isServerOrdersLoading: false });
    } catch {
      set({ isServerOrdersLoading: false });
    }
  },

  blouseProfiles: defaultBlouseProfiles,
  saveBlouseProfile: (profile) => {
    const existing = get().blouseProfiles;
    const newProfile = {
      ...profile,
      id: profile.id || `blouse-prof-${Date.now()}`
    };
    set({
      blouseProfiles: [
        ...existing.filter((p) => p.id !== newProfile.id),
        newProfile
      ]
    });
    get().addToast(`Saved blouse measurement profile "${profile.profileName}"`, 'success');
  },

  // Toasts
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  }
}));
