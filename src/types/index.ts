export type Language = 'si' | 'en' | 'ta';

export type ServiceCategory = 'all' | 'elderly_care' | 'child_care' | 'recovery' | 'specialized' | 'short_visit';

export type ShiftType = '12h_day' | '12h_night' | '24h_full' | 'short_visit';

export interface LocalizedString {
  en: string;
  si: string;
  ta: string;
}

export interface LocalizedList {
  en: string[];
  si: string[];
  ta: string[];
}

export interface ServiceTierOption {
  tierId: StaffTierId;
  tierName: LocalizedString;
  badge: LocalizedString;
  priceLKR: number;
  pricingUnit: LocalizedString;
  responsibilities: LocalizedList;
  isRecommended?: boolean;
}

export interface ServiceItem {
  id: string;
  category: ServiceCategory;
  name: LocalizedString;
  shortDescription: LocalizedString;
  description: LocalizedString;
  shiftType: ShiftType;
  hours: number;
  priceLKR: number;
  pricingUnit: LocalizedString;
  icon: string;
  features: LocalizedList;
  defaultTierId?: StaffTierId;
  tiers?: ServiceTierOption[];
  isActive: boolean;
}

export type StaffTierId = 'doctor' | 'nvq_5_nurse' | 'nvq_4_caregiver' | 'nurse_assistant' | 'basic_aide';

export interface StaffTier {
  id: StaffTierId;
  name: LocalizedString;
  titleBadge: LocalizedString;
  qualifications: LocalizedString;
  dailyRateLKR: number;
  shiftTypeNote: LocalizedString;
  idealFor: LocalizedString;
  responsibilities: LocalizedList;
  experienceYears: string;
}

export interface MedicalItem {
  id: string;
  name: LocalizedString;
  category: 'equipment' | 'mobility' | 'hygiene' | 'monitoring';
  priceLKR: number;
  rentalMonthlyLKR?: number;
  inStock: boolean;
  badge?: string;
  brand?: string;
  description: LocalizedString;
  images: string[];
}

export interface EquipmentOrder {
  id: string;
  orderCode: string;
  userId: string;
  items: {
    itemId: string;
    name: string;
    quantity: number;
    priceLKR: number;
  }[];
  totalAmountLKR: number;
  paymentMethod: 'cod' | 'bank_transfer' | 'online_card';
  deliveryAddress: string;
  district: string;
  contactName: string;
  contactPhone: string;
  status: 'order_received' | 'processing' | 'dispatched' | 'delivered';
  createdAt: string;
}

export interface SavedPatient {
  id: string;
  name: string;
  relation: string;
  age: number;
  gender: 'male' | 'female';
  mobility: string;
  conditions: string;
}

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'order' | 'clinical' | 'system';
  timestamp: string;
  isRead: boolean;
  linkCode?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoURL?: string;
  district?: string;
  city?: string;
  address?: string;
  savedPatients?: SavedPatient[];
  notifications?: UserNotification[];
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  invoiceNumber: string;
  bookingCode: string;
  serviceName: string;
  amountLKR: number;
  paymentDate: string;
  paymentMethod: 'bank_transfer' | 'cash_on_duty' | 'credit_card' | 'cod' | 'online_card';
  status: 'paid' | 'pending_verification' | 'due';
  receiptUrl?: string;
}

export interface BookingSubmission {
  id: string;
  userId?: string;
  bookingCode: string;
  serviceId: string;
  serviceName: string;
  staffTierId?: StaffTierId;
  staffTierName?: string;
  shiftType: ShiftType;
  priceLKR: number;
  patientName: string;
  patientAge: number;
  patientGender: 'male' | 'female';
  mobilityLevel: 'independent' | 'partial_assistance' | 'bedridden' | 'wheelchair';
  medicalConditions: string;
  district: string;
  city: string;
  address: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  startDate: string;
  durationDays: number;
  totalCostLKR?: number;
  specialNotes?: string;
  status: 'pending_review' | 'caregiver_assigned' | 'in_progress' | 'completed';
  assignedCaregiverName?: string;
  assignedCaregiverPhone?: string;
  paymentStatus: 'unpaid' | 'advance_paid' | 'fully_paid';
  createdAt: string;
}

export interface GoogleReviewItem {
  id: string;
  authorName: string;
  authorLocation: LocalizedString;
  rating: number;
  timeAgo: LocalizedString;
  category: 'elderly_care' | 'child_care' | 'post_surgery' | 'live_in';
  serviceUsed: LocalizedString;
  caregiverMentioned?: string;
  text: LocalizedString;
  verified: boolean;
}

