import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { BookingWizard } from './components/booking/BookingWizard';
import { LegalModal } from './components/modals/LegalModal';
import { CookieBanner } from './components/common/CookieBanner';
import { ScrollToTop } from './components/common/ScrollToTop';

import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { PricingPage } from './pages/PricingPage';
import { GalleryPage } from './pages/GalleryPage';
import { FaqPage } from './pages/FaqPage';
import { ContactPage } from './pages/ContactPage';
import type { ServiceItem } from './types/booking';

const AppContent: React.FC = () => {
  const [bookingWizardOpen, setBookingWizardOpen] = useState(false);
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
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#1E293B]">
      <ScrollToTop />

      {/* Public Navbar */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        onOpenLegal={handleOpenLegal}
      />

      {/* Customer Routes Only */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage onOpenBooking={() => handleOpenBooking()} />} />
          <Route path="/services" element={<ServicesPage onOpenBooking={() => handleOpenBooking()} />} />
          <Route path="/pricing" element={<PricingPage onOpenBooking={(s) => handleOpenBooking(s)} />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>

      {/* Public Footer */}
      <Footer
        onOpenLegal={handleOpenLegal}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* Mobile Bottom Navigation (Only on mobile viewport) */}
      <MobileBottomNav onOpenBooking={() => handleOpenBooking()} />

      {/* Global Booking Wizard Modal */}
      <BookingWizard
        isOpen={bookingWizardOpen}
        onClose={handleCloseBooking}
        preSelectedService={selectedService}
      />

      {/* Global Legal Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalModalTab}
      />

      {/* Cookie Consent Banner */}
      <CookieBanner onOpenDatenschutz={() => handleOpenLegal('datenschutz')} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
