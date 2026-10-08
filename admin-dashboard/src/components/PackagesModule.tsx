import React, { useState, useEffect } from 'react';
import type { StaffRole, AdminPackage } from '../types/admin';
import {
  fetchAdminPackages,
  updateAdminPackage,
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
} from 'lucide-react';

interface PackagesModuleProps {
  currentRole: StaffRole;
}

export const PackagesModule: React.FC<PackagesModuleProps> = ({ currentRole }) => {
  const canEdit = currentRole === 'owner' || currentRole === 'admin';

  const [packages, setPackages] = useState<AdminPackage[]>(DEFAULT_ADMIN_PACKAGES);
  const [saltRoomPrice, setSaltRoomPrice] = useState<number>(5.00);
  const [isLoading, setIsLoading] = useState(true);
  const [savingPackageId, setSavingPackageId] = useState<string | null>(null);
  const [isSavingSaltRoom, setIsSavingSaltRoom] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    Promise.all([fetchAdminPackages(), fetchBusinessSettings()]).then(([pkgs, settings]) => {
      setPackages(pkgs);
      setSaltRoomPrice(settings.saltRoomAddonPrice ?? 5.00);
      setIsLoading(false);
    });
  }, []);

  const handlePackageFieldChange = (id: string, field: 'basePrice' | 'displayOrder', value: number | null) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleToggleVisibility = async (pkg: AdminPackage) => {
    if (!canEdit) return;
    const newVisibility = !pkg.isVisible;

    setPackages((prev) =>
      prev.map((p) => (p.id === pkg.id ? { ...p, isVisible: newVisibility } : p))
    );

    const res = await updateAdminPackage(pkg.id, { isVisible: newVisibility });
    if (!res.success) {
      setFeedback({ type: 'error', text: res.error || 'Fehler beim Ändern der Sichtbarkeit' });
      // Revert on failure
      setPackages((prev) =>
        prev.map((p) => (p.id === pkg.id ? { ...p, isVisible: pkg.isVisible } : p))
      );
    } else {
      setFeedback({
        type: 'success',
        text: `Sichtbarkeit von "${pkg.name}" ${newVisibility ? 'aktiviert' : 'deaktiviert'}.`,
      });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleSavePackage = async (pkg: AdminPackage) => {
    if (!canEdit) return;
    setSavingPackageId(pkg.id);
    setFeedback(null);

    const res = await updateAdminPackage(pkg.id, {
      basePrice: pkg.basePrice,
      displayOrder: pkg.displayOrder,
      isVisible: pkg.isVisible,
    });

    setSavingPackageId(null);
    if (res.success) {
      setFeedback({ type: 'success', text: `Paket "${pkg.name}" erfolgreich aktualisiert.` });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', text: res.error || 'Fehler beim Speichern' });
    }
  };

  const handleSaveSaltRoomPrice = async () => {
    if (!canEdit) return;
    setIsSavingSaltRoom(true);
    setFeedback(null);

    const res = await saveBusinessSettings({ saltRoomAddonPrice: saltRoomPrice });
    setIsSavingSaltRoom(false);

    if (res.success) {
      setFeedback({ type: 'success', text: `Salzraum-Addon Preis (${saltRoomPrice.toFixed(2)} €) gespeichert.` });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', text: res.error || 'Fehler beim Speichern des Salzraum-Preises' });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/90 rounded-2xl p-12 border border-slate-800 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-sky-400 mb-2" />
        <span className="text-xs">Buchungspakete werden geladen...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Role permission info */}
      {!canEdit ? (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-amber-200 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block mb-0.5">Eingeschränkte Leseberechtigung (Rolle: Staff)</strong>
            <span>
              Preise und Paketsichtbarkeiten dürfen nur von Administratoren und Inhabern bearbeitet werden.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3 text-emerald-300 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block mb-0.5">Betriebssteuerung aktiv (Rolle: {currentRole})</strong>
            <span>
              Preisanpassungen und Sichtbarkeitsschalter wirken sich direkt auf den Buchungswizard und die Preisseite aus. Gesetzliche Marketingtexte bleiben zum Schutz vor Abmahnungen fest verankert.
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

      {/* SECTION 1: Salt Room Add-On Pricing Card */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white font-heading">
                Salzraum-Zusatzoption (Einzelticket Add-On)
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
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-sky-500/20 disabled:opacity-50"
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

      {/* SECTION 2: Packages Management Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2 font-heading">
              <Package className="w-5 h-5 text-sky-400" />
              Buchungspakete &amp; Tarife
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tarife, Anzeigereihenfolge und Veröffentlichungsstatus im öffentlichen Angebot.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {packages.length} Pakete registriert
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Pos.</th>
                <th className="py-3.5 px-4">Paketname &amp; Kategorie</th>
                <th className="py-3.5 px-4">Preismodell</th>
                <th className="py-3.5 px-4">Basispreis</th>
                <th className="py-3.5 px-4">Sichtbarkeit</th>
                <th className="py-3.5 px-4 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {packages.map((pkg) => {
                const isFixed = pkg.priceType === 'fixed';

                return (
                  <tr key={pkg.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <input
                        type="number"
                        disabled={!canEdit}
                        min={1}
                        max={99}
                        value={pkg.displayOrder}
                        onChange={(e) =>
                          handlePackageFieldChange(pkg.id, 'displayOrder', parseInt(e.target.value, 10) || 1)
                        }
                        className="w-12 px-2 py-1 rounded-lg border border-slate-700 text-center font-bold text-xs bg-slate-950 text-white disabled:bg-transparent"
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{pkg.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">slug: {pkg.slug}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                        {pkg.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-300">
                        {isFixed ? 'Fester Tarif' : 'Auf Anfrage'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {isFixed ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            disabled={!canEdit}
                            min={0}
                            step={1}
                            value={pkg.basePrice ?? ''}
                            onChange={(e) =>
                              handlePackageFieldChange(
                                pkg.id,
                                'basePrice',
                                e.target.value === '' ? null : parseFloat(e.target.value)
                              )
                            }
                            className="w-20 px-2.5 py-1.5 rounded-xl border border-slate-700 font-black text-xs text-sky-400 bg-slate-950 disabled:bg-slate-900"
                          />
                          <span className="text-xs font-bold text-slate-400">€</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Individuell</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        disabled={!canEdit}
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
                    <td className="py-3.5 px-4 text-right">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleSavePackage(pkg)}
                          disabled={savingPackageId === pkg.id}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-sky-500 hover:text-white text-slate-200 border border-slate-700 transition font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {savingPackageId === pkg.id ? (
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
      </div>
    </div>
  );
};
