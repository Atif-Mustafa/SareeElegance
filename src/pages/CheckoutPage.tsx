import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  Truck,
  CreditCard,
  QrCode,
  Building,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { OrderAddress, Order } from '../types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    formatPrice,
    currency,
    couponCode,
    couponDiscountPercent,
    placeOrder
  } = useStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Address Form State
  const [address, setAddress] = useState<OrderAddress>({
    fullName: 'Ananya Sharma',
    email: 'ananya.sharma@example.com',
    phone: '+91 98765 43210',
    addressLine1: 'Flat 502, Prestige Royal Gardens',
    addressLine2: 'Indiranagar 100ft Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    country: 'India'
  });

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'COD'>('UPI');
  const [upiId, setUpiId] = useState('ananya@okicici');
  const [codVerified, setCodVerified] = useState(false);

  // Order Complete State
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const rawSubtotalINR = cart.reduce((acc, item) => acc + item.itemTotalPriceINR * item.quantity, 0);
  const discountAmountINR = (rawSubtotalINR * couponDiscountPercent) / 100;
  const subtotalAfterDiscount = rawSubtotalINR - discountAmountINR;
  const taxINR = Math.round(subtotalAfterDiscount * 0.05); // 5% GST
  const shippingINR = rawSubtotalINR >= 1999 ? 0 : 250;
  const totalAmountINR = subtotalAfterDiscount + taxINR + shippingINR;

  const handlePlaceOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const newOrder = placeOrder({
      items: cart,
      subtotalINR: rawSubtotalINR,
      discountINR: discountAmountINR,
      shippingINR,
      taxINR,
      totalINR: totalAmountINR,
      currency,
      currencyAmount: totalAmountINR,
      shippingAddress: address,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'COD_VERIFIED' : 'PAID',
      orderStatus: 'PROCESSING',
      trackingNumber: `EXP-${Math.floor(1000000 + Math.random() * 9000000)}`,
      estimatedDelivery: '3-5 Business Days (Express Air)'
    });

    setCompletedOrder(newOrder);
  };

  if (completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-[#2E6F40]/10 text-[#2E6F40] rounded-full flex items-center justify-center mx-auto border-2 border-[#2E6F40]/30 shadow-xl">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C28E46]">Order Confirmed</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E]">
            Thank You for Choosing SareeElegance!
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
            Your reference number is <strong className="text-[#2C221E] font-mono">{completedOrder.orderId}</strong>. A confirmation email and tracking link have been dispatched.
          </p>
        </div>

        {/* Receipt Box */}
        <div className="bg-white p-6 rounded-2xl border border-[#E6DFC6] shadow-sm text-left max-w-xl mx-auto space-y-4">
          <div className="flex items-center justify-between border-b border-[#F3EFE6] pb-3 text-xs">
            <div>
              <span className="text-stone-400 block">Date</span>
              <strong className="text-[#2C221E]">{completedOrder.date}</strong>
            </div>
            <div>
              <span className="text-stone-400 block">Estimated Delivery</span>
              <strong className="text-[#2E6F40]">{completedOrder.estimatedDelivery}</strong>
            </div>
            <div>
              <span className="text-stone-400 block">Payment</span>
              <strong className="text-[#2C221E]">{completedOrder.paymentMethod}</strong>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            {completedOrder.items.map((it) => (
              <div key={it.id} className="flex items-center gap-3 text-xs">
                <img
                  src={it.product.images[0]}
                  alt={it.product.title}
                  className="w-12 h-14 object-cover rounded-lg border border-stone-200"
                />
                <div className="flex-1">
                  <h5 className="font-serif font-bold text-[#2C221E]">{it.product.title}</h5>
                  <p className="text-[10px] text-stone-500">Qty: {it.quantity} • Shade: {it.selectedColor.name}</p>
                </div>
                <span className="font-bold text-[#2C221E]">{formatPrice(it.itemTotalPriceINR * it.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#F3EFE6] pt-3 flex justify-between items-center text-sm font-bold text-[#2C221E]">
            <span>Total Paid</span>
            <span className="text-base text-[#2C221E]">{formatPrice(completedOrder.totalINR)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            to="/account"
            className="bg-[#2C221E] text-[#D4AF37] font-bold text-xs px-6 py-3.5 rounded-xl hover:bg-[#C28E46] hover:text-[#2C221E] transition-colors shadow-md"
          >
            Track Order in My Account
          </Link>
          <Link
            to="/collections/all"
            className="bg-white text-stone-700 font-bold text-xs px-6 py-3.5 rounded-xl border border-[#E6DFC6] hover:border-[#C28E46] transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-[#C28E46] mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-[#2C221E]">Your shopping bag is empty</h2>
        <p className="text-xs text-stone-500">Add a saree to proceed to checkout.</p>
        <Link
          to="/collections/all"
          className="inline-block bg-[#2C221E] text-[#D4AF37] font-bold text-xs px-6 py-3 rounded-xl"
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E6DFC6] pb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#2E6F40]" />
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C221E]">
            Encrypted Checkout
          </h1>
        </div>

        <span className="text-xs text-stone-500 flex items-center gap-1 font-mono">
          <Lock className="w-3.5 h-3.5 text-[#2E6F40]" /> 256-Bit SSL Secure
        </span>
      </div>

      {/* Progress Steps Indicator */}
      <div className="flex items-center justify-center gap-2 sm:gap-6 max-w-xl mx-auto text-xs font-bold">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#C28E46]' : 'text-stone-400'}`}>
          <span className="w-6 h-6 rounded-full bg-[#2C221E] text-[#D4AF37] flex items-center justify-center text-xs">1</span>
          <span>Contact</span>
        </div>
        <div className="w-8 sm:w-12 h-0.5 bg-stone-300" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#C28E46]' : 'text-stone-400'}`}>
          <span className="w-6 h-6 rounded-full bg-[#2C221E] text-[#D4AF37] flex items-center justify-center text-xs">2</span>
          <span>Address</span>
        </div>
        <div className="w-8 sm:w-12 h-0.5 bg-stone-300" />
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#C28E46]' : 'text-stone-400'}`}>
          <span className="w-6 h-6 rounded-full bg-[#2C221E] text-[#D4AF37] flex items-center justify-center text-xs">3</span>
          <span>Payment</span>
        </div>
      </div>

      {/* Main Grid: Steps Form + Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-[#E6DFC6] shadow-sm space-y-6">
          {/* STEP 1: CONTACT & EXPRESS CHECKOUT */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="font-serif font-bold text-xl text-[#2C221E]">Step 1: Contact Information</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C221E] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={address.email}
                    onChange={(e) => setAddress({ ...address, email: e.target.value })}
                    className="w-full bg-[#FAF7F2] text-xs px-3 py-2.5 rounded-lg border border-[#E6DFC6] focus:outline-none focus:border-[#C28E46]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C221E] mb-1">Mobile Number (For WhatsApp Order Updates) *</label>
                  <input
                    type="tel"
                    required
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="w-full bg-[#FAF7F2] text-xs px-3 py-2.5 rounded-lg border border-[#E6DFC6] focus:outline-none focus:border-[#C28E46]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#F3EFE6] flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="bg-[#2C221E] text-[#D4AF37] font-bold text-xs px-6 py-3 rounded-xl hover:bg-[#C28E46] hover:text-[#2C221E] transition-colors flex items-center gap-2"
                >
                  <span>Continue to Shipping Address</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SHIPPING ADDRESS */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="font-serif font-bold text-xl text-[#2C221E]">Step 2: Shipping Address</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#2C221E] mb-1">Full Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    className="w-full bg-[#FAF7F2] text-xs px-3 py-2.5 rounded-lg border border-[#E6DFC6] focus:outline-none focus:border-[#C28E46]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#2C221E] mb-1">Address Line 1 *</label>
                  <input
                    type="text"
                    required
                    value={address.addressLine1}
                    onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                    className="w-full bg-[#FAF7F2] text-xs px-3 py-2.5 rounded-lg border border-[#E6DFC6] focus:outline-none focus:border-[#C28E46]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C221E] mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full bg-[#FAF7F2] text-xs px-3 py-2.5 rounded-lg border border-[#E6DFC6] focus:outline-none focus:border-[#C28E46]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C221E] mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full bg-[#FAF7F2] text-xs px-3 py-2.5 rounded-lg border border-[#E6DFC6] focus:outline-none focus:border-[#C28E46]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C221E] mb-1">Pincode / Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    className="w-full bg-[#FAF7F2] text-xs px-3 py-2.5 rounded-lg border border-[#E6DFC6] focus:outline-none focus:border-[#C28E46]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C221E] mb-1">Country *</label>
                  <select
                    value={address.country}
                    onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    className="w-full bg-[#FAF7F2] text-xs px-3 py-2.5 rounded-lg border border-[#E6DFC6] focus:outline-none focus:border-[#C28E46]"
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#F3EFE6] flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="text-stone-600 font-bold text-xs flex items-center gap-1 hover:text-[#2C221E]"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="bg-[#2C221E] text-[#D4AF37] font-bold text-xs px-6 py-3 rounded-xl hover:bg-[#C28E46] hover:text-[#2C221E] transition-colors flex items-center gap-2"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT GATEWAY */}
          {step === 3 && (
            <form onSubmit={handlePlaceOrderSubmit} className="space-y-6 animate-in fade-in duration-300">
              <h3 className="font-serif font-bold text-xl text-[#2C221E]">Step 3: Select Payment Option</h3>

              {/* Payment Methods Tabs */}
              <div className="space-y-3">
                <label
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-[#C28E46] bg-[#FAF7F2]'
                      : 'border-[#E6DFC6] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'UPI'}
                      onChange={() => setPaymentMethod('UPI')}
                      className="text-[#C28E46] focus:ring-[#C28E46]"
                    />
                    <div>
                      <strong className="font-serif text-sm text-[#2C221E] block">UPI / Instant Express</strong>
                      <span className="text-[11px] text-stone-500">Google Pay, PhonePe, Paytm, BHIM UPI</span>
                    </div>
                  </div>
                  <QrCode className="w-5 h-5 text-[#C28E46]" />
                </label>

                {paymentMethod === 'UPI' && (
                  <div className="pl-8 pt-1">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="Enter VPA / UPI ID (e.g. 9876543210@paytm)"
                      className="w-full bg-white text-xs px-3 py-2 rounded-lg border border-[#E6DFC6]"
                    />
                  </div>
                )}

                <label
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'CARD'
                      ? 'border-[#C28E46] bg-[#FAF7F2]'
                      : 'border-[#E6DFC6] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'CARD'}
                      onChange={() => setPaymentMethod('CARD')}
                      className="text-[#C28E46] focus:ring-[#C28E46]"
                    />
                    <div>
                      <strong className="font-serif text-sm text-[#2C221E] block">Credit / Debit Cards (Razorpay / Stripe)</strong>
                      <span className="text-[11px] text-stone-500">Visa, Mastercard, Amex, RuPay</span>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-[#C28E46]" />
                </label>

                <label
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-[#C28E46] bg-[#FAF7F2]'
                      : 'border-[#E6DFC6] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="text-[#C28E46] focus:ring-[#C28E46]"
                    />
                    <div>
                      <strong className="font-serif text-sm text-[#2C221E] block">Cash On Delivery (COD)</strong>
                      <span className="text-[11px] text-stone-500">Available across all Indian pincodes with phone confirmation</span>
                    </div>
                  </div>
                  <Truck className="w-5 h-5 text-[#2E6F40]" />
                </label>
              </div>

              <div className="pt-4 border-t border-[#F3EFE6] flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-stone-600 font-bold text-xs flex items-center gap-1 hover:text-[#2C221E]"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <button
                  type="submit"
                  id="place-order-confirm-btn"
                  className="bg-[#C28E46] hover:bg-[#D4AF37] text-[#2C221E] font-bold text-sm px-8 py-3.5 rounded-xl shadow-xl transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 fill-[#2C221E]" />
                  <span>Authorize & Complete Order ({formatPrice(totalAmountINR)})</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Order Breakdown Summary */}
        <div className="lg:col-span-5 bg-[#FAF7F2] p-6 rounded-2xl border border-[#C28E46]/40 shadow-md space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#2C221E] border-b border-[#E6DFC6] pb-3">
            Order Summary ({cart.reduce((a, b) => a + b.quantity, 0)} Items)
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-xl border border-[#E6DFC6] flex gap-3">
                <img
                  src={item.product.images[0]}
                  alt={item.product.title}
                  className="w-14 h-16 object-cover rounded-lg border border-stone-200"
                />
                <div className="flex-1 min-w-0">
                  <h5 className="font-serif font-bold text-xs text-[#2C221E] truncate">{item.product.title}</h5>
                  <p className="text-[10px] text-stone-500">Qty: {item.quantity} • Shade: {item.selectedColor.name}</p>
                  {item.customization.blouseOption !== 'unstitched' && (
                    <span className="text-[10px] text-[#C28E46] font-semibold block">+ Blouse Stitching</span>
                  )}
                </div>
                <span className="font-bold text-xs text-[#2C221E]">
                  {formatPrice(item.itemTotalPriceINR * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs text-stone-600 border-t border-[#E6DFC6] pt-3">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-semibold text-[#2C221E]">{formatPrice(rawSubtotalINR)}</span>
            </div>

            {couponDiscountPercent > 0 && (
              <div className="flex justify-between text-[#2E6F40] font-bold">
                <span>Coupon ({couponCode})</span>
                <span>-{formatPrice(discountAmountINR)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Estimated Taxes (5% GST)</span>
              <span className="font-semibold text-[#2C221E]">{formatPrice(taxINR)}</span>
            </div>

            <div className="flex justify-between">
              <span>Worldwide Air Shipping</span>
              <span className="font-bold text-[#2E6F40]">
                {shippingINR === 0 ? 'FREE' : formatPrice(shippingINR)}
              </span>
            </div>

            <div className="flex justify-between text-base font-bold text-[#2C221E] border-t border-stone-300 pt-3">
              <span>Final Total</span>
              <span className="text-xl text-[#2C221E]">{formatPrice(totalAmountINR)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
