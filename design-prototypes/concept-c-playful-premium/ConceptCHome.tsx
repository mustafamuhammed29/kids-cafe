import React, { useState } from 'react';
import { Sparkles, Heart, ArrowRight, Check, Smile, Coffee, Wind, Blocks, Calendar, Users, Star } from 'lucide-react';

export const ConceptCHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'toddler' | 'preschool' | 'parents'>('toddler');

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#1D2623] font-sans antialiased selection:bg-[#E8927C]/30 selection:text-[#1D2623]">
      {/* 1. Top Announcement Bar */}
      <div className="bg-[#E8927C] text-[#1D2623] py-2 px-4 text-center text-xs font-semibold tracking-wide">
        <span>✨ Neueröffnung in Berlin-Mitte · Jetzt limitierte Kennenlern-Slots sichern</span>
      </div>

      {/* 2. Header */}
      <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-sm border-b border-[#F0E9DF]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8927C]/20 flex items-center justify-center text-[#E8927C]">
              <Sparkles className="w-5 h-5 text-[#C46752]" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#243E36] block leading-none">
                Haven
              </span>
              <span className="text-[10px] tracking-widest text-[#C46752] uppercase font-extrabold">
                Play & Family Café
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#46544E]">
            <a href="#spielraum" className="hover:text-[#C46752] transition-colors">Spielkonzept</a>
            <a href="#salzraum" className="hover:text-[#C46752] transition-colors">Salzraum</a>
            <a href="#cafe" className="hover:text-[#C46752] transition-colors">Bio-Café</a>
            <a href="#feiern" className="hover:text-[#C46752] transition-colors">Geburtstage</a>
            <a href="#preise" className="hover:text-[#C46752] transition-colors">Preise</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="bg-[#243E36] hover:bg-[#1D332C] text-[#FFFDF9] px-6 py-2.5 rounded-full text-xs font-bold tracking-wide transition shadow-sm hover:scale-102 cursor-pointer min-h-[44px]"
            >
              Termin buchen
            </button>
          </div>
        </div>
      </header>

      {/* 3. Hero — Joyful Premium Stance */}
      <section className="relative pt-10 pb-20 md:pt-16 md:pb-28 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FCEEEA] text-[#C46752] text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-[#C46752]" />
              <span>Kreatives Freispiel für Kinder von 0 bis 8 Jahren</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1D2623] font-normal leading-[1.12]">
              Große Abenteuer für kleine Hände – <br />
              <span className="text-[#C46752] italic font-normal">pure Entspannung</span> für dich.
            </h1>

            <p className="text-base sm:text-lg text-[#5A6963] font-normal leading-relaxed max-w-xl">
              Im Haven Kids Café treffen skandinavische Holzspielsachen auf köstlichen Specialty Coffee und gesunde Leckereien. Liebevoll kuratiert, reizarm gestaltet und maximal gemütlich.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                className="bg-[#E8927C] hover:bg-[#D8816B] text-[#1D2623] px-8 py-4 rounded-full text-sm font-bold tracking-wide transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <span>Jetzt Spielzeit buchen</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#spielraum"
                className="px-6 py-4 rounded-full text-sm font-semibold text-[#243E36] hover:bg-[#F7F2EA] transition text-center border border-[#E5DDD0] min-h-[44px] flex items-center justify-center"
              >
                Unsere Spielbereiche
              </a>
            </div>

            {/* Joyful Feature Highlights */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#F0E9DF]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#46544E]">
                <Blocks className="w-4 h-4 text-[#C46752] shrink-0" />
                <span>100% Holzspielzeug</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#46544E]">
                <Wind className="w-4 h-4 text-[#3A6872] shrink-0" />
                <span>Wohltuender Salzraum</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#46544E]">
                <Coffee className="w-4 h-4 text-[#8C5D4B] shrink-0" />
                <span>Bio-Barista-Kaffee</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Image with Playful Accents */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-[32px] overflow-hidden border-4 border-[#F5EDE1] shadow-xl">
              <img
                src="/assets/hero-interior.jpg"
                alt="Kinder spielen im geschützten Holzspielbereich des Haven Kids Café"
                className="w-full h-[460px] sm:h-[520px] object-cover"
              />
              <div className="absolute top-4 right-4 bg-[#FFFDF9]/95 backdrop-blur-sm px-3.5 py-2 rounded-2xl border border-white/80 shadow-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-[#243E36]">Slots heute verfügbar</span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 bg-[#FFFDF9]/95 backdrop-blur-sm p-4 rounded-2xl border border-white/80 shadow-md">
                <p className="text-xs font-bold text-[#1D2623]">2 Stunden unbeschwerte Auszeit</p>
                <p className="text-[11px] text-[#71807A]">Ab 14 € inkl. 2 Erwachsenen · Sockenpflicht für alle</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Age-Tailored Zones Selector */}
      <section id="spielraum" className="py-20 bg-[#FBF7EE] border-y border-[#ECE3D5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#C46752] block mb-2">
              Für jedes Alter das Passende
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1D2623]">
              Kreatives Spiel ohne Überstimulation
            </h2>
          </div>

          <div className="flex justify-center gap-3 mb-12">
            <button
              type="button"
              onClick={() => setActiveTab('toddler')}
              className={`px-6 py-3 rounded-full text-xs font-bold transition ${activeTab === 'toddler' ? 'bg-[#243E36] text-white shadow-sm' : 'bg-white text-[#46544E] border border-[#E5DDD0]'}`}
            >
              Krabbelbereich (0–2 Jahre)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preschool')}
              className={`px-6 py-3 rounded-full text-xs font-bold transition ${activeTab === 'preschool' ? 'bg-[#243E36] text-white shadow-sm' : 'bg-white text-[#46544E] border border-[#E5DDD0]'}`}
            >
              Entdeckerzone (3–8 Jahre)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('parents')}
              className={`px-6 py-3 rounded-full text-xs font-bold transition ${activeTab === 'parents' ? 'bg-[#243E36] text-white shadow-sm' : 'bg-white text-[#46544E] border border-[#E5DDD0]'}`}
            >
              Café & Lounge
            </button>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#EBE3D6] shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FCEEEA] text-[#C46752]">
                {activeTab === 'toddler' && 'Sensomotorischer Babypool'}
                {activeTab === 'preschool' && 'Motorik- und Kletterparcours'}
                {activeTab === 'parents' && 'Specialty Coffee & Workspace'}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#243E36]">
                {activeTab === 'toddler' && 'Sicher rollen, krabbeln und tasten'}
                {activeTab === 'preschool' && 'Klettern, balancieren und bauen'}
                {activeTab === 'parents' && 'Bio-Genuss mit Blickkontakt'}
              </h3>
              <p className="text-sm text-[#5A6963] leading-relaxed">
                {activeTab === 'toddler' && 'Ausgestattet mit weichen Schaumstoffmatten, Holz-Rasseln und sensorischen Büchern. Abgetrennt von den größeren Kindern für maximale Ruhe und Sicherheit.'}
                {activeTab === 'preschool' && 'Balancierbalken, Sprossenwände und offene Holzbausteine laden zu kreativem Rollenspiel ein. Ganz ohne Plastik und laute Musik.'}
                {activeTab === 'parents' && 'Bequeme Sitzmöglichkeiten mit freiem Blick auf den Spielbereich. Hafer-Cappuccino, frische Zimtschnecken und ergonomische Arbeitsplätze mit WLAN.'}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  className="bg-[#243E36] text-white px-6 py-3 rounded-full text-xs font-bold hover:bg-[#1D332C] transition cursor-pointer min-h-[44px]"
                >
                  Slot reservieren →
                </button>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-[#EBE3D6]">
              <img
                src={activeTab === 'parents' ? '/assets/artisan-cafe.jpg' : '/assets/hero-interior.jpg'}
                alt="Haven Kids Café Erlebnisbereich"
                className="w-full h-[320px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pricing Teaser */}
      <section id="preise" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#C46752] block mb-2">
            Pakete & Preise
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1D2623] mb-12">
            Wähle dein Lieblingspaket
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-white p-8 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-4">
              <span className="text-xs font-bold text-[#567568] bg-[#EAEFEA] px-3 py-1 rounded-full">
                Spontanbesuch
              </span>
              <h3 className="font-serif text-2xl text-[#243E36]">Einzelbesuch</h3>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl font-bold text-[#243E36]">14 €</span>
                <span className="text-xs text-[#71807A]">/ 2 Stunden</span>
              </div>
              <ul className="text-xs text-[#5A6963] space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#567568]" />
                  <span>1 Kind + 2 Begleitpersonen frei</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#567568]" />
                  <span>Voller Zugang zum Holzspielbereich</span>
                </li>
              </ul>
              <button
                type="button"
                className="w-full bg-[#243E36] hover:bg-[#1D332C] text-white py-3 rounded-full text-xs font-bold transition cursor-pointer min-h-[44px]"
              >
                Buchen
              </button>
            </div>

            <div className="bg-[#FAF4EC] p-8 rounded-3xl border-2 border-[#E8927C] shadow-sm space-y-4 relative">
              <span className="absolute -top-3 right-6 text-[10px] font-extrabold uppercase tracking-wider text-white bg-[#C46752] px-3 py-1 rounded-full shadow-xs">
                Beliebt: 14% Sparen
              </span>
              <span className="text-xs font-bold text-[#C46752] bg-[#FCEEEA] px-3 py-1 rounded-full">
                Für Stammgäste
              </span>
              <h3 className="font-serif text-2xl text-[#243E36]">10er-Block Pass</h3>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl font-bold text-[#243E36]">120 €</span>
                <span className="text-xs text-[#71807A]">/ 10 Besuche</span>
              </div>
              <ul className="text-xs text-[#5A6963] space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#C46752]" />
                  <span>10 x 2 Stunden Spielzeit (12 Monate gültig)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#C46752]" />
                  <span>Übertragbar auf Geschwisterkinder</span>
                </li>
              </ul>
              <button
                type="button"
                className="w-full bg-[#E8927C] hover:bg-[#D8816B] text-[#1D2623] py-3 rounded-full text-xs font-bold transition shadow-xs cursor-pointer min-h-[44px]"
              >
                10er-Pass sichern
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="bg-[#FBF7EE] border-t border-[#ECE3D5] py-12 px-6 text-xs text-[#71807A]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <span className="font-serif text-xl font-bold text-[#243E36] block">Haven Kids Café</span>
            <p className="text-[11px] text-[#8C9A94]">Friedrichstraße 123, 10117 Berlin · hallo@havenkids.de</p>
          </div>
          <div className="flex gap-6 text-[11px]">
            <a href="#" className="hover:text-[#243E36]">Impressum</a>
            <a href="#" className="hover:text-[#243E36]">Datenschutz</a>
            <a href="#" className="hover:text-[#243E36]">AGB</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
