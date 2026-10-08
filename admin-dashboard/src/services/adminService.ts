import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  AdminBusinessSettings,
  AdminPackage,
  AdminBlockedDate,
  AdminTimeSlot,
  AdminAnnouncement,
  AdminFaq,
  AdminEventInquiry,
  InquiryStatus,
  AdminGalleryItem,
} from '../types/admin';

// Default Business Settings Fallback
export const DEFAULT_ADMIN_SETTINGS: AdminBusinessSettings = {
  name: 'Haven Kids Café',
  tagline: 'Kreativer Spielraum & modernes Familiencafé',
  address: 'Friedrichstraße 123, 10117 Berlin',
  phone: '+49 30 12345678',
  email: 'hallo@havenkidscafe.de',
  whatsappUrl: 'https://wa.me/493012345678',
  instagramUrl: 'https://instagram.com/havenkidscafe',
  mapsUrl: 'https://maps.google.com/?q=Friedrichstra%C3%9Fe%20123%2C%2010117%20Berlin',
  logoUrl: '/favicon.svg',
  faviconUrl: '/favicon.svg',
  footerNotice: 'Haven Kids Café Berlin – Der Wohlfühlort für freies Entfalten in sicherer Umgebung.',
  seoTitle: 'Haven Kids Café | Spielcafé & Salzraum in Berlin',
  seoDescription: 'Sicherer Spielbereich für Kinder 0-8 Jahre. Entspannung für Eltern mit Barista-Kaffee & sanftem Salzraum in Berlin. Jetzt Termin buchen!',
  ogImageUrl: '/assets/spielbereich.jpg',
  openingHours: [
    { days: 'Montag – Donnerstag', time: '10:00 – 18:00 Uhr' },
    { days: 'Freitag – Samstag', time: '09:00 – 19:00 Uhr' },
    { days: 'Sonntag', time: 'Geschlossen (Ruhetag & Exklusiv-Events)' },
  ],
  saltRoomAddonPrice: 5.00,
};

/**
 * URL Sanitization & Protocol Validation
 * Strictly prevents unsafe schemes (javascript:, data:, vbscript:, file:)
 */
