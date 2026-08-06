import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ProductCard } from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/product/ProductCardSkeleton';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import {
  Filter,
  SlidersHorizontal,
  Grid2X2,
  Grid3X3,
  X,
  RotateCcw,
  ChevronDown,
  ShieldCheck,
  Check
} from 'lucide-react';
import { FabricType, OccasionType, ZariType } from '../types';

export const PLP: React.FC = () => {
  const { category = 'all' } = useParams<{ category: string }>();
  const { products, formatPrice } = useStore();

  const [gridCols, setGridCols] = useState<2 | 4>(4);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter States
  const [selectedFabrics, setSelectedFabrics] = useState<FabricType[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<OccasionType[]>([]);
  const [selectedZaris, setSelectedZaris] = useState<ZariType[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(60000);
  const [silkMarkOnly, setSilkMarkOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'bestseller' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('bestseller');

  // Trigger loading state on filter / category changes
  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [category, sortBy, selectedFabrics, selectedOccasions, selectedZaris, maxPrice, silkMarkOnly]);

  // Available Facet Options
  const fabricsList: FabricType[] = [
    'Banarasi Katan Silk',
    'Kanjivaram Silk',
    'Tissue Silk',
    'Organza Silk',
    'Georgette Silk'
  ];

  const occasionsList: OccasionType[] = [
    'Bridal',
    'Festive',
    'Reception & Party',
    'Cocktail'
  ];

  const zariList: ZariType[] = [
    'Real Gold/Silver Zari',
    'Tested Zari',
    'Antique Metallic Zari',
    'Resham Threadwork'
  ];

  const categoryTitles: Record<string, { title: string; subtitle: string }> = {
    all: { title: 'All Saree Collections', subtitle: 'Handwoven Banarasi, Kanjivaram, and Tissue Silk Sarees' },
    banarasi: { title: 'Banarasi Katan Silk Sarees', subtitle: 'Intricate Kadwa Weaves & Real Gold Zari Jaals from Varanasi' },
    kanjivaram: { title: 'Kanjivaram Pure Silk Sarees', subtitle: 'Heavy Mulberry Silk with Korvai Temple Borders from Kanchipuram' },
    'tissue-silk': { title: 'Tissue Silk Collection', subtitle: 'Ethereal Shimmering Metallic Weaves with Fluid Liquid Gold Sheen' },
    'ready-to-wear': { title: 'Pre-Draped Ready to Wear Sarees', subtitle: 'Instant 1-Minute Elegance with Hand-Embroidered Belts' },
  };

  const currentCategoryInfo = categoryTitles[category] || {
    title: `${category.toUpperCase()} Collection`,
    subtitle: 'Exquisite handwoven silk sarees'
  };

  const toggleFabric = (f: FabricType) => {
    setSelectedFabrics((prev) =>
      prev.includes(f) ? prev.filter((i) => i !== f) : [...prev, f]
    );
  };

  const toggleOccasion = (o: OccasionType) => {
    setSelectedOccasions((prev) =>
      prev.includes(o) ? prev.filter((i) => i !== o) : [...prev, o]
    );
  };

  const toggleZari = (z: ZariType) => {
    setSelectedZaris((prev) =>
      prev.includes(z) ? prev.filter((i) => i !== z) : [...prev, z]
    );
  };

  const resetAllFilters = () => {
    setSelectedFabrics([]);
    setSelectedOccasions([]);
    setSelectedZaris([]);
    setMaxPrice(60000);
    setSilkMarkOnly(false);
  };

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category check
        if (category !== 'all' && p.category !== category) return false;

        // Fabrics check
        if (selectedFabrics.length > 0 && !selectedFabrics.includes(p.fabric)) return false;

        // Occasions check
        if (selectedOccasions.length > 0 && !selectedOccasions.includes(p.occasion)) return false;

        // Zari check
        if (selectedZaris.length > 0 && !selectedZaris.includes(p.zariType)) return false;

        // Price check
        if (p.priceINR > maxPrice) return false;

        // Silk mark
        if (silkMarkOnly && !p.silkMarkCertified) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.priceINR - b.priceINR;
        if (sortBy === 'price-desc') return b.priceINR - a.priceINR;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
        return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
      });
  }, [products, category, selectedFabrics, selectedOccasions, selectedZaris, maxPrice, silkMarkOnly, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Header Title */}
      <div className="space-y-2 border-b border-[#E6DFC6] pb-6">
        <Breadcrumb
          items={
            category === 'all'
              ? [{ label: 'Collections', href: '/collections/all' }]
              : [
                  { label: 'Collections', href: '/collections/all' },
                  { label: currentCategoryInfo.title }
                ]
          }
        />

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C221E]">
          {currentCategoryInfo.title}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
          {currentCategoryInfo.subtitle}
        </p>
      </div>

      {/* Top Filter & View Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E6DFC6] shadow-sm">
        <div className="flex items-center gap-3">
          <button
            id="mobile-filter-drawer-toggle-btn"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden bg-[#2C221E] text-[#D4AF37] text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters ({selectedFabrics.length + selectedOccasions.length + selectedZaris.length})
          </button>

          <span className="text-xs font-semibold text-stone-600">
            Showing <strong className="text-[#2C221E]">{filteredProducts.length}</strong> sarees
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Grid View Switcher */}
          <div className="hidden sm:flex items-center gap-1 border border-[#E6DFC6] rounded-lg p-1 bg-[#FAF7F2]">
            <button
              onClick={() => setGridCols(2)}
              className={`p-1.5 rounded transition-all ${
                gridCols === 2 ? 'bg-[#2C221E] text-[#D4AF37]' : 'text-stone-500 hover:text-[#2C221E]'
              }`}
              title="2-Column Large View"
            >
              <Grid2X2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridCols(4)}
              className={`p-1.5 rounded transition-all ${
                gridCols === 4 ? 'bg-[#2C221E] text-[#D4AF37]' : 'text-stone-500 hover:text-[#2C221E]'
              }`}
              title="4-Column Grid View"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#FAF7F2] text-xs text-[#2C221E] font-bold border border-[#E6DFC6] px-3 py-2 rounded-lg focus:outline-none focus:border-[#C28E46]"
            >
              <option value="bestseller">Featured & Bestsellers</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3 bg-white p-5 rounded-2xl border border-[#E6DFC6] shadow-sm space-y-6 sticky top-28">
          <div className="flex items-center justify-between border-b border-[#F3EFE6] pb-3">
            <h3 className="font-serif font-bold text-base text-[#2C221E] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#C28E46]" /> Filter Sarees
            </h3>
            <button
              onClick={resetAllFilters}
              className="text-xs text-stone-500 hover:text-[#C28E46] flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2 border-b border-[#F3EFE6] pb-4">
            <div className="flex items-center justify-between text-xs font-bold text-[#2C221E]">
              <span>Max Price</span>
              <span className="text-[#C28E46]">{formatPrice(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="15000"
              max="60000"
              step="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#C28E46]"
            />
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>₹15,000</span>
              <span>₹60,000</span>
            </div>
          </div>

          {/* Fabric Types */}
          <div className="space-y-2 border-b border-[#F3EFE6] pb-4">
            <h4 className="font-serif font-bold text-sm text-[#2C221E]">Fabric Weave</h4>
            <div className="space-y-1.5">
              {fabricsList.map((fab) => {
                const checked = selectedFabrics.includes(fab);
                return (
                  <label
                    key={fab}
                    className="flex items-center justify-between text-xs text-stone-700 hover:text-[#2C221E] cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleFabric(fab)}
                        className="rounded border-[#E6DFC6] text-[#C28E46] focus:ring-[#C28E46]"
                      />
                      {fab}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Occasions */}
          <div className="space-y-2 border-b border-[#F3EFE6] pb-4">
            <h4 className="font-serif font-bold text-sm text-[#2C221E]">Occasion</h4>
            <div className="space-y-1.5">
              {occasionsList.map((occ) => {
                const checked = selectedOccasions.includes(occ);
                return (
                  <label
                    key={occ}
                    className="flex items-center gap-2 text-xs text-stone-700 hover:text-[#2C221E] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOccasion(occ)}
                      className="rounded border-[#E6DFC6] text-[#C28E46] focus:ring-[#C28E46]"
                    />
                    {occ}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Zari Types */}
          <div className="space-y-2 border-b border-[#F3EFE6] pb-4">
            <h4 className="font-serif font-bold text-sm text-[#2C221E]">Zari Craftsmanship</h4>
            <div className="space-y-1.5">
              {zariList.map((zari) => {
                const checked = selectedZaris.includes(zari);
                return (
                  <label
                    key={zari}
                    className="flex items-center gap-2 text-xs text-stone-700 hover:text-[#2C221E] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleZari(zari)}
                      className="rounded border-[#E6DFC6] text-[#C28E46] focus:ring-[#C28E46]"
                    />
                    {zari}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Silk Mark Only Toggle */}
          <div className="pt-1">
            <label className="flex items-center gap-2 text-xs font-bold text-[#2C221E] cursor-pointer">
              <input
                type="checkbox"
                checked={silkMarkOnly}
                onChange={(e) => setSilkMarkOnly(e.target.checked)}
                className="rounded border-[#E6DFC6] text-[#C28E46] focus:ring-[#C28E46]"
              />
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C28E46]" /> Silk Mark Certified Only
              </span>
            </label>
          </div>
        </aside>

        {/* Mobile Filters Drawer Modal */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden bg-black/60 flex justify-end">
            <div className="bg-white w-full max-w-xs h-full p-6 overflow-y-auto space-y-6 flex flex-col">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-serif font-bold text-lg text-[#2C221E]">Filter Sarees</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-stone-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Fabrics */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase text-[#8C7262]">Fabrics</h4>
                {fabricsList.map((fab) => (
                  <label key={fab} className="flex items-center gap-2 text-xs text-stone-700 py-1">
                    <input
                      type="checkbox"
                      checked={selectedFabrics.includes(fab)}
                      onChange={() => toggleFabric(fab)}
                    />
                    {fab}
                  </label>
                ))}
              </div>

              <div className="mt-auto pt-4 border-t flex gap-2">
                <button
                  onClick={resetAllFilters}
                  className="w-1/2 py-2.5 text-xs font-bold border border-stone-300 rounded-lg text-stone-700"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-1/2 py-2.5 text-xs font-bold bg-[#2C221E] text-[#D4AF37] rounded-lg"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="lg:col-span-9">
          {isLoading ? (
            <ProductGridSkeleton
              count={gridCols === 2 ? 4 : 6}
              className={
                gridCols === 2
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
              }
            />
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#E6DFC6] space-y-4">
              <h3 className="font-serif text-2xl font-bold text-[#2C221E]">No sarees match your selected filters</h3>
              <p className="text-xs text-stone-500">Try adjusting your price range or clearing fabric facets.</p>
              <button
                onClick={resetAllFilters}
                className="bg-[#2C221E] text-[#D4AF37] text-xs font-bold px-6 py-3 rounded-xl hover:bg-[#C28E46] hover:text-[#2C221E] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-6 ${
                gridCols === 2
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
              }`}
            >
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
