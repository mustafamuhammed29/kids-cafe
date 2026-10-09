import React, { useState, useEffect, useMemo } from 'react';
import type { StaffRole, AdminPackage } from '../types/admin';
import {
  fetchAdminPackages,
  saveAdminPackage,
  deleteAdminPackage,
  duplicateAdminPackage,
  updateAdminPackage,
  reorderAdminPackages,
  resetAdminPackagesToDefault,
  fetchBusinessSettings,
  saveBusinessSettings,
  DEFAULT_ADMIN_PACKAGES,
} from '../services/adminService';
import {
  Package,
  Wind,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Search,
  LayoutGrid,
  List,
  ArrowUp,
  ArrowDown,
  Sparkles,
  RotateCcw,
  Check,
  X,
  MessageCircle,
  CalendarCheck,
  Mail,
  Tag,
  DollarSign,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface PackagesModuleProps {
  currentRole: StaffRole;
}

// Preset feature suggestions for fast 1-click addition
const PRESET_FEATURES = [
  '2 Stunden Spielzeit im Entdeckerbereich',
  'Bis zu 2 Begleitpersonen kostenfrei',
  'Freier Zugang zu Café & Lounge',
  'Garderobe & Spind inklusive',
  'Salzraum für 5 € zubuchbar',
  '12 Monate volle Gültigkeit',
  'Übertragbar auf Geschwisterkinder',
  '3 Stunden exklusiver Festtisch & Deko',
  'Bio-Fruchtsäfte & Wasser-Flatrate',
  'Bunte Geburtstagsdekoration nach Wunsch',
  'Eigene Betreuungskraft optional zubuchbar',
  'Individuelles Catering-Arrangement',
  'Exklusive Gesamtanmietung des gesamten Cafés',
  'Professionelles Barista- & Catering-Team',
];

export const PackagesModule: React.FC<PackagesModuleProps> = ({ currentRole }) => {
  const canEdit = currentRole === 'owner' || currentRole === 'admin';

  // Core Data
  const [packages, setPackages] = useState<AdminPackage[]>(DEFAULT_ADMIN_PACKAGES);
  const [saltRoomPrice, setSaltRoomPrice] = useState<number>(5.00);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSaltRoom, setIsSavingSaltRoom] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // View & Filter State
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'standard' | 'group' | 'corporate'>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingPackage, setEditingPackage] = useState<Partial<AdminPackage> | null>(null);
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [isSavingModal, setIsSavingModal] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete Modal State
  const [packageToDelete, setPackageToDelete] = useState<AdminPackage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset Modal State
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Quick Action Pending
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pkgs, settings] = await Promise.all([fetchAdminPackages(), fetchBusinessSettings()]);
      setPackages(pkgs);
      setSaltRoomPrice(settings.saltRoomAddonPrice ?? 5.00);
    } catch (err) {
      console.error('Error loading packages data:', err);
      showFeedback('error', 'Fehler beim Laden der Pakete');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      // Category filter
      if (selectedCategory !== 'all' && pkg.category !== selectedCategory) {
        return false;
      }
      // Visibility filter
      if (visibilityFilter === 'visible' && !pkg.isVisible) {
        return false;
      }
      if (visibilityFilter === 'hidden' && pkg.isVisible) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inName = pkg.name.toLowerCase().includes(query);
        const inSlug = pkg.slug.toLowerCase().includes(query);
        const inDesc = pkg.description.toLowerCase().includes(query);
        const inSub = (pkg.subtitle || '').toLowerCase().includes(query);
        const inFeatures = (pkg.features || []).some((f) => f.toLowerCase().includes(query));
        if (!inName && !inSlug && !inDesc && !inSub && !inFeatures) {
          return false;
        }
      }
      return true;
    });
  }, [packages, selectedCategory, visibilityFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = packages.length;
    const visibleCount = packages.filter((p) => p.isVisible).length;
    const hiddenCount = total - visibleCount;
    const standardCount = packages.filter((p) => p.category === 'standard').length;
    const groupCount = packages.filter((p) => p.category === 'group').length;
    const corporateCount = packages.filter((p) => p.category === 'corporate').length;
    return { total, visibleCount, hiddenCount, standardCount, groupCount, corporateCount };
  }, [packages]);

  // --- Handlers ---

  const handleSaveSaltRoomPrice = async () => {
    if (!canEdit) return;
    setIsSavingSaltRoom(true);
    const res = await saveBusinessSettings({ saltRoomAddonPrice: saltRoomPrice });
    setIsSavingSaltRoom(false);
    if (res.success) {
      showFeedback('success', `Salzraum-Addon Preis (${saltRoomPrice.toFixed(2)} €) gespeichert.`);
    } else {
      showFeedback('error', res.error || 'Fehler beim Speichern des Salzraum-Preises');
    }
  };

  const handleToggleVisibility = async (pkg: AdminPackage) => {
    if (!canEdit) return;
    setPendingActionId(pkg.id);
    const newVisibility = !pkg.isVisible;

    // Optimistic update
    setPackages((prev) =>
      prev.map((p) => (p.id === pkg.id ? { ...p, isVisible: newVisibility } : p))
    );

    const res = await updateAdminPackage(pkg.id, { isVisible: newVisibility });
    setPendingActionId(null);

    if (!res.success) {
      // Revert
      setPackages((prev) =>
        prev.map((p) => (p.id === pkg.id ? { ...p, isVisible: pkg.isVisible } : p))
      );
      showFeedback('error', res.error || 'Fehler beim Ändern der Sichtbarkeit');
    } else {
      showFeedback(
        'success',
        `Paket "${pkg.name}" ist jetzt ${newVisibility ? 'öffentlich sichtbar' : 'versteckt'}.`
      );
    }
  };

  const handleQuickOrderChange = async (pkg: AdminPackage, newOrder: number) => {
    if (!canEdit) return;
    const clamped = Math.max(1, Math.min(99, newOrder));
    setPackages((prev) =>
      prev.map((p) => (p.id === pkg.id ? { ...p, displayOrder: clamped } : p))
    );

    const res = await updateAdminPackage(pkg.id, { displayOrder: clamped });
    if (!res.success) {
      showFeedback('error', res.error || 'Fehler beim Ändern der Reihenfolge');
    }
  };

  const handleMoveOrder = async (pkg: AdminPackage, direction: 'up' | 'down') => {
    if (!canEdit) return;
    const currentIndex = packages.findIndex((p) => p.id === pkg.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= packages.length) return;

    const newPackages = [...packages];
    const temp = newPackages[currentIndex];
    newPackages[currentIndex] = newPackages[targetIndex];
    newPackages[targetIndex] = temp;

    // Re-assign displayOrder sequentially
    const orderedIds = newPackages.map((p) => p.id);
    setPackages(
      newPackages.map((p, idx) => ({ ...p, displayOrder: idx + 1 }))
    );

    setPendingActionId(pkg.id);
    const res = await reorderAdminPackages(orderedIds);
    setPendingActionId(null);

    if (!res.success) {
      showFeedback('error', res.error || 'Fehler beim Neuanordnen');
      loadData(); // Reload original
    } else {
      showFeedback('success', `Reihenfolge von "${pkg.name}" aktualisiert.`);
    }
  };

  const handleDuplicate = async (pkg: AdminPackage) => {
    if (!canEdit) return;
    setPendingActionId(pkg.id);
    const res = await duplicateAdminPackage(pkg.id);
    setPendingActionId(null);

    if (res.success && res.item) {
      setPackages((prev) => [...prev, res.item!].sort((a, b) => a.displayOrder - b.displayOrder));
      showFeedback('success', `Paket als "${res.item.name}" dupliziert (im Entwurfsmodus).`);
    } else {
      showFeedback('error', res.error || 'Fehler beim Duplizieren');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!canEdit || !packageToDelete) return;
    setIsDeleting(true);
    const res = await deleteAdminPackage(packageToDelete.id);
    setIsDeleting(false);

    if (res.success) {
      setPackages((prev) => prev.filter((p) => p.id !== packageToDelete.id));
      showFeedback('success', `Paket "${packageToDelete.name}" wurde erfolgreich gelöscht.`);
      setPackageToDelete(null);
    } else {
      showFeedback('error', res.error || 'Fehler beim Löschen');
    }
  };

  const handleResetConfirm = async () => {
    if (!canEdit) return;
    setIsResetting(true);
    const res = await resetAdminPackagesToDefault();
    setIsResetting(false);

    if (res.success) {
      setIsResetConfirmOpen(false);
      showFeedback('success', 'Alle 6 Standardpakete wurden erfolgreich wiederhergestellt!');
      loadData();
    } else {
      showFeedback('error', res.error || 'Fehler beim Zurücksetzen der Pakete');
    }
  };

  // --- Modal Helpers ---

  const handleOpenCreateModal = () => {
    if (!canEdit) return;
    const maxOrder = packages.length > 0 ? Math.max(...packages.map((p) => p.displayOrder)) : 0;
    setModalMode('create');
    setEditingPackage({
      name: '',
      slug: '',
      subtitle: '',
      description: '',
      category: 'standard',
      priceType: 'fixed',
      basePrice: 15.00,
      currency: '€',
      features: [
        '2 Stunden Spielzeit im Entdeckerbereich',
        'Bis zu 2 Begleitpersonen kostenfrei',
        'Freier Zugang zu Café & Lounge',
      ],
      ctaText: 'Jetzt buchen',
      ctaAction: 'book',
      isVisible: true,
      displayOrder: maxOrder + 1,
    });
    setNewFeatureInput('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pkg: AdminPackage) => {
    if (!canEdit) return;
    setModalMode('edit');
    setEditingPackage({
      ...pkg,
      features: pkg.features ? [...pkg.features] : [],
    });
    setNewFeatureInput('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleAutoGenerateSlug = () => {
    if (!editingPackage?.name) return;
    const generated = editingPackage.name
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setEditingPackage((prev) => (prev ? { ...prev, slug: generated } : prev));
  };

  const handleAddFeature = () => {
    const trimmed = newFeatureInput.trim();
    if (!trimmed || !editingPackage) return;
    const currentFeatures = editingPackage.features || [];
    if (currentFeatures.includes(trimmed)) return;
    setEditingPackage({
      ...editingPackage,
      features: [...currentFeatures, trimmed],
    });
    setNewFeatureInput('');
  };

  const handleRemoveFeature = (idx: number) => {
    if (!editingPackage?.features) return;
    setEditingPackage({
      ...editingPackage,
      features: editingPackage.features.filter((_, i) => i !== idx),
    });
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !editingPackage) return;

    if (!editingPackage.name?.trim()) {
      setModalError('Bitte gib einen Paketnamen ein.');
      return;
    }

    if (!editingPackage.slug?.trim()) {
      handleAutoGenerateSlug();
    }

    setIsSavingModal(true);
    setModalError(null);

    const res = await saveAdminPackage(editingPackage);
    setIsSavingModal(false);

    if (res.success && res.item) {
      if (modalMode === 'create') {
        setPackages((prev) => [...prev, res.item!].sort((a, b) => a.displayOrder - b.displayOrder));
        showFeedback('success', `Paket "${res.item.name}" erfolgreich erstellt.`);
      } else {
        setPackages((prev) =>
          prev.map((p) => (p.id === res.item!.id ? res.item! : p)).sort((a, b) => a.displayOrder - b.displayOrder)
        );
        showFeedback('success', `Paket "${res.item.name}" erfolgreich aktualisiert.`);
      }
      setIsModalOpen(false);
      setEditingPackage(null);
    } else {
      setModalError(res.error || 'Fehler beim Speichern des Pakets');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/90 rounded-2xl p-16 border border-slate-800 text-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-sky-400 mb-3" />
        <span className="text-sm font-semibold">Buchungspakete werden synchronisiert...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white font-heading tracking-tight flex items-center gap-2">
                Buchungspakete &amp; Tarife
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-sky-500/15 border border-sky-500/30 text-sky-400">
                  Full CRUD Live
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Volle Kontrolle über alle Tarife, Inklusivleistungen, Preise und Veröffentlichungsstatus.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canEdit && (
            <>
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                title="Setzt die Pakete auf die 6 Standardangebote zurück"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Standard wiederherstellen</span>
              </button>

              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-sky-500/25 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Neues Paket erstellen</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Role permission info */}
      {!canEdit ? (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-amber-200 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block mb-0.5">Eingeschränkte Leseberechtigung (Rolle: Staff)</strong>
            <span>
              Preise und Pakete dürfen nur von Administratoren und Inhabern bearbeitet, hinzugefügt oder gelöscht werden.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3 text-emerald-300 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block mb-0.5">Vollzugriff aktiv (Rolle: {currentRole})</strong>
            <span>
              Alle Änderungen an Paketen, Preisen, Beschreibungen und Inklusivleistungen wirken sich direkt in Echtzeit auf die Website und den Buchungswizard aus.
            </span>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="font-medium">{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Quick Metrics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Gesamt</span>
            <div className="text-xl font-black text-white mt-0.5">{stats.total}</div>
          </div>
          <Layers className="w-5 h-5 text-sky-400/50" />
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">Öffentlich</span>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{stats.visibleCount}</div>
          </div>
          <Eye className="w-5 h-5 text-emerald-400/50" />
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Entwurf / Aus</span>
            <div className="text-xl font-black text-slate-400 mt-0.5">{stats.hiddenCount}</div>
          </div>
          <EyeOff className="w-5 h-5 text-slate-500/50" />
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-sky-400 tracking-wider">Standard</span>
            <div className="text-xl font-black text-sky-400 mt-0.5">{stats.standardCount}</div>
          </div>
          <Tag className="w-5 h-5 text-sky-400/50" />
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-purple-400 tracking-wider">Gruppen</span>
            <div className="text-xl font-black text-purple-400 mt-0.5">{stats.groupCount}</div>
          </div>
          <CalendarCheck className="w-5 h-5 text-purple-400/50" />
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider">Corporate</span>
            <div className="text-xl font-black text-indigo-400 mt-0.5">{stats.corporateCount}</div>
          </div>
          <Sparkles className="w-5 h-5 text-indigo-400/50" />
        </div>
      </div>

      {/* 3. Salt Room Add-On Quick Card */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white font-heading flex items-center gap-2">
                Salzraum-Zusatzoption (Einzelticket Add-On)
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  Globale Einstellung
                </span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Steuert den Preisaufschlag pro Kind für die 45-minütige mikroklimatische Sitzung im Buchungswizard.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-700">
              <input
                type="number"
                disabled={!canEdit}
                min={0}
                step={0.5}
                value={saltRoomPrice}
                onChange={(e) => setSaltRoomPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-16 text-right font-black text-sm bg-transparent text-white outline-none"
              />
              <span className="text-xs font-bold text-slate-400">€ / Kind</span>
            </div>

            {canEdit && (
              <button
                type="button"
                onClick={handleSaveSaltRoomPrice}
                disabled={isSavingSaltRoom}
                className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-sky-500/20 disabled:opacity-50"
              >
                {isSavingSaltRoom ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Speichern</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Search & Filters Bar */}
      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Paketname, Slug, Beschreibung suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {(
            [
              { key: 'all', label: 'Alle' },
              { key: 'standard', label: 'Standard' },
              { key: 'group', label: 'Gruppen' },
              { key: 'corporate', label: 'Corporate' },
            ] as const
          ).map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Visibility Filter & View Mode */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="all">Alle Status</option>
            <option value="visible">Nur Öffentlich</option>
            <option value="hidden">Nur Versteckt</option>
          </select>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kartenansicht"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'table' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tabellenansicht"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Content View (Grid or Table) */}
      {filteredPackages.length === 0 ? (
        <div className="bg-slate-900/90 rounded-2xl p-12 border border-slate-800 text-center text-slate-400">
          <Package className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h4 className="text-base font-bold text-white font-heading">Keine Pakete gefunden</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Kein Paket entspricht den aktuellen Filtereinstellungen. Passe die Filter an oder erstelle ein neues Paket.
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="mt-4 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Paket erstellen</span>
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPackages.map((pkg) => {
            const isFixed = pkg.priceType === 'fixed';
            const isFrom = pkg.priceType === 'from';
            const isOnRequest = pkg.priceType === 'on-request';
            const isPending = pendingActionId === pkg.id;

            return (
              <div
                key={pkg.id}
                className={`bg-slate-900/90 rounded-2xl border transition-all duration-200 shadow-xl overflow-hidden flex flex-col justify-between ${
                  pkg.isVisible
                    ? 'border-slate-800 hover:border-sky-500/50'
                    : 'border-slate-800/60 opacity-75 bg-slate-950/60'
                }`}
              >
                {/* Card Header */}
                <div className="p-5 border-b border-slate-800/80">
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          pkg.category === 'standard'
                            ? 'bg-sky-500/15 border border-sky-500/30 text-sky-300'
                            : pkg.category === 'group'
                            ? 'bg-purple-500/15 border border-purple-500/30 text-purple-300'
                            : 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300'
                        }`}
                      >
                        {pkg.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Pos. {pkg.displayOrder}
                      </span>
                    </div>

                    {/* Visibility Toggle Button */}
                    <button
                      type="button"
                      disabled={!canEdit || isPending}
                      onClick={() => handleToggleVisibility(pkg)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition cursor-pointer disabled:cursor-not-allowed ${
                        pkg.isVisible
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                      }`}
                      title={pkg.isVisible ? 'Öffentlich sichtbar - Klick zum Verstecken' : 'Versteckt - Klick zum Aktivieren'}
                    >
                      {pkg.isVisible ? (
                        <>
                          <Eye className="w-3 h-3 text-emerald-400" />
                          <span>Öffentlich</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 text-slate-500" />
                          <span>Entwurf</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="font-extrabold text-base text-white font-heading tracking-tight">
                    {pkg.name}
                  </h3>
                  {pkg.subtitle && (
                    <p className="text-xs text-sky-400 font-medium mt-0.5 line-clamp-1">
                      {pkg.subtitle}
                    </p>
                  )}
                  <div className="text-[11px] text-slate-500 font-mono mt-1">
                    slug: {pkg.slug}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4 flex-1">
                  {/* Price Banner */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                        Preismodell
                      </span>
                      <span className="text-xs text-slate-300 font-medium">
                        {isFixed && 'Fester Betrag'}
                        {isFrom && 'Ab-Preis'}
                        {isOnRequest && 'Auf Anfrage'}
                      </span>
                    </div>

                    <div className="text-right">
                      {isOnRequest ? (
                        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                          Auf Anfrage
                        </span>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          {isFrom && <span className="text-xs text-slate-400 font-bold">ab</span>}
                          <span className="text-lg font-black text-sky-400">
                            {pkg.basePrice !== null ? pkg.basePrice.toFixed(2) : '0.00'}
                          </span>
                          <span className="text-xs font-bold text-slate-400">{pkg.currency}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {pkg.description || 'Keine Beschreibung hinterlegt.'}
                  </p>

                  {/* Features / Inklusivleistungen */}
                  {pkg.features && pkg.features.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                        Inklusivleistungen ({pkg.features.length})
                      </span>
                      <ul className="space-y-1">
                        {pkg.features.slice(0, 3).map((feat, idx) => (
                          <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{feat}</span>
                          </li>
                        ))}
                        {pkg.features.length > 3 && (
                          <li className="text-[10px] text-sky-400 font-bold pl-5">
                            +{pkg.features.length - 3} weitere Leistungen
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* CTA Preview */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-[10px] font-semibold">Button:</span>
                    <span className="inline-flex items-center gap-1 font-bold text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-md text-[11px]">
                      {pkg.ctaAction === 'whatsapp' && <MessageCircle className="w-3 h-3 text-emerald-400" />}
                      {pkg.ctaAction === 'book' && <CalendarCheck className="w-3 h-3 text-sky-400" />}
                      {pkg.ctaAction === 'contact-form' && <Mail className="w-3 h-3 text-amber-400" />}
                      <span>{pkg.ctaText || 'Jetzt buchen'}</span>
                    </span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-2">
                  {/* Order controls */}
                  <div className="flex items-center gap-1">
                    {canEdit && (
                      <>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleMoveOrder(pkg, 'up')}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer disabled:opacity-50"
                          title="Nach oben verschieben"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleMoveOrder(pkg, 'down')}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer disabled:opacity-50"
                          title="Nach unten verschieben"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Edit / Duplicate / Delete */}
                  <div className="flex items-center gap-1.5">
                    {canEdit && (
                      <>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleDuplicate(pkg)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-50"
                          title="Paket duplizieren"
                        >
                          <Copy className="w-3.5 h-3.5 text-purple-400" />
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleOpenEditModal(pkg)}
                          className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500 text-sky-400 hover:text-white border border-sky-500/30 transition font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
                          title="Paket bearbeiten"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Bearbeiten</span>
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => setPackageToDelete(pkg)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 transition cursor-pointer disabled:opacity-50"
                          title="Paket löschen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 font-heading">
              <Package className="w-4 h-4 text-sky-400" />
              Paket-Übersicht &amp; Schnellverwaltung
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              {filteredPackages.length} von {packages.length} Paketen angezeigt
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 w-16">Pos.</th>
                  <th className="py-3 px-4">Paketname &amp; Kennung</th>
                  <th className="py-3 px-4">Kategorie</th>
                  <th className="py-3 px-4">Preismodell &amp; Basispreis</th>
                  <th className="py-3 px-4">Leistungen</th>
                  <th className="py-3 px-4">Sichtbarkeit</th>
                  <th className="py-3 px-4 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredPackages.map((pkg) => {
                  const isFrom = pkg.priceType === 'from';
                  const isOnRequest = pkg.priceType === 'on-request';
                  const isPending = pendingActionId === pkg.id;

                  return (
                    <tr key={pkg.id} className="hover:bg-slate-800/40 transition">
                      {/* Pos */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            disabled={!canEdit}
                            min={1}
                            max={99}
                            value={pkg.displayOrder}
                            onChange={(e) =>
                              handleQuickOrderChange(pkg, parseInt(e.target.value, 10) || 1)
                            }
                            className="w-12 px-2 py-1 rounded-lg border border-slate-700 text-center font-bold text-xs bg-slate-950 text-white disabled:bg-transparent"
                          />
                        </div>
                      </td>

                      {/* Name & Slug */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{pkg.name}</div>
                        {pkg.subtitle && (
                          <div className="text-[11px] text-slate-400 line-clamp-1">{pkg.subtitle}</div>
                        )}
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          slug: {pkg.slug}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                            pkg.category === 'standard'
                              ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                              : pkg.category === 'group'
                              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                              : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {pkg.category}
                        </span>
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-4">
                        {isOnRequest ? (
                          <span className="text-xs text-amber-400 italic font-medium">Auf Anfrage</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {isFrom && <span className="text-xs text-slate-400">ab</span>}
                            <span className="font-black text-sm text-sky-400">
                              {pkg.basePrice !== null ? pkg.basePrice.toFixed(2) : '0.00'}
                            </span>
                            <span className="text-xs font-bold text-slate-400">{pkg.currency}</span>
                          </div>
                        )}
                      </td>

                      {/* Features count */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs text-slate-300 font-semibold">
                          {pkg.features ? `${pkg.features.length} Punkte` : '0 Punkte'}
                        </span>
                      </td>

                      {/* Visibility */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          disabled={!canEdit || isPending}
                          onClick={() => handleToggleVisibility(pkg)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition cursor-pointer disabled:cursor-not-allowed ${
                            pkg.isVisible
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {pkg.isVisible ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Öffentlich</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                              <span>Versteckt</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {canEdit && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDuplicate(pkg)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                              title="Duplizieren"
                            >
                              <Copy className="w-3.5 h-3.5 text-purple-400" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(pkg)}
                              className="p-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500 text-sky-400 hover:text-white border border-sky-500/30 transition cursor-pointer"
                              title="Bearbeiten"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPackageToDelete(pkg)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 transition cursor-pointer"
                              title="Löschen"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. MODAL: CREATE / EDIT PACKAGE
          ========================================================================= */}
      {isModalOpen && editingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-heading">
                    {modalMode === 'create' ? 'Neues Buchungspaket anlegen' : 'Buchungspaket bearbeiten'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Definiere Tarife, Inklusivleistungen und Veröffentlichungsstatus.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="p-6 space-y-6">
              {modalError && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Section 1: Stammdaten */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-sky-400 tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  1. Basis-Informationen
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Paketname *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="z. B. Kindergeburtstag Deluxe"
                      value={editingPackage.name || ''}
                      onChange={(e) =>
                        setEditingPackage({ ...editingPackage, name: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Slug (URL-Kennung) *
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoGenerateSlug}
                        className="text-[10px] text-sky-400 hover:text-sky-300 font-bold"
                      >
                        Aus Name generieren
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="z. B. kindergeburtstag-deluxe"
                      value={editingPackage.slug || ''}
                      onChange={(e) =>
                        setEditingPackage({ ...editingPackage, slug: e.target.value.toLowerCase() })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Subtitle */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Untertitel / Tagline
                    </label>
                    <input
                      type="text"
                      placeholder="z. B. Für spontane Familienauszeiten"
                      value={editingPackage.subtitle || ''}
                      onChange={(e) =>
                        setEditingPackage({ ...editingPackage, subtitle: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Kategorie *
                    </label>
                    <select
                      value={editingPackage.category || 'standard'}
                      onChange={(e) =>
                        setEditingPackage({ ...editingPackage, category: e.target.value as any })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="standard">Standard (Einzeltickets &amp; Pässe)</option>
                      <option value="group">Gruppenfeier (Private Geburtstage &amp; Feiern)</option>
                      <option value="corporate">Corporate (Firmen, Schulen &amp; Kitas)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Preismodell & Tarife */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-black uppercase text-sky-400 tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  2. Preismodell &amp; Tarife
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Price Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Preistyp *
                    </label>
                    <select
                      value={editingPackage.priceType || 'fixed'}
                      onChange={(e) => {
                        const newType = e.target.value as any;
                        setEditingPackage({
                          ...editingPackage,
                          priceType: newType,
                          basePrice: newType === 'on-request' ? null : (editingPackage.basePrice ?? 14.00),
                        });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="fixed">Fester Tarif (z. B. 14,00 €)</option>
                      <option value="from">Ab-Preis (z. B. ab 250,00 €)</option>
                      <option value="on-request">Auf Anfrage (Individuell)</option>
                    </select>
                  </div>

                  {/* Base Price */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Basispreis (€)
                    </label>
                    <input
                      type="number"
                      step={0.5}
                      min={0}
                      disabled={editingPackage.priceType === 'on-request'}
                      placeholder={editingPackage.priceType === 'on-request' ? 'Auf Anfrage' : 'z. B. 14.00'}
                      value={
                        editingPackage.priceType === 'on-request'
                          ? ''
                          : (editingPackage.basePrice !== null && editingPackage.basePrice !== undefined
                              ? editingPackage.basePrice
                              : '')
                      }
                      onChange={(e) =>
                        setEditingPackage({
                          ...editingPackage,
                          basePrice: e.target.value === '' ? null : parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white disabled:bg-slate-900 disabled:text-slate-500 focus:outline-none focus:border-sky-500 font-bold"
                    />
                  </div>

                  {/* Currency */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Währung
                    </label>
                    <input
                      type="text"
                      value={editingPackage.currency || '€'}
                      onChange={(e) =>
                        setEditingPackage({ ...editingPackage, currency: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Beschreibung & Inklusivleistungen */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-black uppercase text-sky-400 tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  3. Beschreibung &amp; Inklusivleistungen
                </h4>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Detaillierte Beschreibung *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Beschreibe, was Familien oder Gruppen bei diesem Paket erwartet..."
                    value={editingPackage.description || ''}
                    onChange={(e) =>
                      setEditingPackage({ ...editingPackage, description: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
                  />
                </div>

                {/* Features List */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Inklusivleistungen / Aufzählungspunkte
                  </label>

                  {/* Add Input */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <input
                      type="text"
                      placeholder="Neue Leistung eingeben (z. B. 'Bio-Fruchtsäfte Flatrate')..."
                      value={newFeatureInput}
                      onChange={(e) => setNewFeatureInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Hinzufügen</span>
                    </button>
                  </div>

                  {/* Current Features List */}
                  {editingPackage.features && editingPackage.features.length > 0 ? (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                      {editingPackage.features.map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                        >
                          <div className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{feat}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(idx)}
                            className="text-slate-500 hover:text-rose-400 transition p-1"
                            title="Entfernen"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">Noch keine Leistungen hinzugefügt.</p>
                  )}

                  {/* Quick Preset Chips */}
                  <div className="mt-2.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Schnellvorschläge (Klick zum Hinzufügen):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_FEATURES.filter(
                        (p) => !(editingPackage.features || []).includes(p)
                      )
                        .slice(0, 6)
                        .map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              const curr = editingPackage.features || [];
                              setEditingPackage({
                                ...editingPackage,
                                features: [...curr, preset],
                              });
                            }}
                            className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-sky-500/20 hover:text-sky-300 text-slate-400 transition cursor-pointer border border-slate-700/60"
                          >
                            + {preset}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: CTA & Veröffentlichung */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-black uppercase text-sky-400 tracking-wider flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5" />
                  4. Button-Verhalten &amp; Anzeige
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* CTA Text */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Button-Beschriftung
                    </label>
                    <input
                      type="text"
                      placeholder="z. B. Jetzt buchen oder Anfrage stellen"
                      value={editingPackage.ctaText || ''}
                      onChange={(e) =>
                        setEditingPackage({ ...editingPackage, ctaText: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* CTA Action */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Button-Aktion
                    </label>
                    <select
                      value={editingPackage.ctaAction || 'book'}
                      onChange={(e) =>
                        setEditingPackage({ ...editingPackage, ctaAction: e.target.value as any })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="book">Buchungswizard öffnen (Direkte Reservierung)</option>
                      <option value="whatsapp">WhatsApp Chat öffnen</option>
                      <option value="contact-form">Kontakt-/Anfrageformular öffnen</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  {/* Display Order */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Anzeigereihenfolge (Position)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={editingPackage.displayOrder || 1}
                      onChange={(e) =>
                        setEditingPackage({
                          ...editingPackage,
                          displayOrder: parseInt(e.target.value, 10) || 1,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500 font-bold"
                    />
                  </div>

                  {/* Visibility Switch */}
                  <div className="pt-5">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingPackage.isVisible ?? true}
                        onChange={(e) =>
                          setEditingPackage({ ...editingPackage, isVisible: e.target.checked })
                        }
                        className="w-5 h-5 rounded-md border-slate-700 bg-slate-950 text-sky-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-white">
                        Öffentlich auf der Website anzeigen
                      </span>
                    </label>
                    <span className="text-[10px] text-slate-400 block ml-8">
                      Wenn deaktiviert, ist das Paket als Entwurf gespeichert und nicht im Web sichtbar.
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-6 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSavingModal}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isSavingModal}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-sky-500/25 disabled:opacity-50"
                >
                  {isSavingModal ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Wird gespeichert...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{modalMode === 'create' ? 'Paket erstellen' : 'Änderungen speichern'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. MODAL: DELETE CONFIRMATION
          ========================================================================= */}
      {packageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-white font-heading">
                Paket wirklich löschen?
              </h3>
              <p className="text-xs text-slate-300">
                Möchtest du das Paket <strong className="text-white">"{packageToDelete.name}"</strong> (slug:{' '}
                <span className="font-mono text-rose-300">{packageToDelete.slug}</span>) wirklich unwiderruflich aus dem System entfernen?
              </p>
              <p className="text-[11px] text-amber-400/90 pt-1">
                Das Paket wird sofort von der öffentlichen Website und aus dem Buchungswizard entfernt.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPackageToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-500/25 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Lösche...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Ja, unwiderruflich löschen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          8. MODAL: RESET TO DEFAULTS CONFIRMATION
          ========================================================================= */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-white font-heading">
                Standardpakete wiederherstellen?
              </h3>
              <p className="text-xs text-slate-300">
                Diese Aktion stellt die 6 originalen Standardpakete (Einzelbesuch, 10er-Block, Kindergeburtstag, Gruppenfeier, Gruppen-Events, Firmen-Events) mit ihren Standardpreisen wieder her.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                disabled={isResetting}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleResetConfirm}
                disabled={isResetting}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25 disabled:opacity-50"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Wiederherstellen...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Jetzt zurücksetzen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
