import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { catalogApi } from '../features/catalog/api/catalog.api';
import { mapDetailToLegacyProduct } from '../features/catalog/api/catalog.mapper';
import { useInventory } from '../features/inventory/hooks/useInventory';
import { BlouseMeasurementForm } from '../features/product/components/BlouseMeasurementForm';
import { ProductCard } from '../features/product/components/ProductCard';
import { ProductGridSkeleton } from '../features/product/components/ProductCardSkeleton';
import { VirtualTryOnModal } from '../features/product/components/VirtualTryOnModal';
import {
  ShieldCheck,
  Sparkles,
  Heart,
  ShoppingBag,
  Star,
  Truck,
  CheckCircle2,
  ChevronRight,
  Scissors,
  Calendar,
  RotateCcw,
  Video,
  ChevronDown,
  ChevronUp,
  MapPin,
  Check
} from 'lucide-react';
import { CustomizationSelection, ColorOption, BlouseMeasurement, Product } from '../types';
import { InteractiveDescription, GlossaryTerm } from '../components/ui/GlossaryTerm';
import { Breadcrumb } from '../components/ui/Breadcrumb';

export const PDP: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { formatPrice, addToCart, toggleWishlist, isInWishlist, setIsVideoModalOpen } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ColorOption>({ name: 'Standard', hex: '#6B1D2F' });
  const [isRelatedLoading, setIsRelatedLoading] = useState(false);

  const { availability, isLoading: isInventoryLoading } = useInventory(product?.id);

  React.useEffect(() => {
    let ignore = false;
    const fetchProduct = async () => {
      if (!slug) return;
      setIsLoading(true);
      setApiError(null);
      try {
        const res = await catalogApi.getProductBySlug(slug);
        if (!ignore) {
          const mapped = mapDetailToLegacyProduct(res);
          setProduct(mapped);
          if (mapped.colors && mapped.colors.length > 0) {
            setSelectedColor(mapped.colors[0]);
          }
        }
      } catch (err: any) {
        if (!ignore) {
          if (err.status === 404) {
            setApiError('Product not found');
          } else {
            setApiError(err.message || 'Failed to load product');
          }
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
          setIsRelatedLoading(true);
          setTimeout(() => {
            if (!ignore) setIsRelatedLoading(false);
          }, 350);
        }
      }
    };
    fetchProduct();
    return () => { ignore = true; };
  }, [slug]);

  // Customization State
  const [fallAndPico, setFallAndPico] = useState(true);
  const [blouseOption, setBlouseOption] = useState<'unstitched' | 'standard' | 'custom'>('unstitched');
  const [standardBlouseSize, setStandardBlouseSize] = useState<'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'>('M');
  const [customBlouse, setCustomBlouse] = useState<BlouseMeasurement | undefined>(undefined);
  const [petticoatOption, setPetticoatOption] = useState(false);
  const [petticoatFabric, setPetticoatFabric] = useState<'Cotton Satin' | 'Shimmer Silk'>('Cotton Satin');

  // Pincode Estimator State
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<{ checked: boolean; valid: boolean; deliveryDate?: string; cod?: boolean }>({
    checked: false,
    valid: false
  });

  // Accordion Tabs Open State
  const [activeTab, setActiveTab] = useState<'details' | 'craft' | 'wash' | 'shipping'>('details');

  // AI Virtual Try-On Modal State
  const [isTryOnModalOpen, setIsTryOnModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-[#FDFBF7] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C28E46]"></div>
      </div>
    );
  }
  
  if (apiError || !product) {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-[#FDFBF7] flex justify-center items-center">
        <div className="bg-white rounded-2xl p-12 text-center border border-red-200 space-y-4 max-w-md mx-auto">
          <h3 className="font-serif text-2xl font-bold text-red-700">{apiError || 'Product Not Found'}</h3>
          <button
            onClick={() => navigate('/collections/all')}
            className="bg-[#2C221E] text-[#D4AF37] text-xs font-bold px-6 py-3 rounded-xl"
          >
            Back to Collections
          </button>
        </div>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);

  // Calculate Extra Customization Cost
  let extraCostINR = 0;
  if (fallAndPico) extraCostINR += 150;
  if (blouseOption === 'standard') extraCostINR += 1200;
  if (blouseOption === 'custom') extraCostINR += 1800;
  if (petticoatOption) extraCostINR += 499;

  const totalItemPriceINR = product.priceINR + extraCostINR;

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.trim().length >= 6) {
      setPincodeStatus({
        checked: true,
        valid: true,
        deliveryDate: '3-4 Business Days (Express Air)',
        cod: true
      });
    }
  };

  const handleAddToCart = () => {
    const customization: CustomizationSelection = {
      fallAndPico,
      blouseOption,
      standardBlouseSize: blouseOption === 'standard' ? standardBlouseSize : undefined,
      customMeasurements: blouseOption === 'custom' ? customBlouse : undefined,
      petticoatOption,
      petticoatFabric: petticoatOption ? petticoatFabric : undefined
    };

    addToCart(product, selectedColor, customization, 1);
  };

  // Related products
  const relatedProducts: Product[] = [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Collections', href: '/collections/all' },
          { label: product.categoryLabel, href: `/collections/${product.category}` },
          { label: product.title }
        ]}
      />

      {/* PDP Top Grid: Images + Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left Column: Image Gallery & Thumbnails */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white border border-[#E6DFC6] shadow-md group">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
            />

            {product.silkMarkCertified && (
              <div className="absolute top-4 left-4 bg-[#2C221E] text-[#D4AF37] px-3 py-1.5 rounded-lg border border-[#C28E46] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" /> Silk Mark Certified
              </div>
            )}

            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 p-3 rounded-full shadow-xl transition-all ${
                wishlisted ? 'bg-rose-600 text-white' : 'bg-white/90 text-[#2C221E] hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-white' : ''}`} />
            </button>

            {/* AI Virtual Try-On Floating Overlay Button */}
            <button
              id="pdp-ai-virtual-tryon-img-btn"
              onClick={() => setIsTryOnModalOpen(true)}
              className="absolute bottom-4 left-4 right-4 bg-[#2C221E]/90 hover:bg-[#2C221E] text-[#D4AF37] font-bold py-3 px-4 rounded-xl border border-[#C28E46] backdrop-blur-md shadow-2xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider group"
            >
              <Sparkles className="w-4 h-4 fill-[#D4AF37] group-hover:scale-110 transition-transform" />
              <span>AI Virtual Try-On & Drape Simulator</span>
            </button>
          </div>

          {/* Thumbnail Strip */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {product.images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  selectedImageIndex === idx
                    ? 'border-[#C28E46] ring-2 ring-[#C28E46]/30'
                    : 'border-[#E6DFC6] opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Title, Customizations, Pricing, CTA */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2 border-b border-[#E6DFC6] pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C28E46] bg-[#C28E46]/10 px-2.5 py-1 rounded">
                {product.fabric}
              </span>
              <span className="text-xs text-stone-500 font-mono">SKU: {product.sku}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E]">
              {product.title}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-serif italic">{product.subtitle}</p>

            {/* Interactive Product Description with Hoverable Weaving Terms */}
            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E6DFC6] text-xs text-stone-700">
              <InteractiveDescription text={product.description} />
            </div>

            {/* Rating summary */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1 text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
                ))}
              </div>
              <span className="text-xs font-bold text-[#2C221E]">{product.rating} / 5.0</span>
              <span className="text-xs text-stone-400">({product.reviewsCount} Client Reviews)</span>
            </div>
          </div>

          {/* Price Display */}
          <div className="bg-white p-4 rounded-xl border border-[#E6DFC6] flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-500 block">Total Saree + Customizations</span>
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl font-bold text-[#2C221E]">
                  {formatPrice(totalItemPriceINR)}
                </span>
                {product.compareAtPriceINR && (
                  <span className="text-sm text-stone-400 line-through">
                    {formatPrice(product.compareAtPriceINR)}
                  </span>
                )}
              </div>
            </div>

            {extraCostINR > 0 && (
              <span className="text-xs bg-[#C28E46]/10 text-[#C28E46] border border-[#C28E46]/30 px-3 py-1.5 rounded-lg font-bold">
                Includes +{formatPrice(extraCostINR)} bespoke services
              </span>
            )}
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#2C221E] uppercase tracking-wider">
              Select Shade Color: <span className="text-[#C28E46]">{selectedColor.name}</span>
            </label>
            <div className="flex items-center gap-3">
              {product.colors.map((col: ColorOption) => (
                <button
                  key={col.name}
                  onClick={() => setSelectedColor(col)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                    selectedColor.name === col.name
                      ? 'border-[#2C221E] bg-[#2C221E] text-[#D4AF37] ring-2 ring-[#C28E46]'
                      : 'border-[#E6DFC6] bg-white text-stone-700 hover:border-[#C28E46]'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full border border-stone-300" style={{ backgroundColor: col.hex }} />
                  {col.name}
                </button>
              ))}
            </div>
          </div>

          {/* BESPOKE SAREE CUSTOMIZATION SECTION */}
          <div className="bg-[#FAF7F2] p-5 rounded-2xl border-2 border-[#C28E46]/40 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E6DFC6] pb-2">
              <h3 className="font-serif font-bold text-base text-[#2C221E] flex items-center gap-2">
                <Scissors className="w-4 h-4 text-[#C28E46]" /> Saree Customization Options
              </h3>
              <span className="text-[11px] text-[#2E6F40] font-bold">Bespoke Atelier</span>
            </div>

            {/* Fall & Pico Checkbox */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E6DFC6] flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-[#2C221E] cursor-pointer">
                <input
                  type="checkbox"
                  checked={fallAndPico}
                  onChange={(e) => setFallAndPico(e.target.checked)}
                  className="rounded text-[#C28E46] focus:ring-[#C28E46] w-4 h-4"
                />
                <span>Fall & Pico Finishing</span>
              </label>
              <span className="text-xs font-bold text-[#2C221E]">+₹150</span>
            </div>

            {/* Blouse Stitching Radio Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#2C221E] uppercase tracking-wider">
                Blouse Stitching Service:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBlouseOption('unstitched')}
                  className={`p-2.5 rounded-xl border text-xs text-center font-bold transition-all ${
                    blouseOption === 'unstitched'
                      ? 'bg-[#2C221E] text-[#D4AF37] border-[#C28E46]'
                      : 'bg-white text-stone-700 border-[#E6DFC6]'
                  }`}
                >
                  Unstitched (Free)
                </button>

                <button
                  type="button"
                  onClick={() => setBlouseOption('standard')}
                  className={`p-2.5 rounded-xl border text-xs text-center font-bold transition-all ${
                    blouseOption === 'standard'
                      ? 'bg-[#2C221E] text-[#D4AF37] border-[#C28E46]'
                      : 'bg-white text-stone-700 border-[#E6DFC6]'
                  }`}
                >
                  Standard (+₹1,200)
                </button>

                <button
                  type="button"
                  onClick={() => setBlouseOption('custom')}
                  className={`p-2.5 rounded-xl border text-xs text-center font-bold transition-all ${
                    blouseOption === 'custom'
                      ? 'bg-[#2C221E] text-[#D4AF37] border-[#C28E46]'
                      : 'bg-white text-stone-700 border-[#E6DFC6]'
                  }`}
                >
                  Custom Fit (+₹1,800)
                </button>
              </div>

              {/* Standard Size Buttons */}
              {blouseOption === 'standard' && (
                <div className="flex items-center gap-2 pt-2 bg-white p-3 rounded-xl border border-[#E6DFC6]">
                  <span className="text-xs text-stone-600 font-semibold">Select Size:</span>
                  {(['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setStandardBlouseSize(sz)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${
                        standardBlouseSize === sz
                          ? 'bg-[#C28E46] text-white border-[#C28E46]'
                          : 'bg-[#FAF7F2] text-stone-700 border-[#E6DFC6]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              )}

              {/* Custom Measurements Form */}
              {blouseOption === 'custom' && (
                <div className="pt-2">
                  <BlouseMeasurementForm
                    onSave={(m) => setCustomBlouse(m)}
                    compact
                  />
                </div>
              )}
            </div>

            {/* Petticoat Option Checkbox */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E6DFC6] space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-bold text-[#2C221E] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={petticoatOption}
                    onChange={(e) => setPetticoatOption(e.target.checked)}
                    className="rounded text-[#C28E46] focus:ring-[#C28E46] w-4 h-4"
                  />
                  <span>Add Matching Petticoat</span>
                </label>
                <span className="text-xs font-bold text-[#2C221E]">+₹499</span>
              </div>

              {petticoatOption && (
                <div className="flex items-center gap-3 pt-1 pl-6">
                  <span className="text-xs text-stone-500">Fabric Choice:</span>
                  <button
                    type="button"
                    onClick={() => setPetticoatFabric('Cotton Satin')}
                    className={`text-xs px-2.5 py-1 rounded border ${
                      petticoatFabric === 'Cotton Satin'
                        ? 'bg-[#2C221E] text-white border-[#2C221E]'
                        : 'bg-white text-stone-700 border-stone-300'
                    }`}
                  >
                    Cotton Satin
                  </button>
                  <button
                    type="button"
                    onClick={() => setPetticoatFabric('Shimmer Silk')}
                    className={`text-xs px-2.5 py-1 rounded border ${
                      petticoatFabric === 'Shimmer Silk'
                        ? 'bg-[#2C221E] text-white border-[#2C221E]'
                        : 'bg-white text-stone-700 border-stone-300'
                    }`}
                  >
                    Shimmer Silk
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Add to Cart & Buy Now Buttons */}
          <div className="flex items-center gap-3 pt-2">
            {availability?.status === 'OUT_OF_STOCK' ? (
              <button
                id="pdp-add-to-bag-btn-disabled"
                disabled
                className="flex-1 bg-stone-300 text-stone-500 font-bold py-4 rounded-xl shadow-none flex items-center justify-center gap-2 text-sm border border-stone-300 cursor-not-allowed"
              >
                <span>Out of Stock</span>
              </button>
            ) : (
              <button
                id="pdp-add-to-bag-btn"
                onClick={handleAddToCart}
                disabled={isInventoryLoading}
                className={`flex-1 bg-[#2C221E] hover:bg-[#C28E46] text-[#D4AF37] hover:text-[#2C221E] font-bold py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm border border-[#C28E46]/60 group ${isInventoryLoading ? 'opacity-70 cursor-wait' : ''}`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{isInventoryLoading ? 'Checking...' : 'Add to Shopping Bag'}</span>
              </button>
            )}

            <button
              id="pdp-book-video-call-btn"
              onClick={() => setIsVideoModalOpen(true)}
              className="bg-white hover:bg-[#F3EFE6] text-[#2C221E] font-bold p-4 rounded-xl border border-[#C28E46] transition-all flex items-center gap-1.5 shadow-sm text-xs"
              title="Inspect Saree Live on Video"
            >
              <Video className="w-4 h-4 text-[#C28E46]" />
              <span className="hidden sm:inline">Inspect Live</span>
            </button>
          </div>

          {/* PINCODE DELIVERY ESTIMATOR */}
          <div className="bg-white p-4 rounded-2xl border border-[#E6DFC6] space-y-3">
            <h4 className="font-serif font-bold text-xs uppercase text-[#2C221E] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#C28E46]" /> Check Delivery & COD Availability
            </h4>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter 6-digit Pincode (e.g. 110001)"
                maxLength={6}
                className="flex-1 bg-[#FAF7F2] text-xs px-3 py-2 rounded-lg border border-[#E6DFC6] focus:outline-none focus:border-[#C28E46]"
              />
              <button
                type="submit"
                className="bg-[#2C221E] text-[#D4AF37] font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#C28E46] hover:text-[#2C221E] transition-colors"
              >
                Check
              </button>
            </form>

            {pincodeStatus.checked && (
              <div className="text-xs bg-[#2E6F40]/10 text-[#2E6F40] p-2.5 rounded-lg border border-[#2E6F40]/20 flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 shrink-0" />
                <span>
                  Delivers in <strong>{pincodeStatus.deliveryDate}</strong>. Cash on Delivery Available.
                </span>
              </div>
            )}
          </div>

          {/* ACCORDION TABS */}
          <div className="bg-white rounded-2xl border border-[#E6DFC6] overflow-hidden">
            {[
              { id: 'details', label: 'Product Details & Specs' },
              { id: 'craft', label: 'Fabric & Craftsmanship Story' },
              { id: 'wash', label: 'Silk Care & Storage Instructions' },
              { id: 'shipping', label: 'Free Shipping & 15-Day Exchange' }
            ].map((tab) => {
              const isOpen = activeTab === tab.id;
              return (
                <div key={tab.id} className="border-b border-[#F3EFE6] last:border-0">
                  <button
                    onClick={() => setActiveTab(isOpen ? ('' as any) : (tab.id as any))}
                    className="w-full p-4 text-left font-serif font-bold text-sm text-[#2C221E] flex items-center justify-between hover:bg-[#FAF7F2] transition-colors"
                  >
                    <span>{tab.label}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-[#C28E46]" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-stone-600 space-y-2 leading-relaxed bg-[#FAF7F2]">
                      {tab.id === 'details' && (
                        <div className="grid grid-cols-2 gap-2 font-sans">
                          <div><strong>Saree Length:</strong> {product.specifications.length}</div>
                          <div><strong>Width:</strong> {product.specifications.width}</div>
                          <div><strong>Blouse Piece:</strong> {product.specifications.blousePiece}</div>
                          <div><strong>Weight:</strong> {product.specifications.weight}</div>
                          <div><strong>Zari Type:</strong> <GlossaryTerm term={product.zariType}>{product.zariType}</GlossaryTerm></div>
                          <div><strong>Weave:</strong> <GlossaryTerm term={product.weaveType}>{product.weaveType}</GlossaryTerm></div>
                        </div>
                      )}
                      {tab.id === 'craft' && <InteractiveDescription text={product.craftStory} />}
                      {tab.id === 'wash' && <InteractiveDescription text={product.specifications.washCare} />}
                      {tab.id === 'shipping' && (
                        <p>
                          We offer free insured global air shipping on orders above ₹1,999. Every saree is packed in a protective pure cotton muslin garment storage box with Silk Mark credentials.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS / COMPLETE THE LOOK SLIDER */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 border-t border-[#E6DFC6] pt-12">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C221E]">
              Complete The Look
            </h2>
            <Link to={`/collections/${product.category}`} className="text-xs font-bold text-[#C28E46] hover:underline">
              View More in {product.categoryLabel}
            </Link>
          </div>

          {isRelatedLoading ? (
            <ProductGridSkeleton count={4} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((rel: Product) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* AI VIRTUAL TRY-ON MODAL */}
      <VirtualTryOnModal
        product={product}
        selectedColor={selectedColor}
        isOpen={isTryOnModalOpen}
        onClose={() => setIsTryOnModalOpen(false)}
      />
    </div>
  );
};
