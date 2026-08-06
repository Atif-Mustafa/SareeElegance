import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Video, Calendar, Clock, CheckCircle, X, Sparkles, User, Mail, Phone, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const VideoShoppingModal: React.FC = () => {
  const { isVideoModalOpen, setIsVideoModalOpen, bookVideoAppointment } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredPlatform: 'WhatsApp Video' as 'WhatsApp Video' | 'Zoom Call',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days ahead
    timeSlot: '11:00 AM - 12:00 PM IST',
    sareeInterest: ['Banarasi Katan', 'Kanjivaram Bridal'],
    notes: ''
  });

  const timeSlots = [
    '10:00 AM - 11:00 AM IST',
    '11:00 AM - 12:00 PM IST',
    '02:00 PM - 03:00 PM IST',
    '04:00 PM - 05:00 PM IST',
    '06:00 PM - 07:00 PM IST',
    '08:00 PM - 09:00 PM IST (US & Europe Friendly)'
  ];

  const sareeOptions = [
    'Banarasi Katan Silk',
    'Kanjivaram Pure Zari',
    'Tissue Silk',
    'Ready To Wear',
    'Bridal Trousseau Heavy Sarees'
  ];

  const toggleSareeInterest = (saree: string) => {
    if (formData.sareeInterest.includes(saree)) {
      setFormData({
        ...formData,
        sareeInterest: formData.sareeInterest.filter((s) => s !== saree)
      });
    } else {
      setFormData({
        ...formData,
        sareeInterest: [...formData.sareeInterest, saree]
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    bookVideoAppointment(formData);
  };

  if (!isVideoModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C221E]/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-[#FAF7F2] rounded-2xl border border-[#C28E46] shadow-2xl max-w-xl w-full my-8 overflow-hidden relative"
        >
          {/* Header */}
          <div className="bg-[#2C221E] text-white p-6 relative border-b border-[#C28E46]">
            <button
              id="close-video-modal-btn"
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-full hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-xs tracking-wider uppercase mb-1">
              <Video className="w-4 h-4 animate-pulse" /> Virtual Boutique Concierge
            </div>
            <h3 className="font-serif text-2xl font-bold text-white">
              Schedule Private Live Video Shopping
            </h3>
            <p className="text-xs text-stone-300 mt-1">
              Experience our Varanasi & Kanchipuram loom collections in 4K resolution with a dedicated Senior Silk Master.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2C221E] mb-1">Your Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Priya Sharma"
                    className="w-full bg-white text-xs text-[#2C221E] pl-9 pr-3 py-2.5 rounded-lg border border-[#E6DFC6] focus:outline-none focus:border-[#C28E46]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C221E] mb-1">WhatsApp / Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white text-xs text-[#2C221E] pl-9 pr-3 py-2.5 rounded-lg border border-[#E6DFC6] focus:outline-none focus:border-[#C28E46]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2C221E] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="priya@example.com"
                    className="w-full bg-white text-xs text-[#2C221E] pl-9 pr-3 py-2.5 rounded-lg border border-[#E6DFC6] focus:outline-none focus:border-[#C28E46]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C221E] mb-1">Call Platform</label>
                <select
                  value={formData.preferredPlatform}
                  onChange={(e) => setFormData({ ...formData, preferredPlatform: e.target.value as any })}
                  className="w-full bg-white text-xs text-[#2C221E] px-3 py-2.5 rounded-lg border border-[#E6DFC6] focus:outline-none focus:border-[#C28E46]"
                >
                  <option value="WhatsApp Video">WhatsApp Video Call</option>
                  <option value="Zoom Call">Zoom Video Meeting</option>
                </select>
              </div>
            </div>

            {/* Date & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2C221E] mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#C28E46]" /> Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-white text-xs text-[#2C221E] px-3 py-2.5 rounded-lg border border-[#E6DFC6] focus:outline-none focus:border-[#C28E46]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C221E] mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#C28E46]" /> Preferred Time Slot *
                </label>
                <select
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  className="w-full bg-white text-xs text-[#2C221E] px-3 py-2.5 rounded-lg border border-[#E6DFC6] focus:outline-none focus:border-[#C28E46]"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Saree Categories Interested In */}
            <div>
              <label className="block text-xs font-bold text-[#2C221E] mb-2">
                Which fabrics / weaves would you like us to present?
              </label>
              <div className="flex flex-wrap gap-2">
                {sareeOptions.map((option) => {
                  const selected = formData.sareeInterest.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleSareeInterest(option)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                        selected
                          ? 'bg-[#2C221E] text-[#D4AF37] border-[#C28E46] font-semibold'
                          : 'bg-white text-stone-700 border-[#E6DFC6] hover:border-[#C28E46]'
                      }`}
                    >
                      {selected && <CheckCircle className="w-3 h-3 text-[#D4AF37]" />}
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-xs font-bold text-[#2C221E] mb-1">
                Occasion or Color preferences (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Looking for maroon bridal Banarasi with real gold zari for November wedding"
                className="w-full bg-white text-xs text-[#2C221E] p-3 rounded-lg border border-[#E6DFC6] focus:outline-none focus:border-[#C28E46]"
              />
            </div>

            {/* Footer Submit */}
            <div className="pt-2 flex items-center justify-between border-t border-[#E6DFC6]">
              <span className="text-[11px] text-stone-500 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-[#2E6F40]" /> 100% Free & No-Obligation Appointment
              </span>
              <button
                type="submit"
                id="submit-video-booking-btn"
                className="bg-[#C28E46] hover:bg-[#D4AF37] text-[#2C221E] font-bold text-xs px-6 py-3 rounded-xl transition-colors shadow-md flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 fill-[#2C221E]" />
                <span>Confirm Appointment</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
