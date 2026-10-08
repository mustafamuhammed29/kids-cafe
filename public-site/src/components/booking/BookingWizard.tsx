import React, { useState, useId, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  AlertCircle,
} from 'lucide-react';
import { SERVICES, DEFAULT_TIME_SLOTS, BUSINESS_INFO } from '../../data/mockData';
import type { ServiceItem, TimeSlot, BookingConfirmation, BookingFormData } from '../../types/booking';
import { submitBooking, getAvailableTimeSlots, type SlotAvailability } from '../../services/bookingService';
import { MedicalDisclaimer } from '../common/MedicalDisclaimer';
import { TurnstileWidget } from './TurnstileWidget';

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
  const [slotsList, setSlotsList] = useState<SlotAvailability[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
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
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Confirmation state
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Helper ID for accessibility
  const titleId = useId();

  // Load available time slots dynamically from Supabase
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setIsLoadingSlots(true);

    getAvailableTimeSlots(selectedDate, selectedService.slug || selectedService.id)
      .then((data) => {
        if (!isMounted) return;
        setSlotsList(data);
        setIsLoadingSlots(false);

        // Keep current selected slot if still valid, otherwise pick first available
        setSelectedSlot((prev) => {
          const match = data.find((s) => s.startTime === prev?.startTime || s.id === prev?.id);
          const nextSlot =
            match && match.isActive && match.availableCount > 0
              ? match
              : data.find((s) => s.isActive && s.availableCount > 0) || data[0] || prev;

          if (nextSlot) {
            const free =
              typeof nextSlot.availableCount === 'number'
                ? nextSlot.availableCount
                : nextSlot.maxCapacity - nextSlot.bookedCount;
            const slotCap = nextSlot.maxCapacity || BUSINESS_INFO.maxSlotCapacity || 20;
            const maxForSlot = Math.max(1, Math.min(slotCap, free > 0 ? free : 1));
            setChildrenCount((currCount) => {
              if (currCount > maxForSlot) {
                const newAges = [...childrenAges].slice(0, maxForSlot);
                setChildrenAges(newAges);
                return maxForSlot;
              }
              return currCount;
            });
          }

          return nextSlot;
        });
      })
      .catch((err) => {
        console.error('Fehler beim Laden der Zeitslots:', err);
        if (isMounted) setIsLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedDate, selectedService.slug, selectedService.id]);

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

  // Helper to format date in German
  const formatDateGerman = (dateStr: string): string => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  // Helper: Get free spots in currently selected slot or specified slot
  const getSlotFreeCapacity = (targetSlot?: TimeSlot | null): number => {
    const slot = targetSlot || selectedSlot;
    if (!slot) return 20;
    const match = slotsList.find((s) => s.startTime === slot.startTime || s.id === slot.id) || slot;
    const free =
      typeof (match as any).availableCount === 'number'
        ? (match as any).availableCount
        : match.maxCapacity - match.bookedCount;
    return Math.max(0, free);
  };

  // Helper: Get maximum allowable children based strictly on slot free capacity (up to slot max capacity)
  const getMaxAllowedChildren = (targetSlot?: TimeSlot | null): number => {
    const freeInSlot = getSlotFreeCapacity(targetSlot);
    if (freeInSlot <= 0) return 1;
    const slot = targetSlot || selectedSlot;
    const maxCapacity = slot?.maxCapacity || BUSINESS_INFO.maxSlotCapacity || 20;
    return Math.max(1, Math.min(maxCapacity, freeInSlot));
  };

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

  // Child ages handler strictly respecting remaining slot capacity
  const handleChildrenCountChange = (count: number, targetSlot?: TimeSlot | null) => {
    const maxAllowed = getMaxAllowedChildren(targetSlot);
    const validCount = Math.max(1, Math.min(maxAllowed, count));
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

      const result = await submitBooking(formData, selectedService, selectedSlot, turnstileToken);

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
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `SUMMARY:Haven Kids Café Besuch - ${confirmation.service.name}`,
      `DESCRIPTION:Buchung für ${confirmation.childrenCount} Kinder und ${confirmation.adultsCount} Begleitpersonen.\\nBuchungsreferenz: ${confirmation.reference}\\nZahlung vor Ort: ${confirmation.totalPrice} €`,
      `LOCATION:${BUSINESS_INFO.address}`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      `STATUS:CONFIRMED`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `HavenKids-Termin-${confirmation.reference}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return typeof document !== 'undefined' ? createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden animate-fadeIn"
    >
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[92dvh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 pt-3 sm:pt-5 pb-4 sm:pb-5 bg-[#0F172A] text-white shrink-0">
          {/* Subtle Mobile Drag Indicator */}
          <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-3 sm:hidden shrink-0" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0EA5E9]/20 flex items-center justify-center text-[#0EA5E9]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 id={titleId} className="font-extrabold text-base sm:text-lg text-white">
                  {step === 5 ? 'Buchungsbestätigung' : 'Besuch reservieren'}
                </h2>
                <span className="text-[11px] sm:text-xs text-gray-300">
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
        </div>

        {/* Progress Bar */}
        {step < 5 && (
          <div className="bg-gray-100 h-1.5 w-full flex shrink-0">
            <div
              className="bg-[#0EA5E9] h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-4 sm:p-8 overflow-y-auto overscroll-contain flex-1 text-[#0F172A]">
          {/* STEP 1: SERVICE SELECTION */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center max-w-lg mx-auto mb-6">
                <h3 className="font-extrabold text-2xl mb-2 text-[#0F172A]">
                  Welches Erlebnis wählst du?
                </h3>
                <p className="text-sm text-slate-600">
                  Wähle zwischen Einzelbesuch, Mehrfachkarte oder Feier.
                </p>
              </div>

              <div className="space-y-4">
                {SERVICES.filter((s) => s.packageCategory === 'standard').map((srv) => {
                  const isSelected = selectedService.id === srv.id;

                  return (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedService(srv)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-[#0EA5E9] bg-[#F0F9FF] shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg text-[#0F172A]">
                            {srv.name}
                          </span>
                          {srv.badge && (
                            <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-[#FB7185]/20 text-[#FB7185]">
                              {srv.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {srv.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-xl sm:text-2xl text-[#0F172A] block">
                          {srv.basePrice} €
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {srv.slug === 'einzelbesuch' ? 'pro Kind' : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md pt-3 pb-safe border-t border-slate-100 mt-6 flex items-center justify-end shadow-[0_-4px_16px_rgba(0,0,0,0.05)] px-4 -mx-4 sm:mx-0 sm:px-0 sm:shadow-none sm:border-t-0 sm:static">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto bg-[#0F172A] hover:bg-[#1E293B] text-white px-8 py-4 rounded-full font-bold text-base transition shadow-md flex items-center justify-center gap-2 cursor-pointer min-h-[50px]"
                >
                  <span>Weiter zu Datum & Uhrzeit</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DATE & TIME SLOT */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center max-w-lg mx-auto mb-5">
                <h3 className="font-extrabold text-2xl mb-2 text-[#0F172A]">
                  Datum & Zeitslot wählen
                </h3>
                <p className="text-sm text-slate-600">
                  Feste 2-Stunden-Blöcke garantieren freies Spielen ohne Überfüllung (max. 20 Kinder).
                </p>
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-sm font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#0EA5E9]" />
                  <span>Besuchsdatum *</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-base font-semibold bg-white focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] min-h-[48px]"
                />
                <span className="text-xs text-slate-500 mt-1.5 block">
                  Hinweis: Sonntags Ruhetag (außer für geschlossene Geburtstagsgesellschaften).
                </span>
              </div>

              {/* Slot Cards */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-800 uppercase tracking-wide mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0EA5E9]" />
                    <span>Verfügbare Zeitslots (2 Stunden + Reinigung)</span>
                  </span>
                  {isLoadingSlots && (
                    <span className="text-xs text-sky-500 font-medium animate-pulse flex items-center gap-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Aktualisiere...
                    </span>
                  )}
                </label>

                {isLoadingSlots && slotsList.length === 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="p-5 rounded-2xl border border-slate-200 bg-slate-50/80 animate-pulse text-center min-h-[95px] flex flex-col justify-center items-center"
                      >
                        <div className="h-5 w-28 bg-slate-200 rounded mb-2" />
                        <div className="h-4 w-20 bg-slate-200 rounded" />
                      </div>
                    ))}
                  </div>
                ) : (slotsList.length > 0 ? slotsList : DEFAULT_TIME_SLOTS).length === 0 ? (
                  <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center text-amber-800 text-xs font-semibold">
                    Für dieses Datum sind derzeit keine buchbaren Zeitslots verfügbar.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(slotsList.length > 0
                      ? slotsList
                      : DEFAULT_TIME_SLOTS.map((s) => ({
                          ...s,
                          availableCount: s.maxCapacity - s.bookedCount,
                          isAvailable: s.maxCapacity > s.bookedCount,
                          isActive: true,
                        }))
                    ).map((slot) => {
                      const isSelected = selectedSlot?.startTime === slot.startTime || selectedSlot?.id === slot.id;
                      const isFull = slot.bookedCount >= slot.maxCapacity || slot.availableCount <= 0;
                      const isDeactivated = slot.isActive === false;
                      const isBlocked = isFull || isDeactivated;

                      return (
                        <button
                          key={slot.id || slot.startTime}
                          type="button"
                          disabled={isBlocked}
                          onClick={() => {
                            if (!isBlocked) {
                              setSelectedSlot(slot);
                              // Sync children count if current count exceeds slot's remaining free capacity
                              const slotFree =
                                typeof slot.availableCount === 'number'
                                  ? slot.availableCount
                                  : slot.maxCapacity - slot.bookedCount;
                              const slotCap = slot.maxCapacity || BUSINESS_INFO.maxSlotCapacity || 20;
                              const maxAllowedForSlot = Math.max(1, Math.min(slotCap, slotFree > 0 ? slotFree : 1));
                              if (childrenCount > maxAllowedForSlot) {
                                handleChildrenCountChange(maxAllowedForSlot, slot);
                              }
                            }
                          }}
                          className={`p-4 sm:p-5 rounded-2xl border-2 transition text-center min-h-[100px] flex flex-col justify-center items-center relative w-full ${
                            isBlocked
                              ? 'border-slate-200 bg-slate-100/90 text-slate-400 cursor-not-allowed opacity-60 select-none shadow-none'
                              : isSelected
                              ? 'border-[#0EA5E9] bg-[#F0F9FF] shadow-sm ring-2 ring-[#0EA5E9]/20 cursor-pointer'
                              : 'border-slate-200 hover:border-slate-300 bg-white cursor-pointer hover:shadow-xs'
                          }`}
                        >
                          <span
                            className={`font-extrabold text-base sm:text-lg block ${
                              isBlocked ? 'text-slate-400 line-through decoration-slate-300' : 'text-[#0F172A]'
                            }`}
                          >
                            {slot.startTime} – {slot.endTime} Uhr
                          </span>

                          <div className="mt-1">
                            {isDeactivated ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-200 text-slate-500">
                                Gesperrt
                              </span>
                            ) : isFull ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-600">
                                Ausgebucht
                              </span>
                            ) : slot.availableCount <= 2 ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                                Nur noch {slot.availableCount} {slot.availableCount === 1 ? 'Platz' : 'Plätze'} frei
                              </span>
                            ) : (
                              <span className="text-xs text-[#0EA5E9] font-bold block">
                                {slot.availableCount} Plätze frei
                              </span>
                            )}
                          </div>

                          <span className="text-[11px] text-slate-400 block mt-1 border-t border-slate-100 w-full pt-1">
                            {isBlocked ? 'Nicht verfügbar' : 'danach 30m Lüftung'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {(() => {
                const currentMatch = (slotsList.length > 0 ? slotsList : []).find(
                  (s) => s.startTime === selectedSlot?.startTime || s.id === selectedSlot?.id
                );
                const isSelectedBlocked =
                  !selectedSlot ||
                  (currentMatch &&
                    (!currentMatch.isActive ||
                      currentMatch.bookedCount >= currentMatch.maxCapacity ||
                      currentMatch.availableCount <= 0));

                return (
                  <div>
                    {isSelectedBlocked && (
                      <p className="text-xs text-rose-500 font-bold mb-3 text-center">
                        Der aktuell gewählte Zeitslot ist leider ausgebucht oder gesperrt. Bitte wähle einen freien Slot.
                      </p>
                    )}
                    <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md pt-3 pb-safe border-t border-slate-100 mt-6 flex items-center justify-between gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] px-4 -mx-4 sm:mx-0 sm:px-0 sm:shadow-none sm:border-t-0 sm:static">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-slate-600 hover:text-black font-semibold text-sm flex items-center gap-1.5 cursor-pointer min-h-[48px] px-3"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Zurück</span>
                      </button>
                      <button
                        type="button"
                        disabled={isSelectedBlocked}
                        onClick={() => setStep(3)}
                        className="flex-1 sm:flex-none sm:w-auto bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-4 rounded-full font-bold text-base transition shadow-md flex items-center justify-center gap-2 cursor-pointer min-h-[50px]"
                      >
                        <span>Weiter zu Personen & Extras</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* STEP 3: CHILDREN, COMPANIONS & ADD-ONS */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center max-w-lg mx-auto mb-2">
                <h3 className="font-extrabold text-2xl mb-1 text-[#0F172A]">
                  Kinder, Begleitpersonen & Extras
                </h3>
                <p className="text-sm text-slate-600">
                  Altersgruppe 0–8 Jahre strikt. 2 Erwachsene pro Kind frei!
                </p>
              </div>

              {/* Selected Slot & Free Capacity Context Card */}
              {(() => {
                const slotFreeSpots = getSlotFreeCapacity();
                const isVeryLowCapacity = slotFreeSpots <= 2;

                return (
                  <div className="bg-gradient-to-r from-sky-50/90 via-white to-sky-50/50 border border-sky-100/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-700 bg-sky-100/80 px-2.5 py-0.5 rounded-full inline-block">
                          Gewähltes Zeitfenster
                        </span>
                        {isVeryLowCapacity ? (
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            🔥 Nur noch {slotFreeSpots} {slotFreeSpots === 1 ? 'Platz' : 'Plätze'} frei!
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            ✓ {slotFreeSpots} freie Plätze
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-bold text-[#0F172A] pt-1">
                        <span className="flex items-center gap-1.5">
                          <CalendarIcon className="w-4 h-4 text-[#0EA5E9]" />
                          {formatDateGerman(selectedDate)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-[#0EA5E9]" />
                          {selectedSlot.startTime} – {selectedSlot.endTime} Uhr
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-sky-700 bg-white hover:bg-sky-50 border border-sky-200 px-3.5 py-2.5 rounded-xl transition shadow-2xs cursor-pointer self-start sm:self-center shrink-0"
                    >
                      <Clock className="w-3.5 h-3.5 text-sky-500" />
                      <span>Zeitslot ändern</span>
                    </button>
                  </div>
                );
              })()}

              {/* Children counter */}
              {(() => {
                const slotFreeSpots = getSlotFreeCapacity();
                const maxAllowedChildren = getMaxAllowedChildren();
                const isAtCapacityLimit = childrenCount >= maxAllowedChildren;
                const slotMaxCap = selectedSlot?.maxCapacity || BUSINESS_INFO.maxSlotCapacity || 20;
                const isSlotBottleNeck = slotFreeSpots < slotMaxCap;

                return (
                  <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <label className="font-bold text-base text-[#0F172A] block">
                            Anzahl Kinder (0–8 Jahre)
                          </label>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-md">
                            Max. {maxAllowedChildren} frei
                          </span>
                        </div>
                        <span className="text-sm text-slate-500 block mt-0.5">
                          Basispreis {selectedService.basePrice || 14} € je Kind
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={childrenCount <= 1}
                          onClick={() => handleChildrenCountChange(childrenCount - 1)}
                          className={`w-11 h-11 rounded-xl bg-white border font-bold text-xl flex items-center justify-center transition min-h-[46px] min-w-[46px] shadow-2xs ${
                            childrenCount <= 1
                              ? 'border-slate-200 bg-slate-100 text-slate-300 opacity-40 cursor-not-allowed'
                              : 'border-slate-200 text-slate-800 hover:bg-slate-100 cursor-pointer'
                          }`}
                        >
                          -
                        </button>
                        <span className="font-extrabold text-xl w-7 text-center text-[#0F172A]">
                          {childrenCount}
                        </span>
                        <button
                          type="button"
                          disabled={isAtCapacityLimit}
                          onClick={() => handleChildrenCountChange(childrenCount + 1)}
                          className={`w-11 h-11 rounded-xl bg-white border font-bold text-xl flex items-center justify-center transition min-h-[46px] min-w-[46px] shadow-2xs ${
                            isAtCapacityLimit
                              ? 'border-slate-200 bg-slate-100 text-slate-300 opacity-40 cursor-not-allowed'
                              : 'border-slate-200 text-slate-800 hover:bg-slate-100 cursor-pointer'
                          }`}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Capacity notice if limit reached */}
                    {isAtCapacityLimit && (
                      <div className="mb-4">
                        {isSlotBottleNeck ? (
                          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
                            <div className="flex items-start gap-2.5 text-amber-900 text-xs font-semibold">
                              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <span>
                                Kapazitätsgrenze für diesen Zeitslot ({selectedSlot.startTime}–{selectedSlot.endTime} Uhr) erreicht: Maximal <strong>{slotFreeSpots} {slotFreeSpots === 1 ? 'Platz' : 'Plätze'}</strong> verfügbar.
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setStep(2)}
                              className="text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer whitespace-nowrap self-stretch sm:self-auto text-center"
                            >
                              Zeitslot wechseln →
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-100/70 p-2.5 rounded-xl border border-slate-200/50">
                            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>Maximale Raumkapazität von {slotMaxCap} Plätzen für diesen Zeitslot erreicht.</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Ages array */}
                    <div className="pt-3.5 border-t border-slate-200/80">
                      <span className="text-sm font-semibold text-slate-700 block mb-2.5">
                        Alter der Kinder (zur Vorbereitung der Spielzonen):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {childrenAges.map((age, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                            <span className="text-xs sm:text-sm text-slate-500 font-medium whitespace-nowrap">Kind {idx + 1}:</span>
                            <select
                              value={age}
                              onChange={(e) => handleAgeChange(idx, parseInt(e.target.value, 10))}
                              className="w-full text-sm font-bold bg-transparent outline-hidden min-h-[38px] cursor-pointer"
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
                );
              })()}

              {/* Adults counter */}
              <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-100 flex items-center justify-between">
                <div>
                  <label className="font-bold text-base text-[#0F172A] block">
                    Erwachsene Begleitpersonen
                  </label>
                  <span className="text-sm text-sky-600 font-semibold">
                    Bis zu {childrenCount * 2} Begleitpersonen gratis inklusive
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={adultsCount <= 1}
                    onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                    className={`w-11 h-11 rounded-xl bg-white border font-bold text-xl flex items-center justify-center transition min-h-[46px] min-w-[46px] shadow-2xs ${
                      adultsCount <= 1
                        ? 'border-slate-200 bg-slate-100 text-slate-300 opacity-40 cursor-not-allowed'
                        : 'border-slate-200 text-slate-800 hover:bg-slate-100 cursor-pointer'
                    }`}
                  >
                    -
                  </button>
                  <span className="font-extrabold text-xl w-7 text-center">
                    {adultsCount}
                  </span>
                  <button
                    type="button"
                    disabled={adultsCount >= 10}
                    onClick={() => setAdultsCount(Math.min(10, adultsCount + 1))}
                    className={`w-11 h-11 rounded-xl bg-white border font-bold text-xl flex items-center justify-center transition min-h-[46px] min-w-[46px] shadow-2xs ${
                      adultsCount >= 10
                        ? 'border-slate-200 bg-slate-100 text-slate-300 opacity-40 cursor-not-allowed'
                        : 'border-slate-200 text-slate-800 hover:bg-slate-100 cursor-pointer'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Salt room optional add-on */}
              <div
                onClick={() => setIncludeSaltRoom(!includeSaltRoom)}
                className={`p-5 sm:p-6 rounded-2xl border-2 transition cursor-pointer flex items-start gap-4 ${
                  includeSaltRoom
                    ? 'border-[#0EA5E9] bg-[#F0F9FF] shadow-xs'
                    : 'border-slate-200 bg-white hover:border-[#38BDF8]'
                }`}
              >
                <div className="mt-1">
                  <input
                    type="checkbox"
                    checked={includeSaltRoom}
                    onChange={() => {}}
                    className="w-5 h-5 rounded-md text-[#0EA5E9] focus:ring-[#0EA5E9] cursor-pointer"
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-[#0F172A] flex items-center gap-2">
                      <Wind className="w-5 h-5 text-[#0EA5E9]" />
                      Salzraum-Erlebnis (45 Min) zubuchen
                    </span>
                    <span className="font-extrabold text-base text-[#0EA5E9]">
                      +{childrenCount * 5} € (+5 €/Kind)
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Mikroklimatische Trockensalzaerosol-Sitzung in kindgerechter Atmosphäre (max. 8 Kinder je Sitzung).
                  </p>
                  <MedicalDisclaimer className="mt-2.5 text-xs" />
                </div>
              </div>

              {/* Price summary badge */}
              <div className="bg-[#0F172A] text-white p-5 rounded-2xl flex items-center justify-between shadow-soft">
                <span className="text-sm uppercase tracking-wider text-slate-300 font-bold">
                  Gesamtbetrag (Zahlbar vor Ort)
                </span>
                <span className="text-3xl font-black text-[#38BDF8]">
                  {totalPrice} €
                </span>
              </div>

              <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md pt-3 pb-safe border-t border-slate-100 mt-6 flex items-center justify-between gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] px-4 -mx-4 sm:mx-0 sm:px-0 sm:shadow-none sm:border-t-0 sm:static">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-slate-600 hover:text-black font-semibold text-sm flex items-center gap-1.5 cursor-pointer min-h-[48px] px-3"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Zurück</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex-1 sm:flex-none sm:w-auto bg-[#0F172A] hover:bg-[#1E293B] text-white px-8 py-4 rounded-full font-bold text-base transition shadow-md flex items-center justify-center gap-2 cursor-pointer min-h-[50px]"
                >
                  <span>Weiter zu Kontaktdaten</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CONTACT & CONFIRMATION */}
          {step === 4 && (
            <form onSubmit={handleFinalizeBooking} className="space-y-5 animate-fadeIn">
              <div className="text-center max-w-md mx-auto mb-2">
                <h3 className="font-extrabold text-xl mb-1 text-[#0F172A]">
                  Kontaktdaten für die Reservierung
                </h3>
                <p className="text-xs text-gray-500">
                  Wir senden dir die Buchungsbestätigung und Terminerinnerung per E-Mail.
                </p>
              </div>

              {/* Compact Booking Overview Card */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="font-extrabold text-[#0F172A]">{selectedService.name}</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-semibold text-slate-700">{formatDateGerman(selectedDate)}</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-bold text-[#0EA5E9]">{selectedSlot.startTime} – {selectedSlot.endTime} Uhr</span>
                  <span className="text-slate-300">•</span>
                  <span>{childrenCount} {childrenCount === 1 ? 'Kind' : 'Kinder'}, {adultsCount} Erw.</span>
                  {includeSaltRoom && <span className="font-semibold text-sky-600">(+ Salzraum)</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-sm text-[#0F172A]">{totalPrice} €</span>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-xs font-bold text-sky-600 hover:text-sky-800 underline cursor-pointer"
                  >
                    Ändern
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Vollständiger Name des Elternteils *
                  </label>
                  <input
                    type="text"
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="z. B. Julia Schneider"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-base focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] min-h-[48px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      E-Mail-Adresse *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="julia.schneider@beispiel.de"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-base focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] min-h-[48px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Telefonnummer (für Rückfragen) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+49 170 1234567"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-base focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] min-h-[48px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Besondere Wünsche oder Anmerkungen (optional)
                  </label>
                  <input
                    type="text"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="z. B. Hochstuhl benötigt, Allergien, Zwillingskinder..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-base focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] min-h-[48px]"
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
                    className="w-4 h-4 rounded-sm text-[#0EA5E9] mt-1 focus:ring-[#0EA5E9]"
                  />
                  <span className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Ich akzeptiere die <strong>Hausregeln</strong> (Sockenpflicht für alle, elterliche Aufsichtspflicht, Altersbereich 0–8 Jahre) und die Buchungsbedingungen. *
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-[#0EA5E9] mt-1 focus:ring-[#0EA5E9]"
                  />
                  <span className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    (Optional) Informiert mich über Ferien-Workshops und exklusive Familien-Aktionen per E-Mail. Jederzeit widerrufbar.
                  </span>
                </label>
              </div>

              {/* Anti-Abuse Spam Protection (Cloudflare Turnstile) */}
              <TurnstileWidget
                onVerify={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
              />

              {/* Payment notification */}
              <div className="p-4 bg-[#F0F9FF] rounded-2xl border border-[#38BDF8]/40 text-[#0F172A] text-sm flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0EA5E9] shrink-0" />
                <span>
                  <strong>Zahlung vor Ort:</strong> Keine Online-Zahlung nötig. Du bezahlst bequem beim Check-in bar oder mit Karte ({totalPrice} €).
                </span>
              </div>

              {/* Special Cancellation Notice for Birthday Packages */}
              {selectedService.category === 'birthday' && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong>Stornierungsfrist für Kindergeburtstage:</strong> Da Festtisch und Catering exklusiv vorbereitet werden, gilt für Geburtstagspakete eine Stornierungsfrist von <strong>mindestens 48 Stunden vor Beginn</strong> (gem. AGB).
                  </span>
                </div>
              )}

              {submitError && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl flex items-center gap-2.5">
                  <X className="w-5 h-5 shrink-0 text-rose-500" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md pt-3 pb-safe border-t border-slate-100 mt-4 flex items-center justify-between gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] px-4 -mx-4 sm:mx-0 sm:px-0 sm:shadow-none sm:border-t-0 sm:static">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setStep(3)}
                  className="text-gray-600 hover:text-black font-semibold text-sm flex items-center gap-1 cursor-pointer min-h-[48px] px-3 disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Zurück</span>
                </button>
                <button
                  type="submit"
                  disabled={!acceptedRules || isSubmitting}
                  className="flex-1 sm:flex-none sm:w-auto bg-[#0EA5E9] hover:bg-[#0284C7] disabled:opacity-50 text-white px-8 py-3.5 rounded-2xl font-extrabold text-base transition shadow-float flex items-center justify-center gap-2 cursor-pointer min-h-[50px]"
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
              <div className="w-16 h-16 bg-[#F0F9FF] text-[#0EA5E9] rounded-full flex items-center justify-center mx-auto shadow-sm border border-[#38BDF8]/30">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0EA5E9] bg-[#F0F9FF] px-3 py-1 rounded-full border border-[#38BDF8]/30 inline-block mb-2">
                  Reservierung erfolgreich
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
                  Wir freuen uns auf euch, {confirmation.parentName}!
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Deine Bestätigung wurde an <strong className="text-gray-800">{confirmation.email}</strong> gesendet.
                </p>
              </div>

              {/* Booking Ticket Card */}
              <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-gray-200 text-left space-y-3.5 max-w-lg mx-auto shadow-soft">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-xs text-gray-500 font-semibold">Buchungsreferenz</span>
                  <span className="font-mono font-extrabold text-base text-[#0F172A] bg-white px-3 py-1 rounded-lg border border-gray-200">
                    {confirmation.reference}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500 block">Datum & Zeit</span>
                    <strong className="text-slate-800 font-semibold block mt-0.5">
                      {confirmation.date} • {confirmation.timeSlot.startTime} - {confirmation.timeSlot.endTime} Uhr
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Paket</span>
                    <strong className="text-slate-800 font-semibold block mt-0.5">
                      {confirmation.service.name}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm border-t border-slate-200/60 pt-3">
                  <div>
                    <span className="text-slate-500 block">Gäste</span>
                    <strong className="text-slate-800 font-semibold block mt-0.5">
                      {confirmation.childrenCount} {confirmation.childrenCount === 1 ? 'Kind' : 'Kinder'} & {confirmation.adultsCount} Begleitpersonen
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Salzraum Add-on</span>
                    <strong className="text-slate-800 font-semibold block mt-0.5">
                      {confirmation.includeSaltRoomAddon ? 'Ja (45 Min)' : 'Nein'}
                    </strong>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-slate-200 pt-3 text-base">
                  <span className="font-bold text-slate-700">Zu zahlen vor Ort:</span>
                  <span className="font-black text-2xl text-[#0F172A]">
                    {confirmation.totalPrice} €
                  </span>
                </div>

                <div className="border-t border-slate-200/60 pt-2.5 text-xs text-slate-500 flex items-center justify-between">
                  <span>Stornierungsfrist:</span>
                  <span className="font-semibold text-slate-700">
                    {confirmation.service.category === 'birthday'
                      ? 'Bis 48 Std. vor Beginn kostenfrei'
                      : 'Bis 2 Std. vor Beginn online'}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={generateIcsFile}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-bold transition shadow-sm cursor-pointer min-h-[48px]"
                >
                  <Download className="w-4 h-4" />
                  <span>Termin im Kalender speichern (.ics)</span>
                </button>

                <a
                  href={`https://wa.me/493012345678?text=Hallo%20Haven%20Kids%20Caf%C3%A9%20Team%2C%20ich%20habe%20eine%20Frage%20zu%20meiner%20Buchung%20${confirmation.reference}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-sm font-bold transition shadow-sm min-h-[48px]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Frage per WhatsApp stellen</span>
                </a>
              </div>

              {/* Disclaimer reminder */}
              <div className="pt-2">
                <MedicalDisclaimer className="text-xs text-left" />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-sm font-bold text-slate-500 hover:text-slate-800 cursor-pointer min-h-[44px] min-w-[44px]"
                >
                  Fenster schließen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  ) : null;
};
