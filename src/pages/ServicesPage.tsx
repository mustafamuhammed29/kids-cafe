import React from 'react';
import { ServicesSection } from '../components/home/ServicesSection';
import { Rules } from '../components/home/Rules';
import { ArrowRight, Sparkles } from 'lucide-react';

interface ServicesPageProps {
  onOpenBooking: () => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onOpenBooking }) => {
  return (
    <div className="pt-20 sm:pt-24 animate-fadeIn pb-16">
      {/* Page Header */}
      <div className="bg-[#183D3D] text-white py-12 sm:py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FFD3B6] bg-white/10 py-1 px-3.5 rounded-full inline-block mb-3">
            Unser Raum- & Erlebnisangebot
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Angebote & Ausstattung
          </h1>
          <p className="text-sm sm:text-base text-gray-200 max-w-xl mx-auto font-light leading-relaxed">
            Entdecke unsere liebevoll gestalteten Bereiche: Holzspielparadies, wohltuender Salzraum, Eltern-Café und exklusive Geburtstagsfeiern.
          </p>
        </div>
      </div>

      {/* Services Detail Cards */}
      <ServicesSection onOpenBooking={onOpenBooking} />

      {/* House Rules */}
      <Rules />

      {/* Bottom CTA */}
      <div className="max-w-4xl mx-auto px-4 mt-8 text-center">
        <div className="bg-[#5C8374] rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h3 className="font-extrabold text-2xl mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FFD3B6]" />
              Bereit für eure Familienzeit?
            </h3>
            <p className="text-xs sm:text-sm text-gray-100">
              Sichere dir deinen Wunschtermin im Voraus, um Wartezeiten zu vermeiden.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenBooking}
            className="w-full sm:w-auto bg-[#FFD3B6] hover:bg-[#F8BE9A] text-[#183D3D] px-8 py-3.5 rounded-full font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <span>Jetzt buchen</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
