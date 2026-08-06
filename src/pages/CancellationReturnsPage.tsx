import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { useStore } from '../store/useStore';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Truck,
  ShieldCheck,
  FileText,
  Scissors,
  Package,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export const CancellationReturnsPage: React.FC = () => {
  const { addToast } = useStore();
  const [orderId, setOrderId] = useState('');
  const [returnReason, setReturnReason] = useState('defect');
  const [returnSubmitted, setReturnSubmitted] = useState(false);

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      setReturnSubmitted(true);
      addToast(`Return request generated for Order ${orderId}. Courier pickup scheduled within 24 hours.`, 'success');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Information Hub', href: '/faqs' },
          { label: 'Cancellation & Returns' }
        ]}
      />

      {/* Hero Banner */}
      <div className="bg-[#2C221E] text-white p-8 sm:p-12 rounded-3xl border-2 border-[#C28E46] shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C28E46]/10 rounded-full blur-3xl pointer-events-none" />
        <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest bg-[#C28E46]/20 px-3 py-1 rounded-full border border-[#C28E46]/40 inline-flex items-center gap-1.5">
          <RotateCcw className="w-4 h-4 text-[#D4AF37]" /> 15-Day Hassle-Free Exchange Policy
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
          Cancellation, Returns & Refunds
        </h1>
        <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
          We want you to adore your saree completely. If an unstitched piece doesn't fulfill your expectations, enjoy our smooth 15-day door-to-door return and exchange process.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Policy Details */}
        <div className="lg:col-span-8 bg-white p-8 rounded-2xl border border-[#E6DFC6] shadow-sm space-y-8 text-stone-700 text-sm leading-relaxed">
          {/* Policy Highlights Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E6DFC6] space-y-1">
              <Clock className="w-5 h-5 text-[#C28E46]" />
              <strong className="font-serif text-sm font-bold text-[#2C221E] block">15-Day Window</strong>
              <p className="text-xs text-stone-600">Request return/exchange within 15 days of delivery.</p>
            </div>
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E6DFC6] space-y-1">
              <Truck className="w-5 h-5 text-[#C28E46]" />
              <strong className="font-serif text-sm font-bold text-[#2C221E] block">Doorstep Courier Pickup</strong>
              <p className="text-xs text-stone-600">Complimentary reverse courier pickup across 18,000+ PIN codes.</p>
            </div>
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E6DFC6] space-y-1">
              <RotateCcw className="w-5 h-5 text-[#C28E46]" />
              <strong className="font-serif text-sm font-bold text-[#2C221E] block">Instant Refunds</strong>
              <p className="text-xs text-stone-600">Refunds processed to original payment method within 3-5 days.</p>
            </div>
          </div>

          {/* Section 1: Return Eligibility */}
          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-bold text-[#2C221E] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#C28E46]" /> 1. Return & Exchange Eligibility
            </h2>
            <p>
              To ensure every customer receives pristine, untouched luxury, returned sarees must satisfy the following conditions:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-2">
                <strong className="text-emerald-800 font-bold flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Eligible for 100% Refund
                </strong>
                <ul className="list-disc pl-4 space-y-1 text-emerald-900">
                  <li>Unstitched Sarees in original unused condition.</li>
                  <li>Original Silk Mark hologram tags and fabric fold attached.</li>
                  <li>Returned with original cotton muslin gift box.</li>
                  <li>Damaged or defective sarees upon arrival.</li>
                </ul>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-2">
                <strong className="text-amber-800 font-bold flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> Non-Returnable Items
                </strong>
                <ul className="list-disc pl-4 space-y-1 text-amber-900">
                  <li>Custom-stitched blouses and custom hemmed Fall & Pico pieces (tailored specifically to body measurements).</li>
                  <li>Sarees with detached security tags or washed fabric.</li>
                  <li>Custom dye orders or personalized bridal weaves.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2: Handloom Artisan Variance Disclosure */}
          <section className="bg-[#2C221E] text-white p-6 rounded-2xl border border-[#C28E46] space-y-3 text-xs">
            <h3 className="font-serif text-base font-bold text-[#D4AF37] flex items-center gap-2">
              <Scissors className="w-4 h-4 text-[#D4AF37]" /> Handloom Authenticity Notice
            </h3>
            <p className="text-stone-300 leading-relaxed">
              Every Banarasi, Kanjivaram, and Tissue saree at SareeElegance is meticulously handwoven on traditional pit looms by master artisans over 100 to 300 hours. Subtle slubs, micro thread variations, or weave texture characteristics are marks of genuine handloom weaving rather than defects.
            </p>
          </section>

          {/* Section 3: Order Cancellation Guidelines */}
          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-bold text-[#2C221E] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#C28E46]" /> 2. Order Cancellation Rules
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li>
                <strong>Before Dispatch (Standard Sarees):</strong> Orders for standard unstitched sarees can be cancelled within 24 hours of placement for a 100% immediate full refund.
              </li>
              <li>
                <strong>Custom Blouse Orders:</strong> Once our master tailors begin cutting and stitching your custom blouse piece (typically 24 hours after order placement), the stitching customization fee (₹999 - ₹1,499) becomes non-refundable.
              </li>
              <li>
                <strong>After Dispatch:</strong> Once shipped, orders cannot be cancelled mid-transit. However, you can decline delivery or initiate a return upon receipt.
              </li>
            </ul>
          </section>

          {/* Section 4: Refund Process */}
          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-bold text-[#2C221E] flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-[#C28E46]" /> 3. Refund Timelines
            </h2>
            <p className="text-xs">
              Once our quality inspection team verifies the returned saree at our Varanasi atelier, refunds are initiated immediately:
            </p>
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E6DFC6] text-xs space-y-1">
              <div className="flex justify-between py-1 border-b border-[#E6DFC6]">
                <span className="font-bold">Prepaid Orders (Card / Net Banking / UPI):</span>
                <span className="text-[#C28E46] font-bold">3 - 5 Business Days</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E6DFC6]">
                <span className="font-bold">Cash on Delivery (COD):</span>
                <span className="text-[#C28E46] font-bold">Bank Transfer / UPI (24 Hours)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-bold">International Orders (PayPal / Stripe):</span>
                <span className="text-[#C28E46] font-bold">5 - 7 Business Days</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Side: Quick Return Request Portal */}
        <aside className="lg:col-span-4 space-y-6 sticky top-24">
          <div className="bg-[#2C221E] text-white p-6 rounded-2xl border-2 border-[#C28E46] shadow-xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#D4AF37] flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-[#D4AF37]" /> Initiate Instant Return
            </h3>
            <p className="text-xs text-stone-300">
              Enter your Order ID below to request a reverse courier pickup directly from your address.
            </p>

            {returnSubmitted ? (
              <div className="bg-emerald-950/80 p-5 rounded-xl border border-emerald-500/40 text-emerald-200 text-xs space-y-3 animate-fadeIn">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <strong className="block text-sm font-bold text-white">Return Request Received!</strong>
                <p>Order ID: <span className="font-mono text-[#D4AF37] font-bold">{orderId}</span></p>
                <p>A BlueDart / DHL pickup agent will contact you on your registered phone number within 24 hours.</p>
                <button
                  onClick={() => {
                    setReturnSubmitted(false);
                    setOrderId('');
                  }}
                  className="text-xs text-[#D4AF37] underline font-bold"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleReturnSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Order ID / Tracking Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SE-2026-8841"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full bg-[#1C1513] text-white p-3 rounded-xl border border-[#C28E46]/40 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">Reason for Return / Exchange</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full bg-[#1C1513] text-white p-3 rounded-xl border border-[#C28E46]/40 focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="defect">Damaged / Defective on Arrival</option>
                    <option value="color">Color differs from screen</option>
                    <option value="exchange">Exchange for another weave</option>
                    <option value="mind">Changed my mind</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#C28E46] hover:bg-[#D4AF37] text-[#2C221E] font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
                >
                  <span>Request Pickup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E6DFC6] shadow-sm space-y-3 text-xs">
            <h4 className="font-serif font-bold text-sm text-[#2C221E]">Need Return Assistance?</h4>
            <p className="text-stone-600">Our concierge team is available to assist you via WhatsApp or Email.</p>
            <div className="pt-2 border-t border-[#F3EFE6] space-y-1 font-bold text-[#2C221E]">
              <p>📱 WhatsApp: +91 98200 12345</p>
              <p>✉️ Email: returns@sareeelegance.com</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
