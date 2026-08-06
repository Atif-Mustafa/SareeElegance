import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { BlouseMeasurementForm } from '../components/product/BlouseMeasurementForm';
import { ProductCard } from '../components/product/ProductCard';
import { OrderTrackingDashboard } from '../components/account/OrderTrackingDashboard';
import {
  User,
  Package,
  Scissors,
  Heart,
  Video,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  Plus,
  ChevronRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { BlouseMeasurement } from '../types';

export const AccountPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'orders';

  const [activeTab, setActiveTab] = useState<'orders' | 'blouse' | 'wishlist' | 'video' | 'addresses'>(
    initialTab as any
  );

  const {
    userOrders,
    blouseProfiles,
    saveBlouseProfile,
    wishlist,
    videoAppointments,
    formatPrice
  } = useStore();

  const [showAddBlouseModal, setShowAddBlouseModal] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Account Banner */}
      <div className="bg-[#2C221E] text-white p-6 sm:p-8 rounded-3xl border-2 border-[#C28E46]/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-widest">
            <User className="w-4 h-4" /> Client Atelier Dashboard
          </div>
          <h1 className="font-serif text-3xl font-bold text-white">Welcome, Priya Sharma</h1>
          <p className="text-xs text-stone-300">priya.s@example.com • Royal Silk Circle Gold Member</p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <span className="bg-[#C28E46]/20 text-[#D4AF37] border border-[#C28E46]/50 px-3 py-1.5 rounded-full text-xs font-bold">
            1,250 Silk Loyalty Points
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#E6DFC6] pb-2">
        {[
          { id: 'orders', label: 'My Orders & Tracking', icon: Package, count: userOrders.length },
          { id: 'blouse', label: 'Saved Blouse Fittings', icon: Scissors, count: blouseProfiles.length },
          { id: 'wishlist', label: 'Wishlist Sarees', icon: Heart, count: wishlist.length },
          { id: 'video', label: 'Video Shopping Calls', icon: Video, count: videoAppointments.length }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchParams({ tab: tab.id });
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-[#2C221E] text-[#D4AF37] border border-[#C28E46] shadow-md'
                  : 'bg-white text-stone-700 border border-[#E6DFC6] hover:border-[#C28E46]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className="bg-[#FAF7F2] text-[#2C221E] text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full border border-stone-300">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: ORDERS & LIVE TRACKING */}
      {activeTab === 'orders' && <OrderTrackingDashboard />}

      {/* TAB CONTENT 2: SAVED BLOUSE FITTINGS */}
      {activeTab === 'blouse' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#2C221E]">Saved Blouse Measurement Profiles</h2>
              <p className="text-xs text-stone-500">Use these pre-saved fitting measurements when tailoring new sarees.</p>
            </div>

            <button
              onClick={() => setShowAddBlouseModal(!showAddBlouseModal)}
              className="bg-[#2C221E] text-[#D4AF37] text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#C28E46] hover:text-[#2C221E] transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add New Fit Profile
            </button>
          </div>

          {showAddBlouseModal && (
            <div className="bg-white p-6 rounded-2xl border-2 border-[#C28E46]">
              <h3 className="font-serif font-bold text-lg mb-4">Create New Blouse Measurement Profile</h3>
              <BlouseMeasurementForm
                onSave={(profile) => {
                  saveBlouseProfile(profile);
                  setShowAddBlouseModal(false);
                }}
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {blouseProfiles.map((prof) => (
              <div key={prof.id} className="bg-white p-5 rounded-2xl border border-[#E6DFC6] shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-[#F3EFE6] pb-2">
                  <h3 className="font-serif font-bold text-base text-[#2C221E]">{prof.profileName}</h3>
                  <span className="text-[10px] bg-[#C28E46]/10 text-[#C28E46] font-bold px-2 py-0.5 rounded">
                    {prof.style}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-stone-600 font-mono pt-1">
                  <div>Bust: <strong>{prof.bust}"</strong></div>
                  <div>Waist: <strong>{prof.waist}"</strong></div>
                  <div>Shoulder: <strong>{prof.shoulder}"</strong></div>
                  <div>Sleeve: <strong>{prof.sleeveLength}"</strong></div>
                  <div>Front Neck: <strong>{prof.frontNeckDepth}"</strong></div>
                  <div>Back Neck: <strong>{prof.backNeckDepth}"</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: WISHLIST */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-bold text-[#2C221E]">Saved Wishlist Sarees</h2>

          {wishlist.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-[#E6DFC6] text-center space-y-3">
              <Heart className="w-10 h-10 text-rose-500 mx-auto" />
              <p className="font-serif text-lg font-bold">Your wishlist is empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlist.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 4: VIDEO SHOPPING SESSIONS */}
      {activeTab === 'video' && (
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-bold text-[#2C221E]">Virtual Video Shopping Appointments</h2>

          {videoAppointments.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-[#E6DFC6] text-center space-y-3">
              <Video className="w-10 h-10 text-[#C28E46] mx-auto" />
              <p className="font-serif text-lg font-bold">No video shopping appointments booked</p>
            </div>
          ) : (
            <div className="space-y-4">
              {videoAppointments.map((app) => (
                <div key={app.id} className="bg-white p-5 rounded-2xl border border-[#E6DFC6] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#C28E46]">Appointment #{app.id}</span>
                    <h4 className="font-serif font-bold text-base text-[#2C221E]">{app.preferredPlatform} Call</h4>
                    <p className="text-xs text-stone-500">Date: {app.date} • Time Slot: {app.timeSlot}</p>
                    <p className="text-[11px] text-stone-600 mt-1">Interests: {app.sareeInterest.join(', ')}</p>
                  </div>
                  <span className="bg-[#2E6F40]/10 text-[#2E6F40] border border-[#2E6F40]/30 text-xs font-bold px-3 py-1.5 rounded-full">
                    ✓ Confirmed
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
