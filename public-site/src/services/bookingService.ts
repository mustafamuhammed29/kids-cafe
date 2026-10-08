import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SERVICES, DEFAULT_TIME_SLOTS } from '../data/mockData';
import type { ServiceItem, TimeSlot, BookingFormData } from '../types/booking';

export interface SlotAvailability {
  id: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  bookedCount: number;
  availableCount: number;
  isAvailable: boolean;
  isActive: boolean;
  cleaningBuffer: string;
}

export interface BookingSubmissionResult {
  success: boolean;
  referenceCode: string;
  error?: string;
}

/**
 * Fetch active packages / services (from Supabase if configured, otherwise fallback to SERVICES)
 */
export async function getBookingPackages(): Promise<ServiceItem[]> {
  if (!isSupabaseConfigured) {
    return SERVICES;
  }

  try {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('is_visible', true)
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return SERVICES;
    }

    return data.map((pkg): ServiceItem => {
      const existing = SERVICES.find((s) => s.slug === pkg.slug);
      return {
        id: pkg.id,
        slug: pkg.slug,
        name: pkg.name,
        subtitle: pkg.subtitle || undefined,
        tagline: existing ? existing.tagline : pkg.name,
        category: existing ? existing.category : 'single',
        packageCategory: pkg.category,
        durationMinutes: existing ? existing.durationMinutes : 120,
        priceType: pkg.price_type,
        basePrice: pkg.base_price !== null ? Number(pkg.base_price) : undefined,
        currency: pkg.currency,
        priceLabel: pkg.price_type === 'on-request' ? 'Auf Anfrage' : `${pkg.base_price} €`,
        description: pkg.description,
        features: Array.isArray(pkg.features) ? (pkg.features as string[]) : [],
        ctaText: pkg.cta_text,
        ctaAction: pkg.cta_action,
        isVisible: pkg.is_visible,
        popular: existing?.popular,
      };
    });
  } catch {
    return SERVICES;
  }
}

export interface BlockedDateInfo {
  isBlocked: boolean;
  reason?: string;
}

/**
 * Check if a specific date is marked as blocked (Schließtag) by the admin
 */
export async function checkDateBlocked(date: string): Promise<BlockedDateInfo> {
  if (!isSupabaseConfigured || !date) {
    return { isBlocked: false };
  }

  try {
    const { data, error } = await supabase
      .from('blocked_dates')
      .select('date, reason')
      .eq('date', date)
      .maybeSingle();

    if (error) {
      console.warn('Error checking blocked date:', error.message);
      return { isBlocked: false };
    }

    if (data) {
      return {
        isBlocked: true,
        reason: data.reason || 'Schließtag / Betriebsruhe',
      };
    }

    return { isBlocked: false };
  } catch (err) {
    console.error('Exception checking blocked date:', err);
    return { isBlocked: false };
  }
}

/**
 * Fetch available time slots for a given date and service from Supabase
 */
