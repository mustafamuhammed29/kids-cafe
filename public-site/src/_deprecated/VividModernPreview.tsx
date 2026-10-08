import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Blocks,
  Wind,
  Coffee,
  Check,
} from 'lucide-react';
import { SERVICES, BUSINESS_INFO } from '../../data/mockData';
import type { ServiceItem } from '../../types/booking';

interface PreviewProps {
  onOpenBooking: (service?: ServiceItem) => void;
  onOpenLegal?: (tab: 'impressum' | 'datenschutz' | 'agb') => void;
}

export const VividModernPreview: React.FC<PreviewProps> = ({ onOpenBooking, onOpenLegal }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'single' | 'birthday'>('all');

  const filteredServices = SERVICES.filter((s) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'single') return s.category === 'single';
    if (selectedCategory === 'birthday') return s.category === 'birthday';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased selection:bg-[#FF5733] selection:text-white">
      {/* =========================================================================
          TOP PREVIEW BAR (Sticky comparison switcher)
          ========================================================================= */}
      <div className="sticky top-0 z-50 bg-[#0F172A] text-white px-4 py-2.5 text-xs flex items-center justify-between shadow-md border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5733] animate-pulse"></span>
          <span className="font-extrabold uppercase tracking-wider text-[11px] text-slate-200">
            Design Preview: Option 1 — Vivid Modern
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-slate-400 text-[11px]">Vergleichen mit:</span>
          <Link
            to="/preview/clean-confident"
            className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition text-[11px] flex items-center gap-1 border border-white/20"
          >
            <span>Option 2: Clean Confident</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* =========================================================================
          1. HEADER / NAVIGATION (Bold, Crisp, Confident)
          ========================================================================= */}
      <header className="sticky top-[37px] z-40 bg-white/95 backdrop-blur-md border-b-2 border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo with Bold Geometric Mark */}
          <Link to="/preview/vivid-modern" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-[#FF5733] text-white flex items-center justify-center font-black text-xl shadow-md shadow-[#FF5733]/30 group-hover:scale-105 transition-transform">
              H
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-[#0F172A] block leading-none font-display">
                HAVEN
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5733]">
                Family Play Club & Café
              </span>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-700">
            <a href="#vorteile" className="hover:text-[#FF5733] transition-colors">Konzept</a>
            <a href="#erlebnis" className="hover:text-[#FF5733] transition-colors">Spielraum & Salz</a>
            <a href="#pakete" className="hover:text-[#FF5733] transition-colors">Pakete & Preise</a>
            <a href="#info" className="hover:text-[#FF5733] transition-colors">Besucher-Infos</a>
          </nav>

          {/* High-Contrast Action Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenBooking()}
              className="bg-[#1E3A8A] hover:bg-[#172554] text-white px-6 py-3 rounded-2xl font-extrabold text-xs tracking-wider uppercase transition shadow-md shadow-blue-900/20 hover:-translate-y-0.5 cursor-pointer min-h-[44px]"
            >
              Slot reservieren
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION (Bold, Saturated, Playful Geometric Shapes)
          ========================================================================= */}
      <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Geometric Accent Blocks */}
        <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-[#FF5733]/10 blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute top-1/2 left-0 w-80 h-80 rounded-full bg-[#1E3A8A]/10 blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Bold Typography & Impact */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FF5733]/10 border border-[#FF5733]/20 text-[#EA580C] text-xs font-black uppercase tracking-wider shadow-2xs">
              <Sparkles className="w-4 h-4 text-[#FF5733]" />
              <span>Berlin-Mitte · Reizarmes Spiel & Echte Erholung</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-6xl font-black text-[#0F172A] leading-[1.08] tracking-tight font-display">
              Große Abenteuer für kleine Hände –{' '}
              <span className="text-[#FF5733] inline-block">echte Energie</span> für Eltern.
            </h1>

            <p className="text-base sm:text-xl text-slate-600 font-medium leading-relaxed max-w-xl">
              Haven ist der moderne Play Club für Familien: 100% nachhaltiges Holzspielzeug, wohltuender Himalaya-Salzraum und Specialty Coffee in einer inspirierenden Umgebung.
            </p>

            {/* High-Impact Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3.5 sm:items-center">
              <button
                type="button"
                onClick={() => onOpenBooking()}
                className="bg-[#FF5733] hover:bg-[#EA580C] text-white px-8 py-4 rounded-2xl font-black text-sm tracking-wide transition shadow-lg shadow-[#FF5733]/30 hover:-translate-y-0.5 flex items-center justify-center gap-3 cursor-pointer min-h-[48px]"
              >
                <span>Jetzt Zeitfenster buchen</span>
                <ArrowRight className="w-5 h-5 text-white" />
              </button>

              <a
                href="#pakete"
                className="bg-white hover:bg-slate-50 text-[#0F172A] border-2 border-slate-200 px-7 py-4 rounded-2xl font-black text-sm tracking-wide transition shadow-xs flex items-center justify-center min-h-[48px]"
              >
                Preise & Angebote
              </a>
            </div>

            {/* Bold Feature Ribbons */}
            <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-3 gap-4 text-left">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
                <span className="text-xs font-black text-[#FF5733] block">0 – 8 JAHRE</span>
                <span className="text-xs font-bold text-slate-700">Geschützte Zonen</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
                <span className="text-xs font-black text-[#1E3A8A] block">MAX. 20</span>
                <span className="text-xs font-bold text-slate-700">Kinder pro Slot</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
                <span className="text-xs font-black text-emerald-600 block">2 ERWACHSENE</span>
                <span className="text-xs font-bold text-slate-700">Immer kostenfrei</span>
              </div>
            </div>
          </div>

          {/* Right Column: Confident Geometric Photo Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-slate-100">
              <img
                src="/assets/hero-interior.jpg"
                alt="Familienbereich im Haven Kids Café"
                className="w-full h-[440px] sm:h-[500px] object-cover hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>

              {/* Geometric Badges */}
              <div className="absolute top-4 left-4 bg-[#1E3A8A] text-white px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md">
                100% Echtholz
              </div>

              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-[#0F172A]">Heute geöffnet bis 18:00</p>
                  <p className="text-[11px] font-bold text-slate-500">Friedrichstraße 123, Berlin</p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenBooking()}
                  className="bg-[#FF5733] text-white px-3.5 py-2 rounded-xl text-xs font-black hover:bg-[#EA580C] transition"
                >
                  Buchen →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. VALUE PROPOSITION (Custom Geometric Panels)
          ========================================================================= */}
      <section id="vorteile" className="py-16 sm:py-24 bg-white border-y-2 border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <span className="text-xs font-black uppercase tracking-widest text-[#FF5733] block mb-2">
              Unser Konzept
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight font-display">
              Drei Säulen für entspannte Familientage
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Panel 1 */}
            <div className="bg-[#FFF7ED] rounded-3xl p-7 border-2 border-[#FED7AA] space-y-4 hover:shadow-lg transition">
              <div className="w-14 h-14 rounded-2xl bg-[#FF5733] text-white flex items-center justify-center font-black shadow-md shadow-[#FF5733]/30">
                <Blocks className="w-7 h-7" />
              </div>
              <h3 className="font-black text-xl text-[#0F172A]">Pädagogisches Holzspiel</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Konsequent plastik- und bildschirmfrei. Naturbelassene Kletter- und Motorik-Elemente fördern Fantasie und Balance ohne nervige Elektronik-Töne.
              </p>
              <div className="pt-2 text-xs font-bold text-[#EA580C]">
                Pikler- & Montessori-inspiriert ✓
              </div>
            </div>

            {/* Panel 2 */}
            <div className="bg-[#EFF6FF] rounded-3xl p-7 border-2 border-[#BFDBFE] space-y-4 hover:shadow-lg transition">
              <div className="w-14 h-14 rounded-2xl bg-[#1E3A8A] text-white flex items-center justify-center font-black shadow-md shadow-blue-900/30">
                <Wind className="w-7 h-7" />
              </div>
              <h3 className="font-black text-xl text-[#0F172A]">Himalaya-Salzraum</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Das mikroklimatische Salzaerosol befreit die Atemwege von Großstadt-Kids. Kinder schaufeln auf feinstem Salz, während sie gesund durchatmen.
              </p>
              <div className="pt-2 text-xs font-bold text-[#1E3A8A]">
                Max. 8 Kinder je Runde ✓
              </div>
            </div>

            {/* Panel 3 */}
            <div className="bg-[#ECFDF5] rounded-3xl p-7 border-2 border-[#A7F3D0] space-y-4 hover:shadow-lg transition">
              <div className="w-14 h-14 rounded-2xl bg-[#059669] text-white flex items-center justify-center font-black shadow-md shadow-emerald-700/30">
                <Coffee className="w-7 h-7" />
              </div>
              <h3 className="font-black text-xl text-[#0F172A]">Specialty Coffee & Bar</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Bio-Kaffeespezialitäten von lokalen Röstern, hausgemachte Waffeln und frische Snacks ohne Industrie-Zucker. Perfekte Sicht auf den Spielbereich.
              </p>
              <div className="pt-2 text-xs font-bold text-[#059669]">
                Hafermilch immer inklusive ✓
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. PRICING & REAL LIVE PACKAGES
          ========================================================================= */}
      <section id="pakete" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#FF5733] block mb-2">
                Faire Tarife
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight font-display">
                Transparent. Keine versteckten Gebühren.
              </h2>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#0F172A] text-white'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                Alle Pakete
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('single')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  selectedCategory === 'single'
                    ? 'bg-[#0F172A] text-white'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                Eintritt
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('birthday')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  selectedCategory === 'birthday'
                    ? 'bg-[#0F172A] text-white'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                Events
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {filteredServices.slice(0, 3).map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-3xl p-7 sm:p-8 border-2 border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-black px-3 py-1 rounded-xl bg-slate-100 text-slate-800">
                      {service.category === 'birthday' ? 'Event-Paket' : 'Standard'}
                    </span>
                    {service.slug === '10er-block' && (
                      <span className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-[#FF5733] text-white">
                        Spare 20 €
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-black text-[#0F172A] mb-1 font-display">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mb-6">
                    {service.subtitle}
                  </p>

                  <div className="mb-6 pb-6 border-b-2 border-slate-100">
                    <span className="text-4xl font-black text-[#0F172A]">
                      {service.basePrice ? `${service.basePrice} €` : 'Auf Anfrage'}
                    </span>
                    {service.basePrice && (
                      <span className="text-xs font-bold text-slate-500 block mt-1">
                        {service.slug === '10er-block' ? '10 Besuche à 2 Stunden' : 'für 2 Stunden Spielzeit'}
                      </span>
                    )}
                  </div>

                  <ul className="space-y-3 text-xs font-bold text-slate-700 mb-8">
                    {service.features.slice(0, 4).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenBooking(service)}
                  className="w-full bg-[#1E3A8A] hover:bg-[#172554] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition shadow-md cursor-pointer min-h-[44px]"
                >
                  {service.ctaText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. BIG CALL TO ACTION SECTION
          ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#1E3A8A] text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="text-xs font-black uppercase tracking-widest text-[#FBBF24]">
            Jetzt Wunschtermin sichern
          </span>
          <h2 className="text-3xl sm:text-5xl font-black leading-tight font-display">
            Bereit für ein unvergessliches <br />
            Spielerlebnis in Berlin?
          </h2>
          <p className="text-base text-blue-100 max-w-lg mx-auto font-medium">
            Da wir maximal 20 Kinder pro Slot einlassen, sind beliebte Zeiten am Wochenende schnell ausgebucht.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              type="button"
              onClick={() => onOpenBooking()}
              className="bg-[#FF5733] hover:bg-[#EA580C] text-white px-8 py-4 rounded-2xl font-black text-sm tracking-wide transition shadow-xl cursor-pointer min-h-[48px]"
            >
              Slot jetzt unverbindlich reservieren
            </button>
          </div>
          <p className="text-xs text-blue-200">
            Zahlung erst vor Ort beim Check-in · Kostenlose Stornierung bis 24h vorher
          </p>
        </div>
      </section>

      {/* =========================================================================
          6. FOOTER (Public Only, Zero Admin links)
          ========================================================================= */}
      <footer id="info" className="bg-[#0F172A] text-slate-400 py-16 px-4 sm:px-6 lg:px-8 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <span className="text-2xl font-black text-white font-display block">HAVEN</span>
            <p className="text-slate-400 font-medium leading-relaxed">
              Premium Play Club & Family Café in Berlin-Mitte.
            </p>
          </div>

          <div>
            <h4 className="font-black text-white uppercase text-xs mb-3">Öffnungszeiten</h4>
            <p className="leading-relaxed">Montag – Donnerstag: 10:00 – 18:00</p>
            <p className="leading-relaxed">Freitag – Samstag: 09:00 – 19:00</p>
            <p className="text-[#FF5733] font-bold mt-1">Sonntag: Ruhetag</p>
          </div>

          <div>
            <h4 className="font-black text-white uppercase text-xs mb-3">Standort</h4>
            <p className="leading-relaxed">{BUSINESS_INFO.address}</p>
            <p className="leading-relaxed mt-1">U6 Oranienburger Tor</p>
          </div>

          <div>
            <h4 className="font-black text-white uppercase text-xs mb-3">Rechtliches</h4>
            <div className="space-x-3">
              <button
                type="button"
                onClick={() => onOpenLegal?.('impressum')}
                className="hover:text-white underline cursor-pointer"
              >
                Impressum
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => onOpenLegal?.('datenschutz')}
                className="hover:text-white underline cursor-pointer"
              >
                Datenschutz
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => onOpenLegal?.('agb')}
                className="hover:text-white underline cursor-pointer"
              >
                AGB
              </button>
            </div>
            <p className="mt-4 text-slate-500 text-[11px]">
              © 2026 Haven Kids Café. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
