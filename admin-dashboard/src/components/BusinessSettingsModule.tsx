import React, { useState, useEffect } from 'react';
import type { StaffRole } from '../types/admin';
import {
  fetchBusinessSettings,
  saveBusinessSettings,
  validateSafeUrl,
  DEFAULT_ADMIN_SETTINGS,
} from '../services/adminService';
import type { AdminBusinessSettings } from '../types/admin';
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
  Plus,
  Trash2,
  Loader2,
  Globe,
  Share2,
  Lock,
  Camera,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react';

interface BusinessSettingsModuleProps {
  currentRole: StaffRole;
}

export const BusinessSettingsModule: React.FC<BusinessSettingsModuleProps> = ({ currentRole }) => {
  const isOwner = currentRole === 'owner';

  const [settings, setSettings] = useState<AdminBusinessSettings>(DEFAULT_ADMIN_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchBusinessSettings().then((data) => {
      setSettings(data);
      setIsLoading(false);
    });
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setStatusMessage({ type: 'success', text: 'Zentrale Website-Einstellungen & Identitätsdaten erfolgreich gespeichert.' });
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Fehler beim Speichern der Einstellungen.' });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/90 rounded-2xl p-12 border border-slate-800 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-sky-400 mb-2" />
        <span className="text-xs">Zentrale Einstellungen werden geladen...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Role permission status banner */}
      {!isOwner ? (
        <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-2xl flex items-start gap-3 text-amber-300 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block mb-0.5">Eingeschränkte Leseberechtigung (Rolle: {currentRole})</strong>
            <span className="text-amber-200/80">
              Zentrale Website- und Identitätsdaten (Branding, SEO, Kontaktdaten, Öffnungszeiten) dürfen ausschließlich von der Inhaberin (<strong>Owner</strong>) bearbeitet werden. Staff- und Admin-Konten haben nur Lesezugriff.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl flex items-start gap-3 text-emerald-300 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block mb-0.5">Inhaber-Berechtigung aktiv (Owner)</strong>
            <span className="text-emerald-200/80">
              Du hast uneingeschränkte Schreibberechtigung auf die zentralen Website-Einstellungen, Kontaktdaten, SEO-Metadaten und Branding-Assets.
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
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: Brand & Identity */}
        <div className="bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl shadow-black/20 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-sky-400" />
              Unternehmensidentität &amp; Branding
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Definiert den Markenauftritt auf Homepage, Navigation, Footer und Metadaten.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Website- &amp; Markenname *
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white disabled:bg-slate-950/40 disabled:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Slogan / Tagline
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white disabled:bg-slate-950/40 disabled:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                Logo-Asset Pfad oder URL
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={settings.logoUrl || ''}
                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                placeholder="/favicon.svg oder https://..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white placeholder-slate-500 disabled:bg-slate-950/40 disabled:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Favicon / Touch Icon URL
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={settings.faviconUrl || ''}
                onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
                placeholder="/favicon.svg"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white placeholder-slate-500 disabled:bg-slate-950/40 disabled:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Footer-Identitätstext
              </label>
              <textarea
                rows={2}
                disabled={!isOwner}
                value={settings.footerNotice || ''}
                onChange={(e) => setSettings({ ...settings, footerNotice: e.target.value })}
                placeholder="Kurze Beschreibung im Seitenfuß..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white placeholder-slate-500 disabled:bg-slate-950/40 disabled:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Public Contact & Social Links */}
        <div className="bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl shadow-black/20 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-sky-400" />
              Kontaktdaten &amp; Externe Kanäle
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Standortadresse, Tap-to-Call Telefonnummer, WhatsApp Direct und Social Links.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Geschäftsadresse
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="z. B. Friedrichstraße 123, 10117 Berlin"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white placeholder-slate-500 disabled:bg-slate-950/40 disabled:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Telefonnummer (Tap-to-Call)
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="+49 30 1234 5678"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white placeholder-slate-500 disabled:bg-slate-950/40 disabled:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                E-Mail-Adresse für Anfragen
              </label>
              <input
                type="email"
                disabled={!isOwner}
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="hallo@havenkidscafe.de"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white placeholder-slate-500 disabled:bg-slate-950/40 disabled:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                WhatsApp Direct Link
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={settings.whatsappUrl}
                onChange={(e) => setSettings({ ...settings, whatsappUrl: e.target.value })}
                placeholder="https://wa.me/493012345678"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white placeholder-slate-500 disabled:bg-slate-950/40 disabled:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-rose-400" />
                Instagram Profil-URL
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={settings.instagramUrl || ''}
                onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/havenkidscafe"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white placeholder-slate-500 disabled:bg-slate-950/40 disabled:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Default SEO & Social Sharing */}
        <div className="bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl shadow-black/20 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-sky-400" />
              Standard-SEO &amp; Open Graph Vorschau
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Standardtitel, Kurzbeschreibung und Vorschaubild für Google und WhatsApp/Facebook-Vorschauen.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Standard Meta-Titel (Title Tag)
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={settings.seoTitle || ''}
                onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })}
                placeholder="Haven Kids Café | Spielcafé & Salzraum in Berlin"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white placeholder-slate-500 disabled:bg-slate-950/40 disabled:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Standard Meta-Beschreibung (Meta Description)
              </label>
              <textarea
                rows={2}
                disabled={!isOwner}
                value={settings.seoDescription || ''}
                onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
                placeholder="Sicherer Spielbereich für Kinder 0-8 Jahre..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white placeholder-slate-500 disabled:bg-slate-950/40 disabled:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                Open Graph Share-Bild URL
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={settings.ogImageUrl || ''}
                onChange={(e) => setSettings({ ...settings, ogImageUrl: e.target.value })}
                placeholder="/assets/spielbereich.jpg oder https://..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white placeholder-slate-500 disabled:bg-slate-950/40 disabled:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Opening Hours Table & Add-on Price */}
        <div className="bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl shadow-black/20 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white disabled:bg-slate-950/40 disabled:text-slate-500 font-medium"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    disabled={!isOwner}
                    value={row.time}
                    onChange={(e) => handleHourChange(idx, 'time', e.target.value)}
                    placeholder="z. B. 10:00 – 18:00 Uhr"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white disabled:bg-slate-950/40 disabled:text-slate-500 font-medium"
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

          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Salzraum Add-on Aufpreis (€)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              disabled={!isOwner}
              value={settings.saltRoomAddonPrice}
              onChange={(e) => setSettings({ ...settings, saltRoomAddonPrice: parseFloat(e.target.value) || 0 })}
              className="w-36 px-3.5 py-2 rounded-xl border border-slate-700 text-xs bg-slate-950 text-white disabled:bg-slate-950/40 disabled:text-slate-500 font-medium"
            />
          </div>
        </div>

        {/* SECTION 5: Code-Protected Compliance Notice */}
        <div className="bg-slate-950/60 rounded-2xl p-6 border border-slate-800 space-y-3 text-xs text-slate-300">
          <div className="flex items-center gap-2 font-bold text-white">
            <Lock className="w-4 h-4 text-sky-400" />
            <span>Rechtssicherheits-Architektur: Was bleibt code-geschützt?</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] leading-relaxed">
            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
              <strong className="block text-white mb-1">Im Code fixiert (Compliance-Locked):</strong>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                <li>Impressum (§ 5 DDG Anbieterkennzeichnung)</li>
                <li>Datenschutzerklärung (§ 25 TDDDG, EU-DSGVO)</li>
                <li>AGB &amp; Stornierungsfristen (BGB-konform)</li>
                <li>HWG-konformer Salzraum-Haftungsausschluss</li>
              </ul>
            </div>
            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
              <strong className="block text-white mb-1">Im Admin editierbar (Betriebsführung):</strong>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                <li>Markenname, Slogan, Logo &amp; Favicon</li>
                <li>Adresse, Telefon, E-Mail &amp; WhatsApp</li>
                <li>Instagram- &amp; Google Maps-Links</li>
                <li>Öffnungszeiten, Pakete &amp; Ankündigungen</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        {isOwner && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition shadow-lg shadow-sky-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Wird gespeichert...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Website-Einstellungen speichern</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
