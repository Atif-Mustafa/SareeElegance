import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { ProductCard } from '../product/ProductCard';
import { ArrowRight, Palette } from 'lucide-react';

interface ColorOption {
  id: string;
  name: string;
  tagline: string;
  hex: string;
  borderHex?: string;
}

export const ColorPaletteEdit: React.FC = () => {
  const navigate = useNavigate();
  const { products } = useStore();

  const colorOptions: ColorOption[] = [
    { id: 'maroon', name: 'Regal Maroon', tagline: 'Bridal Crimson & Wine', hex: '#6B1D2F' },
    { id: 'gold', name: 'Liquid Gold', tagline: 'Tissue & Antique Zari', hex: '#E6CA65' },
    { id: 'blue', name: 'Peacock Blue', tagline: 'Royal Indigo & Sapphire', hex: '#005F73' },
    { id: 'green', name: 'Emerald Green', tagline: 'Auspicious Temple Shades', hex: '#0B6623' },
    { id: 'pink', name: 'Pastel Blush', tagline: 'Soft Rose & Meenakari', hex: '#FFB6C1' },
    { id: 'red', name: 'Deep Crimson', tagline: 'Traditional Sindoori Red', hex: '#8B0000' }
  ];

  const [selectedColor, setSelectedColor] = useState<string>('maroon');

  // Filter products loosely matching the selected color ID or hex
  const filteredProducts = products.filter((p) => {
    const activeOpt = colorOptions.find((c) => c.id === selectedColor);
    if (!activeOpt) return true;
    const colorNameMatch = p.colors?.some((c) =>
      c.name.toLowerCase().includes(activeOpt.id) ||
      c.name.toLowerCase().includes(activeOpt.name.toLowerCase().split(' ')[1])
    );
    const titleMatch = p.title.toLowerCase().includes(activeOpt.id) ||
      p.subtitle.toLowerCase().includes(activeOpt.id);
    return colorNameMatch || titleMatch;
  });

  const displayProducts = filteredProducts.length > 0 ? filteredProducts : products.slice(0, 4);

  return (
    <section id="color-palette-edit-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-6">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-[#E6DFC6] pb-4">
        <div>
          <span className="text-xs font-bold text-[#C28E46] uppercase tracking-widest block mb-1 flex items-center gap-1">
            <Palette className="w-3.5 h-3.5" /> The Hue Edit
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E]">
            Shop By Signature Palette
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Explore sarees curated by traditional Indian colour spectrums and mood tones.
          </p>
        </div>

        <button
          onClick={() => navigate('/collections/all')}
          className="text-xs font-bold text-[#2C221E] hover:text-[#C28E46] flex items-center gap-1 transition-colors shrink-0"
        >
          <span>Explore All Shades</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Color Swatch Selector Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {colorOptions.map((opt) => {
          const isSelected = selectedColor === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setSelectedColor(opt.id)}
              className={`p-3.5 rounded-2xl text-left border transition-all duration-300 flex flex-col justify-between h-28 relative overflow-hidden group ${
                isSelected
                  ? 'bg-[#2C221E] text-white border-[#C28E46] shadow-lg scale-[1.02]'
                  : 'bg-white text-[#2C221E] border-[#E6DFC6] hover:border-[#C28E46]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className="w-6 h-6 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-110"
                  style={{ backgroundColor: opt.hex }}
                />
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
                )}
              </div>
              <div>
                <h4 className={`font-serif text-xs font-bold leading-tight ${isSelected ? 'text-[#D4AF37]' : 'text-[#2C221E]'}`}>
                  {opt.name}
                </h4>
                <p className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                  {opt.tagline}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Product Grid Filtered by Selected Hue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
        {displayProducts.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
