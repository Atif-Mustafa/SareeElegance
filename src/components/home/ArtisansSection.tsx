import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  Award,
  Heart,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface Artisan {
  id: string;
  name: string;
  role: string;
  location: string;
  experienceYears: number;
  specialization: string;
  quote: string;
  bio: string;
  sareesCrafted: number;
  image: string;
  signatureWeaveName: string;
  categoryLink: string;
}

export const ArtisansSection: React.FC = () => {
  const navigate = useNavigate();

  const artisans: Artisan[] = [
    {
      id: 'artisan-1',
      name: 'Ustad Rameshwar Prasad',
      role: 'Master Kadwa Loom Weaver',
      location: 'Varanasi, Uttar Pradesh',
      experienceYears: 38,
      specialization: '3D Gold Zari Kadwa Jaal',
      quote: "Every thread is guided by memory and devotion. Kadwa cannot be duplicated by machines—it lives in the weaver's hands.",
      bio: '5th generation master artisan from Varanasi. Rameshwar has spent nearly four decades perfecting the intricate Kadwa technique where each floral motif is individually hand-spooled.',
      sareesCrafted: 1400,
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
      signatureWeaveName: 'Royal Maroon Kadwa Katan Silk',
      categoryLink: '/collections/banarasi'
    },
    {
      id: 'artisan-2',
      name: 'Master S. Murugan',
      role: 'Korvai Guild Artisan Leader',
      location: 'Kanchipuram, Tamil Nadu',
      experienceYears: 42,
      specialization: 'Interlocked Korvai Temple Borders',
      quote: 'When the contrast border locks with the saree body in a Petni stitch, that saree is bound for a hundred years.',
      bio: 'Hailing from a legendary Kanchipuram weaving lineage, Murugan operates dual-person handlooms that interlock heavy mulberry silk yarn with pure silver tested zari.',
      sareesCrafted: 1850,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
      signatureWeaveName: 'Heavy Kanjivaram Temple Silk',
      categoryLink: '/collections/kanjivaram'
    },
    {
      id: 'artisan-3',
      name: 'Shabnam Bano',
      role: 'Tissue Silk & Meenakari Expert',
      location: 'Varanasi, Uttar Pradesh',
      experienceYears: 26,
      specialization: 'Shimmer Metallic & Resham Threadwork',
      quote: 'Tissue silk demands delicate precision. We weave liquid metallic sheen with subtle floral Meenakari colors.',
      bio: 'Pioneering female master weaver leading a guild of 18 young women in Varanasi, reviving vintage Mughal floral patterns with modern pastel aesthetics.',
      sareesCrafted: 920,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
      signatureWeaveName: 'Pastel Blush Organza & Tissue',
      categoryLink: '/collections/tissue-silk'
    },
    {
      id: 'artisan-4',
      name: 'Jayanti Natarajan',
      role: 'Senior Handloom Specialist',
      location: 'Kanchipuram, Tamil Nadu',
      experienceYears: 31,
      specialization: 'Gold Metallic Sheen & Zari Borders',
      quote: 'Pure silk is alive. The weight, texture, and rustle of real Kanjivaram can never be replicated.',
      bio: 'Recipient of the National Handloom Merit Award, Jayanti specializes in heavy bridal drapes woven exclusively with 3-ply mulberry silk and gold-wrapped thread.',
      sareesCrafted: 1250,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
      signatureWeaveName: 'Champagne Gold Tissue Kanjivaram',
      categoryLink: '/collections/kanjivaram'
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? artisans.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === artisans.length - 1 ? 0 : prev + 1));
  };

  const activeArtisan = artisans[activeIndex];

  return (
    <section id="meet-the-artisans-carousel" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-[#E6DFC6] pb-4">
        <div>
          <span className="text-xs font-bold text-[#C28E46] uppercase tracking-widest block mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 fill-[#C28E46]" /> The Hands Behind The Heirlooms
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E]">
            Meet Our Master Artisans
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
            Honoring the veteran weavers of Varanasi and Kanchipuram who keep India's 500-year-old handloom heritage alive.
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handlePrev}
            id="artisans-carousel-prev-btn"
            className="w-10 h-10 rounded-full border border-[#E6DFC6] bg-white text-[#2C221E] hover:border-[#C28E46] hover:bg-[#2C221E] hover:text-[#D4AF37] transition-all flex items-center justify-center shadow-sm"
            aria-label="Previous Artisan"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-mono font-bold text-stone-500">
            0{activeIndex + 1} / 0{artisans.length}
          </span>
          <button
            onClick={handleNext}
            id="artisans-carousel-next-btn"
            className="w-10 h-10 rounded-full border border-[#E6DFC6] bg-white text-[#2C221E] hover:border-[#C28E46] hover:bg-[#2C221E] hover:text-[#D4AF37] transition-all flex items-center justify-center shadow-sm"
            aria-label="Next Artisan"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Active Artisan Highlight Card */}
      <div className="bg-[#FAF7F2] rounded-3xl border-2 border-[#C28E46]/40 p-6 sm:p-10 lg:p-12 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C28E46]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Left Column: Portrait & Badge */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="relative w-full max-w-sm aspect-[4/5] rounded-2xl overflow-hidden border-2 border-[#C28E46] shadow-2xl group">
            <img
              src={activeArtisan.image}
              alt={activeArtisan.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2C221E] via-transparent to-transparent opacity-80" />

            {/* Experience Tag */}
            <div className="absolute top-4 left-4 bg-[#2C221E]/90 text-[#D4AF37] border border-[#C28E46]/50 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{activeArtisan.experienceYears} Years Master Craft</span>
            </div>

            {/* Bottom Location Tag */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest block flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#D4AF37]" /> {activeArtisan.location}
              </span>
              <h3 className="font-serif text-xl font-bold">{activeArtisan.name}</h3>
              <p className="text-xs text-stone-300">{activeArtisan.role}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Artisan Details & Quote */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-[#2C221E] text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md border border-[#C28E46]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" /> Direct Artisan Craft • Fair Wages Guaranteed
            </div>

            <h3 className="font-serif text-3xl font-bold text-[#2C221E]">
              {activeArtisan.name}
            </h3>
            <p className="text-xs font-semibold text-[#C28E46] uppercase tracking-wider">
              Speciality: {activeArtisan.specialization}
            </p>
          </div>

          {/* Quote Box */}
          <blockquote className="bg-white p-5 rounded-2xl border border-[#E6DFC6] shadow-sm relative italic text-xs sm:text-sm text-stone-700 leading-relaxed">
            <span className="font-serif text-3xl text-[#C28E46] leading-none block mb-1">“</span>
            {activeArtisan.quote}
          </blockquote>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {activeArtisan.bio}
          </p>

          {/* Micro Stats & Signature Weave CTA */}
          <div className="pt-4 border-t border-[#E6DFC6] flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase text-stone-400 font-bold block">Signature Masterpiece Weave</span>
              <strong className="font-serif text-sm text-[#2C221E] block">{activeArtisan.signatureWeaveName}</strong>
            </div>

            <button
              onClick={() => navigate(activeArtisan.categoryLink)}
              className="bg-[#2C221E] hover:bg-[#C28E46] text-[#D4AF37] hover:text-[#2C221E] font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2 border border-[#C28E46]"
            >
              <span>Explore {activeArtisan.name.split(' ')[0]}'s Weaves</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Thumbnails Row to quickly switch artisans */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
        {artisans.map((artisan, idx) => {
          const isSelected = activeIndex === idx;
          return (
            <button
              key={artisan.id}
              onClick={() => setActiveIndex(idx)}
              className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                isSelected
                  ? 'bg-[#2C221E] text-white border-[#C28E46] shadow-md ring-2 ring-[#C28E46]/30'
                  : 'bg-white text-stone-700 border-[#E6DFC6] hover:border-[#C28E46]'
              }`}
            >
              <img
                src={artisan.image}
                alt={artisan.name}
                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200"
              />
              <div className="min-w-0">
                <h5 className={`font-serif text-xs font-bold truncate ${isSelected ? 'text-[#D4AF37]' : 'text-[#2C221E]'}`}>
                  {artisan.name}
                </h5>
                <p className={`text-[10px] truncate ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                  {artisan.location.split(',')[0]}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
