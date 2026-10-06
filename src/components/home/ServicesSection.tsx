import React from 'react';
import { Blocks, Wind, Coffee, Cake, CheckCircle2, ArrowRight } from 'lucide-react';
import { MedicalDisclaimer } from '../common/MedicalDisclaimer';

interface ServicesSectionProps {
  onOpenBooking: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onOpenBooking }) => {
  return (
    <section id="services" className="py-24 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5C8374] bg-[#93B1A6]/15 py-1 px-3 rounded-full inline-block mb-3">
            Unser Raumkonzept
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#183D3D] mb-4">
            Was Haven Kids besonders macht
          </h2>
          <div className="w-20 h-1 bg-[#5C8374] mx-auto rounded-full mb-6"></div>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            Ein durchdachtes Wohlfühl-Konzept: Kindliche Entfaltung ohne Reizüberflutung kombiniert mit einer echten Auszeit für Eltern.
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 mb-16">
          {/* Service 1: Spielbereich */}
          <div className="bg-[#FAFAFA] rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
            <div className="w-16 h-16 bg-[#FFD3B6]/40 rounded-2xl flex items-center justify-center mb-6 text-orange-600 group-hover:scale-110 transition-transform">
              <Blocks className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-[#183D3D] mb-3">
              Interaktiver Spielbereich
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              100% bildschirmfreie Zone mit langlebigem Holzspielzeug, sicheren Klettermodulen und sensorischen Entdeckerstationen zur Förderung von Feinmotorik und Kreativität.
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700 mt-auto pt-4 border-t border-gray-200/60">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#5C8374] shrink-0" />
                <span>Pädagogisch ausgewähltes Holzspielzeug</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#5C8374] shrink-0" />
                <span>Geschützter Krabbelbereich für 0–2 Jahre</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#5C8374] shrink-0" />
                <span>Regelmäßige Desinfektion & Reinigung</span>
              </li>
            </ul>
          </div>

          {/* Service 2: Salzraum */}
          <div className="bg-[#E5F3FD]/40 rounded-3xl p-8 border border-sky-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative overflow-hidden">
            <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mb-6 text-sky-600 group-hover:scale-110 transition-transform">
              <Wind className="w-8 h-8" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-bold text-[#183D3D]">
                Wohltuender Salzraum
              </h3>
            </div>
            <span className="inline-block text-[11px] font-bold text-sky-800 bg-sky-100 px-3 py-1 rounded-full w-fit mb-3">
              Sanfte Halotherapie
            </span>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Ein feines, trockenes Salzaerosol-Mikroklima in heller, kinderfreundlicher Umgebung. Kinder spielen spielerisch im Salz, während die ganze Familie tief durchatmet.
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700 mt-auto pt-4 border-t border-sky-200/60 mb-5">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Trockensalz-Mikroklima (keine feuchte Vernebelung)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Maximal 8 Kinder pro Sitzung (45 Minuten)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Hell, einladend und mit hellem Spielzeug</span>
              </li>
            </ul>

            {/* Medical disclaimer note */}
            <MedicalDisclaimer className="mt-2 text-[11px]" />
          </div>

          {/* Service 3: Café */}
          <div className="bg-[#FAFAFA] rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
            <div className="w-16 h-16 bg-[#93B1A6]/25 rounded-2xl flex items-center justify-center mb-6 text-[#5C8374] group-hover:scale-110 transition-transform">
              <Coffee className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-[#183D3D] mb-3">
              Eltern-Café & Lounge
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Genieße Specialty Coffee, feine Bio-Tees und gesunde Snacks. Dank unseres offenen Raumkonzepts hast du dein spielendes Kind von jedem Tisch aus entspannt im Blick.
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700 mt-auto pt-4 border-t border-gray-200/60">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#5C8374] shrink-0" />
                <span>Barista Specialty Coffee & Hafermilch-Optionen</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#5C8374] shrink-0" />
                <span>Gesunde, zuckerarme Snacks & Kinder-Menüs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#5C8374] shrink-0" />
                <span>Kostenloses Highspeed-WLAN & Ladestationen</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Feature Highlight: Kindergeburtstage */}
        <div className="bg-gradient-to-r from-[#183D3D] to-[#255050] rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD3B6]/20 text-[#FFD3B6] text-xs font-bold">
              <Cake className="w-4 h-4" />
              <span>Unvergessliche Familienfeste</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Kindergeburtstag bei Haven Kids feiern
            </h3>
            <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
              Feiere den großen Tag deines Kindes völlig stressfrei! Wir kümmern uns um den festlich dekorierten Geburtstagstisch, gesunde Bio-Snacks, Getränke und 2,5 Stunden puren Spielspaß für bis zu 8 Kinder und 4 Erwachsene.
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-gray-300">
              <span>✓ Ab 250 € Paketpreis</span>
              <span>✓ Keine Aufräumarbeit für Eltern</span>
              <span>✓ Salzraum zubuchbar</span>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenBooking}
              className="w-full sm:w-auto bg-[#FFD3B6] hover:bg-[#F8BE9A] text-[#183D3D] px-8 py-4 rounded-full font-extrabold text-base transition-all shadow-lg hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Geburtstag anfragen</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
