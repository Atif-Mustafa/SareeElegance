import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import {
  BookOpen,
  X,
  Search,
  Sparkles,
  Volume2,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  Layers,
  Scissors,
  Award,
  Info,
  Flame,
  ArrowUpRight
} from 'lucide-react';

export interface GlossaryItem {
  id: string;
  term: string;
  phonetic: string;
  category: 'Weaving Techniques' | 'Threads & Materials' | 'Saree Anatomy' | 'Purity & Quality';
  origin: string;
  shortDef: string;
  fullDescription: string;
  authenticityTip: string;
  examples: string[];
}

export const SILK_GLOSSARY_TERMS: GlossaryItem[] = [
  {
    id: 'zari',
    term: 'Zari',
    phonetic: 'Zah-ree',
    category: 'Threads & Materials',
    origin: 'Varanasi & Surat, India',
    shortDef: 'Fine thread made of gold, silver, or metallic foil wound around a pure silk core yarn.',
    fullDescription: 'Zari is an ornate thread historically crafted by flattening pure silver wire and wrapping it around silk threads, followed by electroplating with pure 24K gold. It is used in weaving rich brocades, elaborate pallus, and decorative borders on Banarasi and Kanjivaram sarees.',
    authenticityTip: 'Real zari has a reddish-yellow silk core when scraped gently and never tarnishes to black plastic melt.',
    examples: ['Real Gold/Silver Zari', 'Tested Antique Zari', 'Resham-Zari Blend']
  },
  {
    id: 'meenakari',
    term: 'Meenakari',
    phonetic: 'Mee-nah-kah-ree',
    category: 'Weaving Techniques',
    origin: 'Varanasi (Inspired by Enamel Art)',
    shortDef: 'Multi-colored resham (silk) threadwork inlaid into gold or silver zari motifs.',
    fullDescription: 'Inspired by traditional Mughal enamel jewelry, Meenakari in silk weaving involves inserting vibrant silk threads (emeralds, rubies, sapphires) into the gold or silver zari pattern. This creates jewel-like contrast and multi-dimensional floral or bird motifs on the saree.',
    authenticityTip: 'In handloom Meenakari, each colored thread is individually hand-spooled into the motif contour rather than printed or machine-stitched.',
    examples: ['Meenakari Floral Jaal', 'Dual-Tone Meenakari Paisley', 'Minakari Border']
  },
  {
    id: 'jacquard',
    term: 'Jacquard',
    phonetic: 'Zhah-kard',
    category: 'Weaving Techniques',
    origin: 'Lyon, France (Adopted by Indian Handlooms)',
    shortDef: 'A loom attachment using punch cards or digital harnesses to weave intricate patterns directly into the cloth.',
    fullDescription: 'Invented by Joseph Marie Jacquard in 1804, the Jacquard mechanism revolutionised silk weaving by allowing individual control of warp threads. It enables weavers to produce complex, highly detailed floral jaals, paisleys, and geometric brocades into the body of the saree.',
    authenticityTip: 'Handloom Jacquard weaving produces crisp, elevated relief textures on the saree surface with smooth thread tension.',
    examples: ['Jacquard Brocade', 'All-over Jacquard Weave', 'Jacquard Border']
  },
  {
    id: 'kadwa',
    term: 'Kadwa',
    phonetic: 'Kadh-wah',
    category: 'Weaving Techniques',
    origin: 'Varanasi, Uttar Pradesh',
    shortDef: 'The most prestigious Banarasi handloom technique where every motif is woven individually with separate wooden shuttles.',
    fullDescription: 'In Kadwa weaving (also known as Kadhwa), the weaver uses small wooden spools (tilli) to craft each floral or paisley motif individually onto the fabric warp. Since each motif is completed before moving to the next, there are NO loose floating threads on the reverse side of the saree.',
    authenticityTip: 'Flip the saree over! If the reverse side is smooth with no clipped or hanging threads, it is genuine Kadwa handloom.',
    examples: ['Kadwa Booti', 'Kadwa Floral Jaal', 'Kadwa Shikargah']
  },
  {
    id: 'korvai',
    term: 'Korvai',
    phonetic: 'Khor-vye',
    category: 'Weaving Techniques',
    origin: 'Kanchipuram, Tamil Nadu',
    shortDef: 'A traditional technique where the saree body and border are woven separately and joined using a zig-zag seam.',
    fullDescription: 'Korvai (meaning "syncing together" in Tamil) requires two weavers working in tandem on one handloom. One weaver works on the body while the second handles the contrasting border. They interlock the two parts using three shuttles in a distinctive temple-style zig-zag joint called Petni.',
    authenticityTip: 'Look at the joint line between border and body; a true Korvai shows a subtle hand-interlocked temple zig-zag stitch.',
    examples: ['Temple Korvai Border', 'Contrast Korvai Pallu', 'Traditional Petni Joint']
  },
  {
    id: 'katan',
    term: 'Katan',
    phonetic: 'Kah-tahn',
    category: 'Threads & Materials',
    origin: 'Varanasi & Persia',
    shortDef: 'Pure mulberry silk yarn formed by twisting two fine filament silk threads together for high strength and glossy lustre.',
    fullDescription: 'Katan silk is prepared by twisting multiple pure silk filaments together into a tightly spun warp and weft thread. The resulting fabric is incredibly soft, strong, durable, and naturally glossy, making it the supreme choice for heavy bridal Banarasi sarees.',
    authenticityTip: 'Katan silk feels naturally warm to the touch, has a rich soft rustle ("scroop"), and carries Silk Mark purity certification.',
    examples: ['Pure Katan Silk', 'Katan Brocade', 'Soft Katan Silk']
  },
  {
    id: 'tanchoi',
    term: 'Tanchoi',
    phonetic: 'Tahn-choy',
    category: 'Weaving Techniques',
    origin: 'Surat & China',
    shortDef: 'A fine satin-weave technique using multiple colored warp threads to create raised, embossed motifs with zero back floats.',
    fullDescription: 'Brought from China to Gujarat by three Choi brothers in the 19th century ("Tan Choi" = Three Chois), Tanchoi uses 2 to 5 colored warp threads to create a satin-like, raised pattern. It is famous for its smooth surface, soft drape, and dense floral imagery.',
    authenticityTip: 'Tanchoi sarees are remarkably lightweight despite their rich, tapestry-like intricate appearance.',
    examples: ['Tanchoi Satin Brocade', 'Multiple-Color Tanchoi', 'Bird Motif Tanchoi']
  },
  {
    id: 'pallu',
    term: 'Pallu (Aanchal)',
    phonetic: 'Puhl-loo',
    category: 'Saree Anatomy',
    origin: 'Pan-Indian Saree Heritage',
    shortDef: 'The ornamental loose end of the saree that drapes over the shoulder.',
    fullDescription: 'The Pallu (or Aanchal) is the visual centerpiece of a saree. Weavers dedicate their greatest artistic skill and densest zari work to the pallu, featuring grand motifs, peacocks, temples, or elaborate crests.',
    authenticityTip: 'On a high-end handloom saree, the pallu transition is marked by a rich contrast border and dense zari density.',
    examples: ['Grand Zari Pallu', 'Korvai Temple Pallu', 'Contrast Brocade Aanchal']
  },
  {
    id: 'tissue',
    term: 'Tissue Silk',
    phonetic: 'Ti-shoo Silk',
    category: 'Threads & Materials',
    origin: 'Varanasi & Chanderi',
    shortDef: 'An ultra-fine translucent fabric woven with metallic zari warp and pure silk weft, giving a luminous metallic glow.',
    fullDescription: 'Tissue silk is created by interweaving extremely fine metallic zari threads in the warp with delicate mulberry silk in the weft. This combination produces a regal, shimmering, glass-like reflection that catches light beautifully under evening lights.',
    authenticityTip: 'Authentic tissue silk is lightweight, flexible, and holds pleats cleanly without harsh stiffness.',
    examples: ['Champagne Tissue Silk', 'Gold Tissue Saree', 'Organza Tissue']
  },
  {
    id: 'silkMark',
    term: 'Silk Mark',
    phonetic: 'Silk Mark',
    category: 'Purity & Quality',
    origin: 'Ministry of Textiles, Government of India',
    shortDef: 'An official label and quality assurance mark guaranteeing 100% natural pure silk content.',
    fullDescription: 'Silk Mark is an initiative by the Central Silk Board (Ministry of Textiles, Govt. of India). Every certified saree carries a tamper-proof hologram label with a unique QR code/serial number verifying that the fabric is 100% natural pure silk.',
    authenticityTip: 'Always verify the hologram sticker and serial code on the saree tag to avoid synthetic rayon or art-silk mix.',
    examples: ['Silk Mark Organization Label', '100% Pure Mulberry Certification']
  },
  {
    id: 'fallAndPico',
    term: 'Fall & Pico',
    phonetic: 'Fall & Pee-koh',
    category: 'Saree Anatomy',
    origin: 'Tailoring Tradition',
    shortDef: 'Cotton hem protection band (Fall) and neat zigzag edge stitching (Pico) on saree ends.',
    fullDescription: 'A Saree Fall is a 5-inch wide soft cotton band stitched along the inner bottom border to add weight for graceful draping and protect the silk hem from fraying. Pico is a neat machine zigzag edge finishing on both loose ends of the saree.',
    authenticityTip: 'Hand-stitched falls ensure the silk does not pucker or bunch up when walking.',
    examples: ['Hand-Stitched Cotton Fall', 'Seamless Pico Edging', 'Hem Protection']
  }
];

