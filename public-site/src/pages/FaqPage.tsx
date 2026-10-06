import React from 'react';
import { FaqSection } from '../components/home/FaqSection';

export const FaqPage: React.FC = () => {
  return (
    <div className="pt-20 sm:pt-24 animate-fadeIn pb-16">
      {/* Header */}
      <div className="bg-[#183D3D] text-white py-12 sm:py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FFD3B6] bg-white/10 py-1 px-3.5 rounded-full inline-block mb-3">
            Häufige Fragen & Antworten
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Fragen & Antworten (FAQ)
          </h1>
          <p className="text-sm sm:text-base text-gray-200 max-w-xl mx-auto font-light leading-relaxed">
            Alles Wichtige zu deinem Besuch im Haven Kids Café: Sockenpflicht, Buchung, Altersgrenzen und unser Salzraum-Konzept.
          </p>
        </div>
      </div>

      <FaqSection />
    </div>
  );
};

export default FaqPage;
