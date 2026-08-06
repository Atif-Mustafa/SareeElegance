import React from 'react';
import { useStore } from '../../store/useStore';
import { Video, Calendar, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export const VideoShoppingBanner: React.FC = () => {
  const { setIsVideoModalOpen } = useStore();

  return (
    <section id="video-shopping-interactive-banner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="relative rounded-3xl overflow-hidden bg-[#2C221E] text-white border-2 border-[#C28E46] shadow-2xl p-8 sm:p-12 lg:p-16">
        {/* Subtle Background Accent Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#C28E46_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text Block */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#C28E46]/20 text-[#D4AF37] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-[#C28E46]/40">
              <Video className="w-4 h-4 text-[#D4AF37] animate-pulse" /> Virtual Showroom Experience
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white">
              Shop Handloom Sarees Live via <span className="text-[#D4AF37] italic font-normal">HD Video Call</span>
            </h2>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl">
              Can't visit our Varanasi or Chennai flagship stores? Book a private 1-on-1 video call with our senior saree draper. Inspect the gold zari sheen, fabric weight, and drape in natural sunlight before buying.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-stone-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Live Natural Sunlight Fabric Inspection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Real-Time Blouse Matching Assistance</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Multi-Saree Comparison on Live Model</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Global Timezone Slots Available (24/7)</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                id="banner-book-video-shopping-btn"
                onClick={() => setIsVideoModalOpen(true)}
                className="bg-[#C28E46] hover:bg-[#D4AF37] text-[#2C221E] font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-xl transition-all shadow-xl flex items-center gap-2 border border-[#D4AF37]"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Free Video Call Appointment</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-stone-400 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>100% Free • No Obligation To Purchase</span>
              </div>
            </div>
          </div>

          {/* Right Visual Card */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-sm aspect-[4/5] rounded-2xl overflow-hidden border-2 border-[#C28E46]/60 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800"
                alt="Video Shopping Live Drape"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C221E] via-transparent to-transparent" />

              {/* Simulated Video Overlay Badge */}
              <div className="absolute top-4 left-4 bg-[#2C221E]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-500/50 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase text-white tracking-wider">LIVE Showroom Tour</span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 bg-[#2C221E]/90 p-4 rounded-xl border border-[#C28E46]/40 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-xs font-bold text-white">Varanasi Flagship Studio</h4>
                    <p className="text-[10px] text-stone-400">Stylist: Ananya Sharma</p>
                  </div>
                  <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
