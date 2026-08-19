import React, { useState } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { useStore } from '../store/useStore';
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  Send,
  Video,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { addToast, setIsVideoModalOpen } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Bridal Saree Inquiry',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setIsSubmitted(true);
      addToast('Message sent to our Stylist Concierge! We will respond within 2 hours.', 'success');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Contact Us & Flagship Ateliers' }]} />

      {/* Hero Header */}
      <div className="bg-[#2C221E] text-white p-8 sm:p-12 rounded-3xl border-2 border-[#C28E46] shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C28E46]/10 rounded-full blur-3xl pointer-events-none" />
        <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest bg-[#C28E46]/20 px-3 py-1 rounded-full border border-[#C28E46]/40 inline-flex items-center gap-1.5">
          <PhoneCall className="w-4 h-4 text-[#D4AF37]" /> Royal Concierge Service
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
          Connect With Our Silk Stylists
        </h1>
        <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Whether you need assistance choosing a bridal trousseau, verifying a weave, or scheduling a live video shopping appointment, our master stylists are at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-[#E6DFC6] shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-[#2C221E]">Send Us a Message</h2>
            <p className="text-xs text-stone-600">Fill out the form below and our senior saree concierge will reach out promptly.</p>
          </div>

          {isSubmitted ? (
            <div className="bg-[#FAF7F2] p-8 rounded-2xl border-2 border-[#C28E46] text-center space-y-3 animate-fadeIn">
              <CheckCircle2 className="w-12 h-12 text-[#2E6F40] mx-auto" />
              <h3 className="font-serif text-xl font-bold text-[#2C221E]">Thank You, {formData.name}!</h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                Your message regarding <strong className="text-[#C28E46]">{formData.subject}</strong> has been assigned to a senior handloom stylist. Expect a reply at <span className="font-bold">{formData.email}</span> within 2 hours.
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({ name: '', email: '', phone: '', subject: 'Bridal Saree Inquiry', message: '' });
                }}
                className="text-xs font-bold text-[#C28E46] underline pt-2 block mx-auto"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#2C221E] mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Radhika Sharma"
                    className="w-full p-3 bg-[#FAF7F2] border border-[#E6DFC6] rounded-xl focus:outline-none focus:border-[#C28E46]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2C221E] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="radhika@example.com"
                    className="w-full p-3 bg-[#FAF7F2] border border-[#E6DFC6] rounded-xl focus:outline-none focus:border-[#C28E46]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#2C221E] mb-1">Phone / WhatsApp Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98200 12345"
                    className="w-full p-3 bg-[#FAF7F2] border border-[#E6DFC6] rounded-xl focus:outline-none focus:border-[#C28E46]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2C221E] mb-1">Inquiry Topic</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-3 bg-[#FAF7F2] border border-[#E6DFC6] rounded-xl focus:outline-none focus:border-[#C28E46]"
                  >
                    <option value="Bridal Saree Inquiry">Bridal Trousseau Selection</option>
                    <option value="Custom Blouse Tailoring">Custom Blouse Fitting & Stitching</option>
                    <option value="Order Tracking">Order & Global Shipping Inquiry</option>
                    <option value="Wholesale & Bulk">Wholesale & Export Inquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2C221E] mb-1">Message Detail *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your saree requirements, color preferences, or delivery date..."
                  className="w-full p-3 bg-[#FAF7F2] border border-[#E6DFC6] rounded-xl focus:outline-none focus:border-[#C28E46]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#2C221E] hover:bg-[#C28E46] text-[#D4AF37] hover:text-[#2C221E] font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Info Sidebar */}
        <aside className="lg:col-span-5 space-y-6">
          {/* Quick Concierge Info Box */}
          <div className="bg-[#2C221E] text-white p-6 rounded-2xl border-2 border-[#C28E46] shadow-xl space-y-4 text-xs">
            <h3 className="font-serif text-xl font-bold text-[#D4AF37] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" /> Stylist Concierge Desk
            </h3>

            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3">
                <PhoneCall className="w-4 h-4 text-[#C28E46] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">Call / WhatsApp Concierge:</strong>
                  <span className="text-[#D4AF37] font-bold">+91 98200 12345</span>
                  <p className="text-[10px] text-stone-400">Available 10:00 AM – 8:00 PM IST (Mon-Sat)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#C28E46] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">Email Us:</strong>
                  <span className="text-stone-300">concierge@sareeelegance.com</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Video className="w-4 h-4 text-[#C28E46] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">Live Video Call Shopping:</strong>
                  <p className="text-stone-300">Inspect weaves in high-definition video with a master weaver.</p>
                  <button
                    onClick={() => setIsVideoModalOpen(true)}
                    className="mt-2 text-xs font-bold text-[#2C221E] bg-[#C28E46] hover:bg-[#D4AF37] px-3 py-1.5 rounded-lg transition-colors inline-block"
                  >
                    Schedule Call Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Flagship Ateliers */}
          <div className="bg-white p-6 rounded-2xl border border-[#E6DFC6] shadow-sm space-y-4 text-xs">
            <h3 className="font-serif text-lg font-bold text-[#2C221E] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#C28E46]" /> Flagship Experience Centers
            </h3>

            <div className="space-y-3 divide-y divide-[#F3EFE6]">
              <div className="pt-2">
                <strong className="font-serif text-sm font-bold text-[#2C221E] block">Varanasi Flagship Atelier</strong>
                <p className="text-stone-600 mt-0.5">D 37/42 Godowlia Crossing, Main Silk Market, Varanasi, UP – 221001</p>
                <p className="text-[10px] text-[#C28E46] font-bold mt-1">Specialty: Kadwa Katan & Gold Zari Weaving Pit Looms</p>
              </div>

              <div className="pt-3">
                <strong className="font-serif text-sm font-bold text-[#2C221E] block">Bengaluru Experience Center</strong>
                <p className="text-stone-600 mt-0.5">100 Feet Road, Indiranagar, Bengaluru, KA – 560038</p>
                <p className="text-[10px] text-[#C28E46] font-bold mt-1">Specialty: Korvai Kanjivaram & Bridal Trousseau Styling</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
