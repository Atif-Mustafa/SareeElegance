import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  Truck,
  CheckCircle2,
  Scissors,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatMoney } from '@/lib/formatting/money';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    validatedSubtotal,
    isCartValidating,
    cartValidationStatus,
    cartValidationReason,
    validateServerCart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    formatPrice,
    couponCode,
    couponDiscountPercent,
    applyCoupon
  } = useStore();

  const [inputCoupon, setInputCoupon] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isCartOpen && cartValidationStatus === 'stale') {
      validateServerCart();
    }
  }, [isCartOpen, cartValidationStatus, validateServerCart]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCoupon.trim()) {
      applyCoupon(inputCoupon);
    }
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  if (!isCartOpen) return null;

  // We do not calculate authoritative discounts, shipping, or grand total here.
  const hasValidSubtotal = cartValidationStatus === 'valid' && validatedSubtotal;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-[#2C221E]/60 backdrop-blur-sm">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-[#FAF7F2] max-w-md w-full h-full shadow-2xl flex flex-col border-l border-[#C28E46]/40 overflow-hidden"
        >
          {/* Cart Header */}
          <div className="p-5 bg-[#2C221E] text-white flex items-center justify-between border-b border-[#C28E46]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="font-serif text-xl font-bold text-white">Your Shopping Bag</h3>
              <span className="bg-[#C28E46] text-[#2C221E] text-xs font-bold px-2 py-0.5 rounded-full">
                {cart.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            </div>

            <button
              id="close-cart-drawer-btn"
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F3EFE6] flex items-center justify-center text-[#C28E46] mx-auto border border-[#E6DFC6]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-xl font-bold text-[#2C221E]">Your shopping bag is empty</h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Explore our handwoven Banarasi, Kanjivaram, and Tissue Silk saree collections.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/collections/all');
                  }}
                  className="bg-[#2C221E] hover:bg-[#C28E46] text-white hover:text-[#2C221E] font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md"
                >
                  Explore Sarees
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-3.5 rounded-xl border border-[#E6DFC6] shadow-sm flex gap-3.5 relative group"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-20 h-24 object-cover rounded-lg shrink-0 border border-stone-200"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-1">
                      <h5 className="font-serif text-sm font-bold text-[#2C221E] truncate pr-4">
                        {item.product.title}
                      </h5>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-stone-600">
                      <span className="flex items-center gap-1">
                        Color:
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block border border-stone-300"
                          style={{ backgroundColor: item.selectedColor.hex }}
                        />
                        <strong className="text-[#2C221E]">{item.selectedColor.name}</strong>
                      </span>
                    </div>

                    {/* Customizations summary tags */}
                    <div className="space-y-0.5 pt-0.5">
                      {item.customization.fallAndPico && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-[#FAF7F2] text-[#2C221E] border border-[#E6DFC6] px-1.5 py-0.5 rounded mr-1">
                          ✓ Fall & Pico (+₹150*)
                        </span>
                      )}
                      {item.customization.blouseOption !== 'unstitched' && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-[#C28E46]/10 text-[#C28E46] border border-[#C28E46]/30 px-1.5 py-0.5 rounded font-semibold">
                          <Scissors className="w-2.5 h-2.5" /> Blouse:{' '}
                          {item.customization.blouseOption === 'standard'
                            ? `Stitched (${item.customization.standardBlouseSize})`
                            : 'Custom Fit'}
                        </span>
                      )}
                      {item.customization.petticoatOption && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-[#FAF7F2] text-stone-700 border border-[#E6DFC6] px-1.5 py-0.5 rounded">
                          + Petticoat (+₹499*)
                        </span>
                      )}
                    </div>

                    {/* Quantity & Item Price */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[#E6DFC6] rounded-md bg-[#FAF7F2]">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="p-1 hover:bg-stone-200 text-stone-700 transition-colors rounded-l-md"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-[#2C221E]">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="p-1 hover:bg-stone-200 text-stone-700 transition-colors rounded-r-md"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="p-5 bg-white border-t border-[#E6DFC6] space-y-3">
              {/* Price Totals */}
              <div className="space-y-1.5 text-xs text-stone-600 pt-2">
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
                    <div className="flex justify-between font-bold text-sm text-[#2C221E]">
                      <span>Verified Catalog Subtotal</span>
                      <span>{formatMoney(validatedSubtotal)}</span>
                    </div>
                    <div className="text-[10px] text-stone-400 italic">
                      * Customization fees, tax, shipping, and discounts are not included in the verified subtotal and will be calculated during checkout.
                    </div>
                  </>
                )}
              </div>

              {/* Checkout Button */}
              <button
                id="cart-proceed-checkout-btn"
                onClick={handleCheckoutClick}
                disabled={!hasValidSubtotal}
                className="w-full bg-[#C28E46] hover:bg-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed text-[#2C221E] font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