export function validateSafeUrl(url?: string | null): boolean {
  if (!url) return true;
  const trimmed = url.trim();
  if (!trimmed) return true;
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    return false;
  }
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return ['https:', 'http:', 'mailto:', 'tel:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Default Packages Fallback
export const DEFAULT_ADMIN_PACKAGES: AdminPackage[] = [
  {
    id: 'pkg-1',
    slug: 'einzelbesuch',
    name: 'Einzelbesuch',
    subtitle: 'Für spontane Ausflüge',
    description: 'Ein Einzeleintritt für 2 Stunden unbeschwertes Spielen und Entdecken.',
    category: 'standard',
    priceType: 'fixed',
    basePrice: 14.00,
    currency: '€',
    isVisible: true,
    displayOrder: 1,
  },
  {
    id: 'pkg-2',
    slug: '10er-block',
    name: '10er-Block Pass',
    subtitle: 'Für regelmäßige Besucher',
    description: 'Unser flexibler Zehnerblock – spare über 14% gegenüber Einzeltickets.',
    category: 'standard',
    priceType: 'fixed',
    basePrice: 120.00,
    currency: '€',
    isVisible: true,
    displayOrder: 2,
  },
  {
    id: 'pkg-3',
    slug: 'kindergeburtstag',
    name: 'Kindergeburtstag',
    subtitle: 'Das Rundum-Sorglos-Paket',
    description: 'Die perfekte Geburtstagsparty für bis zu 8 Kinder im geschmückten Partybereich.',
    category: 'standard',
    priceType: 'fixed',
    basePrice: 250.00,
    currency: '€',
    isVisible: true,
    displayOrder: 3,
  },
  {
    id: 'pkg-4',
    slug: 'gruppenfeier',
    name: 'Gruppenfeier',
    subtitle: 'Für Geburtstage und private Feiern',
    description: 'Exklusive Raumnutzung und individuelle Betreuung für größere Feierlichkeiten.',
    category: 'group',
    priceType: 'on-request',
    basePrice: null,
    currency: '€',
    isVisible: true,
    displayOrder: 4,
  },
  {
    id: 'pkg-5',
    slug: 'gruppen-events',
    name: 'Gruppen-Events',
    subtitle: 'Für Schulen, Kindergärten und Vereine',
    description: 'Maßgeschneiderte Vormittage und Aktivitäten für Bildungseinrichtungen.',
    category: 'group',
    priceType: 'on-request',
    basePrice: null,
    currency: '€',
    isVisible: true,
    displayOrder: 5,
  },
  {
    id: 'pkg-6',
    slug: 'firmen-events',
    name: 'Firmen-Events',
    subtitle: 'Teambuilding und Firmenfeiern',
    description: 'Familienfreundliche Firmen-Events und exklusive Abendevents mit Catering.',
    category: 'corporate',
    priceType: 'on-request',
    basePrice: null,
    currency: '€',
    isVisible: true,
    displayOrder: 6,
  },
];

// Local state caches for development simulation
let memorySettings: AdminBusinessSettings = { ...DEFAULT_ADMIN_SETTINGS };
let memoryPackages: AdminPackage[] = [...DEFAULT_ADMIN_PACKAGES];
let memoryBlockedDates: AdminBlockedDate[] = [
  {
    id: 'block-1',
    date: '2026-12-25',
    reason: '1. Weihnachtsfeiertag (Ruhetag)',
    createdAt: '2026-10-07T10:00:00Z',
  },
  {
    id: 'block-2',
    date: '2026-12-26',
    reason: '2. Weihnachtsfeiertag (Ruhetag)',
    createdAt: '2026-10-07T10:00:00Z',
  },
];

let memorySlots: AdminTimeSlot[] = [
  {
    id: 'slot-1',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '12:00',
    serviceId: 'einzelbesuch',
    maxCapacity: 20,
    bookedCount: 6,
    isActive: true,
  },
  {
    id: 'slot-2',
    date: new Date().toISOString().split('T')[0],
    startTime: '12:30',
    endTime: '14:30',
    serviceId: 'einzelbesuch',
    maxCapacity: 20,
    bookedCount: 14,
    isActive: true,
  },
  {
    id: 'slot-3',
    date: new Date().toISOString().split('T')[0],
    startTime: '15:00',
    endTime: '17:00',
    serviceId: 'einzelbesuch',
    maxCapacity: 20,
    bookedCount: 20,
    isActive: true,
  },
  {
    id: 'slot-4',
    date: new Date().toISOString().split('T')[0],
    startTime: '17:30',
    endTime: '19:30',
    serviceId: 'einzelbesuch',
    maxCapacity: 20,
    bookedCount: 2,
    isActive: false,
  },
];

// ==============================================================================
// 1. BUSINESS SETTINGS API
// ==============================================================================
export async function fetchBusinessSettings(): Promise<AdminBusinessSettings> {
  if (!isSupabaseConfigured) {
    return memorySettings;
  }

  try {
    const { data, error } = await supabase
      .from('business_settings')
      .select('key, value');

    if (error || !data || data.length === 0) {
      return DEFAULT_ADMIN_SETTINGS;
    }

    const map = new Map<string, any>(data.map((row: any) => [row.key, row.value]));

    return {
      name: map.get('name') ?? DEFAULT_ADMIN_SETTINGS.name,
      tagline: map.get('tagline') ?? DEFAULT_ADMIN_SETTINGS.tagline,
      address: map.get('address') ?? DEFAULT_ADMIN_SETTINGS.address,
      phone: map.get('phone') ?? DEFAULT_ADMIN_SETTINGS.phone,
      email: map.get('email') ?? DEFAULT_ADMIN_SETTINGS.email,
      whatsappUrl: map.get('whatsapp_url') ?? DEFAULT_ADMIN_SETTINGS.whatsappUrl,
      instagramUrl: map.get('instagram_url') ?? DEFAULT_ADMIN_SETTINGS.instagramUrl,
      mapsUrl: map.get('maps_url') ?? DEFAULT_ADMIN_SETTINGS.mapsUrl,
      logoUrl: map.get('logo_url') ?? DEFAULT_ADMIN_SETTINGS.logoUrl,
      faviconUrl: map.get('favicon_url') ?? DEFAULT_ADMIN_SETTINGS.faviconUrl,
      footerNotice: map.get('footer_notice') ?? DEFAULT_ADMIN_SETTINGS.footerNotice,
      seoTitle: map.get('seo_title') ?? DEFAULT_ADMIN_SETTINGS.seoTitle,
      seoDescription: map.get('seo_description') ?? DEFAULT_ADMIN_SETTINGS.seoDescription,
      ogImageUrl: map.get('og_image_url') ?? DEFAULT_ADMIN_SETTINGS.ogImageUrl,
      openingHours: map.get('opening_hours') ?? DEFAULT_ADMIN_SETTINGS.openingHours,
      saltRoomAddonPrice: map.get('salt_room_addon_price') ? Number(map.get('salt_room_addon_price')) : 5.00,
    };
  } catch (err) {
    console.error('Error fetching business settings:', err);
    return DEFAULT_ADMIN_SETTINGS;
  }
}

export async function saveBusinessSettings(
  settings: Partial<AdminBusinessSettings>
): Promise<{ success: boolean; error?: string }> {
  // Validate URL fields
  const urlFields = [
    { name: 'WhatsApp-URL', val: settings.whatsappUrl },
    { name: 'Instagram-URL', val: settings.instagramUrl },
    { name: 'Google Maps-URL', val: settings.mapsUrl },
    { name: 'Logo-URL', val: settings.logoUrl },
    { name: 'Favicon-URL', val: settings.faviconUrl },
    { name: 'Open Graph Bild-URL', val: settings.ogImageUrl },
  ];

  for (const field of urlFields) {
    if (field.val !== undefined && field.val !== null && !validateSafeUrl(field.val)) {
      return {
        success: false,
        error: `Ungültige ${field.name}: Unsichere URL-Schemata (z.B. javascript:, data:) sind nicht erlaubt.`,
      };
    }
  }

  if (!isSupabaseConfigured) {
    memorySettings = { ...memorySettings, ...settings };
    return { success: true };
  }

  try {
    const upserts = [];

    if (settings.name !== undefined) {
      upserts.push({ key: 'name', value: JSON.stringify(settings.name), is_public: true });
    }
    if (settings.tagline !== undefined) {
      upserts.push({ key: 'tagline', value: JSON.stringify(settings.tagline), is_public: true });
    }
    if (settings.address !== undefined) {
      upserts.push({ key: 'address', value: JSON.stringify(settings.address), is_public: true });
    }
    if (settings.phone !== undefined) {
      upserts.push({ key: 'phone', value: JSON.stringify(settings.phone), is_public: true });
    }
    if (settings.email !== undefined) {
      upserts.push({ key: 'email', value: JSON.stringify(settings.email), is_public: true });
    }
    if (settings.whatsappUrl !== undefined) {
      upserts.push({ key: 'whatsapp_url', value: JSON.stringify(settings.whatsappUrl), is_public: true });
    }
    if (settings.instagramUrl !== undefined) {
      upserts.push({ key: 'instagram_url', value: JSON.stringify(settings.instagramUrl), is_public: true });
    }
    if (settings.mapsUrl !== undefined) {
      upserts.push({ key: 'maps_url', value: JSON.stringify(settings.mapsUrl), is_public: true });
    }
    if (settings.logoUrl !== undefined) {
      upserts.push({ key: 'logo_url', value: JSON.stringify(settings.logoUrl), is_public: true });
    }
    if (settings.faviconUrl !== undefined) {
      upserts.push({ key: 'favicon_url', value: JSON.stringify(settings.faviconUrl), is_public: true });
    }
    if (settings.footerNotice !== undefined) {
      upserts.push({ key: 'footer_notice', value: JSON.stringify(settings.footerNotice), is_public: true });
    }
    if (settings.seoTitle !== undefined) {
      upserts.push({ key: 'seo_title', value: JSON.stringify(settings.seoTitle), is_public: true });
    }
    if (settings.seoDescription !== undefined) {
      upserts.push({ key: 'seo_description', value: JSON.stringify(settings.seoDescription), is_public: true });
    }
    if (settings.ogImageUrl !== undefined) {
      upserts.push({ key: 'og_image_url', value: JSON.stringify(settings.ogImageUrl), is_public: true });
    }
    if (settings.openingHours !== undefined) {
      upserts.push({ key: 'opening_hours', value: JSON.stringify(settings.openingHours), is_public: true });
    }
    if (settings.saltRoomAddonPrice !== undefined) {
      upserts.push({ key: 'salt_room_addon_price', value: JSON.stringify(settings.saltRoomAddonPrice), is_public: true });
    }

    for (const item of upserts) {
      const { error } = await supabase
        .from('business_settings')
        .upsert(item, { onConflict: 'key' });

      if (error) {
        return { success: false, error: `Fehler beim Speichern von ${item.key}: ${error.message}` };
      }
    }

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Unerwarteter Fehler beim Speichern' };
  }
}

// ==============================================================================
// 2. PACKAGES & PRICING API
// ==============================================================================
export async function fetchAdminPackages(): Promise<AdminPackage[]> {
  if (!isSupabaseConfigured) {
    return memoryPackages;
  }

  try {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return memoryPackages;
    }

    return data.map((row: any) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      subtitle: row.subtitle,
      description: row.description,
      category: row.category,
      priceType: row.price_type,
      basePrice: row.base_price !== null ? Number(row.base_price) : null,
      currency: row.currency || '€',
      isVisible: row.is_visible,
      displayOrder: row.display_order,
    }));
  } catch (err) {
    console.error('Error fetching admin packages:', err);
    return memoryPackages;
  }
}

