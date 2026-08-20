import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Order, TrackingCheckpoint } from '@/types';
import {
  Truck,
  Package,
  Clock,
  CheckCircle2,
  MapPin,
  Search,
  ExternalLink,
  ShieldCheck,
  Download,
  Calendar,
  MessageCircle,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
  Phone,
  Scissors,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  HelpCircle,
  X
} from 'lucide-react';
import { ReturnModal } from '../../returns/components/ReturnModal';

export const OrderTrackingDashboard: React.FC = () => {
  const { userOrders, formatPrice, addToast } = useStore();

  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    userOrders[0]?.orderId || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Modals state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showCareTipsModal, setShowCareTipsModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  // Delivery preference state
  const [deliveryNote, setDeliveryNote] = useState('Call 15 mins before arrival. Gate entry code: #402');
  const [preferredSlot, setPreferredSlot] = useState('Evening (2 PM - 6 PM)');
  const [isUpdatingPref, setIsUpdatingPref] = useState(false);

  // Filter orders by search query
  const filteredOrders = userOrders.filter(
    (ord) =>
      ord.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.trackingNumber && ord.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ord.items.some((it) => it.product.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeOrder = userOrders.find((o) => o.orderId === selectedOrderId) || userOrders[0];

  if (!activeOrder) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-[#E6DFC6] text-center space-y-4">
        <Package className="w-12 h-12 text-[#C28E46] mx-auto" />
        <h3 className="font-serif text-xl font-bold text-[#2C221E]">No Orders Found</h3>
        <p className="text-xs text-stone-500">You haven't placed any saree orders yet.</p>
      </div>
    );
  }

  const handleCopyTracking = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedTracking(true);
    addToast('Tracking number copied to clipboard!', 'info');
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPref(true);
    setTimeout(() => {
      setIsUpdatingPref(false);
      setShowPreferencesModal(false);
      addToast('Delivery preferences successfully updated with BlueDart Courier!', 'success');
    }, 800);
  };

  // Stepper milestones default calculation
  const getStageStatus = (orderStatus: Order['orderStatus']) => {
    switch (orderStatus) {
      case 'PROCESSING':
        return 1;
      case 'HANDWOVEN_PREPARATION':
        return 2;
      case 'SHIPPED':
        return 4;
      case 'DELIVERED':
        return 5;
      default:
        return 1;
    }
  };

  const currentStageStep = getStageStatus(activeOrder.orderStatus);

  const stages = [
    { step: 1, label: 'Order Confirmed', sub: 'Silk Allocation' },
    { step: 2, label: 'Artisan Looming', sub: 'Craft & Tailoring' },
    { step: 3, label: 'Silk Mark Audit', sub: 'Purity Certificate' },
    { step: 4, label: 'In Transit Air', sub: 'Express Freight' },
    { step: 5, label: 'Doorstep Delivery', sub: 'OTP Verification' }
  ];

  return (
    <div className="space-y-6">
      {/* Search & Order Selector Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#E6DFC6] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID (e.g. SE-894102) or Tracking Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E6DFC6] rounded-xl text-xs focus:outline-none focus:border-[#C28E46]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {filteredOrders.map((ord) => {
              const isSelected = ord.orderId === activeOrder.orderId;
              return (
                <button
                  key={ord.orderId}
                  onClick={() => setSelectedOrderId(ord.orderId)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-[#2C221E] text-[#D4AF37] border-[#C28E46] shadow-md'
                      : 'bg-[#FAF7F2] text-stone-700 border-[#E6DFC6] hover:border-[#C28E46]'
                  }`}
                >
                  <span>Order #{ord.orderId}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      ord.orderStatus === 'DELIVERED'
                        ? 'bg-emerald-500'
                        : ord.orderStatus === 'SHIPPED'
                        ? 'bg-[#C28E46] animate-pulse'
                        : 'bg-amber-500'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Primary Real-Time Tracking Banner Card */}
      <div className="bg-[#2C221E] text-white p-6 sm:p-8 rounded-3xl border-2 border-[#C28E46]/50 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-[#C28E46]/30 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#C28E46]/20 text-[#D4AF37] border border-[#C28E46]/60 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Courier Radar
              </span>

              <span className="bg-white/10 text-stone-300 px-3 py-1 rounded-full text-[10px] font-mono">
                AWB: {activeOrder.trackingNumber || 'N/A'}
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Order #{activeOrder.orderId}
            </h2>

            <p className="text-xs text-stone-300">
              Placed on {activeOrder.date} • Courier Partner:{' '}
              <strong className="text-[#D4AF37]">{activeOrder.carrierName || 'BlueDart Express Priority'}</strong>
            </p>
          </div>

          <div className="bg-[#FAF7F2]/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-left md:text-right min-w-[240px]">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block">
              Estimated Delivery
            </span>
            <div className="font-serif text-lg font-bold text-[#D4AF37] flex items-center gap-2 md:justify-end">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <span>{activeOrder.estimatedDelivery}</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold block mt-1">
              {activeOrder.orderStatus === 'DELIVERED'
                ? '✓ Delivered To Customer'
                : 'On Schedule • Priority Express Air Transit'}
            </span>
          </div>
        </div>

        {/* 5-Stage Stepper Progress Line */}
        <div className="space-y-3 pt-2">
          <div className="hidden md:grid grid-cols-5 gap-2 relative z-10">
            {stages.map((st) => {
              const isPassed = st.step <= currentStageStep;
              const isCurrent = st.step === currentStageStep;
              return (
                <div key={st.step} className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all border-2 ${
                        isCurrent
                          ? 'bg-[#C28E46] text-[#2C221E] border-white shadow-lg ring-4 ring-[#C28E46]/30 scale-110'
                          : isPassed
                          ? 'bg-emerald-700 text-white border-emerald-400'
                          : 'bg-white/10 text-stone-400 border-white/20'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : st.step}
                    </div>
                  </div>
                  <div>
                    <h5 className={`font-serif text-xs font-bold ${isCurrent ? 'text-[#D4AF37]' : isPassed ? 'text-white' : 'text-stone-400'}`}>
                      {st.label}
                    </h5>
                    <p className="text-[10px] text-stone-400">{st.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress Line */}
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-[#C28E46] via-[#D4AF37] to-emerald-400 h-full rounded-full transition-all duration-1000 shadow-lg"
              style={{ width: `${(currentStageStep / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Quick Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#C28E46]/30 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyTracking(activeOrder.trackingNumber || '')}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1.5 rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
            >
              {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />}
              <span>{copiedTracking ? 'Copied' : 'Copy Tracking #'}</span>
            </button>

            {activeOrder.carrierUrl && (
              <a
                href={activeOrder.carrierUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-[#C28E46] hover:bg-[#D4AF37] text-[#2C221E] font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Track on Carrier Portal</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreferencesModal(true)}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1.5 rounded-xl border border-white/20 transition-all"
            >
              Delivery Preferences
            </button>

            <button
              onClick={() => setShowInvoiceModal(true)}
              className="bg-white/10 hover:bg-white/20 text-[#D4AF37] font-bold px-3 py-1.5 rounded-xl border border-[#C28E46]/60 transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tax Invoice & Silk Mark</span>
            </button>

            {activeOrder.orderStatus === 'DELIVERED' && (
              <button
                onClick={() => setShowReturnModal(true)}
                className="bg-[#C28E46] hover:bg-[#D4AF37] text-[#2C221E] font-bold px-3 py-1.5 rounded-xl border border-[#C28E46]/60 transition-all flex items-center gap-1.5"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Return Items</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Live Checkpoints Log + Route & Address Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Live Scan Checkpoints */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#E6DFC6] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#F3EFE6] pb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2C221E] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#C28E46]" /> Real-Time Checkpoint Scans
              </h3>
              <p className="text-xs text-stone-500">Chronological transit and artisan crafting updates</p>
            </div>
            <span className="text-[10px] font-bold bg-[#FAF7F2] text-[#2C221E] border border-[#E6DFC6] px-2.5 py-1 rounded-lg">
              {activeOrder.checkpoints?.length || 0} Events Recorded
            </span>
          </div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[#E6DFC6]">
            {(activeOrder.checkpoints || []).map((chk, idx) => {
              return (
                <div key={chk.id || idx} className="relative pl-9 space-y-1">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute left-0 top-1 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                      chk.active
                        ? 'bg-[#C28E46] border-white text-white shadow-md ring-4 ring-[#C28E46]/20'
                        : chk.completed
                        ? 'bg-emerald-600 border-emerald-200 text-white'
                        : 'bg-stone-200 border-white text-stone-400'
                    }`}
                  >
                    {chk.completed ? <Check className="w-4 h-4" /> : <Clock className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className={`font-serif text-sm font-bold ${chk.active ? 'text-[#C28E46]' : 'text-[#2C221E]'}`}>
                      {chk.title}
                    </h4>
                    <span className="text-[10px] text-stone-400 font-mono bg-[#FAF7F2] px-2 py-0.5 rounded border border-stone-200">
                      {chk.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 font-medium">{chk.location}</p>
                  {chk.description && <p className="text-xs text-stone-500 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E6DFC6]/60 mt-1">{chk.description}</p>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Columns: Delivery Address, Courier Details & Silk Care */}
        <div className="lg:col-span-5 space-y-6">
          {/* Shipping Address Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6DFC6] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#F3EFE6] pb-3">
              <h4 className="font-serif font-bold text-sm text-[#2C221E] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C28E46]" /> Shipping Destination
              </h4>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                Verified Address
              </span>
            </div>

            <div className="text-xs text-stone-700 space-y-1">
              <strong className="block text-[#2C221E] font-serif text-sm">{activeOrder.shippingAddress.fullName}</strong>
              <p>{activeOrder.shippingAddress.addressLine1}</p>
              {activeOrder.shippingAddress.addressLine2 && <p>{activeOrder.shippingAddress.addressLine2}</p>}
              <p>
                {activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.state} - {activeOrder.shippingAddress.pincode}
              </p>
              <p className="text-stone-500 pt-1">Phone: {activeOrder.shippingAddress.phone}</p>
            </div>

            <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E6DFC6] text-xs text-stone-600 flex items-start gap-2">
              <Info className="w-4 h-4 text-[#C28E46] shrink-0 mt-0.5" />
              <p>
                <strong>Delivery Note:</strong> {deliveryNote}
              </p>
            </div>
          </div>

          {/* Saree Craft & Silk Mark Authenticity Verification Card */}
          <div className="bg-[#FAF7F2] p-6 rounded-3xl border-2 border-[#C28E46]/40 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2C221E] text-[#D4AF37] flex items-center justify-center font-serif font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#2C221E]">Silk Mark Organization Certified</h4>
                <p className="text-[10px] text-stone-500">Government of India Pure Silk Guarantee #SM-88391</p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Your saree is dispatched in custom temperature-controlled luxury box packaging with anti-humidity lining and artisan signature tag.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setShowCareTipsModal(true)}
                className="flex-1 bg-white hover:bg-[#2C221E] text-[#2C221E] hover:text-[#D4AF37] font-bold text-xs py-2 rounded-xl border border-[#C28E46] transition-colors flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> Saree Unboxing & Care
              </button>

              <button
                onClick={() => addToast('Connecting to WhatsApp Silk Concierge...', 'info')}
                className="bg-[#2E6F40] hover:bg-emerald-800 text-white font-bold text-xs p-2 rounded-xl transition-colors"
                title="Chat with Silk Concierge"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Purchased Items Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-[#E6DFC6] shadow-sm space-y-4">
        <h3 className="font-serif text-lg font-bold text-[#2C221E]">Purchased Saree Package Breakdown</h3>

        <div className="space-y-3">
          {activeOrder.items.map((it) => (
            <div key={it.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-[#FAF7F2] rounded-2xl border border-[#E6DFC6]">
              <div className="flex items-center gap-4">
                <img
                  src={it.product.images[0]}
                  alt={it.product.title}
                  className="w-16 h-20 object-cover rounded-xl border border-stone-200 shrink-0"
                />
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-base text-[#2C221E]">{it.product.title}</h4>
                  <p className="text-xs text-stone-500">
                    Fabric: {it.product.fabric} • Color: {it.selectedColor.name} • Qty: {it.quantity}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {it.customization.fallAndPico && (
                      <span className="text-[10px] bg-[#C28E46]/10 text-[#C28E46] font-bold px-2 py-0.5 rounded border border-[#C28E46]/30">
                        ✓ Fall & Pico Ready
                      </span>
                    )}
                    {it.customization.blouseOption !== 'unstitched' && (
                      <span className="text-[10px] bg-[#2C221E] text-[#D4AF37] font-bold px-2 py-0.5 rounded">
                        <Scissors className="w-3 h-3 inline mr-1" /> Custom Blouse Tailored
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right sm:text-right w-full sm:w-auto border-t sm:border-0 border-stone-200 pt-2 sm:pt-0">
                <span className="text-xs text-stone-500 block">Item Price</span>
                <span className="font-serif font-bold text-base text-[#2C221E]">{formatPrice(it.itemTotalPriceINR * it.quantity)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#F3EFE6] text-xs font-bold text-[#2C221E]">
          <span>Total Order Value Paid ({activeOrder.paymentMethod})</span>
          <span className="text-lg text-[#2C221E]">{formatPrice(activeOrder.totalINR)}</span>
        </div>
      </div>

      {/* TAX INVOICE & SILK MARK CERTIFICATE MODAL */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#FAF7F2] rounded-3xl max-w-2xl w-full border-2 border-[#C28E46] shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E6DFC6] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#C28E46]">Official Document</span>
                <h3 className="font-serif text-xl font-bold text-[#2C221E]">Tax Invoice & Authenticity Certificate</h3>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E6DFC6] space-y-4 text-xs text-stone-700">
              <div className="flex justify-between border-b pb-3">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#2C221E]">Silk & Elegance Heritage Atelier</h4>
                  <p>GSTIN: 09AABCU9603R1ZM</p>
                  <p>Varanasi Silk Weaver Colony, UP 221001</p>
                </div>
                <div className="text-right">
                  <p><strong>Invoice #:</strong> INV-{activeOrder.orderId}</p>
                  <p><strong>Date:</strong> {activeOrder.date}</p>
                  <p><strong>Silk Mark #:</strong> SM-88391-IN</p>
                </div>
              </div>

              <div className="space-y-2">
                <strong className="block text-[#2C221E]">Billed To:</strong>
                <p>{activeOrder.shippingAddress.fullName}</p>
                <p>{activeOrder.shippingAddress.addressLine1}, {activeOrder.shippingAddress.city}</p>
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between font-bold">
                  <span>Subtotal:</span>
                  <span>{formatPrice(activeOrder.subtotalINR)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5% Silk Handloom):</span>
                  <span>{formatPrice(activeOrder.taxINR)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#2C221E] border-t pt-2">
                  <span>Grand Total Paid:</span>
                  <span>{formatPrice(activeOrder.totalINR)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  addToast('Downloading Tax Invoice PDF...', 'success');
                  setShowInvoiceModal(false);
                }}
                className="flex-1 bg-[#2C221E] hover:bg-[#C28E46] text-[#D4AF37] hover:text-[#2C221E] font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download PDF Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELIVERY PREFERENCES MODAL */}
      {showPreferencesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#FAF7F2] rounded-3xl max-w-lg w-full border-2 border-[#C28E46] shadow-2xl p-6 sm:p-8 space-y-6 relative">
            <div className="flex items-center justify-between border-b border-[#E6DFC6] pb-4">
              <h3 className="font-serif text-xl font-bold text-[#2C221E]">Update Delivery Instructions</h3>
              <button
                onClick={() => setShowPreferencesModal(false)}
                className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2C221E] mb-1">Preferred Time Window:</label>
                <select
                  value={preferredSlot}
                  onChange={(e) => setPreferredSlot(e.target.value)}
                  className="w-full p-3 bg-white border border-[#E6DFC6] rounded-xl text-xs focus:outline-none focus:border-[#C28E46]"
                >
                  <option value="Morning (9 AM - 1 PM)">Morning Slot (9 AM - 1 PM)</option>
                  <option value="Evening (2 PM - 6 PM)">Evening Slot (2 PM - 6 PM)</option>
                  <option value="Weekend Special Delivery">Weekend Special Delivery</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C221E] mb-1">Gate Code / Delivery Instructions:</label>
                <textarea
                  rows={3}
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  className="w-full p-3 bg-white border border-[#E6DFC6] rounded-xl text-xs focus:outline-none focus:border-[#C28E46]"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingPref}
                className="w-full bg-[#2C221E] hover:bg-[#C28E46] text-[#D4AF37] hover:text-[#2C221E] font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isUpdatingPref ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Save Instructions for Courier'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SAREE CARE & UNBOXING TIPS MODAL */}
      {showCareTipsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#FAF7F2] rounded-3xl max-w-md w-full border-2 border-[#C28E46] shadow-2xl p-6 space-y-4 relative">
            <div className="flex items-center justify-between border-b border-[#E6DFC6] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#2C221E]">Pure Silk Preservation Tips</h3>
              <button
                onClick={() => setShowCareTipsModal(false)}
                className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-700">
              <div className="p-3 bg-white rounded-xl border border-[#E6DFC6]">
                <strong className="block text-[#C28E46] font-bold">1. Unboxing & Hanger Airing</strong>
                <p>Allow pure silk to breathe on a padded hanger for 2 hours after opening package.</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E6DFC6]">
                <strong className="block text-[#C28E46] font-bold">2. Low Temperature Steam Iron</strong>
                <p>Iron inside out with a protective cotton cloth buffer on lowest silk heat setting.</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E6DFC6]">
                <strong className="block text-[#C28E46] font-bold">3. Pure Cotton Storage Bag</strong>
                <p>Store in the provided breathable muslin bag. Refrain from plastic covers to prevent yellowing.</p>
              </div>
            </div>

            <button
              onClick={() => setShowCareTipsModal(false)}
              className="w-full bg-[#2C221E] text-[#D4AF37] font-bold text-xs py-2.5 rounded-xl"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* RETURN MODAL */}
      {showReturnModal && (
        <ReturnModal 
          order={activeOrder} 
          onClose={() => setShowReturnModal(false)} 
          accessToken="dummy-token-for-client"
        />
      )}
    </div>
  );
};
