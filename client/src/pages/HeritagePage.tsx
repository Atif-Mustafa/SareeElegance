import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Award, ArrowRight, Video } from 'lucide-react';
import { useStore } from '../store/useStore';
import { FabricCareGuide } from '../features/heritage/components/FabricCareGuide';

export const HeritagePage: React.FC = () => {
  const { setIsVideoModalOpen } = useStore();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Banner */}
      <section className="bg-[#2C221E] text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b-4 border-[#C28E46] text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 fill-[#D4AF37]" /> SareeElegance Heritage Chronicles
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            The Living Art of Handwoven Indian Silk
          </h1>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-sans max-w-xl mx-auto">
            Journey into the holy weaving cities of Varanasi and Kanchipuram, where master artisans turn pure mulberry silk and gold zari into timeless heirlooms.
          </p>
        </div>
      </section>

      {/* 3 Weaving Traditions Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Varanasi Banarasi */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-10 rounded-3xl border border-[#E6DFC6] shadow-sm">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold text-[#C28E46] uppercase tracking-widest">Varanasi, Uttar Pradesh</span>
            <h2 className="font-serif text-3xl font-bold text-[#2C221E]">Banarasi Katan & Kadwa Jaal</h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Kadwa is the epitome of Banarasi handloom artistry. Unlike standard Jacquard weaves that leave loose floating threads at the back, Kadwa requires each individual flower motif to be hand-woven onto the warp with a small wooden spool. A single Kadwa Banarasi saree can take up to 4 months of continuous artisan work.
            </p>
            <Link
              to="/collections/banarasi"
              className="inline-flex items-center gap-2 bg-[#2C221E] text-[#D4AF37] font-bold text-xs px-5 py-3 rounded-xl hover:bg-[#C28E46] hover:text-[#2C221E] transition-colors"
            >
              <span>Explore Banarasi Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="lg:col-span-6 rounded-2xl overflow-hidden aspect-[4/3]">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800"
              alt="Banarasi Weaving"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Kanchipuram Kanjivaram */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FAF7F2] p-6 sm:p-10 rounded-3xl border border-[#E6DFC6] shadow-sm">
          <div className="lg:col-span-6 order-2 lg:order-1 rounded-2xl overflow-hidden aspect-[4/3]">
            <img
              src="https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800"
              alt="Kanjivaram Weaving"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
            <span className="text-xs font-bold text-[#C28E46] uppercase tracking-widest">Kanchipuram, Tamil Nadu</span>
            <h2 className="font-serif text-3xl font-bold text-[#2C221E]">Korvai Kanjivaram Pure Zari</h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Korvai is the sacred twin-loom weaving technique where two weavers work simultaneously—one on the contrast border and the other on the saree body. The temple borders are interlocked with a petni zig-zag stitch, creating an indestructible bond that lasts over 100 years.
            </p>
            <Link
              to="/collections/kanjivaram"
              className="inline-flex items-center gap-2 bg-[#2C221E] text-[#D4AF37] font-bold text-xs px-5 py-3 rounded-xl hover:bg-[#C28E46] hover:text-[#2C221E] transition-colors"
            >
              <span>Explore Kanjivaram Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Fabric Care & Identification Guide */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FabricCareGuide />
      </section>

      {/* Silk Mark Guarantee Callout */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-4 bg-white p-8 rounded-3xl border-2 border-[#C28E46] shadow-lg">
        <ShieldCheck className="w-12 h-12 text-[#2E6F40] mx-auto" />
        <h3 className="font-serif text-2xl font-bold text-[#2C221E]">
          How We Guarantee Pure Handloom Silk
        </h3>
        <p className="text-xs text-stone-600 leading-relaxed max-w-2xl mx-auto">
          Every saree shipped by SareeElegance carries the official Silk Mark Organization of India tag with a unique serial barcode. This guarantees 100% pure mulberry silk yarn and real gold/silver tested zari.
        </p>
        <button
          onClick={() => setIsVideoModalOpen(true)}
          className="bg-[#C28E46] hover:bg-[#D4AF37] text-[#2C221E] font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-md inline-flex items-center gap-2"
        >
          <Video className="w-4 h-4" />
          <span>Book Live Video Inspection Call</span>
        </button>
      </section>
    </div>
  );
};
