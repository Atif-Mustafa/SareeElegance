import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import {
  FileText,
  ShieldCheck,
  Award,
  Scissors,
  Scale,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Information Hub', href: '/faqs' },
          { label: 'Terms & Conditions' }
        ]}
      />

      {/* Hero Header */}
      <div className="bg-[#2C221E] text-white p-8 sm:p-12 rounded-3xl border-2 border-[#C28E46] shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C28E46]/10 rounded-full blur-3xl pointer-events-none" />
        <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest bg-[#C28E46]/20 px-3 py-1 rounded-full border border-[#C28E46]/40 inline-flex items-center gap-1.5">
          <Scale className="w-4 h-4 text-[#D4AF37]" /> Legal Terms of Service
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
          Terms & Conditions of Service
        </h1>
        <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Welcome to SareeElegance. By accessing our platform, purchasing handloom sarees, or using our bespoke tailoring services, you agree to the following terms and artisan guidelines.
        </p>
      </div>

      {/* Main Content */}
      <main className="bg-white p-8 sm:p-10 rounded-2xl border border-[#E6DFC6] shadow-sm space-y-8 text-stone-700 text-sm leading-relaxed max-w-4xl mx-auto">
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-[#2C221E] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#C28E46]" /> 1. Handloom Product Authenticity & Disclosures
          </h2>
          <p>
            SareeElegance specializes exclusively in authentic handwoven Indian silk sarees, including Banarasi Katan, Korvai Kanchipuram, and Metallic Tissue Silks.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><strong>Silk Mark Certification:</strong> Every pure silk saree sold on SareeElegance carries an official Silk Mark Organization of India hologram certification tag verifying 100% natural silk fiber content.</li>
            <li><strong>Handwoven Artisan Variations:</strong> Unlike mass-produced automated powerloom fabrics, genuine handwoven sarees exhibit subtle weave slubs, minor thread tension differences, and handloom border characteristics. These are artistic hallmarks of pit-loom craftsmanship rather than manufacturing defects.</li>
            <li><strong>Color Accuracy:</strong> We photograph every saree under studio lighting to represent true handloom silk luster. Minor color variations may occur depending on your mobile or desktop screen calibration settings.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-[#2C221E] flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#C28E46]" /> 2. Bespoke Blouse Stitching & Tailoring Terms
          </h2>
          <p className="text-xs">
            When ordering custom blouse stitching or pre-draped saree fitting options:
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-xs">
            <li>Customers are responsible for providing accurate body measurements via our Blouse Fit Studio or saved measurement profiles.</li>
            <li>Custom-stitched garments are tailored specifically to individual dimensions and are non-returnable once cutting and stitching has commenced.</li>
            <li>Every stitched blouse includes +2 inches of internal seam margin to allow local alterations if body weight fluctuates.</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-[#2C221E] flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#C28E46]" /> 3. Pricing, Taxes & Intellectual Property
          </h2>
          <p className="text-xs">
            All prices listed on SareeElegance include applicable Indian GST taxes. International orders are processed in selected currencies (USD, EUR, GBP, AUD, AED) based on real-time exchange rates.
            All photography, weaving pattern descriptions, and educational content on SareeElegance are protected under trademark and copyright laws.
          </p>
        </section>

        <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#E6DFC6] text-xs space-y-2">
          <strong className="font-serif font-bold text-base text-[#2C221E]">Governing Jurisdiction</strong>
          <p className="text-stone-600">
            These terms are governed by the laws of India. Any legal disputes shall be subject to the exclusive jurisdiction of the courts in Varanasi, Uttar Pradesh, India.
          </p>
        </div>
      </main>
    </div>
  );
};
