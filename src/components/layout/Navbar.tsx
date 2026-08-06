import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { LanguageSelector } from '../ui/LanguageSelector';
import {
  Video,
  Search,
  Heart,
  ShoppingBag,
  User,
  Sparkles,
  Menu,
  X,
  Globe,
  ChevronDown,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { Currency } from '../../types';

export const Navbar: React.FC = () => {
  const {
    currency,
    setCurrency,
    cart,
    wishlist,
    setIsCartOpen,
    setIsSearchOpen,
    setIsVideoModalOpen,
    openGlossaryModal,
    t
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const currencies: Currency[] = ['INR', 'USD', 'EUR'];

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.banarasi'), path: '/collections/banarasi' },
    { name: t('nav.kanjivaram'), path: '/collections/kanjivaram' },
    { name: t('nav.tissue'), path: '/collections/tissue-silk' },
    { name: t('nav.ready'), path: '/collections/ready-to-wear' },
    { name: t('nav.collections'), path: '/collections/all' },
    { name: t('nav.heritage'), path: '/heritage' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E6DFC6]/60 transition-all">
      {/* Top Announcement Bar */}
      <div
        id="top-announcement-bar"
        className="bg-[#2C221E] text-[#FAF7F2] text-[10px] uppercase tracking-[0.2em] py-2 px-4 flex justify-center items-center relative z-50 border-b border-[#C28E46]/30"
      >
        <span className="text-center font-medium">Free Global Shipping on orders over ₹1,999 | COD Available</span>
        <button
          id="nav-book-video-shopping-btn"
          onClick={() => setIsVideoModalOpen(true)}
          className="hidden md:block absolute right-8 text-[9px] border border-[#FAF7F2]/30 px-3 py-1 rounded-full hover:bg-white hover:text-[#2C221E] transition-colors font-semibold tracking-wider"
        >
          Book Video Shopping
        </button>
      </div>

      {/* Main Navbar Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-4">
        {/* Mobile Hamburger Button */}
        <button
          id="mobile-menu-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-[#2C221E] hover:text-[#C28E46] p-2"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand Logo */}
        <Link
          to="/"
          id="brand-logo-link"
          className="flex items-center gap-3 group select-none"
        >
          <div className="w-8 h-8 bg-[#C28E46] rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <div className="w-4 h-4 border border-white rotate-45" />
          </div>
          <span className="text-2xl font-serif tracking-tight font-bold text-[#2C221E] group-hover:text-[#C28E46] transition-colors">
            Saree<span className="text-[#C28E46] italic font-normal">Elegance</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          id="desktop-mega-navigation"
          className="hidden lg:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-[#2C221E]/70"
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                id={`nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                to={link.path}
                className={`py-1 transition-colors hover:text-[#C28E46] ${
                  isActive ? 'text-[#2C221E] border-b-2 border-[#C28E46]' : ''
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
          {/* Multi-Language Selector */}
          <LanguageSelector variant="compact" className="hidden sm:inline-block" />

          {/* Currency Switcher */}
          <div className="relative hidden sm:block">
            <button
              id="currency-switcher-btn"
              onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
              className="flex items-center gap-1 text-[11px] font-bold text-[#2C221E]/80 hover:text-[#C28E46] transition-colors py-1"
            >
              <Globe className="w-3.5 h-3.5 text-[#C28E46]" />
              <span>{currency}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {currencyDropdownOpen && (
              <div
                id="currency-dropdown-menu"
                className="absolute right-0 mt-1 w-28 bg-[#2C221E] border border-[#C28E46]/40 rounded-lg shadow-xl py-1 z-50 text-[#FAF7F2]"
              >
                {currencies.map((curr) => (
                  <button
                    key={curr}
                    id={`select-currency-${curr}`}
                    onClick={() => {
                      setCurrency(curr);
                      setCurrencyDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#C28E46]/20 transition-colors flex items-center justify-between ${
                      currency === curr ? 'text-[#D4AF37] font-bold' : 'text-stone-300'
                    }`}
                  >
                    <span>{curr}</span>
                    {currency === curr && <span className="text-[10px] text-[#C28E46]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Silk Glossary Button */}
          <button
            id="nav-silk-glossary-btn"
            onClick={() => openGlossaryModal()}
            className="hidden sm:flex items-center gap-1.5 p-1.5 text-xs font-semibold text-[#2C221E]/80 hover:text-[#C28E46] transition-colors bg-[#FAF7F2] border border-[#E6DFC6] px-2.5 py-1 rounded-lg"
            title="Silk Glossary & Weaving Terms"
          >
            <BookOpen className="w-4 h-4 text-[#C28E46]" />
            <span className="hidden xl:inline">Silk Glossary</span>
          </button>

          {/* Search Button */}
          <button
            id="nav-search-btn"
            onClick={() => setIsSearchOpen(true)}
            className="p-1.5 text-[#2C221E]/80 hover:text-[#C28E46] transition-colors"
            title="Search Sarees"
          >
            <Search className="w-5 h-5 opacity-70 hover:opacity-100" />
          </button>

          {/* Wishlist Button */}
          <Link
            to="/account?tab=wishlist"
            id="nav-wishlist-link"
            className="relative p-1.5 text-[#2C221E]/80 hover:text-[#C28E46] transition-colors"
            title="Wishlist"
          >
            <Heart className="w-5 h-5 opacity-70 hover:opacity-100" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C28E46] text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart Bag Button */}
          <button
            id="nav-cart-drawer-btn"
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 p-1.5 text-[#2C221E] hover:text-[#C28E46] transition-colors"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 opacity-80" />
            <span className="hidden sm:inline text-xs font-semibold">
              Cart ({totalCartCount})
            </span>
            {totalCartCount > 0 && (
              <span className="sm:hidden absolute -top-1 -right-1 bg-[#2C221E] text-[#D4AF37] border border-[#C28E46] text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* User Account */}
          <Link
            to="/account"
            id="nav-account-link"
            className="hidden sm:flex items-center gap-1.5 p-1.5 text-[#2C221E]/80 hover:text-[#C28E46] transition-colors"
            title="My Account"
          >
            <User className="w-5 h-5 opacity-80" />
          </Link>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="lg:hidden bg-[#FAF7F2] border-b border-[#E6DFC6] px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200"
        >
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                id={`mobile-nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-serif font-medium text-[#2C221E] hover:text-[#C28E46] py-1 border-b border-[#F3EFE6]"
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/account"
              id="mobile-nav-account-link"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-serif font-medium text-[#2C221E] hover:text-[#C28E46] py-1 flex items-center gap-2"
            >
              <User className="w-4 h-4 text-[#C28E46]" /> My Account & Saved Blouse Fitting
            </Link>
          </div>

          <div className="pt-3 border-t border-[#E6DFC6] space-y-3">
            <LanguageSelector variant="footer" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8C7262] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2E6F40]" /> Silk Mark Authorized Retailer
              </span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsVideoModalOpen(true);
                }}
                className="text-xs font-semibold text-[#2C221E] bg-[#C28E46]/20 px-3 py-1.5 rounded-full border border-[#C28E46]"
              >
                Book Video Call
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
