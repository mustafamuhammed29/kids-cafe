import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BUSINESS_INFO, FAQS, SERVICES } from '../data/mockData';
import type { ServiceItem } from '../types/booking';

export interface BusinessSettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  phoneClean: string;
  email: string;
  whatsappUrl: string;
  instagramUrl?: string;
  mapsUrl?: string;
  logoUrl?: string;
  faviconUrl?: string;
  footerNotice?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImageUrl?: string;
  openingHours: Array<{ days: string; time: string }>;
}

export interface SiteAnnouncement {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  linkUrl?: string;
  linkText?: string;
  isActive: boolean;
}

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  displayOrder?: number;
}

export interface GalleryItem {
  id: number | string;
  title: string;
  category: string;
  desc: string;
  url: string;
}

export interface BlockedDate {
  date: string;
  reason?: string;
}

/**
 * URL Sanitization & Protocol Whitelist
 * Strictly prevents unsafe schemes (javascript:, data:, vbscript:)
 * Only allows relative routes (/...) or https://, http://, mailto:, tel:
 */
export function sanitizeSafeUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Explicitly reject dangerous pseudoprotocols case-insensitively
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    return null;
  }

  // Internal relative paths and anchor links are safe
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (['https:', 'http:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
      return trimmed;
    }
  } catch {
    return null;
  }

  return null;
}

export interface EventInquiryPayload {
  name: string;
  email: string;
  phone?: string;
  eventType: 'general' | 'birthday' | 'group_party' | 'group_event' | 'corporate';
  targetDate?: string;
  childrenCount?: number;
  adultsCount?: number;
  message: string;
}

/**
 * Fallback business settings derived from mockData
 */
const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  name: BUSINESS_INFO.name,
  tagline: BUSINESS_INFO.tagline,
  address: BUSINESS_INFO.address,
  phone: BUSINESS_INFO.phone,
  phoneClean: BUSINESS_INFO.phoneClean,
  email: BUSINESS_INFO.email,
  whatsappUrl: BUSINESS_INFO.whatsappUrl,
  instagramUrl: 'https://instagram.com/havenkidscafe',
  mapsUrl: `https://maps.google.com/?q=${encodeURIComponent(BUSINESS_INFO.address)}`,
  logoUrl: '/favicon.svg',
  faviconUrl: '/favicon.svg',
  footerNotice: 'Haven Kids Café Berlin – Der Wohlfühlort für freies Entfalten in sicherer Umgebung.',
  seoTitle: 'Haven Kids Café | Spielcafé & Salzraum in Berlin',
  seoDescription: 'Sicherer Spielbereich für Kinder 0-8 Jahre. Entspannung für Eltern mit Barista-Kaffee & sanftem Salzraum in Berlin. Jetzt Termin buchen!',
  ogImageUrl: '/assets/spielbereich.jpg',
  openingHours: BUSINESS_INFO.hours,
};

/**
 * Fallback gallery items
 */
const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    url: '/assets/spielbereich.jpg',
    title: 'Pädagogischer Spielbereich',
    category: 'Spielbereich',
    desc: 'Hochwertiges Holzspielzeug, sichere Klettermodule und Motorikstationen.',
  },
  {
    id: 2,
    url: '/assets/artisan-cafe.jpg',
    title: 'Eltern-Café & Specialty Coffee',
    category: 'Café',
    desc: 'Frisch zubereitete Kaffeespezialitäten, Bio-Tees und gesunde Kindersnacks.',
  },
  {
    id: 3,
    url: '/assets/gallery-3.jpg',
    title: 'Kreatives Entdecken',
    category: 'Spielbereich',
    desc: 'Liebevoll eingerichtete Spielinseln für fantasievolles und freies Spielen.',
  },
  {
    id: 4,
    url: '/assets/hero-interior.jpg',
    title: 'Helle Wohlfühl-Atmosphäre',
    category: 'Café',
    desc: 'Offenes Raumkonzept mit uneingeschränkter Sicht auf den Spielbereich.',
  },
  {
    id: 5,
    url: '/assets/geburtstage.jpg',
    title: 'Geburtstags-Festtisch',
    category: 'Events',
    desc: 'Festlich dekorierter Tisch mit bunten Details und Kindergeschirr.',
  },
  {
    id: 6,
    url: '/assets/salt-sanctuary.jpg',
    title: 'Salzraum-Ruheoase',
    category: 'Salzraum',
    desc: 'Entspannendes Mikroklima mit feinem Trockensalz und kinderfreundlichen Spielzeugen.',
  },
];

