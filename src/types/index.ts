export type Language = 'si' | 'en' | 'ta';

export type ServiceCategory = 'all' | 'elderly_care' | 'child_care' | 'recovery' | 'specialized' | 'short_visit' | string;

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
  sortOrder?: number;
}

export type StaffTierId = 'doctor' | 'nvq_5_nurse' | 'nvq_4_caregiver' | 'nurse_assistant' | 'basic_aide' | string;

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
  category: 'equipment' | 'mobility' | 'hygiene' | 'monitoring' | string;
  priceLKR: number;
  regularPriceLKR?: number;
  salePriceLKR?: number;
  discountPercentage?: number;
  rentalMonthlyLKR?: number;
  stock?: number;
  inStock: boolean;
  badge?: string;
  brand?: string;
  description: LocalizedString;
  images: string[];
  features?: LocalizedList | string[];
  isAvailable?: boolean;
  createdAt?: string;
}

export interface CartItem {
  item: MedicalItem;
  quantity: number;
}

export interface SavedItem {
  item: MedicalItem;
  savedAt: string;
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
    regularPriceLKR?: number;
    imageUrl?: string;
  }[];
  totalAmountLKR: number;
  paymentMethod: 'cod' | 'bank_transfer' | 'online_card';
  paymentStatus?: 'cod_pending' | 'pending_verification' | 'paid';
  bankSlipUrl?: string;
  bankReference?: string;
  deliveryAddress: string;
  district: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  status: 'order_received' | 'processing' | 'dispatched' | 'delivered' | 'cancelled' | string;
  orderStatus?: 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled' | string;
  createdAt: string;
  updatedAt?: string;
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
  updatedAt?: string;
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

export type MobilityLevel = 'independent' | 'partial_assistance' | 'bedridden' | 'wheelchair' | 'partial';

export interface VitalsCarePlan {
  bpFrequency?: 'none' | '1x_daily' | '2x_daily' | '4x_daily' | string;
  sugarFrequency?: 'none' | 'fasting' | 'fasting_and_pp' | 'random' | string;
  spo2Monitoring?: boolean;
  bedTurningRequired?: boolean;
  bedTurningFrequencyHours?: number;
  bedTurnIntervalHours?: number;
  medicationReminders?: boolean;
  catheterCare?: boolean;
  woundDressing?: boolean;
  physioExercises?: boolean;
  notes?: string;
}

export interface ShiftAttendanceRecord {
  id?: string;
  shiftDate?: string; // "YYYY-MM-DD"
  date?: string;
  checkInTime?: string;
  clockInTime?: string;
  checkOutTime?: string;
  clockOutTime?: string;
  checkInLocation?: string;
  workedMinutes?: number;
  hours?: number | string;
  status?: 'in_progress' | 'completed' | 'approved' | 'flagged' | string;
  vitalsCount?: number;
  bedTurnsCount?: number;
  handoverNotes?: string;
  caregiverName?: string;
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
  patientGender: 'male' | 'female' | 'Male' | 'Female' | string;
  mobilityLevel: MobilityLevel | string;
  medicalConditions: string;
  district: string;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  startDate: string;
  durationDays: number;
  totalCostLKR?: number;
  specialNotes?: string;
  status: 'pending_review' | 'in_process' | 'broadcasted' | 'caregiver_assigned' | 'in_progress' | 'completed';
  assignedCaregiverName?: string;
  assignedCaregiverPhone?: string;
  paymentStatus: 'unpaid' | 'advance_paid' | 'fully_paid';
  paymentMethod?: 'bank_transfer' | 'cash_to_caregiver' | 'cash_on_duty';
  advancePaymentOption?: 'pay_on_duty' | 'pay_advance' | 'advance_paid' | 'full_paid';
  advanceAmountLKR?: number;
  transferReference?: string;
  caregiverChangeRequest?: {
    requested: boolean;
    reason: string;
    category?: string;
    categoryLabel?: string;
    caregiverNameAtRequest?: string;
    requestedAt: string;
    status: 'pending' | 'reviewed' | 'resolved';
    resolvedAt?: string;
  };
  createdAt: string;
  updatedAt?: string;
  vitalsPlan?: VitalsCarePlan;
  carePlanTasks?: string[];
  isCaregiverCheckedIn?: boolean;
  lastCheckInTime?: string;
  lastCheckOutTime?: string;
  completedShiftsCount?: number;
  shifts?: ShiftAttendanceRecord[];
}

export interface GoogleReviewItem {
  id: string;
  authorName: string;
  authorLocation?: string | LocalizedString;
  rating: number;
  timeAgo?: string | LocalizedString;
  relativeTime?: string | LocalizedString;
  category?: string;
  serviceUsed?: string | LocalizedString;
  caregiverMentioned?: string;
  text: string | LocalizedString;
  verified?: boolean;
  isVerified?: boolean;
  isPublished?: boolean;
  avatarUrl?: string;
  createdAt?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  titleSi?: string;
  imageUrl: string;
  category: string;
  description?: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
}

