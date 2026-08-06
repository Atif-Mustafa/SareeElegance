import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Gem, Crown, HeartHandshake, SunMedium } from 'lucide-react';

export const OccasionCuration: React.FC = () => {
  const navigate = useNavigate();

  const occasions = [
    {
      id: 'bridal',
      title: 'Bridal Trousseau',
      tagline: 'Heavy Kadwa & Kanchipuram Brocades',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      icon: Crown,
      badge: 'Heritage Heirloom',
      query: 'Bridal'
    },
    {
      id: 'reception',
      title: 'Reception & Cocktail',
      tagline: 'Metallic Tissue & Ready To Wear Pre-Drapes',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800',
      icon: Gem,
      badge: 'Modern Shimmer',
      query: 'Reception & Party'
    },
    {
      id: 'festive',
      title: 'Festive & Pujas',
      tagline: 'Pure Organza, Chanderi & Classic Silk',
      image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800',
      icon: SunMedium,
      badge: 'Auspicious Grace',
      query: 'Festive'
    },
    {
      id: 'sangeet',
      title: 'Sangeet & Mehendi',
      tagline: 'Vibrant Colors & Fluid Georgette Drapes',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
      icon: HeartHandshake,
      badge: 'Celebration Ready',
      query: 'Cocktail'
    }
  ];

  return (
    <section id="occasion-curation-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-[#C28E46] uppercase tracking-widest block flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 fill-[#C28E46]" /> Celebratory Edit
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E]">
          Shop By Occasion & Trousseau
        </h2>
        <p className="text-xs text-stone-600">
          Handpicked weaves curated for life's most precious grand moments and festive rituals.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {occasions.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => navigate(`/collections/all?occasion=${encodeURIComponent(item.query)}`)}
              className="group relative h-96 rounded-2xl overflow-hidden border border-[#E6DFC6] hover:border-[#C28E46] shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 flex flex-col justify-between p-6 bg-[#2C221E]"
            >
              {/* Background Image */}
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C221E] via-[#2C221E]/40 to-transparent" />

              {/* Top Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider bg-[#2C221E]/80 px-2.5 py-1 rounded-md border border-[#C28E46]/40 backdrop-blur-sm inline-flex items-center gap-1">
                  <IconComponent className="w-3 h-3 text-[#D4AF37]" />
                  {item.badge}
                </span>
              </div>

              {/* Bottom Content */}
              <div className="relative z-10 space-y-2 text-white">
                <h3 className="font-serif text-2xl font-bold leading-tight group-hover:text-[#D4AF37] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-300 leading-snug">{item.tagline}</p>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] group-hover:translate-x-1.5 transition-transform">
                  <span>Explore Curation</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