/**
 * 1. Fetch dynamic business settings (with fallback to DEFAULT_BUSINESS_SETTINGS)
 */
export async function getBusinessSettings(): Promise<BusinessSettings> {
  if (!isSupabaseConfigured) {
    return DEFAULT_BUSINESS_SETTINGS;
  }

  try {
    const { data, error } = await supabase
      .from('business_settings')
      .select('key, value');

    if (error || !data || data.length === 0) {
      return DEFAULT_BUSINESS_SETTINGS;
    }

    const map = new Map(data.map((item) => [item.key, item.value]));

    return {
      name: (map.get('name') as string) || DEFAULT_BUSINESS_SETTINGS.name,
      tagline: (map.get('tagline') as string) || DEFAULT_BUSINESS_SETTINGS.tagline,
      address: (map.get('address') as string) || DEFAULT_BUSINESS_SETTINGS.address,
      phone: (map.get('phone') as string) || DEFAULT_BUSINESS_SETTINGS.phone,
      phoneClean: ((map.get('phone') as string)?.replace(/\s+/g, '')) || DEFAULT_BUSINESS_SETTINGS.phoneClean,
      email: (map.get('email') as string) || DEFAULT_BUSINESS_SETTINGS.email,
      whatsappUrl: sanitizeSafeUrl(map.get('whatsapp_url') as string) || DEFAULT_BUSINESS_SETTINGS.whatsappUrl,
      instagramUrl: sanitizeSafeUrl(map.get('instagram_url') as string) || DEFAULT_BUSINESS_SETTINGS.instagramUrl,
      mapsUrl: sanitizeSafeUrl(map.get('maps_url') as string) || DEFAULT_BUSINESS_SETTINGS.mapsUrl,
      logoUrl: sanitizeSafeUrl(map.get('logo_url') as string) || DEFAULT_BUSINESS_SETTINGS.logoUrl,
      faviconUrl: sanitizeSafeUrl(map.get('favicon_url') as string) || DEFAULT_BUSINESS_SETTINGS.faviconUrl,
      footerNotice: (map.get('footer_notice') as string) || DEFAULT_BUSINESS_SETTINGS.footerNotice,
      seoTitle: (map.get('seo_title') as string) || DEFAULT_BUSINESS_SETTINGS.seoTitle,
      seoDescription: (map.get('seo_description') as string) || DEFAULT_BUSINESS_SETTINGS.seoDescription,
      ogImageUrl: sanitizeSafeUrl(map.get('og_image_url') as string) || DEFAULT_BUSINESS_SETTINGS.ogImageUrl,
      openingHours: (map.get('opening_hours') as Array<{ days: string; time: string }>) || DEFAULT_BUSINESS_SETTINGS.openingHours,
    };
  } catch {
    return DEFAULT_BUSINESS_SETTINGS;
  }
}

/**
 * 2. Fetch active site announcement (or null)
 */
export async function getActiveAnnouncement(): Promise<SiteAnnouncement | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('site_announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    // Check validity window if defined
    const now = new Date();
    if (data.starts_at && new Date(data.starts_at) > now) return null;
    if (data.ends_at && new Date(data.ends_at) < now) return null;

    return {
      id: data.id,
      message: data.message,
      type: data.type || 'info',
      linkUrl: sanitizeSafeUrl(data.link_url) || undefined,
      linkText: data.link_text || undefined,
      isActive: true,
    };
  } catch {
    return null;
  }
}

