import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/home/Hero';
import { Rules } from './components/home/Rules';
import { ServicesSection } from './components/home/ServicesSection';
import { PricingSection } from './components/home/PricingSection';
import { HowItWorks } from './components/home/HowItWorks';
import { Gallery } from './components/home/Gallery';
import { Testimonials } from './components/home/Testimonials';
import { FaqSection } from './components/home/FaqSection';
import { ContactSection } from './components/home/ContactSection';
import { Footer } from './components/layout/Footer';
import { BookingWizard } from './components/booking/BookingWizard';
import { LegalModal } from './components/modals/LegalModal';
import { CookieBanner } from './components/common/CookieBanner';
import type { ServiceItem } from './types/booking';

export const App: React.FC = () => {
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
      {/* Navigation */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        onOpenLegal={handleOpenLegal}
      />

      {/* Main Page Flow */}
      <main className="flex-1">
        <Hero onOpenBooking={() => handleOpenBooking()} />
        <Rules />
        <ServicesSection onOpenBooking={() => handleOpenBooking()} />
        <PricingSection onSelectService={(srv) => handleOpenBooking(srv)} />
        <HowItWorks />
        <Gallery />
        <Testimonials />
        <FaqSection />
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenLegal={handleOpenLegal}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* Interactive Booking Wizard Modal */}
      <BookingWizard
        isOpen={bookingWizardOpen}
        onClose={handleCloseBooking}
        preSelectedService={selectedService}
      />

      {/* Legal & Compliance Modal */}
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

export default App;
