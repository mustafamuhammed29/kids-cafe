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
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#183D3D] text-white p-5 rounded-3xl shadow-2xl border border-gray-700/60 animate-fadeIn"
    >
      <div className="flex items-start gap-3.5 mb-3">
        <div className="w-8 h-8 rounded-xl bg-[#93B1A6]/20 flex items-center justify-center text-[#93B1A6] shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-white">Privatsphäre & Cookies</h3>
          <p className="text-xs text-gray-300 leading-relaxed mt-1">
            Wir nutzen essenzielle Cookies, um dir ein reibungsloses Reservierungserlebnis zu ermöglichen. Keine invasiven Werbetracker.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-gray-700/60">
        <button
          type="button"
          onClick={onOpenDatenschutz}
          className="text-[11px] text-[#FFD3B6] hover:underline"
        >
          Datenschutz lesen
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleAccept('essential')}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-800 text-gray-200 hover:bg-gray-700 transition"
          >
            Nur essenzielle
          </button>
          <button
            type="button"
            onClick={() => handleAccept('all')}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#5C8374] text-white hover:bg-[#93B1A6] transition shadow-xs"
          >
            Akzeptieren
          </button>
        </div>
      </div>
    </aside>
  );
};
