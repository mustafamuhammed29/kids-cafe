import React, { useState } from 'react';
import { Wind, Heart, Sparkles, Shield, ArrowRight, Check, Droplets, Sun, Calendar, Clock, MapPin } from 'lucide-react';

export const ConceptBHome: React.FC = () => {
  const [activeSession, setActiveSession] = useState<'morning' | 'afternoon'>('morning');

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1D2623] font-sans antialiased selection:bg-[#3A6872]/20 selection:text-[#1D2623]">
      {/* 1. Header */}
      <header className="sticky top-0 z-40 bg-[#F8F6F0]/95 backdrop-blur-sm border-b border-[#E8E2D5]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#D4E4E7] flex items-center justify-center text-[#3A6872]">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif text-2xl font-medium tracking-tight text-[#243E36] block leading-none">
                Haven
              </span>
              <span className="text-[10px] tracking-widest text-[#7C8B84] uppercase font-bold">
                Salt & Family Lounge
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-[#46544E]">
            <a href="#salzraum" className="hover:text-[#3A6872] transition-colors">Der Salzraum</a>
            <a href="#wirkung" className="hover:text-[#3A6872] transition-colors">Gesundheits-Effekt</a>
            <a href="#erlebnis" className="hover:text-[#3A6872] transition-colors">Café & Ruhe</a>
            <a href="#preise" className="hover:text-[#3A6872] transition-colors">Tarife</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="bg-[#3A6872] hover:bg-[#2C525B] text-white px-6 py-2.5 rounded-full text-xs font-semibold tracking-wide transition shadow-sm cursor-pointer min-h-[44px]"
            >
              Session buchen
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero — Wellness & Salt Sanctuary Focus */}
      <section className="relative pt-10 pb-20 md:pt-16 md:pb-32 px-6 overflow-hidden">
        {/* Soft Organic Background Aura */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E3EDEE] rounded-full blur-3xl opacity-60 -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E3EDEE] text-[#3A6872] text-[11px] font-bold uppercase tracking-wider">
              <Droplets className="w-3.5 h-3.5" />
              <span>Halotherapie & Reizarmes Spiel</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#243E36] font-normal leading-[1.12]">
              Tief durchatmen. <br />
              <span className="italic text-[#3A6872]">Sanft zur Ruhe</span> <br />
              kommen.
            </h1>

            <p className="text-base sm:text-lg text-[#5A6963] font-normal leading-relaxed max-w-lg">
              Das erste Familien-Café Berlins mit integriertem Himalaya-Salzraum. Stärke spielerisch die Abwehrkräfte deines Kindes – bei frischem Bio-Kaffee in heilsamer Atmosphäre.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                className="bg-[#3A6872] hover:bg-[#2C525B] text-white px-8 py-4 rounded-full text-sm font-semibold tracking-wide transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <span>Salzraum & Spiel buchen</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#wirkung"
                className="px-6 py-4 rounded-full text-sm font-medium text-[#3A6872] hover:bg-[#EAF1F2] transition text-center border border-[#CCDCE0] min-h-[44px] flex items-center justify-center"
              >
                So wirkt der Salzraum
              </a>
            </div>

            <div className="pt-6 flex items-center gap-6 text-xs text-[#6A7872]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#3A6872]" />
                <span>Max. 8 Kinder je Salzrunde</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#3A6872]" />
                <span>100% Natürliche Mineralsalze</span>
              </div>
            </div>
          </div>

          {/* Right Column: Architectural Arch Image Frame */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-t-[140px] rounded-b-[36px] overflow-hidden border-8 border-white shadow-2xl bg-[#E8F0F1]">
              <img
                src="/assets/salt-sanctuary.jpg"
                alt="Familie im Salzraum des Haven Kids Café"
                className="w-full h-[480px] sm:h-[560px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#243E36]/40 via-transparent to-transparent pointer-events-none"></div>

              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/80 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#D4E4E7] flex items-center justify-center text-[#3A6872]">
                      <Wind className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-serif text-base text-[#243E36]">Halotherapie-Mikroklima</p>
                      <p className="text-xs text-[#71807A]">45 Minuten pure Erholung für die Atemwege</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#3A6872] bg-[#EAF1F2] px-3 py-1 rounded-full">
                    Sanft & Sicher
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Value Proposition — Health & Wellness Pillars */}
      <section id="wirkung" className="py-20 bg-[#EFF5F5] border-y border-[#DCE8EA]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#537A84] block mb-2">
              Ganzheitliches Konzept
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#243E36]">
              Warum Salztherapie für Kinder so wertvoll ist
            </h2>
            <p className="text-sm text-[#5A6963] mt-3">
              Besonders in den kalten Monaten und bei Stadtluft eine natürliche Wohltat für die Bronchien.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-[#DFEAEB] shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-full bg-[#E3EDEE] text-[#3A6872] flex items-center justify-center font-serif text-lg font-bold">
                1
              </div>
              <h3 className="font-serif text-xl text-[#243E36]">Befreite Atemwege</h3>
              <p className="text-xs text-[#5A6963] leading-relaxed">
                Feinste Salzpartikel dringen bis in die Verzweigungen der Lunge vor, lösen Schleim sanft und befeuchten beanspruchte Schleimhäute.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#DFEAEB] shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-full bg-[#E3EDEE] text-[#3A6872] flex items-center justify-center font-serif text-lg font-bold">
                2
              </div>
              <h3 className="font-serif text-xl text-[#243E36]">Spielerische Therapie</h3>
              <p className="text-xs text-[#5A6963] leading-relaxed">
                Keine Masken, keine Apparate. Kinder spielen wie in einer Salz-Sandkiste mit Buchenholz-Schaufeln – völlig stressfrei und mit Freude.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#DFEAEB] shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-full bg-[#E3EDEE] text-[#3A6872] flex items-center justify-center font-serif text-lg font-bold">
                3
              </div>
              <h3 className="font-serif text-xl text-[#243E36]">Akustische Tiefenentspannung</h3>
              <p className="text-xs text-[#5A6963] leading-relaxed">
                Gedämpftes Licht durch Salzkristalle und leise beruhigende Klänge lassen das vegetative Nervensystem von Eltern und Kindern herunterfahren.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Dual Experience Teaser */}
      <section id="erlebnis" className="py-20 md:py-28 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-3xl overflow-hidden shadow-lg border border-[#E8E2D5]">
            <img
              src="/assets/artisan-cafe.jpg"
              alt="Café Bereich im Haven Kids Café"
              className="w-full h-[400px] object-cover"
            />
          </div>

          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3A6872]">
              Für Begleitpersonen
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#243E36]">
              Dein Wohlfühlraum, während die Kleinen versunken spielen.
            </h2>
            <p className="text-sm text-[#5A6963] leading-relaxed">
              Wir wissen, wie anstrengend der Familienalltag sein kann. Deshalb servieren wir ausschließlich Bio-Spezialitätenkaffee von regionalen Röstern, handwerklich gebackenes Gebäck und nahrhafte Bowls in einer leisen, lichtdurchfluteten Atmosphäre.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-[#3A6872] mt-0.5" />
                <span className="text-xs text-[#46544E]">Ergonomische Loungemöbel und freies WLAN</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-[#3A6872] mt-0.5" />
                <span className="text-xs text-[#46544E]">Stets freie Sichtlinie in den Spielbereich</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-[#3A6872] mt-0.5" />
                <span className="text-xs text-[#46544E]">Kompaktes, schallgedämmtes Raumkonzept</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pricing Teaser */}
      <section id="preise" className="py-20 bg-[#EFF5F5] border-y border-[#DCE8EA]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#3A6872] block mb-2">
            Sanfte Tarife
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#243E36] mb-10">
            Kombiniere Spielraum & Salzraum nach Wunsch
          </h2>

          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#DFEAEB] shadow-sm max-w-xl mx-auto space-y-6">
            <div className="flex justify-between items-baseline border-b border-[#EAF0F1] pb-4">
              <div className="text-left">
                <h3 className="font-serif text-2xl text-[#243E36]">Kombi-Ticket Spiel + Salz</h3>
                <p className="text-xs text-[#71807A]">2 Std. Spielraum + 45 Min. Salzraumsitzung</p>
              </div>
              <div className="text-right">
                <span className="font-serif text-3xl font-bold text-[#3A6872]">19 €</span>
                <span className="text-[11px] text-[#71807A] block">1 Kind + 2 Erw.</span>
              </div>
            </div>

            <ul className="text-xs text-left text-[#5A6963] space-y-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#3A6872]" />
                <span>Voller Zugang zum Holzspielbereich</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#3A6872]" />
                <span>Geführte Salzraumsitzung mit Spielzeug</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#3A6872]" />
                <span>Bis zu 2 Begleitpersonen inklusive</span>
              </li>
            </ul>

            <button
              type="button"
              className="w-full bg-[#3A6872] hover:bg-[#2C525B] text-white py-3.5 rounded-full text-xs font-bold tracking-wide transition shadow-sm cursor-pointer min-h-[44px]"
            >
              Kombi-Ticket reservieren
            </button>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="bg-[#F8F6F0] border-t border-[#E8E2D5] py-14 px-6 text-xs text-[#71807A]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div>
            <span className="font-serif text-xl font-bold text-[#243E36] block">Haven Kids Café</span>
            <p className="text-[11px] text-[#8C9A94]">Friedrichstraße 123, 10117 Berlin · hallo@havenkids.de</p>
          </div>
          <div className="flex gap-6 text-[11px]">
            <a href="#" className="hover:text-[#243E36]">Impressum</a>
            <a href="#" className="hover:text-[#243E36]">Datenschutz</a>
            <a href="#" className="hover:text-[#243E36]">Hausregeln & Hygiene</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
