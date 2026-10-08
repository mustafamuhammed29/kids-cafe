import React from 'react';
import { Blocks, Wind, Coffee, Cake, CheckCircle2, ArrowRight } from 'lucide-react';
import { MedicalDisclaimer } from '../common/MedicalDisclaimer';

interface ServicesSectionProps {
  onOpenBooking: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onOpenBooking }) => {
  return (
    <section id="services" className="py-10 sm:py-16 bg-slate-50/50 scroll-mt-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Raumkonzept im Detail
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Liebevoll gestaltete Erlebnisräume
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1">
            Freies Entdecken ohne Reizüberflutung für die Kleinen – Wohlfühlatmosphäre und Kaffeegenuss für die Großen.
          </p>
        </div>

        {/* 3 Core Spaces - Distinct, High-Quality Cards */}
        <div className="space-y-4 sm:space-y-6 mb-10 sm:mb-14">
          {/* Space 1: Spielbereich */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
                  <Blocks className="w-3.5 h-3.5" />
                  0–8 Jahre
                </span>
                <span className="text-xs text-slate-500 font-medium">100% bildschirmfrei</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                Pädagogischer Holzspielbereich
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Nachhaltiges Holzspielzeug, sichere Klettermodule von namhaften Herstellern und sensorische Motorikstationen. Ein separater Krabbelbereich schützt Babys und Kleinkinder (0–2 Jahre).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Sichere Motorik- &amp; Balanceelemente</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Separater Soft-Krabbelbereich</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Tägliche Desinfektion &amp; Reinigung</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Gedämpfte Akustik für sanfte Geräuschkulisse</span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto shrink-0 flex md:flex-col justify-end">
              <button
                type="button"
                onClick={onOpenBooking}
                className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
              >
                <span>Spielzeit buchen</span>
                <ArrowRight className="w-3.5 h-3.5 text-secondary" />
              </button>
            </div>
          </div>

          {/* Space 2: Salzraum */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border-2 border-sky-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-br from-white to-sky-50/40">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-white bg-primary px-2.5 py-0.5 rounded-md">
                  <Wind className="w-3.5 h-3.5" />
                  Salzraum-Erlebnis
                </span>
                <span className="text-xs text-slate-500 font-medium">45 Min. • Max. 8 Kinder</span>
                <span className="text-xs font-bold text-primary bg-sky-100/70 px-2 py-0.5 rounded-md">+5 € Upgrade</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                Sanfter Salzraum für Kinder &amp; Familien
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Ein feines Trockensalz-Mikroklima in heller, kinderfreundlicher Umgebung. Während Kinder mit speziellem Sandspielzeug im Salz spielen, genießen Eltern eine ruhige Auszeit.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-medium mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Feinstes Trockensalz-Mikroklima</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Begleitpersonen kostenfrei dabei</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Kleine Gruppe: max. 8 Kinder pro Slot</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Helles, einladendes Design</span>
                </div>
              </div>

              <MedicalDisclaimer className="text-[11px]" />
            </div>

            <div className="w-full md:w-auto shrink-0 flex md:flex-col justify-end">
              <button
                type="button"
                onClick={onOpenBooking}
                className="w-full md:w-auto bg-primary hover:bg-primary/95 text-white px-5 py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
              >
                <span>Mit Salzraum buchen</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Space 3: Café & Lounge */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-md">
                  <Coffee className="w-3.5 h-3.5" />
                  Eltern-Lounge
                </span>
                <span className="text-xs text-slate-500 font-medium">Blickkontakt zum Spielbereich</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                Barista Café &amp; Entspannungs-Lounge
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Genieße frisch zubereiteten Specialty Coffee, Hafermilch-Kaffeespezialitäten, feine Bio-Tees und gesunde Snacks. Dank unseres offenen Raumkonzepts hast du dein Kind jederzeit entspannt im Blick.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Barista Kaffeespezialitäten &amp; Bio-Tees</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Zuckerarme Kindersnacks &amp; Bio-Säfte</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Kostenloses Highspeed-WLAN</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Bequeme Sitzplätze mit Lademöglichkeiten</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlight: Kindergeburtstage (Calm, Premium Banner) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-accent shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-accent/20 text-dark text-xs font-bold uppercase tracking-wider">
              <Cake className="w-3.5 h-3.5" />
              <span>Unvergessliche Feiern</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Kindergeburtstag stressfrei feiern
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
              Festlich dekorierter Tisch, Bio-Snacks, Getränke und 2,5 Stunden Spielzeit für bis zu 8 Kinder &amp; 4 Erwachsene. Null Aufräumarbeit für Eltern!
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500 font-semibold pt-1">
              <span>✓ Ab 250 € Paketpreis</span>
              <span>✓ Salzraum optional</span>
              <span>✓ Eigene Torte mitbringbar</span>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenBooking}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
            >
              <span>Geburtstag anfragen</span>
              <ArrowRight className="w-4 h-4 text-secondary" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ServicesSection;
