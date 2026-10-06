import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle2 } from 'lucide-react';
import { BUSINESS_INFO } from '../data/mockData';

export const ContactPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const subjectParam = searchParams.get('subject');

  const [formSubmitted, setFormSubmitted] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
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
    <div className="pt-20 sm:pt-24 animate-fadeIn pb-16">
      {/* Header */}
      <div className="bg-[#183D3D] text-white py-12 sm:py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FFD3B6] bg-white/10 py-1 px-3.5 rounded-full inline-block mb-3">
            Wir freuen uns auf deine Nachricht
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Kontakt & Anfahrt
          </h1>
          <p className="text-sm sm:text-base text-gray-200 max-w-xl mx-auto font-light leading-relaxed">
            Hast du Fragen zu Gruppenveranstaltungen, Geburtstagen oder möchtest uns Feedback geben? Schreib uns oder ruf uns direkt an!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Business Details & Opening Hours */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-extrabold text-xl text-[#183D3D]">
                Standort Berlin-Mitte
              </h3>

              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#93B1A6]/20 flex items-center justify-center text-[#5C8374] shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-[#183D3D]">Adresse:</strong>
                    <span>{BUSINESS_INFO.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#93B1A6]/20 flex items-center justify-center text-[#5C8374] shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-[#183D3D]">Telefon:</strong>
                    <a href={`tel:${BUSINESS_INFO.phoneClean}`} className="hover:text-[#5C8374] transition font-semibold">
                      {BUSINESS_INFO.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#93B1A6]/20 flex items-center justify-center text-[#5C8374] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-[#183D3D]">E-Mail:</strong>
                    <a href={`mailto:${BUSINESS_INFO.email}`} className="hover:text-[#5C8374] transition font-semibold">
                      {BUSINESS_INFO.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="font-bold text-sm text-[#183D3D] mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#5C8374]" />
                  <span>Öffnungszeiten</span>
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                  {BUSINESS_INFO.hours.map((h, idx) => (
                    <li key={idx} className="flex justify-between border-b border-gray-100 pb-1.5">
                      <span>{h.days}</span>
                      <span className="font-semibold text-gray-900">{h.time}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* WhatsApp Service Button */}
              <a
                href={BUSINESS_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition min-h-[44px]"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Schnellkontakt via WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right Column: Contact Message Form & Map */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h3 className="font-extrabold text-xl text-[#183D3D] mb-2">
                Nachricht senden
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-6">
                Fülle einfach das Formular aus. Wir melden uns schnellstmöglich bei dir zurück.
              </p>

              {formSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-6 text-center animate-fadeIn">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <h4 className="font-bold text-base">Vielen Dank für deine Anfrage!</h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    Deine Nachricht wurde übermittelt. Wir antworten in der Regel innerhalb weniger Stunden.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Dein Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="z. B. Julia Schneider"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#5C8374] min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        E-Mail-Adresse *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@beispiel.de"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#5C8374] min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Telefonnummer (optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+49 170 1234567"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#5C8374] min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Betreff *
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#5C8374] min-h-[44px]"
                      >
                        <option value="Allgemeine Anfrage">Allgemeine Anfrage</option>
                        <option value="Gruppenanfrage">Gruppenanfrage (Kitas & Schulen)</option>
                        <option value="Firmenanfrage">Firmenanfrage & Teambuilding</option>
                        <option value="Gruppenfeier">Gruppenfeier (Privat)</option>
                        <option value="Kindergeburtstag">Frage zum Kindergeburtstag</option>
                        <option value="Salzraum">Frage zum Salzraum</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Deine Nachricht *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Wie viele Kinder/Erwachsene, Wunschdatum, besondere Fragen..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#5C8374]"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#183D3D] hover:bg-black text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                  >
                    <Send className="w-4 h-4" />
                    <span>Nachricht absenden</span>
                  </button>
                </form>
              )}
            </div>

            {/* Map Preview Card */}
            <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-xs h-48 bg-gray-100 relative flex items-center justify-center text-center p-4">
              <div className="z-10 bg-white/95 backdrop-blur-xs px-6 py-4 rounded-2xl shadow-md border border-gray-100 max-w-sm">
                <MapPin className="w-6 h-6 text-[#5C8374] mx-auto mb-1.5" />
                <h4 className="font-bold text-sm text-[#183D3D]">{BUSINESS_INFO.name} Berlin</h4>
                <p className="text-xs text-gray-500">{BUSINESS_INFO.address}</p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(BUSINESS_INFO.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs font-bold text-[#5C8374] hover:underline"
                >
                  In Google Maps öffnen →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
