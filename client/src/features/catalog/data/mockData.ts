import { Product, Review } from '@/types';

export const mockReviews: Review[] = [
  {
    id: 'rev-1',
    userName: 'Radhika Sharma',
    rating: 5,
    date: '12 July 2026',
    title: 'Exquisite weave! Beyond expectation',
    comment: 'Ordered this for my brother\'s wedding reception. The gold zari lustre and weight of the pure Katan silk are stunning. The Silk Mark certification gave me complete confidence.',
    verifiedPurchase: true,
    location: 'Mumbai, Maharashtra'
  },
  {
    id: 'rev-2',
    userName: 'Ananya Rao',
    rating: 5,
    date: '28 June 2026',
    title: 'Flawless blouse stitching & fast delivery',
    comment: 'The custom blouse fitting was spot on! I submitted my measurements using their custom profile tool, and it fit like a glove. The fall and pico work was neatly done.',
    verifiedPurchase: true,
    location: 'Bengaluru, Karnataka'
  },
  {
    id: 'rev-3',
    userName: 'Dr. Meenakshi Sundaram',
    rating: 5,
    date: '04 May 2026',
    title: 'Authentic Banarasi heritage',
    comment: 'As someone who collects vintage sarees, SareeElegance delivers genuine handloom weaves with gold zari that drapes effortlessly. Highly recommend the Video Shopping option!',
    verifiedPurchase: true,
    location: 'Chennai, Tamil Nadu'
  },
  {
    id: 'rev-4',
    userName: 'Priya Patel-Singhania',
    rating: 5,
    date: '18 April 2026',
    title: 'Breathtaking Tissue Silk sheen',
    comment: 'The metallic sheen on the Tissue Silk is so royal and lightweight. Received endless compliments at the festive gathering in London. Free global shipping was super fast!',
    verifiedPurchase: true,
    location: 'London, UK'
  }
];

