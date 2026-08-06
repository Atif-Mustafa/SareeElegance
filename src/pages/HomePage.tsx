import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { mockCategories } from '../data/mockData';
import { ProductCard } from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/product/ProductCardSkeleton';
import { TrustFeaturesStrip } from '../components/home/TrustFeaturesStrip';
import { ColorPaletteEdit } from '../components/home/ColorPaletteEdit';
import { OccasionCuration } from '../components/home/OccasionCuration';
import { VideoShoppingBanner } from '../components/home/VideoShoppingBanner';
import { CelebrityLookbook } from '../components/home/CelebrityLookbook';
import { ShopTheLookHotspots } from '../components/home/ShopTheLookHotspots';
import { ArtisansSection } from '../components/home/ArtisansSection';
import { RealWomenGallery } from '../components/home/RealWomenGallery';
import { InstagramGrid } from '../components/home/InstagramGrid';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Video,
  Star,
  Quote,
  ChevronRight,
  Flame
} from 'lucide-react';
import { motion } from 'motion/react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { products, setIsVideoModalOpen } = useStore();
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [isBestsellersLoading, setIsBestsellersLoading] = useState(false);

  React.useEffect(() => {
    setIsBestsellersLoading(true);
    const timer = setTimeout(() => {
      setIsBestsellersLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [activeCategoryFilter]);

  const bestsellers = products.filter((p) => {
    if (activeCategoryFilter === 'all') return p.isBestseller || p.isCelebrityChoice;
    return p.category === activeCategoryFilter;
  });

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* HERO BANNER SECTION (Asymmetric Layered Luxury Design) */}
      <section className="relative overflow-hidden pt-6 md:pt-10 pb-12 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center bg-[#FAF7F2] p-8 sm:p-12 lg:p-16 rounded-3xl border border-[#F3EFE6] shadow-sm">
          {/* Left Column Text & CTAs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex flex-col items-start"
          >
            {/* Tag eyebrow */}
            <span className="inline-block px-3 py-1 bg-[#C28E46]/10 text-[#C28E46] text-[10px] font-bold tracking-[0.3em] uppercase mb-6 border-l-2 border-[#C28E46]">
              The 2026 Heritage Edit
            </span>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-serif leading-[0.95] text-[#2C221E] mb-6 font-bold tracking-tight">
              Discover the <br />
              Beauty of <span className="italic text-[#C28E46] font-normal">Handwoven</span> Luxe
            </h1>

            {/* Body paragraph */}
            <p className="text-[#2C221E]/60 max-w-md mb-8 leading-relaxed text-sm sm:text-base">
              Pure mulberry silk yarn and real gold zari woven on traditional looms in Varanasi and Kanchipuram. Certified authentic Silk Mark heirlooms crafted for generations.
            </p>

            {/* Primary & Secondary Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/collections/all"
                id="hero-shop-collection-cta"
                className="bg-[#2C221E] text-white px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#C28E46] transition-colors shadow-xl inline-flex items-center gap-2"
              >
                <span>Shop Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                id="hero-video-shopping-cta"
                onClick={() => setIsVideoModalOpen(true)}
                className="border border-[#2C221E]/20 text-[#2C221E] px-8 py-4 text-xs font-bold uppercase tracking-widest hover:border-[#2C221E] hover:bg-white transition-colors inline-flex items-center gap-2"
              >
                <Video className="w-4 h-4 text-[#C28E46]" />
                <span>Book Video Tour</span>
              </button>
            </div>

            {/* Micro Stats */}
            <div className="mt-12 sm:mt-16 flex items-center gap-8 sm:gap-12 pt-8 border-t border-[#2C221E]/10 w-full">
              <div>
                <span className="text-xl sm:text-2xl font-serif font-bold text-[#2C221E] block">100%</span>
                <span className="text-[10px] uppercase tracking-wider opacity-60 text-[#2C221E]">Pure Silk Yarn</span>
              </div>
              <div className="w-px h-8 bg-[#2C221E]/10" />
              <div>
                <span className="text-xl sm:text-2xl font-serif font-bold text-[#2C221E] block">180+</span>
                <span className="text-[10px] uppercase tracking-wider opacity-60 text-[#2C221E]">Artisan Hours</span>
              </div>
              <div className="w-px h-8 bg-[#2C221E]/10" />
              <div>
                <span className="text-xl sm:text-2xl font-serif font-bold text-[#2C221E] block">12k+</span>
                <span className="text-[10px] uppercase tracking-wider opacity-60 text-[#2C221E]">Global Brides</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Offset Overlapping Image Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-5 relative flex justify-center lg:justify-end items-center py-6"
          >
            {/* Main Image Container */}
            <div className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-[4/5] bg-[#E5E1DA] shadow-2xl overflow-hidden group rounded-2xl border border-[#F3EFE6]">
              <img
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800"
                alt="Banarasi Sky Blue Silk Saree"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C221E]/70 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#D4AF37] block mb-0.5">Masterpiece Drape</span>
                <p className="font-serif text-base font-bold">Varanasi Kadwa Zari Brocade</p>
              </div>
            </div>

            {/* Overlapping Offset Card */}
            <div className="absolute top-1/2 -left-2 sm:-left-8 lg:-left-12 -translate-y-1/2 w-[220px] sm:w-[260px] h-[280px] sm:h-[320px] bg-white p-3.5 shadow-2xl border border-[#F3EFE6] flex flex-col rounded-xl z-20">
              <div className="relative flex-1 overflow-hidden rounded-lg mb-3">
                <img
                  src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=500"
                  alt="Bridal Silk Saree"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 bg-[#2C221E] text-[#D4AF37] text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                  Bridal Pick
                </span>
              </div>
              <div>
                <h4 className="font-serif font-bold text-xs text-[#2C221E] truncate">Maroon Katan Kadwa Jaal</h4>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="font-bold text-[#C28E46]">₹28,500</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Silk Mark ✓</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4-PILLAR VALUE PROPOSITION STRIP */}
      <TrustFeaturesStrip />

      {/* CATEGORY HIGHLIGHTS (Horizontal Cards Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-[#E6DFC6] pb-4">
          <div>
            <span className="text-xs font-bold text-[#C28E46] uppercase tracking-widest block mb-1">
              Curated Heritage Categories
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E]">
              Explore Weaving Regions
            </h2>
          </div>
          <Link
            to="/collections/all"
            className="text-xs font-bold text-[#2C221E] hover:text-[#C28E46] flex items-center gap-1 transition-colors"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/collections/${cat.slug}`)}
              className="group relative h-80 rounded-2xl overflow-hidden shadow-lg border border-[#E6DFC6] hover:border-[#C28E46] cursor-pointer transition-all duration-300"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C221E] via-[#2C221E]/40 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 space-y-2 text-white">
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest bg-[#2C221E]/60 px-2.5 py-1 rounded-md border border-[#C28E46]/30 backdrop-blur-sm inline-block">
                  {cat.itemCount}
                </span>
                <h3 className="font-serif text-2xl font-bold leading-tight group-hover:text-[#D4AF37] transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-stone-300 line-clamp-2">{cat.description}</p>
                <div className="pt-2 flex items-center gap-1 text-xs font-bold text-[#D4AF37] group-hover:translate-x-1 transition-transform">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SIGNATURE COLOR PALETTE EDIT */}
      <ColorPaletteEdit />

      {/* OUR BESTSELLERS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#E6DFC6] pb-4">
          <div>
            <span className="text-xs font-bold text-[#C28E46] uppercase tracking-widest block mb-1 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-[#C28E46]" /> Royal Favorites
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E]">
              Our Bestselling Handloom Sarees
            </h2>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {[
              { id: 'all', label: 'All Bestsellers' },
              { id: 'banarasi', label: 'Banarasi' },
              { id: 'kanjivaram', label: 'Kanjivaram' },
              { id: 'tissue-silk', label: 'Tissue Silk' },
              { id: 'ready-to-wear', label: 'Ready to Wear' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategoryFilter(tab.id)}
                className={`text-xs font-semibold px-4 py-2 rounded-full transition-all shrink-0 ${
                  activeCategoryFilter === tab.id
                    ? 'bg-[#2C221E] text-[#D4AF37] border border-[#C28E46] shadow-md'
                    : 'bg-white text-stone-700 border border-[#E6DFC6] hover:border-[#C28E46]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4-Column Product Cards Grid */}
        {isBestsellersLoading ? (
          <ProductGridSkeleton count={4} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellers.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* SHOP BY OCCASION & TROUSSEAU */}
      <OccasionCuration />

      {/* SHOP THE LOOK INTERACTIVE HOTSPOTS */}
      <ShopTheLookHotspots />

      {/* INTERACTIVE VIDEO SHOPPING BANNER */}
      <VideoShoppingBanner />

      {/* BRAND HERITAGE STORY BLOCK */}
      <section className="bg-[#2C221E] text-white py-16 md:py-24 border-y-4 border-[#C28E46]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Visual Banner */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#C28E46]/50 shadow-2xl aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1000"
                alt="Master Weaver Artisan"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C221E] via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 bg-[#2C221E]/90 p-4 rounded-xl border border-[#C28E46]/40 backdrop-blur-md flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-[#D4AF37] shrink-0" />
                <div>
                  <h4 className="font-serif text-sm font-bold text-white">Silk Mark Authorized Retailer</h4>
                  <p className="text-[11px] text-stone-300">100% Guaranteed Pure Mulberry Silk Yarn with Holographic Tag</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Text Content */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest block">
              Centuries of Handloom Craftsmanship
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white">
              Preserving the Authentic Legacy of Handwoven Indian Silk
            </h2>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
              In an era of mass powerloom replicas, SareeElegance partners directly with traditional weaving families in Varanasi and Kanchipuram. Every thread of gold zari and mulberry silk is selected for pristine weight, lustre, and longevity.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-[#3A2E2A] rounded-xl border border-[#C28E46]/30">
                <Award className="w-5 h-5 text-[#D4AF37] mb-2" />
                <h4 className="font-serif font-bold text-sm text-white">Kadwa & Korvai Masters</h4>
                <p className="text-xs text-stone-400">Zero loose floating threads. Every motif hand-punched and interlocked.</p>
              </div>

              <div className="p-4 bg-[#3A2E2A] rounded-xl border border-[#C28E46]/30">
                <Sparkles className="w-5 h-5 text-[#D4AF37] mb-2" />
                <h4 className="font-serif font-bold text-sm text-white">Tested Pure Zari</h4>
                <p className="text-xs text-stone-400">Real silver threads electroplated with pure gold for lasting radiance.</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/heritage"
                className="inline-flex items-center gap-2 bg-[#C28E46] hover:bg-[#D4AF37] text-[#2C221E] font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-lg"
              >
                <span>Read Our Weaving Heritage Story</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MEET THE MASTER ARTISANS CAROUSEL */}
      <ArtisansSection />

      {/* CELEBRITY & MUSE LOOKBOOK */}
      <CelebrityLookbook />

      {/* TRUST & TESTIMONIALS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#C28E46] uppercase tracking-widest block">
            Love From Silk Collectors Worldwide
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E]">
            Client Stories & Reviews
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E6DFC6] shadow-sm space-y-4 relative">
            <Quote className="w-8 h-8 text-[#C28E46]/30 absolute top-4 right-4" />
            <div className="flex items-center gap-1 text-[#D4AF37]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
              ))}
            </div>
            <p className="text-xs text-stone-700 leading-relaxed italic">
              "The Tissue Silk saree in Rose Gold was the star of my wedding reception in London. The customized blouse fitted seamlessly using their measurement form. The gold zari lustre is out of this world!"
            </p>
            <div className="pt-2 border-t border-[#F3EFE6] flex items-center justify-between">
              <div>
                <strong className="font-serif text-sm text-[#2C221E] block">Priya Patel-Singhania</strong>
                <span className="text-[10px] text-stone-400">London, UK • Verified Trousseau Buyer</span>
              </div>
              <span className="text-[10px] bg-[#2E6F40]/10 text-[#2E6F40] font-bold px-2 py-0.5 rounded">Verified</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E6DFC6] shadow-sm space-y-4 relative">
            <Quote className="w-8 h-8 text-[#C28E46]/30 absolute top-4 right-4" />
            <div className="flex items-center gap-1 text-[#D4AF37]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
              ))}
            </div>
            <p className="text-xs text-stone-700 leading-relaxed italic">
              "The Video Shopping call saved my life! The stylist showed 8 Banarasi Katan sarees in real sunlight over WhatsApp video. Ordered and received in Bengaluru within 48 hours!"
            </p>
            <div className="pt-2 border-t border-[#F3EFE6] flex items-center justify-between">
              <div>
                <strong className="font-serif text-sm text-[#2C221E] block">Radhika Sharma</strong>
                <span className="text-[10px] text-stone-400">Bengaluru, Karnataka</span>
              </div>
              <span className="text-[10px] bg-[#2E6F40]/10 text-[#2E6F40] font-bold px-2 py-0.5 rounded">Verified</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E6DFC6] shadow-sm space-y-4 relative">
            <Quote className="w-8 h-8 text-[#C28E46]/30 absolute top-4 right-4" />
            <div className="flex items-center gap-1 text-[#D4AF37]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
              ))}
            </div>
            <p className="text-xs text-stone-700 leading-relaxed italic">
              "Genuine Kanjivaram Korvai weave with real silver zari certified with Silk Mark tag. Highly recommend SareeElegance for anyone building a heritage handloom wardrobe."
            </p>
            <div className="pt-2 border-t border-[#F3EFE6] flex items-center justify-between">
              <div>
                <strong className="font-serif text-sm text-[#2C221E] block">Dr. Meenakshi Sundaram</strong>
                <span className="text-[10px] text-stone-400">Chennai, Tamil Nadu</span>
              </div>
              <span className="text-[10px] bg-[#2E6F40]/10 text-[#2E6F40] font-bold px-2 py-0.5 rounded">Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* REAL WOMEN OF SAREEELEGANCE USER GENERATED GALLERY */}
      <RealWomenGallery />

      {/* SHOPPABLE INSTAGRAM COMMUNITY GRID */}
      <InstagramGrid />
    </div>
  );
};