/**
 * 3. Fetch published FAQs (with fallback to mockData FAQS)
 */
export async function getFaqItems(): Promise<FaqItem[]> {
  if (!isSupabaseConfigured) {
    return FAQS;
  }

  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return FAQS;
    }

    return data.map((f) => ({
      id: f.id,
      category: f.category,
      question: f.question,
      answer: f.answer,
      displayOrder: f.display_order,
    }));
  } catch {
    return FAQS;
  }
}

/**
 * 4. Fetch gallery items (with fallback to DEFAULT_GALLERY_ITEMS)
 */
export async function getGalleryItems(): Promise<GalleryItem[]> {
  if (!isSupabaseConfigured) {
    return DEFAULT_GALLERY_ITEMS;
  }

  try {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .eq('is_visible', true)
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_GALLERY_ITEMS;
    }

    return data.map((g) => ({
      id: g.id,
      title: g.title,
      category: g.category,
      desc: g.description || '',
      url: g.image_url,
    }));
  } catch {
    return DEFAULT_GALLERY_ITEMS;
  }
}

/**
 * 5. Fetch blocked dates
 */
export async function getBlockedDates(): Promise<string[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('blocked_dates')
      .select('date');

    if (error || !data) {
      return [];
    }

    return data.map((d) => d.date);
  } catch {
    return [];
  }
}

/**
 * 6. Submit event or contact inquiry
 */
export async function submitEventInquiry(
  payload: EventInquiryPayload
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    // Local dev mock success
    return { success: true };
  }

  try {
    const { error } = await supabase.from('event_inquiries').insert([
      {
        name: payload.name.trim(),
        email: payload.email.trim(),
        phone: payload.phone ? payload.phone.trim() : null,
        event_type: payload.eventType,
        target_date: payload.targetDate || null,
        children_count: payload.childrenCount || null,
        adults_count: payload.adultsCount || null,
        message: payload.message.trim(),
        status: 'new',
      },
    ]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Verbindungsfehler beim Absenden der Anfrage.' };
  }
}

/**
 * 7. Fetch active packages (with fallback to SERVICES)
 */
export async function getPackages(): Promise<ServiceItem[]> {
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

    return data.map((pkg) => {
      const mock = SERVICES.find((s) => s.slug === pkg.slug);
      const categoryType = pkg.slug === 'einzelbesuch'
        ? 'single'
        : (pkg.slug === '10er-block'
          ? 'pass_redemption'
          : (pkg.slug === 'kindergeburtstag'
            ? 'birthday'
            : (pkg.slug === 'gruppenfeier'
              ? 'group_party'
              : (pkg.slug === 'gruppen-events' ? 'group_event' : 'corporate_event'))));

      return {
        id: pkg.slug,
        slug: pkg.slug,
        name: pkg.name,
        subtitle: pkg.subtitle || mock?.subtitle,
        tagline: pkg.subtitle || mock?.tagline || '',
        category: categoryType,
        packageCategory: pkg.category,
        durationMinutes: mock?.durationMinutes || 120,
        priceType: pkg.price_type,
        basePrice: pkg.base_price !== null ? Number(pkg.base_price) : undefined,
        currency: pkg.currency || '€',
        priceLabel: pkg.base_price !== null ? `${pkg.base_price} €` : (mock?.priceLabel || 'Auf Anfrage'),
        description: pkg.description,
        features: Array.isArray(pkg.features) ? (pkg.features as string[]) : (mock?.features || []),
        ctaText: pkg.cta_text,
        ctaAction: pkg.cta_action,
        isVisible: pkg.is_visible,
        badge: mock?.badge,
        popular: mock?.popular,
      };
    });
  } catch {
    return SERVICES;
  }
}

