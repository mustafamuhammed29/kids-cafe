import React, { useState, useEffect } from 'react';
import type { StaffRole, AdminEventInquiry, InquiryStatus, InquiryEventType } from '../types/admin';
import {
  fetchAdminEventInquiries,
  updateInquiryStatus,
  deleteInquiry,
} from '../services/adminService';
import {
  Inbox,
  Mail,
  Phone,
  MessageCircle,
  Calendar,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Loader2,
  Lock,
  ArrowUpDown,
  FileText,
  Save,
  Check,
  Send,
  X,
} from 'lucide-react';

interface EventInquiriesInboxModuleProps {
  currentRole: StaffRole;
}

export const EventInquiriesInboxModule: React.FC<EventInquiriesInboxModuleProps> = ({ currentRole }) => {
  const canDelete = currentRole === 'owner' || currentRole === 'admin';
  const isStaff = currentRole === 'staff';

  const [inquiries, setInquiries] = useState<AdminEventInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Selected Inquiry for details / triage drawer
  const [selectedInquiry, setSelectedInquiry] = useState<AdminEventInquiry | null>(null);
  const [editingNotes, setEditingNotes] = useState<string>('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchAdminEventInquiries();
    setInquiries(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectInquiry = (inquiry: AdminEventInquiry) => {
    setSelectedInquiry(inquiry);
    setEditingNotes(inquiry.adminNotes || '');
  };

  const handleUpdateStatus = async (id: string, newStatus: InquiryStatus) => {
    const res = await updateInquiryStatus(id, newStatus, undefined);
    if (res.success) {
      setInquiries((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: newStatus, updatedAt: new Date().toISOString() } : i))
      );
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      setStatusMessage({ type: 'success', text: `Status auf "${getStatusLabel(newStatus)}" aktualisiert.` });
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Fehler beim Aktualisieren des Status' });
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setIsSavingNotes(true);

    const res = await updateInquiryStatus(selectedInquiry.id, selectedInquiry.status, editingNotes);
    setIsSavingNotes(false);

    if (res.success) {
      setInquiries((prev) =>
        prev.map((i) =>
          i.id === selectedInquiry.id
            ? { ...i, adminNotes: editingNotes, updatedAt: new Date().toISOString() }
            : i
        )
      );
      setSelectedInquiry((prev) => (prev ? { ...prev, adminNotes: editingNotes } : null));
      setStatusMessage({ type: 'success', text: 'Interne Notiz erfolgreich gespeichert.' });
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Fehler beim Speichern der Notiz' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!canDelete) return;
    if (!window.confirm(`Möchtest du die Anfrage von "${name}" wirklich unwiderruflich löschen?`)) {
      return;
    }

    const res = await deleteInquiry(id);
    if (res.success) {
      setInquiries((prev) => prev.filter((i) => i.id !== id));
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry(null);
      }
      setStatusMessage({ type: 'success', text: 'Anfrage erfolgreich gelöscht.' });
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Fehler beim Löschen der Anfrage' });
    }
  };

  const getStatusLabel = (status: InquiryStatus) => {
    switch (status) {
      case 'new': return 'Neu / Offen';
      case 'contacted': return 'In Bearbeitung';
      case 'reserved': return 'Reserviert';
      case 'rejected': return 'Abgelehnt';
      case 'archived': return 'Archiviert';
      default: return status;
    }
  };

  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
            Neu
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
            In Kontakt
          </span>
        );
      case 'reserved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Reserviert
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
            Abgelehnt
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
            Archiviert
          </span>
        );
    }
  };

  const getEventTypeLabel = (type: InquiryEventType | string) => {
    switch (type) {
      case 'birthday': return 'Kindergeburtstag';
      case 'group_party': return 'Gruppenfeier';
      case 'group_event': return 'Gruppenevent';
      case 'corporate': return 'Firmenevent';
      case 'general': return 'Allgemeine Anfrage';
      default: return type;
    }
  };

  const newCount = inquiries.filter((i) => i.status === 'new').length;
  const contactedCount = inquiries.filter((i) => i.status === 'contacted').length;
  const reservedCount = inquiries.filter((i) => i.status === 'reserved').length;

  const filteredInquiries = inquiries
    .filter((inq) => {
      const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        inq.name.toLowerCase().includes(query) ||
        inq.email.toLowerCase().includes(query) ||
        (inq.phone && inq.phone.toLowerCase().includes(query)) ||
        inq.message.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

  if (isLoading) {
    return (
      <div className="bg-slate-900/90 rounded-2xl p-12 border border-slate-800 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-sky-400 mb-2" />
        <span className="text-xs">Postfach für Veranstaltungsanfragen wird geladen...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Privacy & Security Banner */}
      <div className="p-4 bg-slate-900/90 border border-emerald-500/30 rounded-2xl flex items-start gap-3 text-emerald-300 text-xs">
        <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <strong className="font-extrabold text-xs text-white">
              Sensibles operatives Postfach (Zero Public Read)
            </strong>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full">
              RLS-geschützt
            </span>
          </div>
          <p className="mt-1 leading-relaxed text-slate-400">
            Kundenanfragen enthalten personenbezogene Daten (Name, Telefon, E-Mail, Gruppengröße). Row-Level Security (RLS) stellt sicher, dass weder anonyme Besucher noch unbefugte Nutzer diese Datensätze lesen können.
            {isStaff ? ' Als Mitarbeiter hast du Leserechte und kannst Status sowie interne Notizen pflegen.' : ' Als Inhaber hast du uneingeschränkte Vollverwaltung inkl. Löschrecht.'}
          </p>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Metrics Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 rounded-2xl p-4 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Neue Anfragen</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          </div>
          <span className="text-2xl font-black text-rose-400 font-heading">{newCount}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Dringend bearbeiten</span>
        </div>

        <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 rounded-2xl p-4 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">In Bearbeitung</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-amber-400 font-heading">{contactedCount}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Angebot / Rückruf offen</span>
        </div>

        <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 rounded-2xl p-4 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Reserviert</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-emerald-400 font-heading">{reservedCount}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Termin fest eingeplant</span>
        </div>

        <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 rounded-2xl p-4 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Gesamteingang</span>
            <Inbox className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <span className="text-2xl font-black text-white font-heading">{inquiries.length}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Alle erfassten Anfragen</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Nach Name, E-Mail, Telefon oder Nachricht filtern..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer flex-1 sm:flex-none"
          >
            <option value="all">Alle Status ({inquiries.length})</option>
            <option value="new">Neu / Offen ({newCount})</option>
            <option value="contacted">In Bearbeitung ({contactedCount})</option>
            <option value="reserved">Reserviert ({reservedCount})</option>
            <option value="rejected">Abgelehnt</option>
            <option value="archived">Archiviert</option>
          </select>

          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
            title="Datumssortierung umschalten"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'desc' ? 'Neueste' : 'Älteste'}</span>
          </button>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="space-y-3.5">
        {filteredInquiries.length === 0 ? (
          <div className="bg-slate-900/80 rounded-2xl p-10 border border-slate-800 text-center text-slate-500">
            <Inbox className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-xs font-semibold">Keine Anfragen im Postfach</p>
            <span className="text-[11px] text-slate-500 block mt-1">
              Es liegen momentan keine Anfragen vor, die den aktuellen Filterkriterien entsprechen.
            </span>
          </div>
        ) : (
          filteredInquiries.map((inq) => {
            const isUnreadNew = inq.status === 'new';

            return (
              <div
                key={inq.id}
                className={`bg-slate-900/90 rounded-2xl p-5 border transition shadow-md ${
                  isUnreadNew
                    ? 'border-rose-500/50 bg-rose-500/5 ring-1 ring-rose-500/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(inq.status)}

                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {getEventTypeLabel(inq.eventType)}
                      </span>

                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(inq.createdAt).toLocaleString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      {inq.adminNotes && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <FileText className="w-3 h-3 text-amber-400" /> Notiz vorhanden
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <h3 className="text-base font-bold text-white font-heading">
                        {inq.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <a
                          href={`mailto:${inq.email}`}
                          className="flex items-center gap-1 text-sky-400 hover:underline font-mono"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>{inq.email}</span>
                        </a>

                        {inq.phone && (
                          <a
                            href={`tel:${inq.phone}`}
                            className="flex items-center gap-1 text-slate-300 hover:text-white font-mono"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span>{inq.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                      {inq.targetDate && (
                        <span className="flex items-center gap-1.5 font-medium text-slate-200">
                          <Calendar className="w-3.5 h-3.5 text-sky-400" />
                          Wunschtermin: <strong className="text-white">{new Date(inq.targetDate).toLocaleDateString('de-DE')}</strong>
                        </span>
                      )}

                      {(inq.childrenCount !== null || inq.adultsCount !== null) && (
                        <span className="flex items-center gap-1.5 font-medium text-slate-200">
                          <Users className="w-3.5 h-3.5 text-purple-400" />
                          Gäste: <strong className="text-white">{inq.childrenCount ?? 0}</strong> Kinder, <strong className="text-white">{inq.adultsCount ?? 0}</strong> Erwachsene
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-normal bg-slate-950/90 p-3.5 rounded-xl border border-slate-800/80">
                      „{inq.message}“
                    </p>

                    {inq.adminNotes && (
                      <div className="text-[11px] bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 text-amber-200">
                        <strong className="block font-semibold mb-0.5">Team-Notiz:</strong>
                        <span className="whitespace-pre-line">{inq.adminNotes}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Triage */}
                  <div className="flex flex-col gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-4 self-stretch justify-center">
                    <button
                      type="button"
                      onClick={() => handleSelectInquiry(inq)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-sky-500 hover:text-white text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Bearbeiten &amp; Notiz</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {inq.phone && (
                        <a
                          href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=Hallo%20${encodeURIComponent(inq.name)}%2C%20vielen%20Dank%20f%C3%BCr%20deine%20Anfrage%20im%20Haven%20Kids%20Caf%C3%A9!`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                          title="WhatsApp Nachricht senden"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      <a
                        href={`mailto:${inq.email}?subject=Deine%20Anfrage%20im%20Haven%20Kids%20Caf%C3%A9`}
                        className="flex-1 py-2 px-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                        title="E-Mail Antwort senden"
                      >
                        <Send className="w-3.5 h-3.5 text-sky-400" />
                        <span>E-Mail</span>
                      </a>

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(inq.id, inq.name)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition cursor-pointer"
                          title="Anfrage löschen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Details & Notes Drawer / Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-700/80 space-y-5 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Postfach-Triage</span>
                <h3 className="text-base font-extrabold text-white font-heading mt-0.5">
                  Anfrage von {selectedInquiry.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inquiry Overview */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Event-Typ:</span>
                <strong className="text-white">{getEventTypeLabel(selectedInquiry.eventType)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Eingegangen am:</span>
                <span className="text-slate-300 font-mono text-[11px]">
                  {new Date(selectedInquiry.createdAt).toLocaleString('de-DE')}
                </span>
              </div>
              {selectedInquiry.targetDate && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Wunschtermin:</span>
                  <strong className="text-emerald-400">
                    {new Date(selectedInquiry.targetDate).toLocaleDateString('de-DE')}
                  </strong>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">E-Mail:</span>
                <a href={`mailto:${selectedInquiry.email}`} className="text-sky-400 hover:underline font-mono">
                  {selectedInquiry.email}
                </a>
              </div>
              {selectedInquiry.phone && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Telefon:</span>
                  <a href={`tel:${selectedInquiry.phone}`} className="text-sky-400 hover:underline font-mono">
                    {selectedInquiry.phone}
                  </a>
                </div>
              )}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block mb-1 font-semibold">Nachricht des Kunden:</span>
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 font-normal leading-relaxed text-slate-200 whitespace-pre-line">
                  {selectedInquiry.message}
                </div>
              </div>
            </div>

            {/* Status Change Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Status ändern:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(['new', 'contacted', 'reserved', 'rejected', 'archived'] as InquiryStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleUpdateStatus(selectedInquiry.id, st)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedInquiry.status === st
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {selectedInquiry.status === st && <Check className="w-3.5 h-3.5" />}
                    <span>{getStatusLabel(st)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Internal Notes Form */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Interne Team-Notizen (Rückrufe, Absprachen, Sonderwünsche)
              </label>
              <textarea
                rows={3}
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                placeholder="z. B. Telefonisch kontaktiert am 07.10. Angebot versandt, Bestätigung bis Freitag erwartet..."
                className="w-full text-xs p-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 outline-none font-medium"
              />
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-800">
              {canDelete ? (
                <button
                  type="button"
                  onClick={() => handleDelete(selectedInquiry.id, selectedInquiry.name)}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Anfrage löschen</span>
                </button>
              ) : (
                <span className="text-[10px] text-slate-500">Löschen nur durch Inhaber</span>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  Schließen
                </button>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition shadow-md shadow-sky-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingNotes && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <Save className="w-3.5 h-3.5" />
                  <span>Notiz speichern</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