export const mockProducts: Product[] = [
  {
    id: 'saree-101',
    slug: 'banarasi-katan-silk-maroon-gold-kadwa-jaal',
    title: 'Royal Maroon Banarasi Katan Silk Saree',
    subtitle: 'Handcrafted Kadwa Weave with Fine Tested Gold Zari Floral Jaal',
    category: 'banarasi',
    categoryLabel: 'Banarasi Silk',
    fabric: 'Banarasi Katan Silk',
    weaveType: 'Kadwa Handloom Weave',
    zariType: 'Real Gold/Silver Zari',
    occasion: 'Bridal',
    priceINR: 28500, priceMinor: "2850000", currency: "INR",
    compareAtPriceINR: 34000,
    isBestseller: true,
    isNewArrival: false,
    isCelebrityChoice: true,
    silkMarkCertified: true,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1200'
    ],
    colors: [
      { name: 'Royal Maroon', hex: '#6B1D2F' },
      { name: 'Emerald Green', hex: '#1B4D3E' },
      { name: 'Deep Crimson', hex: '#8B0000' }
    ],
    primaryColorHex: '#6B1D2F',
    sku: 'SE-BAN-MAR-01',
    description: 'A masterpiece woven in Varanasi by master artisans. Crafted from pure 100% Katan Silk, this saree features an intricate Kadwa floral jaal in antique gold zari. The regal maroon canvas offers unmatched drape and lustre, ideal for bridal trousseaus and heritage festive celebrations.',
    craftStory: 'Kadwa is the most laborious Varanasi handloom technique where each motif is individually woven onto the fabric without any loose threads at the back. It takes over 180 artisan hours to weave this single piece.',
    specifications: {
      length: '5.5 Meters',
      width: '44 Inches',
      blousePiece: 'Included (80cm Unstitched Pure Katan Silk with Zari Border)',
      washCare: 'Dry Clean Only. Store wrapped in pure muslin fabric.',
      weight: '820 grams'
    },
    rating: 4.9,
    reviewsCount: 38,
    reviews: mockReviews
  },
  {
    id: 'saree-102',
    slug: 'kanjivaram-tissue-silk-golden-champagne-temple-border',
    title: 'Kanjivaram Pure Tissue Silk Saree in Champagne Gold',
    subtitle: 'Metallic Tissue Weave with Classic Korvai Temple Border & Antique Zari',
    category: 'tissue-silk',
    categoryLabel: 'Tissue Silk',
    fabric: 'Tissue Silk',
    weaveType: 'Korvai Double Warp Weave',
    zariType: 'Real Gold/Silver Zari',
    occasion: 'Reception & Party',
    priceINR: 32000, priceMinor: "3200000", currency: "INR",
    compareAtPriceINR: 38000,
    isBestseller: true,
    isNewArrival: true,
    isCelebrityChoice: true,
    silkMarkCertified: true,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=1200'
    ],
    colors: [
      { name: 'Champagne Gold', hex: '#E6CA65' },
      { name: 'Rose Gold', hex: '#B76E79' },
      { name: 'Silver Platinum', hex: '#E5E4E2' }
    ],
    primaryColorHex: '#E6CA65',
    sku: 'SE-TIS-GLD-02',
    description: 'Reflecting radiant luxury, this Tissue Silk saree weaves gold metallic threads directly into pure silk yarns. Accompanied by a heavy Korvai temple border and intricate pallu work, it creates a magical liquid gold appearance under festive lighting.',
    craftStory: 'Korvai is the sacred weaving technique of Kanchipuram where the border and body are woven separately on twin looms and joined together with a zig-zag temple interlocking stitch.',
    specifications: {
      length: '5.5 Meters',
      width: '45 Inches',
      blousePiece: 'Included (80cm Metallic Tissue Silk with Brocade border)',
      washCare: 'Dry Clean Only. Avoid direct perfume sprays.',
      weight: '750 grams'
    },
    rating: 5.0,
    reviewsCount: 24,
    reviews: mockReviews
  },
  {
    id: 'saree-103',
    slug: 'kanjivaram-silk-peacock-blue-coral-zari-border',
    title: 'Heritage Kanjivaram Silk Saree in Peacock Blue',
    subtitle: 'Pure Mulberry Silk with Contrast Coral Red Border & Mayil (Peacock) Motifs',
    category: 'kanjivaram',
    categoryLabel: 'Kanjivaram Silk',
    fabric: 'Kanjivaram Silk',
    weaveType: '3-Ply Mulberry Silk Handloom',
    zariType: 'Real Gold/Silver Zari',
    occasion: 'Bridal',
    priceINR: 42000, priceMinor: "4200000", currency: "INR",
    compareAtPriceINR: 48000,
    isBestseller: true,
    isNewArrival: false,
    isCelebrityChoice: false,
    silkMarkCertified: true,
    images: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1200'
    ],
    colors: [
      { name: 'Peacock Blue', hex: '#005F73' },
      { name: 'Magenta Pink', hex: '#9B111E' },
      { name: 'Mustard Gold', hex: '#CA8A04' }
    ],
    primaryColorHex: '#005F73',
    sku: 'SE-KAN-BLU-03',
    description: 'Woven with dense 3-ply mulberry silk, this Kanchipuram icon embodies south Indian royalty. The vibrant peacock blue body is contrasted against a traditional coral border decorated with golden peacocks, Rudraksha beads, and Annapakshi bird motifs.',
    craftStory: 'Kanchipuram sarees are renowned for their heavy silk density and real silver thread tested zari dipped in 24k gold leaf polish.',
    specifications: {
      length: '5.5 Meters',
      width: '46 Inches',
      blousePiece: 'Included (80cm Contrast Coral Pure Silk)',
      washCare: 'Dry Clean Only. Air dry in shade.',
      weight: '900 grams'
    },
    rating: 4.8,
    reviewsCount: 19,
    reviews: mockReviews
  },
  {
    id: 'saree-104',
    slug: 'ready-to-wear-pre-draped-crimson-silk-saree',
    title: 'Pre-Draped Ready To Wear Crimson Silk Saree',
    subtitle: 'Instant Stitched Pleats with Elasticated Waist & Designer Embroidered Belt',
    category: 'ready-to-wear',
    categoryLabel: 'Ready To Wear',
    fabric: 'Georgette Silk',
    weaveType: 'Designer Pre-Draped Assembly',
    zariType: 'Antique Metallic Zari',
    occasion: 'Cocktail',
    priceINR: 19500, priceMinor: "1950000", currency: "INR",
    compareAtPriceINR: 23000,
    isBestseller: false,
    isNewArrival: true,
    isCelebrityChoice: true,
    silkMarkCertified: true,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200'
    ],
    colors: [
      { name: 'Crimson Red', hex: '#990000' },
      { name: 'Midnight Black', hex: '#111111' },
      { name: 'Royal Emerald', hex: '#004B23' }
    ],
    primaryColorHex: '#990000',
    sku: 'SE-RTW-CRM-04',
    description: 'Designed for effortless 1-minute elegance. This pre-draped saree comes with precision pre-stitched pleats, a comfortable concealed elastic waistband, and a hand-embellished zari waist belt. Perfect for modern sangeet nights and cocktail receptions.',
    craftStory: 'Crafted with premium fluid Georgette Silk that holds crisp pleats while providing effortless motion.',
    specifications: {
      length: 'Pre-draped standard fit (Waist 26" to 38")',
      width: 'Full length floor drape (Custom height options available)',
      blousePiece: 'Included (Stitched Padded Designer Blouse - Size Selectable)',
      washCare: 'Dry Clean Only.',
      weight: '680 grams'
    },
    rating: 4.9,
    reviewsCount: 15,
    reviews: mockReviews
  },
  {
    id: 'saree-105',
    slug: 'banarasi-organza-pastel-pink-gold-zari-meenakari',
    title: 'Pastel Blush Banarasi Organza Silk Saree',
    subtitle: 'Lightweight Organza with Delicate Gold Zari & Hand-penciled Meenakari Flora',
    category: 'banarasi',
    categoryLabel: 'Banarasi Silk',
    fabric: 'Organza Silk',
    weaveType: 'Meenakari Cutwork Handloom',
    zariType: 'Tested Zari',
    occasion: 'Festive',
    priceINR: 22800, priceMinor: "2280000", currency: "INR",
    compareAtPriceINR: 26500,
    isBestseller: false,
    isNewArrival: true,
    isCelebrityChoice: false,
    silkMarkCertified: true,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200'
    ],
    colors: [
      { name: 'Pastel Blush', hex: '#FFB6C1' },
      { name: 'Mint Sage', hex: '#98FF98' },
      { name: 'Lavender Mist', hex: '#E6E6FA' }
    ],
    primaryColorHex: '#FFB6C1',
    sku: 'SE-BAN-PNK-05',
    description: 'An ethereal creation combining sheer, airy Organza silk with shimmering tested gold zari and colorful Meenakari thread highlights. Ideal for daytime weddings, high tea, and summer festivities.',
    craftStory: 'Meenakari is an intricate art where multi-colored silk threads are woven alongside silver/gold zari to give realistic floral petal colors.',
    specifications: {
      length: '5.5 Meters',
      width: '44 Inches',
      blousePiece: 'Included (80cm Silk Satin in Blush Pink)',
      washCare: 'Dry Clean Only. Iron on low heat setting with protective cloth.',
      weight: '490 grams'
    },
    rating: 4.7,
    reviewsCount: 11,
    reviews: mockReviews
  },
  {
    id: 'saree-106',
    slug: 'kanjivaram-emerald-green-gold-brocade-zari',
    title: 'Emerald Gold Kanjivaram Bridal Brocade Saree',
    subtitle: 'Traditional Heavy Zari Lattice Jaal with Deep Ruby Red Temple Borders',
    category: 'kanjivaram',
    categoryLabel: 'Kanjivaram Silk',
    fabric: 'Kanjivaram Silk',
    weaveType: 'Heavy Brocade Zari Warp',
    zariType: 'Real Gold/Silver Zari',
    occasion: 'Bridal',
    priceINR: 48500, priceMinor: "4850000", currency: "INR",
    compareAtPriceINR: 56000,
    isBestseller: true,
    isNewArrival: false,
    isCelebrityChoice: true,
    silkMarkCertified: true,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1200'
    ],
    colors: [
      { name: 'Emerald Green', hex: '#0B6623' },
      { name: 'Crimson Ruby', hex: '#9B111E' }
    ],
    primaryColorHex: '#0B6623',
    sku: 'SE-KAN-GRN-06',
    description: 'The epitome of bridal grandeur. Rich emerald green silk saturated with full-surface gold zari brocade, complemented by traditional ruby red borders with Kalasam motifs.',
    craftStory: 'Takes over 250 artisan hours on handlooms in Kanchipuram using pure mulberry silk yarn.',
    specifications: {
      length: '5.5 Meters',
      width: '46 Inches',
      blousePiece: 'Included (80cm Heavy Zari Brocade Contrast Red)',
      washCare: 'Dry Clean Only.',
      weight: '980 grams'
    },
    rating: 5.0,
    reviewsCount: 42,
    reviews: mockReviews
  },
  {
    id: 'saree-107',
    slug: 'tissue-silk-rose-gold-antique-pallu',
    title: 'Rose Gold Shimmer Tissue Silk Festive Saree',
    subtitle: 'Fluid Sheen Tissue Fabric with Intricate Antique Copper Zari Pallu',
    category: 'tissue-silk',
    categoryLabel: 'Tissue Silk',
    fabric: 'Tissue Silk',
    weaveType: 'Handloom Metallic Tissue',
    zariType: 'Antique Metallic Zari',
    occasion: 'Festive',
    priceINR: 26000, priceMinor: "2600000", currency: "INR",
    compareAtPriceINR: 31000,
    isBestseller: false,
    isNewArrival: true,
    isCelebrityChoice: false,
    silkMarkCertified: true,
    images: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200'
    ],
    colors: [
      { name: 'Rose Gold', hex: '#B76E79' },
      { name: 'Champagne Gold', hex: '#E6CA65' }
    ],
    primaryColorHex: '#B76E79',
    sku: 'SE-TIS-RSG-07',
    description: 'Exuding romantic vintage elegance, this Rose Gold Tissue Silk saree blends copper-pink sheen with intricate handloom zari borders.',
    craftStory: 'Woven with high-tension metallic warp threads for a silky liquid drape.',
    specifications: {
      length: '5.5 Meters',
      width: '45 Inches',
      blousePiece: 'Included (80cm Rose Gold Tissue)',
      washCare: 'Dry Clean Only.',
      weight: '710 grams'
    },
    rating: 4.8,
    reviewsCount: 16,
    reviews: mockReviews
  },
  {
    id: 'saree-108',
    slug: 'ready-to-wear-midnight-blue-pre-draped-saree',
    title: 'Pre-Draped Midnight Blue Georgette Saree Set',
    subtitle: 'Sculpted Pleats with Crystal & Zardozi Hand-Embroidered Belt',
    category: 'ready-to-wear',
    categoryLabel: 'Ready To Wear',
    fabric: 'Georgette Silk',
    weaveType: 'Pre-Draped Modern Cut',
    zariType: 'Resham Threadwork',
    occasion: 'Reception & Party',
    priceINR: 21000, priceMinor: "2100000", currency: "INR",
    compareAtPriceINR: 25000,
    isBestseller: true,
    isNewArrival: true,
    isCelebrityChoice: true,
    silkMarkCertified: true,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200'
    ],
    colors: [
      { name: 'Midnight Navy', hex: '#191970' },
      { name: 'Wine Plum', hex: '#4A0E17' }
    ],
    primaryColorHex: '#191970',
    sku: 'SE-RTW-NAV-08',
    description: 'A contemporary dream. Effortless waist hook closure, pre-formed pleats, and a structured pallu with an attached handcrafted zardozi belt.',
    craftStory: 'Designed in our Mumbai atelier for seamless drape precision.',
    specifications: {
      length: 'Pre-draped 1-minute fit',
      width: 'Standard 44"',
      blousePiece: 'Included (Stitched Embroidered Blouse)',
      washCare: 'Dry Clean Only.',
      weight: '620 grams'
    },
    rating: 4.9,
    reviewsCount: 29,
    reviews: mockReviews
  }
];

