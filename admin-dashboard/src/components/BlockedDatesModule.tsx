import React, { useState, useEffect } from 'react';
import type { StaffRole, AdminBlockedDate, AdminTimeSlot } from '../types/admin';
import {
  fetchBlockedDates,
  addBlockedDate,
  removeBlockedDate,
  fetchTimeSlotsForDate,
  updateTimeSlot,
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2 font-heading">
              <Clock className="w-5 h-5 text-sky-400" />
              Zeitslot-Aktivierung &amp; Kapazitätssteuerung
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Passe maximale Kinderkapazitäten je Zeitfenster an oder schalte einzelne Slots gezielt ab.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Datum:</span>
            <input
              type="date"
              value={selectedSlotDate}
              onChange={(e) => setSelectedSlotDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs font-medium focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
        </div>

        {isLoadingSlots ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-400 mb-2" />
            <span>Zeitslots werden geladen...</span>
          </div>
        ) : slots.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Für dieses Datum sind derzeit keine separaten Slot-Overrides angelegt. Es gelten die Standard-Kapazitäten (20 Kinder / Slot).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Zeitslot</th>
                  <th className="py-3 px-4">Gebuchte Kinder</th>
                  <th className="py-3 px-4">Max. Kapazität</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {slots.map((slot) => {
                  const isConflict = slot.maxCapacity < slot.bookedCount;

                  return (
                    <tr key={slot.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {slot.startTime} – {slot.endTime} Uhr
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-300">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          {slot.bookedCount} Kinder
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            disabled={!canEdit}
                            min={1}
                            max={50}
                            value={slot.maxCapacity}
                            onChange={(e) =>
                              handleSlotCapacityChange(slot.id, parseInt(e.target.value, 10) || 1)
                            }
                            className={`w-16 px-2.5 py-1 rounded-xl border text-xs font-bold text-center bg-slate-950 disabled:bg-slate-900 ${
                              isConflict
                                ? 'border-rose-500 text-rose-400 bg-rose-500/10'
                                : 'border-slate-700 text-sky-400'
                            }`}
                          />
                          <span className="text-[11px] text-slate-500">Plätze</span>
                        </div>
                        {isConflict && (
                          <div className="text-[10px] text-rose-400 font-semibold mt-1">
                            Achtung: Kleiner als gebucht ({slot.bookedCount})!
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          disabled={!canEdit}
                          onClick={() => handleToggleSlotActive(slot.id)}
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition cursor-pointer disabled:cursor-not-allowed ${
                            slot.isActive
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {slot.isActive ? 'Aktiv' : 'Deaktiviert'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleSaveSlot(slot)}
                            disabled={savingSlotId === slot.id || isConflict}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-sky-500 hover:text-white text-slate-200 border border-slate-700 transition font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {savingSlotId === slot.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Save className="w-3 h-3" />
                            )}
                            <span>Speichern</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}
    </div>
  );
};