export async function getAvailableTimeSlots(
  date: string,
  serviceSlugOrId: string
): Promise<SlotAvailability[]> {
  const isSaltRoom = serviceSlugOrId ? serviceSlugOrId.toLowerCase().includes('salt') : false;
  const defaultMaxCap = isSaltRoom ? 8 : 20;

  if (!isSupabaseConfigured) {
    return DEFAULT_TIME_SLOTS.map((slot) => {
      const avail = Math.max(0, defaultMaxCap - slot.bookedCount);
      return {
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        maxCapacity: defaultMaxCap,
        bookedCount: slot.bookedCount,
        availableCount: avail,
        isActive: true,
        isAvailable: avail > 0,
        cleaningBuffer: slot.cleaningBuffer,
      };
    });
  }

  try {
    // 1. Strictly check if the entire day is blocked by admin in blocked_dates table
    const { data: blockedRow, error: blockedErr } = await supabase
      .from('blocked_dates')
      .select('date, reason')
      .eq('date', date)
      .maybeSingle();

    if (!blockedErr && blockedRow) {
      // Entire day is closed / blocked! Return empty slots array
      return [];
    }

    // 2. Query customized time_slots for this date
    const { data, error } = await supabase
      .from('time_slots')
      .select('id, start_time, end_time, service_id, max_capacity, booked_count, is_active')
      .eq('date', date)
      .order('start_time', { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      // Prioritize service-specific match or default
      const slotMap = new Map<string, any>();
      for (const row of data) {
        if (!slotMap.has(row.start_time) || row.service_id === serviceSlugOrId) {
          slotMap.set(row.start_time, row);
        }
      }

      return Array.from(slotMap.values())
        .sort((a, b) => a.start_time.localeCompare(b.start_time))
        .map((row) => {
          const cap = Number(row.max_capacity) || defaultMaxCap;
          const booked = Number(row.booked_count) || 0;
          const isActive = row.is_active !== false;
          const avail = Math.max(0, cap - booked);

          return {
            id: row.id,
            startTime: row.start_time,
            endTime: row.end_time,
            maxCapacity: cap,
            bookedCount: booked,
            availableCount: avail,
            isActive,
            isAvailable: isActive && avail > 0,
            cleaningBuffer: '30 Min Reinigung & Belüftung',
          };
        });
    }

    // Default slots for fresh, unblocked dates
    return DEFAULT_TIME_SLOTS.map((slot) => ({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      maxCapacity: defaultMaxCap,
      bookedCount: 0,
      availableCount: defaultMaxCap,
      isActive: true,
      isAvailable: true,
      cleaningBuffer: slot.cleaningBuffer,
    }));
  } catch (err) {
    console.error('Error fetching available time slots:', err);
    return [];
  }
}

/**
 * Submit a booking atomically through Supabase Edge Function (create-booking)
 * Architectural flow:
 * Browser -> Edge Function (CORS + Turnstile + Rate Limit) -> create_booking_atomic -> Confirmation Email -> Safe Response
 * No raw personal data logged to console.
 * No client-controlled price vulnerability.
 * No direct table INSERT fallback.
 */
export async function submitBooking(
  formData: BookingFormData,
  service: ServiceItem,
  slot: TimeSlot,
  turnstileToken?: string | null
): Promise<BookingSubmissionResult> {
  const generatedRef = `HKC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

  if (!isSupabaseConfigured) {
    return {
      success: true,
      referenceCode: generatedRef,
    };
  }

  // Pre-validate that selected date is not in the past
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  if (formData.date < todayStr) {
    return {
      success: false,
      referenceCode: '',
      error: 'Buchungen in der Vergangenheit sind nicht möglich. Bitte wähle ein gültiges Besuchsdatum.',
    };
  }

  if (formData.date === todayStr) {
    const [h, m] = slot.startTime.split(':').map(Number);
    const slotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h || 0, m || 0);
    if (slotDate.getTime() <= now.getTime()) {
      return {
        success: false,
        referenceCode: '',
        error: 'Dieser Zeitslot liegt heute bereits in der Vergangenheit. Bitte wähle einen zukünftigen Zeitslot.',
      };
    }
  }

  // Pre-validate that selected date is not blocked by admin
  const blockedCheck = await checkDateBlocked(formData.date);
  if (blockedCheck.isBlocked) {
    return {
      success: false,
      referenceCode: '',
      error: `An diesem Datum hat das Haven Kids Café geschlossen (${blockedCheck.reason || 'Ruhetag/Schließtag'}). Bitte wähle ein anderes Datum.`,
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke('create-booking', {
      body: {
        parentName: formData.parentName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        date: formData.date,
        timeSlot: `${slot.startTime} - ${slot.endTime}`,
        serviceSlug: service.slug || service.id,
        childrenCount: formData.childrenCount,
        adultsCount: formData.adultsCount,
        includeSaltRoomAddon: formData.includeSaltRoomAddon,
        specialRequests: formData.specialRequests ? formData.specialRequests.trim() : null,
        turnstileToken: turnstileToken || null,
      },
    });

    if (error) {
      return {
        success: false,
        referenceCode: '',
        error: error.message || 'Die Reservierung konnte nicht verarbeitet werden. Bitte prüfe deine Angaben.',
      };
    }

    const result = data as {
      success: boolean;
      reference_code?: string;
      error?: string;
    };

    if (!result || !result.success) {
      return {
        success: false,
        referenceCode: '',
        error: result?.error || 'Dieser Zeitslot ist leider bereits ausgebucht.',
      };
    }

    return {
      success: true,
      referenceCode: result.reference_code || generatedRef,
    };
  } catch {
    return {
      success: false,
      referenceCode: '',
      error: 'Unerwarteter Verbindungsfehler bei der Reservierung. Bitte versuche es erneut.',
    };
  }
}
