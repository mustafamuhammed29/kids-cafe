import React, { useState, useEffect } from 'react';
import type { StaffRole, AdminAnnouncement, AnnouncementType } from '../types/admin';
import {
  fetchAdminAnnouncements,
  saveAdminAnnouncement,
  deleteAdminAnnouncement,
  validateSafeUrl,
} from '../services/adminService';
import {
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Loader2,
  Calendar,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Info,
  AlertTriangle,
  Flame,
  Check,
} from 'lucide-react';

interface SiteAnnouncementsModuleProps {
  currentRole: StaffRole;
}

export const SiteAnnouncementsModule: React.FC<SiteAnnouncementsModuleProps> = ({ currentRole }) => {
  const canManage = currentRole === 'owner' || currentRole === 'admin';

  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit / Create modal state
  const [editingItem, setEditingItem] = useState<Partial<AdminAnnouncement> | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchAdminAnnouncements();
    setAnnouncements(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartCreate = () => {
    if (!canManage) return;
    setEditingItem({
      message: '',
      type: 'info',
      isActive: true,
      linkText: '',
      linkUrl: '',
      startsAt: '',
      endsAt: '',
    });
  };

  const handleStartEdit = (item: AdminAnnouncement) => {
    if (!canManage) return;
    setEditingItem({
      ...item,
      startsAt: item.startsAt ? item.startsAt.substring(0, 16) : '',
      endsAt: item.endsAt ? item.endsAt.substring(0, 16) : '',
    });
  };

  const handleQuickToggleActive = async (item: AdminAnnouncement) => {
    if (!canManage) return;
    const newActive = !item.isActive;
    const res = await saveAdminAnnouncement({ id: item.id, isActive: newActive });
    if (res.success) {
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, isActive: newActive } : a))
      );
      setStatusMessage({
        type: 'success',
        text: `Ankündigung ${newActive ? 'aktiviert' : 'deaktiviert'}.`,
      });
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Fehler beim Ändern des Status' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!canManage) return;
    if (!window.confirm('Möchtest du diese Ankündigung wirklich unwiderruflich löschen?')) return;

    const res = await deleteAdminAnnouncement(id);
    if (res.success) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      setStatusMessage({ type: 'success', text: 'Ankündigung erfolgreich gelöscht.' });
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Fehler beim Löschen' });
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage || !editingItem || !editingItem.message?.trim()) return;

    if (editingItem.linkUrl && !validateSafeUrl(editingItem.linkUrl)) {
      setStatusMessage({
        type: 'error',
        text: 'Ungültige Link-URL: Unsichere URL-Schemata (z.B. javascript:, data:) sind nicht erlaubt.',
      });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    const payload: Partial<AdminAnnouncement> = {
      ...editingItem,
      message: editingItem.message.trim(),
      linkText: editingItem.linkText?.trim() || null,
      linkUrl: editingItem.linkUrl?.trim() || null,
      startsAt: editingItem.startsAt ? new Date(editingItem.startsAt).toISOString() : null,
      endsAt: editingItem.endsAt ? new Date(editingItem.endsAt).toISOString() : null,
    };

    const res = await saveAdminAnnouncement(payload);
    setIsSaving(false);

    if (res.success) {
      setEditingItem(null);
      await loadData();
      setStatusMessage({ type: 'success', text: 'Ankündigung erfolgreich gespeichert.' });
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Fehler beim Speichern der Ankündigung' });
    }
  };

  const getTypeBadge = (type: AnnouncementType) => {
    switch (type) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/70 text-rose-300 border border-rose-800/60">
            <Flame className="w-3 h-3 text-rose-400" /> Dringend
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/70 text-amber-300 border border-amber-800/60">
            <AlertTriangle className="w-3 h-3 text-amber-400" /> Hinweis
          </span>
        );
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
            <Check className="w-3 h-3 text-emerald-400" /> Positiv
          </span>
        );
      case 'info':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-950/70 text-sky-300 border border-sky-800/60">
            <Info className="w-3 h-3 text-sky-400" /> Info
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/90 rounded-2xl p-12 border border-slate-800 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-sky-400 mb-2" />
        <span className="text-xs">Website-Ankündigungen werden geladen...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Role Notice */}
      {!canManage ? (
        <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-2xl flex items-start gap-3 text-amber-300 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block mb-0.5">Eingeschränkte Leseberechtigung (Rolle: {currentRole})</strong>
            <span className="text-amber-200/80">
              Nur Administratoren und die Inhaberin können Website-Ankündigungen erstellen, bearbeiten oder löschen. Als Mitarbeiter hast du lesenden Zugriff.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl flex items-start gap-3 text-emerald-300 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block mb-0.5">Verwaltungsberechtigung aktiv ({currentRole})</strong>
            <span className="text-emerald-200/80">
              Du kannst operative Banner und Ankündigungen auf der öffentlichen Website schalten, zeitlich steuern und verlinken.
            </span>
          </div>
        </div>
      )}

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
              : 'bg-rose-950/60 border-rose-800/60 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Header with Action */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl shadow-black/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-sky-400" />
            Website-Ankündigungen &amp; Banner
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Steuerung des globalen Benachrichtigungsbanners für Feiertage, Ferienzeiten oder Sonderaktionen.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={handleStartCreate}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Neue Ankündigung anlegen</span>
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-slate-900/90 rounded-2xl p-10 border border-slate-800 text-center text-slate-400">
            <Megaphone className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-xs font-semibold text-slate-300">Keine Ankündigungen vorhanden</p>
            <span className="text-[11px] text-slate-500 block mt-1">
              Erstelle eine neue Ankündigung, um Besuchern wichtige Neuigkeiten mitzuteilen.
            </span>
          </div>
        ) : (
          announcements.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl p-5 border transition shadow-lg shadow-black/10 ${
                item.isActive
                  ? 'bg-slate-900/90 border-slate-800/90 hover:border-slate-700'
                  : 'bg-slate-950/60 border-dashed border-slate-800/80 opacity-70'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getTypeBadge(item.type)}

                    {item.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                        <Eye className="w-3 h-3" /> Live aktiv
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        <EyeOff className="w-3 h-3" /> Deaktiviert
                      </span>
                    )}

                    {(item.startsAt || item.endsAt) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {item.startsAt ? new Date(item.startsAt).toLocaleDateString('de-DE') : 'sofort'} bis{' '}
                        {item.endsAt ? new Date(item.endsAt).toLocaleDateString('de-DE') : 'unbegrenzt'}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                    {item.message}
                  </p>

                  {(item.linkText || item.linkUrl) && (
                    <div className="flex items-center gap-2 text-xs text-sky-300 bg-sky-950/50 px-3 py-1.5 rounded-xl border border-sky-800/60 w-fit">
                      <LinkIcon className="w-3 h-3 text-sky-400" />
                      <span className="font-semibold">{item.linkText || 'Link'}:</span>
                      <span className="text-sky-400/80 font-mono text-[11px]">{item.linkUrl || '#'}</span>
                    </div>
                  )}
                </div>

                {canManage && (
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    <button
                      type="button"
                      onClick={() => handleQuickToggleActive(item)}
                      title={item.isActive ? 'Deaktivieren' : 'Aktivieren'}
                      className={`p-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        item.isActive
                          ? 'border-emerald-800/60 bg-emerald-950/50 text-emerald-400 hover:bg-emerald-900/50'
                          : 'border-slate-700 bg-slate-800/80 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartEdit(item)}
                      className="p-2 rounded-xl border border-slate-700/80 bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Bearbeiten"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-xl border border-rose-900/50 bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 transition cursor-pointer"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit / Create Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Operative Steuerung</span>
                <h3 className="text-base font-extrabold text-white">
                  {editingItem.id ? 'Ankündigung bearbeiten' : 'Neue Ankündigung erstellen'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nachricht / Text <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={editingItem.message || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, message: e.target.value })}
                  placeholder="z. B. Herbstferien: Wir haben ab sofort auch montags geöffnet!"
                  className="w-full text-xs p-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Typ</label>
                  <select
                    value={editingItem.type || 'info'}
                    onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as AnnouncementType })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-sky-500 outline-hidden font-medium"
                  >
                    <option value="info">Info (Standard)</option>
                    <option value="warning">Hinweis / Warnung</option>
                    <option value="success">Erfolg / Aktion</option>
                    <option value="urgent">Dringend</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Status</label>
                  <button
                    type="button"
                    onClick={() => setEditingItem({ ...editingItem, isActive: !editingItem.isActive })}
                    className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                      editingItem.isActive
                        ? 'border-emerald-800/70 bg-emerald-950/60 text-emerald-300'
                        : 'border-slate-700 bg-slate-800 text-slate-400'
                    }`}
                  >
                    {editingItem.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{editingItem.isActive ? 'Aktiv geschaltet' : 'Inaktiv (Entwurf)'}</span>
                  </button>
                </div>
              </div>

              {/* Optional Date Window */}
              <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  Optionales Zeitfenster (Start &amp; Ende)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-medium mb-1">Gültig ab (leer = sofort)</label>
                    <input
                      type="datetime-local"
                      value={editingItem.startsAt || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, startsAt: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-700 bg-slate-900 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-medium mb-1">Gültig bis (leer = unbegrenzt)</label>
                    <input
                      type="datetime-local"
                      value={editingItem.endsAt || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, endsAt: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-700 bg-slate-900 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Link */}
              <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-sky-400" />
                  Optionaler Aktions-Link
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-medium mb-1">Link-Text</label>
                    <input
                      type="text"
                      placeholder="z. B. Jetzt buchen"
                      value={editingItem.linkText || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, linkText: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-medium mb-1">Link-Ziel / URL</label>
                    <input
                      type="text"
                      placeholder="z. B. /services oder /pricing"
                      value={editingItem.linkUrl || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, linkUrl: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition shadow-lg shadow-sky-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Speichern</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
