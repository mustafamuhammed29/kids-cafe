import React, { useState, useEffect, useRef } from 'react';
import type { StaffRole, AdminBusinessSettings } from '../types/admin';
import {
  fetchBusinessSettings,
  saveBusinessSettings,
  uploadBrandingAsset,
  validateSafeUrl,
  DEFAULT_ADMIN_SETTINGS,
} from '../services/adminService';
import {
  Building2,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Trash2,
  Loader2,
  Globe,
  Share2,
  Camera,
  MapPin,
  Image as ImageIcon,
  Upload,
  Scale,
  FileText,
  Shield,
  X,
  Eye,
  RefreshCw,
  Search,
} from 'lucide-react';

interface BusinessSettingsModuleProps {
  currentRole: StaffRole;
}

type SettingsTab = 'branding' | 'legal' | 'contact' | 'hours' | 'seo';
type LegalSubTab = 'impressum' | 'datenschutz' | 'agb';

export const BusinessSettingsModule: React.FC<BusinessSettingsModuleProps> = ({ currentRole }) => {
  const isOwner = currentRole === 'owner';

  const [activeTab, setActiveTab] = useState<SettingsTab>('branding');
  const [legalSubTab, setLegalSubTab] = useState<LegalSubTab>('impressum');
  const [settings, setSettings] = useState<AdminBusinessSettings>(DEFAULT_ADMIN_SETTINGS);
  const [initialSettings, setInitialSettings] = useState<AdminBusinessSettings>(DEFAULT_ADMIN_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Upload States
  const [uploadingTarget, setUploadingTarget] = useState<'logo' | 'favicon' | 'ogImage' | null>(null);
  const [logoPreviewBg, setLogoPreviewBg] = useState<'dark' | 'light'>('dark');

  // File Input Refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const ogImageInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchBusinessSettings();
      setSettings(data);
      setInitialSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setStatusMessage({ type: 'error', text: 'Fehler beim Laden der Einstellungen.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleHourChange = (index: number, field: 'days' | 'time', value: string) => {
    const updated = [...settings.openingHours];
    updated[index] = { ...updated[index], [field]: value };
    setSettings({ ...settings, openingHours: updated });
  };

  const handleAddHourRow = () => {
    setSettings({
      ...settings,
      openingHours: [...settings.openingHours, { days: 'Neuer Tag', time: '10:00 – 18:00 Uhr' }],
    });
  };

  const handleRemoveHourRow = (index: number) => {
    if (settings.openingHours.length <= 1) return;
    setSettings({
      ...settings,
      openingHours: settings.openingHours.filter((_, idx) => idx !== index),
    });
  };

  // Upload handler for Logo, Favicon, OG-Image
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'logo' | 'favicon' | 'ogImage'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTarget(target);
    setStatusMessage(null);

    const res = await uploadBrandingAsset(file);
    setUploadingTarget(null);

    if (res.success && res.url) {
      if (target === 'logo') {
        setSettings((prev) => ({ ...prev, logoUrl: res.url }));
        setStatusMessage({ type: 'success', text: 'Logo erfolgreich hochgeladen und verknüpft! ✨' });
      } else if (target === 'favicon') {
        setSettings((prev) => ({ ...prev, faviconUrl: res.url }));
        setStatusMessage({ type: 'success', text: 'Favicon erfolgreich hochgeladen und verknüpft! 🌐' });
      } else {
        setSettings((prev) => ({ ...prev, ogImageUrl: res.url }));
        setStatusMessage({ type: 'success', text: 'Social-Share Bild erfolgreich hochgeladen! 🖼️' });
      }
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Fehler beim Hochladen der Datei.' });
    }

    // Reset input
    e.target.value = '';
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isOwner) return;

    // Validate all URLs
    const urlsToValidate = [
      { name: 'WhatsApp', url: settings.whatsappUrl },
      { name: 'Instagram', url: settings.instagramUrl },
      { name: 'Google Maps', url: settings.mapsUrl },
      { name: 'Logo', url: settings.logoUrl },
      { name: 'Favicon', url: settings.faviconUrl },
      { name: 'Open Graph Bild', url: settings.ogImageUrl },
    ];

    for (const item of urlsToValidate) {
      if (item.url && !validateSafeUrl(item.url)) {
        setStatusMessage({
          type: 'error',
          text: `Ungültige ${item.name}-URL: Unsichere URL-Schemata (z.B. javascript:, data:) sind nicht erlaubt.`,
        });
        return;
      }
    }

    setIsSaving(true);
    setStatusMessage(null);

    const res = await saveBusinessSettings(settings);
    setIsSaving(false);

    if (res.success) {
      setInitialSettings(settings);
      setStatusMessage({
        type: 'success',
        text: 'Zentrale Website-Einstellungen & rechtliche Angaben erfolgreich gespeichert! ✅',
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Fehler beim Speichern der Einstellungen.' });
    }
  };

  const handleResetCurrent = () => {
    setSettings(initialSettings);
    setStatusMessage({ type: 'success', text: 'Änderungen verworfen und auf den letzten Speicherstand zurückgesetzt.' });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/90 rounded-2xl p-16 border border-slate-800 text-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-sky-400 mb-3" />
        <span className="text-sm font-semibold">Zentrale Website-Einstellungen werden geladen...</span>
      </div>
    );
  }

  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ElementType; badge?: string }> = [
    { id: 'branding', label: 'Logo & Branding', icon: Building2 },
    { id: 'legal', label: 'Rechtliches & Impressum', icon: Scale, badge: 'Neu' },
    { id: 'contact', label: 'Standort & Kontakt', icon: Phone },
    { id: 'hours', label: 'Öffnungszeiten & Tarife', icon: Clock },
    { id: 'seo', label: 'SEO & Social Share', icon: Share2 },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white font-heading tracking-tight flex items-center gap-2">
              Website-Einstellungen &amp; Identität
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-sky-500/15 border border-sky-500/30 text-sky-400">
                Hub
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Zentrale Steuerung für Logo-Upload, gesetzliche Impressumsdaten, Kontaktkanäle, Öffnungszeiten und SEO.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {isOwner && (
            <>
              <button
                type="button"
                onClick={handleResetCurrent}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                title="Änderungen auf letzten Speicherstand zurücksetzen"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Zurücksetzen</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave()}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-sky-500/25 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Einstellungen speichern</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Role permission status banner */}
      {!isOwner ? (
        <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-2xl flex items-start gap-3 text-amber-300 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block mb-0.5">Eingeschränkte Leseberechtigung (Rolle: {currentRole})</strong>
            <span className="text-amber-200/80">
              Zentrale Website- und Identitätsdaten (Branding, rechtliche Angaben, Kontaktdaten) dürfen ausschließlich von der Inhaberin (<strong>Owner</strong>) bearbeitet werden.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl flex items-start gap-3 text-emerald-300 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block mb-0.5">Inhaber-Vollzugriff aktiv (Owner)</strong>
            <span className="text-emerald-200/80">
              Du kannst das Logo direkt hochladen, alle rechtlichen Pflichtangaben gemäß § 5 DDG hinterlegen und das Branding in Echtzeit steuern.
            </span>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 animate-fadeIn border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
              : 'bg-rose-950/60 border-rose-800/60 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="font-semibold">{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Structured Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-x-auto shadow-md">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase ${
                    isActive ? 'bg-white/20 text-white' : 'bg-sky-500/20 text-sky-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Hidden File Inputs for Logo, Favicon, OG-Image */}
      <input
        ref={logoInputRef}
        type="file"
        accept=".svg,.png,.webp,.jpg,.jpeg,.ico"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'logo')}
      />
      <input
        ref={faviconInputRef}
        type="file"
        accept=".svg,.png,.webp,.ico"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'favicon')}
      />
      <input
        ref={ogImageInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'ogImage')}
      />

      {/* 3. Tab Contents Form */}
      <form onSubmit={(e) => handleSave(e)} className="space-y-6">
        {/* =====================================================================
            TAB 1: LOGO & BRANDING
            ===================================================================== */}
        {activeTab === 'branding' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2 font-heading">
                    <Building2 className="w-5 h-5 text-sky-400" />
                    Markenauftritt, Logo &amp; Favicon
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Lade das Website-Logo und Browser-Favicon direkt hoch oder verlinke eine CDN-URL.
                  </p>
                </div>
              </div>

              {/* Basic Brand Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Website- &amp; Markenname *
                  </label>
                  <input
                    type="text"
                    disabled={!isOwner}
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white disabled:bg-slate-950/40 disabled:text-slate-500 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Slogan / Tagline
                  </label>
                  <input
                    type="text"
                    disabled={!isOwner}
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white disabled:bg-slate-950/40 disabled:text-slate-500 focus:border-sky-500"
                  />
                </div>
              </div>

              {/* LOGO UPLOAD & URL SECTION */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold uppercase text-sky-400 tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Haupt-Website Logo
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Unterstützt: SVG (Vektor), PNG (Transparent), WEBP, JPG
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Left: Input & Upload Button */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        disabled={!isOwner}
                        value={settings.logoUrl || ''}
                        onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                        placeholder="/favicon.svg oder https://..."
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white placeholder-slate-500 focus:border-sky-500 font-mono"
                      />
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          disabled={uploadingTarget === 'logo'}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-sky-500/20 whitespace-nowrap disabled:opacity-50"
                        >
                          {uploadingTarget === 'logo' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          <span>Logo hochladen</span>
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span>Schnellauswahl:</span>
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, logoUrl: '/favicon.svg' })}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition cursor-pointer"
                      >
                        /favicon.svg (Standard)
                      </button>
                      {settings.logoUrl && (
                        <button
                          type="button"
                          onClick={() => setSettings({ ...settings, logoUrl: '' })}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                        >
                          Entfernen
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right: Interactive Logo Live Preview */}
                  <div className="lg:col-span-5 bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-sky-400" />
                        Live-Vorschau
                      </span>
                      <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                        <button
                          type="button"
                          onClick={() => setLogoPreviewBg('dark')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                            logoPreviewBg === 'dark' ? 'bg-slate-800 text-white' : 'text-slate-400'
                          }`}
                        >
                          Dunkel
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogoPreviewBg('light')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                            logoPreviewBg === 'light' ? 'bg-white text-slate-950' : 'text-slate-400'
                          }`}
                        >
                          Hell
                        </button>
                      </div>
                    </div>

                    <div
                      className={`h-28 rounded-xl border flex items-center justify-center p-3 transition ${
                        logoPreviewBg === 'dark'
                          ? 'bg-slate-900/90 border-slate-800'
                          : 'bg-white border-slate-200 shadow-inner'
                      }`}
                    >
                      {settings.logoUrl ? (
                        <img
                          src={settings.logoUrl}
                          alt="Logo Vorschau"
                          className="max-h-20 max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="text-center text-slate-500 text-xs">
                          <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                          <span>Kein Logo hinterlegt</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* FAVICON UPLOAD & URL SECTION */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold uppercase text-sky-400 tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Favicon &amp; Browser-Tab Icon
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Unterstützt: SVG, ICO, PNG (Empfohlen: 32x32 oder 64x64)
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Left: Input & Upload Button */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        disabled={!isOwner}
                        value={settings.faviconUrl || ''}
                        onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
                        placeholder="/favicon.svg"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white placeholder-slate-500 focus:border-sky-500 font-mono"
                      />
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => faviconInputRef.current?.click()}
                          disabled={uploadingTarget === 'favicon'}
                          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-slate-700 whitespace-nowrap disabled:opacity-50"
                        >
                          {uploadingTarget === 'favicon' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 text-sky-400" />
                          )}
                          <span>Favicon hochladen</span>
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span>Schnellauswahl:</span>
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, faviconUrl: '/favicon.svg' })}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition cursor-pointer"
                      >
                        /favicon.svg
                      </button>
                    </div>
                  </div>

                  {/* Right: Mock Browser Tab Preview */}
                  <div className="lg:col-span-5 bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2">
                    <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-sky-400" />
                      Browser-Tab Live-Vorschau
                    </span>

                    {/* Realistic Chrome Tab Mock */}
                    <div className="bg-slate-900 rounded-xl p-2.5 border border-slate-800 flex items-center gap-2 shadow-inner">
                      <div className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                        {settings.faviconUrl ? (
                          <img
                            src={settings.faviconUrl}
                            alt="Favicon"
                            className="w-4 h-4 object-contain"
                          />
                        ) : (
                          <Globe className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-200 truncate">
                        {settings.name || 'Haven Kids Café'} – Spielcafé &amp; Salzraum
                      </span>
                      <X className="w-3 h-3 text-slate-500 ml-auto shrink-0" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Notice */}
              <div className="pt-4 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Footer-Identitätstext (Seitenfuß)
                </label>
                <textarea
                  rows={2}
                  disabled={!isOwner}
                  value={settings.footerNotice || ''}
                  onChange={(e) => setSettings({ ...settings, footerNotice: e.target.value })}
                  placeholder="Kurze Zusammenfassung für den Seitenfuß..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white placeholder-slate-500 focus:border-sky-500 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 2: RECHTLICHE SEITEN & COMPLIANCE (IMPRESSUM, DATENSCHUTZ, AGB)
            ===================================================================== */}
        {activeTab === 'legal' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Sub-Navigation for Legal Documents (Matching screenshot buttons) */}
            <div className="bg-slate-900/90 rounded-2xl p-2.5 border border-slate-800 shadow-xl flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setLegalSubTab('impressum')}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  legalSubTab === 'impressum'
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Impressum (§ 5 DDG)</span>
              </button>

              <button
                type="button"
                onClick={() => setLegalSubTab('datenschutz')}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  legalSubTab === 'datenschutz'
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Datenschutzerklärung (DSGVO)</span>
              </button>

              <button
                type="button"
                onClick={() => setLegalSubTab('agb')}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  legalSubTab === 'agb'
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>AGB &amp; Besuchsregeln</span>
              </button>
            </div>

            {/* -------------------------------------------------------------
                SUB-PAGE 1: IMPRESSUM (§ 5 DDG)
                ------------------------------------------------------------- */}
            {legalSubTab === 'impressum' && (
              <div className="bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6 animate-fadeIn">
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="font-bold text-base text-white flex items-center gap-2 font-heading">
                    <Scale className="w-5 h-5 text-sky-400" />
                    Gesetzliche Anbieterkennzeichnung &amp; Impressum (§ 5 DDG)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Vollständige Angaben für ein abmahnsicheres Impressum, Steuernummern, Handelsregister und Aufsichtsbehörden.
                  </p>
                </div>

                {/* 1. Anbieter & Inhaber */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-sky-400 tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    1. Vertretungsberechtigte &amp; Rechtsform
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Inhaber / Vertretungsberechtigter *
                      </label>
                      <input
                        type="text"
                        disabled={!isOwner}
                        placeholder="z. B. Mustafa Muhammed"
                        value={settings.ownerName || ''}
                        onChange={(e) => setSettings({ ...settings, ownerName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Offizielle Firmenbezeichnung / Rechtsform *
                      </label>
                      <input
                        type="text"
                        disabled={!isOwner}
                        placeholder="z. B. Haven Kids Café Berlin (Einzelunternehmen / GmbH)"
                        value={settings.companyLegalName || ''}
                        onChange={(e) => setSettings({ ...settings, companyLegalName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:border-sky-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Rechtliche Geschäftsanschrift (für das Impressum) *
                      </label>
                      <input
                        type="text"
                        disabled={!isOwner}
                        placeholder="Friedrichstraße 123, 10117 Berlin, Deutschland"
                        value={settings.legalAddress || settings.address}
                        onChange={(e) => setSettings({ ...settings, legalAddress: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Steuern & Register */}
                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <h4 className="text-xs font-black uppercase text-sky-400 tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    2. Steuernummern &amp; Handelsregister
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Umsatzsteuer-Identifikationsnummer (USt-IdNr.)
                      </label>
                      <input
                        type="text"
                        disabled={!isOwner}
                        placeholder="z. B. DE123456789 oder 'Beantragt / in Zuteilung'"
                        value={settings.taxId || ''}
                        onChange={(e) => setSettings({ ...settings, taxId: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:border-sky-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Steuernummer (Finanzamt)
                      </label>
                      <input
                        type="text"
                        disabled={!isOwner}
                        placeholder="z. B. 30/123/45678 (optional für Impressum)"
                        value={settings.taxNumber || ''}
                        onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:border-sky-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Registergericht
                      </label>
                      <input
                        type="text"
                        disabled={!isOwner}
                        placeholder="z. B. Amtsgericht Charlottenburg (Berlin)"
                        value={settings.registerCourt || ''}
                        onChange={(e) => setSettings({ ...settings, registerCourt: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Registernummer
                      </label>
                      <input
                        type="text"
                        disabled={!isOwner}
                        placeholder="z. B. HRB 123456 B oder 'Gewerbeanmeldung vorliegend'"
                        value={settings.registerNumber || ''}
                        onChange={(e) => setSettings({ ...settings, registerNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:border-sky-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Aufsichtsbehörden & Schlichtung */}
                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <h4 className="text-xs font-black uppercase text-sky-400 tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    3. Aufsichtsbehörde &amp; Streitschlichtung
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Zuständige Aufsichtsbehörde
                      </label>
                      <input
                        type="text"
                        disabled={!isOwner}
                        placeholder="z. B. Bezirksamt Mitte von Berlin – Ordnungsamt / Gewerbeamt"
                        value={settings.regulatoryAuthority || ''}
                        onChange={(e) => setSettings({ ...settings, regulatoryAuthority: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Berufshaftpflichtversicherung
                      </label>
                      <input
                        type="text"
                        disabled={!isOwner}
                        placeholder="z. B. Betriebshaftpflichtversicherung mit Deckung für Kinderspielbereiche (Geltungsbereich: Deutschland)"
                        value={settings.liabilityInsurance || ''}
                        onChange={(e) => setSettings({ ...settings, liabilityInsurance: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Verbraucherstreitbeilegung (OS-Plattform Klausel)
                      </label>
                      <textarea
                        rows={2}
                        disabled={!isOwner}
                        value={settings.disputeResolutionNotice || ''}
                        onChange={(e) => setSettings({ ...settings, disputeResolutionNotice: e.target.value })}
                        placeholder="Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung bereit..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:border-sky-500 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Zusätzliche Hausordnungs- &amp; AGB-Klauseln (im Impressum)
                      </label>
                      <textarea
                        rows={2}
                        disabled={!isOwner}
                        value={settings.additionalLegalNotice || ''}
                        onChange={(e) => setSettings({ ...settings, additionalLegalNotice: e.target.value })}
                        placeholder="z. B. Besuch nur mit volljähriger Aufsichtsperson. Sockenpflicht im Spielbereich."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:border-sky-500 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Impressum Live Preview Box */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-white flex items-center gap-2">
                        <Eye className="w-4 h-4 text-sky-400" />
                        Live-Vorschau: So erscheint dein Impressum für Kunden
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                        § 5 DDG Konform
                      </span>
                    </div>

                    <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-800 text-xs text-slate-300 space-y-3 font-sans leading-relaxed">
                      <div>
                        <strong className="text-white block font-bold text-sm">
                          {settings.companyLegalName || settings.name}
                        </strong>
                        <span>Inhaber: {settings.ownerName || 'Mustafa Muhammed'}</span><br />
                        <span>{settings.legalAddress || settings.address}</span>
                      </div>

                      <div>
                        <strong className="text-white block font-bold">Kontakt:</strong>
                        <span>Telefon: {settings.phone}</span><br />
                        <span>E-Mail: {settings.email}</span>
                      </div>

                      <div>
                        <strong className="text-white block font-bold">Umsatzsteuer-Identifikationsnummer:</strong>
                        <span>{settings.taxId || 'DE (Beantragt / in Zuteilung)'}</span>
                      </div>

                      {settings.registerCourt && (
                        <div>
                          <strong className="text-white block font-bold">Registereintrag:</strong>
                          <span>{settings.registerCourt} — {settings.registerNumber}</span>
                        </div>
                      )}

                      {settings.regulatoryAuthority && (
                        <div>
                          <strong className="text-white block font-bold">Aufsichtsbehörde:</strong>
                          <span>{settings.regulatoryAuthority}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                SUB-PAGE 2: DATENSCHUTZERKLÄRUNG (DSGVO / BDSG / TDDDG)
                ------------------------------------------------------------- */}
            {legalSubTab === 'datenschutz' && (
              <div className="bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6 animate-fadeIn">
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="font-bold text-base text-white flex items-center gap-2 font-heading">
                    <Shield className="w-5 h-5 text-sky-400" />
                    Datenschutzerklärung &amp; Transparenz (EU-DSGVO, BDSG &amp; § 25 TDDDG)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Transparente Information über die Verarbeitung von Kundendaten, Buchungen und Server-Infrastruktur.
                  </p>
                </div>

                {/* Built-in compliance badge */}
                <div className="p-4 bg-sky-950/40 border border-sky-800/60 rounded-xl flex items-start gap-3 text-sky-200 text-xs">
                  <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block text-white mb-0.5">Automatischer DSGVO-Grundschutz aktiv</strong>
                    <span className="text-sky-300/80">
                      Deine Plattform speichert Daten ausschließlich auf ISO-zertifizierten EU-Servern in Frankfurt am Main (Supabase). Für Buchungen werden datenschutzfreundliche UUID-Tokens ohne Kundenkonto-Zwang genutzt. Formulare sind über Cloudflare Turnstile vor Spam geschützt.
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Datenschutzbeauftragter / Kontakt für Datenschutzanfragen (optional)
                    </label>
                    <input
                      type="text"
                      disabled={!isOwner}
                      placeholder="z. B. Mustafa Muhammed (datenschutz@havenkidscafe.de)"
                      value={settings.privacyDpoContact || ''}
                      onChange={(e) => setSettings({ ...settings, privacyDpoContact: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:border-sky-500"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Wird in Abschnitt 1 der Datenschutzerklärung als gesonderter Ansprechpartner für Betroffenenrechte aufgeführt.
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-300">
                        Individueller Text für die Datenschutzerklärung (Optional)
                      </label>
                      <div className="flex items-center gap-2">
                        {isOwner && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                const sample = `1. Verantwortliche Stelle:
Verantwortlich für die Datenverarbeitung ist ${settings.companyLegalName || settings.name} (Inhaber: ${settings.ownerName || 'Mustafa Muhammed'}, ${settings.legalAddress || settings.address}). E-Mail: ${settings.email}.

2. Buchungs- & Reservierungsdaten:
Wir verarbeiten Name, E-Mail-Adresse, Telefonnummer sowie Anzahl der Kinder ausschließlich zur Durchführung von Besuchs-Reservierungen (Art. 6 Abs. 1 lit. b DSGVO).

3. Server-Infrastruktur & Cloudflare Turnstile:
Die Datenhaltung erfolgt in EU-Rechenzentren (Frankfurt am Main). Formulare sind durch datenschutzfreundlichen Bot-Schutz geschützt.

4. Betroffenenrechte:
Du hast jederzeit das Recht auf Auskunft, Berichtigung oder Löschung deiner personenbezogenen Daten (Art. 15-21 DSGVO).`;
                                setSettings({ ...settings, privacyCustomText: sample });
                              }}
                              className="text-[11px] font-bold text-sky-400 hover:text-sky-300 cursor-pointer underline"
                            >
                              Mustertext laden
                            </button>
                            {settings.privacyCustomText && (
                              <button
                                type="button"
                                onClick={() => setSettings({ ...settings, privacyCustomText: '' })}
                                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 cursor-pointer underline"
                              >
                                Zurücksetzen
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <textarea
                      rows={8}
                      disabled={!isOwner}
                      value={settings.privacyCustomText || ''}
                      onChange={(e) => setSettings({ ...settings, privacyCustomText: e.target.value })}
                      placeholder="Standardmäßig wird die gesetzeskonforme DSGVO-Erklärung automatisch generiert. Möchtest du zusätzliche Absätze ergänzen oder einen eigenen Text hinterlegen, trage ihn hier ein..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:border-sky-500 font-sans leading-relaxed resize-y"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Leer lassen, um die vollständige, automatisch rechtssichere Standard-Datenschutzerklärung der Website zu nutzen.
                    </span>
                  </div>
                </div>

                {/* Datenschutz Live Preview Box */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-white flex items-center gap-2">
                        <Eye className="w-4 h-4 text-sky-400" />
                        Live-Vorschau: Datenschutzerklärung
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                        DSGVO Konform
                      </span>
                    </div>

                    <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-800 text-xs text-slate-300 space-y-3 font-sans leading-relaxed max-h-64 overflow-y-auto">
                      {settings.privacyCustomText ? (
                        <div className="whitespace-pre-wrap">{settings.privacyCustomText}</div>
                      ) : (
                        <>
                          <p>
                            Wir nehmen den Schutz deiner persönlichen Daten und der Daten deiner Kinder sehr ernst. Wir behandeln personenbezogene Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften (EU-DSGVO, BDSG, TDDDG).
                          </p>
                          <div>
                            <strong className="text-white block font-bold">1. Verantwortliche Stelle:</strong>
                            <span>{settings.companyLegalName || settings.name}</span><br />
                            <span>Inhaber: {settings.ownerName || 'Mustafa Muhammed'}</span><br />
                            <span>{settings.legalAddress || settings.address}</span><br />
                            <span>E-Mail: {settings.email} | Tel: {settings.phone}</span>
                            {settings.privacyDpoContact && (
                              <div className="mt-1 text-sky-400">
                                <strong>Datenschutz-Kontakt:</strong> {settings.privacyDpoContact}
                              </div>
                            )}
                          </div>
                          <div>
                            <strong className="text-white block font-bold">2. Server-Logfiles &amp; Backend:</strong>
                            <span>Speicherung erfolgt in ISO-zertifizierten Rechenzentren in Frankfurt am Main (EU). Keine invasive Profilbildung.</span>
                          </div>
                          <div>
                            <strong className="text-white block font-bold">3. Buchungsdaten &amp; Stornierungs-Token:</strong>
                            <span>Erfassung erfolgt ausschließlich zur Durchführung und Bestätigung der Reservierung (Art. 6 Abs. 1 lit. b DSGVO).</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                SUB-PAGE 3: AGB & BESUCHSREGELN
                ------------------------------------------------------------- */}
            {legalSubTab === 'agb' && (
              <div className="bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6 animate-fadeIn">
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="font-bold text-base text-white flex items-center gap-2 font-heading">
                    <Scale className="w-5 h-5 text-sky-400" />
                    AGB, Besuchsregeln &amp; Hausordnung
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Regelungen für Besuche, Stornierungsfristen, Spielbereich-Hygiene und Aufsichtspflicht (§ 832 BGB).
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Stornierungsbedingungen &amp; Fristen *
                    </label>
                    <textarea
                      rows={3}
                      disabled={!isOwner}
                      value={settings.cancellationNotice || ''}
                      onChange={(e) => setSettings({ ...settings, cancellationNotice: e.target.value })}
                      placeholder="z. B. Standard-Einzelbesuche & 10er-Block-Reservierungen können bis zu 2 Stunden vor Beginn kostenfrei online über den Token-Link storniert werden. Für Feiern gilt eine Frist von 48 Stunden."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:border-sky-500 font-sans leading-relaxed resize-none"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Wird Kunden bei der Buchung und im Bestätigungs-Bereich als verbindliche Frist angezeigt.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Hausordnung, Sockenpflicht &amp; Aufsichtspflicht *
                    </label>
                    <textarea
                      rows={4}
                      disabled={!isOwner}
                      value={settings.houseRulesNotice || ''}
                      onChange={(e) => setSettings({ ...settings, houseRulesNotice: e.target.value })}
                      placeholder="z. B. 1. Sockenpflicht im gesamten Spielbereich. 2. Keine Kinderbetreuung: Die gesetzliche Aufsichtspflicht verbleibt stets bei den Eltern..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:border-sky-500 font-sans leading-relaxed resize-y"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Wichtige Sicherheitsregeln für die Eltern und den Spielbereich.
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-300">
                        Vollständiger individueller AGB-Text (Optional)
                      </label>
                      <div className="flex items-center gap-2">
                        {isOwner && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                const sample = `1. Geltungsbereich:
Diese AGB gelten für alle Reservierungen und den gesamten Aufenthalt in den Räumlichkeiten von ${settings.companyLegalName || settings.name} (Inhaber: ${settings.ownerName || 'Mustafa Muhammed'}, ${settings.legalAddress || settings.address}).

2. Keine Kinderbetreuung & Aufsichtspflicht:
Wir bieten keine Kinderbetreuung an. Die gesetzliche Aufsichtspflicht (§ 832 BGB) verbleibt während des gesamten Aufenthalts lückenlos bei den Eltern bzw. erwachsenen Begleitpersonen.

3. Sockenpflicht:
Im gesamten Spielbereich gilt ausnahmslos Sockenpflicht (rutschfeste Stopper-Socken empfohlen).

4. Stornierungsfristen:
${settings.cancellationNotice || 'Kostenfreie Online-Stornierung bis 2 Stunden vor Beginn für Standard-Termine.'}

5. Gesundheit & Hygiene:
Kindern und Begleitpersonen mit ansteckenden Infektionskrankheiten ist der Zutritt zum Schutz anderer Gäste untersagt.`;
                                setSettings({ ...settings, termsCustomText: sample });
                              }}
                              className="text-[11px] font-bold text-sky-400 hover:text-sky-300 cursor-pointer underline"
                            >
                              Muster-AGB laden
                            </button>
                            {settings.termsCustomText && (
                              <button
                                type="button"
                                onClick={() => setSettings({ ...settings, termsCustomText: '' })}
                                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 cursor-pointer underline"
                              >
                                Zurücksetzen
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <textarea
                      rows={8}
                      disabled={!isOwner}
                      value={settings.termsCustomText || ''}
                      onChange={(e) => setSettings({ ...settings, termsCustomText: e.target.value })}
                      placeholder="Leer lassen, um die Standard-AGB mit den oben definierten Stornierungs- und Hausordnungsregeln zu nutzen..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:border-sky-500 font-sans leading-relaxed resize-y"
                    />
                  </div>
                </div>

                {/* AGB Live Preview Box */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-white flex items-center gap-2">
                        <Eye className="w-4 h-4 text-sky-400" />
                        Live-Vorschau: AGB &amp; Besuchsregeln
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                        Kundenansicht
                      </span>
                    </div>

                    <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-800 text-xs text-slate-300 space-y-3 font-sans leading-relaxed max-h-64 overflow-y-auto">
                      {settings.termsCustomText ? (
                        <div className="whitespace-pre-wrap">{settings.termsCustomText}</div>
                      ) : (
                        <>
                          <div>
                            <strong className="text-white block font-bold">1. Geltungsbereich:</strong>
                            <span>Gilt für {settings.companyLegalName || settings.name} ({settings.legalAddress || settings.address}).</span>
                          </div>
                          <div>
                            <strong className="text-white block font-bold">2. Stornierungsbedingungen:</strong>
                            <p className="mt-0.5 text-sky-300 font-medium">
                              {settings.cancellationNotice || 'Kostenfreie Online-Stornierung bis zu 2 Stunden vor Beginn für Standard-Termine.'}
                            </p>
                          </div>
                          <div>
                            <strong className="text-white block font-bold">3. Hausordnung &amp; Aufsichtspflicht (§ 832 BGB):</strong>
                            <div className="mt-0.5 whitespace-pre-line text-slate-300">
                              {settings.houseRulesNotice || 'Keine Kinderbetreuung. Aufsichtspflicht liegt lückenlos bei den Eltern. Sockenpflicht im Spielbereich.'}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 3: STANDORT & KONTAKT
            ===================================================================== */}
        {activeTab === 'contact' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="font-bold text-base text-white flex items-center gap-2 font-heading">
                  <Phone className="w-5 h-5 text-sky-400" />
                  Kontaktdaten &amp; Externe Kanäle
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Standortadresse, Tap-to-Call Telefonnummer, WhatsApp Direct und Social Links.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    Geschäftsadresse (Öffentlich)
                  </label>
                  <input
                    type="text"
                    disabled={!isOwner}
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    placeholder="Friedrichstraße 123, 10117 Berlin"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-sky-400" />
                    Telefonnummer (Tap-to-Call)
                  </label>
                  <input
                    type="text"
                    disabled={!isOwner}
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    placeholder="+49 30 1234 5678"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-400" />
                    E-Mail-Adresse für Anfragen
                  </label>
                  <input
                    type="email"
                    disabled={!isOwner}
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    placeholder="hallo@havenkidscafe.de"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    WhatsApp Direct Link
                  </label>
                  <input
                    type="text"
                    disabled={!isOwner}
                    value={settings.whatsappUrl}
                    onChange={(e) => setSettings({ ...settings, whatsappUrl: e.target.value })}
                    placeholder="https://wa.me/493012345678"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-rose-400" />
                    Instagram Profil-URL
                  </label>
                  <input
                    type="text"
                    disabled={!isOwner}
                    value={settings.instagramUrl || ''}
                    onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/havenkidscafe"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    Google Maps Standort-URL
                  </label>
                  <input
                    type="text"
                    disabled={!isOwner}
                    value={settings.mapsUrl || ''}
                    onChange={(e) => setSettings({ ...settings, mapsUrl: e.target.value })}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:border-sky-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 4: ÖFFNUNGSZEITEN & TARIFE
            ===================================================================== */}
        {activeTab === 'hours' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2 font-heading">
                    <Clock className="w-5 h-5 text-sky-400" />
                    Reguläre Öffnungszeiten &amp; Zusatzpreise
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Steuert die Anzeige der Betriebszeiten auf Homepage, Kontaktseite und Footer.
                  </p>
                </div>
                {isOwner && (
                  <button
                    type="button"
                    onClick={handleAddHourRow}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-sky-400" />
                    <span>Zeile hinzufügen</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {settings.openingHours.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        disabled={!isOwner}
                        value={row.days}
                        onChange={(e) => handleHourChange(idx, 'days', e.target.value)}
                        placeholder="z. B. Montag – Donnerstag"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white font-medium focus:border-sky-500"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        disabled={!isOwner}
                        value={row.time}
                        onChange={(e) => handleHourChange(idx, 'time', e.target.value)}
                        placeholder="z. B. 10:00 – 18:00 Uhr"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white font-medium focus:border-sky-500"
                      />
                    </div>
                    {isOwner && settings.openingHours.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveHourRow(idx)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                        title="Zeile entfernen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Salzraum Add-on Aufpreis (€ / Kind)
                </label>
                <div className="flex items-center gap-2 max-w-xs">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    disabled={!isOwner}
                    value={settings.saltRoomAddonPrice}
                    onChange={(e) =>
                      setSettings({ ...settings, saltRoomAddonPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-36 px-3.5 py-2 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white font-bold focus:border-sky-500"
                  />
                  <span className="text-xs font-bold text-slate-400">€ pro Kind</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 5: SEO & SOCIAL SHARING
            ===================================================================== */}
        {activeTab === 'seo' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="font-bold text-base text-white flex items-center gap-2 font-heading">
                  <Share2 className="w-5 h-5 text-sky-400" />
                  SEO, Metadaten &amp; Open Graph Vorschau
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Standardtitel, Kurzbeschreibung und Vorschaubild für Suchmaschinen und Messenger-Vorschauen.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      Standard Meta-Titel (Title Tag)
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {(settings.seoTitle || '').length} / 60 Zeichen empfohlen
                    </span>
                  </div>
                  <input
                    type="text"
                    disabled={!isOwner}
                    value={settings.seoTitle || ''}
                    onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })}
                    placeholder="Haven Kids Café | Spielcafé & Salzraum in Berlin"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:border-sky-500 font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      Standard Meta-Beschreibung (Meta Description)
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {(settings.seoDescription || '').length} / 155 Zeichen empfohlen
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    disabled={!isOwner}
                    value={settings.seoDescription || ''}
                    onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
                    placeholder="Sicherer Spielbereich für Kinder 0-8 Jahre..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:border-sky-500 resize-none"
                  />
                </div>

                {/* Open Graph Image Upload */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                    Open Graph Share-Bild (1200 x 630 px)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      disabled={!isOwner}
                      value={settings.ogImageUrl || ''}
                      onChange={(e) => setSettings({ ...settings, ogImageUrl: e.target.value })}
                      placeholder="/assets/spielbereich.jpg oder https://..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white focus:border-sky-500 font-mono"
                    />
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => ogImageInputRef.current?.click()}
                        disabled={uploadingTarget === 'ogImage'}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-slate-700 whitespace-nowrap disabled:opacity-50"
                      >
                        {uploadingTarget === 'ogImage' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 text-sky-400" />
                        )}
                        <span>Bild hochladen</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Google Search Live Preview */}
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-sky-400" />
                    Google Suchergebnis-Vorschau (SERP)
                  </span>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-[11px] text-slate-400 font-mono">
                      https://havenkidscafe.de
                    </div>
                    <div className="text-sm font-semibold text-sky-400 hover:underline cursor-pointer">
                      {settings.seoTitle || settings.name}
                    </div>
                    <div className="text-xs text-slate-300 line-clamp-2">
                      {settings.seoDescription || settings.tagline}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Bottom Sticky Action Bar */}
        {isOwner && (
          <div className="bg-slate-900/95 border border-slate-800 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 sticky bottom-4 z-40 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>
                Bereit zum Speichern aller Tabs (Branding, Impressum, Kontakt, Zeiten, SEO)
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleResetCurrent}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Verwerfen
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-sky-500/25 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Wird gespeichert...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Alle Einstellungen speichern</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
