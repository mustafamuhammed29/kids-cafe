import React, { useState, useEffect } from 'react';
import type { StaffRole, AdminFaq } from '../types/admin';
import {
  fetchAdminFaqs,
  saveAdminFaq,
  deleteAdminFaq,
} from '../services/adminService';
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Loader2,
  Eye,
  EyeOff,
  Search,
  Filter,
  ArrowUpDown,
  BookOpen,
} from 'lucide-react';

interface FaqManagementModuleProps {
  currentRole: StaffRole;
}

const PRESET_CATEGORIES = [
  'Besuch & Regeln',
  'Preise & Buchung',
  'Salzraum',
  'Sicherheit & Hygiene',
  'Allgemein',
];

export const FaqManagementModule: React.FC<FaqManagementModuleProps> = ({ currentRole }) => {
  const canManage = currentRole === 'owner' || currentRole === 'admin';

  const [faqs, setFaqs] = useState<AdminFaq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Edit / Create modal state
  const [editingFaq, setEditingFaq] = useState<Partial<AdminFaq> | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchAdminFaqs();
    setFaqs(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartCreate = () => {
    if (!canManage) return;
    const nextOrder = faqs.length > 0 ? Math.max(...faqs.map((f) => f.displayOrder)) + 1 : 1;
    setEditingFaq({
      category: 'Besuch & Regeln',
      question: '',
      answer: '',
      displayOrder: nextOrder,
      isPublished: true,
    });
  };

  const handleStartEdit = (faq: AdminFaq) => {
    if (!canManage) return;
    setEditingFaq({ ...faq });
  };

  const handleQuickTogglePublished = async (faq: AdminFaq) => {
    if (!canManage) return;
    const newPublished = !faq.isPublished;
    const res = await saveAdminFaq({ id: faq.id, isPublished: newPublished });
    if (res.success) {
      setFaqs((prev) =>
        prev.map((f) => (f.id === faq.id ? { ...f, isPublished: newPublished } : f))
      );
      setStatusMessage({
        type: 'success',
        text: `FAQ "${faq.question.substring(0, 30)}..." ${newPublished ? 'veröffentlicht' : 'auf Entwurf gesetzt'}.`,
      });
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Fehler beim Ändern des Veröffentlichungsstatus' });
    }
  };

  const handleDelete = async (id: string, question: string) => {
    if (!canManage) return;
    if (!window.confirm(`Möchtest du die FAQ "${question.substring(0, 40)}..." wirklich unwiderruflich löschen?`)) return;

    const res = await deleteAdminFaq(id);
    if (res.success) {
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      setStatusMessage({ type: 'success', text: 'FAQ erfolgreich gelöscht.' });
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Fehler beim Löschen' });
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage || !editingFaq || !editingFaq.question?.trim() || !editingFaq.answer?.trim()) return;

    setIsSaving(true);
    setStatusMessage(null);

    const payload: Partial<AdminFaq> = {
      ...editingFaq,
      question: editingFaq.question.trim(),
      answer: editingFaq.answer.trim(),
      category: editingFaq.category?.trim() || 'Allgemein',
      displayOrder: Number(editingFaq.displayOrder) || 1,
      isPublished: editingFaq.isPublished ?? true,
    };

    const res = await saveAdminFaq(payload);
    setIsSaving(false);

    if (res.success) {
      setEditingFaq(null);
      await loadData();
      setStatusMessage({ type: 'success', text: 'FAQ erfolgreich gespeichert.' });
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Fehler beim Speichern der FAQ' });
    }
  };

  // Derive categories list
  const availableCategories = Array.from(
    new Set([...PRESET_CATEGORIES, ...faqs.map((f) => f.category)])
  );

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="bg-slate-900/90 rounded-2xl p-12 border border-slate-800 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-sky-400 mb-2" />
        <span className="text-xs">Häufige Fragen (FAQs) werden geladen...</span>
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
              Nur Administratoren und die Inhaberin können FAQ-Einträge erstellen, anpassen, sortieren oder löschen. Als Mitarbeiter hast du Leserechte.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl flex items-start gap-3 text-emerald-300 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block mb-0.5">Verwaltungsberechtigung aktiv ({currentRole})</strong>
            <span className="text-emerald-200/80">
              Du kannst alle Fragen, Antworten, Kategorien und Reihenfolgen der öffentlichen FAQ-Seite (/faq) verwalten.
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

      {/* Header with Search and Create Action */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl shadow-black/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-sky-400" />
            FAQ-Verwaltung (Häufig gestellte Fragen)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pflege der redaktionellen Fragen und Antworten für die öffentliche Website. Das Web-Design bleibt unberührt.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={handleStartCreate}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Neue FAQ erstellen</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="In Fragen und Antworten suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-sky-500 outline-hidden shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 hidden sm:block" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:border-sky-500 outline-hidden cursor-pointer"
          >
            <option value="all">Alle Kategorien ({faqs.length})</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({faqs.filter((f) => f.category === cat).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FAQ Entries List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="bg-slate-900/90 rounded-2xl p-10 border border-slate-800 text-center text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-xs font-semibold text-slate-300">Keine FAQs gefunden</p>
            <span className="text-[11px] text-slate-500 block mt-1">
              {searchQuery || selectedCategory !== 'all'
                ? 'Passe deine Filterkriterien oder den Suchbegriff an.'
                : 'Erstelle die erste FAQ für deine Kunden.'}
            </span>
          </div>
        ) : (
          filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className={`rounded-2xl p-5 border transition shadow-lg shadow-black/10 ${
                faq.isPublished
                  ? 'bg-slate-900/90 border-slate-800/90 hover:border-slate-700'
                  : 'bg-slate-950/60 border-dashed border-slate-800 opacity-75'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-950/70 text-sky-300 border border-sky-800/60">
                      {faq.category}
                    </span>

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/60">
                      <ArrowUpDown className="w-3 h-3 text-slate-400" /> Pos. {faq.displayOrder}
                    </span>

                    {faq.isPublished ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                        <Eye className="w-3 h-3" /> Öffentlich sichtbar
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60">
                        <EyeOff className="w-3 h-3" /> Entwurf (versteckt)
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">
                    {faq.question}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed font-normal whitespace-pre-line bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                    {faq.answer}
                  </p>
                </div>

                {canManage && (
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    <button
                      type="button"
                      onClick={() => handleQuickTogglePublished(faq)}
                      title={faq.isPublished ? 'Auf Entwurf setzen' : 'Veröffentlichen'}
                      className={`p-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        faq.isPublished
                          ? 'border-emerald-800/60 bg-emerald-950/50 text-emerald-400 hover:bg-emerald-900/50'
                          : 'border-amber-800/60 bg-amber-950/50 text-amber-300 hover:bg-amber-900/50'
                      }`}
                    >
                      {faq.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartEdit(faq)}
                      className="p-2 rounded-xl border border-slate-700/80 bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Bearbeiten"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(faq.id, faq.question)}
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
      {editingFaq && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">FAQ-Redaktion</span>
                <h3 className="text-base font-extrabold text-white">
                  {editingFaq.id ? 'FAQ bearbeiten' : 'Neue FAQ erstellen'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingFaq(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Kategorie</label>
                  <input
                    type="text"
                    list="category-suggestions"
                    required
                    value={editingFaq.category || ''}
                    onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                    placeholder="z. B. Besuch & Regeln"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:border-sky-500 outline-hidden font-medium"
                  />
                  <datalist id="category-suggestions">
                    {PRESET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Anzeigeposition (Sortierung)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editingFaq.displayOrder || 1}
                    onChange={(e) => setEditingFaq({ ...editingFaq, displayOrder: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-sky-500 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Frage <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingFaq.question || ''}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  placeholder="z. B. Gilt im Haven Kids Café eine Sockenpflicht?"
                  className="w-full text-xs p-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:border-sky-500 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Antwort <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={editingFaq.answer || ''}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  placeholder="Genaue und verständliche Antwort für Eltern und Gäste..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:border-sky-500 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Veröffentlichungsstatus</label>
                <button
                  type="button"
                  onClick={() => setEditingFaq({ ...editingFaq, isPublished: !editingFaq.isPublished })}
                  className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                    editingFaq.isPublished
                      ? 'border-emerald-800/70 bg-emerald-950/60 text-emerald-300'
                      : 'border-amber-800/70 bg-amber-950/60 text-amber-300'
                  }`}
                >
                  {editingFaq.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{editingFaq.isPublished ? 'Öffentlich publiziert (live auf /faq)' : 'Entwurf (nur intern sichtbar)'}</span>
                </button>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingFaq(null)}
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
                  <span>FAQ speichern</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
