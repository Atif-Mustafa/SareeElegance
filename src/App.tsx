import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { SearchModal } from './components/modals/SearchModal';
import { VideoShoppingModal } from './components/modals/VideoShoppingModal';
import { SilkGlossaryModal } from './components/modals/SilkGlossaryModal';
import { ToastContainer } from './components/ui/ToastContainer';
import { ChatbotModal } from './components/chatbot/ChatbotModal';

import { HomePage } from './pages/HomePage';
import { PLP } from './pages/PLP';
import { PDP } from './pages/PDP';
import { CheckoutPage } from './pages/CheckoutPage';
import { AccountPage } from './pages/AccountPage';
import { HeritagePage } from './pages/HeritagePage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { CancellationReturnsPage } from './pages/CancellationReturnsPage';
import { ShippingPolicyPage } from './pages/ShippingPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { FAQPage } from './pages/FAQPage';
import { ContactPage } from './pages/ContactPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2C221E] font-sans antialiased">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/collections/:category" element={<PLP />} />
            <Route path="/product/:slug" element={<PDP />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/heritage" element={<HeritagePage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/cancellation-and-returns" element={<CancellationReturnsPage />} />
            <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
            <Route path="/terms-and-conditions" element={<TermsPage />} />
            <Route path="/faqs" element={<FAQPage />} />
            <Route path="/contact-us" element={<ContactPage />} />
          </Routes>
        </main>

        <Footer />

        {/* Global Modals & Drawers */}
        <CartDrawer />
        <SearchModal />
        <VideoShoppingModal />
        <SilkGlossaryModal />
        <ToastContainer />
        <ChatbotModal />
      </div>
    </BrowserRouter>
  );
}
