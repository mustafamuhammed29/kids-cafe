import React, { useState, useId, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Shield, FileText, Scale } from 'lucide-react';
import { BUSINESS_INFO } from '../../data/mockData';
import { getBusinessSettings, type BusinessSettings } from '../../services/contentService';

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
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const titleId = useId();

  useEffect(() => {
    getBusinessSettings().then((data) => setSettings(data));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return typeof document !== 'undefined' ? createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-dark text-white flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            <h2 id={titleId} className="font-extrabold text-base text-white">
              Rechtliche Hinweise &amp; Transparenz
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="p-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher - Responsive 3-Column Grid without horizontal overflow */}
        <div className="grid grid-cols-3 border-b border-gray-200 bg-gray-50 px-2 sm:px-6 pt-2 sm:pt-3 gap-1 sm:gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('impressum')}
            className={`pb-3 px-1 sm:px-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 min-h-[44px] ${
              activeTab === 'impressum'
                ? 'border-primary text-dark'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Impressum</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('datenschutz')}
            className={`pb-3 px-1 sm:px-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 min-h-[44px] ${
              activeTab === 'datenschutz'
                ? 'border-primary text-dark'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Datenschutz</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('agb')}
            className={`pb-3 px-1 sm:px-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 min-h-[44px] ${
              activeTab === 'agb'
                ? 'border-primary text-dark'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">AGB &amp; Regeln</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto text-xs sm:text-sm text-gray-700 space-y-5 leading-relaxed">
          {/* TAB 1: IMPRESSUM */}
          {activeTab === 'impressum' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="font-extrabold text-base text-dark">
                Angaben gemäß § 5 DDG
              </h3>
              <p>
                <strong>{settings?.companyLegalName || settings?.name || BUSINESS_INFO.name}</strong><br />
                Inhaber / Vertretungsberechtigt: {settings?.ownerName || BUSINESS_INFO.owner}<br />
                {settings?.legalAddress || settings?.address || BUSINESS_INFO.address}<br />
                Deutschland
              </p>
              <p>
                <strong>Kontakt:</strong><br />
                Telefon: {settings?.phone || BUSINESS_INFO.phone}<br />
                E-Mail: {settings?.email || BUSINESS_INFO.email}
              </p>
              <p>
                <strong>Umsatzsteuer-Identifikationsnummer (USt-IdNr.):</strong><br />
                {settings?.taxId || 'DE (Beantragt / in Zuteilung)'}
                {settings?.taxNumber && <><br /><span className="text-xs text-gray-500">Steuernummer: {settings.taxNumber}</span></>}
              </p>
              {(settings?.registerCourt || settings?.registerNumber) && (
                <p>
                  <strong>Registereintrag:</strong><br />
                  {settings.registerCourt && <>{settings.registerCourt}<br /></>}
                  {settings.registerNumber && <>{settings.registerNumber}</>}
                </p>
              )}
              {settings?.regulatoryAuthority && (
                <p>
                  <strong>Aufsichtsbehörde:</strong><br />
                  {settings.regulatoryAuthority}
                </p>
              )}
              {settings?.liabilityInsurance && (
                <p>
                  <strong>Berufshaftpflichtversicherung:</strong><br />
                  {settings.liabilityInsurance}
                </p>
              )}
              <h4 className="font-bold text-gray-900 mt-4">Verbraucherstreitbeilegung:</h4>
              <p className="text-xs text-gray-500">
                {settings?.disputeResolutionNotice || (
                  'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.'
                )}
              </p>
              {settings?.additionalLegalNotice && (
                <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <strong className="block font-bold mb-0.5">Besondere Hinweise:</strong>
                  <span>{settings.additionalLegalNotice}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DATENSCHUTZ (GDPR) */}
          {activeTab === 'datenschutz' && (
            <div className="space-y-5 animate-fadeIn">
              <h3 className="font-extrabold text-base text-dark">
                Datenschutzerklärung (DSGVO, BDSG, TDDDG)
              </h3>
              <p>
                Wir nehmen den Schutz deiner persönlichen Daten und der Daten deiner Kinder sehr ernst. Wir behandeln personenbezogene Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-gray-900">1. Verantwortliche Stelle</h4>
                  <p>
                    Verantwortlich für die Datenverarbeitung auf dieser Website ist {BUSINESS_INFO.name}, Inhaber: {BUSINESS_INFO.owner}, {BUSINESS_INFO.address}, E-Mail: {BUSINESS_INFO.email}, Telefon: {BUSINESS_INFO.phone}.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">2. Bereitstellung der Website &amp; Server-Logfiles</h4>
                  <p>
                    Beim Aufrufen unserer Website werden automatisch Server-Logfiles erfasst (IP-Adresse, Zeitstempel, Browser/OS, übertragene Datenmenge). Zweck ist die technische Bereitstellung und Stabilität der Website (Art. 6 Abs. 1 lit. f DSGVO). Speicherdauer: maximal 14 Tage.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">3. Datenbank &amp; Backend (Supabase)</h4>
                  <p>
                    Als Datenbank- und Backend-Infrastruktur nutzen wir Supabase Inc. (ISO-zertifiziertes Rechenzentrum in der Region Frankfurt am Main, Deutschland / EU). Rechtsgrundlage: Art. 6 Abs. 1 lit. b und lit. f DSGVO. Auftragsverarbeitungsvertrag (AVV) mit EU-Standardvertragsklauseln liegt vor.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">4. Buchungsformular &amp; Reservierungsdaten</h4>
                  <p>
                    Wir erfassen Name, E-Mail-Adresse, Telefonnummer sowie Anzahl und Alter der Kinder ausschließlich zur Buchungsabwicklung, Kapazitätskontrolle und Bestätigung (Art. 6 Abs. 1 lit. b DSGVO). Speicherung erfolgt bis zur Abwicklung bzw. Ablauf gesetzlicher steuerrechtlicher Aufbewahrungsfristen.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">5. Kontaktformular</h4>
                  <p>
                    Deine Angaben aus dem Kontaktformular verarbeiten wir zur Beantwortung deiner Anfrage (Art. 6 Abs. 1 lit. a [Einwilligung via Checkbox] und lit. b DSGVO).
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">6. Stornierungs-Token</h4>
                  <p>
                    Für die kundenfreundliche Stornierung ohne Account-Zwang generieren wir einen zufälligen UUID-v4-Token. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO. Der Token verfällt nach Ablauf der Buchung.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">7. E-Mail-Versand von Buchungsbestätigungen</h4>
                  <p>
                    Transaktionale Buchungs- und Stornierungs-E-Mails versenden wir über Resend Inc. (EU-Serverinfrastruktur, AVV/SCCs) auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">8. WhatsApp-Schnellkontakt</h4>
                  <p>
                    Die Kontaktaufnahme via WhatsApp (WhatsApp Ireland Ltd.) erfolgt rein freiwillig (Art. 6 Abs. 1 lit. a / lit. f DSGVO). Bei Klick auf den Link wirst du zu WhatsApp weitergeleitet.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">9. Externe Links zu Google Maps</h4>
                  <p>
                    Wir binden keine dynamischen Google Maps iFrames ein. Es handelt sich um reine Hyperlinks, die erst bei aktiver Anwahl durch den Nutzer zu Google weiterleiten.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">10. Spam- &amp; Bot-Schutz (Cloudflare Turnstile)</h4>
                  <p>
                    Zum Schutz der Formulare setzen wir die datenschutzfreundliche Lösung Cloudflare Turnstile ein (Art. 6 Abs. 1 lit. f DSGVO, AVV/SCCs).
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">11. Cookies &amp; Lokale Speicherung</h4>
                  <p>
                    Wir setzen ausschließlich technisch notwendige Speicherungen (Session-Status, Cookie-Entscheidung) gem. § 25 Abs. 2 TDDDG ein. Keine invasiven Werbe- oder Tracking-Cookies ohne Einwilligung.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">12. Deine Betroffenenrechte (Art. 15–21 DSGVO)</h4>
                  <p>
                    Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Wende dich formlos an: {BUSINESS_INFO.email}. Zuständige Aufsichtsbehörde: Berliner Beauftragte für Datenschutz und Informationsfreiheit.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AGB */}
          {activeTab === 'agb' && (
            <div className="space-y-5 animate-fadeIn">
              <h3 className="font-extrabold text-base text-dark">
                Allgemeine Geschäfts- &amp; Besuchsbedingungen (AGB)
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-gray-900">1. Geltungsbereich</h4>
                  <p>
                    Diese AGB gelten für alle Verträge, Reservierungen und den gesamten Aufenthalt in den Räumlichkeiten von {BUSINESS_INFO.name} (Inhaber: {BUSINESS_INFO.owner}, {BUSINESS_INFO.address}).
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">2. Vertragsschluss &amp; Reservierung</h4>
                  <p>
                    Mit Absenden des Buchungsformulars gibt der Kunde ein verbindliches Reservierungsangebot ab. Der Vertrag kommt mit Erhalt der Buchungsbestätigung per E-Mail zustande.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">3. Preise &amp; Zahlungsmodalitäten</h4>
                  <p>
                    Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer. Bei Standard-Besuchen erfolgt die Zahlung vor Ort beim Check-in bar oder per Karte.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">4. Stornierungsbedingungen &amp; Fristen</h4>
                  <p>
                    • Standard-Einzelbesuche &amp; 10er-Block-Reservierungen können bis zu <strong>genau 2 Stunden vor Beginn</strong> kostenfrei online über den Token-Link storniert werden. Eine automatisierte Umbuchungs- bzw. Terminverschiebungsfunktion besteht nicht; nach Stornierung kann ein neuer Termin gebucht werden.<br />
                    • Für Kindergeburtstage und Gruppenfeiern gilt eine Stornierungsfrist von mindestens 48 Stunden vor Veranstaltungsbeginn in Textform.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">5. Gesundheitsschutz &amp; Infektionsausschluss</h4>
                  <p>
                    Kindern und Begleitpersonen mit akuten, ansteckenden Infektionskrankheiten (z. B. Fieber, Magen-Darm, ansteckender Husten) ist der Zutritt untersagt.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">6. Keine Kinderbetreuung &amp; Aufsichtspflicht</h4>
                  <p>
                    {BUSINESS_INFO.name} bietet keine Kinderbetreuung an. Die gesetzliche Aufsichtspflicht (§ 832 BGB) verbleibt während des gesamten Aufenthalts lückenlos bei den anwesenden Eltern bzw. erwachsenen Begleitpersonen.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">7. Altersbegrenzung</h4>
                  <p>
                    Die Spielbereiche sind für Babys, Kleinkinder und Kinder bis 8 Jahre ausgelegt.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">8. Sockenpflicht &amp; Hygiene</h4>
                  <p>
                    Im gesamten Spielbereich und Salzraum gilt strikte Sockenpflicht (vorzugsweise Anti-Rutsch-Socken) für Kinder und Erwachsene. Straßenschuhe und Barfußlaufen sind untersagt.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">9. Haftungsbeschränkung</h4>
                  <p>
                    Haftung besteht unbeschränkt für Vorsatz, grobe Fahrlässigkeit und Körperschäden. Für einfache Fahrlässigkeit haftet das Café nur bei Verletzung von Kardinalpflichten. Für mitgebrachte Wertsachen und Garderobe wird keine Haftung übernommen.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">10. Hausrecht &amp; Verweisung</h4>
                  <p>
                    Das Personal übt das Hausrecht aus. Bei groben Regelverstößen kann ein sofortiger Hausverweis ohne Erstattungsanspruch ausgesprochen werden.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">11. Mitnahme von Speisen</h4>
                  <p>
                    Mitgebrachte Speisen und Getränke sind nicht gestattet (ausgenommen Babynahrung).
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">12. Salzraum-Hinweis</h4>
                  <p className="bg-sky-50 p-3 rounded-xl border border-sky-200 text-sky-900 text-xs">
                    {BUSINESS_INFO.medicalDisclaimer}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-dark hover:bg-dark/90 text-white px-6 py-2.5 rounded-full text-xs font-bold transition cursor-pointer min-h-[40px] shadow-soft"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;
};
