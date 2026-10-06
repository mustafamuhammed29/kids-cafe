import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Coffee, Heart } from 'lucide-react';

interface HeroProps {
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking }) => {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center hero-gradient text-center px-4 pt-28 pb-20 overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#93B1A6]/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-4xl mx-auto z-10">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-[#FFD3B6] text-[#183D3D] font-bold text-xs sm:text-sm mb-7 shadow-md transform hover:scale-105 transition-transform duration-200">
          <Sparkles className="w-4 h-4 text-[#183D3D]" />
          <span>Spielcafé • Wohltuender Salzraum • Specialty Coffee</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.12] tracking-tight">
          Zeit zum Spielen für sie, <br className="hidden sm:inline" />
          <span className="text-[#FFD3B6] drop-shadow-xs">Zeit zum Durchatmen für dich.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-100 mb-10 font-light max-w-2xl mx-auto leading-relaxed">
          Entdecke das neue Konzept der Familienfreizeit in Berlin. Ein sicherer, pädagogisch wertvoller Holzspielbereich (0–8 Jahre) kombiniert mit Entspannung pur.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button
            type="button"
            onClick={onOpenBooking}
            className="w-full sm:w-auto bg-[#5C8374] hover:bg-[#183D3D] text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-xl shadow-black/25 hover:shadow-2xl hover:-translate-y-1 cursor-pointer flex items-center justify-center gap-2.5 group"
          >
            <span>Jetzt Platz reservieren</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <a
            href="#rules"
            className="w-full sm:w-auto bg-white/95 hover:bg-white text-[#183D3D] px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-xl hover:-translate-y-1 backdrop-blur-xs"
          >
            Unsere Regeln ansehen
          </a>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-left">
          <div className="glass-dark rounded-2xl p-3 border border-white/10 text-white flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#93B1A6] shrink-0" />
            <span className="text-xs font-medium">100% Bildschirmfrei & Sicher</span>
          </div>
          <div className="glass-dark rounded-2xl p-3 border border-white/10 text-white flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-[#FFD3B6] shrink-0" />
            <span className="text-xs font-medium">2 Begleitpersonen gratis</span>
          </div>
          <div className="glass-dark rounded-2xl p-3 border border-white/10 text-white col-span-2 sm:col-span-1 flex items-center gap-2.5">
            <Coffee className="w-5 h-5 text-[#93B1A6] shrink-0" />
            <span className="text-xs font-medium">Bio Specialty Coffee & Snacks</span>
          </div>
        </div>
      </div>

      {/* Decorative Wave Bottom */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none">
        <svg
          className="w-full h-12 sm:h-20 lg:h-24"
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
  );
};
