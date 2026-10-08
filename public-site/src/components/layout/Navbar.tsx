import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AnnouncementBanner } from '../common/AnnouncementBanner';
import { CalendarCheck, Menu, X, Sparkles, MapPin, Phone } from 'lucide-react';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenLegal: (tab: 'impressum' | 'datenschutz' | 'agb') => void;
  isMenuOpen?: boolean;
  onMenuToggle?: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenBooking, 
  isMenuOpen: externalMenuOpen, 
  onMenuToggle 
}) => {
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isMenuOpen = externalMenuOpen !== undefined ? externalMenuOpen : internalMenuOpen;

  const setMenuState = (open: boolean) => {
    if (onMenuToggle) {
      onMenuToggle(open);
    } else {
      setInternalMenuOpen(open);
    }
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  const closeMenu = () => {
    setMenuState(false);
  };

  const toggleMenu = () => {
    setMenuState(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) closeMenu();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
      isActive 
        ? 'bg-sky-50 text-sky-600 font-bold shadow-2xs' 
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
    }`;
    
  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-lg font-bold py-3.5 px-6 rounded-2xl transition-all w-full max-w-xs text-center ${
      isActive ? 'text-sky-600 bg-sky-50 shadow-2xs font-extrabold' : 'text-slate-800 hover:text-sky-600 hover:bg-slate-100/80'
    }`;

  return (
    <>
      {/* Top Banner & Floating Navigation Header */}
      <header className="fixed top-0 left-0 right-0 w-full z-[70] transition-all duration-300 pointer-events-none">
        <div className="pointer-events-auto">
          <AnnouncementBanner />
        </div>

        {/* Floating Nav Container */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-3 pointer-events-auto">
          <nav 
            className={`w-full rounded-full transition-all duration-300 flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 ${
              isScrolled
                ? 'bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-lg shadow-slate-900/5'
                : 'bg-white/80 backdrop-blur-md border border-white/60 shadow-md shadow-slate-900/5'
            }`}
          >
            {/* Logo */}
            <Link to="/" onClick={closeMenu} className="shrink-0 flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 via-sky-400 to-cyan-300 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform duration-200">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Haven <span className="bg-gradient-to-r from-sky-500 to-rose-500 bg-clip-text text-transparent">Kids</span>
              </span>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1.5 bg-slate-50/80 p-1 rounded-full border border-slate-200/60">
              <NavLink to="/services" className={navLinkClass}>Angebote</NavLink>
              <NavLink to="/pricing" className={navLinkClass}>Preise</NavLink>
              <NavLink to="/gallery" className={navLinkClass}>Galerie</NavLink>
              <NavLink to="/faq" className={navLinkClass}>FAQ</NavLink>
              <NavLink to="/contact" className={navLinkClass}>Kontakt</NavLink>
            </div>

            {/* Desktop CTA Action */}
            <div className="hidden md:flex items-center gap-3">
              <button 
                type="button" 
                onClick={onOpenBooking} 
                className="bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white px-6 py-2.5 rounded-full text-sm font-bold transition shadow-md shadow-sky-500/25 hover:shadow-lg hover:shadow-sky-500/35 transform hover:-translate-y-0.5 active:scale-95 cursor-pointer flex items-center gap-2 group"
              >
                <CalendarCheck className="w-4 h-4 text-sky-100 group-hover:scale-110 transition-transform" />
                <span>Besuch buchen</span>
              </button>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={onOpenBooking}
                className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Buchen</span>
              </button>
              <button 
                onClick={toggleMenu} 
                aria-label="Navigation umschalten"
                className="w-10 h-10 bg-slate-100/90 rounded-full border border-slate-200 flex items-center justify-center text-slate-800 hover:text-sky-600 focus:outline-hidden transition cursor-pointer"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Fullscreen Mobile Menu Overlay - z-[60] */}
      <div 
        className={`fixed inset-0 bg-white/95 backdrop-blur-2xl z-[60] transform ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out md:hidden flex flex-col items-center justify-center space-y-2 pt-20 px-6`}
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-500 to-cyan-300 flex items-center justify-center mb-2 shadow-md shadow-sky-500/20">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <span className="font-extrabold text-2xl text-slate-900 tracking-tight mb-4">
          Haven <span className="bg-gradient-to-r from-sky-500 to-rose-500 bg-clip-text text-transparent">Kids Café</span>
        </span>

        <NavLink to="/" onClick={closeMenu} className={mobileNavLinkClass}>Startseite</NavLink>
        <NavLink to="/services" onClick={closeMenu} className={mobileNavLinkClass}>Unsere Angebote</NavLink>
        <NavLink to="/pricing" onClick={closeMenu} className={mobileNavLinkClass}>Eintritt &amp; Preise</NavLink>
        <NavLink to="/gallery" onClick={closeMenu} className={mobileNavLinkClass}>Galerie</NavLink>
        <NavLink to="/faq" onClick={closeMenu} className={mobileNavLinkClass}>FAQ</NavLink>
        <NavLink to="/contact" onClick={closeMenu} className={mobileNavLinkClass}>Kontakt</NavLink>

        <div className="pt-4 w-full max-w-xs">
          <button 
            type="button" 
            onClick={() => { closeMenu(); onOpenBooking(); }} 
            className="bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white px-7 py-4 rounded-2xl font-bold text-base shadow-lg shadow-sky-500/25 w-full text-center cursor-pointer min-h-[50px] flex items-center justify-center gap-2"
          >
            <CalendarCheck className="w-5 h-5" />
            <span>Besuch reservieren</span>
          </button>
        </div>
        
        {/* Quick Contact info on mobile menu */}
        <div className="pt-6 flex flex-col items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-sky-500" /> Friedrichstraße 123, Berlin
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Phone className="w-3.5 h-3.5 text-emerald-500" /> +49 30 1234 5678
          </span>
        </div>
      </div>
    </>
  );
};
