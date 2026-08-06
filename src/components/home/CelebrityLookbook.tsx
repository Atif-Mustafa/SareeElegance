import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ShoppingBag, Eye, Heart } from 'lucide-react';

export const CelebrityLookbook: React.FC = () => {
  const navigate = useNavigate();

  const muses = [
    {
      id: 'muse-1',
      name: 'Aditi Rao Hydari Look',
      sareeTitle: 'Tissue Silk Champagne Gold',
      priceINR: '₹32,000',
      event: 'Mani Ratnam Premiere & Gala',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800',
      slug: 'kanjivaram-tissue-silk-golden-champagne-temple-border'
    },
    {
      id: 'muse-2',
      name: 'Sobhita Dhulipala Vibe',
      sareeTitle: 'Royal Maroon Banarasi Katan',
      priceINR: '₹28,500',
      event: 'Royalty Heritage Editorial',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      slug: 'banarasi-katan-silk-maroon-gold-kadwa-jaal'
    },
    {
      id: 'muse-3',
      name: 'Dia Mirza Grace',
      sareeTitle: 'Pastel Blush Banarasi Organza',
      priceINR: '₹22,800',
      event: 'Eco Festive Celebration',
      image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800',
      slug: 'banarasi-organza-pastel-pink-gold-zari-meenakari'
    },
    {
      id: 'muse-4',
      name: 'Kiara Advani Glam',
      sareeTitle: 'Pre-Draped Crimson Georgette',
      priceINR: '₹19,500',
      event: 'Bollywood Sangeet Night',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
      slug: 'ready-to-wear-pre-draped-crimson-silk-saree'
    }
  ];

  return (
    <section id="celebrity-lookbook-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-6">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-[#E6DFC6] pb-4">
        <div>
          <span className="text-xs font-bold text-[#C28E46] uppercase tracking-widest block mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 fill-[#C28E46]" /> Spotted In SareeElegance
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E]">
            Celebrity & Muse Lookbook
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Iconic red carpet drapes and celebrity trousseaus crafted on our handlooms.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {muses.map((muse) => (
          <div
            key={muse.id}
            className="group relative rounded-2xl overflow-hidden bg-white border border-[#E6DFC6] hover:border-[#C28E46] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            {/* Image Container with Tag */}
            <div className="relative aspect-[3/4] overflow-hidden bg-[#2C221E]">
              <img
                src={muse.image}
                alt={muse.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C221E]/80 via-transparent to-transparent opacity-80" />

              {/* Tag */}
              <div className="absolute top-3 left-3 bg-[#2C221E]/90 text-[#D4AF37] border border-[#C28E46]/40 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm">
                {muse.event}
              </div>

              {/* Quick Action Overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30 backdrop-blur-[2px]">
                <button
                  onClick={() => navigate(`/product/${muse.slug}`)}
                  className="bg-[#2C221E] text-[#D4AF37] p-3 rounded-full border border-[#C28E46] hover:scale-110 transition-transform shadow-xl"
                  title="View Look Details"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Card Footer Info */}
            <div className="p-4 bg-white flex flex-col justify-between flex-1 border-t border-[#F3EFE6]">
              <div>
                <span className="text-[10px] font-bold text-[#C28E46] uppercase tracking-wider block">
                  {muse.name}
                </span>
                <h4 className="font-serif font-bold text-sm text-[#2C221E] mt-0.5 line-clamp-1">
                  {muse.sareeTitle}
                </h4>
              </div>

              <div className="mt-3 pt-3 border-t border-[#F3EFE6] flex items-center justify-between">
                <span className="font-bold text-sm text-[#2C221E]">{muse.priceINR}</span>
                <button
                  onClick={() => navigate(`/product/${muse.slug}`)}
                  className="text-xs font-bold text-[#2C221E] hover:text-[#C28E46] flex items-center gap-1 transition-colors"
                >
                  <span>Shop Look</span>
                  <ShoppingBag className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
