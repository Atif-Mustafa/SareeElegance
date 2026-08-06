import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import {
  Truck,
  Globe,
  Clock,
  ShieldCheck,
  PackageCheck,
  MapPin,
  HelpCircle,
  FileText,
  Lock,
  Scissors
} from 'lucide-react';

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Information Hub', href: '/faqs' },
          { label: 'Shipping & Delivery Policy' }
        ]}
      />

      {/* Hero Header */}
      <div className="bg-[#2C221E] text-white p-8 sm:p-12 rounded-3xl border-2 border-[#C28E46] shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C28E46]/10 rounded-full blur-3xl pointer-events-none" />
        <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest bg-[#C28E46]/20 px-3 py-1 rounded-full border border-[#C28E46]/40 inline-flex items-center gap-1.5">
          <Truck className="w-4 h-4 text-[#D4AF37]" /> Worldwide Express Logistics
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
          Shipping & Global Delivery Policy
        </h1>
        <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Every handloom saree is packed in a protective cotton muslin box and shipped via air express couriers (BlueDart, DHL Express, FedEx) with 100% transit insurance.
        </p>
      </div>

      {/* Timeline Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E6DFC6] shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#2C221E] text-[#D4AF37] flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <strong className="font-serif text-base font-bold text-[#2C221E] block">Domestic Free Air Shipping</strong>
          <p className="text-xs text-stone-600">Free air express shipping across India on all orders over ₹1,999.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E6DFC6] shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#2C221E] text-[#D4AF37] flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <strong className="font-serif text-base font-bold text-[#2C221E] block">Global Express Courier</strong>
          <p className="text-xs text-stone-600">Delivering to USA, UK, UAE, Canada, Australia, Singapore & 80+ countries.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E6DFC6] shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#2C221E] text-[#D4AF37] flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <strong className="font-serif text-base font-bold text-[#2C221E] block">Fast Dispatch</strong>
          <p className="text-xs text-stone-600">Unstitched sarees dispatched within 24 hours. Custom blouse (+3 business days).</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E6DFC6] shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#2C221E] text-[#D4AF37] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <strong className="font-serif text-base font-bold text-[#2C221E] block">Transit Insurance</strong>
          <p className="text-xs text-stone-600">100% full coverage against loss, theft, or damage during transit.</p>
        </div>
      </div>

      {/* Main Policy Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <main className="lg:col-span-8 bg-white p-8 rounded-2xl border border-[#E6DFC6] shadow-sm space-y-8 text-stone-700 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-bold text-[#2C221E] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#C28E46]" /> 1. Delivery Timelines by Region
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse border border-[#E6DFC6]">
                <thead>
                  <tr className="bg-[#2C221E] text-[#D4AF37] font-serif">
                    <th className="p-3 border border-[#C28E46]/40">Destination Region</th>
                    <th className="p-3 border border-[#C28E46]/40">Carrier Service</th>
                    <th className="p-3 border border-[#C28E46]/40">Estimated Delivery Time</th>
                    <th className="p-3 border border-[#C28E46]/40">Shipping Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DFC6] text-stone-700">
                  <tr>
                    <td className="p-3 font-bold text-[#2C221E]">Indian Metros (Delhi, Mumbai, Bengaluru, Kolkata, Chennai)</td>
                    <td className="p-3">BlueDart Express Air</td>
                    <td className="p-3 text-[#2E6F40] font-bold">2 - 3 Business Days</td>
                    <td className="p-3 font-bold text-emerald-700">FREE</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[#2C221E]">Rest of India (Tier 2 & 3 Cities)</td>
                    <td className="p-3">BlueDart / Delhivery Air</td>
                    <td className="p-3 text-[#2E6F40] font-bold">3 - 5 Business Days</td>
                    <td className="p-3 font-bold text-emerald-700">FREE over ₹1,999</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[#2C221E]">USA, Canada & UK</td>
                    <td className="p-3">DHL Express / FedEx Priority</td>
                    <td className="p-3 text-[#C28E46] font-bold">4 - 6 Business Days</td>
                    <td className="p-3">Flat $19.99 (Free over $350)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[#2C221E]">UAE, GCC & Middle East</td>
                    <td className="p-3">Aramex / DHL Express</td>
                    <td className="p-3 text-[#C28E46] font-bold">3 - 5 Business Days</td>
                    <td className="p-3">Flat AED 75 (Free over AED 1,200)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[#2C221E]">Australia & New Zealand</td>
                    <td className="p-3">DHL Express International</td>
                    <td className="p-3 text-[#C28E46] font-bold">5 - 7 Business Days</td>
                    <td className="p-3">Flat AUD 35 (Free over AUD 500)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-bold text-[#2C221E] flex items-center gap-2">
              <Scissors className="w-5 h-5 text-[#C28E46]" /> 2. Custom Stitching Lead Times
            </h2>
            <p className="text-xs">
              When you add custom blouse stitching or specialized fall & pico edge finishing, our master tailors require additional preparation time before dispatch:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E6DFC6] space-y-1">
                <strong className="text-[#2C221E] font-bold block">Standard Unstitched Saree:</strong>
                <p className="text-stone-600">Dispatched within 24 Hours of order placement.</p>
              </div>
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E6DFC6] space-y-1">
                <strong className="text-[#2C221E] font-bold block">Custom Blouse Fit & Tailoring:</strong>
                <p className="text-stone-600">Requires +3 to +4 Business Days for precision cutting & stitching.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-bold text-[#2C221E] flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-[#C28E46]" /> 3. Luxury Muslin Packaging
            </h2>
            <p className="text-xs">
              Every heirloom saree is gently hand-wrapped in breathable unbleached pure cotton muslin cloth inside a structured, gold-embossed presentation trunk. This prevents humidity buildup, protects fine gold/silver zari from tarnishing, and preserves the handloom weave during air travel.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-bold text-[#2C221E] flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#C28E46]" /> 4. Customs, Import Duties & Taxes
            </h2>
            <p className="text-xs">
              For international shipments, import duties or local VAT taxes (if applicable by destination country customs authorities) are the responsibility of the recipient. Most major destinations (USA under $800 USD) import duty-free under standard personal garment allowances.
            </p>
          </section>
        </main>

        {/* Sidebar Info & Order Tracker */}
        <aside className="lg:col-span-4 space-y-6 sticky top-24">
          <div className="bg-[#2C221E] text-white p-6 rounded-2xl border-2 border-[#C28E46] shadow-xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#D4AF37] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#D4AF37]" /> Track Your Active Shipment
            </h3>
            <p className="text-xs text-stone-300">
              Check live status updates for your saree shipment on your account dashboard.
            </p>
            <Link
              to="/account?tab=orders"
              className="inline-flex items-center justify-center w-full bg-[#C28E46] hover:bg-[#D4AF37] text-[#2C221E] font-bold py-3.5 rounded-xl transition-all uppercase tracking-wider text-xs"
            >
              Open Live Order Tracker
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E6DFC6] shadow-sm space-y-3 text-xs">
            <h4 className="font-serif font-bold text-sm text-[#2C221E]">Shipping Concierge</h4>
            <p className="text-stone-600">Need urgent dispatch for an upcoming wedding or festive occasion?</p>
            <p className="font-bold text-[#2C221E]">Contact our dispatch manager: <br />📞 +91 98200 12345</p>
          </div>
        </aside>
      </div>
    </div>
  );
};
