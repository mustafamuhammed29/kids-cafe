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
  cleaningBuffer: string;
}

export interface BookingSubmissionResult {
  success: boolean;
  referenceCode: string;
  cancellationToken?: string;
  bookingId?: string;
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

/**
 * Fetch available time slots for a given date and service
 */
export async function getAvailableTimeSlots(
  date: string,
  serviceId: string
): Promise<SlotAvailability[]> {
  const maxCap = serviceId.includes('salt') ? 8 : 20;

  if (!isSupabaseConfigured) {
    return DEFAULT_TIME_SLOTS.map((slot) => {
      const isWeekend = new Date(date).getDay() === 0 || new Date(date).getDay() === 6;
      const booked = isWeekend ? Math.min(maxCap - 2, 8) : slot.bookedCount;
      const avail = Math.max(0, maxCap - booked);

      return {
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        maxCapacity: maxCap,
        bookedCount: booked,
        availableCount: avail,
        isAvailable: avail > 0,
        cleaningBuffer: slot.cleaningBuffer,
      };
    });
  }

  try {
    const { data, error } = await supabase
      .from('time_slots')
      .select('id, start_time, end_time, max_capacity, booked_count, is_active')
      .eq('date', date)
      .eq('service_id', serviceId)
      .eq('is_active', true);

    if (error) throw error;

    const slotMap = new Map((data || []).map((s) => [s.start_time, s]));

    return DEFAULT_TIME_SLOTS.map((slot) => {
      const record = slotMap.get(slot.startTime);
      const booked = record ? record.booked_count : 0;
      const cap = record ? record.max_capacity : maxCap;
      const avail = Math.max(0, cap - booked);

      return {
        id: record?.id || slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        maxCapacity: cap,
        bookedCount: booked,
        availableCount: avail,
        isAvailable: avail > 0,
        cleaningBuffer: slot.cleaningBuffer,
      };
    });
  } catch {
    return DEFAULT_TIME_SLOTS.map((slot) => ({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      maxCapacity: maxCap,
      bookedCount: slot.bookedCount,
      availableCount: Math.max(0, maxCap - slot.bookedCount),
      isAvailable: true,
      cleaningBuffer: slot.cleaningBuffer,
    }));
  }
}

/**
 * Submit a booking atomically through server-validated RPC
 * No raw personal data logged to console.
 * No client-controlled price vulnerability.
 * No direct table INSERT fallback.
 */
export async function submitBooking(
  formData: BookingFormData,
  service: ServiceItem,
  slot: TimeSlot
): Promise<BookingSubmissionResult> {
  const generatedRef = `HKC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

  if (!isSupabaseConfigured) {
    return {
      success: true,
      referenceCode: generatedRef,
    };
  }

  try {
    const { data, error } = await supabase.rpc('create_booking_atomic', {
      p_customer_name: formData.parentName.trim(),
      p_customer_email: formData.email.trim(),
      p_customer_phone: formData.phone.trim(),
      p_date: formData.date,
      p_time_slot: `${slot.startTime} - ${slot.endTime}`,
      p_service_id: service.slug || service.id,
      p_num_children: formData.childrenCount,
      p_num_adults: formData.adultsCount,
      p_include_salt_room: formData.includeSaltRoomAddon,
      p_notes: formData.specialRequests ? formData.specialRequests.trim() : undefined,
    });

    if (error) {
      return {
        success: false,
        referenceCode: '',
        error: error.message || 'Die Reservierung konnte nicht verarbeitet werden. Bitte prüfe deine Angaben.',
      };
    }

    const rpcResult = data as unknown as {
      success: boolean;
      booking_id: string;
      reference_code: string;
      cancellation_token?: string;
      error_message?: string;
    };

    if (!rpcResult.success) {
      return {
        success: false,
        referenceCode: '',
        error: rpcResult.error_message || 'Dieser Zeitslot ist leider bereits ausgebucht.',
      };
    }

    return {
      success: true,
      referenceCode: rpcResult.reference_code,
      cancellationToken: rpcResult.cancellation_token,
      bookingId: rpcResult.booking_id,
    };
  } catch {
    return {
      success: false,
      referenceCode: '',
      error: 'Unerwarteter Verbindungsfehler bei der Reservierung. Bitte versuche es erneut.',
    };
  }
}
