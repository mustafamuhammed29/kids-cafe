import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { AdminBooking, BookingStatus } from '../types/admin';
import { BusinessSettingsModule } from '../components/BusinessSettingsModule';
import { PackagesModule } from '../components/PackagesModule';
import { BlockedDatesModule } from '../components/BlockedDatesModule';
import { SiteAnnouncementsModule } from '../components/SiteAnnouncementsModule';
import { FaqManagementModule } from '../components/FaqManagementModule';
import { EventInquiriesInboxModule } from '../components/EventInquiriesInboxModule';
import { GalleryManagementModule } from '../components/GalleryManagementModule';
import {
  Calendar,
  Clock,
  Users,
  LogOut,
  Search,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Building2,
  Package,
  CalendarX,
  Megaphone,
  HelpCircle,
  Inbox,
  Image as ImageIcon,
  Menu,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Filter,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  alertBadge?: string;
  ownerOnly?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

type ActiveSection =
  | 'bookings'
  | 'capacity'
  | 'blocked-dates'
  | 'announcements'
  | 'faqs'
  | 'inquiries'
  | 'gallery'
  | 'settings'
  | 'packages';

const MOCK_ADMIN_BOOKINGS: AdminBooking[] = [
  {
    id: 'b-1',
    referenceCode: 'HKC-20261007-8491',
    customerName: 'Julia Schneider',
    customerEmail: 'julia.schneider@example.de',
    customerPhone: '+49 170 1234567',
    date: '2026-10-07',
    timeSlot: '10:00 - 12:00',
    serviceId: 'service-single',
    serviceName: 'Einzelbesuch Spielbereich',
    numChildren: 2,
    numAdults: 2,
    totalPrice: 28.00,
    status: 'confirmed',
    paymentStatus: 'paid_on_arrival',
    notes: 'Hochstuhl benötigt, 1 Kind mit Laktoseunverträglichkeit',
    createdAt: '2026-10-06T14:20:00Z',
    updatedAt: '2026-10-06T14:20:00Z',
  },
  {
    id: 'b-2',
    referenceCode: 'HKC-20261007-3920',
    customerName: 'Marcus Weber',
    customerEmail: 'marcus.weber@example.de',
    customerPhone: '+49 171 9876543',
    date: '2026-10-07',
    timeSlot: '12:30 - 14:30',
    serviceId: 'service-birthday',
    serviceName: 'Kindergeburtstag (Party-Paket)',
    numChildren: 8,
    numAdults: 4,
    totalPrice: 250.00,
    status: 'confirmed',
    paymentStatus: 'pending',
    notes: 'Geburtstagskind wird 4 Jahre alt! Eigener Kuchen mitgebracht.',
    createdAt: '2026-10-06T11:05:00Z',
    updatedAt: '2026-10-06T11:05:00Z',
  },
  {
    id: 'b-3',
    referenceCode: 'HKC-20261008-5112',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@example.de',
    customerPhone: '+49 160 5551234',
    date: '2026-10-08',
    timeSlot: '15:00 - 17:00',
    serviceId: 'service-single',
    serviceName: 'Einzelbesuch Spielbereich',
    numChildren: 1,
    numAdults: 1,
    totalPrice: 19.00,
    status: 'pending',
    paymentStatus: 'pending',
    notes: 'Inklusive Salzraum-Zusatzoption gebucht',
    createdAt: '2026-10-06T18:45:00Z',
    updatedAt: '2026-10-06T18:45:00Z',
  },
];

export const DashboardPage: React.FC = () => {
  const { staffProfile, signOut, isConfigured } = useAuth();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getActiveSection = (): ActiveSection => {
    const p = location.pathname.toLowerCase().replace(/\/$/, '');
    if (p === '' || p === '/bookings') return 'bookings';
    if (p === '/capacity') return 'capacity';
    if (p === '/blocked-dates') return 'blocked-dates';
    if (p === '/announcements') return 'announcements';
    if (p === '/faq' || p === '/faqs') return 'faqs';
    if (p === '/inquiries') return 'inquiries';
    if (p === '/gallery') return 'gallery';
    if (p === '/settings') return 'settings';
    if (p === '/packages') return 'packages';
    return 'bookings';
  };

  const activeSection = getActiveSection();
  const [bookings, setBookings] = useState<AdminBooking[]>(MOCK_ADMIN_BOOKINGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilterMode, setDateFilterMode] = useState<'all' | 'today' | 'tomorrow' | 'this_week' | 'custom'>('all');
  const [customDate, setCustomDate] = useState<string>('');
  const [slotFilter, setSlotFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const fetchLiveBookings = async () => {
    if (!isConfigured) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('date', { ascending: false });

      if (!error && data && data.length > 0) {
        setBookings(
          data.map((row) => ({
            id: row.id,
            referenceCode: row.reference_code,
            customerName: row.customer_name,
            customerEmail: row.customer_email,
            customerPhone: row.customer_phone,
            date: row.date,
            timeSlot: row.time_slot,
            serviceId: row.service_id,
            serviceName: row.service_name,
            numChildren: row.num_children,
            numAdults: row.num_adults,
            totalPrice: Number(row.total_price),
            status: row.status as BookingStatus,
            paymentStatus: row.payment_status,
            notes: row.notes,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveBookings();
  }, [isConfigured]);

  const updateBookingStatus = async (id: string, newStatus: BookingStatus) => {
    if (isConfigured) {
      await supabase
        .from('bookings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);
    }

    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );

    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Dynamic list of available time slots
  const availableTimeSlots = useMemo(() => {
    const slots = new Set<string>();
    bookings.forEach((b) => {
      if (b.timeSlot) {
        const clean = b.timeSlot.replace(/\s*Uhr$/i, '').trim();
        if (clean) slots.add(clean);
      }
    });
    ['10:00 - 12:00', '12:30 - 14:30', '14:00 - 17:00', '15:00 - 17:00', '18:00 - 20:00'].forEach((s) => slots.add(s));
    return Array.from(slots).sort((a, b) => a.localeCompare(b));
  }, [bookings]);

  // Date helper functions
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const isDateInThisWeek = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length !== 3) return false;
      const target = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const now = new Date();
      const day = now.getDay() || 7; // Sunday is 7
      const mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (day - 1));
      mon.setHours(0, 0, 0, 0);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      sun.setHours(23, 59, 59, 999);
      return target >= mon && target <= sun;
    } catch {
      return false;
    }
  };

  const normalizeSlot = (str?: string) => (str || '').replace(/\s*Uhr$/i, '').trim();

  const filteredBookings = useMemo(() => {
    const today = getTodayStr();
    const tomorrow = getTomorrowStr();

    return bookings.filter((b) => {
      // 1. Text Search
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        b.customerName.toLowerCase().includes(term) ||
        b.referenceCode.toLowerCase().includes(term) ||
        b.customerEmail.toLowerCase().includes(term) ||
        (b.customerPhone && b.customerPhone.toLowerCase().includes(term));

      // 2. Status Filter
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

      // 3. Date Filter
      let matchesDate = true;
      if (dateFilterMode === 'today') {
        matchesDate = b.date === today;
      } else if (dateFilterMode === 'tomorrow') {
        matchesDate = b.date === tomorrow;
      } else if (dateFilterMode === 'this_week') {
        matchesDate = isDateInThisWeek(b.date);
      } else if (dateFilterMode === 'custom' && customDate) {
        matchesDate = b.date === customDate;
      }

      // 4. Time Slot (Hours) Filter
      let matchesSlot = true;
      if (slotFilter !== 'all') {
        const normFilter = normalizeSlot(slotFilter);
        const normBooking = normalizeSlot(b.timeSlot);
        matchesSlot = normBooking === normFilter || normBooking.startsWith(normFilter.split(' - ')[0]);
      }

      return matchesSearch && matchesStatus && matchesDate && matchesSlot;
    });
  }, [bookings, searchTerm, statusFilter, dateFilterMode, customDate, slotFilter]);

  const hasActiveFilters =
    searchTerm !== '' ||
    statusFilter !== 'all' ||
    dateFilterMode !== 'all' ||
    slotFilter !== 'all';

  const resetAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilterMode('all');
    setCustomDate('');
    setSlotFilter('all');
  };

  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const totalChildren = bookings.reduce((sum, b) => sum + b.numChildren, 0);

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'bookings': return 'Buchungen & Reservierungen';
      case 'capacity': return 'Kapazitäten & Zeitslots';
      case 'blocked-dates': return 'Schließtage & Feiertage';
      case 'announcements': return 'Website-Ankündigungen';
      case 'faqs': return 'FAQ-Verwaltung';
      case 'inquiries': return 'Event-Anfragen Postfach';
      case 'gallery': return 'Galerie & Bilder';
      case 'settings': return 'Geschäftsdaten & Rechtliches';
      case 'packages': return 'Pakete & Tarife';
      default: return 'Übersicht';
    }
  };

  const navigationGroups: NavGroup[] = [
    {
      group: 'Betrieb & Buchungen',
      items: [
        { id: 'bookings', label: 'Buchungen', path: '/bookings', icon: Calendar, badge: bookings.length },
        { id: 'capacity', label: 'Kapazitäten & Slots', path: '/capacity', icon: Clock },
        { id: 'blocked-dates', label: 'Schließtage', path: '/blocked-dates', icon: CalendarX },
      ],
    },
    {
      group: 'Kunden & Anfragen',
      items: [
        { id: 'inquiries', label: 'Event-Anfragen', path: '/inquiries', icon: Inbox, alertBadge: '1 Neu' },
        { id: 'faqs', label: 'FAQ-Verwaltung', path: '/faq', icon: HelpCircle },
      ],
    },
    {
      group: 'Inhalte & Marketing',
      items: [
        { id: 'announcements', label: 'Ankündigungen', path: '/announcements', icon: Megaphone },
        { id: 'gallery', label: 'Galerie & Medien', path: '/gallery', icon: ImageIcon },
        { id: 'packages', label: 'Pakete & Tarife', path: '/packages', icon: Package },
      ],
    },
    {
      group: 'System & Inhaber',
      items: [
        { id: 'settings', label: 'Geschäftsdaten', path: '/settings', icon: Building2, ownerOnly: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col antialiased selection:bg-sky-500 selection:text-white">
      {/* =========================================================================
          DESKTOP SIDEBAR (>= 1024px)
          ========================================================================= */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-[#0B0F17]/95 backdrop-blur-2xl border-r border-slate-800/80 z-40">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-blue-600/30 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.25)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight font-heading text-white">
                  Haven Kids
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300">
                  Staff
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Admin Operations
              </span>
            </div>
          </div>

          {/* Live System Beacon */}
          <div className="mt-4 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-medium">System Online</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-semibold">Berlin</span>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {navigationGroups.map((group) => (
            <div key={group.group} className="space-y-1.5">
              <span className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                {group.group}
              </span>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;

                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-sky-500/20 to-blue-600/20 text-sky-400 border border-sky-500/30 shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isActive
                            ? 'bg-sky-500 text-white'
                            : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}

                      {item.alertBadge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 border border-rose-500/40 text-rose-400 animate-pulse">
                          {item.alertBadge}
                        </span>
                      )}

                      {item.ownerOnly && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400">
                          Owner
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Owner Profile & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-xs">
                M
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-tight">
                  {staffProfile?.fullName || 'Mustafa'}
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Inhaber (Owner)</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={signOut}
              title="Abmelden"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CONTENT WRAPPER
          ========================================================================= */}
      <div className="lg:pl-72 flex flex-col flex-1 pb-20 lg:pb-8">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#0B0F17]/85 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/60 border border-slate-700/60 transition"
              aria-label="Menü öffnen"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumbs & Active Title */}
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Haven Kids</span>
                <span>/</span>
                <span className="text-sky-400 font-semibold">{getSectionTitle()}</span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight font-heading mt-0.5">
                {getSectionTitle()}
              </h1>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-2.5">
            {/* Real-time date badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span>{new Date().toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>

            {/* External link to live site */}
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition font-medium"
              title="Öffentliche Website im neuen Tab öffnen"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Webseite ansehen</span>
            </a>

            {/* Refresh button */}
            <button
              type="button"
              onClick={fetchLiveBookings}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              title="Daten neu laden"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
            </button>

            {/* Mobile Sign out */}
            <button
              type="button"
              onClick={signOut}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800"
              title="Abmelden"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Workspace Body */}
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 space-y-8">
          {/* =====================================================================
              TAB 1: BOOKINGS
              ===================================================================== */}
          {activeSection === 'bookings' && (
            <div className="space-y-6 sm:space-y-8 animate-fadeIn">
              {/* Ultra-Sleek KPI Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {/* KPI 1 */}
                <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 rounded-2xl p-5 border border-slate-800/90 shadow-lg relative overflow-hidden group hover:border-sky-500/40 transition">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl group-hover:bg-sky-500/10 transition" />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aktive Buchungen</span>
                    <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white font-heading">{confirmedCount}</span>
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      Bestätigt
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 block mt-2 font-medium">Verbindlich reservierte Slots</span>
                </div>

                {/* KPI 2 */}
                <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 rounded-2xl p-5 border border-slate-800/90 shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition" />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Erwartete Kinder</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white font-heading">{totalChildren}</span>
                    <span className="text-xs text-slate-400 font-semibold">Kinder gesamt</span>
                  </div>
                  <span className="text-xs text-slate-400 block mt-2 font-medium">Kapazität: max. 20 Kinder/Slot</span>
                </div>

                {/* KPI 3 */}
                <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 rounded-2xl p-5 border border-slate-800/90 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition" />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nächster Slot</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white font-heading">10:00</span>
                    <span className="text-xs text-slate-400">Uhr</span>
                  </div>
                  <span className="text-xs text-emerald-400 block mt-2 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Slot spielbereit & gelüftet
                  </span>
                </div>

                {/* KPI 4 */}
                <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 rounded-2xl p-5 border border-slate-800/90 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition" />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ausstehend</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white font-heading">{pendingCount}</span>
                    <span className="text-xs text-amber-400 font-bold bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      Prüfen
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 block mt-2 font-medium">Wartet auf Überprüfung</span>
                </div>
              </div>

              {/* Search, Date, Time Slot & Filter Bar */}
              <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md space-y-4">
                
                {/* Row 1: Search, Specific Date Picker, Time Slot Dropdown, Reset */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                  
                  {/* Search Input (5 cols on lg) */}
                  <div className="lg:col-span-5 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Name, Buchungscode oder E-Mail suchen..."
                      className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-700/80 bg-slate-950 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-3 text-slate-400 hover:text-white text-xs cursor-pointer"
                        title="Suche leeren"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Date Picker Input (3 cols on lg) */}
                  <div className="lg:col-span-3 relative flex items-center">
                    <Calendar className="w-4 h-4 text-sky-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => {
                        setCustomDate(e.target.value);
                        if (e.target.value) {
                          setDateFilterMode('custom');
                        } else {
                          setDateFilterMode('all');
                        }
                      }}
                      className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-700/80 bg-slate-950 text-white text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition cursor-pointer [color-scheme:dark]"
                      title="Bestimmtes Datum filtern"
                    />
                    {customDate && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomDate('');
                          setDateFilterMode('all');
                        }}
                        className="absolute right-3 text-slate-400 hover:text-white text-xs cursor-pointer"
                        title="Datum zurücksetzen"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Time Slot (Stunden) Selector (3 cols on lg) */}
                  <div className="lg:col-span-3 relative flex items-center">
                    <Clock className="w-4 h-4 text-sky-400 absolute left-3.5 pointer-events-none" />
                    <select
                      value={slotFilter}
                      onChange={(e) => setSlotFilter(e.target.value)}
                      className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-700/80 bg-slate-950 text-white text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition cursor-pointer appearance-none"
                    >
                      <option value="all">Alle Zeitslots (Stunden)</option>
                      {availableTimeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot} Uhr
                        </option>
                      ))}
                    </select>
                    {slotFilter !== 'all' ? (
                      <button
                        type="button"
                        onClick={() => setSlotFilter('all')}
                        className="absolute right-3 text-slate-400 hover:text-white text-xs cursor-pointer"
                        title="Zeitslot-Filter zurücksetzen"
                      >
                        ✕
                      </button>
                    ) : (
                      <div className="absolute right-3.5 pointer-events-none text-slate-500 text-[10px]">▼</div>
                    )}
                  </div>

                  {/* Reset Button (1 col on lg) */}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <button
                      type="button"
                      disabled={!hasActiveFilters}
                      onClick={resetAllFilters}
                      className={`w-full py-2.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                        hasActiveFilters
                          ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 cursor-pointer shadow-xs'
                          : 'bg-slate-950/40 border border-slate-800/80 text-slate-600 cursor-not-allowed opacity-50'
                      }`}
                      title="Alle Filter zurücksetzen"
                    >
                      <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden sm:inline lg:hidden">Reset</span>
                    </button>
                  </div>
                </div>

                {/* Row 2: Quick Date Chips + Status Filter Pills */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-2.5 border-t border-slate-800/80">
                  
                  {/* Quick Date Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0 scrollbar-none">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-sky-400" />
                      Tag:
                    </span>
                    {[
                      { id: 'all', label: 'Alle Tage' },
                      { id: 'today', label: 'Heute' },
                      { id: 'tomorrow', label: 'Morgen' },
                      { id: 'this_week', label: 'Diese Woche' },
                    ].map((chip) => {
                      const isSelected = dateFilterMode === chip.id && !customDate;
                      return (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => {
                            setDateFilterMode(chip.id as any);
                            setCustomDate('');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-xs'
                              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Status Segmented Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0 scrollbar-none">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
                      <SlidersHorizontal className="w-3 h-3 text-sky-400" />
                      Status:
                    </span>
                    {[
                      { id: 'all', label: 'Alle', count: bookings.length },
                      { id: 'confirmed', label: 'Bestätigt', count: bookings.filter((b) => b.status === 'confirmed').length },
                      { id: 'pending', label: 'Ausstehend', count: bookings.filter((b) => b.status === 'pending').length },
                      { id: 'completed', label: 'Abgeschlossen', count: bookings.filter((b) => b.status === 'completed').length },
                      { id: 'cancelled', label: 'Storniert', count: bookings.filter((b) => b.status === 'cancelled').length },
                    ].map((tab) => {
                      const isSelected = statusFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setStatusFilter(tab.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                              : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-900 text-slate-400'
                            }`}
                          >
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Row 3: Active Filter Indicators Bar (shown when any filter is active) */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-800/60 text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1 shrink-0">
                      <Filter className="w-3.5 h-3.5 text-sky-400" />
                      Ergebnis: <strong className="text-white">{filteredBookings.length}</strong> von {bookings.length} Buchungen
                    </span>

                    {dateFilterMode !== 'all' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 font-semibold text-[11px]">
                        📅 {dateFilterMode === 'today' ? 'Heute' : dateFilterMode === 'tomorrow' ? 'Morgen' : dateFilterMode === 'this_week' ? 'Diese Woche' : customDate}
                        <button
                          type="button"
                          onClick={() => {
                            setDateFilterMode('all');
                            setCustomDate('');
                          }}
                          className="hover:text-white cursor-pointer ml-0.5 text-sky-400"
                          title="Tagesfilter entfernen"
                        >
                          ✕
                        </button>
                      </span>
                    )}

                    {slotFilter !== 'all' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 font-semibold text-[11px]">
                        ⏰ {slotFilter} Uhr
                        <button
                          type="button"
                          onClick={() => setSlotFilter('all')}
                          className="hover:text-white cursor-pointer ml-0.5 text-sky-400"
                          title="Zeitslot-Filter entfernen"
                        >
                          ✕
                        </button>
                      </span>
                    )}

                    {statusFilter !== 'all' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold text-[11px]">
                        Status: {statusFilter}
                        <button
                          type="button"
                          onClick={() => setStatusFilter('all')}
                          className="hover:text-white cursor-pointer ml-0.5 text-emerald-400"
                          title="Status-Filter entfernen"
                        >
                          ✕
                        </button>
                      </span>
                    )}

                    {searchTerm && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold text-[11px]">
                        Suche: "{searchTerm}"
                        <button
                          type="button"
                          onClick={() => setSearchTerm('')}
                          className="hover:text-white cursor-pointer ml-0.5 text-amber-400"
                          title="Suchbegriff entfernen"
                        >
                          ✕
                        </button>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer ml-auto"
                    >
                      Alle zurücksetzen
                    </button>
                  </div>
                )}
              </div>

              {/* ===================================================================
                  RESPONSIVE BOOKINGS LIST:
                  - Mobile View (< 768px): Sleek dark touch cards
                  - Desktop View (>= 768px): Polished dark data table
                  =================================================================== */}

              {/* MOBILE CARDS VIEW */}
              <div className="md:hidden space-y-3.5">
                {filteredBookings.length === 0 ? (
                  <div className="bg-slate-900/80 rounded-2xl p-8 border border-slate-800 text-center text-slate-400 text-xs">
                    Keine Buchungen für diesen Filter gefunden.
                  </div>
                ) : (
                  filteredBookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 space-y-3 shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-xs font-extrabold text-sky-400 block">
                            {b.referenceCode}
                          </span>
                          <h4 className="font-bold text-sm text-white mt-0.5">
                            {b.customerName}
                          </h4>
                          <span className="text-xs text-slate-400 block">
                            {b.customerPhone}
                          </span>
                        </div>

                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : b.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : b.status === 'completed'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        <div>
                          <span className="text-slate-500 block text-[11px]">Termin & Slot:</span>
                          <strong className="text-slate-200 font-semibold">{b.date} • {b.timeSlot}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Gäste:</span>
                          <strong className="text-slate-200 font-semibold">{b.numChildren} Kinder, {b.numAdults} Erw.</strong>
                        </div>
                        <div className="col-span-2 pt-1 border-t border-slate-800/60 flex justify-between items-center">
                          <span className="text-slate-400 text-xs">{b.serviceName}</span>
                          <span className="font-black text-sm text-white">{b.totalPrice.toFixed(2)} €</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedBooking(b)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <span>Details & Status</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={`https://wa.me/${b.customerPhone.replace(/[^0-9]/g, '')}?text=Hallo%20${encodeURIComponent(b.customerName)}%2C%20hier%20ist%20das%20Haven%20Kids%20Caf%C3%A9%20Team%20bez%C3%BCglich%20deiner%20Buchung%20${b.referenceCode}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition flex items-center justify-center"
                          title="WhatsApp senden"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider text-[11px]">
                        <th className="py-4 px-5">Referenz</th>
                        <th className="py-4 px-5">Kunde</th>
                        <th className="py-4 px-5">Datum & Slot</th>
                        <th className="py-4 px-5">Paket</th>
                        <th className="py-4 px-5">Gäste</th>
                        <th className="py-4 px-5">Betrag</th>
                        <th className="py-4 px-5">Status</th>
                        <th className="py-4 px-5 text-right">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                            Keine Buchungen gefunden.
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-4 px-5 font-mono font-extrabold text-sky-400">
                              {b.referenceCode}
                            </td>
                            <td className="py-4 px-5">
                              <div className="font-bold text-white">{b.customerName}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{b.customerEmail}</div>
                            </td>
                            <td className="py-4 px-5">
                              <div className="font-semibold text-slate-200">{b.date}</div>
                              <div className="text-[11px] text-slate-400">{b.timeSlot} Uhr</div>
                            </td>
                            <td className="py-4 px-5 text-slate-300 font-medium">
                              {b.serviceName}
                            </td>
                            <td className="py-4 px-5 text-slate-300">
                              <span className="font-semibold text-white">{b.numChildren}</span> Kinder, {b.numAdults} Erw.
                            </td>
                            <td className="py-4 px-5 font-black text-white text-sm">
                              {b.totalPrice.toFixed(2)} €
                            </td>
                            <td className="py-4 px-5">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                  b.status === 'confirmed'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : b.status === 'pending'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : b.status === 'completed'
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {b.status}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedBooking(b)}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-sky-500 hover:text-white text-slate-200 border border-slate-700/80 transition font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
                              >
                                <span>Details</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              MODULE VIEWS (Reskinned Modules)
              ===================================================================== */}
          {activeSection === 'settings' && (
            <div className="animate-fadeIn">
              <BusinessSettingsModule currentRole={staffProfile?.role || 'staff'} />
            </div>
          )}

          {activeSection === 'packages' && (
            <div className="animate-fadeIn">
              <PackagesModule currentRole={staffProfile?.role || 'staff'} />
            </div>
          )}

          {activeSection === 'capacity' && (
            <div className="animate-fadeIn">
              <BlockedDatesModule currentRole={staffProfile?.role || 'staff'} viewMode="capacity" />
            </div>
          )}

          {activeSection === 'blocked-dates' && (
            <div className="animate-fadeIn">
              <BlockedDatesModule currentRole={staffProfile?.role || 'staff'} viewMode="blocked-dates" />
            </div>
          )}

          {activeSection === 'announcements' && (
            <div className="animate-fadeIn">
              <SiteAnnouncementsModule currentRole={staffProfile?.role || 'staff'} />
            </div>
          )}

          {activeSection === 'faqs' && (
            <div className="animate-fadeIn">
              <FaqManagementModule currentRole={staffProfile?.role || 'staff'} />
            </div>
          )}

          {activeSection === 'inquiries' && (
            <div className="animate-fadeIn">
              <EventInquiriesInboxModule currentRole={staffProfile?.role || 'staff'} />
            </div>
          )}

          {activeSection === 'gallery' && (
            <div className="animate-fadeIn">
              <GalleryManagementModule currentRole={staffProfile?.role || 'staff'} />
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          MOBILE SLIDE-OVER DRAWER (< 1024px)
          ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-4/5 max-w-xs bg-[#0B0F17] border-r border-slate-800 flex flex-col h-full z-10 shadow-2xl animate-fadeIn">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm font-heading">Haven Kids</h3>
                  <span className="text-[10px] text-slate-400">Admin Menü</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              {navigationGroups.map((group) => (
                <div key={group.group} className="space-y-1">
                  <span className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {group.group}
                  </span>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <Link
                          key={item.id}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                            isActive
                              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                            <span>{item.label}</span>
                          </div>
                          {item.badge !== undefined && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-slate-300">
                              {item.badge}
                            </span>
                          )}
                          {item.alertBadge && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-400">
                              {item.alertBadge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/80">
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); signOut(); }}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center justify-center gap-2 border border-rose-500/20"
              >
                <LogOut className="w-4 h-4" />
                <span>Abmelden</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MOBILE BOTTOM QUICK-ACTION BAR (< 1024px)
          ========================================================================= */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F17]/95 backdrop-blur-xl border-t border-slate-800 px-3 py-2 flex items-center justify-around">
        <Link
          to="/bookings"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold transition ${
            activeSection === 'bookings' ? 'text-sky-400' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>Buchungen</span>
        </Link>

        <Link
          to="/capacity"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold transition ${
            activeSection === 'capacity' ? 'text-sky-400' : 'text-slate-400'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span>Kapazität</span>
        </Link>

        <Link
          to="/inquiries"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold relative transition ${
            activeSection === 'inquiries' ? 'text-sky-400' : 'text-slate-400'
          }`}
        >
          <Inbox className="w-5 h-5" />
          <span>Anfragen</span>
          <span className="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-rose-500"></span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold text-slate-400 hover:text-white"
        >
          <Menu className="w-5 h-5" />
          <span>Menü</span>
        </button>
      </nav>

      {/* =========================================================================
          BOOKING DETAILS MODAL (ULTRA-SLEEK DARK)
          ========================================================================= */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-700/80 space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-slate-400 block">Buchungsdetails</span>
                <h3 className="font-black text-xl text-white font-heading mt-0.5">
                  {selectedBooking.referenceCode}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400 font-medium">Kunde:</span>
                <strong className="text-white text-sm font-bold">{selectedBooking.customerName}</strong>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400 font-medium">E-Mail:</span>
                <a href={`mailto:${selectedBooking.customerEmail}`} className="text-sky-400 hover:underline font-mono">
                  {selectedBooking.customerEmail}
                </a>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400 font-medium">Telefon:</span>
                <a href={`tel:${selectedBooking.customerPhone}`} className="text-sky-400 hover:underline font-mono font-bold">
                  {selectedBooking.customerPhone}
                </a>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400 font-medium">Termin & Slot:</span>
                <strong className="text-white font-bold">{selectedBooking.date} • {selectedBooking.timeSlot} Uhr</strong>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400 font-medium">Paket:</span>
                <span className="text-slate-200 font-semibold">{selectedBooking.serviceName}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400 font-medium">Gäste:</span>
                <span className="text-slate-200 font-semibold">{selectedBooking.numChildren} Kinder, {selectedBooking.numAdults} Begleitpersonen</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400 font-medium">Gesamtbetrag (vor Ort):</span>
                <span className="text-white font-black text-base">{selectedBooking.totalPrice.toFixed(2)} €</span>
              </div>

              {selectedBooking.notes && (
                <div className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/30 text-amber-200 text-xs">
                  <strong className="block font-bold mb-0.5">Kundenanmerkung:</strong>
                  <p>{selectedBooking.notes}</p>
                </div>
              )}
            </div>

            {/* Status Switcher Buttons */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
                Status ändern:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => updateBookingStatus(selectedBooking.id, 'confirmed')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs transition cursor-pointer ${
                    selectedBooking.status === 'confirmed'
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                  }`}
                >
                  Bestätigt
                </button>
                <button
                  type="button"
                  onClick={() => updateBookingStatus(selectedBooking.id, 'completed')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs transition cursor-pointer ${
                    selectedBooking.status === 'completed'
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                      : 'bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-blue-500/25'
                  }`}
                >
                  Erledigt
                </button>
                <button
                  type="button"
                  onClick={() => updateBookingStatus(selectedBooking.id, 'pending')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs transition cursor-pointer ${
                    selectedBooking.status === 'pending'
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
                  }`}
                >
                  Ausstehend
                </button>
                <button
                  type="button"
                  onClick={() => updateBookingStatus(selectedBooking.id, 'cancelled')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs transition cursor-pointer ${
                    selectedBooking.status === 'cancelled'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                      : 'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25'
                  }`}
                >
                  Storniert
                </button>
              </div>
            </div>

            {/* Direct WhatsApp Action */}
            <div className="pt-2 flex gap-3">
              <a
                href={`https://wa.me/${selectedBooking.customerPhone.replace(/[^0-9]/g, '')}?text=Hallo%20${encodeURIComponent(selectedBooking.customerName)}%2C%20hier%20ist%20das%20Haven%20Kids%20Caf%C3%A9%20Team%20bez%C3%BCglich%20deiner%20Buchung%20${selectedBooking.referenceCode}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-950 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Kunden per WhatsApp kontaktieren</span>
              </a>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
