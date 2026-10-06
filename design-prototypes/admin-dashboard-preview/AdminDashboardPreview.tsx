import React, { useState } from 'react';
import {
  Users,
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Droplets,
  MoreVertical,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  Coffee,
} from 'lucide-react';

interface MockBooking {
  id: string;
  reference: string;
  customerName: string;
  email: string;
  phone: string;
  slot: string;
  service: string;
  children: number;
  adults: number;
  totalPrice: number;
  status: 'confirmed' | 'checked_in' | 'cancelled';
  saltRoom: boolean;
}

const INITIAL_BOOKINGS: MockBooking[] = [
  {
    id: '1',
    reference: 'HKC-20261007-8FA1',
    customerName: 'Julia Schneider',
    email: 'julia.s@beispiel.de',
    phone: '+49 170 1234567',
    slot: '10:00 - 12:00',
    service: 'Einzelbesuch + Salzraum',
    children: 2,
    adults: 2,
    totalPrice: 38.00,
    status: 'checked_in',
    saltRoom: true,
  },
  {
    id: '2',
    reference: 'HKC-20261007-4C92',
    customerName: 'Dr. Michael Weber',
    email: 'm.weber@beispiel.de',
    phone: '+49 172 9876543',
    slot: '10:00 - 12:00',
    service: 'Einzelbesuch',
    children: 1,
    adults: 1,
    totalPrice: 14.00,
    status: 'checked_in',
    saltRoom: false,
  },
  {
    id: '3',
    reference: 'HKC-20261007-7E19',
    customerName: 'Laura & Tobias Becker',
    email: 'laura.becker@beispiel.de',
    phone: '+49 176 5544332',
    slot: '12:30 - 14:30',
    service: 'Kindergeburtstag',
    children: 8,
    adults: 4,
    totalPrice: 250.00,
    status: 'confirmed',
    saltRoom: true,
  },
  {
    id: '4',
    reference: 'HKC-20261007-9B31',
    customerName: 'Fatima Al-Mansoor',
    email: 'fatima.al@beispiel.de',
    phone: '+49 171 4433221',
    slot: '15:00 - 17:00',
    service: 'Einzelbesuch',
    children: 2,
    adults: 1,
    totalPrice: 28.00,
    status: 'confirmed',
    saltRoom: false,
  },
  {
    id: '5',
    reference: 'HKC-20261007-1D44',
    customerName: 'Christian Vogel',
    email: 'c.vogel@beispiel.de',
    phone: '+49 179 8877665',
    slot: '17:30 - 19:30',
    service: '10er-Block Pass',
    children: 1,
    adults: 2,
    totalPrice: 120.00,
    status: 'confirmed',
    saltRoom: false,
  },
];

