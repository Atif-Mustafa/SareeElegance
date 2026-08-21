import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { BlouseMeasurementForm } from '../features/product/components/BlouseMeasurementForm';
import { ProductCard } from '../features/product/components/ProductCard';
import { OrderTrackingDashboard } from '../features/account/components/OrderTrackingDashboard';
import { customerApi } from '../features/account/api/customer.api';
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
  ShieldCheck,
  LogOut,
  LogIn,
  KeyRound,
  Trash2,
  Check,
  AlertCircle,
  Phone,
  Mail,
  Home,
  Building,
  Save,
  Link as LinkIcon
} from 'lucide-react';
import { BlouseMeasurement } from '../types';

export const AccountPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'orders';

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile' | 'blouse' | 'wishlist' | 'video'>(
    initialTab as any
  );

  const {
    currentUser,
    openAuthModal,
    logoutUser,
    savedAddresses,
    fetchAddresses,
    userOrders,
    blouseProfiles,
    saveBlouseProfile,
    wishlist,
    videoAppointments,
    formatPrice,
    addToast
  } = useStore();

  // State for Add Address Form
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    recipientName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // State for Profile Update
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // State for Claiming Guest Order
  const [claimOrderId, setClaimOrderId] = useState('');
  const [claimToken, setClaimToken] = useState('');
  const [isClaimingOrder, setIsClaimingOrder] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const [showAddBlouseModal, setShowAddBlouseModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || '');
      setProfilePhone(currentUser.phone || '');
      fetchAddresses();
    }
  }, [currentUser, fetchAddresses]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSavingAddress(true);
    try {
      await customerApi.createAddress(newAddress);
      addToast('Address added to your address book', 'success');
      setShowAddAddressModal(false);
      setNewAddress({
        recipientName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        isDefault: false
      });
      fetchAddresses();
    } catch (err: any) {
      addToast(err.message || 'Failed to save address', 'error');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await customerApi.deleteAddress(addressId);
      addToast('Address removed', 'info');
      fetchAddresses();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete address', 'error');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsUpdatingProfile(true);
    try {
      const res = await customerApi.updateProfile({
        name: profileName,
        phone: profilePhone
      });
      addToast('Profile details updated successfully', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleClaimOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal('login');
      return;
    }
    setClaimError(null);
    setIsClaimingOrder(true);
    try {
      await customerApi.claimOrder({
        orderId: claimOrderId.trim(),
        accessToken: claimToken.trim()
      });
      addToast(`Order ${claimOrderId} linked to your account!`, 'success');
      setClaimOrderId('');
      setClaimToken('');
      useStore.getState().fetchServerOrders();
    } catch (err: any) {
      setClaimError(err.message || 'Failed to claim order. Please verify details.');
    } finally {
      setIsClaimingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Account Banner */}
      {currentUser ? (
        <div className="bg-[#2C221E] text-white p-6 sm:p-8 rounded-3xl border-2 border-[#C28E46]/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> Verified Customer Account
            </div>
            <h1 className="font-serif text-3xl font-bold text-white">
              Welcome, {currentUser.name || currentUser.email.split('@')[0]}
            </h1>
            <p className="text-xs text-stone-300">
              {currentUser.email} {currentUser.phone ? `• ${currentUser.phone}` : ''}
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <button
              id="account-logout-btn"
              onClick={logoutUser}
              className="bg-white/10 hover:bg-white/20 text-[#FAF7F2] border border-white/20 px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#2C221E] text-white p-6 sm:p-8 rounded-3xl border-2 border-[#C28E46]/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10 space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-widest">
              <User className="w-4 h-4" /> Customer Atelier & Self-Service
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Sign In to Access Your Royal Silk Account
            </h1>
            <p className="text-xs text-stone-300 leading-relaxed">
              Create an account or sign in to access your complete purchase history, manage your saved shipping addresses, and track real-time shipments.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <button
              id="account-guest-signin-btn"
              onClick={() => openAuthModal('login')}
              className="bg-[#C28E46] hover:bg-[#D4AF37] text-[#2C221E] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Sign In / Register
            </button>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#E6DFC6] pb-2">
        {[
          { id: 'orders', label: 'My Orders & Tracking', icon: Package, count: userOrders.length },
          ...(currentUser ? [
            { id: 'addresses', label: 'Address Book', icon: MapPin, count: savedAddresses.length },
            { id: 'profile', label: 'Profile & Security', icon: User, count: undefined }
          ] : []),
          { id: 'blouse', label: 'Saved Blouse Fittings', icon: Scissors, count: blouseProfiles.length },
          { id: 'wishlist', label: 'Wishlist Sarees', icon: Heart, count: wishlist.length },
          { id: 'video', label: 'Video Shopping Calls', icon: Video, count: videoAppointments.length }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`account-tab-${tab.id}`}
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
              {tab.count !== undefined && (
                <span className="bg-[#FAF7F2] text-[#2C221E] text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full border border-stone-300">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: ORDERS & LIVE TRACKING + CLAIM GUEST ORDER */}
      {activeTab === 'orders' && (
        <div className="space-y-8">
          <OrderTrackingDashboard />

          {/* Link / Claim Past Guest Order Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6DFC6] shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-[#C28E46]">
              <LinkIcon className="w-5 h-5" />
              <h3 className="font-serif text-lg font-bold text-[#2C221E]">
                Link a Guest Order to Your Account
              </h3>
            </div>
            <p className="text-xs text-stone-500 max-w-2xl">
              Placed an order as a guest? Enter your Order ID and confidential access token (found in your confirmation email or URL) to permanently link it to your profile for easy self-service and tracking.
            </p>

            {claimError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {claimError}
              </div>
            )}

            <form onSubmit={handleClaimOrder} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Order ID / UUID
                </label>
                <input
                  id="claim-order-id-input"
                  type="text"
                  required
                  placeholder="e.g. ord_abc123"
                  value={claimOrderId}
                  onChange={(e) => setClaimOrderId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-[#E6DFC6] rounded-lg focus:outline-none focus:border-[#C28E46]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Access Token
                </label>
                <input
                  id="claim-order-token-input"
                  type="text"
                  required
                  placeholder="32+ char secret token"
                  value={claimToken}
                  onChange={(e) => setClaimToken(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-[#E6DFC6] rounded-lg focus:outline-none focus:border-[#C28E46]"
                />
              </div>

              <div className="flex items-end">
                <button
                  id="claim-order-submit-btn"
                  type="submit"
                  disabled={isClaimingOrder}
                  className="w-full py-2.5 bg-[#2C221E] hover:bg-[#C28E46] text-[#FAF7F2] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {isClaimingOrder ? 'Linking...' : 'Link Order to Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: ADDRESS BOOK */}
      {activeTab === 'addresses' && currentUser && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#2C221E]">Saved Delivery Addresses</h2>
              <p className="text-xs text-stone-500">Manage your shipping destinations for faster checkout.</p>
            </div>

            <button
              id="add-address-btn"
              onClick={() => setShowAddAddressModal(true)}
              className="bg-[#2C221E] text-[#D4AF37] text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#C28E46] hover:text-[#2C221E] transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add New Address
            </button>
          </div>

          {/* Add Address Form Modal */}
          {showAddAddressModal && (
            <div className="bg-white p-6 rounded-2xl border-2 border-[#C28E46] shadow-lg animate-in fade-in">
              <h3 className="font-serif font-bold text-lg text-[#2C221E] mb-4">Add Shipping Destination</h3>
              <form onSubmit={handleSaveAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">Recipient Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Priya Sharma"
                    value={newAddress.recipientName}
                    onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-[#E6DFC6] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-[#E6DFC6] rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">Address Line 1</label>
                  <input
                    required
                    type="text"
                    placeholder="House / Flat No., Apartment Name, Street"
                    value={newAddress.addressLine1}
                    onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-[#E6DFC6] rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    placeholder="Landmark, Area"
                    value={newAddress.addressLine2}
                    onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-[#E6DFC6] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">City</label>
                  <input
                    required
                    type="text"
                    placeholder="Bengaluru"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-[#E6DFC6] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">State</label>
                  <input
                    required
                    type="text"
                    placeholder="Karnataka"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-[#E6DFC6] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">PIN / Postal Code</label>
                  <input
                    required
                    type="text"
                    placeholder="560001"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-[#E6DFC6] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">Country</label>
                  <input
                    required
                    type="text"
                    value={newAddress.country}
                    onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-[#E6DFC6] rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2 pt-2">
                  <input
                    id="set-default-address-chk"
                    type="checkbox"
                    checked={newAddress.isDefault}
                    onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                    className="rounded border-stone-300 text-[#C28E46] focus:ring-[#C28E46]"
                  />
                  <label htmlFor="set-default-address-chk" className="text-xs text-stone-700">
                    Set as default delivery address
                  </label>
                </div>

                <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAddressModal(false)}
                    className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingAddress}
                    className="px-5 py-2 bg-[#2C221E] hover:bg-[#C28E46] text-[#FAF7F2] font-bold rounded-lg transition-colors"
                  >
                    {isSavingAddress ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {savedAddresses.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-[#E6DFC6] text-center space-y-3">
              <MapPin className="w-10 h-10 text-[#C28E46] mx-auto opacity-70" />
              <p className="font-serif text-lg font-bold">No saved addresses yet</p>
              <p className="text-xs text-stone-500">Add an address to streamline your checkout process.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`bg-white p-5 rounded-2xl border ${
                    addr.isDefault ? 'border-[#C28E46] shadow-sm' : 'border-[#E6DFC6]'
                  } space-y-3 relative`}
                >
                  {addr.isDefault && (
                    <span className="absolute top-4 right-4 bg-[#C28E46]/15 text-[#C28E46] border border-[#C28E46]/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Default Delivery
                    </span>
                  )}
                  <h4 className="font-serif font-bold text-base text-[#2C221E]">{addr.recipientName}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {addr.addressLine1}
                    {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                    <br />
                    {addr.city}, {addr.state} - {addr.pincode}
                    <br />
                    {addr.country}
                  </p>
                  {addr.phone && (
                    <p className="text-xs text-stone-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> {addr.phone}
                    </p>
                  )}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-end">
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-stone-400 hover:text-red-600 text-xs flex items-center gap-1 transition-colors"
                      title="Delete Address"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: PROFILE & SECURITY */}
      {activeTab === 'profile' && currentUser && (
        <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-[#E6DFC6] shadow-xs space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#2C221E]">Customer Profile Details</h2>
            <p className="text-xs text-stone-500">Update your contact information for seamless communications.</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Email Address (Primary Identity)
              </label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full px-3 py-2 bg-stone-100 text-stone-500 border border-stone-200 rounded-lg cursor-not-allowed"
              />
              <p className="text-[10px] text-stone-400 mt-1">Email is tied to your cryptographic session credentials.</p>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Priya Sharma"
                className="w-full px-3 py-2 bg-white border border-[#E6DFC6] rounded-lg focus:outline-none focus:border-[#C28E46]"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-white border border-[#E6DFC6] rounded-lg focus:outline-none focus:border-[#C28E46]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="px-6 py-2.5 bg-[#2C221E] hover:bg-[#C28E46] text-[#FAF7F2] font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB CONTENT 4: SAVED BLOUSE FITTINGS */}
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

      {/* TAB CONTENT 5: WISHLIST */}
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

      {/* TAB CONTENT 6: VIDEO SHOPPING SESSIONS */}
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
