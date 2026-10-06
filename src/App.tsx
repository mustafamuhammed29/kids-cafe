import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import type { ServiceItem } from './types/booking';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

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

      {/* Public Navbar (Hidden on admin pages) */}
      {!isAdminRoute && (
        <Navbar
          onOpenBooking={() => handleOpenBooking()}
          onOpenLegal={handleOpenLegal}
        />
      )}

      {/* Routes Container */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage onOpenBooking={() => handleOpenBooking()} />} />
          <Route path="/services" element={<ServicesPage onOpenBooking={() => handleOpenBooking()} />} />
          <Route path="/pricing" element={<PricingPage onOpenBooking={(s) => handleOpenBooking(s)} />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Admin Routes */}
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>

      {/* Public Footer (Hidden on admin pages) */}
      {!isAdminRoute && (
        <Footer
          onOpenLegal={handleOpenLegal}
          onOpenBooking={() => handleOpenBooking()}
        />
      )}

      {/* Mobile Bottom Navigation (Only visible on mobile and public routes) */}
      {!isAdminRoute && (
        <MobileBottomNav onOpenBooking={() => handleOpenBooking()} />
      )}

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
      {!isAdminRoute && (
        <CookieBanner onOpenDatenschutz={() => handleOpenLegal('datenschutz')} />
      )}
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
