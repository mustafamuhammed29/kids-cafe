export type ServiceType = 'single' | 'pass_redemption' | 'birthday' | 'salt_room_only' | 'group_party' | 'group_event' | 'corporate_event';

export type PriceType = 'fixed' | 'on-request' | 'from';
export type CtaAction = 'book' | 'whatsapp' | 'contact-form';
export type PackageCategory = 'standard' | 'group' | 'corporate';

export interface ServiceItem {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  tagline: string;
  category: ServiceType;
  packageCategory: PackageCategory;
  durationMinutes: number;
  priceType: PriceType;
  basePrice?: number;
  currency?: string;
  priceLabel: string;
  description: string;
  includesAdults?: number;
  maxChildren?: number;
  badge?: string;
  popular?: boolean;
  features: string[];
  ctaText: string;
  ctaAction: CtaAction;
  isVisible: boolean;
}

export interface TimeSlot {
  id: string;
  startTime: string; // "10:00"
  endTime: string;   // "12:00"
  maxCapacity: number;
  bookedCount: number;
  cleaningBuffer: string; // "30 Min Reinigungspause"
}

export interface AddonItem {
  id: string;
  name: string;
  pricePerUnit: number;
  description: string;
  applicableService?: ServiceType;
  maxPerBooking?: number;
}

export interface BookingFormData {
  serviceId: string;
  date: string;
  timeSlotId: string;
  childrenCount: number;
  adultsCount: number;
  childrenAges: number[];
  includeSaltRoomAddon: boolean;
  parentName: string;
  email: string;
  phone: string;
  specialRequests?: string;
  marketingConsent: boolean;
  acceptedRules: boolean;
}

export interface BookingConfirmation {
  reference: string;
  service: ServiceItem;
  date: string;
  timeSlot: TimeSlot;
  childrenCount: number;
  adultsCount: number;
  childrenAges: number[];
  includeSaltRoomAddon: boolean;
  parentName: string;
  email: string;
  phone: string;
  specialRequests?: string;
  totalPrice: number;
  paymentMethod: 'pay_on_arrival';
  createdAt: string;
}
