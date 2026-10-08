import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Wind, 
  Blocks, 
  Coffee, 
  Cake, 
  Footprints, 
  Users, 
  ShieldCheck, 
  Baby 
} from 'lucide-react';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';
import { usePageSeo } from '../hooks/usePageSeo';

interface ServicesPageProps {
  onOpenBooking: () => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onOpenBooking }) => {
  usePageSeo({
    title: 'Unsere Räume & Angebote | Haven Kids Café Berlin',
    description: 'Bilder & Einblicke in unsere Räume: Pädagogischer Holzspielbereich, sanfter Salzraum, Barista-Café für Eltern und private Kindergeburtstage.',
    canonicalPath: '/services',
  });

  return (
    <div className="pt-16 sm:pt-20 md:pt-24 animate-fadeIn pb-24 md:pb-20 bg-[#FAF8F5] min-h-screen text-dark">
      {/* 1. Header - Confident, Generous & Welcoming */}
      <section className="relative pt-6 pb-6 sm:py-12 px-4 text-center bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-sky-50 border border-sky-100 text-primary font-bold text-xs sm:text-sm mb-3 shadow-xs">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Raumkonzept &amp; Erlebnis</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-3">
            Unsere Räume im Detail
          </h1>
          <p className="text-base sm:text-xl text-slate-600 max-w-xl mx-auto leading-relaxed">
            Helle Wohlfühl-Atmosphäre, pädagogisches Holzspielzeug und wohltuende Entspannung für die ganze Familie.
          </p>
        </div>
      </section>

      {/* 2. Physical Spaces Showcase with Real Photography */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 space-y-10 sm:space-y-16">
        
        {/* SPACE 1: Pädagogischer Spielbereich */}
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col md:flex-row items-stretch">
          <div className="w-full md:w-1/2 relative aspect-[4/3] md:aspect-auto bg-slate-100 overflow-hidden">
            <img
              src="/assets/spielbereich.jpg"
              alt="Pädagogischer Spielbereich mit Holzspielzeug im Haven Kids Café Berlin"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-white/95 backdrop-blur-md text-slate-900 font-bold text-xs uppercase px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5">
                <Blocks className="w-4 h-4 text-primary" />
                0–8 Jahre • 100% bildschirmfrei
              </span>
            </div>
          </div>

          <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-between text-left">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3">
                Pädagogischer Holzspielbereich
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                Wir verzichten bewusst auf grelle Bildschirme und blinkende Lichter. Unser Spielbereich setzt auf langlebiges Holzspielzeug, modulare Kletterlandschaften und sensorische Motorikwände, die Phantasie und Feinmotorik anregen.
              </p>

              <div className="space-y-3 text-sm sm:text-base text-slate-700 font-medium mb-6">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span>Separater Soft-Krabbelbereich für Babys &amp; Kleinkinder (0–2 J.)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span>Akustisch optimiert für eine gedämpfte, angenehme Lautstärke</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span>Tägliche Desinfektion &amp; strenge Hygienestandards</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onOpenBooking}
                className="bg-slate-900 hover:bg-slate-800 text-white px-7 py-3.5 rounded-2xl font-bold text-sm sm:text-base transition flex items-center gap-2 cursor-pointer min-h-[48px]"
              >
                <span>Spielzeit buchen</span>
                <ArrowRight className="w-4 h-4 text-secondary" />
              </button>
              <Link
                to="/pricing"
                className="text-sm sm:text-base font-bold text-primary hover:underline py-2"
              >
                Eintritt ab 14 € (2 Erw. frei) →
              </Link>
            </div>
          </div>
        </section>

        {/* SPACE 2: Sanfter Salzraum */}
        <section className="bg-white rounded-3xl border-2 border-sky-200 shadow-xs overflow-hidden flex flex-col md:flex-row-reverse items-stretch relative">
          <div className="w-full md:w-1/2 relative aspect-[4/3] md:aspect-auto bg-slate-100 overflow-hidden">
            <img
              src="/assets/salt-sanctuary.jpg"
              alt="Heller, sanfter Salzraum mit salzhaltiger Luft im Haven Kids Café"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute top-4 right-4">
              <span className="bg-primary text-white font-black text-xs uppercase px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5">
                <Wind className="w-4 h-4" />
                45 Min. Ruheoase
              </span>
            </div>
          </div>

          <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-between text-left bg-gradient-to-br from-white to-sky-50/30">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary bg-sky-100/70 px-3 py-1 rounded-lg mb-3">
                <span>+5 € optionales Ticket-Upgrade</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3">
                Sanfter Salzraum für Kinder &amp; Familien
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                Ein mikroklimatisches Trockensalz-Erlebnis in kinderfreundlicher Atmosphäre. Kinder graben und spielen entspannt im feinen Steinsalz mit kindgerechten Spielzeugen, während Eltern sanfte maritime Raumluft inhalieren.
              </p>

              <div className="space-y-3 text-sm sm:text-base text-slate-700 font-medium mb-6">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span>Maximal 8 Kinder pro 45-Minuten-Einheit (keine Überfüllung)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span>Begleitpersonen (Erwachsene) kostenlos dabei</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span>Reines Trockensalz-Aerosol (keine nasse Kaltvernebelung)</span>
                </div>
              </div>

              <MedicalDisclaimer className="text-xs sm:text-sm mb-6" />
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onOpenBooking}
                className="bg-primary hover:bg-primary/95 text-white px-7 py-3.5 rounded-2xl font-bold text-sm sm:text-base transition flex items-center gap-2 cursor-pointer min-h-[48px]"
              >
                <span>Mit Salzraum reservieren</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/faq"
                className="text-sm sm:text-base font-bold text-slate-600 hover:text-slate-900 py-2"
              >
                Salzraum-Fragen im FAQ →
              </Link>
            </div>
          </div>
        </section>

        {/* SPACE 3: Eltern-Café & Lounge */}
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col md:flex-row items-stretch">
          <div className="w-full md:w-1/2 relative aspect-[4/3] md:aspect-auto bg-slate-100 overflow-hidden">
            <img
              src="/assets/artisan-cafe.jpg"
              alt="Gemütliches Eltern-Café mit Barista-Kaffee und freiem Blick auf den Spielbereich"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-white/95 backdrop-blur-md text-amber-900 font-bold text-xs uppercase px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-amber-600" />
                Specialty Coffee &amp; Lounge
              </span>
            </div>
          </div>

          <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-between text-left">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3">
                Barista Café &amp; Eltern-Lounge
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                Entspannen, während die Kinder spielen: Unser offenes Raumkonzept garantiert freie Sichtachsen auf den gesamten Spielbereich von jedem Tisch aus. Genieße Specialty Coffee aus regionaler Röstung und gesunde Snacks.
              </p>

              <div className="space-y-3 text-sm sm:text-base text-slate-700 font-medium mb-6">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Barista-Spezialitäten mit Bio-Kuhmilch &amp; Hafermilch</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Frische Bio-Fruchtsäfte &amp; zuckerarme Kindersnacks</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Kostenfreies Highspeed-WLAN &amp; gemütliche Sitzecken</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <span className="text-sm text-slate-600 font-medium">
                ☕ Zwei erwachsene Begleitpersonen haben immer freien Café-Eintritt.
              </span>
            </div>
          </div>
        </section>

        {/* SPACE 4: Kindergeburtstage & Events */}
        <section className="bg-white rounded-3xl border-2 border-accent shadow-xs overflow-hidden flex flex-col md:flex-row-reverse items-stretch">
          <div className="w-full md:w-1/2 relative aspect-[4/3] md:aspect-auto bg-slate-100 overflow-hidden">
            <img
              src="/assets/geburtstage.jpg"
              alt="Festlich dekorierter Kindergeburtstags-Tisch im Haven Kids Café"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute top-4 right-4">
              <span className="bg-accent text-dark font-black text-xs uppercase px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5">
                <Cake className="w-4 h-4" />
                Rundum-Sorglos-Feier
              </span>
            </div>
          </div>

          <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-between text-left">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-dark bg-accent/30 px-3 py-1 rounded-lg mb-3">
                <span>Paketpreis ab 250 €</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3">
                Kindergeburtstag stressfrei feiern
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                Feiere den Geburtstag deines Kindes völlig entspannt. Wir kümmern uns um den festlich geschmückten Tisch, kindgerechte Bio-Snacks, Getränke und 2,5 Stunden Spielzeit. Null Vorbereitungs- oder Aufräumstress für Eltern!
              </p>

              <div className="space-y-3 text-sm sm:text-base text-slate-700 font-medium mb-6">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  <span>Inklusive bis zu 8 Kinder &amp; 4 Erwachsene</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  <span>Dekoration, Bio-Snacks &amp; Saftschorlen inklusive</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  <span>Eigene Torte darf kostenfrei mitgebracht werden</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onOpenBooking}
                className="bg-slate-900 hover:bg-slate-800 text-white px-7 py-3.5 rounded-2xl font-bold text-sm sm:text-base transition flex items-center gap-2 cursor-pointer min-h-[48px]"
              >
                <span>Termin anfragen</span>
                <ArrowRight className="w-4 h-4 text-secondary" />
              </button>
              <Link
                to="/pricing"
                className="text-sm sm:text-base font-bold text-primary hover:underline py-2"
              >
                Paketübersicht ansehen →
              </Link>
            </div>
          </div>
        </section>

        {/* 3. Practical Family Comfort Strip */}
        <section className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/80 shadow-xs">
          <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900 mb-5 text-center sm:text-left">
            Gut zu wissen für euren Besuch
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <Footprints className="w-6 h-6 text-primary mb-2" />
              <strong className="block text-slate-900 font-bold mb-1">Sockenpflicht</strong>
              <p className="text-xs sm:text-sm text-slate-500">Stoppersocken für Kinder &amp; Begleiter</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <Users className="w-6 h-6 text-emerald-600 mb-2" />
              <strong className="block text-slate-900 font-bold mb-1">2 Erw. frei</strong>
              <p className="text-xs sm:text-sm text-slate-500">Bei jedem Besuch kostenfrei dabei</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <Baby className="w-6 h-6 text-amber-600 mb-2" />
              <strong className="block text-slate-900 font-bold mb-1">Wickel- &amp; Stillbereich</strong>
              <p className="text-xs sm:text-sm text-slate-500">Geschützte, ruhige Zonen vorhanden</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <ShieldCheck className="w-6 h-6 text-pink-600 mb-2" />
              <strong className="block text-slate-900 font-bold mb-1">Kinderwagen-Parken</strong>
              <p className="text-xs sm:text-sm text-slate-500">Barrierefreier Stellplatz im Foyer</p>
            </div>
          </div>
        </section>

        {/* 4. Bottom Booking Action Card */}
        <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-md flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="text-left space-y-2">
            <h3 className="font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
              Lust auf eine entspannte Familienzeit?
            </h3>
            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              Buche deinen Wunschtermin bequem online in unter 2 Minuten. Keine Vorauszahlung nötig!
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenBooking}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-bold text-base sm:text-lg transition flex items-center justify-center gap-2.5 cursor-pointer min-h-[52px] shrink-0 active:scale-[0.98]"
          >
            <span>Jetzt Wunschtermin sichern</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </section>

      </div>
    </div>
  );
};

export default ServicesPage;