export const mockCategories = [
  {
    id: 'banarasi',
    slug: 'banarasi',
    title: 'Banarasi Katan Silk',
    description: 'Woven in Varanasi with centuries of royal handloom heritage & gold zari jaals.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
    itemCount: '124 Sarees'
  },
  {
    id: 'kanjivaram',
    slug: 'kanjivaram',
    title: 'Kanjivaram Pure Zari',
    description: 'Heavy mulberry silk with Korvai temple borders & real gold tested silver zari.',
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800',
    itemCount: '98 Sarees'
  },
  {
    id: 'tissue-silk',
    slug: 'tissue-silk',
    title: 'Tissue Silk Collection',
    description: 'Shimmering metallic weave creating an ethereal liquid gold and rose shine.',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800',
    itemCount: '45 Sarees'
  },
  {
    id: 'ready-to-wear',
    slug: 'ready-to-wear',
    title: 'Ready To Wear Sarees',
    description: 'Instant 1-minute pre-draped sarees with designer belts for modern festivities.',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
    itemCount: '32 Sarees'
  }
];

export const currencyRates = {
  INR: { code: 'INR', symbol: '₹', rateToINR: 1 },
  USD: { code: 'USD', symbol: '$', rateToINR: 83.5 },
  EUR: { code: 'EUR', symbol: '€', rateToINR: 91.0 }
};
