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
} from 'lucide-react';
import { SERVICES } from '../data/mockData';
import type { ServiceItem } from '../types/booking';

interface PricingPageProps {
  onOpenBooking: (service?: ServiceItem) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onOpenBooking }) => {
  const [showComparison, setShowComparison] = useState(false);
  const navigate = useNavigate();

  const standardPackages = SERVICES.filter((s) => s.packageCategory === 'standard');
  const eventPackages = SERVICES.filter((s) => s.packageCategory !== 'standard');

  const handlePackageCta = (pkg: ServiceItem) => {
    if (pkg.ctaAction === 'book') {
      onOpenBooking(pkg);
    } else if (pkg.ctaAction === 'whatsapp') {
      const msg = encodeURIComponent(
        'Hallo, ich möchte eine Gruppenfeier anfragen.\nDatum: [DD.MM.YYYY]\nKinder: [Anzahl]\nNachricht: [Freitext]'
      );
      window.open(`https://wa.me/493012345678?text=${msg}`, '_blank');
    } else if (pkg.ctaAction === 'contact-form') {
      navigate(`/contact?subject=${encodeURIComponent(pkg.name)}`);
    }
  };

  return (
    <div className="pt-20 sm:pt-24 animate-fadeIn pb-16">
      {/* Header */}
      <div className="bg-[#183D3D] text-white py-12 sm:py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FFD3B6] bg-white/10 py-1 px-3.5 rounded-full inline-block mb-3">
            Transparente Familienpreise
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Preise & Pakete
          </h1>
          <p className="text-sm sm:text-base text-gray-200 max-w-xl mx-auto font-light leading-relaxed">
            Faire Tarife ohne Überraschungen. <strong>Der Eintritt für 2 erwachsene Begleitpersonen pro Kind ist immer kostenlos!</strong>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* SECTION 1: Standard Packages */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#183D3D]">
              Eintritt & Familienpässe
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Für regelmäßige Besuche und individuelle Auszeiten.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {standardPackages.map((srv) => {
              const isBestseller = srv.popular;

              return (
                <div
                  key={srv.id}
                  className={`rounded-3xl p-7 sm:p-8 transition-all duration-300 flex flex-col relative ${
                    isBestseller
                      ? 'bg-[#183D3D] text-white shadow-2xl border-2 border-[#93B1A6] lg:-translate-y-3 z-10'
                      : 'bg-white text-gray-800 shadow-md border border-gray-100 hover:-translate-y-1'
                  }`}
                >
                  {/* Bestseller Badge */}
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

                  {/* Price */}
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
                      {srv.slug === 'einzelbesuch' ? '/ 2 Std.' : ''}
                      {srv.slug === '10er-block' ? '/ 10 Besuche' : ''}
                      {srv.slug === 'kindergeburtstag' ? 'Basispreis' : ''}
                    </span>
                  </div>

                  {/* Features */}
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
                      onClick={() => handlePackageCta(srv)}
                      className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center gap-2 min-h-[44px] ${
                        isBestseller
                          ? 'bg-[#5C8374] hover:bg-[#93B1A6] text-white hover:shadow-lg'
                          : 'bg-gray-100 hover:bg-[#5C8374] hover:text-white text-[#183D3D]'
                      }`}
                    >
                      <span>{srv.ctaText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Salzraum Add-on callout */}
        <div className="max-w-4xl mx-auto bg-sky-50/70 rounded-3xl p-6 sm:p-8 border border-sky-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 mb-20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-600 shrink-0">
              <Wind className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="font-bold text-base sm:text-lg text-[#183D3D]">
                  Salzraum-Erlebnis (45 Min) zubuchen
                </h4>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                  + 5 € pro Kind
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Kombiniere jeden Besuch mit einer regenerierenden Sitzung in unserem mikroklimatischen Trockensalzraum. Begleitpersonen frei, max. 8 Kinder je Runde.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenBooking(standardPackages[0])}
            className="shrink-0 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer whitespace-nowrap min-h-[44px]"
          >
            Kombi buchen
          </button>
        </div>

        {/* SECTION 2: NEW EVENT PACKAGES (Group, Kita, Corporate) */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5C8374] bg-[#93B1A6]/15 py-1 px-3.5 rounded-full inline-block mb-2">
              Große Gruppen & Firmen
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#183D3D]">
              Gruppen- & Event-Pakete
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl mx-auto">
              Für Kitas, Schulklassen, größere Familienfeiern und Unternehmen. Individuelle Angebote nach Maß.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {eventPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-3xl p-7 sm:p-8 border border-gray-200/90 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <div className="mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {pkg.subtitle}
                  </span>
                  <h3 className="text-2xl font-extrabold text-[#183D3D] mt-2.5 mb-1">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-gray-500">{pkg.tagline}</p>
                </div>

                {/* Price: "Auf Anfrage" (Strictly NO price number) */}
                <div className="py-4 my-2 border-y border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Tarif:</span>
                  <span className="text-xl font-extrabold text-[#183D3D] bg-gray-50 px-3.5 py-1 rounded-xl border border-gray-200">
                    {pkg.priceLabel}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
                  {pkg.description}
                </p>

                <ul className="space-y-2.5 mb-8 text-xs text-gray-700">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#5C8374] shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <button
                    type="button"
                    onClick={() => handlePackageCta(pkg)}
                    className="w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm bg-[#183D3D] hover:bg-black text-white transition shadow-sm flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                  >
                    {pkg.ctaAction === 'whatsapp' && <MessageCircle className="w-4 h-4 text-emerald-400" />}
                    {pkg.ctaAction === 'contact-form' && <Mail className="w-4 h-4 text-[#FFD3B6]" />}
                    {pkg.ctaAction === 'book' && <Calendar className="w-4 h-4" />}
                    <span>{pkg.ctaText}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: Detailed Comparison Table Toggle */}
        <div className="text-center mb-16">
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
                    <td className="py-3 px-4 text-center text-gray-600">Vor Ort am Tag des Events</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SECTION 4: FAQ Preview Link */}
        <div className="bg-gray-50 rounded-3xl p-6 sm:p-8 text-center border border-gray-200/80 max-w-2xl mx-auto">
          <h4 className="font-bold text-base text-[#183D3D] mb-1">
            Hast du Fragen zur Abrechnung oder Stornierung?
          </h4>
          <p className="text-xs text-gray-600 mb-4">
            Besuche unsere FAQ-Seite für alle Details zu Krankheitsfällen, Kartenzahlung und Sockenpflicht.
          </p>
          <Link
            to="/faq"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C8374] hover:underline"
          >
            <span>Zu den häufig gestellten Fragen</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
