import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, FileText, ArrowLeft } from 'lucide-react';
import { BUSINESS_INFO } from '../data/mockData';
import { usePageSeo } from '../hooks/usePageSeo';

export const ImpressumPage: React.FC = () => {
  usePageSeo({
    title: 'Impressum | Haven Kids Café Berlin',
    description: 'Gesetzliche Anbieterkennzeichnung und Pflichtangaben gemäß § 5 DDG von Haven Kids Café Berlin. Angaben zu Inhaber, Kontakt und Aufsichtsbehörde.',
    canonicalPath: '/impressum',
  });

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20 px-4 animate-fadeIn">
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-dark transition mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zur Startseite</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-[2.5rem] shadow-float border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-dark text-white px-8 py-6 flex items-center justify-between border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">Impressum</h1>
                <span className="text-xs text-gray-400">Angaben gemäß § 5 DDG</span>
              </div>
            </div>
            <Scale className="w-6 h-6 text-gray-500 hidden sm:block" />
          </div>

          {/* Quick Nav Pills */}
          <div className="flex gap-2 p-4 bg-gray-50 border-b border-gray-200/80 overflow-x-auto text-xs font-bold">
            <span className="px-4 py-2 rounded-full bg-dark text-white shadow-xs">
              Impressum
            </span>
            <Link
              to="/datenschutz"
              className="px-4 py-2 rounded-full bg-white text-gray-600 hover:text-dark border border-gray-200 transition"
            >
              Datenschutzerklärung
            </Link>
            <Link
              to="/agb"
              className="px-4 py-2 rounded-full bg-white text-gray-600 hover:text-dark border border-gray-200 transition"
            >
              AGB &amp; Besuchsregeln
            </Link>
          </div>

          {/* Content Body */}
          <div className="p-8 sm:p-10 text-sm text-gray-700 space-y-6 leading-relaxed">
            <div className="space-y-4">
              <h2 className="font-extrabold text-base text-dark">
                Anbieterkennzeichnung
              </h2>
              <p>
                <strong>{BUSINESS_INFO.name}</strong><br />
                Inhaber: {BUSINESS_INFO.owner}<br />
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(BUSINESS_INFO.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition underline decoration-dotted"
                  title="In Google Maps öffnen"
                >
                  {BUSINESS_INFO.address}
                </a><br />
                Deutschland
              </p>

              <h2 className="font-extrabold text-base text-dark pt-2">
                Kontakt
              </h2>
              <p>
                Telefon: <a href={`tel:${BUSINESS_INFO.phoneClean}`} className="text-primary hover:underline">{BUSINESS_INFO.phone}</a><br />
                E-Mail: <a href={`mailto:${BUSINESS_INFO.email}`} className="text-primary hover:underline">{BUSINESS_INFO.email}</a>
              </p>

              <h2 className="font-extrabold text-base text-dark pt-2">
                Umsatzsteuer-Identifikationsnummer (USt-IdNr.)
              </h2>
              <p>
                DE (Beantragt / in Zuteilung)
              </p>

              <h2 className="font-extrabold text-base text-dark pt-2">
                Verbraucherstreitbeilegung
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
                <a
                  href="https://ec.europa.eu/consumers/odr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  https://ec.europa.eu/consumers/odr
                </a>.<br />
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpressumPage;
