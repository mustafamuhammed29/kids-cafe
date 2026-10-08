import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, ArrowLeft } from 'lucide-react';
import { BUSINESS_INFO } from '../data/mockData';
import { usePageSeo } from '../hooks/usePageSeo';

export const AgbPage: React.FC = () => {
  usePageSeo({
    title: 'AGB & Hausordnung | Haven Kids Café Berlin',
    description: 'Allgemeine Geschäftsbedingungen, Besuchsregeln, Aufsichtspflicht und Stornierungsbedingungen im Haven Kids Café Berlin.',
    canonicalPath: '/agb',
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
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">Allgemeine Geschäftsbedingungen</h1>
                <span className="text-xs text-gray-400">Besuchsbedingungen &amp; Hausregeln (AGB)</span>
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
            <Link
              to="/datenschutz"
              className="px-4 py-2 rounded-full bg-white text-gray-600 hover:text-dark border border-gray-200 transition"
            >
              Datenschutzerklärung
            </Link>
            <span className="px-4 py-2 rounded-full bg-dark text-white shadow-xs">
              AGB &amp; Besuchsregeln
            </span>
          </div>

          {/* Content Body */}
          <div className="p-8 sm:p-10 text-sm text-gray-700 space-y-6 leading-relaxed">
            <p>
              Willkommen im Haven Kids Café. Bitte lies dir unsere Allgemeinen Geschäfts-, Buchungs- und Besuchsbedingungen sorgfältig durch. Sie regeln das Vertragsverhältnis und sorgen für die Sicherheit aller großen und kleinen Gäste.
            </p>

            <div className="space-y-6">
              <div>
                <h2 className="font-extrabold text-base text-dark mb-1.5">
                  1. Geltungsbereich &amp; Vertragspartner
                </h2>
                <p>
                  Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge, Reservierungen und den gesamten Aufenthalt in den Räumlichkeiten von {BUSINESS_INFO.name} (Inhaber: {BUSINESS_INFO.owner}, {BUSINESS_INFO.address}). Mit Betreten der Räumlichkeiten oder Abschluss einer Online-Reservierung werden diese Bedingungen verbindlich anerkannt.
                </p>
              </div>

              <div>
                <h2 className="font-extrabold text-base text-dark mb-1.5">
                  2. Vertragsschluss &amp; Reservierungsprozess
                </h2>
                <p>
                  Die Präsentation unserer Leistungen auf der Website stellt kein bindendes Angebot dar. Durch Absenden des Buchungsformulars gibt der Kunde ein verbindliches Angebot zur Reservierung eines Besuchs-Zeitslots ab. Der Vertrag kommt mit der automatisierten Übermittlung der Buchungsbestätigung per E-Mail zustande.
                </p>
              </div>

              <div>
                <h2 className="font-extrabold text-base text-dark mb-1.5">
                  3. Preise, Steuern &amp; Zahlungsmodalitäten
                </h2>
                <p>
                  Alle angegebenen Preise sind Endpreise in Euro inklusive der jeweils geltenden gesetzlichen Mehrwertsteuer. Bei Standard-Besuchen erfolgt keine Online-Vorauszahlung; der Eintrittspreis wird vor Ort beim Check-in vor Betreten der Spielbereiche fällig. Wir akzeptieren Barzahlung, EC-/Girocard, gängige Kreditkarten sowie kontaktlose Zahlungsverfahren.
                </p>
              </div>

              <div>
                <h2 className="font-extrabold text-base text-dark mb-1.5">
                  4. Stornierungsbedingungen &amp; Fristen
                </h2>
                <p>
                  • <strong>Standard-Einzelbesuche &amp; 10er-Block-Reservierungen:</strong> Eine kostenfreie Stornierung ist bis zu <strong>genau 2 Stunden vor Beginn</strong> des gebuchten Zeitfensters über den persönlichen Stornierungs-Link aus der Bestätigungs-E-Mail möglich. Bei späterer Stornierung oder unangekündigtem Nichterscheinen behält sich das Café vor, den reservierten Platz nach 15 Minuten Verspätung für wartende Familien freizugeben. Eine automatisierte Umbuchungs- bzw. Terminverschiebungsfunktion besteht nicht; nach einer Stornierung kann jederzeit ein neuer freier Termin gebucht werden.<br />
                  • <strong>Kindergeburtstage &amp; Gruppenfeiern:</strong> Für exklusiv reservierte Geburtstagstische und Gruppen-Pakete mit gesonderter Vorbereitung gilt eine Stornierungsfrist von mindestens 48 Stunden vor Veranstaltungsbeginn in Textform (E-Mail oder WhatsApp).
                </p>
              </div>

              <div>
                <h2 className="font-extrabold text-base text-dark mb-1.5">
                  5. Gesundheitsschutz &amp; Infektionsausschluss
                </h2>
                <p>
                  Zum Schutz aller Kinder und Säuglinge ist Gästen mit akuten, ansteckenden Infektionskrankheiten (z. B. Fieber, Magen-Darm-Erkrankungen, ansteckender Husten, Bindehautentzündung) der Zutritt untersagt. Begleitpersonen sind verpflichtet, betroffene Reservierungen rechtzeitig innerhalb der 2-Stunden-Frist online zu stornieren.
                </p>
              </div>

              <div>
                <h2 className="font-extrabold text-base text-dark mb-1.5">
                  6. Keine Kinderbetreuung &amp; Gesetzliche Aufsichtspflicht
                </h2>
                <p>
                  {BUSINESS_INFO.name} ist ein familienorientiertes Spielcafé und bietet <strong>ausdrücklich keine Kinderbetreuung oder Beaufsichtigung</strong> an. Die gesetzliche Aufsichtspflicht (§ 832 BGB) verbleibt während des gesamten Aufenthalts lückenlos und uneingeschränkt bei den anwesenden Eltern bzw. den erwachsenen Begleitpersonen (Mindestalter 18 Jahre). Kinder dürfen die Räumlichkeiten zu keinem Zeitpunkt ohne Aufsichtsperson betreten oder verlassen.
                </p>
              </div>

              <div>
                <h2 className="font-extrabold text-base text-dark mb-1.5">
                  7. Altersbegrenzung &amp; Spielbereiche
                </h2>
                <p>
                  Die Spielbereiche sind speziell auf die motorischen und sensorischen Entwicklungsstufen von Babys, Kleinkindern und Kindern bis zum vollendeten 8. Lebensjahr ausgelegt. Ältere Geschwisterkinder sind als ruhige Begleitpersonen im Café-Bereich willkommen, dürfen jedoch Spielmodule für Kleinkinder nicht zweckentfremden.
                </p>
              </div>

              <div>
                <h2 className="font-extrabold text-base text-dark mb-1.5">
                  8. Hygiene, Sockenpflicht &amp; Sauberkeit
                </h2>
                <p>
                  Aus strengen Hygiene- und Sicherheitsgründen gilt im gesamten Spielbereich und im Salzraum <strong>strikte Sockenpflicht</strong> (idealerweise rutschfeste Stoppersocken) für Kinder und erwachsene Begleitpersonen. Das Betreten mit Straßenschuhen oder barfuß ist untersagt. Rutschfeste Socken können bei Bedarf am Empfang erworben werden.
                </p>
              </div>

              <div>
                <h2 className="font-extrabold text-base text-dark mb-1.5">
                  9. Haftungsbeschränkung
                </h2>
                <p>
                  {BUSINESS_INFO.name} haftet unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit sowie für vorsätzliche oder grob fahrlässige Pflichtverletzungen. Für einfache Fahrlässigkeit haftet das Café nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten), begrenzt auf den vertragstypischen, vorhersehbaren Schaden. Für den Verlust oder die Beschädigung mitgebrachter Gegenstände, Kleidung, Wertsachen oder Kinderwagen im Eingangsbereich wird keine Haftung übernommen.
                </p>
              </div>

              <div>
                <h2 className="font-extrabold text-base text-dark mb-1.5">
                  10. Hausrecht &amp; Verweisung
                </h2>
                <p>
                  Die Mitarbeiter von {BUSINESS_INFO.name} üben das Hausrecht aus. Den Anweisungen des Personals ist unverzüglich Folge zu leisten. Bei groben Verstößen gegen diese Besuchsregeln, Gefährdung anderer Gäste oder mutwilliger Sachbeschädigung kann ein sofortiger Verweis aus den Räumlichkeiten ausgesprochen werden. Ein Anspruch auf Erstattung bereits entrichteter Eintrittsgelder besteht in diesem Fall nicht.
                </p>
              </div>

              <div>
                <h2 className="font-extrabold text-base text-dark mb-1.5">
                  11. Mitnahme von Speisen &amp; Getränken
                </h2>
                <p>
                  Der Verzehr mitgebrachter Speisen und Getränke ist im Café- und Spielbereich nicht gestattet. Eine Ausnahme gilt für handelsübliche Babynahrung und Gläschen für Säuglinge.
                </p>
              </div>

              <div>
                <h2 className="font-extrabold text-base text-dark mb-1.5">
                  12. Hinweis zur Nutzung des Salzraums
                </h2>
                <div className="bg-sky-50 p-4 rounded-2xl border border-sky-200 text-sky-900 text-xs sm:text-sm">
                  {BUSINESS_INFO.medicalDisclaimer}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgbPage;
