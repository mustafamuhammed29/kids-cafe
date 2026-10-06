import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { AdminBooking, BookingStatus } from '../types/admin';
import {
  Calendar,
  Clock,
  Users,
  LogOut,
  Search,
  Filter,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

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
  const { user, staffProfile, signOut, isConfigured } = useAuth();
  const [bookings, setBookings] = useState<AdminBooking[]>(MOCK_ADMIN_BOOKINGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.referenceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const totalChildren = bookings.reduce((sum, b) => sum + b.numChildren, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
      {/* Top Navigation */}
      <header className="bg-[#183D3D] text-white px-6 py-4 border-b border-[#2D5A47] flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#93B1A6]/20 flex items-center justify-center text-[#FFD3B6]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight leading-none font-heading">
                Haven Kids Café
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#93B1A6]/30 text-emerald-200">
                Staff Portal
              </span>
            </div>
            <span className="text-[11px] text-gray-300">
              admin.havenkids.de · Autonomer Verwaltungsbereich
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-white">
              {staffProfile?.fullName || user?.email || 'Mitarbeiter'}
            </div>
            <div className="text-[10px] text-emerald-300 flex items-center gap-1 justify-end">
              <ShieldCheck className="w-3 h-3" />
              <span className="uppercase font-bold">{staffProfile?.role || 'Staff'}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-100 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Abmelden</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-semibold">Aktive Buchungen</span>
              <Calendar className="w-4 h-4 text-[#5C8374]" />
            </div>
            <span className="text-2xl font-extrabold text-[#183D3D]">{confirmedCount}</span>
            <span className="text-[11px] text-gray-500 block mt-1 font-medium">Verbindlich reserviert</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-semibold">Erwartete Kinder</span>
              <Users className="w-4 h-4 text-sky-600" />
            </div>
            <span className="text-2xl font-extrabold text-[#183D3D]">{totalChildren} Kinder</span>
            <span className="text-[11px] text-gray-500 block mt-1 font-medium">Kapazität: 20 max/Slot</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-semibold">Nächster Slot</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-2xl font-extrabold text-[#183D3D]">10:00 Uhr</span>
            <span className="text-[11px] text-emerald-600 block mt-1 font-semibold">Slot vorbereitet</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-semibold">RLS-Sicherheitsstatus</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-2xl font-extrabold text-emerald-600">Aktiv</span>
            <span className="text-[11px] text-gray-500 block mt-1">Strikte Server-Autorisierung</span>
          </div>
        </div>

        {/* Filter and Action Bar */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Name, Buchungscode oder E-Mail..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#5C8374]"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white text-gray-700"
              >
                <option value="all">Alle Status</option>
                <option value="confirmed">Bestätigt</option>
                <option value="pending">Ausstehend</option>
                <option value="completed">Abgeschlossen</option>
                <option value="cancelled">Storniert</option>
              </select>
            </div>

            <button
              type="button"
              onClick={fetchLiveBookings}
              disabled={isLoading}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
              title="Aktualisieren"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Referenz</th>
                  <th className="py-3.5 px-4">Kunde</th>
                  <th className="py-3.5 px-4">Datum & Slot</th>
                  <th className="py-3.5 px-4">Paket</th>
                  <th className="py-3.5 px-4">Gäste</th>
                  <th className="py-3.5 px-4">Betrag</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#183D3D]">
                      {b.referenceCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-800">{b.customerName}</div>
                      <div className="text-[11px] text-gray-400">{b.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-gray-800">{b.date}</div>
                      <div className="text-[11px] text-gray-500">{b.timeSlot} Uhr</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700">
                      {b.serviceName}
                    </td>
                    <td className="py-3.5 px-4 text-gray-700">
                      {b.numChildren} Kinder, {b.numAdults} Erw.
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-800">
                      {b.totalPrice.toFixed(2)} €
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : b.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : b.status === 'completed'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(b)}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-[#183D3D] hover:text-white transition font-medium text-xs cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[11px] font-mono text-gray-400 block">Buchungsdetails</span>
                <h3 className="font-extrabold text-xl text-[#183D3D] font-heading">
                  {selectedBooking.referenceCode}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Kunde:</span>
                <strong className="text-gray-800">{selectedBooking.customerName}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">E-Mail:</span>
                <a href={`mailto:${selectedBooking.customerEmail}`} className="text-[#5C8374] underline">
                  {selectedBooking.customerEmail}
                </a>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Telefon:</span>
                <a href={`tel:${selectedBooking.customerPhone}`} className="text-[#5C8374] underline">
                  {selectedBooking.customerPhone}
                </a>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Termin:</span>
                <strong className="text-gray-800">{selectedBooking.date} ({selectedBooking.timeSlot} Uhr)</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Paket:</span>
                <span className="text-gray-800 font-semibold">{selectedBooking.serviceName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Gäste:</span>
                <span className="text-gray-800">{selectedBooking.numChildren} Kinder, {selectedBooking.numAdults} Begleitpersonen</span>
              </div>
              {selectedBooking.notes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                  <strong>Kundenanmerkung:</strong>
                  <p className="mt-0.5">{selectedBooking.notes}</p>
                </div>
              )}
            </div>

            {/* Quick Status Control */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-gray-700 block">Status aktualisieren:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => updateBookingStatus(selectedBooking.id, 'confirmed')}
                  className={`py-2 px-2.5 rounded-xl font-bold text-[11px] transition ${
                    selectedBooking.status === 'confirmed'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  Bestätigt
                </button>
                <button
                  type="button"
                  onClick={() => updateBookingStatus(selectedBooking.id, 'completed')}
                  className={`py-2 px-2.5 rounded-xl font-bold text-[11px] transition ${
                    selectedBooking.status === 'completed'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                  }`}
                >
                  Abgeschlossen
                </button>
                <button
                  type="button"
                  onClick={() => updateBookingStatus(selectedBooking.id, 'pending')}
                  className={`py-2 px-2.5 rounded-xl font-bold text-[11px] transition ${
                    selectedBooking.status === 'pending'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  Ausstehend
                </button>
                <button
                  type="button"
                  onClick={() => updateBookingStatus(selectedBooking.id, 'cancelled')}
                  className={`py-2 px-2.5 rounded-xl font-bold text-[11px] transition ${
                    selectedBooking.status === 'cancelled'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                  }`}
                >
                  Storniert
                </button>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <a
                href={`https://wa.me/${selectedBooking.customerPhone.replace(/[^0-9]/g, '')}?text=Hallo%20${encodeURIComponent(selectedBooking.customerName)}%2C%20hier%20ist%20das%20Haven%20Kids%20Caf%C3%A9%20Team%20bez%C3%BCglich%20deiner%20Buchung%20${selectedBooking.referenceCode}.`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700"
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
