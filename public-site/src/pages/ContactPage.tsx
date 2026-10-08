import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle2, Navigation } from 'lucide-react';
import { BUSINESS_INFO } from '../data/mockData';
import { submitEventInquiry } from '../services/contentService';
import { usePageSeo } from '../hooks/usePageSeo';

export const ContactPage: React.FC = () => {
  usePageSeo({
    title: 'Kontakt & Anfahrt | Haven Kids Café Berlin',
    description: 'Kontaktiere uns per WhatsApp, Telefon oder E-Mail. Anfahrtsbeschreibung, Parkmöglichkeiten und Öffnungszeiten in Berlin.',
    canonicalPath: '/contact',
  });

  const [searchParams] = useSearchParams();
  const subjectParam = searchParams.get('subject');

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: subjectParam || 'Allgemeine Anfrage',
    message: '',
  });

  useEffect(() => {
    if (subjectParam) {
      setFormData((prev) => ({ ...prev, subject: subjectParam }));
    }
  }, [subjectParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gdprConsent) {
      setConsentError(true);
      return;
    }
    setFormSubmitted(true);
    setConsentError(false);

    await submitEventInquiry({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      eventType: formData.subject.toLowerCase().includes('geburtstag') ? 'birthday' : 'general',
      message: `[${formData.subject}] ${formData.message}`,
    });

    setTimeout(() => {
      setFormSubmitted(false);
      setGdprConsent(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Allgemeine Anfrage',
        message: '',
      });
    }, 5000);
  };

  return (
    <div className="pt-16 sm:pt-20 md:pt-24 animate-fadeIn pb-24 md:pb-20 bg-[#FAF8F5] min-h-screen text-dark">
      {/* Header */}
      <section className="relative pt-6 pb-6 sm:py-12 px-4 text-center bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-sky-50 border border-sky-100 text-primary font-bold text-xs sm:text-sm mb-3 shadow-xs">
            <MessageCircle className="w-4 h-4" />
            <span>Wir helfen gerne weiter</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-3">
            Kontakt &amp; Anfahrt
          </h1>
          <p className="text-base sm:text-xl text-slate-600 max-w-xl mx-auto leading-relaxed">
            Fragen zu Geburtstagen, Gruppen oder besonderen Bedürfnissen? Kontaktiere uns direkt oder schreibe eine Nachricht.
          </p>
        </div>
      </section>

      {/* Quick Direct-Action Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-10">
          <a
            href={BUSINESS_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center hover:border-emerald-300 transition group min-h-[84px] hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <MessageCircle className="w-5 h-5" />
            </div>
            <strong className="text-slate-900 text-sm sm:text-base block font-bold">WhatsApp</strong>
            <span className="text-xs text-slate-500 hidden sm:block">Direkt chatten</span>
          </a>

          <a
            href={`tel:${BUSINESS_INFO.phoneClean}`}
            className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center hover:border-sky-300 transition group min-h-[84px] hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-primary flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Phone className="w-5 h-5" />
            </div>
            <strong className="text-slate-900 text-sm sm:text-base block font-bold">Anrufen</strong>
            <span className="text-xs text-slate-500 hidden sm:block">{BUSINESS_INFO.phone}</span>
          </a>

          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(BUSINESS_INFO.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center hover:border-amber-300 transition group min-h-[84px] hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Navigation className="w-5 h-5" />
            </div>
            <strong className="text-slate-900 text-sm sm:text-base block font-bold">Navigation</strong>
            <span className="text-xs text-slate-500 hidden sm:block">Berlin-Mitte</span>
          </a>
        </div>

        {/* Main Columns: Left = Details & Hours, Right = Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Details */}
          <div className="lg:col-span-5 space-y-6">
            {/* Address & Hours Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900">
                Standort &amp; Erreichbarkeit
              </h3>

              <div className="space-y-4 text-sm sm:text-base text-slate-700">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">Adresse</strong>
                    <span className="text-slate-600 leading-relaxed">{BUSINESS_INFO.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">E-Mail</strong>
                    <a href={`mailto:${BUSINESS_INFO.email}`} className="text-primary hover:underline">
                      {BUSINESS_INFO.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-bold text-sm sm:text-base text-slate-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Reguläre Öffnungszeiten</span>
                </h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  {BUSINESS_INFO.hours.map((h, idx) => (
                    <li key={idx} className="flex justify-between border-b border-slate-50 pb-1.5">
                      <span>{h.days}</span>
                      <span className="font-semibold text-slate-900">{h.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900 mb-1.5">
                Nachricht senden
              </h3>
              <p className="text-sm sm:text-base text-slate-500 mb-6">
                Wir melden uns verlässlich innerhalb weniger Stunden zurück.
              </p>

              {formSubmitted ? (
                <div className="bg-sky-50 border border-sky-200 text-sky-900 rounded-2xl p-6 text-center animate-fadeIn">
                  <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-2.5" />
                  <h4 className="font-bold text-lg text-slate-900">Vielen Dank für deine Nachricht!</h4>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                    Deine Anfrage ist eingegangen. Wir antworten dir schnellstmöglich per E-Mail oder Telefon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Dein Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="z. B. Julia Schneider"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm sm:text-base focus:outline-hidden focus:ring-2 focus:ring-primary min-h-[48px] text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        E-Mail-Adresse *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@beispiel.de"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm sm:text-base focus:outline-hidden focus:ring-2 focus:ring-primary min-h-[48px] text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Telefon (optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+49 170 1234567"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm sm:text-base focus:outline-hidden focus:ring-2 focus:ring-primary min-h-[48px] text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Betreff *
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm sm:text-base focus:outline-hidden focus:ring-2 focus:ring-primary min-h-[48px] text-slate-900 cursor-pointer"
                      >
                        <option value="Allgemeine Anfrage">Allgemeine Anfrage</option>
                        <option value="Kindergeburtstag">Frage zum Kindergeburtstag</option>
                        <option value="Gruppenanfrage">Gruppenanfrage (Kitas &amp; Schulen)</option>
                        <option value="Salzraum">Frage zum Salzraum</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Deine Nachricht *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Deine Nachricht, Wunschdatum oder Fragen..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm sm:text-base focus:outline-hidden focus:ring-2 focus:ring-primary text-slate-900"
                    ></textarea>
                  </div>

                  <div className="pt-1">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={gdprConsent}
                        onChange={(e) => {
                          setGdprConsent(e.target.checked);
                          if (e.target.checked) setConsentError(false);
                        }}
                        className="w-4 h-4 rounded-sm text-primary mt-1 focus:ring-primary cursor-pointer shrink-0"
                      />
                      <span className="text-xs sm:text-sm text-slate-600 leading-normal">
                        Ich habe die Datenschutzerklärung zur Kenntnis genommen und willige in die Verarbeitung meiner Daten ein. *
                      </span>
                    </label>
                    {consentError && (
                      <p className="text-xs sm:text-sm text-rose-600 font-medium mt-1">
                        Bitte bestätige die Datenschutzerklärung.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!gdprConsent}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-base sm:text-lg shadow-md transition flex items-center justify-center gap-2 cursor-pointer min-h-[52px]"
                  >
                    <Send className="w-4 h-4" />
                    <span>Nachricht absenden</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Arrival, Strollers & Parking Info */}
        <div className="mt-10 sm:mt-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
              <span className="text-xs sm:text-sm font-bold text-primary block mb-1.5">Öffentliche Verkehrsmittel</span>
              <p className="text-sm text-slate-600 leading-relaxed">
                Zentral in Berlin-Mitte. Wenige Gehminuten von Rosenthaler Platz (U8) und Hackescher Markt (S-Bahn).
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
              <span className="text-xs sm:text-sm font-bold text-emerald-600 block mb-1.5">Kinderwagen-Stellplatz</span>
              <p className="text-sm text-slate-600 leading-relaxed">
                Stufenloser Eingang und überdachter, sicherer Stellplatzbereich direkt im Café-Foyer.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
              <span className="text-xs sm:text-sm font-bold text-amber-600 block mb-1.5">Parkmöglichkeiten</span>
              <p className="text-sm text-slate-600 leading-relaxed">
                Kurzhaltezone vor der Tür zum Ein-/Aussteigen. Parkhäuser in ca. 250m Fußweg vorhanden.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContactPage;
