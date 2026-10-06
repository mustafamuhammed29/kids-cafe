import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Blocks, Wind } from 'lucide-react';
import { BUSINESS_INFO } from '../data/mockData';

interface HomePageProps {
  onOpenBooking: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenBooking }) => {
  return (
    <div className="animate-fadeIn">
      {/* Optimized Mobile-First Hero (Max 80vh on mobile) */}
      <section className="relative min-h-[75vh] sm:min-h-[82vh] flex items-center justify-center hero-gradient text-center px-4 pt-24 sm:pt-28 pb-16 overflow-hidden hero-section">
        {/* Decorative ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#93B1A6]/20 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-3xl mx-auto z-10">
          {/* Top Feature Pill */}
          <div className="inline-flex items-center gap-1.5 py-1 px-3 sm:px-4 rounded-full bg-[#FFD3B6] text-[#183D3D] font-bold text-[11px] sm:text-xs mb-5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#183D3D]" />
            <span>Spielcafé • Wohltuender Salzraum • Specialty Coffee</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 sm:mb-6 leading-tight tracking-tight">
            Zeit zum Spielen für sie, <br className="hidden sm:inline" />
            <span className="text-[#FFD3B6]">Zeit zum Durchatmen für dich.</span>
          </h1>

          {/* Quick Intro (3 lines max) */}
          <p className="text-sm sm:text-lg text-gray-100 mb-8 sm:mb-10 font-light max-w-xl mx-auto leading-relaxed">
            Willkommen im {BUSINESS_INFO.name}. Ein sicherer, pädagogisch wertvoller Holzspielbereich (0–8 Jahre) kombiniert mit Entspannung pur im Salzraum & Bio-Barista-Kaffee.
          </p>

          {/* Exactly 3 Core CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-md mx-auto sm:max-w-none">
            {/* CTA 1: Book */}
            <button
              type="button"
              onClick={onOpenBooking}
              className="w-full sm:w-auto bg-[#5C8374] hover:bg-[#183D3D] text-white px-7 py-3.5 rounded-full font-bold text-sm sm:text-base transition-all duration-200 shadow-lg shadow-black/20 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span>Besuch reservieren</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* CTA 2: Services */}
            <Link
              to="/services"
              className="w-full sm:w-auto bg-white hover:bg-gray-50 text-[#183D3D] px-6 py-3.5 rounded-full font-bold text-sm sm:text-base transition-all duration-200 shadow-md hover:-translate-y-0.5 flex items-center justify-center min-h-[44px]"
            >
              Unsere Angebote
            </Link>

            {/* CTA 3: Pricing */}
            <Link
              to="/pricing"
              className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white border border-white/40 px-6 py-3.5 rounded-full font-bold text-sm sm:text-base transition-all duration-200 backdrop-blur-xs flex items-center justify-center min-h-[44px]"
            >
              Preise & Pakete
            </Link>
          </div>
        </div>

        {/* Decorative Wave Bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none">
          <svg
            className="w-full h-8 sm:h-14 lg:h-16"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,152.47,143.22,225.36,108.15,257.65,92.51,289.47,75.46,321.39,56.44Z"
              fill="#FAFAFA"
            ></path>
          </svg>
        </div>
      </section>

      {/* Trust & Key Highlights Preview Cards */}
      <section className="py-12 sm:py-16 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/services"
              className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm hover:shadow-md transition flex items-start gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FFD3B6]/30 flex items-center justify-center text-orange-600 shrink-0 group-hover:scale-105 transition-transform">
                <Blocks className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#183D3D] mb-1">
                  100% Holzspielzeug
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Sicherer, reizarmer Motorik-Spielbereich für Babys & Kinder (0–8 Jahre). Bildschirmfrei.
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#5C8374] mt-2.5">
                  Details ansehen →
                </span>
              </div>
            </Link>

            <Link
              to="/services"
              className="bg-white rounded-3xl p-6 sm:p-7 border border-sky-100 shadow-sm hover:shadow-md transition flex items-start gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 shrink-0 group-hover:scale-105 transition-transform">
                <Wind className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#183D3D] mb-1">
                  Wohltuender Salzraum
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Natürliches Trockensalzaerosol-Mikroklima für sanfte Entspannung (max. 8 Kinder je Runde).
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 mt-2.5">
                  Salzraum entdecken →
                </span>
              </div>
            </Link>

            <Link
              to="/pricing"
              className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-sm hover:shadow-md transition flex items-start gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#93B1A6]/20 flex items-center justify-center text-[#5C8374] shrink-0 group-hover:scale-105 transition-transform">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#183D3D] mb-1">
                  2 Begleitpersonen gratis
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Kein Aufpreis für Eltern oder Großeltern. Einzelbesuch 14 € / 2 Std., 10er-Block 120 €.
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#5C8374] mt-2.5">
                  Preise ansehen →
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Info Strip */}
          <div className="mt-8 bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#5C8374] shrink-0" />
              <span>
                <strong>Hygiene & Sicherheit:</strong> Sockenpflicht für alle Gäste • Aufsichtspflicht verbleibt bei Begleitpersonen.
              </span>
            </div>
            <Link
              to="/services"
              className="font-bold text-[#5C8374] hover:underline whitespace-nowrap"
            >
              Alle Hausregeln lesen →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
