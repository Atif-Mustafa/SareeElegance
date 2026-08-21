import React, { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { authApi } from '../api/auth.api';
import { X, Lock, Mail, User, Phone, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    openAuthModal,
    setCurrentUser,
    addToast,
    fetchAddresses,
    fetchServerOrders
  } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const isLogin = authModalMode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await authApi.login({ email, password });
        setCurrentUser(res.customer);
        addToast(`Welcome back, ${res.customer.name || res.customer.email.split('@')[0]}!`, 'success');
      } else {
        const res = await authApi.register({ email, password, name, phone });
        setCurrentUser(res.customer);
        addToast(`Account created successfully! Welcome to Saree Elegance.`, 'success');
      }

      await Promise.allSettled([fetchAddresses(), fetchServerOrders()]);
      closeAuthModal();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="auth-modal-container"
        className="relative w-full max-w-md bg-[#FAF7F2] border border-[#C28E46]/40 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header Visual Bar */}
        <div className="bg-[#2C221E] px-6 py-5 text-[#FAF7F2] relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#C28E46] rounded-full flex items-center justify-center">
                <div className="w-3.5 h-3.5 border border-white rotate-45" />
              </div>
              <span className="font-serif text-lg tracking-wide font-bold">
                Saree<span className="text-[#C28E46] italic font-normal">Elegance</span>
              </span>
            </div>
            <button
              id="close-auth-modal-btn"
              onClick={closeAuthModal}
              className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="mt-2 text-xs text-[#E6DFC6] font-light">
            {isLogin
              ? 'Access your saved weaves, order history, and custom blouse fits'
              : 'Create an account for personalized curation, instant tracking & address book'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E6DFC6] bg-[#F4EFE6]/50">
          <button
            id="auth-tab-login"
            type="button"
            onClick={() => { setError(null); openAuthModal('login'); }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              isLogin
                ? 'border-b-2 border-[#C28E46] text-[#2C221E] bg-[#FAF7F2]'
                : 'text-stone-500 hover:text-[#2C221E]'
            }`}
          >
            Sign In
          </button>
          <button
            id="auth-tab-register"
            type="button"
            onClick={() => { setError(null); openAuthModal('register'); }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              !isLogin
                ? 'border-b-2 border-[#C28E46] text-[#2C221E] bg-[#FAF7F2]'
                : 'text-stone-500 hover:text-[#2C221E]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div id="auth-error-banner" className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
              <span className="font-semibold">Notice:</span> {error}
            </div>
          )}

          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#2C221E] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                  <input
                    id="register-name-input"
                    type="text"
                    required
                    placeholder="Priya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E6DFC6] rounded-lg focus:outline-none focus:border-[#C28E46] focus:ring-1 focus:ring-[#C28E46] text-[#2C221E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C221E] uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                  <input
                    id="register-phone-input"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E6DFC6] rounded-lg focus:outline-none focus:border-[#C28E46] focus:ring-1 focus:ring-[#C28E46] text-[#2C221E]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-[#2C221E] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                id="auth-email-input"
                type="email"
                required
                placeholder="priya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E6DFC6] rounded-lg focus:outline-none focus:border-[#C28E46] focus:ring-1 focus:ring-[#C28E46] text-[#2C221E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C221E] uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                id="auth-password-input"
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E6DFC6] rounded-lg focus:outline-none focus:border-[#C28E46] focus:ring-1 focus:ring-[#C28E46] text-[#2C221E]"
              />
            </div>
            {!isLogin && (
              <p className="text-[10px] text-stone-500 mt-1">Minimum 8 characters</p>
            )}
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2C221E] hover:bg-[#C28E46] text-[#FAF7F2] font-semibold text-xs uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Processing...</span>
            ) : isLogin ? (
              <>Sign In <ArrowRight className="w-4 h-4" /></>
            ) : (
              <>Create Account <CheckCircle className="w-4 h-4" /></>
            )}
          </button>

          <div className="pt-2 text-center">
            {isLogin ? (
              <p className="text-xs text-stone-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setError(null); openAuthModal('register'); }}
                  className="font-bold text-[#C28E46] hover:underline"
                >
                  Register now
                </button>
              </p>
            ) : (
              <p className="text-xs text-stone-600">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setError(null); openAuthModal('login'); }}
                  className="font-bold text-[#C28E46] hover:underline"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
