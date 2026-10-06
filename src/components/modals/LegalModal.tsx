import React, { useState, useId } from 'react';
import { X, Shield, FileText, Scale } from 'lucide-react';
import { BUSINESS_INFO } from '../../data/mockData';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'impressum' | 'datenschutz' | 'agb';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'impressum',
}) => {
  const [activeTab, setActiveTab] = useState<'impressum' | 'datenschutz' | 'agb'>(initialTab);
  const titleId = useId();

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#183D3D] text-white flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#93B1A6]" />
            <h2 id={titleId} className="font-extrabold text-base text-white">
              Rechtliche Hinweise & Transparenz
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-3 gap-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('impressum')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 min-h-[44px] ${
              activeTab === 'impressum'
                ? 'border-[#5C8374] text-[#183D3D]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Impressum</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('datenschutz')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 min-h-[44px] ${
              activeTab === 'datenschutz'
                ? 'border-[#5C8374] text-[#183D3D]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Datenschutzerklärung (DSGVO)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('agb')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 min-h-[44px] ${
              activeTab === 'agb'
                ? 'border-[#5C8374] text-[#183D3D]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>AGB & Besuchsregeln</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto text-xs sm:text-sm text-gray-700 space-y-5 leading-relaxed">
          {/* TAB 1: IMPRESSUM */}
          {activeTab === 'impressum' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="font-extrabold text-base text-[#183D3D]">
                Angaben gemäß § 5 TMG / DDG
              </h3>
              <p>
                <strong>{BUSINESS_INFO.name}</strong><br />
                Inhaber: {BUSINESS_INFO.owner}<br />
                {BUSINESS_INFO.address}<br />
                Deutschland
              </p>
              <p>
                <strong>Kontakt:</strong><br />
                Telefon: {BUSINESS_INFO.phone}<br />
                E-Mail: {BUSINESS_INFO.email}
              </p>
              <p>
                <strong>Umsatzsteuer-Identifikationsnummer (USt-IdNr.):</strong><br />
                DE (Beantragt / in Zuteilung)
              </p>
              <h4 className="font-bold text-gray-900 mt-4">Verbraucherstreitbeilegung:</h4>
              <p className="text-xs text-gray-500">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </div>
          )}

          {/* TAB 2: DATENSCHUTZ (GDPR) */}
          {activeTab === 'datenschutz' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="font-extrabold text-base text-[#183D3D]">
                Datenschutzerklärung (DSGVO)
              </h3>
              <p>
                Wir nehmen den Schutz deiner persönlichen Daten und der Daten deiner Kinder sehr ernst. Wir behandeln personenbezogene Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
              </p>
              <h4 className="font-bold text-gray-900">1. Verantwortliche Stelle</h4>
              <p>
                Verantwortlich für die Datenverarbeitung auf dieser Website ist {BUSINESS_INFO.name}, Inhaber: {BUSINESS_INFO.owner}, {BUSINESS_INFO.address}, E-Mail: {BUSINESS_INFO.email}.
              </p>
              <h4 className="font-bold text-gray-900">2. Serverstandort & Hosting in der EU</h4>
              <p>
                Unsere Datenbanken und Serverinfrastruktur werden ausschließlich in zertifizierten Rechenzentren innerhalb der Europäischen Union (Region Frankfurt am Main, Deutschland) gehostet.
              </p>
              <h4 className="font-bold text-gray-900">3. Datenerfassung bei Reservierungen</h4>
              <p>
                Wenn du eine Reservierung auf unserer Plattform tätigst, erheben wir Namen, E-Mail-Adresse, Telefonnummer, Anzahl und Alter der Kinder ausschließlich zum Zweck der Buchungsabwicklung, Kapazitätskontrolle und Terminbestätigung (Art. 6 Abs. 1 lit. b DSGVO).
              </p>
              <h4 className="font-bold text-gray-900">4. Keine Drittanbieter-Tracker ohne Einwilligung</h4>
              <p>
                Wir setzen keine invasiven Tracking-Cookies oder Werbepixel ohne deine ausdrückliche Einwilligung ein. Es werden technisch notwendige Session-Daten zur Gewährleistung des Reservierungsablaufs gespeichert.
              </p>
              <h4 className="font-bold text-gray-900">5. Recht auf Löschung (Art. 17 DSGVO)</h4>
              <p>
                Du hast jederzeit das Recht auf unentgeltliche Auskunft über deine gespeicherten personenbezogenen Daten sowie ein Recht auf Berichtigung oder Löschung. Wende dich hierzu formlos an: <a href={`mailto:${BUSINESS_INFO.email}`} className="text-[#5C8374] font-semibold underline">{BUSINESS_INFO.email}</a>.
              </p>
            </div>
          )}

          {/* TAB 3: AGB */}
          {activeTab === 'agb' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="font-extrabold text-base text-[#183D3D]">
                Allgemeine Geschäfts- &amp; Besuchsbedingungen (AGB)
              </h3>
              <h4 className="font-bold text-gray-900">1. Geltungsbereich</h4>
              <p>
                Diese Besuchsbedingungen gelten für den Aufenthalt und die Nutzung aller Spielbereiche, des Salzraums und des Cafés von {BUSINESS_INFO.name}.
              </p>
              <h4 className="font-bold text-gray-900">2. Aufsichtspflicht der Begleitpersonen</h4>
              <p>
                {BUSINESS_INFO.name} bietet keine Kinderbetreuung an. Die gesetzliche Aufsichtspflicht verbleibt während des gesamten Besuchs ausnahmslos bei den anwesenden Eltern oder erwachsenen Begleitpersonen.
              </p>
              <h4 className="font-bold text-gray-900">3. Sockenpflicht &amp; Hygiene</h4>
              <p>
                Im gesamten Spiel- und Salzbereich gilt ausnahmslos Sockenpflicht für Kinder und Erwachsene. Das Betreten mit Straßenschuhen oder barfuß ist untersagt.
              </p>
              <h4 className="font-bold text-gray-900">4. Gesundheit &amp; ansteckende Krankheiten</h4>
              <p>
                Zum Schutz aller Gäste ist Kindern und Begleitpersonen mit ansteckenden Krankheiten (z. B. Magen-Darm-Infekte, Fieber, ansteckender Husten) der Zutritt untersagt. Buchungen können kostenfrei verlegt werden.
              </p>
              <h4 className="font-bold text-gray-900">5. Hinweis zum Salzraum</h4>
              <p className="bg-sky-50 p-3 rounded-xl border border-sky-200 text-sky-900">
                {BUSINESS_INFO.medicalDisclaimer}
              </p>
              <h4 className="font-bold text-gray-900">6. Bezahlung &amp; Stornierung</h4>
              <p>
                Die Vergütung erfolgt vor Ort beim Check-in. Reservierungen können bis zu 2 Stunden vor Beginn kostenfrei storniert oder umgebucht werden.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#183D3D] hover:bg-black text-white px-6 py-2.5 rounded-full text-xs font-bold transition cursor-pointer min-h-[40px]"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
