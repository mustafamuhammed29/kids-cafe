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