export const SilkGlossaryModal: React.FC = () => {
  const { isGlossaryModalOpen, setIsGlossaryModalOpen, glossaryFocusTerm } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTerm, setActiveTerm] = useState<GlossaryItem>(SILK_GLOSSARY_TERMS[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    if (glossaryFocusTerm) {
      const matched = SILK_GLOSSARY_TERMS.find(
        (t) =>
          t.term.toLowerCase() === glossaryFocusTerm.toLowerCase() ||
          t.id.toLowerCase() === glossaryFocusTerm.toLowerCase()
      );
      if (matched) {
        setActiveTerm(matched);
      }
    }
  }, [glossaryFocusTerm, isGlossaryModalOpen]);

  if (!isGlossaryModalOpen) return null;

  const categories = ['All', 'Weaving Techniques', 'Threads & Materials', 'Saree Anatomy', 'Purity & Quality'];

  const filteredTerms = SILK_GLOSSARY_TERMS.filter((termItem) => {
    const matchesSearch =
      termItem.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      termItem.shortDef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      termItem.fullDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || termItem.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSpeakPronunciation = (textToSpeak: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-4xl w-full border-2 border-[#C28E46] shadow-2xl overflow-hidden my-auto relative flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="bg-[#2C221E] text-white p-4 sm:p-5 border-b border-[#C28E46] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C28E46]/20 border border-[#C28E46] flex items-center justify-center text-[#D4AF37]">
              <BookOpen className="w-5 h-5 fill-[#D4AF37]/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest bg-[#C28E46]/20 px-2 py-0.5 rounded">
                  Heritage Knowledge Base
                </span>
                <span className="text-[10px] text-stone-300 hidden sm:inline font-mono">11+ Weaving Terms</span>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">
                Illustrated Silk & Handloom Glossary
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsGlossaryModalOpen(false)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          {/* Left Panel: Search & Term Index List */}
          <div className="lg:col-span-5 bg-white p-4 border-r border-[#E6DFC6] flex flex-col space-y-3 overflow-y-auto max-h-[350px] lg:max-h-none">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search term (e.g. Zari, Kadwa, Korvai)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#E6DFC6] rounded-xl text-xs focus:outline-none focus:border-[#C28E46]"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-semibold">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg shrink-0 transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#2C221E] text-[#D4AF37]'
                      : 'bg-[#FAF7F2] text-stone-600 hover:text-[#2C221E]'
                  }`}
                >
                  {cat === 'Weaving Techniques' ? 'Weaves' : cat === 'Threads & Materials' ? 'Threads' : cat}
                </button>
              ))}
            </div>

            {/* Terms List */}
            <div className="space-y-1.5 flex-1 overflow-y-auto pt-1">
              {filteredTerms.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-500 space-y-1">
                  <HelpCircle className="w-6 h-6 text-[#C28E46] mx-auto" />
                  <p>No matching terms found for "{searchQuery}".</p>
                </div>
              ) : (
                filteredTerms.map((t) => {
                  const isSelected = activeTerm.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTerm(t)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#2C221E] text-white border-[#C28E46] shadow-sm'
                          : 'bg-[#FAF7F2] text-stone-700 border-[#E6DFC6] hover:border-[#C28E46]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className={`font-serif text-xs ${isSelected ? 'text-[#D4AF37]' : 'text-[#2C221E]'}`}>
                            {t.term}
                          </strong>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-sans ${isSelected ? 'bg-white/10 text-stone-300' : 'bg-stone-200 text-stone-600'}`}>
                            {t.category}
                          </span>
                        </div>
                        <p className={`text-[11px] line-clamp-1 mt-0.5 ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                          {t.shortDef}
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#D4AF37]' : 'text-stone-400'}`} />
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Detailed Active Term Card */}
          <div className="lg:col-span-7 p-6 space-y-5 bg-[#FAF7F2] overflow-y-auto">
            {/* Term Title & Pronunciation Header */}
            <div className="bg-white p-5 rounded-2xl border-2 border-[#C28E46]/40 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-[#C28E46] uppercase tracking-widest bg-[#C28E46]/10 px-2.5 py-0.5 rounded">
                    {activeTerm.category}
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-[#2C221E] mt-1">{activeTerm.term}</h2>
                </div>

                <button
                  onClick={() => handleSpeakPronunciation(activeTerm.term)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    isPlayingAudio
                      ? 'bg-[#C28E46] text-[#2C221E] border-[#C28E46] animate-pulse'
                      : 'bg-[#FAF7F2] text-[#2C221E] border-[#E6DFC6] hover:border-[#C28E46]'
                  }`}
                  title="Listen to Phonetic Pronunciation"
                >
                  <Volume2 className="w-4 h-4 text-[#C28E46]" />
                  <span>{activeTerm.phonetic}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-stone-500 pt-1 border-t border-[#F3EFE6]">
                <strong className="text-[#2C221E]">Heritage Origin:</strong>
                <span>{activeTerm.origin}</span>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="bg-white p-5 rounded-2xl border border-[#E6DFC6] space-y-2">
              <h4 className="font-serif font-bold text-sm text-[#2C221E] flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#C28E46]" /> Craft Definition & Significance
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">{activeTerm.fullDescription}</p>
            </div>

            {/* Authenticity Hallmark Tip */}
            <div className="bg-[#2C221E] text-white p-5 rounded-2xl border border-[#C28E46] space-y-2">
              <h4 className="font-serif font-bold text-sm text-[#D4AF37] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" /> How to Verify Authenticity
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">{activeTerm.authenticityTip}</p>
            </div>

            {/* Example Terms / Common Labels */}
            <div className="bg-white p-4 rounded-2xl border border-[#E6DFC6] space-y-2">
              <span className="text-xs font-bold text-[#2C221E] uppercase tracking-wider block">
                Common Weaving Variations:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {activeTerm.examples.map((ex) => (
                  <span
                    key={ex}
                    className="text-xs bg-[#FAF7F2] text-[#2C221E] font-medium px-3 py-1 rounded-lg border border-[#E6DFC6]"
                  >
                    ✦ {ex}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
