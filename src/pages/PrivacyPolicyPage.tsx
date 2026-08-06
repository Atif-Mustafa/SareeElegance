import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Key,
  Database,
  UserCheck,
  HelpCircle,
  Mail,
  PhoneCall
} from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Information Hub', href: '/faqs' },
          { label: 'Privacy Policy' }
        ]}
      />

      {/* Hero Header */}
      <div className="bg-[#2C221E] text-white p-8 sm:p-12 rounded-3xl border-2 border-[#C28E46] shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C28E46]/10 rounded-full blur-3xl pointer-events-none" />
        <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest bg-[#C28E46]/20 px-3 py-1 rounded-full border border-[#C28E46]/40 inline-flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" /> Data Security & Trust Guarantee
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
          Privacy & Data Protection Policy
        </h1>
        <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
          At SareeElegance, we treat your privacy with the same delicate care as our handwoven mulberry silk heirlooms. Learn how we collect, safeguard, and respect your personal information.
        </p>
        <p className="text-[11px] text-[#D4AF37] font-mono">Last updated: July 2026 • Compliant with Indian IT Act 2000 & Global GDPR Standards</p>
      </div>

      {/* Policy Layout with Navigation Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Quick Nav Sidebar */}
        <aside className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#E6DFC6] shadow-sm space-y-6 sticky top-24">
          <h3 className="font-serif text-lg font-bold text-[#2C221E] border-b border-[#F3EFE6] pb-3">
            Information Centre
          </h3>
          <nav className="space-y-2 text-xs font-medium">
            <Link
              to="/privacy-policy"
              className="flex items-center justify-between p-3 rounded-xl bg-[#2C221E] text-[#D4AF37] border border-[#C28E46] font-bold"
            >
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#D4AF37]" /> Privacy Policy
              </span>
              <span>→</span>
            </Link>
            <Link
              to="/shipping-policy"
              className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] text-stone-700 hover:text-[#2C221E] hover:border-[#C28E46] border border-[#E6DFC6] transition-all"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#C28E46]" /> Shipping & Delivery
              </span>
              <span>→</span>
            </Link>
            <Link
              to="/cancellation-and-returns"
              className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] text-stone-700 hover:text-[#2C221E] hover:border-[#C28E46] border border-[#E6DFC6] transition-all"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C28E46]" /> Cancellation & Returns
              </span>
              <span>→</span>
            </Link>
            <Link
              to="/terms-and-conditions"
              className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] text-stone-700 hover:text-[#2C221E] hover:border-[#C28E46] border border-[#E6DFC6] transition-all"
            >
              <span className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#C28E46]" /> Terms & Conditions
              </span>
              <span>→</span>
            </Link>
            <Link
              to="/faqs"
              className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] text-stone-700 hover:text-[#2C221E] hover:border-[#C28E46] border border-[#E6DFC6] transition-all"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#C28E46]" /> Frequently Asked Questions
              </span>
              <span>→</span>
            </Link>
          </nav>

          {/* Contact Concierge Box */}
          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E6DFC6] space-y-2 text-xs">
            <strong className="font-serif font-bold text-[#2C221E] block">Data Protection Officer</strong>
            <p className="text-stone-600">Questions regarding your personal data? Reach our privacy team directly:</p>
            <div className="pt-2 space-y-1 text-stone-800 font-medium">
              <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#C28E46]" /> privacy@sareeelegance.com</p>
              <p className="flex items-center gap-1.5"><PhoneCall className="w-3.5 h-3.5 text-[#C28E46]" /> +91 98200 12345</p>
            </div>
          </div>
        </aside>

        {/* Policy Content */}
        <main className="lg:col-span-8 bg-white p-8 rounded-2xl border border-[#E6DFC6] shadow-sm space-y-8 text-stone-700 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-bold text-[#2C221E] flex items-center gap-2">
              <Database className="w-5 h-5 text-[#C28E46]" /> 1. Information We Collect
            </h2>
            <p>
              To process your bespoke saree orders, blouse stitching preferences, and global express deliveries, SareeElegance collects the following essential information:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li><strong>Personal Identifiers:</strong> Full name, phone number, email address, and shipping/billing address.</li>
              <li><strong>Bespoke Customization Data:</strong> Blouse measurement specifications (bust, waist, armhole, sleeve length) and custom fall/pico instructions.</li>
              <li><strong>Payment Information:</strong> Encrypted transaction IDs provided by PCI-DSS compliant payment gateways (Stripe, Razorpay, UPI). SareeElegance NEVER stores raw credit card numbers or banking passwords.</li>
              <li><strong>Technical & Browsing Data:</strong> IP address, device type, browser preferences, and cookies used to remember your currency choice (INR, USD, EUR, GBP, AUD, AED, CAD).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-bold text-[#2C221E] flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#C28E46]" /> 2. How We Use Your Data
            </h2>
            <p>
              Your personal data is strictly used to fulfill your orders and elevate your shopping experience. Specifically, we use your data to:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-xs">
              <li>Hand-tailor custom blouse fittings according to your saved measurement profiles.</li>
              <li>Dispatch insured air express shipments with BlueDart, DHL, or FedEx, providing real-time SMS & WhatsApp tracking updates.</li>
              <li>Send VIP private previews, handloom collection drops, and anniversary reward vouchers (if subscribed).</li>
              <li>Prevent fraudulent transactions and protect artisan handloom intellectual property.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-bold text-[#2C221E] flex items-center gap-2">
              <Key className="w-5 h-5 text-[#C28E46]" /> 3. Data Protection & Encryption Standards
            </h2>
            <p>
              We enforce military-grade 256-bit SSL encryption across our web architecture. Payment processing is completely offloaded to PCI-DSS Level 1 certified gateways. Your blouse measurement records and address history are securely stored in encrypted database instances with restricted role-based access.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-bold text-[#2C221E] flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#C28E46]" /> 4. Your Rights & Data Control
            </h2>
            <p>
              You maintain total ownership of your personal data. At any time, you may log into your <Link to="/account" className="text-[#C28E46] underline font-bold">My Account dashboard</Link> to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>View, update, or delete your saved blouse measurement profiles and addresses.</li>
              <li>Opt out of marketing emails or SMS updates with a single click.</li>
              <li>Request complete erasure of your user profile under applicable data privacy laws.</li>
            </ul>
          </section>

          <section className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#E6DFC6] space-y-2 text-xs">
            <h3 className="font-serif font-bold text-base text-[#2C221E]">Cookie Consent & Local Storage</h3>
            <p className="text-stone-600">
              We use essential cookies to keep your shopping cart, selected currency rates, and wishlist synced across your browsing session. We do not sell user browsing behavior to third-party ad networks.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
};
