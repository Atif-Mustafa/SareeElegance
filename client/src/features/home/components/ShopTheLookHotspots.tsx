import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { mockProducts as products } from '@/features/catalog/data/mockData';
import { Sparkles, ShoppingBag, Plus, Check, ArrowRight, Eye, ShieldCheck, Tag } from 'lucide-react';

interface HotspotItem {
  id: string;
  title: string;
  category: string;
  priceINR: number;
  productSlug?: string;
  xPercent: number; // horizontal % on image
  yPercent: number; // vertical % on image
  colorName: string;
  colorHex: string;
  description: string;
  imageThumb: string;
}

interface Lookbook {
  id: string;
  title: string;
  subtitle: string;
  occasionBadge: string;
  modelImage: string;
  hotspots: HotspotItem[];
}

export const ShopTheLookHotspots: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart, formatPrice, addToast, setIsCartOpen } = useStore();

  const looks: Lookbook[] = [
    {
      id: 'look-1',
      title: 'Royal Varanasi Bridal Ensemble',
      subtitle: 'Heavy Katan Silk Saree paired with Hand-Embroidered Zardozi Blouse & Heritage Temple Jewellery',
      occasionBadge: 'Bridal Grandeur',
      modelImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1000',
      hotspots: [
        {
          id: 'hs-1-1',
          title: 'Royal Maroon Banarasi Katan Silk Saree',
          category: 'Handloom Pure Silk Saree',
          priceINR: 28500,
          productSlug: 'banarasi-katan-silk-maroon-gold-kadwa-jaal',
          xPercent: 48,
          yPercent: 62,
          colorName: 'Royal Crimson Maroon',
          colorHex: '#6B1D2F',
          description: '100% pure mulberry silk woven with real gold zari in 3D Kadwa floral jaal.',
          imageThumb: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400'
        },
        {
          id: 'hs-1-2',
          title: 'Hand-Embroidered Velvet Zardozi Blouse',
          category: 'Bespoke Designer Blouse',
          priceINR: 6500,
          productSlug: 'banarasi-katan-silk-maroon-gold-kadwa-jaal',
          xPercent: 42,
          yPercent: 32,
          colorName: 'Deep Wine Velvet',
          colorHex: '#4A1521',
          description: 'Deep U-neck cut with intricate metallic dabka and sequin elbow sleeve embroidery.',
          imageThumb: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=400'
        },
        {
          id: 'hs-1-3',
          title: 'Antique Temple Gold Choker Set',
          category: '22k Gold Plated Jewellery',
          priceINR: 8900,
          productSlug: 'kanjivaram-silk-peacock-blue-coral-zari-border',
          xPercent: 52,
          yPercent: 22,
          colorName: 'Antique Temple Gold',
          colorHex: '#D4AF37',
          description: 'Handcrafted Lakshmi motif choker with guttapusalu pearl drops.',
          imageThumb: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=400'
        },
        {
          id: 'hs-1-4',
          title: 'Handmade Zari Brocade Potli Bag',
          category: 'Trousseau Accessory',
          priceINR: 2200,
          productSlug: 'banarasi-organza-pastel-pink-gold-zari-meenakari',
          xPercent: 70,
          yPercent: 78,
          colorName: 'Gilded Crimson',
          colorHex: '#8B0000',
          description: 'Drawstring silk potli with pearl tassel ties and matching zari embroidery.',
          imageThumb: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=400'
        }
      ]
    },
    {
      id: 'look-2',
      title: 'Kanchipuram Champagne Glamour',
      subtitle: 'Liquid Metallic Tissue Silk Drape with Contrast Coral Pallu & Pearl Statement Choker',
      occasionBadge: 'Cocktail & Reception',
      modelImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1000',
      hotspots: [
        {
          id: 'hs-2-1',
          title: 'Golden Champagne Tissue Silk Saree',
          category: 'Pure Kanjivaram Tissue',
          priceINR: 32000,
          productSlug: 'kanjivaram-tissue-silk-golden-champagne-temple-border',
          xPercent: 50,
          yPercent: 55,
          colorName: 'Champagne Gold',
          colorHex: '#E6CA65',
          description: 'Interwoven real gold zari thread creates a reflective luminescent glow.',
          imageThumb: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=400'
        },
        {
          id: 'hs-2-2',
          title: 'Structured Brocade Corset Blouse',
          category: 'Tailored Designer Blouse',
          priceINR: 5800,
          productSlug: 'kanjivaram-tissue-silk-golden-champagne-temple-border',
          xPercent: 44,
          yPercent: 36,
          colorName: 'Warm Bronze Gold',
          colorHex: '#C28E46',
          description: 'Bustier cut with padded cups and heavy metallic zari brocade motif.',
          imageThumb: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400'
        },
        {
          id: 'hs-2-3',
          title: 'South Sea Pearl Statement Earrings',
          category: 'Fine Jewellery',
          priceINR: 4500,
          productSlug: 'banarasi-organza-pastel-pink-gold-zari-meenakari',
          xPercent: 58,
          yPercent: 24,
          colorName: 'Lustrous Ivory',
          colorHex: '#FDFBF7',
          description: 'Hand-strung freshwater cultured pearls set in antique brass gilding.',
          imageThumb: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=400'
        }
      ]
    }
  ];

  const [activeLookId, setActiveLookId] = useState<string>('look-1');
  const [activeHotspotId, setActiveHotspotId] = useState<string>('hs-1-1');
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const currentLook = looks.find((l) => l.id === activeLookId) || looks[0];
  const activeHotspot = currentLook.hotspots.find((h) => h.id === activeHotspotId) || currentLook.hotspots[0];

  const handleAddSingleToCart = (hs: HotspotItem) => {
    // Find matching product in catalog or construct fallback product object
    const catalogProduct = products.find((p) => p.slug === hs.productSlug) || products[0];

    const targetColor = catalogProduct.colors?.[0] || {
      name: hs.colorName,
      hex: hs.colorHex,
    };

    const defaultCustomization = {
      fallAndPico: true,
      blouseOption: 'unstitched' as const,
      petticoatOption: false
    };

    addToCart(catalogProduct, targetColor, defaultCustomization, 1);
    setAddedItems((prev) => ({ ...prev, [hs.id]: true }));
    addToast(`Added "${hs.title}" to your cart!`, 'success');
  };

  const handleAddFullLookToCart = () => {
    currentLook.hotspots.forEach((hs) => {
      handleAddSingleToCart(hs);
    });
    setIsCartOpen(true);
  };

  const totalLookPrice = currentLook.hotspots.reduce((acc, h) => acc + h.priceINR, 0);

  return (
    <section id="shop-the-look-hotspots-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-[#E6DFC6] pb-4">
        <div>
          <span className="text-xs font-bold text-[#C28E46] uppercase tracking-widest block mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 fill-[#C28E46]" /> Interactive Lookbook
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E]">
            Shop The Complete Look
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Click the golden hotspots on our muses to shop individual drapes, blouses, and accessories directly.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-[#FAF7F2] p-1.5 rounded-2xl border border-[#E6DFC6]">
          {looks.map((look) => {
            const isSelected = look.id === activeLookId;
            return (
              <button
                key={look.id}
                onClick={() => {
                  setActiveLookId(look.id);
                  setActiveHotspotId(look.hotspots[0].id);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-[#2C221E] text-[#D4AF37] shadow-md border border-[#C28E46]'
                    : 'text-stone-600 hover:text-[#2C221E]'
                }`}
              >
                {look.occasionBadge}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#E6DFC6] shadow-lg">
        {/* Left Interactive Image Stage with Hotspots */}
        <div className="lg:col-span-7 relative flex justify-center items-center rounded-2xl overflow-hidden bg-[#2C221E] border-2 border-[#C28E46]/40 shadow-2xl">
          <div className="relative w-full max-w-lg aspect-[3/4] overflow-hidden select-none">
            <img
              src={currentLook.modelImage}
              alt={currentLook.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2C221E]/60 via-transparent to-transparent pointer-events-none" />

            {/* Hotspot Dots */}
            {currentLook.hotspots.map((hs) => {
              const isActive = activeHotspotId === hs.id;
              return (
                <button
                  key={hs.id}
                  onClick={() => setActiveHotspotId(hs.id)}
                  style={{ left: `${hs.xPercent}%`, top: `${hs.yPercent}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-transform ${
                    isActive ? 'scale-125 z-30' : 'z-20 hover:scale-110'
                  }`}
                  aria-label={`View ${hs.title}`}
                >
                  {/* Outer Pulsing Ring */}
                  <span
                    className={`absolute -inset-2 rounded-full animate-ping opacity-75 ${
                      isActive ? 'bg-[#D4AF37]' : 'bg-white'
                    }`}
                  />
                  {/* Button Icon Core */}
                  <span
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-2xl transition-colors border-2 ${
                      isActive
                        ? 'bg-[#2C221E] text-[#D4AF37] border-[#C28E46]'
                        : 'bg-white/90 text-[#2C221E] border-white group-hover:bg-[#C28E46] group-hover:text-white'
                    }`}
                  >
                    <Plus className={`w-4 h-4 transition-transform ${isActive ? 'rotate-45' : ''}`} />
                  </span>

                  {/* Micro Tooltip on Hover */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-10 hidden group-hover:flex flex-col items-center pointer-events-none whitespace-nowrap z-40">
                    <div className="bg-[#2C221E] text-[#D4AF37] text-[10px] font-bold px-2.5 py-1 rounded-md border border-[#C28E46] shadow-xl">
                      {hs.title} • {formatPrice(hs.priceINR)}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Overlay Badge */}
            <div className="absolute bottom-4 left-4 right-4 bg-[#2C221E]/80 backdrop-blur-md p-3.5 rounded-xl border border-[#C28E46]/40 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#D4AF37] tracking-wider block">
                  {currentLook.occasionBadge}
                </span>
                <h4 className="font-serif text-sm font-bold truncate">{currentLook.title}</h4>
              </div>
              <span className="text-xs text-stone-300 font-mono">
                {currentLook.hotspots.length} Items Tagged
              </span>
            </div>
          </div>
        </div>

        {/* Right Details Panel for Active Hotspot & Full Look Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Hotspot Item Card */}
          <div className="bg-white p-6 rounded-2xl border-2 border-[#C28E46] shadow-md space-y-4">
            <div className="flex items-start gap-4">
              <img
                src={activeHotspot.imageThumb}
                alt={activeHotspot.title}
                className="w-20 h-24 rounded-xl object-cover shrink-0 border border-stone-200"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-[#C28E46] uppercase tracking-wider block">
                  {activeHotspot.category}
                </span>
                <h3 className="font-serif text-lg font-bold text-[#2C221E] leading-snug line-clamp-2">
                  {activeHotspot.title}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-bold text-lg text-[#2C221E]">
                    {formatPrice(activeHotspot.priceINR)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-700" /> Authenticated
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed border-t border-[#F3EFE6] pt-3">
              {activeHotspot.description}
            </p>

            {/* Action Buttons for Active Item */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => handleAddSingleToCart(activeHotspot)}
                className={`flex-1 font-bold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  addedItems[activeHotspot.id]
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#2C221E] hover:bg-[#C28E46] text-[#D4AF37] hover:text-[#2C221E] border border-[#C28E46]'
                }`}
              >
                {addedItems[activeHotspot.id] ? (
                  <>
                    <Check className="w-4 h-4" /> Added To Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add This Item ({formatPrice(activeHotspot.priceINR)})
                  </>
                )}
              </button>

              {activeHotspot.productSlug && (
                <button
                  onClick={() => navigate(`/product/${activeHotspot.productSlug}`)}
                  className="p-3 bg-[#FAF7F2] hover:bg-[#E6DFC6] text-[#2C221E] rounded-xl border border-[#E6DFC6] transition-colors"
                  title="View Product Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* List of All Tagged Items in this Look */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#2C221E] uppercase tracking-wider flex items-center justify-between">
              <span>Items In This Look</span>
              <span className="text-[#C28E46]">{currentLook.hotspots.length} Pieces</span>
            </h4>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {currentLook.hotspots.map((hs) => {
                const isActive = activeHotspotId === hs.id;
                return (
                  <div
                    key={hs.id}
                    onClick={() => setActiveHotspotId(hs.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#2C221E] text-white border-[#C28E46]'
                        : 'bg-white text-stone-700 border-[#E6DFC6] hover:border-[#C28E46]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 border border-white"
                        style={{ backgroundColor: hs.colorHex }}
                      />
                      <div className="truncate">
                        <p className={`text-xs font-serif font-bold truncate ${isActive ? 'text-[#D4AF37]' : 'text-[#2C221E]'}`}>
                          {hs.title}
                        </p>
                        <span className={`text-[10px] ${isActive ? 'text-stone-300' : 'text-stone-500'}`}>
                          {hs.category}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold shrink-0 ml-2 ${isActive ? 'text-[#D4AF37]' : 'text-[#2C221E]'}`}>
                      {formatPrice(hs.priceINR)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Complete Bundle Purchase Banner */}
          <div className="bg-[#2C221E] text-white p-5 rounded-2xl border-2 border-[#C28E46] space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#C28E46]/40 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest block">Full Trousseau Bundle</span>
                <h4 className="font-serif font-bold text-base text-white">Buy Entire Look Set</h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-300 block">Total Bundle</span>
                <span className="font-serif text-lg font-bold text-[#D4AF37]">
                  {formatPrice(totalLookPrice)}
                </span>
              </div>
            </div>

            <button
              onClick={handleAddFullLookToCart}
              className="w-full bg-[#C28E46] hover:bg-[#D4AF37] text-[#2C221E] font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 border border-[#D4AF37]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add All {currentLook.hotspots.length} Items To Cart</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
