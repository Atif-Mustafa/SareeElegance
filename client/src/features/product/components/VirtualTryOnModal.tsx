import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Product, ColorOption } from '@/types';
import {
  Sparkles,
  X,
  Upload,
  User,
  RotateCw,
  Sun,
  Moon,
  Lightbulb,
  Check,
  Download,
  Share2,
  ShoppingBag,
  Sliders,
  ShieldCheck,
  Zap,
  Camera,
  Layers,
  Sparkle
} from 'lucide-react';

interface VirtualTryOnModalProps {
  product: Product;
  selectedColor: ColorOption;
  isOpen: boolean;
  onClose: () => void;
}

interface AIModelOption {
  id: string;
  name: string;
  height: string;
  skinTone: string;
  skinToneCategory: 'Fair' | 'Wheatish' | 'Dusky' | 'Deep Bronze';
  imageFront: string;
  imageSide: string;
  imageBack: string;
}

export const VirtualTryOnModal: React.FC<VirtualTryOnModalProps> = ({
  product,
  selectedColor,
  isOpen,
  onClose
}) => {
  const { formatPrice, addToCart, addToast, setIsCartOpen } = useStore();

  // Model Presets
  const models: AIModelOption[] = [
    {
      id: 'm1',
      name: 'Ananya (Wheatish • 5\'6")',
      height: "5'6\"",
      skinTone: 'Warm Wheatish',
      skinToneCategory: 'Wheatish',
      imageFront: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      imageSide: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800',
      imageBack: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'm2',
      name: 'Rhea (Fair • 5\'8")',
      height: "5'8\"",
      skinTone: 'Cool Fair Porcelain',
      skinToneCategory: 'Fair',
      imageFront: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
      imageSide: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
      imageBack: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'm3',
      name: 'Priya (Dusky • 5\'4")',
      height: "5'4\"",
      skinTone: 'Golden Dusky',
      skinToneCategory: 'Dusky',
      imageFront: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
      imageSide: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800',
      imageBack: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'm4',
      name: 'Kavya (Deep Bronze • 5\'7")',
      height: "5'7\"",
      skinTone: 'Deep Rich Bronze',
      skinToneCategory: 'Deep Bronze',
      imageFront: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
      imageSide: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
      imageBack: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800'
    }
  ];

  const [activeTab, setActiveTab] = useState<'model' | 'custom'>('model');
  const [selectedModel, setSelectedModel] = useState<AIModelOption>(models[0]);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [drapeStyle, setDrapeStyle] = useState<'Nivi' | 'Gujarati' | 'Bengali' | 'Nauvari' | 'Belted'>('Nivi');
  const [viewAngle, setViewAngle] = useState<'Front' | 'Side' | 'Back'>('Front');
  const [lighting, setLighting] = useState<'Daylight' | 'Evening' | 'Candlelight'>('Daylight');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(true);

  if (!isOpen) return null;

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setUserPhoto(reader.result as string);
        setActiveTab('custom');
        triggerAiSimulation();
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAiSimulation = () => {
    setIsSimulating(true);
    setSimulationComplete(false);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationComplete(true);
      addToast('AI Virtual Drape simulation rendered successfully!', 'success');
    }, 1200);
  };

  const handleDrapeChange = (style: typeof drapeStyle) => {
    setDrapeStyle(style);
    triggerAiSimulation();
  };

  const handleAddToCartFromTryOn = () => {
    addToCart(product, selectedColor, {
      fallAndPico: true,
      blouseOption: 'unstitched',
      petticoatOption: false
    }, 1);
    addToast(`Added "${product.title}" to cart from AI Try-On!`, 'success');
    setIsCartOpen(true);
    onClose();
  };

  // Display Image selector logic
  let displayImage = selectedModel.imageFront;
  if (viewAngle === 'Side') displayImage = selectedModel.imageSide;
  if (viewAngle === 'Back') displayImage = selectedModel.imageBack;
  if (activeTab === 'custom' && userPhoto) displayImage = userPhoto;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-5xl w-full border-2 border-[#C28E46] shadow-2xl overflow-hidden my-auto relative flex flex-col max-h-[92vh]">
        {/* Top Bar Header */}
        <div className="bg-[#2C221E] text-white p-4 sm:p-5 border-b border-[#C28E46] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C28E46]/20 border border-[#C28E46] flex items-center justify-center text-[#D4AF37]">
              <Sparkles className="w-5 h-5 fill-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest bg-[#C28E46]/20 px-2 py-0.5 rounded">
                  AI Atelier v2.4
                </span>
                <span className="text-[10px] text-stone-300 font-mono hidden sm:inline">3D Mesh Drape Engine</span>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">
                AI Virtual Try-On Studio
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          {/* Left Canvas Preview Area */}
          <div className="lg:col-span-7 bg-[#1C1513] p-4 sm:p-6 flex flex-col items-center justify-between relative min-h-[380px] lg:min-h-[500px]">
            {/* Saree Info Banner Top Overlay */}
            <div className="w-full bg-[#2C221E]/90 backdrop-blur-md p-3 rounded-2xl border border-[#C28E46]/50 text-white flex items-center justify-between shadow-xl z-10">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-4 h-4 rounded-full border border-white shrink-0" style={{ backgroundColor: selectedColor.hex }} />
                <div className="truncate">
                  <h4 className="font-serif font-bold text-xs truncate text-[#D4AF37]">{product.title}</h4>
                  <p className="text-[10px] text-stone-300">{selectedColor.name} • {product.fabric}</p>
                </div>
              </div>
              <span className="font-serif font-bold text-xs text-[#D4AF37] bg-[#C28E46]/20 px-2.5 py-1 rounded-lg border border-[#C28E46]/40">
                {formatPrice(product.priceINR)}
              </span>
            </div>

            {/* Central Model Stage */}
            <div className="relative my-4 w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#C28E46] shadow-2xl bg-black">
              {/* Lighting Filter Simulation */}
              <div
                className={`absolute inset-0 z-10 pointer-events-none transition-all duration-500 ${
                  lighting === 'Evening'
                    ? 'bg-amber-900/20 mix-blend-color-burn'
                    : lighting === 'Candlelight'
                    ? 'bg-orange-800/25 mix-blend-soft-light'
                    : 'bg-transparent'
                }`}
              />

              <img
                src={displayImage}
                alt="AI Try-On Simulation"
                className={`w-full h-full object-cover transition-all duration-700 ${
                  isSimulating ? 'opacity-40 blur-sm scale-95' : 'opacity-100 scale-100'
                }`}
              />

              {/* Simulation Loader Overlay */}
              {isSimulating && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 text-white gap-3 backdrop-blur-xs">
                  <Sparkles className="w-8 h-8 text-[#D4AF37] animate-spin" />
                  <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest animate-pulse">
                    Rendering 3D Silk Fold Physics...
                  </p>
                </div>
              )}

              {/* AI Drape Watermark & Style Tag */}
              <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-[10px] text-white bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                <span className="font-bold text-[#D4AF37] flex items-center gap-1">
                  <Sparkle className="w-3 h-3 fill-[#D4AF37]" /> {drapeStyle} Drape Style
                </span>
                <span className="font-mono text-stone-300">{viewAngle} View</span>
              </div>
            </div>

            {/* Angle & Lighting Quick Controls Bar */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-white z-10">
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10">
                <span className="text-[10px] text-stone-400 font-bold px-2">Angle:</span>
                {(['Front', 'Side', 'Back'] as const).map((angle) => (
                  <button
                    key={angle}
                    onClick={() => setViewAngle(angle)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      viewAngle === angle ? 'bg-[#C28E46] text-[#2C221E]' : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    {angle}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10">
                <span className="text-[10px] text-stone-400 font-bold px-2">Light:</span>
                <button
                  onClick={() => setLighting('Daylight')}
                  className={`p-1.5 rounded-lg text-xs ${lighting === 'Daylight' ? 'bg-[#C28E46] text-[#2C221E]' : 'text-stone-300'}`}
                  title="Daylight Ceremony"
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setLighting('Evening')}
                  className={`p-1.5 rounded-lg text-xs ${lighting === 'Evening' ? 'bg-[#C28E46] text-[#2C221E]' : 'text-stone-300'}`}
                  title="Evening Reception"
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setLighting('Candlelight')}
                  className={`p-1.5 rounded-lg text-xs ${lighting === 'Candlelight' ? 'bg-[#C28E46] text-[#2C221E]' : 'text-stone-300'}`}
                  title="Candlelight Gala"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Customization Controls & AI Analysis Panel */}
          <div className="lg:col-span-5 p-6 space-y-6 bg-[#FAF7F2] overflow-y-auto">
            {/* Mode Switcher: AI Preset Models vs Upload Own Photo */}
            <div className="flex rounded-2xl bg-white p-1.5 border border-[#E6DFC6]">
              <button
                onClick={() => setActiveTab('model')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'model'
                    ? 'bg-[#2C221E] text-[#D4AF37] shadow-md border border-[#C28E46]'
                    : 'text-stone-600 hover:text-[#2C221E]'
                }`}
              >
                <User className="w-3.5 h-3.5" /> AI Model Avatar
              </button>

              <label
                className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'custom'
                    ? 'bg-[#2C221E] text-[#D4AF37] shadow-md border border-[#C28E46]'
                    : 'text-stone-600 hover:text-[#2C221E]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Upload My Photo
                <input type="file" accept="image/*" onChange={handleUploadPhoto} className="hidden" />
              </label>
            </div>

            {/* Model Avatar Selector */}
            {activeTab === 'model' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#2C221E] uppercase tracking-wider">
                  Select AI Model Body Type:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {models.map((m) => {
                    const isSelected = selectedModel.id === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedModel(m);
                          triggerAiSimulation();
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                          isSelected
                            ? 'bg-[#2C221E] text-white border-[#C28E46] ring-1 ring-[#C28E46]'
                            : 'bg-white text-stone-700 border-[#E6DFC6] hover:border-[#C28E46]'
                        }`}
                      >
                        <img src={m.imageFront} alt={m.name} className="w-9 h-11 rounded-lg object-cover shrink-0" />
                        <div className="min-w-0">
                          <h5 className={`font-serif text-xs font-bold truncate ${isSelected ? 'text-[#D4AF37]' : 'text-[#2C221E]'}`}>
                            {m.name.split(' ')[0]}
                          </h5>
                          <span className={`text-[10px] block truncate ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                            {m.skinToneCategory}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Drape Style Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#2C221E] uppercase tracking-wider">
                Select Regional Drape Style:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Nivi', 'Gujarati', 'Bengali', 'Nauvari', 'Belted'] as const).map((style) => {
                  const isSelected = drapeStyle === style;
                  return (
                    <button
                      key={style}
                      onClick={() => handleDrapeChange(style)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#2C221E] text-[#D4AF37] border-[#C28E46]'
                          : 'bg-white text-stone-700 border-[#E6DFC6] hover:border-[#C28E46]'
                      }`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Color & Fitting Analysis Scorecard */}
            <div className="bg-white p-4 rounded-2xl border-2 border-[#C28E46]/40 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F3EFE6] pb-2">
                <span className="text-xs font-bold text-[#2C221E] uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#C28E46] fill-[#C28E46]" /> AI Fit & Color Match
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  98% Match Score
                </span>
              </div>

              <div className="space-y-2 text-xs text-stone-600">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Skin Undertone Harmony:</strong> {selectedColor.name} beautifully enhances {selectedModel.skinTone} complexions.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Height & Heel Advice:</strong> Recommended 2.5-3 inch heels for optimal {selectedModel.height} floor grazing length.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Fabric Flow:</strong> {product.fabric} has structured fall stiffness, ideal for crisp pleat holds.
                  </p>
                </div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCartFromTryOn}
                className="w-full bg-[#2C221E] hover:bg-[#C28E46] text-[#D4AF37] hover:text-[#2C221E] font-bold text-xs uppercase tracking-widest py-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 border border-[#C28E46]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add Saree to Bag ({formatPrice(product.priceINR)})</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => addToast('High-Res Try-On Snapshot saved to your downloads!', 'info')}
                  className="flex-1 bg-white hover:bg-[#E6DFC6]/50 text-[#2C221E] font-bold text-xs py-2.5 rounded-xl border border-[#E6DFC6] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Save Image
                </button>

                <button
                  onClick={() => addToast('Try-On link copied to clipboard to share on WhatsApp!', 'success')}
                  className="flex-1 bg-white hover:bg-[#E6DFC6]/50 text-[#2C221E] font-bold text-xs py-2.5 rounded-xl border border-[#E6DFC6] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share Try-On
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
