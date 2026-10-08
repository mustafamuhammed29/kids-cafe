import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { BUSINESS_INFO } from '../../data/mockData';
import { getBusinessSettings, type BusinessSettings } from '../../services/contentService';

interface FooterProps {
  onOpenBooking?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    getBusinessSettings().then((data) => {
      if (data) setSettings(data);
    });
  }, []);

  const businessName = settings?.name || BUSINESS_INFO.name;
  const address = settings?.address || BUSINESS_INFO.address;
  const phone = settings?.phone || BUSINESS_INFO.phone;
  const phoneClean = settings?.phoneClean || BUSINESS_INFO.phoneClean;
  const email = settings?.email || BUSINESS_INFO.email;
  const whatsappUrl = settings?.whatsappUrl || BUSINESS_INFO.whatsappUrl;
  const instagramUrl = settings?.instagramUrl || 'https://instagram.com/havenkidscafe';
  const mapsUrl = settings?.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(address)}`;
  const hours = settings?.openingHours || BUSINESS_INFO.hours;
  const footerNotice = settings?.footerNotice || 'Der Wohlfühlort für freies Entfalten in Berlin: Pädagogischer Spielbereich für Kinder (0-8 Jahre), sanfter Salzraum und feiner Barista-Kaffee für Eltern.';

  return (
    <footer className="bg-dark text-gray-300 pt-16 pb-24 md:pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Col 1: Brand & Mission */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 mb-5 group cursor-pointer"
            aria-label="Zur Startseite von Haven Kids Café"
          >
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-2xl text-white tracking-tight">Haven <span className="text-primary">Kids</span></span>
          </Link>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            {footerNotice}
          </p>
          <div className="flex items-center gap-3">
            {/* Instagram */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Haven Kids Café auf Instagram"
              className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-colors border border-white/10 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Haven Kids Café per WhatsApp kontaktieren"
              className="w-11 h-11 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors border border-emerald-500/30 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Col 2: Navigation Links */}
        <div>
          <h4 className="text-white font-bold mb-5 text-base sm:text-lg">Navigation</h4>
          <ul className="space-y-2.5 font-medium text-sm text-gray-400">
            <li><Link to="/services" className="hover:text-primary transition-colors">Unsere Angebote</Link></li>
            <li><Link to="/pricing" className="hover:text-primary transition-colors">Eintritt &amp; Preise</Link></li>
            <li><Link to="/gallery" className="hover:text-primary transition-colors">Bildergalerie</Link></li>
            <li><Link to="/faq" className="hover:text-primary transition-colors">Häufige Fragen (FAQ)</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Kontakt &amp; Anfahrt</Link></li>
          </ul>
        </div>

        {/* Col 3: Öffnungszeiten */}
        <div>
          <h4 className="text-white font-bold mb-5 text-base sm:text-lg">Öffnungszeiten</h4>
          <ul className="space-y-2.5 font-medium text-sm text-gray-400">
            {hours.map((item, idx) => (
              <li key={idx} className="flex justify-between border-b border-white/5 pb-2">
                <span>{item.days}</span>
                <span className="text-white font-semibold">{item.time}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4: Direkter Kontakt & Anfahrt */}
        <div>
          <h4 className="text-white font-bold mb-5 text-base sm:text-lg">Kontakt &amp; Standort</h4>
          <ul className="space-y-3 font-medium text-sm text-gray-400">
            <li>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition flex items-start gap-2.5 group"
                title="In Google Maps öffnen"
              >
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span>{address}</span>
              </a>
            </li>
            <li>
              <a
                href={`tel:${phoneClean}`}
                className="hover:text-white transition flex items-center gap-2.5 group"
                title="Jetzt anrufen"
              >
                <Phone className="w-4 h-4 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                <span>{phone}</span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${email}`}
                className="hover:text-white transition flex items-center gap-2.5 group"
                title="E-Mail senden"
              >
                <Mail className="w-4 h-4 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                <span>{email}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="mt-14 pt-8 border-t border-white/10 text-center text-xs sm:text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto px-4 font-medium gap-4">
        <p>&copy; {new Date().getFullYear()} {businessName}. Alle Rechte vorbehalten.</p>
        <div className="space-x-6 flex flex-wrap justify-center gap-y-2 text-xs sm:text-sm">
          <Link to="/datenschutz" className="hover:text-white transition-colors cursor-pointer">Datenschutz</Link>
          <Link to="/impressum" className="hover:text-white transition-colors cursor-pointer">Impressum</Link>
          <Link to="/agb" className="hover:text-white transition-colors cursor-pointer">AGB</Link>
        </div>
      </div>
    </footer>
  );
};
