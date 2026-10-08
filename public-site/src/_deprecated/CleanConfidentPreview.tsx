import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Heart,
  Blocks,
  Wind,
  Coffee,
  Check,
  Baby,
} from 'lucide-react';
import { SERVICES, BUSINESS_INFO } from '../../data/mockData';
import type { ServiceItem } from '../../types/booking';

interface PreviewProps {
  onOpenBooking: (service?: ServiceItem) => void;
  onOpenLegal?: (tab: 'impressum' | 'datenschutz' | 'agb') => void;
}

export const CleanConfidentPreview: React.FC<PreviewProps> = ({ onOpenBooking, onOpenLegal }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'single' | 'birthday'>('all');

  const filteredServices = SERVICES.filter((s) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'single') return s.category === 'single';
    if (selectedCategory === 'birthday') return s.category === 'birthday';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#1E293B] font-sans antialiased selection:bg-[#BAE6FD] selection:text-[#0369A1]">
      {/* =========================================================================
          TOP PREVIEW BAR (Sticky comparison switcher)
          ========================================================================= */}
      <div className="sticky top-0 z-50 bg-[#0F172A] text-white px-4 py-2.5 text-xs flex items-center justify-between shadow-md border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] animate-pulse"></span>
          <span className="font-extrabold uppercase tracking-wider text-[11px] text-slate-200">
            Design Preview: Option 2 — Clean Confident
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-slate-400 text-[11px]">Vergleichen mit:</span>
          <Link
            to="/preview/vivid-modern"
            className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition text-[11px] flex items-center gap-1 border border-white/20"
          >
            <span>Option 1: Vivid Modern</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* =========================================================================
          1. HEADER / NAVIGATION (Airy, Friendly, Rounded)
          ========================================================================= */}
      <header className="sticky top-[37px] z-40 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo with Soft Rounded Badge */}
          <Link to="/preview/clean-confident" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-2xl bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center font-bold text-xl shadow-xs border border-[#BAE6FD] group-hover:scale-105 transition-transform">
              H
            </div>
            <div>
              <span className="font-bold text-2xl tracking-tight text-[#0F172A] block leading-none font-display">
                haven
              </span>
              <span className="text-[11px] font-semibold text-slate-500 tracking-wider">
                family club & café
              </span>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#philosophie" className="hover:text-[#0284C7] transition-colors">Philosophie</a>
            <a href="#bereiche" className="hover:text-[#0284C7] transition-colors">Räume & Salz</a>
            <a href="#preise" className="hover:text-[#0284C7] transition-colors">Tarife</a>
            <a href="#vertrauen" className="hover:text-[#0284C7] transition-colors">Sicherheit</a>
          </nav>

          {/* Calming Action Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenBooking()}
              className="bg-[#0F172A] hover:bg-slate-800 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold text-xs tracking-wide transition shadow-sm hover:shadow-md cursor-pointer min-h-[44px]"
            >
              Termin reservieren
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION (Generous Whitespace, Soft Pastels, High Trust)
          ========================================================================= */}
      <section className="relative pt-10 pb-20 sm:pt-16 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Soft Ambient Pastel Glows */}
        <div className="absolute top-10 right-1/4 w-[500px] h-[500px] rounded-full bg-[#E0F2FE]/50 blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute top-40 left-10 w-[400px] h-[400px] rounded-full bg-[#FEF9C3]/40 blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Airy Typography & Trust Signals */}
          <div className="lg:col-span-7 space-y-7">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#0284C7]"></span>
              <span>Reizarmer Familien-Club in Berlin-Mitte</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0F172A] leading-[1.12] tracking-tight font-display">
              Ein ruhiger Hafen für kleine Entdecker & entspannte Eltern.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl">
              Durchdachtes Holzspielzeug, wohltuender Himalaya-Salzraum und Specialty Coffee in harmonischer Atmosphäre. Ohne Reizüberflutung, ohne Hektik.
            </p>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3.5 sm:items-center">
              <button
                type="button"
                onClick={() => onOpenBooking()}
                className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-8 py-4 rounded-full font-bold text-sm tracking-wide transition shadow-md shadow-sky-600/20 hover:shadow-lg flex items-center justify-center gap-2.5 cursor-pointer min-h-[48px]"
              >
                <span>Zeitfenster auswählen</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <a
                href="#preise"
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-7 py-4 rounded-full font-bold text-sm transition shadow-2xs flex items-center justify-center min-h-[48px]"
              >
                Pakete & Preise ansehen
              </a>
            </div>

            {/* Trust Metric Badges */}
            <div className="pt-8 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-left">
              <div className="p-3">
                <span className="text-sm font-bold text-[#0F172A] block">20 Kinder</span>
                <span className="text-xs text-slate-500 font-medium">Strikte Kapazitätsgrenze</span>
              </div>
              <div className="p-3 border-l border-slate-200/80">
                <span className="text-sm font-bold text-[#0F172A] block">0 – 8 Jahre</span>
                <span className="text-xs text-slate-500 font-medium">Altersgerechte Zonen</span>
              </div>
              <div className="p-3 border-l border-slate-200/80">
                <span className="text-sm font-bold text-[#0F172A] block">Freier Eintritt</span>
                <span className="text-xs text-slate-500 font-medium">Für bis zu 2 Erwachsene</span>
              </div>
            </div>
          </div>

          {/* Right Column: Serene Rounded Photography */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-[2.5rem] overflow-hidden border border-slate-200/80 shadow-xl bg-white p-2">
              <div className="rounded-[2rem] overflow-hidden">
                <img
                  src="/assets/hero-interior.jpg"
                  alt="Harmonischer Spielbereich im Haven Kids Café"
                  className="w-full h-[420px] sm:h-[480px] object-cover hover:scale-102 transition-transform duration-700"
                />
              </div>

              {/* Gentle Floating Badge */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-md flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">Heute geöffnet: 10:00 – 18:00</p>
                  <p className="text-[11px] text-slate-500 font-medium">Friedrichstraße 123, 10117 Berlin</p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenBooking()}
                  className="bg-[#0284C7] text-white px-3.5 py-2 rounded-full text-xs font-bold hover:bg-[#0369A1] transition"
                >
                  Buchen
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. PHILOSOPHIE / THREE PILLARS (Soft Pastel Cards & Generous Whitespace)
          ========================================================================= */}
      <section id="philosophie" className="py-20 sm:py-28 bg-white border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0284C7] bg-[#E0F2FE] px-3.5 py-1.5 rounded-full inline-block">
              Unser Versprechen
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight font-display">
              Gestaltet für das Wohlbefinden der ganzen Familie
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-normal">
              Ein durchdachtes Konzept, das kindliche Neugier und elterliche Ruhe harmonisch verbindet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Sage Pastel */}
            <div className="bg-[#F0FDF4] rounded-3xl p-8 border border-[#BBF7D0] space-y-5 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#15803D] flex items-center justify-center font-bold shadow-2xs border border-[#BBF7D0]">
                <Blocks className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-[#0F172A]">Pädagogisches Holzspiel</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                Pikler-Dreiecke, Kletterbögen und hochwertige Motorik-Elemente aus unbehandeltem Holz. Reizarm, sicher und ganz ohne Plastik.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#15803D]">
                Montessori-inspiriert · Zertifiziert sicher
              </div>
            </div>

            {/* Card 2: Sky Pastel */}
            <div className="bg-[#F0F9FF] rounded-3xl p-8 border border-[#BAE6FD] space-y-5 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#0284C7] flex items-center justify-center font-bold shadow-2xs border border-[#BAE6FD]">
                <Wind className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-[#0F172A]">Himalaya-Salzraum</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                Wohltuendes Mikroklima zur natürlichen Stärkung der Atemwege. Während Kinder mit Holzschaufeln spielen, atmen sie reine Salzluft.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#0284C7]">
                Medizinischer Halogenerator · Max. 8 Kinder
              </div>
            </div>

            {/* Card 3: Butter / Cream Pastel */}
            <div className="bg-[#FEFCE8] rounded-3xl p-8 border border-[#FEF08A] space-y-5 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#A16207] flex items-center justify-center font-bold shadow-2xs border border-[#FEF08A]">
                <Coffee className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-[#0F172A]">Specialty Café & Pause</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                Hervorragender Bio-Kaffee, frische Babyccinos und gesunde Snacks ohne raffinierten Zucker. Entspannte Sitzplätze mit vollem Überblick.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#A16207]">
                Pflanzliche Milchalternativen inklusive
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. PRICING & REAL LIVE PACKAGES (Clean Minimalist Cards)
          ========================================================================= */}
      <section id="preise" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0284C7] bg-[#E0F2FE] px-3.5 py-1.5 rounded-full inline-block mb-3">
                Preise & Pakete
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight font-display">
                Einfache und transparente Buchung
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Bis zu 2 begleitende Erwachsene sind in jedem Ticket kostenfrei enthalten.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-full border border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Alle Pakete
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('single')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                  selectedCategory === 'single'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Einzeltickets
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('birthday')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                  selectedCategory === 'birthday'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Feiern & Events
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredServices.slice(0, 3).map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                      {service.category === 'birthday' ? 'Event' : 'Standard'}
                    </span>
                    {service.slug === '10er-block' && (
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#E0F2FE] text-[#0369A1]">
                        10er Vorteil
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-[#0F172A] mb-1 font-display">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-6">
                    {service.subtitle}
                  </p>

                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <span className="text-4xl font-bold text-[#0F172A]">
                      {service.basePrice ? `${service.basePrice} €` : 'Auf Anfrage'}
                    </span>
                    {service.basePrice && (
                      <span className="text-xs font-medium text-slate-500 block mt-1">
                        {service.slug === '10er-block' ? 'Gültig für 10 Besuche' : 'pro Kind für 2 Stunden'}
                      </span>
                    )}
                  </div>

                  <ul className="space-y-3.5 text-xs font-medium text-slate-600 mb-8">
                    {service.features.slice(0, 4).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenBooking(service)}
                  className="w-full bg-[#0F172A] hover:bg-slate-800 text-white py-3.5 rounded-full font-bold text-xs tracking-wide transition cursor-pointer min-h-[44px]"
                >
                  {service.ctaText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. TRUST & SAFETY SECTION (Trustworthy Minimal Grid)
          ========================================================================= */}
      <section id="vertrauen" className="py-20 bg-slate-50 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Sicherheit & Komfort
            </span>
            <h2 className="text-3xl font-bold text-[#0F172A] tracking-tight font-display">
              Warum Eltern gerne wiederkommen
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5">
              <ShieldCheck className="w-6 h-6 text-[#0284C7]" />
              <h4 className="font-bold text-base text-[#0F172A]">Strenges Hygienekonzept</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tägliche Desinfektion aller Oberflächen und gründliche Reinigung zwischen allen Slots.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5">
              <Wind className="w-6 h-6 text-[#059669]" />
              <h4 className="font-bold text-base text-[#0F172A]">HEPA-14 Luftreinigung</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kontinuierlicher Luftaustausch und hochwirksame Filter für ein viren- und allergenarmes Umfeld.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5">
              <Baby className="w-6 h-6 text-[#D97706]" />
              <h4 className="font-bold text-base text-[#0F172A]">Baby- & Kleinkindbereich</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Separater Krabbelbereich für die Kleinsten, geschützt vor dem Spiel der größeren Kinder.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5">
              <Heart className="w-6 h-6 text-[#E11D48]" />
              <h4 className="font-bold text-base text-[#0F172A]">Ruhige Akustik</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Akustikdecken und schallschluckende Wandpaneele dämpfen den Geräuschpegel spürbar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. CALMING CALL TO ACTION SECTION
          ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#E0F2FE] border-b border-[#BAE6FD]">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0369A1]">
            Jetzt Wunschtermin sichern
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight font-display">
            Planen Sie Ihren nächsten entspannten Nachmittag.
          </h2>
          <p className="text-sm sm:text-base text-slate-700 max-w-lg mx-auto font-normal">
            Reservieren Sie online in weniger als zwei Minuten. Keine Vorabzahlung nötig — Sie zahlen bequem vor Ort.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3.5 justify-center items-center">
            <button
              type="button"
              onClick={() => onOpenBooking()}
              className="bg-[#0F172A] hover:bg-slate-800 text-white px-8 py-4 rounded-full font-bold text-sm tracking-wide transition shadow-md cursor-pointer min-h-[48px]"
            >
              Jetzt Slot reservieren
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Kostenfreie Stornierung bis 24 Stunden vor dem gebuchten Termin.
          </p>
        </div>
      </section>

      {/* =========================================================================
          7. FOOTER (Public Only, Zero Admin Links)
          ========================================================================= */}
      <footer className="bg-white text-slate-500 py-16 px-4 sm:px-6 lg:px-8 text-xs border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <span className="text-2xl font-bold text-[#0F172A] font-display block">haven</span>
            <p className="text-slate-600 font-normal leading-relaxed">
              Family Club & Café · Ein entspannter Ort für Kinder und Eltern in Berlin-Mitte.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-[#0F172A] uppercase text-xs mb-3">Öffnungszeiten</h4>
            <p className="leading-relaxed">Montag – Donnerstag: 10:00 – 18:00</p>
            <p className="leading-relaxed">Freitag – Samstag: 09:00 – 19:00</p>
            <p className="text-slate-800 font-semibold mt-1">Sonntag: Geschlossen</p>
          </div>

          <div>
            <h4 className="font-bold text-[#0F172A] uppercase text-xs mb-3">Standort</h4>
            <p className="leading-relaxed">{BUSINESS_INFO.address}</p>
            <p className="leading-relaxed mt-1">U6 Oranienburger Tor / S-Bahn Friedrichstraße</p>
          </div>

          <div>
            <h4 className="font-bold text-[#0F172A] uppercase text-xs mb-3">Rechtliches</h4>
            <div className="space-x-3">
              <button
                type="button"
                onClick={() => onOpenLegal?.('impressum')}
                className="hover:text-slate-900 underline cursor-pointer"
              >
                Impressum
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => onOpenLegal?.('datenschutz')}
                className="hover:text-slate-900 underline cursor-pointer"
              >
                Datenschutz
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => onOpenLegal?.('agb')}
                className="hover:text-slate-900 underline cursor-pointer"
              >
                AGB
              </button>
            </div>
            <p className="mt-4 text-slate-400 text-[11px]">
              © 2026 Haven Kids Café. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