export async function updateAdminPackage(
  id: string,
  updates: { basePrice?: number | null; isVisible?: boolean; displayOrder?: number }
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    memoryPackages = memoryPackages.map((p) => (p.id === id ? { ...p, ...updates } : p));
    return { success: true };
  }

  try {
    const payload: Record<string, any> = {};
    if (updates.basePrice !== undefined) payload.base_price = updates.basePrice;
    if (updates.isVisible !== undefined) payload.is_visible = updates.isVisible;
    if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;

    const { error } = await supabase
      .from('packages')
      .update(payload)
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Pakets' };
  }
}

// ==============================================================================
// 3. BLOCKED DATES API
// ==============================================================================
export async function fetchBlockedDates(): Promise<AdminBlockedDate[]> {
  if (!isSupabaseConfigured) {
    return memoryBlockedDates;
  }

  try {
    const { data, error } = await supabase
      .from('blocked_dates')
      .select('*')
      .order('date', { ascending: true });

    if (error || !data) return memoryBlockedDates;

    return data.map((row: any) => ({
      id: row.id,
      date: row.date,
      reason: row.reason,
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.error('Error fetching blocked dates:', err);
    return memoryBlockedDates;
  }
}

export async function addBlockedDate(
  date: string,
  reason: string
): Promise<{ success: boolean; error?: string; item?: AdminBlockedDate }> {
  if (!isSupabaseConfigured) {
    const newBlock: AdminBlockedDate = {
      id: `block-${Date.now()}`,
      date,
      reason: reason.trim() || 'Schließtag / Ruhetag',
      createdAt: new Date().toISOString(),
    };
    memoryBlockedDates = [...memoryBlockedDates, newBlock].sort((a, b) => a.date.localeCompare(b.date));
    return { success: true, item: newBlock };
  }

  try {
    const { data, error } = await supabase
      .from('blocked_dates')
      .insert([{ date, reason: reason.trim() || null }])
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    return {
      success: true,
      item: {
        id: data.id,
        date: data.date,
        reason: data.reason,
        createdAt: data.created_at,
      },
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Fehler beim Blockieren des Tages' };
  }
}

export async function removeBlockedDate(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    memoryBlockedDates = memoryBlockedDates.filter((b) => b.id !== id);
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('blocked_dates')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Fehler beim Aufheben der Sperre' };
  }
}

// ==============================================================================
// 4. SLOT CAPACITY & ACTIVATION CONTROLS API
// ==============================================================================
export async function fetchTimeSlotsForDate(date: string): Promise<AdminTimeSlot[]> {
  if (!isSupabaseConfigured) {
    return memorySlots.filter((s) => s.date === date);
  }

  try {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .eq('date', date)
      .order('start_time', { ascending: true });

    if (error || !data || data.length === 0) {
      return memorySlots.filter((s) => s.date === date);
    }

    return data.map((row: any) => ({
      id: row.id,
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      serviceId: row.service_id,
      maxCapacity: row.max_capacity,
      bookedCount: row.booked_count,
      isActive: row.is_active,
    }));
  } catch (err) {
    console.error('Error fetching time slots:', err);
    return memorySlots.filter((s) => s.date === date);
  }
}

export async function updateTimeSlot(
  id: string,
  updates: { isActive?: boolean; maxCapacity?: number; startTime?: string; endTime?: string }
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    const slot = memorySlots.find((s) => s.id === id);
    if (slot && updates.maxCapacity !== undefined && updates.maxCapacity < slot.bookedCount) {
      return {
        success: false,
        error: `Kapazitätskonflikt: Der Slot hat bereits ${slot.bookedCount} Buchungen. Die Kapazität kann nicht darunter gesenkt werden.`,
      };
    }

    memorySlots = memorySlots.map((s) => (s.id === id ? { ...s, ...updates } : s));
    return { success: true };
  }

  try {
    // Check existing booked_count before modifying capacity
    if (updates.maxCapacity !== undefined) {
      const { data: currentSlot, error: fetchErr } = await supabase
        .from('time_slots')
        .select('booked_count')
        .eq('id', id)
        .single();

      if (!fetchErr && currentSlot && updates.maxCapacity < currentSlot.booked_count) {
        return {
          success: false,
          error: `Kapazitätskonflikt: Der Slot hat bereits ${currentSlot.booked_count} Buchungen. Die Kapazität kann nicht darunter gesenkt werden.`,
        };
      }
    }

    const payload: Record<string, any> = {};
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;
    if (updates.maxCapacity !== undefined) payload.max_capacity = updates.maxCapacity;
    if (updates.startTime !== undefined) payload.start_time = updates.startTime;
    if (updates.endTime !== undefined) payload.end_time = updates.endTime;

    const { error } = await supabase
      .from('time_slots')
      .update(payload)
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Zeitslots' };
  }
}

export async function addTimeSlot(slot: {
  date: string;
  startTime: string;
  endTime: string;
  serviceId?: string;
  maxCapacity: number;
  isActive?: boolean;
}): Promise<{ success: boolean; item?: AdminTimeSlot; error?: string }> {
  const serviceId = slot.serviceId || 'einzelbesuch';
  const isActive = slot.isActive !== undefined ? slot.isActive : true;

  if (!isSupabaseConfigured) {
    const newSlot: AdminTimeSlot = {
      id: `slot-${Date.now()}`,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      serviceId,
      maxCapacity: slot.maxCapacity,
      bookedCount: 0,
      isActive,
    };
    memorySlots.push(newSlot);
    return { success: true, item: newSlot };
  }

  try {
    const { data, error } = await supabase
      .from('time_slots')
      .insert({
        date: slot.date,
        start_time: slot.startTime,
        end_time: slot.endTime,
        service_id: serviceId,
        max_capacity: slot.maxCapacity,
        booked_count: 0,
        is_active: isActive,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    return {
      success: true,
      item: {
        id: data.id,
        date: data.date,
        startTime: data.start_time,
        endTime: data.end_time,
        serviceId: data.service_id,
        maxCapacity: data.max_capacity,
        bookedCount: data.booked_count,
        isActive: data.is_active,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Fehler beim Erstellen des Zeitslots',
    };
  }
}

export async function deleteTimeSlot(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    memorySlots = memorySlots.filter((s) => s.id !== id);
    return { success: true };
  }

  try {
    const { data: slot, error: fetchErr } = await supabase
      .from('time_slots')
      .select('booked_count')
      .eq('id', id)
      .single();

    if (!fetchErr && slot && slot.booked_count > 0) {
      return {
        success: false,
        error: `Dieser Zeitslot kann nicht gelöscht werden, da bereits ${slot.booked_count} Kinder gebucht sind. Deaktiviere den Slot stattdessen.`,
      };
    }

    const { error } = await supabase.from('time_slots').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Fehler beim Löschen des Zeitslots',
    };
  }
}

export async function initializeDefaultSlotsForDate(
  date: string
): Promise<{ success: boolean; slots?: AdminTimeSlot[]; error?: string }> {
  const defaultSlotsDef = [
    { start: '10:00', end: '12:00', cap: 20 },
    { start: '12:30', end: '14:30', cap: 20 },
    { start: '15:00', end: '17:00', cap: 20 },
    { start: '17:30', end: '19:30', cap: 20 },
  ];

  if (!isSupabaseConfigured) {
    const created: AdminTimeSlot[] = defaultSlotsDef.map((def, idx) => ({
      id: `slot-gen-${date}-${idx}`,
      date,
      startTime: def.start,
      endTime: def.end,
      serviceId: 'einzelbesuch',
      maxCapacity: def.cap,
      bookedCount: 0,
      isActive: true,
    }));
    memorySlots.push(...created);
    return { success: true, slots: created };
  }

  try {
    const rows = defaultSlotsDef.map((def) => ({
      date,
      start_time: def.start,
      end_time: def.end,
      service_id: 'einzelbesuch',
      max_capacity: def.cap,
      booked_count: 0,
      is_active: true,
    }));

    const { data, error } = await supabase
      .from('time_slots')
      .upsert(rows, { onConflict: 'date,start_time,service_id' })
      .select();

    if (error) return { success: false, error: error.message };

    const mapped: AdminTimeSlot[] = (data || []).map((r) => ({
      id: r.id,
      date: r.date,
      startTime: r.start_time,
      endTime: r.end_time,
      serviceId: r.service_id,
      maxCapacity: r.max_capacity,
      bookedCount: r.booked_count,
      isActive: r.is_active,
    }));

    return { success: true, slots: mapped };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Fehler beim Initialisieren der Standard-Slots',
    };
  }
}

export async function bulkToggleSlotsActive(
  date: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    memorySlots = memorySlots.map((s) => (s.date === date ? { ...s, isActive } : s));
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('time_slots')
      .update({ is_active: isActive })
      .eq('date', date);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Fehler beim Aktualisieren der Slots',
    };
  }
}

