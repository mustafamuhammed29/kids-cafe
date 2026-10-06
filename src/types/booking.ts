export type ServiceType = 'single' | 'pass_redemption' | 'birthday' | 'salt_room_only';

export interface ServiceItem {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: ServiceType;
  durationMinutes: number;
  basePrice: number;
  priceLabel: string;
  description: string;
  includesAdults: number;
  maxChildren: number;
  badge?: string;
  popular?: boolean;
  features: string[];
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
