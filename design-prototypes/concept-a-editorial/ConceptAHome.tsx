import React, { useState } from 'react';
import { ArrowRight, Sparkles, Wind, Coffee, Heart, Check, Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';

export const ConceptAHome: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'play' | 'wellness'>('all');

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1D2623] font-sans antialiased selection:bg-[#E8927C]/30 selection:text-[#1D2623]">
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-sm border-b border-[#EBE5DA] transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-2xl font-semibold tracking-tight text-[#243E36]">
              Haven
            </span>
            <span className="text-[11px] uppercase tracking-widest text-[#7C8B84] font-medium border-l border-[#DCD5C9] pl-3 py-0.5">
              Kids Café & Salt Sanctuary
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#46544E]">
            <a href="#philosophie" className="hover:text-[#243E36] transition-colors">Philosophie</a>
            <a href="#erlebnisse" className="hover:text-[#243E36] transition-colors">Erlebnisse</a>
            <a href="#salzraum" className="hover:text-[#243E36] transition-colors">Salzraum</a>
            <a href="#preise" className="hover:text-[#243E36] transition-colors">Preise</a>
            <a href="#kontakt" className="hover:text-[#243E36] transition-colors">Besuch planen</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="bg-[#243E36] hover:bg-[#1D332C] text-[#FAF7F2] px-6 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-sm hover:shadow hover:-translate-y-0.5 cursor-pointer min-h-[44px]"
            >
              Zeitfenster buchen
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero — Editorial Full-Bleed Imagery with Asymmetric Layout */}
      <section className="relative pt-8 pb-20 md:pt-14 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Headline & Stance */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAEFEA] text-[#243E36] text-[11px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#567568]"></span>
              <span>Friedrichstraße 123, Berlin</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1D2623] leading-[1.12] font-normal tracking-tight">
              Ein Refugium für <br />
              <span className="italic font-normal text-[#243E36]">achtsames Spielen</span> <br />
              und echten Kaffeegenuss.
            </h1>

            <p className="text-base sm:text-lg text-[#5A6963] font-normal leading-relaxed max-w-xl">
              Haven verbindet skandinavisches Holzspielzeug, sanfte Halotherapie im Salzraum und Specialty Coffee in einer Umgebung, die Eltern wie Kindern Ruhe schenkt.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                type="button"
                className="bg-[#243E36] hover:bg-[#1D332C] text-[#FAF7F2] px-8 py-4 rounded-full text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 cursor-pointer min-h-[44px]"
              >
                <span>Slot online reservieren</span>
                <ArrowRight className="w-4 h-4 text-[#FAF7F2]" />
              </button>

              <a
                href="#erlebnisse"
                className="px-6 py-4 rounded-full text-sm font-medium text-[#243E36] hover:bg-[#F0EBE0] transition-colors text-center border border-[#E0D8CB] min-h-[44px] flex items-center justify-center"
              >
                Raumkonzept entdecken
              </a>
            </div>

            {/* Micro stats strip */}
            <div className="pt-8 border-t border-[#EAE3D6] grid grid-cols-3 gap-6 text-left">
              <div>
                <p className="font-serif text-2xl text-[#243E36]">0–8 J.</p>
                <p className="text-xs text-[#71807A]">Altersgrenze für geschütztes Spiel</p>
              </div>
              <div>
                <p className="font-serif text-2xl text-[#243E36]">20 Max.</p>
                <p className="text-xs text-[#71807A]">Kinder je Slot für reizarme Ruhe</p>
              </div>
              <div>
                <p className="font-serif text-2xl text-[#243E36]">2 Erw.</p>
                <p className="text-xs text-[#71807A]">Begleitpersonen stets kostenfrei</p>
              </div>
            </div>
          </div>

          {/* Right Column: Sample Image Treatment with Warm Tactile Border */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-[28px] overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="/assets/hero-interior.jpg"
                alt="Lichtdurchfluteter Holzspielbereich im Haven Kids Café Berlin"
                className="w-full h-[460px] sm:h-[540px] object-cover hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
              
              <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#243E36]">Geschützter Raum</p>
                  <p className="text-[11px] text-[#606D67]">100% Buchenholz · Reizarme Akustik</p>
                </div>
                <span className="text-xs font-semibold text-[#567568] px-2.5 py-1 rounded-full bg-[#EAEFEA]">
                  Täglich ab 10:00
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Value Proposition — Editorial Spread */}
      <section id="philosophie" className="py-20 md:py-28 bg-[#F5EFE6] border-y border-[#E8DFD1]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7C8B84] block mb-3">
              Unsere Grundhaltung
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1D2623] font-normal tracking-tight">
              Entspannung ist kein Luxus, <br />
              sondern die Basis für Geduld.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#E0D8CB] flex items-center justify-center text-[#243E36]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl text-[#243E36]">100% Unbehandeltes Holz</h3>
              <p className="text-sm text-[#5A6963] leading-relaxed">
                Bewusst frei von Plastik, Elektronik und Lärm. Motorik-Elemente fördern Fantasie und Koordination nach Pikler- und Montessori-Prinzipien.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#E0D8CB] flex items-center justify-center text-[#3A6872]">
                <Wind className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl text-[#243E36]">Mikroklima im Salzraum</h3>
              <p className="text-sm text-[#5A6963] leading-relaxed">
                Trockensalz-Inhalation auf feinem Salzgranulat. Bis zu 8 Kinder können spielerisch durchatmen – wohltuend für Atemwege und Immunsystem.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#E0D8CB] flex items-center justify-center text-[#8C5D4B]">
                <Coffee className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl text-[#243E36]">Boutique Café Bar</h3>
              <p className="text-sm text-[#5A6963] leading-relaxed">
                Bio-Kaffeespezialitäten von Berliner Röstern, Bio-Gebäck und nahrhafte Kindersnacks ohne raffinierten Zuckerzusatz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Services Teaser — Editorial Chapters */}
      <section id="erlebnisse" className="py-20 md:py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#7C8B84] block mb-2">
                Erlebnisräume
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1D2623] font-normal">
                Drei kuratierte Zonen für jeden Tag
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition ${selectedCategory === 'all' ? 'bg-[#243E36] text-white' : 'bg-[#EAE5DA] text-[#46544E]'}`}
              >
                Alle Räume
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('play')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition ${selectedCategory === 'play' ? 'bg-[#243E36] text-white' : 'bg-[#EAE5DA] text-[#46544E]'}`}
              >
                Spielbereich
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('wellness')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition ${selectedCategory === 'wellness' ? 'bg-[#243E36] text-white' : 'bg-[#EAE5DA] text-[#46544E]'}`}
              >
                Salzraum
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-3xl overflow-hidden border border-[#EFEAE1] hover:shadow-lg transition-all group">
              <div className="h-64 overflow-hidden relative">
                <img
                  src="/assets/salt-sanctuary.jpg"
                  alt="Mutter und Kind im Salzraum des Haven Kids Café"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-white/95 text-[#243E36] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Halotherapie
                </span>
              </div>
              <div className="p-8 space-y-4">
                <h3 className="font-serif text-2xl text-[#243E36]">Der Salzraum (Salt Sanctuary)</h3>
                <p className="text-sm text-[#5A6963] leading-relaxed">
                  Mit warmem Bernsteinlicht beleuchtete Himalaya-Salzwände und 20 cm feines Speisesalz am Boden. Kinder schaufeln und bauen wie am Strand, während sie heilsame Aerosole inhalieren.
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-[#F2ECE1] text-xs font-semibold">
                  <span className="text-[#3A6872]">45 Minuten Session · Max. 8 Kinder</span>
                  <span className="text-[#243E36] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Mehr erfahren →
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl overflow-hidden border border-[#EFEAE1] hover:shadow-lg transition-all group">
              <div className="h-64 overflow-hidden relative">
                <img
                  src="/assets/artisan-cafe.jpg"
                  alt="Bio Cappuccino und Holzspielzeug auf Eichentisch"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-white/95 text-[#243E36] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Boutique Gastronomie
                </span>
              </div>
              <div className="p-8 space-y-4">
                <h3 className="font-serif text-2xl text-[#243E36]">Café Lounge & Parent Workspace</h3>
                <p className="text-sm text-[#5A6963] leading-relaxed">
                  Blickgeschützt und dennoch nah am Geschehen. Genieße deine Auszeit mit erstklassigem Flat White, High-Speed-WLAN und bequemen Polstermöbeln aus Naturleinen.
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-[#F2ECE1] text-xs font-semibold">
                  <span className="text-[#7C8B84]">Hafermilch ohne Aufpreis · Bio-Qualität</span>
                  <span className="text-[#243E36] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Speisekarte ansehen →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pricing Teaser — Refined Single Highlight */}
      <section id="preise" className="py-20 bg-[#F5EFE6] border-y border-[#E8DFD1]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#7C8B84] block mb-3">
            Transparente Preisgestaltung
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1D2623] mb-12">
            Einfache Tarife ohne versteckte Aufpreise
          </h2>

          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E2D8C9] shadow-sm text-left grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-[#EAEFEA] text-[#243E36] text-xs font-bold">
                Meistgebuchter Tarif
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#243E36]">Der Einzelbesuch</h3>
              <p className="text-sm text-[#5A6963] leading-relaxed">
                2 Stunden unbeschwertes Spielen für 1 Kind inklusive bis zu 2 erwachsenen Begleitpersonen ohne jeglichen Aufpreis.
              </p>
              <ul className="space-y-2 text-xs text-[#46544E] pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#567568]" />
                  <span>Freier Zugang zum gesamten Spielbereich</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#567568]" />
                  <span>Kostenlose Stornierung bis 24 Stunden vorher</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#567568]" />
                  <span>Zahlung bequem vor Ort beim Check-in</span>
                </li>
              </ul>
            </div>

            <div className="md:col-span-5 bg-[#FAF7F2] p-6 rounded-2xl border border-[#EAE3D6] text-center space-y-4">
              <div>
                <span className="font-serif text-4xl font-bold text-[#243E36]">14 €</span>
                <span className="text-xs text-[#71807A] block mt-1">pro Kind / 2 Stunden</span>
              </div>
              <p className="text-[11px] text-[#71807A]">
                Salzraum-Upgrade vor Ort oder online zubuchbar (+5 €)
              </p>
              <button
                type="button"
                className="w-full bg-[#243E36] hover:bg-[#1D332C] text-white py-3.5 rounded-full text-xs font-bold transition shadow-sm cursor-pointer min-h-[44px]"
              >
                Diesen Tarif wählen
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Booking Call to Action */}
      <section className="py-24 px-6 bg-[#243E36] text-[#FAF7F2]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4E4E7]/80">
            Besuch planen
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight">
            Sichere dir deinen Wunschtermin <br className="hidden sm:inline" />
            im reizarmen Familien-Refugium.
          </h2>
          <p className="text-sm sm:text-base text-[#D4E4E7]/90 max-w-lg mx-auto font-light leading-relaxed">
            Aufgrund unserer strengen Begrenzung auf maximal 20 Kinder pro Zeitslot empfehlen wir die frühzeitige Online-Reservierung.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              type="button"
              className="bg-[#FAF7F2] hover:bg-white text-[#243E36] px-8 py-4 rounded-full text-sm font-semibold tracking-wide transition shadow-lg cursor-pointer min-h-[44px]"
            >
              Jetzt Slot reservieren
            </button>
            <span className="text-xs text-[#D4E4E7]/70">
              Keine Kreditkarte erforderlich · Zahlung vor Ort
            </span>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-[#FAF7F2] border-t border-[#EBE5DA] py-16 px-6 text-xs text-[#606D67]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <span className="font-serif text-xl font-bold text-[#243E36]">Haven Kids Café</span>
            <p className="text-[#7C8B84] leading-relaxed">
              Ein geschützter Ort für analoges Spiel, Wohlbefinden und erstklassigen Kaffee in Berlin.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-[#243E36] uppercase tracking-wider text-[11px] mb-3">Öffnungszeiten</h4>
            <p className="leading-relaxed">Montag – Donnerstag: 10:00 – 18:00</p>
            <p className="leading-relaxed">Freitag – Samstag: 09:00 – 19:00</p>
            <p className="text-[#A63B34] font-medium mt-1">Sonntag: Geschlossen</p>
          </div>

          <div>
            <h4 className="font-bold text-[#243E36] uppercase tracking-wider text-[11px] mb-3">Standort</h4>
            <p className="leading-relaxed">Friedrichstraße 123</p>
            <p className="leading-relaxed">10117 Berlin-Mitte</p>
            <p className="text-[#7C8B84] mt-1">U-Bhf Oranienburger Tor (U6)</p>
          </div>

          <div>
            <h4 className="font-bold text-[#243E36] uppercase tracking-wider text-[11px] mb-3">Rechtliches</h4>
            <p className="space-x-3">
              <a href="#" className="hover:underline">Impressum</a>
              <span>·</span>
              <a href="#" className="hover:underline">Datenschutz</a>
              <span>·</span>
              <a href="#" className="hover:underline">AGB</a>
            </p>
            <p className="mt-4 text-[11px] text-[#A2ADA8]">© 2026 Haven Kids Café. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
