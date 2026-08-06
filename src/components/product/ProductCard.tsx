import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, ColorOption } from '../../types';
import { useStore } from '../../store/useStore';
import { Heart, Sparkles, ShieldCheck, ShoppingBag, Eye } from 'lucide-react';

interface Props {
  product: Product;
}

export const ProductCard: React.FC<Props> = ({ product }) => {
  const navigate = useNavigate();
  const { formatPrice, toggleWishlist, isInWishlist, addToCart } = useStore();

  const [selectedColor, setSelectedColor] = useState<ColorOption>(product.colors[0]);
  const [isHovered, setIsHovered] = useState(false);

  const wishlisted = isInWishlist(product.id);

  // Calculate discount percent
  const discountPercent = product.compareAtPriceINR
    ? Math.round(((product.compareAtPriceINR - product.priceINR) / product.compareAtPriceINR) * 100)
    : 0;

  const currentImage = isHovered && product.images.length > 1 ? product.images[1] : product.images[0];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedColor, {
      fallAndPico: false,
      blouseOption: 'unstitched',
      petticoatOption: false
    });
  };

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`);
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-2xl overflow-hidden border border-[#E6DFC6] hover:border-[#C28E46] transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col cursor-pointer relative"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#FAF7F2]">
        <img
          src={currentImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isBestseller && (
            <span className="bg-[#2C221E] text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md border border-[#C28E46]/40 flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-[#D4AF37]" /> Bestseller
            </span>
          )}
          {product.isCelebrityChoice && (
            <span className="bg-[#C28E46] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md">
              Celebrity Style
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-[#2E6F40] text-white text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md shadow-md">
              Save {discountPercent}%
            </span>
          )}
        </div>

        {/* Silk Mark Badge Right */}
        {product.silkMarkCertified && (
          <div
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md text-[#2C221E]"
            title="Silk Mark Certified Pure Handloom"
          >
            <ShieldCheck className="w-4 h-4 text-[#C28E46]" />
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute bottom-3 right-3 p-2.5 rounded-full shadow-lg transition-all duration-200 z-10 ${
            wishlisted
              ? 'bg-rose-600 text-white scale-110'
              : 'bg-white/90 text-[#2C221E] hover:bg-white hover:text-rose-600'
          }`}
          title="Save to Wishlist"
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Quick View / Add overlay */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center gap-2 z-10 pr-12">
          <button
            onClick={handleQuickAdd}
            className="flex-1 bg-[#2C221E]/90 hover:bg-[#2C221E] text-[#D4AF37] font-bold text-xs py-2.5 px-3 rounded-xl backdrop-blur-sm border border-[#C28E46]/40 transition-colors shadow-xl flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Category & Fabric */}
          <div className="flex items-center justify-between text-[11px] text-[#8C7262] uppercase tracking-wider font-semibold mb-1">
            <span>{product.fabric}</span>
            <span className="text-stone-400">★ {product.rating.toFixed(1)} ({product.reviewsCount})</span>
          </div>

          {/* Title */}
          <h3 className="font-serif text-lg font-bold text-[#2C221E] group-hover:text-[#C28E46] transition-colors line-clamp-1">
            {product.title}
          </h3>

          <p className="text-xs text-stone-500 line-clamp-1">{product.subtitle}</p>
        </div>

        {/* Swatches & Pricing */}
        <div className="pt-2 border-t border-[#F3EFE6] space-y-2">
          {/* Color Swatches */}
          {product.colors.length > 0 && (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <span className="text-[10px] text-stone-400 mr-1">Shades:</span>
              {product.colors.map((col) => (
                <button
                  key={col.name}
                  onClick={() => setSelectedColor(col)}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    selectedColor.name === col.name
                      ? 'ring-2 ring-[#C28E46] ring-offset-1 scale-110'
                      : 'border-stone-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                />
              ))}
            </div>
          )}

          {/* Prices & Savings */}
          <div className="flex items-baseline justify-between pt-1">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-base text-[#2C221E]">
                {formatPrice(product.priceINR)}
              </span>
              {product.compareAtPriceINR && (
                <span className="text-xs text-stone-400 line-through">
                  {formatPrice(product.compareAtPriceINR)}
                </span>
              )}
            </div>

            {discountPercent > 0 && (
              <span className="text-[11px] font-bold text-[#2E6F40]">
                Save {formatPrice(product.compareAtPriceINR! - product.priceINR)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
