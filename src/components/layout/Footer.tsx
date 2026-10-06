import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Heart, Lock } from 'lucide-react';
import { BUSINESS_INFO } from '../../data/mockData';

interface FooterProps {
  onOpenLegal: (tab: 'impressum' | 'datenschutz' | 'agb') => void;
  onOpenBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal, onOpenBooking }) => {
  return (
    <footer className="bg-[#183D3D] text-gray-200 pt-16 pb-24 sm:pb-12 border-t-4 border-[#93B1A6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-4 lg:col-span-2">
            <Link to="/" className="inline-block">
              <img
                src="/assets/logo.svg"
                alt="Haven Kids Café Logo"
                className="h-10 w-auto brightness-0 invert opacity-95"
              />
            </Link>
            <p className="text-sm text-gray-300 leading-relaxed max-w-sm">
              Das liebevolle Familien-Spielcafé in Berlin. Pädagogisch wertvolles Holzspielzeug, entspannender Salzraum und Specialty Coffee für Eltern (Kinder von 0 bis 8 Jahren).
            </p>
            <div className="pt-1 flex gap-3">
              <a
                href={BUSINESS_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 text-xs font-semibold hover:bg-emerald-800/80 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp Service
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 tracking-wide uppercase">Navigation</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-300">
              <li>
                <Link to="/services" className="hover:text-[#93B1A6] transition-colors">
                  Angebote & Ausstattung
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-[#93B1A6] transition-colors">
                  Preise & Pakete
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-[#93B1A6] transition-colors">
                  Fotogalerie
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenBooking}
                  className="hover:text-[#93B1A6] transition-colors text-left font-semibold text-[#FFD3B6] cursor-pointer"
                >
                  Online reservieren
                </button>
              </li>
              <li>
                <Link to="/faq" className="hover:text-[#93B1A6] transition-colors">
                  Häufige Fragen (FAQ)
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#93B1A6] transition-colors">
                  Kontakt & Anfahrt
                </Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 tracking-wide uppercase">Öffnungszeiten</h3>
            <ul className="space-y-2 text-xs text-gray-300">
              {BUSINESS_INFO.hours.map((h, i) => (
                <li key={i} className="flex justify-between border-b border-gray-700/60 pb-1.5 gap-2">
                  <span className="text-gray-300">{h.days}</span>
                  <span className="font-semibold text-white whitespace-nowrap">{h.time}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-gray-400 mt-2.5 italic">
              Einlass nur mit Vorab-Reservierung.
            </p>
          </div>

          {/* Staff Login (Subtle) */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 tracking-wide uppercase">Für Mitarbeiter</h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link
                  to="/admin-login"
                  className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#93B1A6] transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Login</span>
                </Link>
              </li>
            </ul>

            <div className="mt-6 pt-4 border-t border-gray-700/60">
              <h4 className="text-xs font-semibold text-gray-300 mb-2">Standort</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                {BUSINESS_INFO.address}
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="border-t border-gray-700/70 pt-5 pb-5 text-xs text-gray-400 leading-relaxed">
          <p>
            <strong className="text-gray-300">Rechtlicher Hinweis:</strong> {BUSINESS_INFO.medicalDisclaimer}
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p className="flex items-center gap-1 text-center sm:text-left">
            &copy; 2026 {BUSINESS_INFO.name}. Alle Rechte vorbehalten. Gestaltet mit <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 inline" /> für Familien.
          </p>
          <div className="flex gap-5">
            <button
              type="button"
              onClick={() => onOpenLegal('impressum')}
              className="hover:text-[#93B1A6] transition-colors cursor-pointer"
            >
              Impressum
            </button>
            <button
              type="button"
              onClick={() => onOpenLegal('datenschutz')}
              className="hover:text-[#93B1A6] transition-colors cursor-pointer"
            >
              Datenschutz (DSGVO)
            </button>
            <button
              type="button"
              onClick={() => onOpenLegal('agb')}
              className="hover:text-[#93B1A6] transition-colors cursor-pointer"
            >
              AGB &amp; Regeln
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
