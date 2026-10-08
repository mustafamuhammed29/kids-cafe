import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, ShieldAlert, Loader2, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, isConfigured, user, staffProfile, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/bookings';

  React.useEffect(() => {
    if (!isLoading && user && staffProfile?.role === 'owner' && staffProfile?.isActive) {
      navigate('/bookings', { replace: true });
    }
  }, [user, staffProfile, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await signIn(email.trim(), password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.error || 'Ungültige Anmeldedaten.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unerwarteter Fehler bei der Anmeldung.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#0B0F17] px-4 py-12 overflow-hidden selection:bg-sky-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-md w-full bg-slate-900/90 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-3xl p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-blue-600/30 border border-sky-400/30 flex items-center justify-center mx-auto mb-4 text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
            Haven Kids Café
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Staff & Owner Portal</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Geschützter Verwaltungsbereich · Berlin
          </p>
        </div>

        {!isConfigured && (
          <div className="mb-6 p-4.5 bg-slate-800/80 border border-emerald-500/30 rounded-2xl text-xs text-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Lokaler Entwicklungsmodus
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                Single Owner
              </span>
            </div>
            <p className="text-slate-400 text-xs">
              Ein-Klick-Schnellanmeldung mit Test-Zugang für den Inhaber:
            </p>
            <button
              type="button"
              onClick={() => { setEmail('owner@havenkidscafe.de'); setPassword('demo1234'); }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-emerald-950 flex items-center justify-center gap-2"
            >
              <span>Owner-Zugangsdaten einfügen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Dienstliche E-Mail-Adresse
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@havenkidscafe.de"
              required
              className="w-full px-4 py-3.5 rounded-xl border border-slate-700/80 bg-slate-950/70 text-white placeholder-slate-500 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition outline-none min-h-[48px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-4 py-3.5 rounded-xl border border-slate-700/80 bg-slate-950/70 text-white placeholder-slate-500 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition outline-none min-h-[48px]"
            />
          </div>

          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 text-white font-extrabold py-3.5 px-4 rounded-xl transition shadow-lg shadow-sky-500/25 min-h-[50px] cursor-pointer mt-3 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Wird überprüft...</span>
              </>
            ) : (
              <span>Im Dashboard anmelden</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>
            Autonome Verwaltung · Host: <code className="text-slate-400 font-mono">admin.havenkidscafe.de</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
