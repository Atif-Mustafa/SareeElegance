import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import {
  HelpCircle,
  Search,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Truck,
  Scissors,
  RotateCcw,
  Mail,
  PhoneCall,
  Video
} from 'lucide-react';
import { useStore } from '../store/useStore';

interface FAQItem {
  id: string;
  category: 'Authenticity' | 'Custom Stitching' | 'Shipping & Tracking' | 'Returns & Exchange';
  question: string;
  answer: string;
}

const FAQS_DATA: FAQItem[] = [
  {
    id: '1',
    category: 'Authenticity',
    question: 'How do I know my saree is 100% pure silk and not art-silk or synthetic?',
    answer: 'Every pure silk saree at SareeElegance carries an official Silk Mark Organization of India hologram label with a unique serial number. You can also run our Silk Purity Burn Test on sample threads—pure silk burns with an organic hair-burning scent and leaves fine grey ash, unlike synthetic fabrics that melt into hard plastic.'
  },
  {
    id: '2',
    category: 'Authenticity',
    question: 'What is the difference between Kadwa Banarasi and Cutwork powerloom sarees?',
    answer: 'Kadwa is the ultimate handloom technique where each motif is individually woven with separate wooden shuttles. There are no loose hanging threads on the reverse side. In powerloom cutwork sarees, floating threads on the back are clipped by machine blades, leaving rough edges.'
  },
  {
    id: '3',
    category: 'Custom Stitching',
    question: 'How does custom blouse stitching work when ordering online?',
    answer: 'When viewing any saree, select "Custom Blouse Fit". You can choose from popular necklines (Sabyasachi Sweetheart, Royal High Neck, Deep V), sleeve lengths, and input your bust/waist dimensions or save a measurement profile in your account. Our master tailors in Varanasi craft your blouse with 2+ inches of internal alteration margin.'
  },
  {
    id: '4',
    category: 'Custom Stitching',
    question: 'Does the saree come with Fall & Pico pre-done?',
    answer: 'Yes! Every saree includes complimentary premium cotton Fall stitching along the bottom hem and smooth zigzag Pico edge finishing on both loose ends so your saree arrives ready to wear.'
  },
  {
    id: '5',
    category: 'Shipping & Tracking',
    question: 'How long does delivery take for domestic and international orders?',
    answer: 'Unstitched sarees are dispatched within 24 hours. Express air shipping takes 2-3 business days within Indian metros and 4-6 business days for international destinations like USA, UK, UAE, and Australia via DHL Express or BlueDart.'
  },
  {
    id: '6',
    category: 'Shipping & Tracking',
    question: 'Can I inspect the saree via video call before dispatch?',
    answer: 'Absolutely! Click "Book Video Call Shopping" anywhere on our platform. A senior master stylist will display the saree under natural light and show the reverse weave, zari sheen, and pallu detail in real-time on WhatsApp or Zoom.'
  },
  {
    id: '7',
    category: 'Returns & Exchange',
    question: 'What is your return policy if I don\'t like the color or fabric in person?',
    answer: 'We offer a 15-day door-to-door return and exchange policy for unstitched sarees with original tags attached. We schedule a free reverse pickup courier from your doorstep. (Note: Custom-stitched blouses tailored specifically to personal measurements are non-returnable).'
  }
];

export const FAQPage: React.FC = () => {
  const { setIsVideoModalOpen } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [openFaqId, setOpenFaqId] = useState<string | null>('1');

  const categories = ['All', 'Authenticity', 'Custom Stitching', 'Shipping & Tracking', 'Returns & Exchange'];

  const filteredFaqs = FAQS_DATA.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Frequently Asked Questions' }]} />

      {/* Hero Header */}
      <div className="bg-[#2C221E] text-white p-8 sm:p-12 rounded-3xl border-2 border-[#C28E46] shadow-xl space-y-4 text-center max-w-4xl mx-auto relative overflow-hidden">
        <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest bg-[#C28E46]/20 px-3 py-1 rounded-full border border-[#C28E46]/40 inline-flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-[#D4AF37]" /> Saree Connoisseur Support
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-stone-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          Everything you need to know about pure silk authenticity, custom blouse stitching, global air express delivery, and our 15-day exchange guarantee.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto pt-2">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search FAQ (e.g. Silk Mark, Blouse, Delivery time)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#1A1412] text-white placeholder-stone-400 border border-[#C28E46]/50 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-center gap-2 flex-wrap border-b border-[#E6DFC6] pb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              selectedCategory === cat
                ? 'bg-[#2C221E] text-[#D4AF37] border-[#C28E46] shadow-md'
                : 'bg-white text-stone-700 border-[#E6DFC6] hover:border-[#C28E46]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Accordion List */}
      <div className="max-w-3xl mx-auto space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-[#E6DFC6] text-center space-y-2">
            <HelpCircle className="w-8 h-8 text-[#C28E46] mx-auto" />
            <p className="font-serif font-bold text-base text-[#2C221E]">No questions matched "{searchQuery}"</p>
            <p className="text-xs text-stone-500">Try searching with a different term or reach our live concierge team below.</p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-[#E6DFC6] shadow-sm overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif font-bold text-sm sm:text-base text-[#2C221E] hover:text-[#C28E46] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] bg-[#FAF7F2] text-[#C28E46] border border-[#E6DFC6] px-2 py-0.5 rounded font-sans uppercase font-bold shrink-0">
                      {faq.category}
                    </span>
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#C28E46] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-600 border-t border-[#F3EFE6] leading-relaxed animate-fadeIn space-y-3">
                    <p>{faq.answer}</p>
                    {faq.category === 'Authenticity' && (
                      <Link
                        to="/heritage"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#C28E46] hover:underline"
                      >
                        Explore Handloom Fabric Care & Burn Test Guide →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Concierge Callout */}
      <div className="bg-[#FAF7F2] max-w-3xl mx-auto p-6 rounded-3xl border-2 border-[#C28E46] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-serif text-lg font-bold text-[#2C221E]">Still have a question?</h3>
          <p className="text-xs text-stone-600">Connect directly with our master saree stylists for custom advice.</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsVideoModalOpen(true)}
            className="bg-[#2C221E] text-[#D4AF37] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-[#C28E46] hover:text-[#2C221E] transition-all"
          >
            <Video className="w-4 h-4" /> Book Video Call
          </button>
          <Link
            to="/contact-us"
            className="bg-white text-[#2C221E] border border-[#E6DFC6] px-4 py-2.5 rounded-xl text-xs font-bold hover:border-[#C28E46] transition-all"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};
