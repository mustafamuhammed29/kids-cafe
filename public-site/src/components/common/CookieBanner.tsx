import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

interface CookieBannerProps {
  onOpenDatenschutz: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenDatenschutz }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('haven_kids_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = (type: 'all' | 'essential') => {
    localStorage.setItem('haven_kids_cookie_consent', type);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie-Einwilligung"
      className="fixed bottom-20 md:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-dark text-white p-5 rounded-3xl shadow-float border border-gray-800 animate-fadeIn"
    >
      <div className="flex items-start gap-3.5 mb-3">
        <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-base text-white">Privatsphäre &amp; Cookies</h3>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mt-1">
            Wir nutzen essenzielle Cookies, um dir ein reibungsloses Reservierungserlebnis zu ermöglichen. Keine invasiven Werbetracker.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-800">
        <button
          type="button"
          onClick={onOpenDatenschutz}
          className="text-xs text-accent hover:underline font-semibold cursor-pointer"
        >
          Datenschutz
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleAccept('essential')}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gray-800 text-gray-200 hover:bg-gray-700 transition cursor-pointer min-h-[38px]"
          >
            Nur essenzielle
          </button>
          <button
            type="button"
            onClick={() => handleAccept('all')}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-primary hover:bg-primary/90 text-white transition shadow-soft cursor-pointer min-h-[38px]"
          >
            Akzeptieren
          </button>
        </div>
      </div>
    </aside>
  );
};
