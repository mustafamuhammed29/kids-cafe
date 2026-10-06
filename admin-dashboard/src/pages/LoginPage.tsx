import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, ShieldAlert, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

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
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="max-w-md w-full bg-white shadow-xl rounded-3xl border border-gray-100 p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#183D3D] text-[#FFD3B6] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#183D3D] font-heading">
            Haven Kids Café — Staff Portal
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Geschützter Mitarbeiter- und Administrationsbereich
          </p>
        </div>

        {!isConfigured && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-1">
            <strong className="block font-semibold">Entwicklungsmodus:</strong>
            <p className="text-gray-600">
              Supabase ist in dieser Instanz noch nicht verknüpft. Sobald die Umgebungsvariablen in <code className="bg-amber-100 px-1 py-0.5 rounded">.env</code> hinterlegt sind, läuft die Anmeldung live über Supabase Auth.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Dienstliche E-Mail-Adresse
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@havenkids.de"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#5C8374] min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#5C8374] min-h-[44px]"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#183D3D] hover:bg-black disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl transition shadow-md min-h-[44px] cursor-pointer mt-2 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Wird überprüft...</span>
              </>
            ) : (
              <span>Anmelden</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
          <p>
            Autonome Verwaltung · Host: <code className="text-gray-600">admin.havenkids.de</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
