import React, { useState, useEffect } from 'react';
import { Menu, X, Sparkles, Phone, MessageCircle } from 'lucide-react';
import { BUSINESS_INFO } from '../../data/mockData';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenLegal: (tab: 'impressum' | 'datenschutz' | 'agb') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-nav border-b border-emerald-950/5 shadow-md py-3'
          : 'bg-white/95 backdrop-blur-md border-b border-gray-100 py-4.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-2.5 group focus:outline-hidden focus:ring-2 focus:ring-[#5C8374] rounded-xl px-1"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#93B1A6]/20 flex items-center justify-center text-[#183D3D] group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-[#5C8374]" />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-[#183D3D]">
                Haven <span className="text-[#5C8374]">Kids</span>
              </span>
              <span className="hidden sm:block text-[11px] font-medium tracking-wide text-gray-500 uppercase">
                Café & Salzraum
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-7">
            <a
              href="#rules"
              className="text-sm font-semibold text-gray-700 hover:text-[#5C8374] transition-colors py-1"
            >
              Konzept & Regeln
            </a>
            <a
              href="#services"
              className="text-sm font-semibold text-gray-700 hover:text-[#5C8374] transition-colors py-1"
            >
              Angebote
            </a>
            <a
              href="#pricing"
              className="text-sm font-semibold text-gray-700 hover:text-[#5C8374] transition-colors py-1"
            >
              Preise & Pakete
            </a>
            <a
              href="#faq"
              className="text-sm font-semibold text-gray-700 hover:text-[#5C8374] transition-colors py-1"
            >
              FAQ
            </a>
            <a
              href="#contact"
              className="text-sm font-semibold text-gray-700 hover:text-[#5C8374] transition-colors py-1"
            >
              Kontakt
            </a>

            {/* Primary Booking CTA */}
            <button
              type="button"
              onClick={onOpenBooking}
              className="bg-[#5C8374] hover:bg-[#183D3D] text-white px-5.5 py-2.5 rounded-full font-bold text-sm transition-all duration-200 shadow-md shadow-[#5C8374]/25 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
            >
              <span>Besuch buchen</span>
              <span className="w-2 h-2 rounded-full bg-[#FFD3B6] animate-pulse"></span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={onOpenBooking}
              className="bg-[#5C8374] text-white px-3.5 py-1.5 rounded-full font-bold text-xs shadow-xs"
            >
              Buchen
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Navigation umschalten"
              aria-expanded={mobileMenuOpen}
              className="p-2 rounded-xl text-gray-700 hover:text-[#5C8374] hover:bg-gray-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#5C8374]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-nav border-b border-gray-200 px-4 pt-3 pb-6 animate-fadeIn">
          <div className="flex flex-col space-y-3.5 pt-2">
            <a
              href="#rules"
              onClick={closeMobile}
              className="text-base font-semibold text-gray-800 hover:text-[#5C8374] py-1 border-b border-gray-100"
            >
              Konzept & Regeln
            </a>
            <a
              href="#services"
              onClick={closeMobile}
              className="text-base font-semibold text-gray-800 hover:text-[#5C8374] py-1 border-b border-gray-100"
            >
              Angebote & Ausstattung
            </a>
            <a
              href="#pricing"
              onClick={closeMobile}
              className="text-base font-semibold text-gray-800 hover:text-[#5C8374] py-1 border-b border-gray-100"
            >
              Preise & 10er-Block
            </a>
            <a
              href="#faq"
              onClick={closeMobile}
              className="text-base font-semibold text-gray-800 hover:text-[#5C8374] py-1 border-b border-gray-100"
            >
              Häufige Fragen (FAQ)
            </a>
            <a
              href="#contact"
              onClick={closeMobile}
              className="text-base font-semibold text-gray-800 hover:text-[#5C8374] py-1 border-b border-gray-100"
            >
              Kontakt & Anfahrt
            </a>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  closeMobile();
                  onOpenBooking();
                }}
                className="w-full text-center bg-[#5C8374] hover:bg-[#183D3D] text-white py-3 rounded-2xl font-bold text-base shadow-md transition"
              >
                Jetzt Platz reservieren
              </button>

              <div className="flex gap-2 pt-1">
                <a
                  href={`tel:${BUSINESS_INFO.phoneClean}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-100 text-gray-800 text-xs font-semibold"
                >
                  <Phone className="w-3.5 h-3.5 text-[#5C8374]" />
                  Anrufen
                </a>
                <a
                  href={BUSINESS_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