// ==============================================================================
// 5. SITE ANNOUNCEMENTS API
// ==============================================================================
let memoryAnnouncements: AdminAnnouncement[] = [
  {
    id: 'ann-1',
    message: 'Herbstferien-Aktion: Ab sofort haben wir auch montags bereits ab 09:30 Uhr geöffnet!',
    type: 'info',
    linkUrl: '/services',
    linkText: 'Mehr erfahren',
    isActive: true,
    startsAt: null,
    endsAt: null,
    createdAt: '2026-10-06T10:00:00Z',
  },
];

export async function fetchAdminAnnouncements(): Promise<AdminAnnouncement[]> {
  if (!isSupabaseConfigured) {
    return memoryAnnouncements;
  }

  try {
    const { data, error } = await supabase
      .from('site_announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return memoryAnnouncements;

    return data.map((row: any) => ({
      id: row.id,
      message: row.message,
      type: row.type,
      linkUrl: row.link_url,
      linkText: row.link_text,
      isActive: row.is_active,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.error('Error fetching announcements:', err);
    return memoryAnnouncements;
  }
}

export async function saveAdminAnnouncement(
  announcement: Partial<AdminAnnouncement> & { id?: string }
): Promise<{ success: boolean; error?: string; item?: AdminAnnouncement }> {
  if (announcement.linkUrl !== undefined && !validateSafeUrl(announcement.linkUrl)) {
    return {
      success: false,
      error: 'Ungültige Link-URL: Unsichere URL-Schemata (z.B. javascript:, data:) sind nicht erlaubt.',
    };
  }

  if (!isSupabaseConfigured) {
    if (announcement.id) {
      memoryAnnouncements = memoryAnnouncements.map((a) =>
        a.id === announcement.id ? ({ ...a, ...announcement } as AdminAnnouncement) : a
      );
      const updated = memoryAnnouncements.find((a) => a.id === announcement.id);
      return { success: true, item: updated };
    } else {
      const newAnn: AdminAnnouncement = {
        id: `ann-${Date.now()}`,
        message: announcement.message || '',
        type: announcement.type || 'info',
        linkUrl: announcement.linkUrl || null,
        linkText: announcement.linkText || null,
        isActive: announcement.isActive ?? true,
        startsAt: announcement.startsAt || null,
        endsAt: announcement.endsAt || null,
        createdAt: new Date().toISOString(),
      };
      memoryAnnouncements = [newAnn, ...memoryAnnouncements];
      return { success: true, item: newAnn };
    }
  }

  try {
    const payload: Record<string, any> = {
      message: announcement.message,
      type: announcement.type || 'info',
      link_url: announcement.linkUrl || null,
      link_text: announcement.linkText || null,
      is_active: announcement.isActive ?? true,
      starts_at: announcement.startsAt || null,
      ends_at: announcement.endsAt || null,
    };

    if (announcement.id) {
      const { data, error } = await supabase
        .from('site_announcements')
        .update(payload)
        .eq('id', announcement.id)
        .select('*')
        .single();

      if (error) return { success: false, error: error.message };
      return {
        success: true,
        item: {
          id: data.id,
          message: data.message,
          type: data.type,
          linkUrl: data.link_url,
          linkText: data.link_text,
          isActive: data.is_active,
          startsAt: data.starts_at,
          endsAt: data.ends_at,
          createdAt: data.created_at,
        },
      };
    } else {
      const { data, error } = await supabase
        .from('site_announcements')
        .insert([payload])
        .select('*')
        .single();

      if (error) return { success: false, error: error.message };
      return {
        success: true,
        item: {
          id: data.id,
          message: data.message,
          type: data.type,
          linkUrl: data.link_url,
          linkText: data.link_text,
          isActive: data.is_active,
          startsAt: data.starts_at,
          endsAt: data.ends_at,
          createdAt: data.created_at,
        },
      };
    }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Fehler beim Speichern der Ankündigung' };
  }
}

export async function deleteAdminAnnouncement(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    memoryAnnouncements = memoryAnnouncements.filter((a) => a.id !== id);
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('site_announcements')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Fehler beim Löschen der Ankündigung' };
  }
}

// ==============================================================================
// 6. FAQS API
// ==============================================================================
let memoryFaqs: AdminFaq[] = [
  {
    id: 'faq-1',
    category: 'Besuch & Regeln',
    question: 'Gilt im Haven Kids Café eine Sockenpflicht?',
    answer: 'Ja, aus hygienischen und Sicherheitsgründen gilt im gesamten Spielbereich sowie im Salzraum eine strikte Sockenpflicht für alle Kinder und Erwachsenen. Wir empfehlen rutschfeste Stoppersocken für die Kinder.',
    displayOrder: 1,
    isPublished: true,
    createdAt: '2026-10-06T10:00:00Z',
  },
  {
    id: 'faq-2',
    category: 'Besuch & Regeln',
    question: 'Für welches Alter ist das Café geeignet?',
    answer: 'Unser pädagogisches Konzept und unsere Spielbereiche sind optimal auf Babys, Kleinkinder und Kinder im Alter von 0 bis 8 Jahren ausgerichtet.',
    displayOrder: 2,
    isPublished: true,
    createdAt: '2026-10-06T10:00:00Z',
  },
  {
    id: 'faq-3',
    category: 'Preise & Buchung',
    question: 'Müssen Erwachsene Eintritt bezahlen?',
    answer: 'Nein! Pro gebuchtem Kind haben bis zu zwei erwachsene Begleitpersonen freien Eintritt in unser Café und zu den Sitzbereichen.',
    displayOrder: 3,
    isPublished: true,
    createdAt: '2026-10-06T10:00:00Z',
  },
  {
    id: 'faq-4',
    category: 'Preise & Buchung',
    question: 'Wie lauten die Stornierungsbedingungen?',
    answer: 'Einzelbesuche können bis zu 2 Stunden vor Beginn kostenfrei über den Link in der Bestätigungs-E-Mail storniert werden. Für Kindergeburtstage gilt wegen der exklusiven Vorbereitung eine Frist von mindestens 48 Stunden vor Beginn.',
    displayOrder: 4,
    isPublished: true,
    createdAt: '2026-10-06T10:00:00Z',
  },
  {
    id: 'faq-5',
    category: 'Salzraum',
    question: 'Was ist der Salzraum und wie buche ich ihn?',
    answer: 'Unser Salzraum ist eine entspannende Ruheoase mit Trockensalz-Mikroklima und feinem Steinsalz zum Spielen. Er kann als 45-minütiges Add-on für 5 € pro Kind zu jedem Besuch hinzugebucht werden (max. 8 Kinder je Sitzung).',
    displayOrder: 5,
    isPublished: true,
    createdAt: '2026-10-06T10:00:00Z',
  },
  {
    id: 'faq-6',
    category: 'Sicherheit & Hygiene',
    question: 'Wer hat die Aufsichtspflicht während des Besuchs?',
    answer: 'Die Aufsichtspflicht verbleibt zu jedem Zeitpunkt bei den begleitenden Eltern oder Erziehungsberechtigten. Unser Café ist so gestaltet, dass du von den Tischen aus den gesamten Spielbereich gut im Blick hast.',
    displayOrder: 6,
    isPublished: true,
    createdAt: '2026-10-06T10:00:00Z',
  },
];

export async function fetchAdminFaqs(): Promise<AdminFaq[]> {
  if (!isSupabaseConfigured) {
    return memoryFaqs;
  }

  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data) return memoryFaqs;

    return data.map((row: any) => ({
      id: row.id,
      category: row.category,
      question: row.question,
      answer: row.answer,
      displayOrder: row.display_order,
      isPublished: row.is_published,
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.error('Error fetching FAQs:', err);
    return memoryFaqs;
  }
}

export async function saveAdminFaq(
  faq: Partial<AdminFaq> & { id?: string }
): Promise<{ success: boolean; error?: string; item?: AdminFaq }> {
  if (!isSupabaseConfigured) {
    if (faq.id) {
      memoryFaqs = memoryFaqs.map((f) =>
        f.id === faq.id ? ({ ...f, ...faq } as AdminFaq) : f
      );
      const updated = memoryFaqs.find((f) => f.id === faq.id);
      return { success: true, item: updated };
    } else {
      const newFaq: AdminFaq = {
        id: `faq-${Date.now()}`,
        category: faq.category || 'Allgemein',
        question: faq.question || '',
        answer: faq.answer || '',
        displayOrder: faq.displayOrder ?? (memoryFaqs.length + 1),
        isPublished: faq.isPublished ?? true,
        createdAt: new Date().toISOString(),
      };
      memoryFaqs = [...memoryFaqs, newFaq].sort((a, b) => a.displayOrder - b.displayOrder);
      return { success: true, item: newFaq };
    }
  }

  try {
    const payload: Record<string, any> = {
      category: faq.category || 'Allgemein',
      question: faq.question,
      answer: faq.answer,
      display_order: faq.displayOrder ?? 0,
      is_published: faq.isPublished ?? true,
    };

    if (faq.id) {
      const { data, error } = await supabase
        .from('faqs')
        .update(payload)
        .eq('id', faq.id)
        .select('*')
        .single();

      if (error) return { success: false, error: error.message };
      return {
        success: true,
        item: {
          id: data.id,
          category: data.category,
          question: data.question,
          answer: data.answer,
          displayOrder: data.display_order,
          isPublished: data.is_published,
          createdAt: data.created_at,
        },
      };
    } else {
      const { data, error } = await supabase
        .from('faqs')
        .insert([payload])
        .select('*')
        .single();

      if (error) return { success: false, error: error.message };
      return {
        success: true,
        item: {
          id: data.id,
          category: data.category,
          question: data.question,
          answer: data.answer,
          displayOrder: data.display_order,
          isPublished: data.is_published,
          createdAt: data.created_at,
        },
      };
    }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Fehler beim Speichern der FAQ' };
  }
}

export async function deleteAdminFaq(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    memoryFaqs = memoryFaqs.filter((f) => f.id !== id);
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Fehler beim Löschen der FAQ' };
  }
}

// ==============================================================================
// 7. EVENT INQUIRIES API (INTERNAL OPERATIONS INBOX)
// ==============================================================================
let memoryInquiries: AdminEventInquiry[] = [
  {
    id: 'inq-1',
    name: 'Sarah Meyer',
    email: 'sarah.meyer@example.de',
    phone: '+49 172 3456789',
    eventType: 'birthday',
    targetDate: '2026-11-15',
    childrenCount: 10,
    adultsCount: 6,
    message: 'Hallo, wir möchten den 4. Geburtstag unserer Tochter feiern. Ist der Festtisch für diesen Termin verfügbar?',
    status: 'new',
    adminNotes: null,
    createdAt: '2026-10-07T09:15:00Z',
    updatedAt: '2026-10-07T09:15:00Z',
  },
  {
    id: 'inq-2',
    name: 'Kita Sonnenschein (Hr. Lehmann)',
    email: 'leitung@kita-sonnenschein-berlin.de',
    phone: '+49 30 98765432',
    eventType: 'group_event',
    targetDate: '2026-11-20',
    childrenCount: 14,
    adultsCount: 3,
    message: 'Wir planen einen Vormittagsausflug mit unserer Vorschulgruppe von 10:00 bis 12:30 Uhr. Bieten Sie Sonderkonditionen für Kitas an?',
    status: 'contacted',
    adminNotes: 'Telefonisch kontaktiert am 07.10. Angebot per E-Mail versandt.',
    createdAt: '2026-10-06T14:30:00Z',
    updatedAt: '2026-10-07T11:00:00Z',
  },
  {
    id: 'inq-3',
    name: 'Thomas Becker',
    email: 't.becker@beispiel.de',
    phone: '+49 160 1122334',
    eventType: 'group_party',
    targetDate: '2026-11-28',
    childrenCount: 12,
    adultsCount: 8,
    message: 'Private Familienfeier mit Vorbereitung eines Kaffeetischs. Ist das Mitbringen einer eigenen Torte gestattet?',
    status: 'reserved',
    adminNotes: 'Termin reserviert. Eigene Torte mitgebracht (Korkgeld 15 € vereinbart).',
    createdAt: '2026-10-05T16:45:00Z',
    updatedAt: '2026-10-06T10:20:00Z',
  },
];

export async function fetchAdminEventInquiries(): Promise<AdminEventInquiry[]> {
  if (!isSupabaseConfigured) {
    return memoryInquiries;
  }

  try {
    const { data, error } = await supabase
      .from('event_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return memoryInquiries;

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      eventType: row.event_type,
      targetDate: row.target_date,
      childrenCount: row.children_count,
      adultsCount: row.adults_count,
      message: row.message,
      status: row.status as InquiryStatus,
      adminNotes: row.admin_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (err) {
    console.error('Error fetching event inquiries:', err);
    return memoryInquiries;
  }
}

export async function updateInquiryStatus(
  id: string,
  status: InquiryStatus,
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    memoryInquiries = memoryInquiries.map((inq) =>
      inq.id === id
        ? {
            ...inq,
            status,
            adminNotes: adminNotes !== undefined ? adminNotes : inq.adminNotes,
            updatedAt: new Date().toISOString(),
          }
        : inq
    );
    return { success: true };
  }

  try {
    const payload: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (adminNotes !== undefined) payload.admin_notes = adminNotes;

    const { error } = await supabase
      .from('event_inquiries')
      .update(payload)
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Fehler beim Aktualisieren der Anfrage' };
  }
}

export async function deleteInquiry(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    memoryInquiries = memoryInquiries.filter((inq) => inq.id !== id);
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('event_inquiries')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Fehler beim Löschen der Anfrage' };
  }
}

// ==============================================================================
// 8. GALLERY & MEDIA STORAGE API (BATCH C)
// ==============================================================================
export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateGalleryImage(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'Keine Datei ausgewählt.' };
  }

  // 1. Reject suspicious filenames
  const rawName = file.name;
  if (/[\/\\]|\.\.|\x00/.test(rawName)) {
    return { isValid: false, error: 'Verdächtiger Dateiname festgestellt (Pfadzeichen nicht gestattet).' };
  }

  // 2. Extension verification
  const parts = rawName.split('.');
  if (parts.length < 2) {
    return { isValid: false, error: 'Die Datei hat keine Dateiendung.' };
  }
  const ext = parts.pop()?.toLowerCase();
  if (!ext || !ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    return {
      isValid: false,
      error: `Dateiendung ".${ext}" ist nicht erlaubt. Zulässig sind ausschließlich: JPG, JPEG, PNG, WEBP.`,
    };
  }

  // 3. Reject double extensions with executable/script parts
  const remainingName = parts.join('.');
  if (/\.(php|exe|sh|bat|cmd|js|html|py|pl|cgi|svg)$/i.test(remainingName)) {
    return { isValid: false, error: 'Verdächtige Doppel-Dateiendung festgestellt.' };
  }

  // 4. Strict MIME type check
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `MIME-Typ "${file.type}" unzulässig. Erlaubt sind: image/jpeg, image/png, image/webp.`,
    };
  }

  // 5. Max file size check (5 MB)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `Die Datei ist mit ${sizeMb} MB zu groß. Maximal zulässige Dateigröße: 5 MB.`,
    };
  }

  return { isValid: true };
}

