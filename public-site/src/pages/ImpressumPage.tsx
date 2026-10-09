import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scale, FileText, ArrowLeft, Building2, Phone } from 'lucide-react';
import { BUSINESS_INFO } from '../data/mockData';
import { getBusinessSettings, type BusinessSettings } from '../services/contentService';
import { usePageSeo } from '../hooks/usePageSeo';

export const ImpressumPage: React.FC = () => {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    getBusinessSettings().then((data) => setSettings(data));
  }, []);

  usePageSeo({
    title: `Impressum | ${settings?.name || BUSINESS_INFO.name}`,
    description: `Gesetzliche Anbieterkennzeichnung und Pflichtangaben gemäß § 5 DDG von ${settings?.name || BUSINESS_INFO.name}. Angaben zu Inhaber, Kontakt und Aufsichtsbehörde.`,
    canonicalPath: '/impressum',
  });

  const companyName = settings?.companyLegalName || settings?.name || BUSINESS_INFO.name;
  const owner = settings?.ownerName || BUSINESS_INFO.owner;
  const address = settings?.legalAddress || settings?.address || BUSINESS_INFO.address;
  const phone = settings?.phone || BUSINESS_INFO.phone;
  const phoneClean = settings?.phoneClean || BUSINESS_INFO.phoneClean;
  const email = settings?.email || BUSINESS_INFO.email;
  const taxId = settings?.taxId || 'DE (Beantragt / in Zuteilung)';
  const taxNumber = settings?.taxNumber;
  const registerCourt = settings?.registerCourt;
  const registerNumber = settings?.registerNumber;
  const authority = settings?.regulatoryAuthority;
  const insurance = settings?.liabilityInsurance;
  const disputeNotice = settings?.disputeResolutionNotice;
  const additionalNotice = settings?.additionalLegalNotice;

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
              <h2 className="font-extrabold text-base text-dark flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                Anbieterkennzeichnung
              </h2>
              <p>
                <strong className="text-dark font-bold">{companyName}</strong><br />
                Inhaber / Vertretungsberechtigt: {owner}<br />
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition underline decoration-dotted"
                  title="In Google Maps öffnen"
                >
                  {address}
                </a>
              </p>

              <h2 className="font-extrabold text-base text-dark pt-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                Kontakt
              </h2>
              <p>
                Telefon: <a href={`tel:${phoneClean}`} className="text-primary hover:underline">{phone}</a><br />
                E-Mail: <a href={`mailto:${email}`} className="text-primary hover:underline">{email}</a>
              </p>

              <h2 className="font-extrabold text-base text-dark pt-2">
                Umsatzsteuer-Identifikationsnummer (USt-IdNr.)
              </h2>
              <p>
                {taxId}
                {taxNumber && <><br /><span className="text-xs text-gray-500">Steuernummer: {taxNumber}</span></>}
              </p>

              {(registerCourt || registerNumber) && (
                <>
                  <h2 className="font-extrabold text-base text-dark pt-2">
                    Registereintrag
                  </h2>
                  <p>
                    {registerCourt && <>Registergericht: {registerCourt}<br /></>}
                    {registerNumber && <>Registernummer: {registerNumber}</>}
                  </p>
                </>
              )}

              {authority && (
                <>
                  <h2 className="font-extrabold text-base text-dark pt-2">
                    Zuständige Aufsichtsbehörde
                  </h2>
                  <p>{authority}</p>
                </>
              )}

              {insurance && (
                <>
                  <h2 className="font-extrabold text-base text-dark pt-2">
                    Berufshaftpflichtversicherung
                  </h2>
                  <p>{insurance}</p>
                </>
              )}

              <h2 className="font-extrabold text-base text-dark pt-2">
                Verbraucherstreitbeilegung
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                {disputeNotice || (
                  <>
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
                  </>
                )}
              </p>

              {additionalNotice && (
                <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
                  <strong className="block font-bold mb-1">Besondere Hinweise &amp; Hausordnung:</strong>
                  <span>{additionalNotice}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpressumPage;
