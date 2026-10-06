import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, Phone, MessageCircle } from 'lucide-react';
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
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'glass-nav border-b border-emerald-950/5 shadow-md py-2.5 sm:py-3'
          : 'bg-white/95 backdrop-blur-md border-b border-gray-100 py-3 sm:py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link
            to="/"
            onClick={closeMobile}
            className="flex items-center gap-2.5 group focus:outline-hidden focus:ring-2 focus:ring-[#5C8374] rounded-xl px-1"
          >
            <img
              src="/assets/logo.svg"
              alt="Haven Kids Café Logo"
              className="h-9 sm:h-11 w-auto group-hover:scale-105 transition-transform duration-200"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav aria-label="Hauptnavigation" className="hidden md:flex items-center gap-6 lg:gap-7">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-sm font-semibold transition-colors py-1 ${
                  isActive ? 'text-[#183D3D] font-bold border-b-2 border-[#5C8374]' : 'text-gray-700 hover:text-[#5C8374]'
                }`
              }
            >
              Startseite
            </NavLink>
            <NavLink
              to="/services"
              className={({ isActive }) =>
                `text-sm font-semibold transition-colors py-1 ${
                  isActive ? 'text-[#183D3D] font-bold border-b-2 border-[#5C8374]' : 'text-gray-700 hover:text-[#5C8374]'
                }`
              }
            >
              Angebote
            </NavLink>
            <NavLink
              to="/pricing"
              className={({ isActive }) =>
                `text-sm font-semibold transition-colors py-1 ${
                  isActive ? 'text-[#183D3D] font-bold border-b-2 border-[#5C8374]' : 'text-gray-700 hover:text-[#5C8374]'
                }`
              }
            >
              Preise & Pakete
            </NavLink>
            <NavLink
              to="/gallery"
              className={({ isActive }) =>
                `text-sm font-semibold transition-colors py-1 ${
                  isActive ? 'text-[#183D3D] font-bold border-b-2 border-[#5C8374]' : 'text-gray-700 hover:text-[#5C8374]'
                }`
              }
            >
              Galerie
            </NavLink>
            <NavLink
              to="/faq"
              className={({ isActive }) =>
                `text-sm font-semibold transition-colors py-1 ${
                  isActive ? 'text-[#183D3D] font-bold border-b-2 border-[#5C8374]' : 'text-gray-700 hover:text-[#5C8374]'
                }`
              }
            >
              FAQ
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `text-sm font-semibold transition-colors py-1 ${
                  isActive ? 'text-[#183D3D] font-bold border-b-2 border-[#5C8374]' : 'text-gray-700 hover:text-[#5C8374]'
                }`
              }
            >
              Kontakt
            </NavLink>

            {/* Primary Booking CTA */}
            <button
              type="button"
              onClick={onOpenBooking}
              className="bg-[#5C8374] hover:bg-[#183D3D] text-white px-5.5 py-2.5 rounded-full font-bold text-sm transition-all duration-200 shadow-md shadow-[#5C8374]/25 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
            >
              <span>Besuch buchen</span>
              <span className="w-2 h-2 rounded-full bg-[#FFD3B6] animate-pulse"></span>
            </button>
          </nav>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={onOpenBooking}
              className="bg-[#5C8374] text-white px-3.5 py-1.5 rounded-full font-bold text-xs shadow-xs min-h-[36px]"
            >
              Buchen
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Navigation umschalten"
              aria-expanded={mobileMenuOpen}
              className="p-2 rounded-xl text-gray-700 hover:text-[#5C8374] hover:bg-gray-100 transition-colors focus:outline-hidden min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-nav border-b border-gray-200 px-4 pt-3 pb-6 animate-fadeIn">
          <nav aria-label="Mobile Menü" className="flex flex-col space-y-3 pt-1">
            <NavLink
              to="/"
              end
              onClick={closeMobile}
              className={({ isActive }) =>
                `text-base font-semibold py-1.5 border-b border-gray-100 ${
                  isActive ? 'text-[#183D3D] font-bold' : 'text-gray-700'
                }`
              }
            >
              Startseite
            </NavLink>
            <NavLink
              to="/services"
              onClick={closeMobile}
              className={({ isActive }) =>
                `text-base font-semibold py-1.5 border-b border-gray-100 ${
                  isActive ? 'text-[#183D3D] font-bold' : 'text-gray-700'
                }`
              }
            >
              Angebote & Ausstattung
            </NavLink>
            <NavLink
              to="/pricing"
              onClick={closeMobile}
              className={({ isActive }) =>
                `text-base font-semibold py-1.5 border-b border-gray-100 ${
                  isActive ? 'text-[#183D3D] font-bold' : 'text-gray-700'
                }`
              }
            >
              Preise & Pakete
            </NavLink>
            <NavLink
              to="/gallery"
              onClick={closeMobile}
              className={({ isActive }) =>
                `text-base font-semibold py-1.5 border-b border-gray-100 ${
                  isActive ? 'text-[#183D3D] font-bold' : 'text-gray-700'
                }`
              }
            >
              Fotogalerie
            </NavLink>
            <NavLink
              to="/faq"
              onClick={closeMobile}
              className={({ isActive }) =>
                `text-base font-semibold py-1.5 border-b border-gray-100 ${
                  isActive ? 'text-[#183D3D] font-bold' : 'text-gray-700'
                }`
              }
            >
              Häufige Fragen (FAQ)
            </NavLink>
            <NavLink
              to="/contact"
              onClick={closeMobile}
              className={({ isActive }) =>
                `text-base font-semibold py-1.5 border-b border-gray-100 ${
                  isActive ? 'text-[#183D3D] font-bold' : 'text-gray-700'
                }`
              }
            >
              Kontakt & Anfahrt
            </NavLink>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  closeMobile();
                  onOpenBooking();
                }}
                className="w-full text-center bg-[#5C8374] hover:bg-[#183D3D] text-white py-3 rounded-2xl font-bold text-base shadow-md transition min-h-[44px]"
              >
                Jetzt Platz reservieren
              </button>

              <div className="flex gap-2 pt-1">
                <a
                  href={`tel:${BUSINESS_INFO.phoneClean}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-100 text-gray-800 text-xs font-semibold min-h-[44px]"
                >
                  <Phone className="w-4 h-4 text-[#5C8374]" />
                  Anrufen
                </a>
                <a
                  href={BUSINESS_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold min-h-[44px]"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  WhatsApp
                </a>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
