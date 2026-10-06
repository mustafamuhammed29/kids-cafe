import React, { useState } from 'react';
import { Check, Sparkles, Wind, HelpCircle, ArrowRight } from 'lucide-react';
import { SERVICES } from '../../data/mockData';
import type { ServiceItem } from '../../types/booking';

interface PricingSectionProps {
  onSelectService: (service: ServiceItem) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectService }) => {
  const [showComparison, setShowComparison] = useState(false);

  return (
    <section id="pricing" className="py-24 salt-texture scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5C8374] bg-white py-1 px-3.5 rounded-full inline-block mb-3 border border-[#93B1A6]/30 shadow-2xs">
            Transparente Familienpreise
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#183D3D] mb-4">
            Eintritt & Pakete
          </h2>
          <div className="w-20 h-1 bg-[#5C8374] mx-auto rounded-full mb-6"></div>
          <p className="text-gray-700 text-base sm:text-lg">
            Faire, transparente Preise ohne versteckte Kosten.{' '}
            <strong className="text-[#183D3D] underline decoration-[#FFD3B6] decoration-4">
              Der Eintritt für 2 erwachsene Begleitpersonen pro Kind ist immer kostenfrei!
            </strong>
          </p>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch mb-14">
          {SERVICES.map((srv) => {
            const isBestseller = srv.popular;

            return (
              <div
                key={srv.id}
                className={`rounded-3xl p-8 transition-all duration-300 flex flex-col relative ${
                  isBestseller
                    ? 'bg-[#183D3D] text-white shadow-2xl border-2 border-[#93B1A6] lg:-translate-y-3 z-10'
                    : 'bg-white text-gray-800 shadow-md border border-gray-100 hover:-translate-y-1.5'
                }`}
              >
                {/* Bestseller Ribbon */}
                {srv.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-[#FFD3B6] text-[#183D3D] font-extrabold text-xs uppercase px-4 py-1 rounded-full shadow-md tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {srv.badge}
                    </span>
                  </div>
                )}

                <h3
                  className={`text-xl font-bold text-center mb-1 ${
                    isBestseller ? 'text-white' : 'text-[#183D3D]'
                  }`}
                >
                  {srv.name}
                </h3>
                <p
                  className={`text-xs text-center mb-6 ${
                    isBestseller ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  {srv.tagline}
                </p>

                {/* Price Display */}
                <div className="flex items-baseline justify-center mb-6">
                  <span
                    className={`text-5xl font-extrabold tracking-tight ${
                      isBestseller ? 'text-[#FFD3B6]' : 'text-[#183D3D]'
                    }`}
                  >
                    {srv.basePrice} €
                  </span>
                  <span
                    className={`text-sm ml-2 font-medium ${
                      isBestseller ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    {srv.category === 'single' && !srv.badge ? '/ 2 Std.' : ''}
                    {srv.badge === 'Bestseller' ? '/ 10 Besuche' : ''}
                    {srv.category === 'birthday' ? 'Basispreis' : ''}
                  </span>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8 text-xs sm:text-sm">
                  {srv.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          isBestseller ? 'text-[#FFD3B6]' : 'text-[#5C8374]'
                        }`}
                      />
                      <span className={isBestseller ? 'text-gray-200' : 'text-gray-600'}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Action CTA */}
                <div className="mt-auto pt-4">
                  <button
                    type="button"
                    onClick={() => onSelectService(srv)}
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                      isBestseller
                        ? 'bg-[#5C8374] hover:bg-[#93B1A6] text-white hover:shadow-lg'
                        : 'bg-gray-100 hover:bg-[#5C8374] hover:text-white text-[#183D3D]'
                    }`}
                  >
                    <span>{isBestseller ? 'Pass jetzt sichern' : 'Jetzt auswählen'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add-on Callout: Salzraum */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-sky-200 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-600 shrink-0">
              <Wind className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-base sm:text-lg text-[#183D3D]">
                  Optional zubuchbar: Salzraum-Erlebnis (45 Min)
                </h4>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                  + 5 € pro Kind
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Kombiniere jeden Spielbereich-Besuch mit einer regenerierenden Sitzung in unserem mikroklimatischen Trockensalzraum. (Begleitpersonen frei, max. 8 Kinder je Runde).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectService(SERVICES[0])}
            className="shrink-0 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer whitespace-nowrap"
          >
            Kombi buchen
          </button>
        </div>

        {/* Toggle Detailed Comparison Table */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#5C8374] hover:text-[#183D3D] transition cursor-pointer underline underline-offset-4"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{showComparison ? 'Vergleichstabelle ausblenden' : 'Ausführliche Leistungstabelle ansehen'}</span>
          </button>

          {showComparison && (
            <div className="mt-8 bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-gray-100 max-w-4xl mx-auto overflow-x-auto text-left animate-fadeIn">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 font-bold text-gray-500">Leistung</th>
                    <th className="py-3 px-4 font-bold text-[#183D3D] text-center">Einzelbesuch</th>
                    <th className="py-3 px-4 font-bold text-[#5C8374] text-center">10er-Block Pass</th>
                    <th className="py-3 px-4 font-bold text-[#183D3D] text-center">Kindergeburtstag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-800">Aufenthaltsdauer</td>
                    <td className="py-3 px-4 text-center text-gray-600">2 Stunden</td>
                    <td className="py-3 px-4 text-center text-gray-600">10 x 2 Stunden</td>
                    <td className="py-3 px-4 text-center text-gray-600">2,5 Stunden</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-800">Erwachsene Begleitpersonen</td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-semibold">2 inklusive</td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-semibold">2 inklusive je Besuch</td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-semibold">4 inklusive</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-800">Übertragbar auf Geschwister</td>
                    <td className="py-3 px-4 text-center text-gray-400">—</td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-semibold">Ja, unbegrenzt</td>
                    <td className="py-3 px-4 text-center text-gray-400">—</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-800">Salzraum-Gutschein</td>
                    <td className="py-3 px-4 text-center text-gray-500">5 € zubuchbar</td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-semibold">1x gratis enthalten</td>
                    <td className="py-3 px-4 text-center text-gray-500">Optional für Gruppe</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-800">Deko, Snacks & Kids-Meal</td>
                    <td className="py-3 px-4 text-center text-gray-400">—</td>
                    <td className="py-3 px-4 text-center text-gray-400">—</td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-semibold">Komplett inklusive</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-800">Bezahlung</td>
                    <td className="py-3 px-4 text-center text-gray-600">Vor Ort beim Check-in</td>
                    <td className="py-3 px-4 text-center text-gray-600">Vor Ort beim ersten Besuch</td>
                    <td className="py-3 px-4 text-center text-gray-600">Vor Ort am Veranstaltungstag</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