export function generateSafeStoragePath(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  return `gallery/${timestamp}-${randomSuffix}.${ext}`;
}

export async function uploadGalleryImage(
  file: File
): Promise<{ success: boolean; url?: string; storagePath?: string; error?: string }> {
  const validation = validateGalleryImage(file);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  const storagePath = generateSafeStoragePath(file.name);

  if (!isSupabaseConfigured) {
    // In local development, create a persistent object URL
    const objectUrl = URL.createObjectURL(file);
    return { success: true, url: objectUrl, storagePath };
  }

  try {
    const { data, error } = await supabase.storage
      .from('gallery-media')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return { success: false, error: `Upload-Fehler: ${error.message}` };
    }

    const { data: publicUrlData } = supabase.storage
      .from('gallery-media')
      .getPublicUrl(data.path);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      storagePath: data.path,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unerwarteter Fehler beim Hochladen',
    };
  }
}

let memoryGalleryItems: AdminGalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Pädagogischer Spielbereich',
    category: 'Spielbereich',
    description: 'Hochwertiges Holzspielzeug, sichere Klettermodule und Motorikstationen.',
    imageUrl: '/assets/spielbereich.jpg',
    storagePath: null,
    displayOrder: 1,
    isVisible: true,
    createdAt: '2026-10-06T10:00:00Z',
    updatedAt: '2026-10-06T10:00:00Z',
  },
  {
    id: 'gal-2',
    title: 'Eltern-Café & Specialty Coffee',
    category: 'Café',
    description: 'Frisch zubereitete Kaffeespezialitäten, Bio-Tees und gesunde Kindersnacks.',
    imageUrl: '/assets/artisan-cafe.jpg',
    storagePath: null,
    displayOrder: 2,
    isVisible: true,
    createdAt: '2026-10-06T10:00:00Z',
    updatedAt: '2026-10-06T10:00:00Z',
  },
  {
    id: 'gal-3',
    title: 'Kreatives Entdecken',
    category: 'Spielbereich',
    description: 'Liebevoll eingerichtete Spielinseln für fantasievolles und freies Spielen.',
    imageUrl: '/assets/gallery-3.jpg',
    storagePath: null,
    displayOrder: 3,
    isVisible: true,
    createdAt: '2026-10-06T10:00:00Z',
    updatedAt: '2026-10-06T10:00:00Z',
  },
  {
    id: 'gal-4',
    title: 'Helle Wohlfühl-Atmosphäre',
    category: 'Café',
    description: 'Offenes Raumkonzept mit uneingeschränkter Sicht auf den Spielbereich.',
    imageUrl: '/assets/hero-interior.jpg',
    storagePath: null,
    displayOrder: 4,
    isVisible: true,
    createdAt: '2026-10-06T10:00:00Z',
    updatedAt: '2026-10-06T10:00:00Z',
  },
  {
    id: 'gal-5',
    title: 'Geburtstags-Festtisch',
    category: 'Events',
    description: 'Festlich dekorierter Tisch mit bunten Details und Kindergeschirr.',
    imageUrl: '/assets/geburtstage.jpg',
    storagePath: null,
    displayOrder: 5,
    isVisible: true,
    createdAt: '2026-10-06T10:00:00Z',
    updatedAt: '2026-10-06T10:00:00Z',
  },
  {
    id: 'gal-6',
    title: 'Salzraum-Ruheoase',
    category: 'Salzraum',
    description: 'Entspannendes Mikroklima mit feinem Trockensalz und kinderfreundlichen Spielzeugen.',
    imageUrl: '/assets/salt-sanctuary.jpg',
    storagePath: null,
    displayOrder: 6,
    isVisible: true,
    createdAt: '2026-10-06T10:00:00Z',
    updatedAt: '2026-10-06T10:00:00Z',
  },
];

