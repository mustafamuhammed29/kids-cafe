import React from 'react';
import { Footprints, Eye, Baby, HeartPulse } from 'lucide-react';

export const Rules: React.FC = () => {
  return (
    <section id="rules" className="py-20 bg-[#FAFAFA] scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 lg:p-14 shadow-sm border border-gray-100">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5C8374] bg-[#93B1A6]/15 py-1 px-3 rounded-full inline-block mb-3">
              Für ein harmonisches Miteinander
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#183D3D] mb-4">
              Wichtige Informationen für deinen Besuch
            </h2>
            <div className="w-20 h-1 bg-[#FFD3B6] mx-auto rounded-full mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">
              Damit sich alle kleinen und großen Gäste rundum wohl und sicher fühlen, bitten wir um Beachtung unserer vier Grundregeln.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Rule 1: Sockenpflicht */}
            <div className="bg-gray-50/70 rounded-2xl p-6 border border-gray-100 flex flex-col items-center text-center hover:bg-white hover:shadow-md transition-all duration-300">
              <div className="w-14 h-14 bg-[#93B1A6]/20 rounded-2xl flex items-center justify-center mb-4 text-[#5C8374]">
                <Footprints className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg text-[#183D3D] mb-2">Sockenpflicht</h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Aus hygienischen Gründen gilt im gesamten Spiel- und Salzbereich strikte Sockenpflicht (idealerweise Anti-Rutsch-Socken) für Kinder <strong>und</strong> Erwachsene.
              </p>
            </div>

            {/* Rule 2: Aufsichtspflicht */}
            <div className="bg-gray-50/70 rounded-2xl p-6 border border-gray-100 flex flex-col items-center text-center hover:bg-white hover:shadow-md transition-all duration-300">
              <div className="w-14 h-14 bg-[#93B1A6]/20 rounded-2xl flex items-center justify-center mb-4 text-[#5C8374]">
                <Eye className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg text-[#183D3D] mb-2">Aufsichtspflicht</h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Wir sind kein Betreuungsdienst. Die gesetzliche Aufsichtspflicht verbleibt während des gesamten Aufenthalts lückenlos bei den Eltern oder Begleitpersonen.
              </p>
            </div>

            {/* Rule 3: Altersgruppe */}
            <div className="bg-gray-50/70 rounded-2xl p-6 border border-gray-100 flex flex-col items-center text-center hover:bg-white hover:shadow-md transition-all duration-300">
              <div className="w-14 h-14 bg-[#93B1A6]/20 rounded-2xl flex items-center justify-center mb-4 text-[#5C8374]">
                <Baby className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg text-[#183D3D] mb-2">0 bis 8 Jahre</h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Unser gesamtes Areal ist speziell auf die sensiblen Entwicklungsbedürfnisse von Babys, Kleinkindern und Kindern bis maximal 8 Jahre abgestimmt.
              </p>
            </div>

            {/* Rule 4: Hygiene & Gesundheit */}
            <div className="bg-gray-50/70 rounded-2xl p-6 border border-gray-100 flex flex-col items-center text-center hover:bg-white hover:shadow-md transition-all duration-300">
              <div className="w-14 h-14 bg-rose-100/70 rounded-2xl flex items-center justify-center mb-4 text-rose-600">
                <HeartPulse className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg text-[#183D3D] mb-2">Gesundheits-Kodex</h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Aus Schutz für alle Kinder bitten wir darum, bei ansteckenden Krankheiten (Fieber, Magen-Darm, starker Husten) zu Hause zu bleiben. Termine können kostenfrei verlegt werden.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
