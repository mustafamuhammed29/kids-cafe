import React, { useState, useId } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Wind,
  Download,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import { SERVICES, DEFAULT_TIME_SLOTS, BUSINESS_INFO } from '../../data/mockData';
import type { ServiceItem, TimeSlot, BookingConfirmation, BookingFormData } from '../../types/booking';
import { submitBooking } from '../../services/bookingService';
import { MedicalDisclaimer } from '../common/MedicalDisclaimer';

interface BookingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedService?: ServiceItem | null;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  isOpen,
  onClose,
  preSelectedService,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<ServiceItem>(
    preSelectedService || SERVICES[0]
  );

  // Default date to tomorrow
  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    // If tomorrow is Sunday, advance to Monday
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTomorrowString());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>(DEFAULT_TIME_SLOTS[0]);
  const [childrenCount, setChildrenCount] = useState<number>(1);
  const [adultsCount, setAdultsCount] = useState<number>(1);
  const [childrenAges, setChildrenAges] = useState<number[]>([3]);
  const [includeSaltRoom, setIncludeSaltRoom] = useState<boolean>(false);

  // Form details
  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Confirmation state
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Helper ID for accessibility
  const titleId = useId();

  if (!isOpen) return null;

  // Price Calculation Logic
  const calculateTotal = (): number => {
    const base = selectedService.basePrice || 0;
    if (selectedService.category === 'birthday') {
      let total = base;
      if (includeSaltRoom) total += childrenCount * 5;
      return total;
    }

    if (selectedService.slug === '10er-block') {
      return base;
    }

    // Single visit: base per child
    let total = childrenCount * base;
    if (includeSaltRoom) {
      total += childrenCount * 5;
    }
    return total;
  };

  const totalPrice = calculateTotal();

  // Child ages handler
  const handleChildrenCountChange = (count: number) => {
    const validCount = Math.max(1, Math.min(6, count));
    setChildrenCount(validCount);
    const newAges = [...childrenAges];
    while (newAges.length < validCount) newAges.push(3);
    while (newAges.length > validCount) newAges.pop();
    setChildrenAges(newAges);
  };

  const handleAgeChange = (index: number, age: number) => {
    const newAges = [...childrenAges];
    newAges[index] = Math.max(0, Math.min(8, age));
    setChildrenAges(newAges);
  };

  // Submit & finalize booking
  const handleFinalizeBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedRules || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData: BookingFormData = {
        serviceId: selectedService.id,
        date: selectedDate,
        timeSlotId: selectedSlot.id,
        childrenCount,
        adultsCount,
        childrenAges,
        includeSaltRoomAddon: includeSaltRoom,
        parentName,
        email,
        phone,
        specialRequests,
        marketingConsent,
        acceptedRules,
      };

      const result = await submitBooking(formData, selectedService, selectedSlot);

      if (!result.success) {
        setSubmitError(result.error || 'Reservierung fehlgeschlagen. Bitte versuche es erneut.');
        setIsSubmitting(false);
        return;
      }

      const newConfirmation: BookingConfirmation = {
        reference: result.referenceCode,
        service: selectedService,
        date: selectedDate,
        timeSlot: selectedSlot,
        childrenCount,
        adultsCount,
        childrenAges,
        includeSaltRoomAddon: includeSaltRoom,
        parentName,
        email,
        phone,
        specialRequests,
        totalPrice,
        paymentMethod: 'pay_on_arrival',
        createdAt: new Date().toISOString(),
      };

      setConfirmation(newConfirmation);
      setStep(5);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Unerwarteter Fehler bei der Reservierung.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download .ics calendar event
  const generateIcsFile = () => {
    if (!confirmation) return;
    const startIso = `${confirmation.date.replace(/-/g, '')}T${confirmation.timeSlot.startTime.replace(':', '')}00`;
    const endIso = `${confirmation.date.replace(/-/g, '')}T${confirmation.timeSlot.endTime.replace(':', '')}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Haven Kids Cafe//Booking System//DE',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `SUMMARY:Besuch im Haven Kids Café (${confirmation.service.name})`,
      `DESCRIPTION:Buchung ${confirmation.reference} für ${confirmation.parentName}. Vor Ort zahlen (${confirmation.totalPrice} €). Bitte Stoppersocken mitbringen!`,
      `LOCATION:${BUSINESS_INFO.address}`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      `STATUS:CONFIRMED`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${confirmation.reference}-HavenKids.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#183D3D] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#93B1A6]/20 flex items-center justify-center text-[#FFD3B6]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id={titleId} className="font-extrabold text-lg text-white">
                {step === 5 ? 'Buchungsbestätigung' : 'Besuch reservieren'}
              </h2>
              <span className="text-xs text-gray-300">
                {step < 5 && `Schritt ${step} von 4`} • Haven Kids Café Berlin
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        {step < 5 && (
          <div className="bg-gray-100 h-1.5 w-full flex">
            <div
              className="bg-[#5C8374] h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-[#183D3D]">
          {/* STEP 1: SERVICE SELECTION */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center max-w-md mx-auto mb-6">
                <h3 className="font-extrabold text-xl mb-1 text-[#183D3D]">
                  Welches Erlebnis wählst du?
                </h3>
                <p className="text-xs text-gray-500">
                  Wähle zwischen Einzelbesuch, Mehrfachkarte oder Feier.
                </p>
              </div>

              <div className="space-y-3.5">
                {SERVICES.filter((s) => s.packageCategory === 'standard').map((srv) => {
                  const isSelected = selectedService.id === srv.id;

                  return (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedService(srv)}
                      className={`p-4.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-[#5C8374] bg-[#93B1A6]/10 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-[#183D3D]">
                            {srv.name}
                          </span>
                          {srv.badge && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#FFD3B6] text-[#183D3D]">
                              {srv.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {srv.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-lg text-[#183D3D] block">
                          {srv.basePrice} €
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {srv.slug === 'einzelbesuch' ? 'pro Kind' : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-[#5C8374] hover:bg-[#183D3D] text-white px-7 py-3.5 rounded-full font-bold text-sm transition shadow-md flex items-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <span>Weiter zu Datum & Uhrzeit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DATE & TIME SLOT */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center max-w-md mx-auto mb-4">
                <h3 className="font-extrabold text-xl mb-1 text-[#183D3D]">
                  Datum & Zeitslot wählen
                </h3>
                <p className="text-xs text-gray-500">
                  Feste 2-Stunden-Blöcke garantieren freies Spielen ohne Überfüllung (max. 20 Kinder).
                </p>
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#5C8374]" />
                  <span>Besuchsdatum *</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold bg-white focus:ring-2 focus:ring-[#5C8374] min-h-[44px]"
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Hinweis: Sonntags Ruhetag (außer für geschlossene Geburtstagsgesellschaften).
                </span>
              </div>

              {/* Slot Cards */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#5C8374]" />
                  <span>Verfügbare Zeitslots (2 Stunden + Reinigung)</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {DEFAULT_TIME_SLOTS.map((slot) => {
                    const isSelected = selectedSlot.id === slot.id;
                    const freeSpots = slot.maxCapacity - slot.bookedCount;

                    return (
                      <div
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition text-center min-h-[80px] flex flex-col justify-center ${
                          isSelected
                            ? 'border-[#5C8374] bg-[#93B1A6]/15 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <span className="font-extrabold text-base text-[#183D3D] block">
                          {slot.startTime} – {slot.endTime}
                        </span>
                        <span className="text-[11px] text-[#5C8374] font-semibold block mt-1">
                          {freeSpots} Plätze frei
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-1 border-t border-gray-100 pt-1">
                          danach 30m Lüftung
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gray-600 hover:text-black font-semibold text-xs flex items-center gap-1 cursor-pointer min-h-[44px] min-w-[44px]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Zurück</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-[#5C8374] hover:bg-[#183D3D] text-white px-7 py-3.5 rounded-full font-bold text-sm transition shadow-md flex items-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <span>Weiter zu Personen & Extras</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CHILDREN, COMPANIONS & ADD-ONS */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center max-w-md mx-auto mb-4">
                <h3 className="font-extrabold text-xl mb-1 text-[#183D3D]">
                  Kinder, Begleitpersonen & Extras
                </h3>
                <p className="text-xs text-gray-500">
                  Altersgruppe 0–8 Jahre strikt. 2 Erwachsene pro Kind frei!
                </p>
              </div>

              {/* Children counter */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="font-bold text-sm text-[#183D3D] block">
                      Anzahl Kinder (0–8 Jahre)
                    </label>
                    <span className="text-xs text-gray-500">
                      Basispreis {selectedService.basePrice || 14} € je Kind
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleChildrenCountChange(childrenCount - 1)}
                      className="w-10 h-10 rounded-xl bg-white border border-gray-200 font-bold text-lg flex items-center justify-center hover:bg-gray-100 cursor-pointer min-h-[44px] min-w-[44px]"
                    >
                      -
                    </button>
                    <span className="font-extrabold text-lg w-6 text-center">
                      {childrenCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleChildrenCountChange(childrenCount + 1)}
                      className="w-10 h-10 rounded-xl bg-white border border-gray-200 font-bold text-lg flex items-center justify-center hover:bg-gray-100 cursor-pointer min-h-[44px] min-w-[44px]"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Ages array */}
                <div className="pt-3 border-t border-gray-200/80">
                  <span className="text-xs font-semibold text-gray-700 block mb-2">
                    Alter der Kinder (zur Vorbereitung der Spielzonen):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {childrenAges.map((age, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200">
                        <span className="text-xs text-gray-500 whitespace-nowrap">Kind {idx + 1}:</span>
                        <select
                          value={age}
                          onChange={(e) => handleAgeChange(idx, parseInt(e.target.value, 10))}
                          className="w-full text-xs font-bold bg-transparent outline-hidden min-h-[36px]"
                        >
                          <option value={0}>Baby (&lt; 1 Jahr)</option>
                          <option value={1}>1 Jahr</option>
                          <option value={2}>2 Jahre</option>
                          <option value={3}>3 Jahre</option>
                          <option value={4}>4 Jahre</option>
                          <option value={5}>5 Jahre</option>
                          <option value={6}>6 Jahre</option>
                          <option value={7}>7 Jahre</option>
                          <option value={8}>8 Jahre</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Adults counter */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-center justify-between">
                <div>
                  <label className="font-bold text-sm text-[#183D3D] block">
                    Erwachsene Begleitpersonen
                  </label>
                  <span className="text-xs text-emerald-600 font-semibold">
                    Bis zu {childrenCount * 2} Begleitpersonen gratis inklusive
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                    className="w-10 h-10 rounded-xl bg-white border border-gray-200 font-bold text-lg flex items-center justify-center hover:bg-gray-100 cursor-pointer min-h-[44px] min-w-[44px]"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-lg w-6 text-center">
                    {adultsCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAdultsCount(adultsCount + 1)}
                    className="w-10 h-10 rounded-xl bg-white border border-gray-200 font-bold text-lg flex items-center justify-center hover:bg-gray-100 cursor-pointer min-h-[44px] min-w-[44px]"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Salt room optional add-on */}
              <div
                onClick={() => setIncludeSaltRoom(!includeSaltRoom)}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer flex items-start gap-4 ${
                  includeSaltRoom
                    ? 'border-sky-400 bg-sky-50 shadow-xs'
                    : 'border-gray-200 bg-white hover:border-sky-200'
                }`}
              >
                <div className="mt-0.5">
                  <input
                    type="checkbox"
                    checked={includeSaltRoom}
                    onChange={() => {}}
                    className="w-5 h-5 rounded-md text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#183D3D] flex items-center gap-1.5">
                      <Wind className="w-4 h-4 text-sky-600" />
                      Salzraum-Erlebnis (45 Min) zubuchen
                    </span>
                    <span className="font-bold text-sm text-sky-800">
                      +{childrenCount * 5} € (+5 €/Kind)
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Mikroklimatische Trockensalzaerosol-Sitzung in kindgerechter Atmosphäre (max. 8 Kinder je Sitzung).
                  </p>
                  <MedicalDisclaimer className="mt-2 text-[11px]" />
                </div>
              </div>

              {/* Price summary badge */}
              <div className="bg-[#183D3D] text-white p-4 rounded-2xl flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-gray-300 font-bold">
                  Gesamtbetrag (Zahlbar vor Ort)
                </span>
                <span className="text-2xl font-extrabold text-[#FFD3B6]">
                  {totalPrice} €
                </span>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-gray-600 hover:text-black font-semibold text-xs flex items-center gap-1 cursor-pointer min-h-[44px] min-w-[44px]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Zurück</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="bg-[#5C8374] hover:bg-[#183D3D] text-white px-7 py-3.5 rounded-full font-bold text-sm transition shadow-md flex items-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <span>Weiter zu Kontaktdaten</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CONTACT & CONFIRMATION */}
          {step === 4 && (
            <form onSubmit={handleFinalizeBooking} className="space-y-5 animate-fadeIn">
              <div className="text-center max-w-md mx-auto mb-3">
                <h3 className="font-extrabold text-xl mb-1 text-[#183D3D]">
                  Kontaktdaten für die Reservierung
                </h3>
                <p className="text-xs text-gray-500">
                  Wir senden dir die Buchungsbestätigung und Terminerinnerung per E-Mail.
                </p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Vollständiger Name des Elternteils *
                  </label>
                  <input
                    type="text"
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="z. B. Julia Schneider"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#5C8374] min-h-[44px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      E-Mail-Adresse *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="julia.schneider@beispiel.de"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#5C8374] min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Telefonnummer (für Rückfragen) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+49 170 1234567"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#5C8374] min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Besondere Wünsche oder Anmerkungen (optional)
                  </label>
                  <input
                    type="text"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="z. B. Hochstuhl benötigt, Allergien, Zwillingskinder..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#5C8374] min-h-[44px]"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="pt-2 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={acceptedRules}
                    onChange={(e) => setAcceptedRules(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-[#5C8374] mt-0.5 focus:ring-[#5C8374]"
                  />
                  <span className="text-xs text-gray-600 leading-relaxed">
                    Ich akzeptiere die <strong>Hausregeln</strong> (Sockenpflicht für alle, elterliche Aufsichtspflicht, Altersbereich 0–8 Jahre) und die Buchungsbedingungen. *
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-[#5C8374] mt-0.5 focus:ring-[#5C8374]"
                  />
                  <span className="text-xs text-gray-500 leading-relaxed">
                    (Optional) Informiert mich über Ferien-Workshops und exklusive Familien-Aktionen per E-Mail. Jederzeit widerrufbar.
                  </span>
                </label>
              </div>

              {/* Payment notification */}
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Zahlung vor Ort:</strong> Keine Online-Zahlung nötig. Du bezahlst bequem beim Check-in bar oder mit Karte ({totalPrice} €).
                </span>
              </div>

              {submitError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <X className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setStep(3)}
                  className="text-gray-600 hover:text-black font-semibold text-xs flex items-center gap-1 cursor-pointer min-h-[44px] min-w-[44px] disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Zurück</span>
                </button>
                <button
                  type="submit"
                  disabled={!acceptedRules || isSubmitting}
                  className="bg-[#5C8374] hover:bg-[#183D3D] disabled:opacity-50 text-white px-8 py-3.5 rounded-full font-extrabold text-sm transition shadow-lg flex items-center gap-2 cursor-pointer min-h-[44px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Wird reserviert...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verbindlich reservieren</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: SUCCESS CONFIRMATION */}
          {step === 5 && confirmation && (
            <div className="text-center space-y-6 animate-fadeIn py-2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-2">
                  Reservierung erfolgreich
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#183D3D]">
                  Wir freuen uns auf euch, {confirmation.parentName}!
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Deine Bestätigung wurde an <strong className="text-gray-800">{confirmation.email}</strong> gesendet.
                </p>
              </div>

              {/* Booking Ticket Card */}
              <div className="bg-[#FAFAFA] rounded-2xl p-6 border border-gray-200 text-left space-y-3.5 max-w-lg mx-auto shadow-xs">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-xs text-gray-500 font-semibold">Buchungsreferenz</span>
                  <span className="font-mono font-extrabold text-base text-[#183D3D] bg-white px-3 py-1 rounded-lg border border-gray-200">
                    {confirmation.reference}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500 block">Datum & Zeit</span>
                    <strong className="text-gray-800 font-semibold block mt-0.5">
                      {confirmation.date} • {confirmation.timeSlot.startTime} - {confirmation.timeSlot.endTime} Uhr
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Paket</span>
                    <strong className="text-gray-800 font-semibold block mt-0.5">
                      {confirmation.service.name}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs border-t border-gray-200/60 pt-3">
                  <div>
                    <span className="text-gray-500 block">Gäste</span>
                    <strong className="text-gray-800 font-semibold block mt-0.5">
                      {confirmation.childrenCount} {confirmation.childrenCount === 1 ? 'Kind' : 'Kinder'} & {confirmation.adultsCount} Begleitpersonen
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Salzraum Add-on</span>
                    <strong className="text-gray-800 font-semibold block mt-0.5">
                      {confirmation.includeSaltRoomAddon ? 'Ja (45 Min)' : 'Nein'}
                    </strong>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-gray-200 pt-3 text-sm">
                  <span className="font-bold text-gray-700">Zu zahlen vor Ort:</span>
                  <span className="font-extrabold text-lg text-[#183D3D]">
                    {confirmation.totalPrice} €
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={generateIcsFile}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#183D3D] hover:bg-black text-white text-xs font-bold transition shadow-sm cursor-pointer min-h-[44px]"
                >
                  <Download className="w-4 h-4" />
                  <span>Termin im Kalender speichern (.ics)</span>
                </button>

                <a
                  href={`https://wa.me/493012345678?text=Hallo%20Haven%20Kids%20Caf%C3%A9%20Team%2C%20ich%20habe%20eine%20Frage%20zu%20meiner%20Buchung%20${confirmation.reference}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm min-h-[44px]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Frage per WhatsApp stellen</span>
                </a>
              </div>

              {/* Disclaimer reminder */}
              <div className="pt-2">
                <MedicalDisclaimer className="text-[11px] text-left" />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-bold text-gray-500 hover:text-gray-800 cursor-pointer min-h-[44px] min-w-[44px]"
                >
                  Fenster schließen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
