import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Check,
  Sparkles,
  Wind,
  HelpCircle,
  ArrowRight,
  MessageCircle,
  Mail,
  Calendar,
  CreditCard,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Users,
  Clock,
  Cake,
  CheckCircle2,
} from 'lucide-react';
import { SERVICES } from '../data/mockData';
import type { ServiceItem } from '../types/booking';
import { usePageSeo } from '../hooks/usePageSeo';

interface PricingPageProps {
  onOpenBooking: (service?: ServiceItem) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onOpenBooking }) => {
  usePageSeo({
    title: 'Preise & Tarife | Haven Kids Café Berlin',
    description: 'Transparente Eintrittspreise: Einzelbesuch 14 €, flexibler 10er-Pass (120 €), Salzraum-Upgrade (+5 €) und Geburtstagspakete ab 250 €.',
    canonicalPath: '/pricing',
  });

  const [activeTab, setActiveTab] = useState<'standard' | 'events'>('standard');
  const [showComparison, setShowComparison] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  const singleVisit = SERVICES.find((s) => s.slug === 'einzelbesuch') || SERVICES[0];
  const tenPass = SERVICES.find((s) => s.slug === '10er-block') || SERVICES[1];
  const birthday = SERVICES.find((s) => s.slug === 'kindergeburtstag') || SERVICES[2];
  const otherEventPackages = SERVICES.filter((s) => s.packageCategory !== 'standard');

  const handlePackageCta = (pkg: ServiceItem) => {
    if (pkg.ctaAction === 'book') {
      onOpenBooking(pkg);
    } else if (pkg.ctaAction === 'whatsapp') {
      const msg = encodeURIComponent(
        `Hallo Haven Kids Team, ich interessiere mich für das Paket "${pkg.name}". Bitte teilt mir mögliche Termine mit!`
      );
      window.open(`https://wa.me/493012345678?text=${msg}`, '_blank');
    } else if (pkg.ctaAction === 'contact-form') {
      navigate(`/contact?subject=${encodeURIComponent(pkg.name)}`);
    }
  };

  const togglePricingFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <div className="pt-16 sm:pt-20 md:pt-24 animate-fadeIn pb-24 md:pb-20 bg-[#FAF8F5] min-h-screen text-dark">
      {/* 1. Header Section - Confident, Generous & Welcoming */}
      <section className="relative pt-6 pb-6 sm:py-12 px-4 text-center bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-sky-50 border border-sky-100 text-primary font-bold text-xs sm:text-sm mb-3 shadow-xs">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Transparente Familienpreise</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-3">
            Eintritt &amp; Tarife
          </h1>
          <p className="text-base sm:text-xl text-slate-600 max-w-xl mx-auto leading-relaxed mb-5">
            Keine versteckten Gebühren. <strong className="text-slate-900 font-bold">2 Begleitpersonen</strong> pro Kind immer kostenfrei inklusive!
          </p>

          {/* Quick Assurance Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-700 font-semibold">
            <span className="inline-flex items-center gap-1.5 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <Users className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>2 Erwachsene frei</span>
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <RotateCcw className="w-4 h-4 text-primary shrink-0" />
              <span>Storno bis 2h frei</span>
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <CreditCard className="w-4 h-4 text-slate-600 shrink-0" />
              <span>Zahlung vor Ort</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. Main Category Segmented Switcher */}
      <div className="sticky top-16 sm:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/70 py-2.5 px-4 shadow-xs">
        <div className="max-w-md mx-auto">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center justify-between text-sm sm:text-base font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('standard')}
              className={`flex-1 py-2.5 px-4 rounded-xl transition-all text-center cursor-pointer min-h-[44px] flex items-center justify-center gap-2 ${
                activeTab === 'standard'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>🎟️ Einzeltickets &amp; Pässe</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('events')}
              className={`flex-1 py-2.5 px-4 rounded-xl transition-all text-center cursor-pointer min-h-[44px] flex items-center justify-center gap-2 ${
                activeTab === 'events'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>🎉 Feiern &amp; Events</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8 sm:space-y-10">
        {/* =========================================================================
            TAB 1: STANDARD ADMISSIONS
            ========================================================================= */}
        {activeTab === 'standard' && (
          <div className="space-y-6 sm:space-y-8">
            
            {/* Quick Comparison Summary Strip */}
            <div className="bg-gradient-to-r from-sky-50/80 via-white to-pink-50/80 rounded-2xl p-4 sm:p-5 border border-sky-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4 text-sm sm:text-base">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-slate-900">Empfehlung:</span>
                <span className="text-slate-600 hidden sm:inline">Ab dem 9. Besuch lohnt sich der 10er-Pass.</span>
                <span className="text-slate-600 sm:hidden">10er-Pass spart sofort 20 €.</span>
              </div>
              <span className="font-bold text-accent bg-accent/15 px-3 py-1 rounded-full shrink-0 text-xs sm:text-sm">
                12 € statt 14 € / Besuch
              </span>
            </div>

            {/* Ticket Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
              
              {/* TICKET 1: Einzelbesuch */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-lg">
                      Spontan &amp; Flexibel
                    </span>
                    <span className="text-sm text-slate-500 font-semibold flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      2 Stunden
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1.5">
                    {singleVisit.name}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-500 mb-5 leading-relaxed">
                    Ideal zum Reinschnuppern und für spontane Spieltage.
                  </p>

                  {/* Price Banner */}
                  <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 mb-5 border border-slate-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                        14 €
                      </span>
                      <span className="text-sm text-slate-500 ml-2 font-medium">
                        / Kind (2h)
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-3 py-1 rounded-lg">
                      2 Erw. gratis
                    </span>
                  </div>

                  {/* Bullet Benefits */}
                  <ul className="space-y-3 mb-6 text-sm sm:text-base text-slate-700 font-medium">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>Voller Zugang zum Holzspielbereich &amp; Motorikinseln</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>2 Begleitpersonen frei (im Café mit Sichtkontakt)</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>Geschützter Krabbelbereich für 0–2 Jahre</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-slate-500">
                      <Wind className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                      <span>Salzraum für nur 5 € pro Kind optional zubuchbar</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handlePackageCta(singleVisit)}
                  className="w-full py-4 rounded-2xl font-bold text-base sm:text-lg bg-primary hover:bg-primary/95 text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer min-h-[52px] active:scale-[0.98]"
                >
                  <span>Einzelbesuch buchen</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* TICKET 2: 10er-Block Pass */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-primary shadow-sm hover:border-primary transition-all flex flex-col justify-between relative">
                {/* Bestseller Badge */}
                <div className="absolute -top-3.5 left-6">
                  <span className="bg-accent text-dark font-black text-xs sm:text-sm uppercase px-3.5 py-1 rounded-full shadow-xs tracking-wide flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Bestseller • 20 € Ersparnis
                  </span>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-dark bg-accent/30 px-3 py-1 rounded-lg">
                      Familien-Sparpaket
                    </span>
                    <span className="text-sm text-slate-500 font-semibold flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      10x 2 Stunden
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1.5">
                    {tenPass.name}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-500 mb-5 leading-relaxed">
                    Maximale Flexibilität: uneingeschränkt auf Geschwister übertragbar.
                  </p>

                  {/* Price Banner */}
                  <div className="bg-sky-50/70 rounded-2xl p-4 sm:p-5 mb-5 border border-sky-200/60 flex items-baseline justify-between">
                    <div>
                      <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                        120 €
                      </span>
                      <span className="text-sm text-primary ml-2 font-bold">
                        (nur 12 € / Besuch)
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-primary bg-white border border-primary/20 px-3 py-1 rounded-lg">
                      12 Monate gültig
                    </span>
                  </div>

                  {/* Bullet Benefits */}
                  <ul className="space-y-3 mb-6 text-sm sm:text-base text-slate-700 font-medium">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span><strong>10 Besuche</strong> à 2 Stunden (Ersparnis von 20 €)</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span><strong>Geschwister-Bonus:</strong> Voll flexibel übertragbar</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span><strong>1x Gratis Salzraum-Sitzung</strong> inklusive (Wert 5 €)</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span>2 Begleitpersonen je Besuch weiterhin kostenfrei</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handlePackageCta(tenPass)}
                  className="w-full py-4 rounded-2xl font-bold text-base sm:text-lg bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer min-h-[52px] active:scale-[0.98]"
                >
                  <span>10er-Pass sichern</span>
                  <ArrowRight className="w-5 h-5 text-secondary" />
                </button>
              </div>

            </div>

            {/* Salzraum Add-On Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-sky-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex items-start gap-4 w-full">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-primary flex items-center justify-center shrink-0">
                  <Wind className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                    <h3 className="font-bold text-base sm:text-lg text-slate-900">
                      Wohltuender Salzraum (45 Min.)
                    </h3>
                    <span className="text-xs sm:text-sm font-black px-2.5 py-1 rounded-lg bg-primary text-white">
                      + 5 € je Kind
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Feines Trockensalz-Mikroklima zur sanften Erholung. Begleitpersonen sind auch im Salzraum kostenfrei dabei.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenBooking(singleVisit)}
                className="w-full sm:w-auto shrink-0 bg-sky-50 hover:bg-sky-100 text-primary border border-sky-200 px-6 py-3.5 rounded-2xl text-sm sm:text-base font-bold transition flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
              >
                <span>Mit Salzraum buchen</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* =========================================================================
            TAB 2: EVENTS & BIRTHDAYS
            ========================================================================= */}
        {activeTab === 'events' && (
          <div className="space-y-6 sm:space-y-8">
            
            {/* Flagship Event: Kindergeburtstag */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-9 border-2 border-accent shadow-xs relative overflow-hidden">
              <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-dark bg-accent/30 px-3 py-1 rounded-lg mb-3">
                <Cake className="w-4 h-4" />
                Beliebtestes Feier-Paket
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-2">
                    {birthday.name}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 mb-5 leading-relaxed">
                    Feiern ohne Aufräumstress: Festlich gedeckter Tisch, gesunde Bio-Snacks, Saftschorlen und 2,5 Stunden Spielzeit für bis zu 8 Kinder &amp; 4 Erwachsene.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm sm:text-base text-slate-700 font-medium">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                      <span>8 Kinder &amp; 4 Erwachsene inklusive</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                      <span>Festlich dekorierter Geburtstagstisch</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                      <span>Bio-Snacks, Obstteller &amp; Getränke</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                      <span>2,5 Stunden Spiel- und Feierzeit</span>
                    </div>
                  </div>
                </div>

                <div className="lg:w-72 bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-100 flex flex-col justify-between text-center shrink-0">
                  <div className="mb-4">
                    <span className="text-xs text-slate-500 font-semibold uppercase block mb-1">Komplettpreis</span>
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 block">
                      ab 250 €
                    </span>
                    <span className="text-xs text-slate-500">Inkl. Endreinigung</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePackageCta(birthday)}
                    className="w-full py-3.5 px-6 rounded-2xl font-bold text-base bg-slate-900 hover:bg-slate-800 text-white transition flex items-center justify-center gap-2 cursor-pointer min-h-[50px]"
                  >
                    <Calendar className="w-4 h-4 text-secondary" />
                    <span>Termin anfragen</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Other Event Options: 2-Col Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {otherEventPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between text-left"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                        {pkg.subtitle}
                      </span>
                      <span className="text-sm font-bold text-slate-600">
                        {pkg.priceLabel}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                      {pkg.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                      {pkg.description}
                    </p>

                    <ul className="space-y-2 text-sm text-slate-700 mb-5">
                      {pkg.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePackageCta(pkg)}
                    className="w-full py-3 rounded-2xl font-bold text-sm sm:text-base bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 transition flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
                  >
                    {pkg.ctaAction === 'whatsapp' ? (
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Mail className="w-4 h-4 text-primary" />
                    )}
                    <span>{pkg.ctaText}</span>
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* =========================================================================
            3. SPEC MATRIX
            ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-lg sm:text-xl text-slate-900">
                Tarife im Direktvergleich
              </h3>
              <p className="text-sm text-slate-500">
                Alle Konditionen auf einen Blick
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowComparison(!showComparison)}
              className="text-sm font-bold text-primary hover:text-primary/80 transition flex items-center gap-1.5 cursor-pointer py-2 px-3.5 rounded-xl bg-sky-50"
            >
              <span>{showComparison ? 'Ausblenden' : 'Details einblenden'}</span>
              {showComparison ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick Key Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center border-t border-slate-100 pt-4">
            <div className="p-3.5 bg-slate-50 rounded-2xl">
              <span className="text-xs text-slate-500 block uppercase font-bold mb-0.5">Einzelbesuch</span>
              <strong className="text-slate-900 text-base sm:text-lg block">14 €</strong>
              <span className="text-xs text-slate-500">2 Std. Spielzeit</span>
            </div>
            <div className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-2xl">
              <span className="text-xs text-primary block uppercase font-bold mb-0.5">10er-Pass</span>
              <strong className="text-slate-900 text-base sm:text-lg block">120 €</strong>
              <span className="text-xs text-emerald-600 font-bold">12 € / Besuch</span>
            </div>
            <div className="p-3.5 bg-rose-50/70 rounded-2xl">
              <span className="text-xs text-rose-700 block uppercase font-bold mb-0.5">Geburtstag</span>
              <strong className="text-slate-900 text-base sm:text-lg block">ab 250 €</strong>
              <span className="text-xs text-slate-500">8 Kids inkl.</span>
            </div>
          </div>

          {/* Expandable Deep Specs */}
          {showComparison && (
            <div className="mt-5 pt-5 border-t border-slate-100 divide-y divide-slate-100 text-sm sm:text-base text-slate-700 animate-fadeIn">
              <div className="py-3 flex justify-between items-center">
                <span className="font-medium text-slate-500">Begleitpersonen:</span>
                <span className="font-bold text-emerald-700">2 Erwachsene frei</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="font-medium text-slate-500">Übertragbarkeit:</span>
                <span className="font-bold text-slate-900">10er-Pass: auf Geschwister</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="font-medium text-slate-500">Salzraum-Option:</span>
                <span className="font-bold text-primary">+5 € (bei 10er-Pass 1x gratis)</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="font-medium text-slate-500">Stornierungsfrist:</span>
                <span className="font-bold text-slate-900">Kostenfrei bis 2h vor Beginn</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="font-medium text-slate-500">Zahlungsweise:</span>
                <span className="font-bold text-slate-900">Vor Ort (Bar, EC, Kreditkarte)</span>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            4. FREQUENT PRICING QUESTIONS
            ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-lg sm:text-xl text-slate-900 mb-4 flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-primary" />
            <span>Häufige Fragen zu den Preisen</span>
          </h3>

          <div className="space-y-3">
            {[
              {
                q: 'Muss ich vorab online bezahlen?',
                a: 'Nein! Deine Online-Reservierung sichert dir den garantierten Einlass. Die Bezahlung erfolgt bequem vor Ort beim Check-in bar oder bargeldlos (EC, Kreditkarte, Apple/Google Pay).',
              },
              {
                q: 'Was kostet der Eintritt für Babys unter 1 Jahr?',
                a: 'Babys unter 12 Monaten in Begleitung eines zahlenden Geschwisterkindes haben freien Eintritt. Kommt ein Baby als einziges Kind, gilt der reguläre Eintrittspreis (inkl. 2 Begleitpersonen).',
              },
              {
                q: 'Kann der 10er-Pass mit Geschwistern geteilt werden?',
                a: 'Ja, absolut! Der 10er-Block ist flexibel für die ganze Familie nutzbar und 12 Monate ab Ausstellungsdatum gültig.',
              },
              {
                q: 'Gilt im Spielbereich Sockenpflicht?',
                a: 'Ja, aus hygienischen Gründen gilt im gesamten Spiel- und Salzbereich strikte Sockenpflicht für Kinder und Erwachsene. Wir empfehlen Anti-Rutsch-Stoppersocken.',
              },
            ].map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="border border-slate-100 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => togglePricingFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-slate-800 flex items-center justify-between gap-3 hover:bg-slate-50 transition cursor-pointer min-h-[52px]"
                  >
                    <span>{item.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-sm sm:text-base">
            <span className="text-slate-500">Weitere Fragen zum Konzept?</span>
            <Link to="/faq" className="font-bold text-primary hover:underline flex items-center gap-1.5">
              <span>Zum vollständigen FAQ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PricingPage;
