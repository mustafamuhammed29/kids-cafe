import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle,
  Clock,
  LogOut,
  Users,
  Settings,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/mockData';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin-login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-[#183D3D]">
      {/* Admin Top Bar */}
      <header className="bg-[#183D3D] text-white px-6 py-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-white hover:text-[#FFD3B6] transition" title="Zur Website">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-8 h-8 rounded-xl bg-[#93B1A6]/20 flex items-center justify-center text-[#FFD3B6]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight leading-none">
              {BUSINESS_INFO.name} — Admin Panel
            </h1>
            <span className="text-[11px] text-gray-300">Geschützter Mitarbeiterbereich</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-200 transition cursor-pointer min-h-[36px]"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Abmelden</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Welcome Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#5C8374] bg-[#93B1A6]/15 py-0.5 px-2.5 rounded-full inline-block mb-1.5">
                Phase 1 Vorschau
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#183D3D]">
                Willkommen im Admin-Bereich!
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl">
                Dies ist die verifizierte Admin-Zugangsroute. Die vollständige Live-Verwaltung (Buchungsliste, Kalender-Ansicht, Filter, Statusänderungen und Supabase-Echtzeitdaten) wird in <strong>Phase 3</strong> implementiert.
              </p>
            </div>
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 transition min-h-[44px] flex items-center"
            >
              Website ansehen →
            </Link>
          </div>
        </div>

        {/* Quick Mock Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-semibold">Heutige Buchungen</span>
              <Calendar className="w-4 h-4 text-[#5C8374]" />
            </div>
            <span className="text-2xl font-extrabold text-[#183D3D]">6 Reservierungen</span>
            <span className="text-[11px] text-emerald-600 block mt-1 font-semibold">18 Kinder gesamt</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-semibold">Auslastung Spielbereich</span>
              <Users className="w-4 h-4 text-sky-600" />
            </div>
            <span className="text-2xl font-extrabold text-[#183D3D]">75 %</span>
            <span className="text-[11px] text-gray-500 block mt-1">Kapazität: max. 20 Kinder/Slot</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-semibold">Nächster Slot</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-2xl font-extrabold text-[#183D3D]">12:30 Uhr</span>
            <span className="text-[11px] text-gray-500 block mt-1">12 gebuchte Plätze</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-semibold">Systemstatus</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-2xl font-extrabold text-emerald-600">Online</span>
            <span className="text-[11px] text-gray-500 block mt-1">Server: Frankfurt (EU)</span>
          </div>
        </div>

        {/* Feature Roadmap for Phase 3 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-[#5C8374]" />
            <h3 className="font-bold text-lg text-[#183D3D]">
              Geplante Dashboard-Funktionen (Phase 3)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-gray-700">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
              <strong className="block text-[#183D3D]">1. Buchungsverwaltung & Filter</strong>
              <p className="text-gray-600">
                Vollständige Tabelle aller Buchungen mit Datum, Slot, Name, Kindern, Status (Pending, Confirmed, Completed, Cancelled).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
              <strong className="block text-[#183D3D]">2. Statusänderung & Interne Notizen</strong>
              <p className="text-gray-600">
                1-Klick-Statusänderung beim Check-in vor Ort, Notizfeld für Allergien, Hochstühle oder Sonderwünsche.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
              <strong className="block text-[#183D3D]">3. WhatsApp & E-Mail Schnelllinks</strong>
              <p className="text-gray-600">
                Direktes Kontaktieren von Eltern per WhatsApp-Deep-Link oder automatisierter Resend-Bestätigung.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
              <strong className="block text-[#183D3D]">4. Kapazitäts- & Terminblocker</strong>
              <p className="text-gray-600">
                Sperren von Terminen für geschlossene Gesellschaften, Feiertage oder Wartungsarbeiten.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
