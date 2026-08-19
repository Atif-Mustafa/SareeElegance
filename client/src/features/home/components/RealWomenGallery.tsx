import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { mockProducts as products } from '@/features/catalog/data/mockData';
import {
  Heart,
  Instagram,
  ShoppingBag,
  Star,
  MapPin,
  CheckCircle2,
  Sparkles,
  X,
  Camera,
  Upload,
  ArrowRight,
  Filter
} from 'lucide-react';

interface UGCPost {
  id: string;
  authorName: string;
  handle: string;
  avatar: string;
  location: string;
  occasionCategory: 'Weddings' | 'Festive' | 'Galas' | 'Cocktail';
  sareeTitle: string;
  sareeSlug: string;
  priceINR: number;
  image: string;
  storyText: string;
  rating: number;
  likesCount: number;
  verifiedBuyer: boolean;
  date: string;
}

export const RealWomenGallery: React.FC = () => {
  const navigate = useNavigate();
  const { formatPrice, addToCart, addToast, setIsCartOpen } = useStore();

  const ugcPosts: UGCPost[] = [
    {
      id: 'ugc-1',
      authorName: 'Dr. Ananya Deshmukh',
      handle: '@ananya_deshmukh',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      location: 'Lake Como, Italy',
      occasionCategory: 'Weddings',
      sareeTitle: 'Royal Maroon Banarasi Katan Silk',
      sareeSlug: 'banarasi-katan-silk-maroon-gold-kadwa-jaal',
      priceINR: 28500,
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      storyText: 'Wore this 3D Kadwa Jaal masterpiece for my sister’s destination wedding in Villa d’Este. The real gold zari caught the Italian golden hour light so beautifully. Everyone thought it was a royal family heirloom!',
      rating: 5,
      likesCount: 3420,
      verifiedBuyer: true,
      date: '2 weeks ago'
    },
    {
      id: 'ugc-2',
      authorName: 'Meera & Siddharth Iyer',
      handle: '@meera.iyer.drapes',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      location: 'Chennai & Singapore',
      occasionCategory: 'Weddings',
      sareeTitle: 'Heavy Kanjivaram Peacock Blue Silk',
      sareeSlug: 'kanjivaram-silk-peacock-blue-coral-zari-border',
      priceINR: 24000,
      image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800',
      storyText: 'The contrast coral pallu and thick gold zari border made my Muhurtham ceremony unforgettable. The weight of pure silk was incredibly rich without feeling heavy during long rituals.',
      rating: 5,
      likesCount: 2890,
      verifiedBuyer: true,
      date: '1 month ago'
    },
    {
      id: 'ugc-3',
      authorName: 'Natasha Kapoor',
      handle: '@natashakapoor_nyc',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
      location: 'New York City, USA',
      occasionCategory: 'Galas',
      sareeTitle: 'Champagne Gold Tissue Kanjivaram',
      sareeSlug: 'kanjivaram-tissue-silk-golden-champagne-temple-border',
      priceINR: 32000,
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800',
      storyText: 'Draped this liquid champagne tissue silk for the Met Cultural Gala in Manhattan. I booked a Video Call session with SareeElegance stylists prior to ordering—they even matched the exact gold blouse length for me!',
      rating: 5,
      likesCount: 4150,
      verifiedBuyer: true,
      date: '3 weeks ago'
    },
    {
      id: 'ugc-4',
      authorName: 'Rhea Sen Gupta',
      handle: '@rheasengupta',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      location: 'London, United Kingdom',
      occasionCategory: 'Festive',
      sareeTitle: 'Pastel Pink Organza Meenakari Saree',
      sareeSlug: 'banarasi-organza-pastel-pink-gold-zari-meenakari',
      priceINR: 22800,
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
      storyText: 'Light as air yet so festive! The Meenakari floral threadwork gave a delicate pastel glow during Diwali family dinners in Mayfair.',
      rating: 5,
      likesCount: 1980,
      verifiedBuyer: true,
      date: '1 month ago'
    },
    {
      id: 'ugc-5',
      authorName: 'Pooja Reddy',
      handle: '@poojareddy_style',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      location: 'Bengaluru, India',
      occasionCategory: 'Cocktail',
      sareeTitle: 'Ready To Wear Pre-Draped Crimson Georgette',
      sareeSlug: 'ready-to-wear-pre-draped-crimson-silk-saree',
      priceINR: 19500,
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      storyText: 'Took me literally 60 seconds to drape for my friend’s Sangeet night! No pleating hassle, perfectly pre-stitched, and allowed me to dance all night.',
      rating: 5,
      likesCount: 5210,
      verifiedBuyer: true,
      date: '5 days ago'
    },
    {
      id: 'ugc-6',
      authorName: 'Shalini Verma',
      handle: '@shalini_verma_dubai',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      location: 'Dubai, UAE',
      occasionCategory: 'Festive',
      sareeTitle: 'Emerald Green Kanjivaram Gold Brocade',
      sareeSlug: 'kanjivaram-emerald-green-gold-brocade-zari',
      priceINR: 26500,
      image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800',
      storyText: 'The Silk Mark certification tag gave me total confidence ordering online. Express global delivery reached Dubai in just 3 days!',
      rating: 5,
      likesCount: 2310,
      verifiedBuyer: true,
      date: '2 weeks ago'
    }
  ];

  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [activeModalPost, setActiveModalPost] = useState<UGCPost | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Form state for photo submission
  const [submitName, setSubmitName] = useState('');
  const [submitHandle, setSubmitHandle] = useState('');
  const [submitCity, setSubmitCity] = useState('');
  const [submitReview, setSubmitReview] = useState('');

  const filteredPosts = ugcPosts.filter((post) => {
    if (selectedFilter === 'All') return true;
    return post.occasionCategory === selectedFilter;
  });

  const toggleLike = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleQuickAddPostSaree = (post: UGCPost, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const catalogProduct = products.find((p) => p.slug === post.sareeSlug) || products[0];
    const defaultColor = catalogProduct.colors?.[0] || {
      name: 'Default',
      hex: '#2C221E',
    };
    addToCart(catalogProduct, defaultColor, {
      fallAndPico: true,
      blouseOption: 'unstitched',
      petticoatOption: false
    }, 1);
    addToast(`Added "${post.sareeTitle}" to your cart!`, 'success');
    setIsCartOpen(true);
  };

  const handleSubmitPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Thank you! Your story has been submitted. Check your email for your ₹1,000 credit voucher!', 'success');
    setIsSubmitModalOpen(false);
    setSubmitName('');
    setSubmitHandle('');
    setSubmitCity('');
    setSubmitReview('');
  };

  return (
    <section id="real-women-gallery-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-8">
      {/* Section Title & Story Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-[#E6DFC6] pb-6">
        <div>
          <span className="text-xs font-bold text-[#C28E46] uppercase tracking-widest block mb-1 flex items-center gap-1.5">
            <Instagram className="w-4 h-4 text-[#C28E46]" /> #WomenOfElegance
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E]">
            Real Women of SareeElegance
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
            Explore authentic photos and celebratory stories shared by our global patrons from over 45 countries.
          </p>
        </div>

        {/* CTA & Submit Button */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            id="submit-your-drape-btn"
            className="bg-[#2C221E] hover:bg-[#C28E46] text-[#D4AF37] hover:text-[#2C221E] font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 border border-[#C28E46]"
          >
            <Camera className="w-4 h-4" />
            <span>Submit Your Drape & Win ₹1,000</span>
          </button>
        </div>
      </div>

      {/* Occasion Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-2 shrink-0 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter By:
        </span>
        {['All', 'Weddings', 'Galas', 'Festive', 'Cocktail'].map((cat) => {
          const isSelected = selectedFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                isSelected
                  ? 'bg-[#2C221E] text-[#D4AF37] border border-[#C28E46] shadow-md'
                  : 'bg-white text-stone-600 border border-[#E6DFC6] hover:border-[#C28E46] hover:text-[#2C221E]'
              }`}
            >
              {cat === 'All' ? 'All Global Drapes' : cat}
            </button>
          );
        })}
      </div>

      {/* UGC Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => {
          const isLiked = likedPosts[post.id];
          return (
            <div
              key={post.id}
              onClick={() => setActiveModalPost(post)}
              className="group relative bg-white rounded-2xl overflow-hidden border border-[#E6DFC6] hover:border-[#C28E46] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
            >
              {/* Card Header: User Info */}
              <div className="p-4 flex items-center justify-between border-b border-[#F3EFE6] bg-[#FAF7F2]">
                <div className="flex items-center gap-3">
                  <img
                    src={post.avatar}
                    alt={post.authorName}
                    className="w-10 h-10 rounded-full object-cover border border-[#C28E46]"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="font-serif font-bold text-xs text-[#2C221E]">
                        {post.authorName}
                      </h4>
                      {post.verifiedBuyer && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                      )}
                    </div>
                    <span className="text-[10px] text-stone-500 font-medium flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-[#C28E46]" /> {post.location}
                    </span>
                  </div>
                </div>

                <span className="text-[9px] font-bold text-[#C28E46] uppercase bg-white px-2 py-0.5 rounded border border-[#E6DFC6]">
                  {post.occasionCategory}
                </span>
              </div>

              {/* Photo Container */}
              <div className="relative aspect-[4/5] bg-[#2C221E] overflow-hidden">
                <img
                  src={post.image}
                  alt={post.sareeTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Like Button Badge */}
                <button
                  onClick={(e) => toggleLike(post.id, e)}
                  className="absolute top-3 right-3 bg-[#2C221E]/80 text-white p-2 rounded-full border border-white/30 backdrop-blur-md hover:scale-110 transition-transform"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isLiked ? 'fill-red-500 text-red-500' : 'text-white'
                    }`}
                  />
                </button>

                {/* Quick Shop Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#2C221E] via-[#2C221E]/70 to-transparent text-white space-y-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                    ))}
                  </div>

                  <p className="text-xs text-stone-200 line-clamp-2 italic font-serif leading-snug">
                    "{post.storyText}"
                  </p>

                  <div className="pt-1 flex items-center justify-between text-xs border-t border-white/20">
                    <div>
                      <span className="text-[9px] text-[#D4AF37] uppercase font-bold block">
                        Draped Saree
                      </span>
                      <span className="font-serif font-bold text-white line-clamp-1">
                        {post.sareeTitle}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleQuickAddPostSaree(post, e)}
                      className="bg-[#C28E46] hover:bg-[#D4AF37] text-[#2C221E] font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-md transition-colors shrink-0 flex items-center gap-1"
                    >
                      <ShoppingBag className="w-3 h-3" /> Shop
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Footer: Social stats */}
              <div className="px-4 py-3 bg-white flex items-center justify-between text-[11px] text-stone-500 font-medium">
                <span className="flex items-center gap-1 text-[#2C221E]">
                  <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                  <strong>{(post.likesCount + (isLiked ? 1 : 0)).toLocaleString()}</strong> loves
                </span>
                <span>{post.date}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* UGC Lightbox Modal */}
      {activeModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 relative border border-[#C28E46]">
            {/* Close Button */}
            <button
              onClick={() => setActiveModalPost(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-[#2C221E] text-white hover:text-[#D4AF37] flex items-center justify-center border border-[#C28E46]"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Image Left */}
            <div className="md:col-span-7 bg-[#2C221E] relative aspect-[4/5] md:aspect-auto">
              <img
                src={activeModalPost.image}
                alt={activeModalPost.sareeTitle}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Modal Right Info & Shop */}
            <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-[#FAF7F2]">
              <div className="space-y-4">
                {/* User Header */}
                <div className="flex items-center gap-3">
                  <img
                    src={activeModalPost.avatar}
                    alt={activeModalPost.authorName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#C28E46]"
                  />
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#2C221E]">
                      {activeModalPost.authorName}
                    </h3>
                    <p className="text-xs text-[#C28E46] font-semibold">{activeModalPost.handle}</p>
                    <span className="text-[10px] text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#C28E46]" /> {activeModalPost.location}
                    </span>
                  </div>
                </div>

                {/* Rating & Story */}
                <div className="space-y-2 bg-white p-4 rounded-2xl border border-[#E6DFC6]">
                  <div className="flex items-center gap-1">
                    {[...Array(activeModalPost.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                    ))}
                    <span className="text-xs font-bold text-stone-600 ml-1">5.0 / 5.0</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 italic leading-relaxed">
                    "{activeModalPost.storyText}"
                  </p>
                </div>

                {/* Product Detail Box */}
                <div className="p-4 bg-white rounded-2xl border border-[#C28E46]/40 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#C28E46] tracking-wider block">
                    Verified Customer Purchase
                  </span>
                  <h4 className="font-serif font-bold text-sm text-[#2C221E]">
                    {activeModalPost.sareeTitle}
                  </h4>
                  <p className="text-sm font-bold text-[#2C221E]">
                    {formatPrice(activeModalPost.priceINR)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => {
                    handleQuickAddPostSaree(activeModalPost);
                    setActiveModalPost(null);
                  }}
                  className="w-full bg-[#2C221E] hover:bg-[#C28E46] text-[#D4AF37] hover:text-[#2C221E] font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 border border-[#C28E46]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add To Cart ({formatPrice(activeModalPost.priceINR)})</span>
                </button>

                <button
                  onClick={() => {
                    navigate(`/product/${activeModalPost.sareeSlug}`);
                    setActiveModalPost(null);
                  }}
                  className="w-full bg-white hover:bg-[#E6DFC6]/50 text-[#2C221E] font-bold text-xs uppercase tracking-wider py-3 rounded-xl border border-[#E6DFC6] transition-colors flex items-center justify-center gap-2"
                >
                  <span>View Product Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Photo Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF7F2] rounded-3xl max-w-lg w-full p-6 sm:p-8 border-2 border-[#C28E46] shadow-2xl relative">
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white text-stone-700 hover:text-black flex items-center justify-center border border-[#E6DFC6]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-[#2C221E] text-[#D4AF37] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#C28E46]">
                <Sparkles className="w-3.5 h-3.5" /> Community Lookbook
              </div>

              <h3 className="font-serif text-2xl font-bold text-[#2C221E]">
                Share Your Saree Story
              </h3>

              <p className="text-xs text-stone-600 leading-relaxed">
                Submit a high-resolution photo wearing your SareeElegance drape. Once verified, get featured on our global gallery + receive a <strong>₹1,000 store voucher</strong>!
              </p>

              <form onSubmit={handleSubmitPhoto} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#2C221E] mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={submitName}
                    onChange={(e) => setSubmitName(e.target.value)}
                    placeholder="e.g. Priyadarshini Rao"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E6DFC6] rounded-xl text-xs text-[#2C221E] focus:outline-none focus:border-[#C28E46]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#2C221E] mb-1">Instagram Handle</label>
                    <input
                      type="text"
                      required
                      value={submitHandle}
                      onChange={(e) => setSubmitHandle(e.target.value)}
                      placeholder="@priya_drapes"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E6DFC6] rounded-xl text-xs text-[#2C221E] focus:outline-none focus:border-[#C28E46]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2C221E] mb-1">City & Country</label>
                    <input
                      type="text"
                      required
                      value={submitCity}
                      onChange={(e) => setSubmitCity(e.target.value)}
                      placeholder="e.g. Sydney, Australia"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E6DFC6] rounded-xl text-xs text-[#2C221E] focus:outline-none focus:border-[#C28E46]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C221E] mb-1">Your Story / Experience</label>
                  <textarea
                    required
                    rows={3}
                    value={submitReview}
                    onChange={(e) => setSubmitReview(e.target.value)}
                    placeholder="Tell us about the occasion you wore this saree for..."
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E6DFC6] rounded-xl text-xs text-[#2C221E] focus:outline-none focus:border-[#C28E46]"
                  />
                </div>

                <div className="border-2 border-dashed border-[#C28E46]/60 rounded-xl p-4 text-center bg-white space-y-1">
                  <Upload className="w-6 h-6 text-[#C28E46] mx-auto" />
                  <p className="text-xs font-bold text-[#2C221E]">Click or drag photo here</p>
                  <p className="text-[10px] text-stone-500">Supports JPG, PNG up to 10MB</p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#2C221E] hover:bg-[#C28E46] text-[#D4AF37] hover:text-[#2C221E] font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md border border-[#C28E46] flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Submit Photo & Claim Voucher</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
