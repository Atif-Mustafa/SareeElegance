import React, { useState } from 'react';
import {
  Flame,
  Droplets,
  ShieldCheck,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  HelpCircle,
  Sun,
  Layers,
  Feather,
  RefreshCw,
  Award,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../../store/useStore';

interface SilkDetails {
  id: 'banarasi' | 'kanjivaram' | 'tissue';
  title: string;
  origin: string;
  fabricType: string;
  weight: string;
  keyFeature: string;
  image: string;
  reverseSideTest: string;
  borderTechnique: string;
  zariPurity: string;
  burnTestResult: string;
  waterTouchFeel: string;
  careInstructions: {
    washing: string;
    ironing: string;
    storage: string;
    airing: string;
  };
}

export const FabricCareGuide: React.FC = () => {
  const { addToast } = useStore();
  const [selectedFabric, setSelectedFabric] = useState<'banarasi' | 'kanjivaram' | 'tissue'>('banarasi');
  const [activeTab, setActiveTab] = useState<'identification' | 'burnTest' | 'care' | 'authenticityQuiz'>('identification');

  // Authenticity Quiz State
  const [quizAnswer1, setQuizAnswer1] = useState<string | null>(null);
  const [quizAnswer2, setQuizAnswer2] = useState<string | null>(null);
  const [quizAnswer3, setQuizAnswer3] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<string | null>(null);

  // Simulated Burn Test Active State
  const [isBurning, setIsBurning] = useState(false);
  const [burnCompleted, setBurnCompleted] = useState(false);

  const fabricsData: Record<'banarasi' | 'kanjivaram' | 'tissue', SilkDetails> = {
    banarasi: {
      id: 'banarasi',
      title: 'Authentic Banarasi Katan & Kadwa Silk',
      origin: 'Varanasi, Uttar Pradesh',
      fabricType: 'Pure Katan Mulberry Silk (Mulberry Warp & Weft)',
      weight: 'Medium to Heavy (800g - 1.2kg)',
      keyFeature: 'Floral Jaal & Paisley Motifs woven with extra weft spools',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      reverseSideTest: 'In authentic Kadwa Banarasi, the reverse side is smooth with no loose floats or harsh threads. Each motif is woven individually with wooden shuttles.',
      borderTechnique: 'Zari borders are woven seamlessly as part of the continuous warp.',
      zariPurity: 'Real Gold/Silver Tested Zari wrapped around pure silk core thread.',
      burnTestResult: 'Thread burns slowly with a crisp hair-burning scent, leaving fine, dark grey ash that easily crushes into powder.',
      waterTouchFeel: 'Silky, warm to the touch. Water droplet absorbs slowly without staining if dabbed immediately.',
      careInstructions: {
        washing: 'Strictly Professional Dry Clean only. Never wash in water or apply harsh detergents.',
        ironing: 'Iron on the reverse side using low silk heat setting with a protective cotton press cloth.',
        storage: 'Wrap in pure unbleached muslin cloth. Avoid plastic zip covers that retain humidity and tarnish zari.',
        airing: 'Unfold and air out in soft shaded breeze once every 4-6 months to prevent fold creases.'
      }
    },
    kanjivaram: {
      id: 'kanjivaram',
      title: 'Pure Korvai Kanchipuram Silk',
      origin: 'Kanchipuram, Tamil Nadu',
      fabricType: '3-Ply Mulberry Silk (Thick, Lustrous Heavy Silk Thread)',
      weight: 'Heavy & Structured (900g - 1.4kg)',
      keyFeature: 'Interlocked Temple Korvai Borders & Heavy Solid Zari Pallu',
      image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800',
      reverseSideTest: 'Look for the zig-zag "Petni" interlocked seam where the body meets the contrast border. Handloom Korvai cannot be replicated on powerlooms.',
      borderTechnique: 'Two weavers interlock the body and border using 3 separate shuttles simultaneously.',
      zariPurity: 'Heavy 0.6% Gold & 57% Silver coating over pure red-dyed silk thread core.',
      burnTestResult: 'Silk yarn burns with organic hair odor and leaves fragile black residue. Zari thread leaves a fine silver wire core.',
      waterTouchFeel: 'Distinctive crisp rustle ("Scroop") sound when rubbed. Extremely dense, opulent weight.',
      careInstructions: {
        washing: 'Dry Clean Only. For accidental spills, blot gently with white absorbent tissue without rubbing.',
        ironing: 'Steam iron inside out at mild temperature. Do not iron directly on heavy gold zari.',
        storage: 'Store flat wrapped in white cotton cloth inside wooden trunks. Keep away from perfumes or hairspray.',
        airing: 'Refold along new lines every few months to prevent permanent thread friction at creases.'
      }
    },
    tissue: {
      id: 'tissue',
      title: 'Handloom Metallic Tissue Silk',
      origin: 'Varanasi & Chanderi',
      fabricType: 'Silk Warp interwoven with Ultra-Fine Metallic Zari Weft',
      weight: 'Lightweight to Medium (500g - 750g)',
      keyFeature: 'Translucent, Shimmering Dual-Tone Metallic Sheen',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800',
      reverseSideTest: 'Uniform metallic shimmer on both sides with delicate soft texture. No scratchy wire edges.',
      borderTechnique: 'Inlaid Minakari threadwork on delicate metallic background warp.',
      zariPurity: 'Feather-light tested metallic zari combined with organza silk warp.',
      burnTestResult: 'Burns with a clean organic scent, leaving minute metallic dust.',
      waterTouchFeel: 'Feather-light and airy with a luminous glass-like glow under light.',
      careInstructions: {
        washing: 'Specialist Dry Clean ONLY. Never twist, wring, or soak tissue silk.',
        ironing: 'Use very light indirect heat through a thick cotton towel buffer.',
        storage: 'Roll on padded cardboard cylinders or store flat in muslin. Never compress under heavy sarees.',
        airing: 'Store in dry, temperature-controlled environment away from direct sunlight.'
      }
    }
  };

  const currentFabric = fabricsData[selectedFabric];

  const triggerBurnSimulation = () => {
    setIsBurning(true);
    setBurnCompleted(false);
    setTimeout(() => {
      setIsBurning(false);
      setBurnCompleted(true);
      addToast('Silk purity burn test simulation completed!', 'success');
    }, 1500);
  };

  const handleEvaluateQuiz = () => {
    if (!quizAnswer1 || !quizAnswer2 || !quizAnswer3) {
      addToast('Please answer all 3 questions to evaluate your saree!', 'info');
      return;
    }

    if (quizAnswer1 === 'petni' && quizAnswer2 === 'heavy') {
      setQuizResult('Authentic Korvai Kanchipuram Silk! Highly valuable handloom heirloom with 3-ply silk interlock.');
    } else if (quizAnswer1 === 'kadwa' && quizAnswer2 === 'medium') {
      setQuizResult('Authentic Handwoven Banarasi Kadwa Silk! Masterpiece craftsmanship with individually shuttled motifs.');
    } else if (quizAnswer1 === 'floats') {
      setQuizResult('Powerloom / Cutwork Machine Imitation. Floating back threads indicate automated machine weaving.');
    } else {
      setQuizResult('Pure Handloom Mulberry Silk Saree verified with Silk Mark standards.');
    }
    addToast('Authenticity assessment generated!', 'success');
  };

  return (
    <section className="bg-white p-6 sm:p-10 rounded-3xl border-2 border-[#C28E46]/40 shadow-xl space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-[#C28E46] uppercase tracking-widest inline-flex items-center gap-1">
          <Award className="w-4 h-4 text-[#C28E46]" /> Interactive Connoisseur Guide
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E]">
          Fabric Care & Handloom Identification
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Learn how to distinguish genuine handwoven Banarasi, Kanjivaram, and Tissue silks from powerloom imitations, and preserve your heirlooms for generations.
        </p>
      </div>

      {/* Fabric Selection Tabs */}
      <div className="flex rounded-2xl bg-[#FAF7F2] p-1.5 border border-[#E6DFC6] max-w-xl mx-auto">
        {(['banarasi', 'kanjivaram', 'tissue'] as const).map((fabKey) => {
          const isSelected = selectedFabric === fabKey;
          return (
            <button
              key={fabKey}
              onClick={() => {
                setSelectedFabric(fabKey);
                setBurnCompleted(false);
              }}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all capitalize ${
                isSelected
                  ? 'bg-[#2C221E] text-[#D4AF37] shadow-md border border-[#C28E46]'
                  : 'text-stone-700 hover:text-[#2C221E]'
              }`}
            >
              {fabKey} Silk
            </button>
          );
        })}
      </div>

      {/* Guide Feature Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-[#E6DFC6] pb-4">
        <button
          onClick={() => setActiveTab('identification')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
            activeTab === 'identification'
              ? 'bg-[#C28E46] text-[#2C221E] border-[#C28E46]'
              : 'bg-[#FAF7F2] text-stone-700 border-[#E6DFC6] hover:border-[#C28E46]'
          }`}
        >
          <Search className="w-3.5 h-3.5" /> Handloom Identification
        </button>

        <button
          onClick={() => setActiveTab('burnTest')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
            activeTab === 'burnTest'
              ? 'bg-[#C28E46] text-[#2C221E] border-[#C28E46]'
              : 'bg-[#FAF7F2] text-stone-700 border-[#E6DFC6] hover:border-[#C28E46]'
          }`}
        >
          <Flame className="w-3.5 h-3.5" /> Silk Purity Burn Test
        </button>

        <button
          onClick={() => setActiveTab('care')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
            activeTab === 'care'
              ? 'bg-[#C28E46] text-[#2C221E] border-[#C28E46]'
              : 'bg-[#FAF7F2] text-stone-700 border-[#E6DFC6] hover:border-[#C28E46]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Care & Preservation
        </button>

        <button
          onClick={() => setActiveTab('authenticityQuiz')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
            activeTab === 'authenticityQuiz'
              ? 'bg-[#C28E46] text-[#2C221E] border-[#C28E46]'
              : 'bg-[#FAF7F2] text-stone-700 border-[#E6DFC6] hover:border-[#C28E46]'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" /> Saree Purity Assessor
        </button>
      </div>

      {/* TAB 1: HANDLOOM IDENTIFICATION */}
      {activeTab === 'identification' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FAF7F2] p-6 rounded-3xl border border-[#E6DFC6]">
          <div className="lg:col-span-5 rounded-2xl overflow-hidden aspect-[3/4] border-2 border-[#C28E46] relative shadow-lg">
            <img src={currentFabric.image} alt={currentFabric.title} className="w-full h-full object-cover" />
            <div className="absolute bottom-3 left-3 right-3 bg-[#2C221E]/90 backdrop-blur-md p-3 rounded-xl border border-[#C28E46] text-white text-xs">
              <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider block">Origin Guild</span>
              <strong className="font-serif text-sm text-white">{currentFabric.origin}</strong>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div>
              <span className="text-[10px] font-bold text-[#C28E46] uppercase tracking-widest bg-[#C28E46]/10 px-2.5 py-1 rounded">
                {currentFabric.fabricType}
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#2C221E] mt-2">{currentFabric.title}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-[#E6DFC6] space-y-1">
                <span className="font-bold text-[#2C221E] block">Saree Weight & Feel:</span>
                <p className="text-stone-600">{currentFabric.weight}</p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#E6DFC6] space-y-1">
                <span className="font-bold text-[#2C221E] block">Key Weaving Signature:</span>
                <p className="text-stone-600">{currentFabric.keyFeature}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="bg-white p-4 rounded-xl border-l-4 border-l-[#C28E46] border border-[#E6DFC6] space-y-1">
                <strong className="text-[#2C221E] font-serif flex items-center gap-1.5 text-sm">
                  <Layers className="w-4 h-4 text-[#C28E46]" /> Reverse Side Hallmark Test
                </strong>
                <p className="text-stone-600 leading-relaxed">{currentFabric.reverseSideTest}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border-l-4 border-l-emerald-600 border border-[#E6DFC6] space-y-1">
                <strong className="text-[#2C221E] font-serif flex items-center gap-1.5 text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-600" /> Border & Zari Purity
                </strong>
                <p className="text-stone-600 leading-relaxed">{currentFabric.zariPurity}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SILK PURITY BURN TEST */}
      {activeTab === 'burnTest' && (
        <div className="bg-[#1C1513] text-white p-6 sm:p-8 rounded-3xl border-2 border-[#C28E46] space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest bg-[#C28E46]/20 px-2 py-0.5 rounded">
                Lab Purity Standard
              </span>
              <h3 className="font-serif text-2xl font-bold text-white mt-1">Silk Yarn Burn Test Simulator</h3>
            </div>
            <button
              onClick={triggerBurnSimulation}
              disabled={isBurning}
              className="bg-[#C28E46] hover:bg-[#D4AF37] text-[#2C221E] font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2 border border-white/20"
            >
              <Flame className="w-4 h-4 fill-[#2C221E]" />
              <span>{isBurning ? 'Simulating Flame Test...' : 'Test Fabric Thread Sample'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="bg-black/60 p-6 rounded-2xl border border-white/10 space-y-4 text-xs">
              <h4 className="font-serif text-base font-bold text-[#D4AF37] flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" /> Pure Silk vs Synthetic Test Results
              </h4>

              <div className="space-y-3">
                <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/30 text-emerald-200">
                  <strong className="block text-emerald-400 font-bold mb-1">Pure Mulberry Silk ({currentFabric.title})</strong>
                  <p>{currentFabric.burnTestResult}</p>
                </div>

                <div className="p-3 bg-red-950/40 rounded-xl border border-red-500/30 text-red-200">
                  <strong className="block text-red-400 font-bold mb-1">Synthetic Polyester / Art Silk (Imitation)</strong>
                  <p>Melts rapidly into hard chemical plastic beads with chemical odor and dark black smoke.</p>
                </div>
              </div>
            </div>

            <div className="bg-[#2C221E] p-6 rounded-2xl border border-[#C28E46]/40 text-center space-y-4 relative">
              {isBurning ? (
                <div className="py-8 space-y-3">
                  <Flame className="w-12 h-12 text-orange-500 animate-bounce mx-auto" />
                  <p className="text-xs font-bold text-[#D4AF37] animate-pulse">Applying controlled micro-flame to warp thread...</p>
                </div>
              ) : burnCompleted ? (
                <div className="py-6 space-y-3 animate-fadeIn">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h5 className="font-serif text-lg font-bold text-emerald-300">100% Pure Mulberry Silk Verified</h5>
                  <p className="text-xs text-stone-300 max-w-xs mx-auto">
                    Organic protein fiber detected. Passed Silk Mark Organization of India laboratory standard.
                  </p>
                </div>
              ) : (
                <div className="py-8 space-y-3">
                  <Sparkles className="w-10 h-10 text-[#D4AF37] mx-auto" />
                  <p className="text-xs text-stone-300">Click "Test Fabric Thread Sample" above to run the burn test simulation for {currentFabric.title}.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CARE & PRESERVATION */}
      {activeTab === 'care' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E6DFC6] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#2C221E] text-[#D4AF37] flex items-center justify-center font-bold">
              <Droplets className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-sm text-[#2C221E]">Dry Cleaning Rules</h4>
            <p className="text-xs text-stone-600 leading-relaxed">{currentFabric.careInstructions.washing}</p>
          </div>

          <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E6DFC6] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#2C221E] text-[#D4AF37] flex items-center justify-center font-bold">
              <Sun className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-sm text-[#2C221E]">Ironing Temperature</h4>
            <p className="text-xs text-stone-600 leading-relaxed">{currentFabric.careInstructions.ironing}</p>
          </div>

          <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E6DFC6] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#2C221E] text-[#D4AF37] flex items-center justify-center font-bold">
              <Feather className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-sm text-[#2C221E]">Muslin Storage</h4>
            <p className="text-xs text-stone-600 leading-relaxed">{currentFabric.careInstructions.storage}</p>
          </div>

          <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E6DFC6] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#2C221E] text-[#D4AF37] flex items-center justify-center font-bold">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-sm text-[#2C221E]">Periodic Airing</h4>
            <p className="text-xs text-stone-600 leading-relaxed">{currentFabric.careInstructions.airing}</p>
          </div>
        </div>
      )}

      {/* TAB 4: SAREE PURITY ASSESSOR (QUIZ) */}
      {activeTab === 'authenticityQuiz' && (
        <div className="bg-[#FAF7F2] p-6 sm:p-8 rounded-3xl border border-[#E6DFC6] space-y-6">
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-[#2C221E]">Interactive Handloom Diagnostic Tool</h3>
            <p className="text-xs text-stone-600">Answer 3 questions about your saree to assess whether it is authentic handloom or machine powerloom.</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Question 1 */}
            <div className="bg-white p-4 rounded-2xl border border-[#E6DFC6] space-y-2">
              <label className="font-bold text-[#2C221E] block">1. What does the reverse side of the saree look like?</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => setQuizAnswer1('kadwa')}
                  className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                    quizAnswer1 === 'kadwa' ? 'bg-[#2C221E] text-[#D4AF37] border-[#C28E46]' : 'bg-[#FAF7F2] text-stone-700 hover:border-[#C28E46]'
                  }`}
                >
                  Clean & smooth without loose threads (Kadwa)
                </button>
                <button
                  onClick={() => setQuizAnswer1('petni')}
                  className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                    quizAnswer1 === 'petni' ? 'bg-[#2C221E] text-[#D4AF37] border-[#C28E46]' : 'bg-[#FAF7F2] text-stone-700 hover:border-[#C28E46]'
                  }`}
                >
                  Zig-zag interlocked joint at border (Korvai)
                </button>
                <button
                  onClick={() => setQuizAnswer1('floats')}
                  className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                    quizAnswer1 === 'floats' ? 'bg-[#2C221E] text-[#D4AF37] border-[#C28E46]' : 'bg-[#FAF7F2] text-stone-700 hover:border-[#C28E46]'
                  }`}
                >
                  Loose clipped floats across back (Cutwork)
                </button>
              </div>
            </div>

            {/* Question 2 */}
            <div className="bg-white p-4 rounded-2xl border border-[#E6DFC6] space-y-2">
              <label className="font-bold text-[#2C221E] block">2. How heavy is the saree when held in hand?</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => setQuizAnswer2('heavy')}
                  className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                    quizAnswer2 === 'heavy' ? 'bg-[#2C221E] text-[#D4AF37] border-[#C28E46]' : 'bg-[#FAF7F2] text-stone-700 hover:border-[#C28E46]'
                  }`}
                >
                  Substantial & dense (900g+)
                </button>
                <button
                  onClick={() => setQuizAnswer2('medium')}
                  className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                    quizAnswer2 === 'medium' ? 'bg-[#2C221E] text-[#D4AF37] border-[#C28E46]' : 'bg-[#FAF7F2] text-stone-700 hover:border-[#C28E46]'
                  }`}
                >
                  Medium balanced drape (700g-900g)
                </button>
                <button
                  onClick={() => setQuizAnswer2('light')}
                  className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                    quizAnswer2 === 'light' ? 'bg-[#2C221E] text-[#D4AF37] border-[#C28E46]' : 'bg-[#FAF7F2] text-stone-700 hover:border-[#C28E46]'
                  }`}
                >
                  Featherweight translucent (&lt;600g)
                </button>
              </div>
            </div>

            {/* Question 3 */}
            <div className="bg-white p-4 rounded-2xl border border-[#E6DFC6] space-y-2">
              <label className="font-bold text-[#2C221E] block">3. Does it carry an official Silk Mark Organization label?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => setQuizAnswer3('yes')}
                  className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                    quizAnswer3 === 'yes' ? 'bg-[#2C221E] text-[#D4AF37] border-[#C28E46]' : 'bg-[#FAF7F2] text-stone-700 hover:border-[#C28E46]'
                  }`}
                >
                  Yes, with hologram & serial barcode
                </button>
                <button
                  onClick={() => setQuizAnswer3('no')}
                  className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                    quizAnswer3 === 'no' ? 'bg-[#2C221E] text-[#D4AF37] border-[#C28E46]' : 'bg-[#FAF7F2] text-stone-700 hover:border-[#C28E46]'
                  }`}
                >
                  No label attached
                </button>
              </div>
            </div>

            <button
              onClick={handleEvaluateQuiz}
              className="w-full bg-[#2C221E] hover:bg-[#C28E46] text-[#D4AF37] hover:text-[#2C221E] font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md"
            >
              Evaluate Saree Authenticity
            </button>

            {quizResult && (
              <div className="p-4 bg-white rounded-2xl border-2 border-[#C28E46] space-y-2 animate-fadeIn">
                <span className="text-[10px] font-bold text-[#C28E46] uppercase tracking-wider">Assessment Result</span>
                <p className="font-serif font-bold text-sm text-[#2C221E]">{quizResult}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
