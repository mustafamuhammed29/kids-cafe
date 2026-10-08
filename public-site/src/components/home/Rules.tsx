import React from 'react';
import { Footprints, Eye, Baby, HeartPulse } from 'lucide-react';

export const Rules: React.FC = () => {
  return (
    <section id="rules" className="py-10 sm:py-16 bg-white border-y border-slate-100 scroll-mt-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Für ein harmonisches Miteinander
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Wichtige Hausregeln für alle Gäste
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-1">
            Damit sich alle kleinen und großen Gäste rundum sicher, geborgen und wohl fühlen.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Rule 1: Sockenpflicht */}
          <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-5 border border-slate-200/70 flex flex-col items-start text-left hover:border-slate-300 transition-all">
            <div className="w-10 h-10 bg-sky-100/80 rounded-xl flex items-center justify-center mb-3 text-primary shrink-0">
              <Footprints className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Sockenpflicht</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Im gesamten Spiel- und Salzbereich gilt Sockenpflicht (idealerweise Stoppersocken) für Kinder <strong>und</strong> Erwachsene.
            </p>
          </div>

          {/* Rule 2: Aufsichtspflicht */}
          <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-5 border border-slate-200/70 flex flex-col items-start text-left hover:border-slate-300 transition-all">
            <div className="w-10 h-10 bg-pink-100/80 rounded-xl flex items-center justify-center mb-3 text-accent shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Aufsichtspflicht</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Wir sind kein Betreuungsdienst. Die Aufsichtspflicht verbleibt während des Aufenthalts bei den Begleitpersonen.
            </p>
          </div>

          {/* Rule 3: Altersgruppe */}
          <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-5 border border-slate-200/70 flex flex-col items-start text-left hover:border-slate-300 transition-all">
            <div className="w-10 h-10 bg-sky-100/80 rounded-xl flex items-center justify-center mb-3 text-sky-600 shrink-0">
              <Baby className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">0 bis 8 Jahre</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Unser Areal ist als sicherer Hafen speziell auf die Bedürfnisse von Babys, Kleinkindern und Kids bis 8 Jahre abgestimmt.
            </p>
          </div>

          {/* Rule 4: Hygiene & Gesundheit */}
          <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-5 border border-slate-200/70 flex flex-col items-start text-left hover:border-slate-300 transition-all">
            <div className="w-10 h-10 bg-amber-100/80 rounded-xl flex items-center justify-center mb-3 text-amber-600 shrink-0">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Gesundheits-Kodex</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Bitte bleibt bei Infekten zu Hause. Reservierungen können bis 2 Stunden vor Beginn kostenfrei online storniert werden.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Rules;
