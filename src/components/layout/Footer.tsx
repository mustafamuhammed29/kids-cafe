import React from 'react';
import { Sparkles, MapPin, Phone, Mail, MessageCircle, Heart } from 'lucide-react';
import { BUSINESS_INFO } from '../../data/mockData';

interface FooterProps {
  onOpenLegal: (tab: 'impressum' | 'datenschutz' | 'agb') => void;
  onOpenBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal, onOpenBooking }) => {
  return (
    <footer className="bg-[#183D3D] text-gray-200 pt-16 pb-12 border-t-4 border-[#93B1A6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#93B1A6]/20 flex items-center justify-center text-[#FFD3B6]">
                <Sparkles className="w-5 h-5 text-[#93B1A6]" />
              </div>
              <span className="font-extrabold text-2xl text-white tracking-tight">
                Haven <span className="text-[#93B1A6]">Kids</span>
              </span>
            </div>
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
            <h3 className="text-white font-bold text-base mb-4 tracking-wide">Schnellzugriff</h3>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <a href="#rules" className="hover:text-[#93B1A6] transition-colors">
                  Konzept & Besuchsregeln
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#93B1A6] transition-colors">
                  Spielbereich, Salzraum & Café
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-[#93B1A6] transition-colors">
                  Eintrittspreise & 10er-Block
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenBooking}
                  className="hover:text-[#93B1A6] transition-colors text-left font-semibold text-[#FFD3B6]"
                >
                  Online-Reservierung
                </button>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#93B1A6] transition-colors">
                  Häufig gestellte Fragen (FAQ)
                </a>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 tracking-wide">Öffnungszeiten</h3>
            <ul className="space-y-2.5 text-sm text-gray-300">
              {BUSINESS_INFO.hours.map((h, i) => (
                <li key={i} className="flex justify-between border-b border-gray-700/60 pb-1.5 gap-2">
                  <span className="text-gray-300">{h.days}</span>
                  <span className="font-semibold text-white whitespace-nowrap">{h.time}</span>
                </li>
              ))}
            </ul>
            <p className="text-[12px] text-gray-400 mt-3 italic">
              Einlass nur mit Vorab-Reservierung zur Vermeidung von Überfüllung.
            </p>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 tracking-wide">Standort & Kontakt</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#93B1A6] shrink-0 mt-0.5" />
                <span>{BUSINESS_INFO.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#93B1A6] shrink-0" />
                <a href={`tel:${BUSINESS_INFO.phoneClean}`} className="hover:text-white transition-colors">
                  {BUSINESS_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#93B1A6] shrink-0" />
                <a href={`mailto:${BUSINESS_INFO.email}`} className="hover:text-white transition-colors">
                  {BUSINESS_INFO.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="border-t border-gray-700/70 pt-6 pb-6 text-xs text-gray-400 leading-relaxed">
          <p>
            <strong className="text-gray-300">Rechtlicher Hinweis:</strong> {BUSINESS_INFO.medicalDisclaimer}
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p className="flex items-center gap-1">
            &copy; 2026 {BUSINESS_INFO.name}. Alle Rechte vorbehalten. Gestaltet mit <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 inline" /> für Familien.
          </p>
          <div className="flex gap-6">
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
              AGB & Besuchsbedingungen
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
