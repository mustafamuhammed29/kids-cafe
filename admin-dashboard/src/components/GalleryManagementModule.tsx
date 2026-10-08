import React, { useState, useEffect, useRef } from 'react';
import type { StaffRole, AdminGalleryItem } from '../types/admin';
import {
  fetchAdminGalleryItems,
  saveAdminGalleryItem,
  deleteAdminGalleryItem,
  uploadGalleryImage,
  validateGalleryImage,
  ALLOWED_IMAGE_EXTENSIONS,
} from '../services/adminService';
import {
  Image as ImageIcon,
  Upload,
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
  FileCheck,
  FileWarning,
} from 'lucide-react';

interface GalleryManagementModuleProps {
  currentRole: StaffRole;
}

const PRESET_CATEGORIES = ['Spielbereich', 'Salzraum', 'Café', 'Events'];

export const GalleryManagementModule: React.FC<GalleryManagementModuleProps> = ({ currentRole }) => {
  const canManage = currentRole === 'owner' || currentRole === 'admin';

  const [items, setItems] = useState<AdminGalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal / Form state for Add/Edit
  const [editingItem, setEditingItem] = useState<Partial<AdminGalleryItem> | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchAdminGalleryItems();
    setItems(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartCreate = () => {
    if (!canManage) return;
    const nextOrder = items.length > 0 ? Math.max(...items.map((i) => i.displayOrder)) + 1 : 1;
    setEditingItem({
      title: '',
      category: 'Spielbereich',
      description: '',
      imageUrl: '',
      storagePath: null,
      displayOrder: nextOrder,
      isVisible: true,
    });
    setUploadError(null);
  };

  const handleStartEdit = (item: AdminGalleryItem) => {
    if (!canManage) return;
    setEditingItem({ ...item });
    setUploadError(null);
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const validation = validateGalleryImage(file);
    if (!validation.isValid) {
      setUploadError(validation.error || 'Ungültige Datei');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    const res = await uploadGalleryImage(file);
    setIsUploading(false);

    if (res.success && res.url) {
      setEditingItem((prev) => ({
        ...prev,
        imageUrl: res.url,
        storagePath: res.storagePath,
      }));
      if (res.savingsPercent && res.savingsPercent > 0) {
        setStatusMessage({
          type: 'success',
          text: `Bild optimiert: ${res.originalSizeKb} KB ➔ ${res.compressedSizeKb} KB (${res.savingsPercent}% Speicher & Traffic gespart ✨)`,
        });
        setTimeout(() => setStatusMessage(null), 5000);
      }
    } else {
      setUploadError(res.error || 'Fehler beim Hochladen der Datei.');
    }
  };

  const handleQuickToggleVisible = async (item: AdminGalleryItem) => {
    if (!canManage) return;
    const newVisible = !item.isVisible;
    const res = await saveAdminGalleryItem({ id: item.id, isVisible: newVisible });
    if (res.success) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isVisible: newVisible } : i))
      );
      setStatusMessage({
        type: 'success',
        text: `Bild "${item.title}" ${newVisible ? 'auf öffentlich sichtbar gesetzt' : 'ausgeblendet'}.`,
      });
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Fehler beim Ändern des Sichtbarkeitsstatus' });
    }
  };

  const handleDelete = async (item: AdminGalleryItem) => {
    if (!canManage) return;
    if (!window.confirm(`Möchtest du das Foto "${item.title}" wirklich unwiderruflich aus Galerie und Speicher löschen?`)) return;

    const res = await deleteAdminGalleryItem(item.id);
    if (res.success) {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setStatusMessage({ type: 'success', text: 'Galerie-Foto erfolgreich gelöscht.' });
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Fehler beim Löschen des Fotos' });
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage || !editingItem || !editingItem.title?.trim() || !editingItem.imageUrl) return;

    setIsSaving(true);
    setStatusMessage(null);

    const payload: Partial<AdminGalleryItem> = {
      ...editingItem,
      title: editingItem.title.trim(),
      category: editingItem.category?.trim() || 'Spielbereich',
      description: editingItem.description?.trim() || null,
      imageUrl: editingItem.imageUrl,
      displayOrder: Number(editingItem.displayOrder) || 1,
      isVisible: editingItem.isVisible ?? true,
    };

    const res = await saveAdminGalleryItem(payload);
    setIsSaving(false);

    if (res.success) {
      setEditingItem(null);
      await loadData();
      setStatusMessage({ type: 'success', text: 'Galerie-Foto erfolgreich gespeichert.' });
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Fehler beim Speichern' });
    }
  };

  const availableCategories = Array.from(
    new Set([...PRESET_CATEGORIES, ...items.map((i) => i.category)])
  );

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="bg-slate-900/90 rounded-2xl p-12 border border-slate-800 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-sky-400 mb-2" />
        <span className="text-xs">Galerie-Fotos werden geladen...</span>
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
              Nur Administratoren und die Inhaberin können Medien hochladen, Galerie-Fotos austauschen, sortieren oder löschen. Als Mitarbeiter hast du Leserechte.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl flex items-start gap-3 text-emerald-300 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block mb-0.5">Medienverwaltung aktiv ({currentRole})</strong>
            <span className="text-emerald-200/80">
              Du hast volle Schreibrechte für Upload, Bildmetadaten, Reihenfolge und Veröffentlichung im Storage-Bucket <code className="bg-emerald-900/60 px-1 py-0.5 rounded text-[11px] font-mono text-emerald-300">gallery-media</code>.
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
            <ImageIcon className="w-5 h-5 text-sky-400" />
            Galerie &amp; Medien-Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Verwaltung der Bildersammlung für die öffentliche Galerie-Seite (/gallery). Gesichert gegen fehlerhafte Dateiformate.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={handleStartCreate}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Neues Foto hinzufügen</span>
          </button>
        )}
      </div>

      {/* Security & Validation Rules Info Strip */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-300">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-white">Erlaubte Formate:</strong> {ALLOWED_IMAGE_EXTENSIONS.map((e) => `.${e}`).join(', ')} (Rasterbilder)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FileWarning className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-white">Max. Dateigröße:</strong> 5 MB je Bild · SVG und Scripts strikt gesperrt
          </span>
        </div>
        <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-300 font-semibold">
            Quota-Schutz aktiv: WebP-Auto-Kompression & 1-Jahr Cache (spart ~95% Traffic)
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-sky-400">
            Bucket: gallery-media
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="In Titeln oder Beschreibungen suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-sky-500 outline-hidden shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 hidden sm:block" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:border-sky-500 outline-hidden cursor-pointer"
          >
            <option value="all">Alle Bereiche ({items.length})</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({items.filter((i) => i.category === cat).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gallery Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.length === 0 ? (
          <div className="col-span-full bg-slate-900/90 rounded-2xl p-10 border border-slate-800 text-center text-slate-400">
            <ImageIcon className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-xs font-semibold text-slate-300">Keine Fotos in dieser Ansicht</p>
            <span className="text-[11px] text-slate-500 block mt-1">
              Passe die Filterkriterien an oder lade ein neues Foto hoch.
            </span>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl overflow-hidden border transition shadow-lg shadow-black/20 flex flex-col justify-between ${
                item.isVisible
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/60 border-dashed border-slate-800 opacity-75'
              }`}
            >
              {/* Thumbnail Area */}
              <div className="relative aspect-4/3 bg-slate-950 overflow-hidden group flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-slate-700 absolute inset-0 m-auto pointer-events-none" />
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300 relative z-10"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-20">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-black/75 backdrop-blur-xs text-white border border-white/10">
                    {item.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900/90 text-slate-300 border border-slate-700">
                    Pos. {item.displayOrder}
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5 z-20">
                  {item.isVisible ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500 text-white shadow-md flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Live
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-white shadow-md flex items-center gap-1">
                      <EyeOff className="w-3 h-3" /> Versteckt
                    </span>
                  )}
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white leading-snug line-clamp-1">
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic block mt-1">Keine Beschreibung</span>
                  )}
                </div>

                {/* Actions */}
                {canManage && (
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleQuickToggleVisible(item)}
                      title={item.isVisible ? 'Auf der Website verstecken' : 'Öffentlich anzeigen'}
                      className={`py-1.5 px-2.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        item.isVisible
                          ? 'border-emerald-800/60 bg-emerald-950/50 text-emerald-400 hover:bg-emerald-900/50'
                          : 'border-amber-800/60 bg-amber-950/50 text-amber-300 hover:bg-amber-900/50'
                      }`}
                    >
                      {item.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{item.isVisible ? 'Sichtbar' : 'Versteckt'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(item)}
                        className="p-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                        title="Metadaten bearbeiten"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded-lg border border-rose-900/50 bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 transition cursor-pointer"
                        title="Foto unwiderruflich löschen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit / Upload Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-5 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Galerie-Medien</span>
                <h3 className="text-base font-extrabold text-white">
                  {editingItem.id ? 'Foto & Metadaten anpassen' : 'Neues Galerie-Foto hochladen'}
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
              {/* Image Upload / Preview Field */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Bilddatei <span className="text-rose-400">*</span>
                </label>

                {editingItem.imageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 aspect-16/9 bg-slate-950 mb-2">
                    <img
                      src={editingItem.imageUrl}
                      alt="Vorschau"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition"
                      >
                        <Upload className="w-3.5 h-3.5" /> Bild austauschen
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-950/60 hover:bg-slate-950"
                  >
                    <Upload className="w-8 h-8 mx-auto text-sky-400 mb-2" />
                    <span className="text-xs font-bold text-white block">Bild auswählen oder ablegen</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      JPG, PNG oder WEBP bis max. 5 MB
                    </span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelected}
                  className="hidden"
                />

                {isUploading && (
                  <div className="flex items-center gap-2 text-xs text-sky-400 mt-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Bild wird validiert und hochgeladen...</span>
                  </div>
                )}

                {uploadError && (
                  <div className="p-3 mt-2 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Bildtitel <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="z. B. Helle Wohlfühl-Atmosphäre"
                  className="w-full text-xs p-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:border-sky-500 outline-hidden font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Kategorie</label>
                  <input
                    type="text"
                    list="category-suggestions"
                    required
                    value={editingItem.category || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-sky-500 outline-hidden font-medium"
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
                    value={editingItem.displayOrder || 1}
                    onChange={(e) => setEditingItem({ ...editingItem, displayOrder: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-sky-500 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Beschreibung (Bildunterschrift / Barrierefreiheit)
                </label>
                <textarea
                  rows={2}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Kurze Bildbeschreibung für Besucher..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:border-sky-500 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Sichtbarkeit</label>
                <button
                  type="button"
                  onClick={() => setEditingItem({ ...editingItem, isVisible: !editingItem.isVisible })}
                  className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                    editingItem.isVisible
                      ? 'border-emerald-800/70 bg-emerald-950/60 text-emerald-300'
                      : 'border-amber-800/70 bg-amber-950/60 text-amber-300'
                  }`}
                >
                  {editingItem.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{editingItem.isVisible ? 'Öffentlich sichtbar (/gallery)' : 'Versteckt (nur intern)'}</span>
                </button>
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
                  disabled={isSaving || !editingItem.imageUrl}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition shadow-lg shadow-sky-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Foto speichern</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