export const AdminDashboardPreview: React.FC = () => {
  const [bookings, setBookings] = useState<MockBooking[]>(INITIAL_BOOKINGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'checked_in' | 'cancelled'>('all');
  const [slotFilter, setSlotFilter] = useState<'all' | '10:00' | '12:30' | '15:00' | '17:30'>('all');

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesSlot = slotFilter === 'all' || b.slot.startsWith(slotFilter);

    return matchesSearch && matchesStatus && matchesSlot;
  });

  const handleCheckIn = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'checked_in' } : b))
    );
  };

  return (
    <div className="min-h-screen bg-[#F5EFE6] text-[#1D2623] font-sans antialiased">
      {/* 1. Calm Hospitality Brand Top Bar */}
      <header className="bg-[#243E36] text-[#FAF7F2] px-6 py-4 border-b border-[#1D332C]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-2xl font-semibold tracking-tight">Haven</span>
            <span className="text-[11px] uppercase tracking-widest text-[#D4E4E7]/70 border-l border-[#3D5B52] pl-3 py-0.5">
              Operations & Front-Desk
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="px-3 py-1 rounded-full bg-[#1D332C] text-[#FAF7F2]/90 border border-[#3D5B52] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live · Berlin (eu-central-1)</span>
            </span>
            <div className="w-8 h-8 rounded-full bg-[#567568] flex items-center justify-center font-bold text-xs text-white">
              HK
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* 2. Today's Hospitality Pulse KPIs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl text-[#243E36]">
                Tagesübersicht · Mittwoch, 7. Oktober
              </h1>
              <p className="text-xs text-[#6A7872] mt-0.5">
                Kapazitätssteuerung, Check-ins und Vor-Ort-Zahlungen
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#EAEFEA] text-[#243E36] border border-[#D5E0D5]">
              Slot 10:00–12:00 aktiv
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1 */}
            <div className="bg-white p-5 rounded-2xl border border-[#E8DFD1] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-[#71807A]">
                <span>Aktueller Slot</span>
                <Users className="w-4 h-4 text-[#567568]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-3xl font-bold text-[#243E36]">18</span>
                <span className="text-xs text-[#71807A]">/ 20 Kinder (90%)</span>
              </div>
              <div className="w-full bg-[#EAEFEA] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#567568] h-full rounded-full w-[90%]"></div>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white p-5 rounded-2xl border border-[#E8DFD1] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-[#71807A]">
                <span>Tagesreservierungen</span>
                <Calendar className="w-4 h-4 text-[#243E36]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-3xl font-bold text-[#243E36]">42</span>
                <span className="text-xs text-[#71807A]">Kinder gebucht</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold block">
                +14% vs. Vorwoche
              </span>
            </div>

            {/* KPI 3 */}
            <div className="bg-white p-5 rounded-2xl border border-[#E8DFD1] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-[#71807A]">
                <span>Salzraum Belegung</span>
                <Droplets className="w-4 h-4 text-[#3A6872]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-3xl font-bold text-[#3A6872]">6 / 8</span>
                <span className="text-xs text-[#71807A]">Kinder</span>
              </div>
              <span className="text-[11px] text-[#3A6872] font-semibold block">
                Nächste Runde 11:15
              </span>
            </div>

            {/* KPI 4 */}
            <div className="bg-white p-5 rounded-2xl border border-[#E8DFD1] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-[#71807A]">
                <span>Erwarteter Bar/Karte Umsatz</span>
                <TrendingUp className="w-4 h-4 text-[#243E36]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-3xl font-bold text-[#243E36]">588 €</span>
                <span className="text-xs text-[#71807A]">Vor Ort</span>
              </div>
              <span className="text-[11px] text-[#71807A] block">
                100% Zahlung beim Check-in
              </span>
            </div>
          </div>
        </div>

        {/* 3. Slot Capacity Timeline Visualizer */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8DFD1] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg text-[#243E36] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#567568]" />
              <span>Tagesverlauf nach Zeitslots (2 Std. + 30 Min. Reinigung)</span>
            </h3>
            <span className="text-xs text-[#71807A]">Max. 20 Kinder je Slot</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5">
              <div className="flex justify-between font-bold text-[#243E36]">
                <span>10:00 – 12:00</span>
                <span className="text-emerald-700">18 / 20</span>
              </div>
              <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full w-[90%]"></div>
              </div>
              <p className="text-[11px] text-emerald-800">Läuft aktuell · Check-ins offen</p>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1.5">
              <div className="flex justify-between font-bold text-[#243E36]">
                <span>12:30 – 14:30</span>
                <span className="text-amber-800">20 / 20 (Voll)</span>
              </div>
              <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full w-[100%]"></div>
              </div>
              <p className="text-[11px] text-amber-800">Ausgebucht · Kindergeburtstag</p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E0D8CB] bg-[#FAF7F2] space-y-1.5">
              <div className="flex justify-between font-bold text-[#243E36]">
                <span>15:00 – 17:00</span>
                <span className="text-[#567568]">14 / 20</span>
              </div>
              <div className="w-full bg-[#E0D8CB] h-2 rounded-full overflow-hidden">
                <div className="bg-[#567568] h-full w-[70%]"></div>
              </div>
              <p className="text-[11px] text-[#71807A]">6 Plätze frei</p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E0D8CB] bg-[#FAF7F2] space-y-1.5">
              <div className="flex justify-between font-bold text-[#243E36]">
                <span>17:30 – 19:30</span>
                <span className="text-[#567568]">8 / 20</span>
              </div>
              <div className="w-full bg-[#E0D8CB] h-2 rounded-full overflow-hidden">
                <div className="bg-[#567568] h-full w-[40%]"></div>
              </div>
              <p className="text-[11px] text-[#71807A]">12 Plätze frei</p>
            </div>
          </div>
        </div>

        {/* 4. Filter, Search & Guest List */}
        <div className="bg-white rounded-2xl border border-[#E8DFD1] shadow-xs overflow-hidden">
          {/* Controls Bar */}
          <div className="p-5 border-b border-[#EFEAE1] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#7C8B84] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Gast suchen (Name, Code, E-Mail)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#DDD6C8] bg-[#FAF7F2] text-xs focus:ring-2 focus:ring-[#243E36] focus:bg-white min-h-[40px]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-[#DDD6C8] bg-[#FAF7F2] text-xs focus:ring-2 focus:ring-[#243E36] min-h-[40px]"
              >
                <option value="all">Alle Status</option>
                <option value="confirmed">Bestätigt (Offen)</option>
                <option value="checked_in">Eingecheckt</option>
                <option value="cancelled">Storniert</option>
              </select>

              <select
                value={slotFilter}
                onChange={(e) => setSlotFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-[#DDD6C8] bg-[#FAF7F2] text-xs focus:ring-2 focus:ring-[#243E36] min-h-[40px]"
              >
                <option value="all">Alle Zeitslots</option>
                <option value="10:00">10:00 - 12:00</option>
                <option value="12:30">12:30 - 14:30</option>
                <option value="15:00">15:00 - 17:00</option>
                <option value="17:30">17:30 - 19:30</option>
              </select>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#71807A] uppercase tracking-wider font-semibold border-b border-[#EFEAE1]">
                <tr>
                  <th className="py-3 px-5">Code / Gast</th>
                  <th className="py-3 px-5">Zeitslot</th>
                  <th className="py-3 px-5">Paket</th>
                  <th className="py-3 px-5">Gäste</th>
                  <th className="py-3 px-5">Betrag</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE1]">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-4 px-5">
                      <span className="font-mono text-[11px] font-bold text-[#243E36] block">
                        {b.reference}
                      </span>
                      <span className="font-semibold text-sm text-[#1D2623] block mt-0.5">
                        {b.customerName}
                      </span>
                      <span className="text-[11px] text-[#71807A]">{b.phone}</span>
                    </td>

                    <td className="py-4 px-5 font-semibold text-[#243E36]">
                      {b.slot}
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-medium text-[#1D2623] block">{b.service}</span>
                      {b.saltRoom && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#3A6872] bg-[#E3EDEE] px-2 py-0.5 rounded-full font-bold mt-1">
                          <Droplets className="w-3 h-3" />
                          Inkl. Salzraum
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-[#46544E]">
                      {b.children} Kind{b.children > 1 ? 'er' : ''}, {b.adults} Erw.
                    </td>

                    <td className="py-4 px-5 font-bold text-[#243E36]">
                      {b.totalPrice.toFixed(2)} €
                    </td>

                    <td className="py-4 px-5">
                      {b.status === 'checked_in' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Eingecheckt
                        </span>
                      ) : b.status === 'confirmed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EAEFEA] text-[#243E36] font-bold text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Offen
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" />
                          Storniert
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-right">
                      {b.status === 'confirmed' ? (
                        <button
                          type="button"
                          onClick={() => handleCheckIn(b.id)}
                          className="bg-[#243E36] hover:bg-[#1D332C] text-white px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer min-h-[34px]"
                        >
                          Check-in
                        </button>
                      ) : (
                        <span className="text-[#8C9A94] text-xs font-medium">Bezahlt</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-[#EFEAE1]">
            {filteredBookings.map((b) => (
              <div key={b.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-[10px] text-[#71807A] font-bold block">{b.reference}</span>
                    <h4 className="font-bold text-sm text-[#1D2623]">{b.customerName}</h4>
                    <p className="text-xs text-[#71807A]">{b.phone}</p>
                  </div>
                  {b.status === 'checked_in' ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Eingecheckt
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-[#EAEFEA] text-[#243E36] text-[10px] font-bold">
                      Offen
                    </span>
                  )}
                </div>

                <div className="bg-[#FAF7F2] p-2.5 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#71807A]">Zeitslot:</span>
                    <span className="font-bold text-[#243E36]">{b.slot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71807A]">Paket:</span>
                    <span>{b.service}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71807A]">Gäste:</span>
                    <span>{b.children} Kind(er), {b.adults} Erw.</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t border-[#EAE3D6]">
                    <span>Betrag vor Ort:</span>
                    <span className="text-[#243E36]">{b.totalPrice.toFixed(2)} €</span>
                  </div>
                </div>

                {b.status === 'confirmed' && (
                  <button
                    type="button"
                    onClick={() => handleCheckIn(b.id)}
                    className="w-full bg-[#243E36] hover:bg-[#1D332C] text-white py-2 rounded-xl text-xs font-bold transition min-h-[40px]"
                  >
                    Gast einchecken & Bar/Karte kassieren
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
