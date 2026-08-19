import React from 'react';
import { ShieldCheck, Truck, Video, Scissors } from 'lucide-react';

export const TrustFeaturesStrip: React.FC = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Silk Mark Certified',
      description: '100% Pure Mulberry Silk with authentic tag'
    },
    {
      icon: Truck,
      title: 'Ready To Ship & Global Express',
      description: 'Dispatched within 24 hours with insurance'
    },
    {
      icon: Video,
      title: '1-on-1 Live Video Call',
      description: 'Inspect drape & zari sheen with a personal stylist'
    },
    {
      icon: Scissors,
      title: 'Bespoke Blouse Tailoring',
      description: 'Custom stitched to your exact measurements'
    }
  ];

  return (
    <div id="trust-features-strip" className="bg-[#FAF7F2] border-y border-[#E6DFC6] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#E6DFC6]/60 shadow-sm hover:border-[#C28E46] transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[#2C221E] text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#C28E46]">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#2C221E]">{feat.title}</h4>
                <p className="text-xs text-stone-600 mt-0.5 leading-snug">{feat.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
