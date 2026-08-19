import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Instagram, ShoppingBag, Heart } from 'lucide-react';

export const InstagramGrid: React.FC = () => {
  const navigate = useNavigate();

  const instaPosts = [
    {
      id: 'ig-1',
      handle: '@priya_singhania',
      sareeName: 'Tissue Silk Champagne Gold',
      location: 'London, UK',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600',
      likes: '1.4k',
      slug: 'kanjivaram-tissue-silk-golden-champagne-temple-border'
    },
    {
      id: 'ig-2',
      handle: '@radhika.drapes',
      sareeName: 'Katan Silk Royal Maroon',
      location: 'Mumbai, IN',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600',
      likes: '2.8k',
      slug: 'banarasi-katan-silk-maroon-gold-kadwa-jaal'
    },
    {
      id: 'ig-3',
      handle: '@ananya_couture',
      sareeName: 'Kanjivaram Peacock Blue',
      location: 'Bengaluru, IN',
      image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=600',
      likes: '950',
      slug: 'kanjivaram-silk-peacock-blue-coral-zari-border'
    },
    {
      id: 'ig-4',
      handle: '@trousseau_journal',
      sareeName: 'Pre-Draped Crimson Georgette',
      location: 'New York, US',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600',
      likes: '3.1k',
      slug: 'ready-to-wear-pre-draped-crimson-silk-saree'
    },
    {
      id: 'ig-5',
      handle: '@silk_heritage_diaries',
      sareeName: 'Pastel Blush Organza',
      location: 'Dubai, UAE',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600',
      likes: '1.9k',
      slug: 'banarasi-organza-pastel-pink-gold-zari-meenakari'
    },
    {
      id: 'ig-6',
      handle: '@meenakshi_sundaram',
      sareeName: 'Emerald Gold Kanjivaram',
      location: 'Chennai, IN',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600',
      likes: '4.2k',
      slug: 'kanjivaram-emerald-green-gold-brocade-zari'
    }
  ];

  return (
    <section id="shoppable-instagram-community-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C28E46] uppercase tracking-widest hover:underline"
        >
          <Instagram className="w-4 h-4 text-[#C28E46]" /> #SareeEleganceMuses
        </a>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E]">
          As Styled By You
        </h2>
        <p className="text-xs text-stone-600">
          Tag @SareeElegance on Instagram to feature in our global community lookbook.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {instaPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => navigate(`/product/${post.slug}`)}
            className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border border-[#E6DFC6] shadow-sm hover:border-[#C28E46] transition-all"
          >
            <img
              src={post.image}
              alt={post.handle}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {/* Hover Backdrop */}
            <div className="absolute inset-0 bg-[#2C221E]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 text-white">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-[#D4AF37]">{post.handle}</span>
                <span className="flex items-center gap-1 text-stone-300">
                  <Heart className="w-3 h-3 fill-red-500 text-red-500" /> {post.likes}
                </span>
              </div>

              <div className="text-center space-y-1">
                <p className="text-xs font-serif font-bold text-white line-clamp-1">{post.sareeName}</p>
                <div className="inline-flex items-center gap-1 bg-[#C28E46] text-[#2C221E] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                  <ShoppingBag className="w-3 h-3" /> Shop Drape
                </div>
              </div>

              <span className="text-[9px] text-stone-400 text-center truncate">{post.location}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