export async function fetchAdminGalleryItems(): Promise<AdminGalleryItem[]> {
  if (!isSupabaseConfigured) {
    return memoryGalleryItems.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  try {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return memoryGalleryItems;
    }

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      description: row.description,
      imageUrl: row.image_url,
      storagePath: row.storage_path,
      displayOrder: row.display_order,
      isVisible: row.is_visible,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (err) {
    console.error('Error fetching gallery items:', err);
    return memoryGalleryItems;
  }
}

export async function saveAdminGalleryItem(
  item: Partial<AdminGalleryItem> & { id?: string }
): Promise<{ success: boolean; error?: string; item?: AdminGalleryItem }> {
  if (!isSupabaseConfigured) {
    if (item.id) {
      memoryGalleryItems = memoryGalleryItems.map((g) =>
        g.id === item.id
          ? ({
              ...g,
              ...item,
              updatedAt: new Date().toISOString(),
            } as AdminGalleryItem)
          : g
      );
      const updated = memoryGalleryItems.find((g) => g.id === item.id);
      return { success: true, item: updated };
    } else {
      const newItem: AdminGalleryItem = {
        id: `gal-${Date.now()}`,
        title: item.title || 'Neues Foto',
        category: item.category || 'Spielbereich',
        description: item.description || null,
        imageUrl: item.imageUrl || '/assets/spielbereich.jpg',
        storagePath: item.storagePath || null,
        displayOrder: item.displayOrder ?? (memoryGalleryItems.length + 1),
        isVisible: item.isVisible ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryGalleryItems = [...memoryGalleryItems, newItem].sort((a, b) => a.displayOrder - b.displayOrder);
      return { success: true, item: newItem };
    }
  }

  try {
    const payload: Record<string, any> = {
      title: item.title,
      category: item.category || 'Spielbereich',
      description: item.description || null,
      image_url: item.imageUrl,
      storage_path: item.storagePath || null,
      display_order: item.displayOrder ?? 0,
      is_visible: item.isVisible ?? true,
    };

    if (item.id) {
      const { data, error } = await supabase
        .from('gallery_items')
        .update(payload)
        .eq('id', item.id)
        .select('*')
        .single();

      if (error) return { success: false, error: error.message };
      return {
        success: true,
        item: {
          id: data.id,
          title: data.title,
          category: data.category,
          description: data.description,
          imageUrl: data.image_url,
          storagePath: data.storage_path,
          displayOrder: data.display_order,
          isVisible: data.is_visible,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      };
    } else {
      const { data, error } = await supabase
        .from('gallery_items')
        .insert([payload])
        .select('*')
        .single();

      if (error) return { success: false, error: error.message };
      return {
        success: true,
        item: {
          id: data.id,
          title: data.title,
          category: data.category,
          description: data.description,
          imageUrl: data.image_url,
          storagePath: data.storage_path,
          displayOrder: data.display_order,
          isVisible: data.is_visible,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      };
    }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Fehler beim Speichern des Galerie-Eintrags' };
  }
}

export async function deleteAdminGalleryItem(id: string): Promise<{ success: boolean; error?: string }> {
  let targetStoragePath: string | null = null;

  if (!isSupabaseConfigured) {
    const item = memoryGalleryItems.find((g) => g.id === id);
    if (item?.storagePath) targetStoragePath = item.storagePath;
    memoryGalleryItems = memoryGalleryItems.filter((g) => g.id !== id);
    return { success: true };
  }

  try {
    const { data: itemData } = await supabase
      .from('gallery_items')
      .select('storage_path')
      .eq('id', id)
      .single();

    if (itemData?.storage_path) {
      targetStoragePath = itemData.storage_path;
    }

    const { error: dbError } = await supabase
      .from('gallery_items')
      .delete()
      .eq('id', id);

    if (dbError) return { success: false, error: dbError.message };

    // Clean up associated file in storage bucket if present
    if (targetStoragePath) {
      await supabase.storage.from('gallery-media').remove([targetStoragePath]);
    }

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Fehler beim Löschen des Galerie-Bildes' };
  }
}


