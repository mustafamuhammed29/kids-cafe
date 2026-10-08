import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BookingWizard } from './components/booking/BookingWizard';
import { LegalModal } from './components/modals/LegalModal';
import { CookieBanner } from './components/common/CookieBanner';
import { ScrollToTop } from './components/common/ScrollToTop';

import { Navbar } from './components/layout/Navbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Footer } from './components/layout/Footer';

import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { PricingPage } from './pages/PricingPage';
import { GalleryPage } from './pages/GalleryPage';
import { FaqPage } from './pages/FaqPage';
import { ContactPage } from './pages/ContactPage';
import { CancellationPage } from './pages/CancellationPage';
import { ImpressumPage } from './pages/ImpressumPage';
import { DatenschutzPage } from './pages/DatenschutzPage';
import { AgbPage } from './pages/AgbPage';
import type { ServiceItem } from './types/booking';

const AppContent: React.FC = () => {
  const [bookingWizardOpen, setBookingWizardOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'impressum' | 'datenschutz' | 'agb'>('impressum');

  const handleOpenBooking = (service?: ServiceItem) => {
    if (service) {
      setSelectedService(service);
    }
    setBookingWizardOpen(true);
  };

  const handleCloseBooking = () => {
    setBookingWizardOpen(false);
    setSelectedService(null);
  };

  const handleOpenLegal = (tab: 'impressum' | 'datenschutz' | 'agb') => {
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-gray-800 antialiased selection:bg-primary selection:text-white">
      <ScrollToTop />

      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        onOpenLegal={handleOpenLegal}
        isMenuOpen={isMobileMenuOpen}
        onMenuToggle={setIsMobileMenuOpen}
      />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage onOpenBooking={() => handleOpenBooking()} />} />
          <Route path="/services" element={<ServicesPage onOpenBooking={() => handleOpenBooking()} />} />
          <Route path="/pricing" element={<PricingPage onOpenBooking={(s) => handleOpenBooking(s)} />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Cancellation Routes */}
          <Route path="/cancel" element={<CancellationPage />} />
          <Route path="/stornierung" element={<CancellationPage />} />

          {/* Direct Legal Routes */}
          <Route path="/impressum" element={<ImpressumPage />} />
          <Route path="/datenschutz" element={<DatenschutzPage />} />
          <Route path="/agb" element={<AgbPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* Mobile Bottom Navigation Bar: Hidden while booking wizard modal OR mobile hamburger menu OR legal modal is open */}
      {!bookingWizardOpen && !isMobileMenuOpen && !legalModalOpen && (
        <MobileBottomNav onOpenBooking={() => handleOpenBooking()} />
      )}

      {/* Global Modals & Overlays */}
      <BookingWizard
        isOpen={bookingWizardOpen}
        onClose={handleCloseBooking}
        preSelectedService={selectedService || undefined}
      />

      {legalModalOpen && (
        <LegalModal
          isOpen={legalModalOpen}
          onClose={() => setLegalModalOpen(false)}
          initialTab={legalModalTab}
        />
      )}

      <CookieBanner />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
