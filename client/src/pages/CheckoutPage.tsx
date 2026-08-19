import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  Truck,
  CreditCard,
  QrCode,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { OrderAddress, Order } from '../types';
import { formatMoney } from '../lib/formatting/money';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    validatedSubtotal,
    isCartValidating,
    cartValidationStatus,
    validateServerCart,
    placeOrder,
    clearCart,
    formatPrice,
    couponCode,
    couponDiscountPercent
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

  // Order Complete State
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  React.useEffect(() => {
    if (cartValidationStatus === 'stale') {
      validateServerCart();
    }
  }, [cartValidationStatus, validateServerCart]);

  const checkoutSession = useStore((state) => state.checkoutSession);
  const initializeCheckout = useStore((state) => state.initializeCheckout);
  const [isInitializing, setIsInitializing] = useState(false);
  const handleCheckoutInitialization = async () => {
    if (cart.length === 0) return;
    setIsInitializing(true);
    try {
      await initializeCheckout(address);
      setStep(3);
    } catch (e) {
    } finally {
      setIsInitializing(false);
    }
  };

  const hasValidSubtotal = cartValidationStatus === 'valid' && validatedSubtotal;

  const createPayment = async () => {
    const res = await fetch('/api/v1/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkoutSessionId: checkoutSession?.id }),
    });
    if (!res.ok) throw new Error('Payment initialization failed');
    return res.json();
  };

  const verifyPayment = async (data: any) => {
    const res = await fetch('/api/v1/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Payment verification failed');
    return res.json();
  };

  const handlePlaceOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !hasValidSubtotal) return;
    
    try {
      const initRes = await createPayment();
      
      if (paymentMethod === 'CARD' || paymentMethod === 'UPI') {
        const options = {
          key: initRes.providerData.key,
          amount: initRes.providerData.amount,
          currency: initRes.providerData.currency,
          name: "Saree Elegance",
          description: "Order Payment",
          order_id: initRes.providerData.orderId,
          handler: async function (response: any) {
            try {
              const result = await verifyPayment({
                providerOrderId: response.razorpay_order_id,
                providerPaymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature
              });
              clearCart();
              navigate(`/order-confirmation/${result.order.id}?accessToken=${result.order.accessToken}`);
            } catch (err) {
              alert('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: address.fullName,
            email: checkoutSession?.email || '',
            contact: checkoutSession?.phone || ''
          },
          theme: {
            color: "#C28E46"
          }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Mock COD verification
        const result = await verifyPayment({
          providerOrderId: initRes.providerData.orderId,
          providerPaymentId: 'mock_cod_payment',
          signature: 'mock_success_signature'
        });
        clearCart();
        navigate(`/order-confirmation/${result.order.id}?accessToken=${result.order.accessToken}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to initialize payment.');
    }
  };

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
                  onClick={handleCheckoutInitialization} disabled={isInitializing}
                  className="bg-[#2C221E] text-[#D4AF37] font-bold text-xs px-6 py-3 rounded-xl hover:bg-[#C28E46] hover:text-[#2C221E] transition-colors flex items-center gap-2"
                >
                  <span>{isInitializing ? 'Validating...' : 'Continue to Payment'}</span>
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
                  <span>Authorize & Complete Order</span>
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
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs text-stone-600 border-t border-[#E6DFC6] pt-3">
            {!hasValidSubtotal ? (
              <div className="text-center text-sm font-semibold text-stone-500 py-2">
                {cartValidationStatus === 'invalid' 
                  ? 'Unable to verify current cart total.' 
                  : cartValidationStatus === 'stale' 
                    ? 'Price verification required.' 
                    : 'Validating current price...'}
              </div>
            ) : (
              <>
                <div className="flex justify-between font-bold text-[#2C221E]">
                  <span>Verified Catalog Subtotal</span>
                  <span>{checkoutSession ? formatMoney(checkoutSession.subtotal) : formatMoney(validatedSubtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Customization Fees</span>
                  <span className="font-semibold text-stone-400">Calculated upon final review</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Estimated Taxes</span>
                  <span className="font-semibold text-stone-400">TBD</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-bold text-stone-400">TBD</span>
                </div>

                <div className="flex justify-between text-base font-bold text-[#2C221E] border-t border-stone-300 pt-3">
                  <span>Final Total</span>
                  <span className="text-stone-400 text-sm">Unavailable</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
