import React, { useState, useEffect } from 'react';
import type { StaffRole, AdminBlockedDate, AdminTimeSlot } from '../types/admin';
import {
  fetchBlockedDates,
  addBlockedDate,
  removeBlockedDate,
  fetchTimeSlotsForDate,
  updateTimeSlot,
  addTimeSlot,
  deleteTimeSlot,
  initializeDefaultSlotsForDate,
  bulkToggleSlotsActive,
} from '../services/adminService';
import {
  CalendarX,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Save,
  Users,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Percent,
  Check,
  X,
  Calendar,
  PlusCircle,
} from 'lucide-react';

interface BlockedDatesModuleProps {
  currentRole: StaffRole;
  viewMode?: 'all' | 'blocked-dates' | 'capacity';
}

export const BlockedDatesModule: React.FC<BlockedDatesModuleProps> = ({ currentRole, viewMode = 'all' }) => {
  const canEdit = currentRole === 'owner' || currentRole === 'admin';

  // Blocked Dates State
  const [blockedDates, setBlockedDates] = useState<AdminBlockedDate[]>([]);
  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Time Slots State
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedSlotDate, setSelectedSlotDate] = useState(todayStr);
  const [slots, setSlots] = useState<AdminTimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [savingSlotId, setSavingSlotId] = useState<string | null>(null);
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);
  const [isInitializingDefaults, setIsInitializingDefaults] = useState(false);
  const [isBulking, setIsBulking] = useState(false);

  // Add Custom Slot Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSlotForm, setNewSlotForm] = useState({
    startTime: '17:30',
    endTime: '19:30',
    maxCapacity: 20,
    serviceId: 'einzelbesuch',
    isActive: true,
  });
  const [isSubmittingSlot, setIsSubmittingSlot] = useState(false);

  // General Loading & Feedback
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchBlockedDates().then((data) => {
      setBlockedDates(data);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    setIsLoadingSlots(true);
    fetchTimeSlotsForDate(selectedSlotDate).then((data) => {
      setSlots(data);
      setIsLoadingSlots(false);
    });
  }, [selectedSlotDate]);

  // Handle Add Blocked Date
  const handleAddBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !newDate) return;

    if (blockedDates.some((b) => b.date === newDate)) {
      setFeedback({ type: 'error', text: 'Dieses Datum ist bereits als Schließtag hinterlegt.' });
      return;
    }

    setIsAddingBlock(true);
    setFeedback(null);

    const res = await addBlockedDate(newDate, newReason);
    setIsAddingBlock(false);

    if (res.success && res.item) {
      setBlockedDates((prev) => [...prev, res.item!].sort((a, b) => a.date.localeCompare(b.date)));
      setNewDate('');
      setNewReason('');
      setFeedback({ type: 'success', text: `Schließtag am ${newDate} erfolgreich eingetragen.` });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', text: res.error || 'Fehler beim Eintragen des Schließtages' });
    }
  };

  // Handle Remove Blocked Date
  const handleRemoveBlockedDate = async (id: string, date: string) => {
    if (!canEdit) return;
    setDeletingId(id);
    setFeedback(null);

    const res = await removeBlockedDate(id);
    setDeletingId(null);

    if (res.success) {
      setBlockedDates((prev) => prev.filter((b) => b.id !== id));
      setFeedback({ type: 'success', text: `Sperre für den ${date} aufgehoben. Tag ist wieder buchbar.` });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', text: res.error || 'Fehler beim Aufheben der Sperre' });
    }
  };

  // Handle Slot Capacity Change with Validation
  const handleSlotCapacityChange = (slotId: string, newCap: number) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, maxCapacity: newCap } : s))
    );
  };

  // Handle Slot Active Toggle
  const handleToggleSlotActive = (slotId: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, isActive: !s.isActive } : s))
    );
  };

  // Handle Slot Hours Change
  const handleSlotHoursChange = (slotId: string, startTime: string, endTime: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, startTime, endTime } : s))
    );
  };

  // Handle Date Navigation Offsets
  const handleDateOffset = (offsetDays: number) => {
    const current = new Date(selectedSlotDate);
    current.setDate(current.getDate() + offsetDays);
    setSelectedSlotDate(current.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    setSelectedSlotDate(todayStr);
  };

  const handleSetTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setSelectedSlotDate(d.toISOString().split('T')[0]);
  };

  // Handle Initialize Default Slots for Date
  const handleInitializeDefaults = async () => {
    if (!canEdit) return;
    setIsInitializingDefaults(true);
    setFeedback(null);

    const res = await initializeDefaultSlotsForDate(selectedSlotDate);
    setIsInitializingDefaults(false);

    if (res.success && res.slots) {
      setSlots(res.slots);
      setFeedback({
        type: 'success',
        text: `Standard-Zeitslots für den ${selectedSlotDate} erfolgreich eingerichtet.`,
      });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', text: res.error || 'Fehler beim Erstellen der Standard-Slots' });
    }
  };

  // Handle Create New Custom Time Slot
  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    if (!newSlotForm.startTime || !newSlotForm.endTime) {
      setFeedback({ type: 'error', text: 'Bitte Start- und Endzeit angeben.' });
      return;
    }

    setIsSubmittingSlot(true);
    setFeedback(null);

    const res = await addTimeSlot({
      date: selectedSlotDate,
      startTime: newSlotForm.startTime,
      endTime: newSlotForm.endTime,
      maxCapacity: Number(newSlotForm.maxCapacity) || 20,
      serviceId: newSlotForm.serviceId,
      isActive: newSlotForm.isActive,
    });

    setIsSubmittingSlot(false);

    if (res.success && res.item) {
      setSlots((prev) =>
        [...prev, res.item!].sort((a, b) => a.startTime.localeCompare(b.startTime))
      );
      setIsAddModalOpen(false);
      setFeedback({
        type: 'success',
        text: `Neuer Zeitslot (${res.item.startTime} – ${res.item.endTime} Uhr) erfolgreich hinzugefügt.`,
      });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', text: res.error || 'Fehler beim Anlegen des Zeitslots' });
    }
  };

  // Handle Delete Slot
  const handleDeleteSlot = async (slotId: string, timeLabel: string) => {
    if (!canEdit) return;
    setDeletingSlotId(slotId);
    setFeedback(null);

    const res = await deleteTimeSlot(slotId);
    setDeletingSlotId(null);

    if (res.success) {
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
      setFeedback({
        type: 'success',
        text: `Zeitslot ${timeLabel} erfolgreich gelöscht.`,
      });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', text: res.error || 'Fehler beim Löschen des Zeitslots' });
    }
  };

  // Handle Bulk Toggle Active / Inactive
  const handleBulkToggle = async (active: boolean) => {
    if (!canEdit) return;
    setIsBulking(true);
    setFeedback(null);

    const res = await bulkToggleSlotsActive(selectedSlotDate, active);
    setIsBulking(false);

    if (res.success) {
      setSlots((prev) => prev.map((s) => ({ ...s, isActive: active })));
      setFeedback({
        type: 'success',
        text: `Alle Zeitslots für den ${selectedSlotDate} wurden ${active ? 'aktiviert' : 'gesperrt'}.`,
      });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', text: res.error || 'Fehler beim Aktualisieren der Slots' });
    }
  };

  // Handle Save Slot
  const handleSaveSlot = async (slot: AdminTimeSlot) => {
    if (!canEdit) return;

    // Safety constraint: Prevent capacity reduction below already booked count
    if (slot.maxCapacity < slot.bookedCount) {
      setFeedback({
        type: 'error',
        text: `Ungültige Kapazität für Slot ${slot.startTime} Uhr: Es liegen bereits ${slot.bookedCount} Buchungen vor. Die Kapazität kann nicht auf ${slot.maxCapacity} gesenkt werden.`,
      });
      return;
    }

    setSavingSlotId(slot.id);
    setFeedback(null);

    const res = await updateTimeSlot(slot.id, {
      maxCapacity: slot.maxCapacity,
      isActive: slot.isActive,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });

    setSavingSlotId(null);

    if (res.success) {
      setFeedback({
        type: 'success',
        text: `Zeitslot ${slot.startTime} – ${slot.endTime} Uhr erfolgreich aktualisiert.`,
      });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', text: res.error || 'Fehler beim Speichern des Zeitslots' });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/90 rounded-2xl p-12 border border-slate-800 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-sky-400 mb-2" />
        <span className="text-xs">Schließtage &amp; Slotdaten werden geladen...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Role permission info */}
      {!canEdit ? (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-amber-200 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block mb-0.5">Eingeschränkte Leseberechtigung (Rolle: Staff)</strong>
            <span>
              Schließtage und Zeitslot-Kapazitäten können ausschließlich von Administratoren und Inhabern verwaltet werden.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3 text-emerald-300 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block mb-0.5">Betriebssteuerung aktiv (Rolle: {currentRole})</strong>
            <span>
              Geschlossene Tage werden im Buchungskalender sofort gesperrt. Kapazitätsänderungen verhindern automatisch Überbuchungen bereits reservierter Plätze.
            </span>
          </div>
        </div>
      )}

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* SECTION 1: Blocked Dates (Day Closures) */}
      {(viewMode === 'all' || viewMode === 'blocked-dates') && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2 font-heading">
              <CalendarX className="w-5 h-5 text-rose-400" />
              Schließtage &amp; Betriebsruhe
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              An diesen Tagen können Kunden im Buchungsportal keine Zeitslots buchen (z. B. Feiertage, Exklusivfeiern).
            </p>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {blockedDates.length} Schließtage aktiv
          </span>
        </div>

        {/* Add Blocked Date Form */}
        {canEdit && (
          <form onSubmit={handleAddBlockedDate} className="bg-slate-950/70 p-4.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-end gap-3">
            <div className="w-full sm:w-44">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Datum wählen *
              </label>
              <input
                type="date"
                required
                min={todayStr}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div className="flex-1 w-full">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Grund / Notiz (z. B. Feiertag, Wartung, Exklusiv-Event)
              </label>
              <input
                type="text"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="Grund der Schließung..."
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isAddingBlock || !newDate}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-rose-950 disabled:opacity-50"
            >
              {isAddingBlock ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>Tag schließen</span>
            </button>
          </form>
        )}

        {/* Blocked Dates List */}
        <div className="overflow-x-auto">
          {blockedDates.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Derzeit sind keine Schließtage hinterlegt. Das Café ist an regulären Öffnungstagen buchbar.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Datum</th>
                  <th className="py-3 px-4">Grund der Schließung</th>
                  <th className="py-3 px-4">Eingetragen am</th>
                  <th className="py-3 px-4 text-right">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {blockedDates.map((block) => (
                  <tr key={block.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-rose-400 font-mono">
                      {block.date}
                    </td>
                    <td className="py-3.5 px-4 text-slate-200">
                      {block.reason || 'Betriebsruhe'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {block.createdAt ? new Date(block.createdAt).toLocaleDateString('de-DE') : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBlockedDate(block.id, block.date)}
                          disabled={deletingId === block.id}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                          title="Sperre aufheben"
                        >
                          {deletingId === block.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          <span>Freigeben</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      )}

      {/* SECTION 2: Slot Capacity & Activation Controls */}
      {(viewMode === 'all' || viewMode === 'capacity') && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-6 space-y-6">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2.5 font-heading">
                <Clock className="w-5 h-5 text-sky-400" />
                Zeitslot-Aktivierung &amp; Kapazitätssteuerung
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Volle Kontrolle über Uhrzeiten, Kinderkapazitäten und Status für jeden einzelnen Tag.
              </p>
            </div>

            {/* Quick Actions */}
            {canEdit && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition shadow-md shadow-sky-500/20 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Neuer Zeitslot</span>
                </button>

                <button
                  type="button"
                  onClick={handleInitializeDefaults}
                  disabled={isInitializingDefaults}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Fügt die 4 Standard-Slots (10:00-19:30 Uhr) für diesen Tag ein"
                >
                  {isInitializingDefaults ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>Standard-Slots ({slots.length})</span>
                </button>

                <div className="flex items-center border border-slate-700 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleBulkToggle(true)}
                    disabled={isBulking || slots.length === 0}
                    className="px-2.5 py-2 bg-slate-800 hover:bg-emerald-500/20 text-emerald-400 font-bold text-[11px] transition inline-flex items-center gap-1 cursor-pointer disabled:opacity-40"
                    title="Alle Slots dieses Tages aktivieren"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Alle an</span>
                  </button>
                  <div className="w-[1px] h-6 bg-slate-700" />
                  <button
                    type="button"
                    onClick={() => handleBulkToggle(false)}
                    disabled={isBulking || slots.length === 0}
                    className="px-2.5 py-2 bg-slate-800 hover:bg-rose-500/20 text-rose-400 font-bold text-[11px] transition inline-flex items-center gap-1 cursor-pointer disabled:opacity-40"
                    title="Alle Slots dieses Tages sperren"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Alle aus</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Date Selector & Fast Navigation Bar */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sky-400" />
                Ausgewähltes Datum:
              </span>
              <input
                type="date"
                value={selectedSlotDate}
                onChange={(e) => setSelectedSlotDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs font-bold focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={() => handleDateOffset(-1)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer flex items-center gap-1"
                title="Vorheriger Tag"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Vorheriger Tag</span>
              </button>
              <button
                type="button"
                onClick={handleSetToday}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedSlotDate === todayStr
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Heute
              </button>
              <button
                type="button"
                onClick={handleSetTomorrow}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Morgen
              </button>
              <button
                type="button"
                onClick={() => handleDateOffset(1)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer flex items-center gap-1"
                title="Nächster Tag"
              >
                <span className="hidden sm:inline">Nächster Tag</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Daily Summary Statistics */}
          {slots.length > 0 && (() => {
            const totalMaxCap = slots.reduce((acc, s) => acc + s.maxCapacity, 0);
            const totalBooked = slots.reduce((acc, s) => acc + s.bookedCount, 0);
            const totalFree = Math.max(0, totalMaxCap - totalBooked);
            const dayOccupancy = totalMaxCap > 0 ? Math.round((totalBooked / totalMaxCap) * 100) : 0;
            const activeCount = slots.filter((s) => s.isActive).length;

            return (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    Tageskapazität
                  </div>
                  <div className="text-xl font-extrabold text-white">
                    {totalMaxCap} <span className="text-xs font-normal text-slate-400">Kinder</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    über {slots.length} Zeitfenster
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Gebuchte Kinder
                  </div>
                  <div className="text-xl font-extrabold text-emerald-400">
                    {totalBooked} <span className="text-xs font-normal text-slate-400">reserviert</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    automatisch gesichert
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Freie Restplätze
                  </div>
                  <div className={`text-xl font-extrabold ${totalFree > 0 ? 'text-sky-400' : 'text-rose-400'}`}>
                    {totalFree} <span className="text-xs font-normal text-slate-400">Plätze frei</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    für neue Besucher
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-semibold mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-indigo-400" />
                      Auslastung
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{activeCount}/{slots.length} aktiv</span>
                  </div>
                  <div className="text-xl font-extrabold text-white">
                    {dayOccupancy}%
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        dayOccupancy >= 85 ? 'bg-rose-500' : dayOccupancy >= 50 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, dayOccupancy)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Slots Table or Loading/Empty State */}
          {isLoadingSlots ? (
            <div className="py-14 text-center text-xs text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin mx-auto text-sky-400 mb-2" />
              <span>Zeitslots für {selectedSlotDate} werden geladen...</span>
            </div>
          ) : slots.length === 0 ? (
            <div className="py-10 px-6 rounded-2xl bg-slate-950/50 border border-dashed border-slate-800 text-center space-y-3">
              <Clock className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-slate-300 text-sm font-bold">
                Keine separaten Zeitslots für den {selectedSlotDate} angelegt.
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Klicke auf den Button unten, um automatisch die Standard-Slots für diesen Tag anzulegen, oder erstelle benutzerdefinierte Zeitfenster.
              </p>
              {canEdit && (
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleInitializeDefaults}
                    disabled={isInitializingDefaults}
                    className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition cursor-pointer inline-flex items-center gap-2 shadow-lg shadow-sky-500/20"
                  >
                    {isInitializingDefaults ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>Standard-Slots jetzt anlegen (4 Fenster)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition cursor-pointer inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Eigenen Slot hinzufügen</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Zeitslot (Uhrzeit)</th>
                    <th className="py-3.5 px-4">Auslastung &amp; Plätze</th>
                    <th className="py-3.5 px-4">Max. Kapazität</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
                  {slots.map((slot) => {
                    const isConflict = slot.maxCapacity < slot.bookedCount;
                    const freeCount = Math.max(0, slot.maxCapacity - slot.bookedCount);
                    const occupancyRatio =
                      slot.maxCapacity > 0
                        ? Math.min(100, Math.round((slot.bookedCount / slot.maxCapacity) * 100))
                        : 0;

                    return (
                      <tr key={slot.id} className="hover:bg-slate-800/40 transition">
                        {/* Time Column with editable hours */}
                        <td className="py-3.5 px-4 font-bold text-white">
                          <div className="flex items-center gap-1.5">
                            {canEdit ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={slot.startTime}
                                  onChange={(e) =>
                                    handleSlotHoursChange(slot.id, e.target.value, slot.endTime)
                                  }
                                  className="w-14 px-2 py-1 rounded-lg border border-slate-700 bg-slate-950 text-white text-xs font-bold text-center focus:border-sky-500 outline-none"
                                />
                                <span className="text-slate-500 font-bold">–</span>
                                <input
                                  type="text"
                                  value={slot.endTime}
                                  onChange={(e) =>
                                    handleSlotHoursChange(slot.id, slot.startTime, e.target.value)
                                  }
                                  className="w-14 px-2 py-1 rounded-lg border border-slate-700 bg-slate-950 text-white text-xs font-bold text-center focus:border-sky-500 outline-none"
                                />
                                <span className="text-slate-400 text-[11px] ml-0.5">Uhr</span>
                              </div>
                            ) : (
                              <span>
                                {slot.startTime} – {slot.endTime} Uhr
                              </span>
                            )}
                          </div>
                          <span className="inline-block mt-1 text-[10px] text-slate-500 font-medium capitalize">
                            {slot.serviceId || 'einzelbesuch'}
                          </span>
                        </td>

                        {/* Occupancy Progress Bar & Spots Left */}
                        <td className="py-3.5 px-4 min-w-[170px]">
                          <div className="flex items-center justify-between gap-2 text-xs mb-1">
                            <span className="inline-flex items-center gap-1 font-bold text-white">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              {slot.bookedCount} Kinder
                            </span>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                slot.bookedCount >= slot.maxCapacity
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : freeCount <= 3
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {slot.bookedCount >= slot.maxCapacity
                                ? 'Ausgebucht'
                                : `${freeCount} frei`}
                            </span>
                          </div>

                          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                occupancyRatio >= 100
                                  ? 'bg-rose-500'
                                  : occupancyRatio >= 65
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-400'
                              }`}
                              style={{ width: `${occupancyRatio}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">
                            {occupancyRatio}% Auslastung
                          </div>
                        </td>

                        {/* Capacity Stepper */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleSlotCapacityChange(
                                    slot.id,
                                    Math.max(slot.bookedCount, slot.maxCapacity - 1)
                                  )
                                }
                                disabled={slot.maxCapacity <= slot.bookedCount}
                                className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Kapazität verringern"
                              >
                                -
                              </button>
                            )}

                            <input
                              type="number"
                              disabled={!canEdit}
                              min={slot.bookedCount}
                              max={60}
                              value={slot.maxCapacity}
                              onChange={(e) =>
                                handleSlotCapacityChange(
                                  slot.id,
                                  parseInt(e.target.value, 10) || slot.bookedCount
                                )
                              }
                              className={`w-14 px-2 py-1 rounded-xl border text-xs font-bold text-center bg-slate-950 disabled:bg-slate-900 ${
                                isConflict
                                  ? 'border-rose-500 text-rose-400 bg-rose-500/10'
                                  : 'border-slate-700 text-sky-400'
                              }`}
                            />

                            {canEdit && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleSlotCapacityChange(
                                    slot.id,
                                    Math.min(60, slot.maxCapacity + 1)
                                  )
                                }
                                className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center transition cursor-pointer"
                                title="Kapazität erhöhen"
                              >
                                +
                              </button>
                            )}
                            <span className="text-[11px] text-slate-500 ml-1">Plätze</span>
                          </div>
                          {isConflict && (
                            <div className="text-[10px] text-rose-400 font-semibold mt-1">
                              Achtung: Kleiner als gebucht ({slot.bookedCount})!
                            </div>
                          )}
                        </td>

                        {/* Status Toggle Switch */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            disabled={!canEdit}
                            onClick={() => handleToggleSlotActive(slot.id)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition cursor-pointer disabled:cursor-not-allowed inline-flex items-center gap-1.5 ${
                              slot.isActive
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                slot.isActive ? 'bg-emerald-400' : 'bg-rose-400'
                              }`}
                            />
                            {slot.isActive ? 'Aktiv (Buchbar)' : 'Gesperrt'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {canEdit && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleSaveSlot(slot)}
                                  disabled={savingSlotId === slot.id || isConflict}
                                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-sky-500 hover:text-white text-slate-200 border border-slate-700 transition font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                  title="Änderungen für diesen Slot speichern"
                                >
                                  {savingSlotId === slot.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Save className="w-3.5 h-3.5" />
                                  )}
                                  <span>Speichern</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteSlot(
                                      slot.id,
                                      `${slot.startTime} – ${slot.endTime} Uhr`
                                    )
                                  }
                                  disabled={
                                    deletingSlotId === slot.id || slot.bookedCount > 0
                                  }
                                  className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                  title={
                                    slot.bookedCount > 0
                                      ? 'Kann nicht gelöscht werden, da Buchungen vorliegen'
                                      : 'Zeitslot löschen'
                                  }
                                >
                                  {deletingSlotId === slot.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Slot Modal */}
          {isAddModalOpen && (
            <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-bold text-base text-white flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-sky-400" />
                    Neuen Zeitslot anlegen
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateSlot} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Datum
                    </label>
                    <input
                      type="date"
                      disabled
                      value={selectedSlotDate}
                      className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 text-xs font-bold"
                    />
                  </div>

                  {/* Preset Buttons */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Schnellvorlagen (Uhrzeit)
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { s: '10:00', e: '12:00' },
                        { s: '12:30', e: '14:30' },
                        { s: '15:00', e: '17:00' },
                        { s: '17:30', e: '19:30' },
                        { s: '18:00', e: '20:00' },
                        { s: '09:00', e: '11:00' },
                      ].map((item) => (
                        <button
                          key={`${item.s}-${item.e}`}
                          type="button"
                          onClick={() =>
                            setNewSlotForm((prev) => ({
                              ...prev,
                              startTime: item.s,
                              endTime: item.e,
                            }))
                          }
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                            newSlotForm.startTime === item.s && newSlotForm.endTime === item.e
                              ? 'bg-sky-500/20 text-sky-400 border-sky-500'
                              : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {item.s} – {item.e}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Startzeit (z.B. 10:00) *
                      </label>
                      <input
                        type="text"
                        required
                        value={newSlotForm.startTime}
                        onChange={(e) =>
                          setNewSlotForm((prev) => ({ ...prev, startTime: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs font-bold focus:border-sky-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Endzeit (z.B. 12:00) *
                      </label>
                      <input
                        type="text"
                        required
                        value={newSlotForm.endTime}
                        onChange={(e) =>
                          setNewSlotForm((prev) => ({ ...prev, endTime: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs font-bold focus:border-sky-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Max. Kinderkapazität (Plätze)
                    </label>
                    <div className="flex items-center gap-2">
                      {[10, 15, 20, 25].map((cap) => (
                        <button
                          key={cap}
                          type="button"
                          onClick={() => setNewSlotForm((prev) => ({ ...prev, maxCapacity: cap }))}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                            newSlotForm.maxCapacity === cap
                              ? 'bg-sky-500 text-white border-sky-500'
                              : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {cap}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Kategorie / Service
                    </label>
                    <select
                      value={newSlotForm.serviceId}
                      onChange={(e) =>
                        setNewSlotForm((prev) => ({ ...prev, serviceId: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs font-bold focus:border-sky-500 outline-none cursor-pointer"
                    >
                      <option value="einzelbesuch">Einzelbesuch (Spielbereich)</option>
                      <option value="kindergeburtstag">Kindergeburtstag (Partybereich)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="newSlotActive"
                      checked={newSlotForm.isActive}
                      onChange={(e) =>
                        setNewSlotForm((prev) => ({ ...prev, isActive: e.target.checked }))
                      }
                      className="w-4 h-4 rounded border-slate-700 text-sky-500 bg-slate-950 focus:ring-0 cursor-pointer"
                    />
                    <label
                      htmlFor="newSlotActive"
                      className="text-xs font-semibold text-slate-300 cursor-pointer"
                    >
                      Zeitslot sofort als aktiv (buchbar) schalten
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingSlot}
                      className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-sky-500/20 inline-flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSubmittingSlot ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      <span>Zeitslot anlegen</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
