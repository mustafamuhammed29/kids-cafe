import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Loader2, 
  MessageCircle, 
  Home, 
  Calendar 
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BUSINESS_INFO } from '../data/mockData';
import { usePageSeo } from '../hooks/usePageSeo';

type CancellationStatus = 
  | 'loading'
  | 'success'
  | 'already_cancelled'
  | 'invalid'
  | 'past_deadline'
  | 'error';

interface CancellationResult {
  status: CancellationStatus;
  referenceCode?: string;
  message?: string;
}

export const CancellationPage: React.FC = () => {
  usePageSeo({
    title: 'Termin-Stornierung | Haven Kids Café Berlin',
    description: 'Online-Stornierung deiner Reservierung im Haven Kids Café.',
    canonicalPath: '/stornierung',
    noIndex: true,
  });

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState<CancellationResult>({
    status: 'loading',
  });

  useEffect(() => {
    let isMounted = true;

    async function executeCancellation() {
      // 1. Missing Token Check
      if (!token || token.trim() === '') {
        if (isMounted) {
          setState({
            status: 'invalid',
            message: 'Es wurde kein Stornierungs-Token übergeben. Bitte verwende den vollständigen Link aus deiner Buchungsbestätigung.',
          });
        }
        return;
      }

      // 2. Validate token format or invalid test token fallback
      const cleanToken = token.trim();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      // Handle unconfigured Supabase / offline demo mode realistically
      if (!isSupabaseConfigured) {
        // Explicit invalid token check for testing
        if (cleanToken === 'invalid-test-token' || !uuidRegex.test(cleanToken)) {
          if (isMounted) {
            setState({
              status: 'invalid',
              message: 'Der angegebene Stornierungs-Token ist ungültig oder abgelaufen.',
            });
          }
          return;
        }

        // Demo simulated success for valid-format UUID
        if (isMounted) {
          setState({
            status: 'success',
            referenceCode: 'HAVEN-' + cleanToken.slice(0, 5).toUpperCase(),
            message: 'Deine Reservierung wurde erfolgreich storniert. Der gebuchte Zeitslot wurde wieder freigegeben.',
          });
        }
        return;
      }

      // 3. Live Supabase RPC Execution
      try {
        if (!uuidRegex.test(cleanToken)) {
          if (isMounted) {
            setState({
              status: 'invalid',
              message: 'Der angegebene Stornierungs-Token ist ungültig oder abgelaufen.',
            });
          }
          return;
        }

        const { data, error } = await supabase.rpc('cancel_booking_by_token', {
          p_cancellation_token: cleanToken,
        });

        if (!isMounted) return;

        if (error) {
          const errText = error.message.toLowerCase();
          if (errText.includes('frist') || errText.includes('deadline') || errText.includes('2 stunden')) {
            setState({
              status: 'past_deadline',
              message: 'Die Stornierungsfrist von 2 Stunden vor Beginn ist leider abgelaufen.',
            });
          } else if (errText.includes('ungültig') || errText.includes('abgelaufen')) {
            setState({
              status: 'invalid',
              message: 'Der Stornierungs-Link ist ungültig oder abgelaufen.',
            });
          } else {
            setState({
              status: 'error',
              message: error.message || 'Die Stornierung konnte nicht verarbeitet werden.',
            });
          }
          return;
        }

        // Parse result payload from PostgreSQL function
        const res = data as {
          success?: boolean;
          already_cancelled?: boolean;
          reference_code?: string;
          error_message?: string;
          message?: string;
        };

        if (res?.success) {
          if (res.already_cancelled) {
            setState({
              status: 'already_cancelled',
              referenceCode: res.reference_code || 'B-REFERENZ',
              message: res.message || 'Diese Reservierung wurde bereits zu einem früheren Zeitpunkt storniert.',
            });
          } else {
            setState({
              status: 'success',
              referenceCode: res.reference_code || 'B-REFERENZ',
              message: res.message || 'Deine Reservierung wurde erfolgreich storniert.',
            });
          }
        } else {
          const errMsg = (res?.error_message || '').toLowerCase();
          if (errMsg.includes('bereits storniert')) {
            setState({
              status: 'already_cancelled',
              referenceCode: res?.reference_code,
              message: 'Diese Reservierung wurde bereits zu einem früheren Zeitpunkt storniert.',
            });
          } else if (errMsg.includes('frist') || errMsg.includes('2 stunden')) {
            setState({
              status: 'past_deadline',
              message: 'Die Stornierungsfrist von 2 Stunden vor Beginn ist leider abgelaufen.',
            });
          } else {
            setState({
              status: 'invalid',
              message: res?.error_message || 'Der Stornierungs-Link ist ungültig oder abgelaufen.',
            });
          }
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : 'Unerwarteter Fehler bei der Stornierung.',
        });
      }
    }

    executeCancellation();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="min-h-[85vh] bg-surface pt-24 pb-20 px-4 flex items-center justify-center animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-float border border-gray-100 text-center relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-primary to-accent" />

        {/* 1. LOADING STATE */}
        {state.status === 'loading' && (
          <div className="space-y-6 py-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight mb-2">
                Stornierung wird geprüft...
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
                Bitte habe einen kurzen Moment Geduld. Wir überprüfen deinen Buchungs-Token.
              </p>
            </div>
          </div>
        )}

        {/* 2. SUCCESS STATE */}
        {state.status === 'success' && (
          <div className="space-y-6 py-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
                Erfolgreich storniert
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight mb-2">
                Reservierung aufgehoben
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
                Deine Reservierung wurde kostenfrei storniert. Der reservierte Zeitslot wurde automatisch wieder für andere Familien freigegeben.
              </p>
            </div>

            {state.referenceCode && (
              <div className="bg-surface rounded-2xl p-4 border border-gray-100 inline-block w-full max-w-xs">
                <span className="text-xs text-gray-400 font-medium block">Buchungsreferenz:</span>
                <span className="font-mono text-base font-bold text-dark mt-0.5 block">
                  {state.referenceCode}
                </span>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-dark hover:bg-gray-800 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Home className="w-4 h-4" />
                <span>Zur Startseite</span>
              </Link>
              <Link
                to="/pricing"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-surface hover:bg-gray-100 text-dark border border-gray-200 font-bold text-sm transition flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Calendar className="w-4 h-4 text-primary" />
                <span>Neuen Termin buchen</span>
              </Link>
            </div>
          </div>
        )}

        {/* 3. ALREADY CANCELLED (IDEMPOTENT) STATE */}
        {state.status === 'already_cancelled' && (
          <div className="space-y-6 py-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 text-primary border border-sky-100 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-50 text-primary border border-sky-200 mb-3">
                Bereits storniert
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight mb-2">
                Keine weitere Aktion nötig
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
                Diese Reservierung wurde bereits zu einem früheren Zeitpunkt storniert. Es fallen keine Kosten für dich an.
              </p>
            </div>

            {state.referenceCode && (
              <div className="bg-surface rounded-2xl p-4 border border-gray-100 inline-block w-full max-w-xs">
                <span className="text-xs text-gray-400 font-medium block">Buchungsreferenz:</span>
                <span className="font-mono text-base font-bold text-dark mt-0.5 block">
                  {state.referenceCode}
                </span>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-dark hover:bg-gray-800 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Home className="w-4 h-4" />
                <span>Zur Startseite</span>
              </Link>
              <Link
                to="/pricing"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-surface hover:bg-gray-100 text-dark border border-gray-200 font-bold text-sm transition flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Calendar className="w-4 h-4 text-primary" />
                <span>Neuen Termin buchen</span>
              </Link>
            </div>
          </div>
        )}

        {/* 4. INVALID OR EXPIRED TOKEN STATE */}
        {state.status === 'invalid' && (
          <div className="space-y-6 py-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center mx-auto shadow-sm">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200 mb-3">
                Ungültiger Link
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight mb-2">
                Stornierung nicht möglich
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
                {state.message || 'Der Stornierungs-Link ist ungültig, abgelaufen oder wurde unvollständig aufgerufen.'}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-dark hover:bg-gray-800 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Home className="w-4 h-4" />
                <span>Zur Startseite</span>
              </Link>
              <a
                href={BUSINESS_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Hilfe via WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* 5. PAST 2-HOUR DEADLINE STATE */}
        {state.status === 'past_deadline' && (
          <div className="space-y-6 py-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center mx-auto shadow-sm">
              <Clock className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 mb-3">
                Frist abgelaufen
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight mb-2">
                Stornierungsfrist überschritten
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
                Die reguläre Frist für kostenfreie Online-Stornierungen (bis zu 2 Stunden vor Beginn) ist abgelaufen. Bitte kontaktiere unser Team direkt für dringende Rückfragen.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`https://wa.me/493012345678?text=${encodeURIComponent(
                  'Hallo Haven Kids Team, ich möchte kurzfristig einen Termin absagen oder anfragen.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Support via WhatsApp</span>
              </a>
              <Link
                to="/"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-surface hover:bg-gray-100 text-dark border border-gray-200 font-bold text-sm transition flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Home className="w-4 h-4" />
                <span>Zur Startseite</span>
              </Link>
            </div>
          </div>
        )}

        {/* 6. GENERIC ERROR STATE */}
        {state.status === 'error' && (
          <div className="space-y-6 py-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center mx-auto shadow-sm">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight mb-2">
                Unerwarteter Fehler
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
                {state.message || 'Bei der Verarbeitung der Stornierung ist ein technischer Fehler aufgetreten.'}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-dark hover:bg-gray-800 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Home className="w-4 h-4" />
                <span>Zur Startseite</span>
              </Link>
              <a
                href={BUSINESS_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Team kontaktieren</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CancellationPage;
