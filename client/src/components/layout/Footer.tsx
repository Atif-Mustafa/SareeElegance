import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { LanguageSelector } from '../ui/LanguageSelector';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Mail,
  ArrowRight,
  PhoneCall,
  MapPin,
  Heart
} from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { addToast } = useStore();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      addToast('Welcome to our Heritage Circle! Check your inbox for ₹1,000 off code.', 'success');
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#2C221E] text-stone-300 pt-16 pb-12 border-t-4 border-[#C28E46]">
      {/* 3 Feature Badges Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#3A2E2A] rounded-2xl p-6 md:p-8 border border-[#C28E46]/30 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#C28E46]/20 flex items-center justify-center text-[#D4AF37] border border-[#C28E46]/40 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-semibold text-white">100% Pure Handloom</h4>
              <p className="text-xs text-stone-400">Authentic Mulberry Silk with official Silk Mark Certification</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#C28E46]/20 flex items-center justify-center text-[#D4AF37] border border-[#C28E46]/40 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-semibold text-white">Free Worldwide Express</h4>
              <p className="text-xs text-stone-400">Free global shipping on orders over ₹1,999 with live tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#C28E46]/20 flex items-center justify-center text-[#D4AF37] border border-[#C28E46]/40 shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-semibold text-white">15-Day Easy Exchange</h4>
              <p className="text-xs text-stone-400">Hassle-free 15-day return and exchange policy for total peace of mind</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Navigation & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-stone-800">
        {/* Col 1 & 2: Brand & Newsletter */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#C28E46] flex items-center justify-center text-[#2C221E] font-bold">
              <Sparkles className="w-5 h-5 fill-[#2C221E]" />
            </div>
            <span className="font-serif text-3xl font-bold tracking-tight text-white">
              Saree<span className="text-[#D4AF37] italic font-normal">Elegance</span>
            </span>
          </div>

          <p className="text-sm text-stone-400 leading-relaxed max-w-md">
            SareeElegance celebrates India's majestic handloom weaving legacy. From Varanasi’s gold zari Kadwa Banarasi to Kanchipuram’s Korvai temple borders and metallic Tissue Silks, every piece is a treasured heirloom.
          </p>

          {/* 'Join Our Heritage' Newsletter Signup Section */}
          <div className="bg-[#1A1412] p-5 rounded-2xl border border-[#C28E46]/40 shadow-xl space-y-3 max-w-md">
            <div className="flex items-center gap-2">
              <span className="bg-[#C28E46]/20 text-[#D4AF37] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#C28E46]/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" /> Heritage Club
              </span>
            </div>

            <h5 className="font-serif text-lg text-white font-bold tracking-tight">
              Join Our Heritage
            </h5>

            <p className="text-xs text-stone-300 leading-relaxed">
              Subscribe to capture exclusive master-weaver edition updates, private artisan previews, and royal promotional offers directly to your inbox.
            </p>

            {isSubscribed ? (
              <div className="bg-[#C28E46]/20 border border-[#C28E46] text-[#D4AF37] p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-[#D4AF37]" />
                <span>Namaste! You are enrolled in Join Our Heritage. Check your inbox for your ₹1,000 welcome voucher code.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-[#C28E46] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email for heritage updates..."
                      required
                      className="w-full bg-[#2C221E] text-stone-100 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-700 focus:outline-none focus:border-[#C28E46] transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    id="join-our-heritage-submit-btn"
                    className="bg-[#C28E46] hover:bg-[#D4AF37] text-[#2C221E] font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1 shrink-0"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-stone-500 italic">
                  * By subscribing you agree to receive promotional updates and weaver heritage newsletters. Unsubscribe anytime.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Col 3: Collections */}
        <div className="space-y-4">
          <h5 className="font-serif text-lg font-semibold text-white tracking-wide border-b border-stone-800 pb-2">
            Categories
          </h5>
          <ul className="space-y-2.5 text-xs text-stone-400">
            <li>
              <Link to="/collections/banarasi" className="hover:text-[#D4AF37] transition-colors">
                Banarasi Katan Silk
              </Link>
            </li>
            <li>
              <Link to="/collections/kanjivaram" className="hover:text-[#D4AF37] transition-colors">
                Kanjivaram Pure Zari
              </Link>
            </li>
            <li>
              <Link to="/collections/tissue-silk" className="hover:text-[#D4AF37] transition-colors">
                Tissue Silk Sarees
              </Link>
            </li>
            <li>
              <Link to="/collections/ready-to-wear" className="hover:text-[#D4AF37] transition-colors">
                Pre-Draped Ready to Wear
              </Link>
            </li>
            <li>
              <Link to="/collections/all" className="hover:text-[#D4AF37] transition-colors">
                Bridal & Trousseau Specials
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Customer Care & Policies */}
        <div className="space-y-4">
          <h5 className="font-serif text-lg font-semibold text-white tracking-wide border-b border-stone-800 pb-2">
            Customer Care & Info
          </h5>
          <ul className="space-y-2.5 text-xs text-stone-400">
            <li>
              <Link to="/shipping-policy" className="hover:text-[#D4AF37] transition-colors">
                Shipping & Express Logistics
              </Link>
            </li>
            <li>
              <Link to="/cancellation-and-returns" className="hover:text-[#D4AF37] transition-colors">
                15-Day Cancellation & Returns
              </Link>
            </li>
            <li>
              <Link to="/privacy-policy" className="hover:text-[#D4AF37] transition-colors">
                Privacy Policy & Data Security
              </Link>
            </li>
            <li>
              <Link to="/terms-and-conditions" className="hover:text-[#D4AF37] transition-colors">
                Terms & Conditions of Service
              </Link>
            </li>
            <li>
              <Link to="/faqs" className="hover:text-[#D4AF37] transition-colors">
                Frequently Asked Questions (FAQs)
              </Link>
            </li>
            <li>
              <Link to="/contact-us" className="hover:text-[#D4AF37] transition-colors">
                Contact Concierge & Ateliers
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 5: Contact & Concierge */}
        <div className="space-y-4">
          <h5 className="font-serif text-lg font-semibold text-white tracking-wide border-b border-stone-800 pb-2">
            Stylist Concierge
          </h5>
          <div className="space-y-3 text-xs text-stone-400">
            <p className="flex items-start gap-2">
              <PhoneCall className="w-4 h-4 text-[#C28E46] shrink-0 mt-0.5" />
              <span>Personal Stylist Hotline: <br /><strong className="text-stone-200">+91 98200 12345</strong> (10 AM - 8 PM IST)</span>
            </p>
            <p className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-[#C28E46] shrink-0 mt-0.5" />
              <span>concierge@sareeelegance.com</span>
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#C28E46] shrink-0 mt-0.5" />
              <span><Link to="/contact-us" className="hover:text-[#D4AF37] underline">Flagship Ateliers:</Link> Varanasi & Bengaluru</span>
            </p>

            <div className="pt-2 border-t border-stone-800">
              <LanguageSelector variant="footer" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
        <div className="space-y-1 text-center sm:text-left">
          <p className="flex items-center gap-1 justify-center sm:justify-start">
            © 2026 SareeElegance Luxury Indian Ethnic Wear. Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for Silk Lovers.
          </p>
          <div className="flex items-center gap-3 text-[11px] text-stone-400 justify-center sm:justify-start">
            <Link to="/privacy-policy" className="hover:text-[#D4AF37] transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/cancellation-and-returns" className="hover:text-[#D4AF37] transition-colors">Cancellation & Returns</Link>
            <span>•</span>
            <Link to="/shipping-policy" className="hover:text-[#D4AF37] transition-colors">Shipping Policy</Link>
            <span>•</span>
            <Link to="/terms-and-conditions" className="hover:text-[#D4AF37] transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link to="/admin" className="text-amber-400 hover:text-amber-200 font-semibold transition-colors flex items-center gap-1">
              <span>Ops Console</span>
            </Link>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="flex items-center gap-3">
          <span className="bg-stone-800 text-stone-300 px-2 py-1 rounded font-mono text-[10px] font-bold">Razorpay / Stripe</span>
          <span className="bg-stone-800 text-stone-300 px-2 py-1 rounded font-mono text-[10px] font-bold">UPI / GPay</span>
          <span className="bg-stone-800 text-stone-300 px-2 py-1 rounded font-mono text-[10px] font-bold">Visa / Mastercard</span>
          <span className="bg-stone-800 text-stone-300 px-2 py-1 rounded font-mono text-[10px] font-bold">COD Available</span>
        </div>
      </div>
    </footer>
  );
};
