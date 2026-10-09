import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { BUSINESS_INFO } from '../data/mockData';
import { getBusinessSettings, type BusinessSettings } from '../services/contentService';
import { usePageSeo } from '../hooks/usePageSeo';

export const DatenschutzPage: React.FC = () => {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    getBusinessSettings().then((data) => setSettings(data));
  }, []);

  const companyName = settings?.companyLegalName || settings?.name || BUSINESS_INFO.name;
  const owner = settings?.ownerName || BUSINESS_INFO.owner;
  const address = settings?.legalAddress || settings?.address || BUSINESS_INFO.address;
  const email = settings?.email || BUSINESS_INFO.email;
  const phone = settings?.phone || BUSINESS_INFO.phone;
  const phoneClean = settings?.phoneClean || BUSINESS_INFO.phoneClean;
  const dpo = settings?.privacyDpoContact;
  const customText = settings?.privacyCustomText;

  usePageSeo({
    title: `Datenschutzerklärung | ${companyName}`,
    description: `Informationen zur Verarbeitung personenbezogener Daten gemäß EU-DSGVO, BDSG und § 25 TDDDG im ${companyName}.`,
    canonicalPath: '/datenschutz',
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
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">Datenschutzerklärung</h1>
                <span className="text-xs text-gray-400">Transparenz gemäß DSGVO (EU-DSGVO)</span>
              </div>
            </div>
          </div>

          {/* Quick Nav Pills */}
          <div className="flex gap-2 p-4 bg-gray-50 border-b border-gray-200/80 overflow-x-auto text-xs font-bold">
            <Link
              to="/impressum"
              className="px-4 py-2 rounded-full bg-white text-gray-600 hover:text-dark border border-gray-200 transition"
            >
              Impressum
            </Link>
            <span className="px-4 py-2 rounded-full bg-dark text-white shadow-xs">
              Datenschutzerklärung
            </span>
            <Link
              to="/agb"
              className="px-4 py-2 rounded-full bg-white text-gray-600 hover:text-dark border border-gray-200 transition"
            >
              AGB &amp; Besuchsregeln
            </Link>
          </div>

          {/* Content Body */}
          <div className="p-8 sm:p-10 text-sm text-gray-700 space-y-6 leading-relaxed">
            {customText ? (
              <div className="whitespace-pre-line leading-relaxed text-gray-800 space-y-4">
                {customText}
              </div>
            ) : (
              <>
                <p>
                  Wir nehmen den Schutz deiner persönlichen Daten und der Daten deiner Kinder sehr ernst. Wir behandeln personenbezogene Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften (EU-DSGVO, BDSG, TDDDG) sowie dieser Datenschutzerklärung.
                </p>

                <div className="space-y-6">
                  <div>
                    <h2 className="font-extrabold text-base text-dark mb-1.5">
                      1. Verantwortliche Stelle
                    </h2>
                    <p>
                      Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br />
                      <strong>{companyName}</strong><br />
                      Inhaber: {owner}<br />
                      {address}<br />
                      E-Mail: <a href={`mailto:${email}`} className="text-primary hover:underline font-medium">{email}</a><br />
                      Telefon: <a href={`tel:${phoneClean}`} className="text-primary hover:underline font-medium">{phone}</a>
                      {dpo && (
                        <>
                          <br />
                          <strong>Datenschutzbeauftragter / Datenschutz-Kontakt:</strong> {dpo}
                        </>
                      )}
                    </p>
                  </div>

              <div>
                <h2 className="font-extrabold text-base text-dark mb-1.5">
                  2. Bereitstellung der Website &amp; Server-Logfiles
                </h2>
                <p>
                  Beim Aufrufen unserer Website erfasst der Webserver automatisch technische Informationen (sogenannte Server-Logfiles), darunter: IP-Adresse des anfragenden Geräts, Datum und Uhrzeit des Zugriffs, übertragene Datenmenge, Name der abgerufenen Datei, Browsertyp/-version sowie Betriebssystem.<br />
                  <strong>Zweck &amp; Rechtsgrundlage:</strong> Die vorübergehende Speicherung der IP-Adresse dient der Auslieferung der Website an dein Endgerät sowie der Systemsicherheit und Missbrauchsabwehr. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem stabilen, sicheren Betrieb).<br />
                  <strong>Speicherdauer:</strong> Server-Logfiles werden nach maximal 14 Tagen automatisch gelöscht, sofern keine sicherheitsrelevanten Vorfälle eine längere Aufbewahrung erfordern.
                </p>
              </div>

              <div>
                <h2 className="font-extrabold text-base text-dark mb-1.5">
                  3. Datenbank- &amp; Backend-Infrastruktur (Supabase)
                </h2>
                <p>
                  Für das Backend, die Datenbank und API-Funktionen nutzen wir Dienste von Supabase Inc. (970 Toa Payoh North #07-04, Singapur / Supabase EU Services). Die Datenhaltung erfolgt in ISO-zertifizierten Rechenzentren innerhalb der Europäischen Union (Region Frankfurt am Main, Deutschland).<br />
                  <strong>Zweck &amp; Rechtsgrundlage:</strong> Sichere Persistierung und Verarbeitung von Reservierungen und Zeitslot-Verfügbarkeiten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und Art. 6 Abs. 1 lit. f DSGVO (effizientes technisches Plattform-Management). Mit dem Anbieter besteht ein Auftragsverarbeitungsvertrag (AVV/DPA) auf Basis der EU-Standardvertragsklauseln (SCCs).
                </p>
              </div>

              <div>
                <h2 className="font-extrabold text-base text-dark mb-1.5">
                  4. Buchungsformular &amp; Reservierungsabwicklung
                </h2>
                <p>
                  Wenn du über unser Buchungssystem einen Spiel- oder Salzraum-Termin reservierst, erheben wir folgende Pflichtangaben: Name des Elternteils, E-Mail-Adresse, Telefonnummer, Anzahl der Kinder, Alter der Kinder, Anzahl der erwachsenen Begleitpersonen sowie optionale Sonderwünsche.<br />
                  <strong>Zweck:</strong> Buchungsbestätigung, Kapazitätskontrolle (Vermeidung von Überfüllung), Einlasskontrolle vor Ort und Kontaktaufnahme bei unvorhergesehenen Terminänderungen.<br />
                  <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Erfüllung eines Vertrages bzw. Durchführung vorvertraglicher Maßnahmen).<br />
                  <strong>Speicherdauer:</strong> Reservierungsdaten werden nach dem Besuch gelöscht, es sei denn, gesetzliche steuer- oder handelsrechtliche Aufbewahrungspflichten (§ 147 AO, § 257 HGB) erfordern eine längere Aufbewahrung.
                </p>
              </div>

              <div>
                <h2 className="font-extrabold text-base text-dark mb-1.5">
                  5. Kontaktformular &amp; E-Mail-Kommunikation
                </h2>
                <p>
                  Bei Anfragen über unser Kontaktformular oder per E-Mail verarbeiten wir deine Angaben (Name, E-Mail-Adresse, Telefonnummer, Betreff, Nachrichteninhalt) zur Bearbeitung deiner Anfrage und für etwaige Anschlussfragen.<br />
                  <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (deine ausdrückliche Einwilligung durch Aktivieren des Pflicht-Kontrollkästchens) sowie Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Anfragen zu Feiern oder Gruppen-Events).<br />
                  <strong>Speicherdauer:</strong> Die Daten verbleiben bei uns, bis du uns zur Löschung aufforderst, deine Einwilligung widerrufst oder der Zweck für die Datenspeicherung entfällt.
                </p>
              </div>

              <div>
                <h2 className="font-extrabold text-base text-dark mb-1.5">
                  6. Stornierungs-Token &amp; Kunden-Selbstverwaltung
                </h2>
                <p>
                  Um dir eine unkomplizierte Stornierung ohne Zwang zu einer Registrierung oder Passworterstellung zu ermöglichen, generiert unser System bei jeder Reservierung einen kryptografisch sicheren, zufälligen Token (UUID v4).<br />
                  <strong>Zweck &amp; Rechtsgrundlage:</strong> Verifizierung deiner Stornierungsberechtigung über den persönlichen Link in deiner Bestätigungs-E-Mail (Art. 6 Abs. 1 lit. b DSGVO). Der Token verfällt automatisch nach Ablauf der Buchung bzw. 30 Tagen.
                </p>
              </div>

              <div>
                <h2 className="font-extrabold text-base text-dark mb-1.5">
                  7. E-Mail-Versand von Buchungsbestätigungen
                </h2>
                <p>
                  Für den zuverlässigen Versand von transaktionalen Bestätigungs-E-Mails und Termininformationen nutzen wir einen spezialisierten E-Mail-Dienstleister (Resend Inc., 2261 Market Street #4061, San Francisco, CA 94114, USA / EU-Serverinfrastruktur).<br />
                  <strong>Zweck &amp; Rechtsgrundlage:</strong> Übermittlung der Buchungsreferenz, Termindetails und des Stornierungs-Links gem. Art. 6 Abs. 1 lit. b DSGVO. Ein Auftragsverarbeitungsvertrag (AVV) inklusive EU-Standardvertragsklauseln (SCCs) ist vereinbart.
                </p>
              </div>

              <div>
                <h2 className="font-extrabold text-base text-dark mb-1.5">
                  8. Kontaktaufnahme via WhatsApp
                </h2>
                <p>
                  Wir bieten dir die Möglichkeit, über den Messenger-Dienst WhatsApp mit uns in Kontakt zu treten (WhatsApp Ireland Limited, Merrion Road, Dublin 4, D04 X2K5, Irland). Die Nutzung ist rein freiwillig.<br />
                  <strong>Hinweis zur Datenübertragung:</strong> Wenn du den WhatsApp-Button anklickst, wirst du direkt zu WhatsApp weitergeleitet. WhatsApp verarbeitet deine Telefonnummer und ggf. Metadaten. Rechtsgrundlage ist deine freiwillige Kontaktaufnahme (Art. 6 Abs. 1 lit. a und lit. f DSGVO). Details zur Datenverarbeitung durch WhatsApp findest du in der Datenschutzrichtlinie von WhatsApp.
                </p>
              </div>

              <div>
                <h2 className="font-extrabold text-base text-dark mb-1.5">
                  9. Externe Links zu Kartendiensten (Google Maps)
                </h2>
                <p>
                  Unsere Website bindet <strong>keine dynamischen Google Maps iFrames</strong> ein, die bereits beim Laden der Seite automatisch deine IP-Adresse an Google übertragen würden. Stattdessen stellen wir lediglich einen externen Hyperlink bereit. Erst wenn du aktiv auf „In Google Maps öffnen“ klickst, wirst du auf die Website von Google (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland) weitergeleitet.
                </p>
              </div>

              <div>
                <h2 className="font-extrabold text-base text-dark mb-1.5">
                  10. Spam- &amp; Bot-Schutz (Cloudflare Turnstile)
                </h2>
                <p>
                  Zum Schutz unserer Reservierungs- und Kontaktformulare vor missbräuchlichen automatisierten Zugriffen und Spam setzen wir Cloudflare Turnstile ein (Cloudflare Inc., 101 Townsend St, San Francisco, CA 94107, USA).<br />
                  <strong>Funktionsweise:</strong> Turnstile prüft im Hintergrund, ob die Eingabe durch einen Menschen oder einen Bot erfolgt, ohne interaktive Bilderrätsel zu erzwingen. Dabei werden technische Telemetriedaten (z. B. Header, Browser-Eigenschaften) analysiert.<br />
                  <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Abwehr automatisierter Spam-Buchungen). Es besteht ein Auftragsverarbeitungsvertrag (AVV) auf Basis der EU-Standardvertragsklauseln.
                </p>
              </div>

              <div>
                <h2 className="font-extrabold text-base text-dark mb-1.5">
                  11. Cookies &amp; Lokale Speicherung (LocalStorage)
                </h2>
                <p>
                  Unsere Website verwendet technisch notwendige Speicherungen im Browser (z. B. Session-Status des Buchungsassistenten und Speicherung deiner Cookie-Banner-Entscheidung).<br />
                  <strong>Rechtsgrundlage:</strong> § 25 Abs. 2 Nr. 2 TDDDG i. V. m. Art. 6 Abs. 1 lit. f DSGVO. Es werden keine Werbe-Cookies, Retargeting-Pixel oder verhaltensbasierte Tracking-Tools ohne gesonderte Einwilligung gesetzt.
                </p>
              </div>

              <div>
                <h2 className="font-extrabold text-base text-dark mb-1.5">
                  12. Deine Rechte als betroffene Person (Art. 15–21 DSGVO)
                </h2>
                <p>
                  Du hast gegenüber uns folgende gesetzliche Rechte hinsichtlich deiner personenbezogenen Daten:<br />
                  • <strong>Recht auf Auskunft (Art. 15 DSGVO)</strong> über die von uns verarbeiteten Daten.<br />
                  • <strong>Recht auf Berichtigung (Art. 16 DSGVO)</strong> unrichtiger oder unvollständiger Daten.<br />
                  • <strong>Recht auf Löschung (Art. 17 DSGVO)</strong> („Recht auf Vergessenwerden“).<br />
                  • <strong>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</strong>.<br />
                  • <strong>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</strong>.<br />
                  • <strong>Recht auf Widerspruch (Art. 21 DSGVO)</strong> gegen Verarbeitungen auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.<br />
                  • <strong>Widerruf von Einwilligungen:</strong> Du kannst erteilte Einwilligungen (z. B. Marketing) jederzeit formlos mit Wirkung für die Zukunft per E-Mail an <a href={`mailto:${email}`} className="text-primary hover:underline font-semibold">{email}</a> widerrufen.<br />
                  • <strong>Beschwerderecht bei einer Aufsichtsbehörde (Art. 77 DSGVO):</strong> Zuständig für Berlin ist die Berliner Beauftragte für Datenschutz und Informationsfreiheit, Alt-Moabit 59-61, 10555 Berlin.
                </p>
              </div>
            </div>
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatenschutzPage;
