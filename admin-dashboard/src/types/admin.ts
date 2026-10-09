export type StaffRole = 'owner' | 'admin' | 'staff';

export interface StaffProfile {
  id: string;
  email: string;
  fullName: string;
  role: StaffRole;
  isActive: boolean;
  createdAt: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid_on_arrival' | 'refunded';

export interface AdminBooking {
  id: string;
  referenceCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  timeSlot: string;
  serviceId: string;
  serviceName: string;
  numChildren: number;
  numAdults: number;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  todayBookingsCount: number;
  todayChildrenCount: number;
  occupancyPercentage: number;
  nextSlotTime: string;
  nextSlotBookedCount: number;
  pendingApprovals: number;
}

export interface OpeningHourItem {
  days: string;
  time: string;
}

export interface AdminBusinessSettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
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
  openingHours: OpeningHourItem[];
  saltRoomAddonPrice: number;

  // Legal Information (Impressum § 5 DDG & Compliance)
  ownerName?: string;
  companyLegalName?: string;
  legalAddress?: string;
  taxId?: string;
  taxNumber?: string;
  registerCourt?: string;
  registerNumber?: string;
  regulatoryAuthority?: string;
  liabilityInsurance?: string;
  disputeResolutionNotice?: string;
  additionalLegalNotice?: string;
}

export interface AdminPackage {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  description: string;
  category: 'standard' | 'group' | 'corporate';
  priceType: 'fixed' | 'on-request' | 'from';
  basePrice: number | null;
  currency: string;
  features?: string[];
  ctaText?: string;
  ctaAction?: 'book' | 'whatsapp' | 'contact-form';
  isVisible: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminBlockedDate {
  id: string;
  date: string;
  reason: string | null;
  createdAt: string;
}

export interface AdminTimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  serviceId: string;
  maxCapacity: number;
  bookedCount: number;
  isActive: boolean;
}

export type AnnouncementType = 'info' | 'warning' | 'success' | 'urgent';

export interface AdminAnnouncement {
  id: string;
  message: string;
  type: AnnouncementType;
  linkUrl?: string | null;
  linkText?: string | null;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt: string;
}

export interface AdminFaq {
  id: string;
  category: string;
  question: string;
  answer: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
}

export type InquiryStatus = 'new' | 'contacted' | 'reserved' | 'rejected' | 'archived';
export type InquiryEventType = 'general' | 'birthday' | 'group_party' | 'group_event' | 'corporate';

export interface AdminEventInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  eventType: InquiryEventType;
  targetDate?: string | null;
  childrenCount?: number | null;
  adultsCount?: number | null;
  message: string;
  status: InquiryStatus;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminGalleryItem {
  id: string;
  title: string;
  category: string;
  description: string | null;
  imageUrl: string;
  storagePath?: string | null;
  displayOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

