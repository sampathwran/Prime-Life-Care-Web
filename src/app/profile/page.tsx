'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, defaultDemoUser } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { BookingModal } from '@/components/BookingModal';
import { BookingSubmission, EquipmentOrder, PaymentRecord, SavedPatient } from '@/types';
import { districtList } from '@/data/services';
import {
  fetchUserBookingsFromFirestore,
  fetchUserOrdersFromFirestore,
  subscribeToUserBookings,
  subscribeToUserOrders
} from '@/lib/firestoreService';
import {
  User,
  X,
  Calendar,
  CreditCard,
  ShoppingBag,
  Phone,
  MapPin,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Camera,
  Bell,
  Users,
  Edit3,
  Save,
  Plus,
  Trash2,
  Heart,
  Shield,
  MessageCircle,
  Stethoscope,
  ChevronRight,
  ArrowLeft,
  PhoneCall,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  FileText
} from 'lucide-react';

export default function ProfilePage() {
  const {
    user,
    loading,
    logout,
    updateUserProfile,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    openAuthModal,
    loginAsDemoUser
  } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  // Active Tab: details | bookings | family | orders | payments | notifications | emergency
  const [activeTab, setActiveTab] = useState<
    'details' | 'bookings' | 'family' | 'orders' | 'payments' | 'notifications' | 'emergency'
  >('bookings');

  // Bookings Filter: all | active | completed
  const [bookingFilter, setBookingFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingPrefillPatient, setBookingPrefillPatient] = useState<SavedPatient | null>(null);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  // Edit Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [district, setDistrict] = useState(user?.district || 'Colombo (කොළඹ)');
  const [city, setCity] = useState(user?.city || 'Colombo');
  const [address, setAddress] = useState(user?.address || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add Family Member Form State
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientRelation, setPatientRelation] = useState('Father');
  const [patientAge, setPatientAge] = useState<number>(72);
  const [patientGender, setPatientGender] = useState<'male' | 'female'>('male');
  const [patientMobility, setPatientMobility] = useState('Wheelchair Assisted (රෝද පුටුව)');
  const [patientConditions, setPatientConditions] = useState('');

  // Bookings & Orders state (Loaded Live from Firestore)
  const [bookings, setBookings] = useState<BookingSubmission[]>([]);
  const [orders, setOrders] = useState<EquipmentOrder[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  // Synchronize form fields & subscribe to real-time Firestore bookings when user changes
  useEffect(() => {
    if (!user) {
      setBookings([]);
      setOrders([]);
      setPayments([]);
      return;
    }

    setName(user.name || '');
    setPhone(user.phone || '');
    setDistrict(user.district || 'Colombo (කොළඹ)');
    setCity(user.city || 'Colombo');
    setAddress(user.address || '');
    setPhotoURL(user.photoURL || '');

    // Real-time listener for user bookings from Firestore
    const unsubBookings = subscribeToUserBookings(user.id, (cloudBookings) => {
      setBookings(cloudBookings);

      // Generate invoice records for payment history
      const generatedPayments: PaymentRecord[] = cloudBookings.map((b) => ({
        id: `pay_${b.bookingCode}`,
        invoiceNumber: `INV-${b.bookingCode}`,
        bookingCode: b.bookingCode,
        serviceName: `${b.serviceName} (${b.staffTierName || 'Care'} - ${b.durationDays} Days)`,
        amountLKR: b.totalCostLKR || b.priceLKR,
        paymentDate: b.startDate || b.createdAt.split('T')[0],
        paymentMethod: 'cash_on_duty',
        status: b.paymentStatus === 'fully_paid' ? 'paid' : b.paymentStatus === 'advance_paid' ? 'paid' : 'due'
      }));
      setPayments(generatedPayments);
    });

    // Real-time listener for user orders from Firestore
    const unsubOrders = subscribeToUserOrders(user.id, (cloudOrders) => {
      setOrders(cloudOrders);
    });

    return () => {
      unsubBookings();
      unsubOrders();
    };
  }, [user]);

  // Multilingual Strings
  const translations = {
    si: {
      home: 'මුල් පිටුව',
      profile: 'පාරිභෝගික ගිණුම',
      portalTitle: 'පාරිභෝගික ගිණුම සහ සාත්තු පාලක පුවරුව',
      portalSub: 'ඔබගේ පුද්ගලික තොරතුරු, වෙන්කරගත් සාත්තු සේවා, පවුලේ රෝගීන් සහ බිල්පත් මෙතැනින් කළමනාකරණය කරන්න.',
      newBookingBtn: '+ අලුත් Booking එකක්',
      guestTitle: 'ඔබගේ ගිණුමට පිවිසෙන්න',
      guestSub: 'සාත්තු සේවා වෙන්කරවා ගැනීම් සහ ඔබගේ පවුලේ වැඩිහිටියන්ගේ තොරතුරු බලාගැනීමට කරුණාකර ඔබගේ ගිණුමට Log In වන්න.',
      guestLoginBtn: 'ගිණුමට ඇතුල් වන්න / ලියාපදිංචි වන්න',
      guestDemoBtn: 'Demo Profile Preview ⚡',
      verifiedMember: '✓ සහතිකලත් සාමාජිකයා',
      activeDutiesStat: 'ක්‍රියාත්මක සේවා',
      savedPatientsStat: 'සුරැකි රෝගීන්',
      changePhoto: 'ඡායාරූපය වෙනස් කරන්න',
      
      // Sidebar Tabs
      tabBookings: 'සාත්තු සේවා (Care Bookings)',
      tabDetails: 'පුද්ගලික තොරතුරු (Personal Profile)',
      tabFamily: 'පවුලේ සාමාජිකයන් (Family Directory)',
      tabOrders: 'උපකරණ ඇණවුම් (Medical Orders)',
      tabPayments: 'බිල්පත් සහ ගෙවීම් (Invoices)',
      tabNotifications: 'දැනුම්දීම් (Notifications)',
      tabEmergency: '24/7 හදිසි සහන (Emergency)',
      signOut: 'ගිණුමෙන් ඉවත් වන්න (Sign Out)',
      confirmSignOutTitle: 'ගිණුමෙන් ඉවත් වීම තහවුරු කරන්න',
      confirmSignOutMessage: 'ඔබට සැබවින්ම Prime Life Care ගිණුමෙන් ඉවත් වීමට අවශ්‍යද? ඔබගේ සක්‍රිය Booking සහ විස්තර සුරක්ෂිතව පවතිනු ඇත.',
      confirmSignOutYes: 'ඔව්, ඉවත් වන්න',
      confirmSignOutCancel: 'නැත, රැඳී සිටින්න',

      // Hotline Sidebar Card
      hotlineHeader: 'Prime Life Care සහන සේවය',
      hotlineTitle: '24/7 හෙද සහ සාත්තු උපකාරක',
      hotlineDesc: 'සාත්තු සේවිකාවන් සම්බන්ධ ඕනෑම හදිසි අවශ්‍යතාවයකදී අපගේ සම්බන්ධීකාරක නිලධාරියා අමතන්න.',
      callHotlineBtn: 'අමතන්න 077 123 4567',

      // Tab 1: Bookings
      bookingsTitle: 'සාත්තු සේවා වෙන්කිරීම් (Care Bookings)',
      bookingsSub: 'පැමිණෙන සේවකයන්ගේ තොරතුරු සහ සජීවී රාජකාරි තත්ත්වය',
      filterAll: 'සියල්ල',
      filterActive: 'ක්‍රියාත්මකයි',
      filterCompleted: 'අවසන් වූ',
      noBookingsTitle: 'සාත්තු සේවා වාර්තා නොමැත',
      noBookingsSub: 'ඔබ තවමත් මෙම කාණ්ඩයේ සාත්තු සේවාවක් වෙන්කරගෙන නොමැත. අලුත් සේවාවක් වෙන්කරවා ගැනීමට පහත බොත්තම ඔබන්න.',
      statusOnDuty: 'ක්‍රියාත්මකයි (On Duty)',
      statusAssigned: 'සේවකයා පත්කළා (Staff Assigned)',
      statusPending: 'සලකා බලමින් (Pending Review)',
      statusCompleted: 'අවසන් (Duty Completed)',
      step1: '1. වෙන්කිරීම තහවුරුයි',
      step2: '2. සේවකයා පත්කළා',
      step3: '3. රාජකාරියේ (On Duty)',
      step4: '4. අවසන්',
      labelService: 'සේවාව (Package)',
      labelPatient: 'රෝගියා (Patient)',
      labelDuration: 'කාලය (Duration)',
      labelDaysDuty: 'දිනක සාත්තු සේවය',
      labelTotalCost: 'මුළු මුදල (Total Cost)',
      labelPaidVerified: '✓ ගෙවීම තහවුරුයි',
      labelAssignedStaff: 'පත්කරන ලද සාත්තු සේවකයා / හෙද නිලධාරි:',
      labelAssigningStaff: 'සුදුසුකම්ලත් සේවකයෙකු පත්කරමින් පවතී...',
      btnCallStaff: 'ඇමතුමක්',
      btnWhatsapp: 'WhatsApp',

      // Tab 2: Profile Details
      detailsTitle: 'පුද්ගලික තොරතුරු සහ නිවසේ ලිපිනය',
      detailsSub: 'සාත්තු සේවිකාවන් නිවසට පැමිණීමට අවශ්‍ය නිවැරදි තොරතුරු',
      savedSuccess: 'තොරතුරු සාර්ථකව සුරැකිණි!',
      fullNameLabel: 'සම්පූර්ණ නම (Full Name) *',
      phoneLabel: 'දුරකථන / WhatsApp අංකය *',
      districtLabel: 'දිස්ත්‍රික්කය (District) *',
      cityLabel: 'නගරය / ප්‍රදේශය (City / Area) *',
      addressLabel: 'නිවසේ ලිපිනය (Residential Address for Caregiver Visits) *',
      addressPlaceholder: 'No 24, Chapel Road, Nugegoda (නිවස සොයාගැනීමට පහසු ස්ථාන සටහන් කරන්න)',
      secondaryHeader: 'හදිසි ඇමතුම් සඳහා තවත් දුරකථන අංකයක් (Secondary Contact)',
      secondaryNameLabel: 'ඥාතියාගේ නම',
      secondaryPhoneLabel: 'දුරකථන අංකය',
      saveChangesBtn: 'තොරතුරු සුරකින්න (Save Changes)',

      // Tab 3: Family Directory
      familyTitle: 'පවුලේ රෝගීන් නාමාවලිය (Saved Family Directory)',
      familySub: 'නැවත නැවත විස්තර නොපුරවා එක ක්ලික් එකෙන් සාත්තු සේවිකාවන් වෙන්කරවා ගැනීමට රෝගීන්ගේ විස්තර',
      addPatientBtn: '+ අලුත් රෝගියෙකු එක් කරන්න',
      addPatientHeader: 'නව පවුලේ සාමාජිකයෙකුගේ විස්තර ඇතුළත් කිරීම',
      patientNameLabel: 'රෝගියාගේ නම (Patient Name) *',
      relationLabel: 'ඥාති සම්බන්ධය (Relationship) *',
      relFather: 'තාත්තා (Father)',
      relMother: 'අම්මා (Mother)',
      relGrandfather: 'සීයා (Grandfather)',
      relGrandmother: 'ආච්චි (Grandmother)',
      relSpouse: 'සැමියා / බිරිඳ (Spouse)',
      relRelative: 'ඥාතියෙකු (Relative)',
      relSelf: 'මම (Self)',
      ageLabel: 'වයස (Age) *',
      genderLabel: 'ස්ත්‍රී / පුරුෂ භාවය',
      genderMale: 'පුරුෂ (Male)',
      genderFemale: 'ස්ත්‍රී (Female)',
      mobilityLabel: 'ශාරීරික සංචලනය (Mobility)',
      mobWheelchair: 'Wheelchair Assisted (රෝද පුටුව)',
      mobBedridden: 'Bedridden (ඇඳ මත සිටින)',
      mobStick: 'Walking Stick (සැරයටිය)',
      mobNormal: 'Normal / Mobile (සාමාන්‍ය)',
      conditionsLabel: 'විශේෂ රෝග තත්ත්වයන් / සටහන් (Medical Conditions & Notes)',
      cancelBtn: 'අවලංගු කරන්න',
      savePatientBtn: 'සුරකින්න (Save Patient)',
      noFamilyTitle: 'සුරැකි රෝගීන් නොමැත',
      noFamilySub: 'ඉක්මන් booking සඳහා පවුලේ වැඩිහිටියන්ගේ හෝ රෝගීන්ගේ විස්තර මෙහි ඇතුළත් කර තබන්න.',
      bookCaregiverFor: 'Book Caregiver for',

      // Tab 4: Equipment Orders
      ordersTitle: 'උපකරණ ඇණවුම් (Medical Store Orders)',
      ordersSub: 'මිලදී ගත් සහ කුලියට ගත් Hospital Bed, Wheelchair ආදී උපකරණ',
      goToStoreBtn: 'Medical Store එකට යන්න',
      noOrdersTitle: 'උපකරණ ඇණවුම් නොමැත',
      noOrdersSub: 'Wheelchairs, Hospital Beds, Oxygen Concentrators ඇතුළු රෝගී උපකරණ අපගේ Medical Store වෙතින් පහසුවෙන් නිවසටම ඇණවුම් කරන්න.',
      deliveryAddressLabel: 'බෙදාහැරීමේ ලිපිනය:',
      totalAmountLabel: 'මුළු මුදල:',

      // Tab 5: Invoices
      invoicesTitle: 'නිල බිල්පත් සහ ගෙවීම් වාර්තා (Invoices)',
      invoicesSub: 'ඔබ ගෙවූ සියලුම සාත්තු සේවා ගාස්තු සහ නිල බිල්පත්',
      colInvoice: 'Invoice #',
      colService: 'සේවාව (Service)',
      colAmount: 'මුදල (Amount)',
      colMethod: 'ක්‍රමය (Method)',
      colDate: 'දිනය (Date)',
      colStatus: 'තත්ත්වය (Status)',
      statusPaid: 'Paid ✓',

      // Tab 6: Notifications
      notifTitle: 'දැනුම්දීම් පුවරුව (Notifications)',
      notifSub: 'සාත්තු සේවිකාවන් නිවසට පැමිණීම සහ සෞඛ්‍ය යාවත්කාලීන කිරීම්',
      markAllReadBtn: 'සියල්ල කියවූ බව සලකුණු කරන්න',
      noNotifTitle: 'නව දැනුම්දීම් නොමැත',
      newBadge: 'අලුත්',

      // Tab 7: Emergency
      emergencyTitle: '24/7 හදිසි ඇමතුම් සහ සුවසැරිය (Emergency Services)',
      emergencySub: 'හදිසි රෝගී තත්ත්වයකදී හෝ ගිලන්රථ අවශ්‍යතාවයකදී ක්ෂණිකව අමතන්න',
      card1990Title: '1990 සුවසැරිය (Suwa Seriya)',
      card1990Sub: 'නොමිලේ ගිලන්රථ සේවාව',
      call1990Btn: 'Call 1990',
      cardHotlineTitle: 'Prime Life Care Hotline',
      cardHotlineSub: '24/7 හෙද සහන සේවය',
      cardDoctorTitle: 'WhatsApp Doctor Consultation',
      cardDoctorSub: 'වෛද්‍ය උපදෙස් සහ බෙහෙත් විමසීම්',
      cardHospitalTitle: 'Colombo National Hospital',
      cardHospitalSub: 'හදිසි ප්‍රතිකාර ඒකකය',
    },
    en: {
      home: 'Home',
      profile: 'Customer Profile',
      portalTitle: 'Customer Account & Patient Portal',
      portalSub: 'Manage your profile details, caregiver duty schedules, family health records, and billing receipts.',
      newBookingBtn: '+ New Booking',
      guestTitle: 'Sign In to Your Account',
      guestSub: 'Please sign in to manage your caregiver bookings and family patient profiles.',
      guestLoginBtn: 'Sign In / Register',
      guestDemoBtn: 'Demo Profile Preview ⚡',
      verifiedMember: '✓ Verified Client',
      activeDutiesStat: 'Active Duties',
      savedPatientsStat: 'Saved Patients',
      changePhoto: 'Change Photo',

      // Sidebar Tabs
      tabBookings: 'Care Bookings',
      tabDetails: 'Personal Profile',
      tabFamily: 'Family Directory',
      tabOrders: 'Medical Orders',
      tabPayments: 'Invoices & Payments',
      tabNotifications: 'Notifications',
      tabEmergency: '24/7 Emergency',
      signOut: 'Sign Out',
      confirmSignOutTitle: 'Confirm Sign Out',
      confirmSignOutMessage: 'Are you sure you want to sign out of your Prime Life Care account? Your active bookings and profile details will remain safely saved.',
      confirmSignOutYes: 'Yes, Sign Out',
      confirmSignOutCancel: 'No, Stay Signed In',

      // Hotline Sidebar Card
      hotlineHeader: 'Prime Life Care Support',
      hotlineTitle: '24/7 Nursing & Caregiver Helpline',
      hotlineDesc: 'Contact our duty coordinator anytime for urgent caregiver support or patient care advice.',
      callHotlineBtn: 'Call 077 123 4567',

      // Tab 1: Bookings
      bookingsTitle: 'Care Bookings & Duty Status',
      bookingsSub: 'Assigned caregiver details and live in-home duty tracking',
      filterAll: 'All',
      filterActive: 'Active',
      filterCompleted: 'Completed',
      noBookingsTitle: 'No Caregiver Bookings Found',
      noBookingsSub: 'You have not booked any caregiver services yet. Click below to place a new booking.',
      statusOnDuty: 'On Duty (Active)',
      statusAssigned: 'Caregiver Assigned',
      statusPending: 'Pending Review',
      statusCompleted: 'Duty Completed',
      step1: '1. Confirmed',
      step2: '2. Assigned',
      step3: '3. On Duty',
      step4: '4. Completed',
      labelService: 'Care Package',
      labelPatient: 'Patient',
      labelDuration: 'Duration',
      labelDaysDuty: 'Days Duty',
      labelTotalCost: 'Total Cost',
      labelPaidVerified: '✓ Payment Verified',
      labelAssignedStaff: 'Assigned Caregiver / Registered Nurse:',
      labelAssigningStaff: 'Caregiver Assignment in Progress...',
      btnCallStaff: 'Call Staff',
      btnWhatsapp: 'WhatsApp',

      // Tab 2: Profile Details
      detailsTitle: 'Personal Details & Residential Address',
      detailsSub: 'Accurate home visit information for caregiver dispatch',
      savedSuccess: 'Profile saved successfully!',
      fullNameLabel: 'Full Name *',
      phoneLabel: 'Phone / WhatsApp Number *',
      districtLabel: 'District *',
      cityLabel: 'City / Area *',
      addressLabel: 'Residential Address for Caregiver Visits *',
      addressPlaceholder: 'No 24, Chapel Road, Nugegoda (Include landmarks for caregiver navigation)',
      secondaryHeader: 'Emergency Secondary Contact',
      secondaryNameLabel: "Contact Person's Name",
      secondaryPhoneLabel: 'Emergency Phone Number',
      saveChangesBtn: 'Save Changes',

      // Tab 3: Family Directory
      familyTitle: 'Saved Family Members & Patient Directory',
      familySub: 'Pre-save family patient details for 1-click instant caregiver booking',
      addPatientBtn: '+ Add Family Member',
      addPatientHeader: 'Add New Family Member / Patient Profile',
      patientNameLabel: "Patient's Full Name *",
      relationLabel: 'Relationship *',
      relFather: 'Father',
      relMother: 'Mother',
      relGrandfather: 'Grandfather',
      relGrandmother: 'Grandmother',
      relSpouse: 'Spouse',
      relRelative: 'Relative',
      relSelf: 'Self',
      ageLabel: 'Age (Years) *',
      genderLabel: 'Gender',
      genderMale: 'Male',
      genderFemale: 'Female',
      mobilityLabel: 'Mobility Condition',
      mobWheelchair: 'Wheelchair Assisted',
      mobBedridden: 'Bedridden',
      mobStick: 'Walking Stick',
      mobNormal: 'Normal / Mobile',
      conditionsLabel: 'Medical Conditions & Special Instructions',
      cancelBtn: 'Cancel',
      savePatientBtn: 'Save Patient Profile',
      noFamilyTitle: 'No Saved Family Members Yet',
      noFamilySub: 'Add your elderly parents or patient relatives here for fast 1-click booking without re-entering details.',
      bookCaregiverFor: 'Book Caregiver for',

      // Tab 4: Equipment Orders
      ordersTitle: 'Medical Equipment & Store Orders',
      ordersSub: 'Purchased & rented medical beds, wheelchairs, and nursing supplies',
      goToStoreBtn: 'Visit Medical Store',
      noOrdersTitle: 'No Equipment Orders Found',
      noOrdersSub: 'Order hospital beds, wheelchairs, and oxygen concentrators directly from our Medical Store.',
      deliveryAddressLabel: 'Delivery Address:',
      totalAmountLabel: 'Total Amount:',

      // Tab 5: Invoices
      invoicesTitle: 'Invoices & Billing History',
      invoicesSub: 'Official receipts and payment records for your care duties',
      colInvoice: 'Invoice #',
      colService: 'Service',
      colAmount: 'Amount',
      colMethod: 'Payment Method',
      colDate: 'Date',
      colStatus: 'Status',
      statusPaid: 'Paid ✓',

      // Tab 6: Notifications
      notifTitle: 'Notifications & Alerts',
      notifSub: 'Caregiver arrivals, vitals updates, and order dispatches',
      markAllReadBtn: 'Mark All as Read',
      noNotifTitle: 'No Notifications at this time',
      newBadge: 'New',

      // Tab 7: Emergency
      emergencyTitle: '24/7 Emergency & Medical Hotlines',
      emergencySub: 'Instant dial for emergency ambulances, hospitals, and doctor support',
      card1990Title: '1990 Suwa Seriya',
      card1990Sub: 'Free Islandwide Ambulance Service',
      call1990Btn: 'Call 1990',
      cardHotlineTitle: 'Prime Life Care Hotline',
      cardHotlineSub: '24/7 Caregiver & Nurse Coordination',
      cardDoctorTitle: 'WhatsApp Doctor Consultation',
      cardDoctorSub: 'Doctor advice & prescription queries',
      cardHospitalTitle: 'Colombo National Hospital',
      cardHospitalSub: 'Accident & Emergency Service',
    },
    ta: {
      home: 'முகப்பு',
      profile: 'பயனர் கணக்கு',
      portalTitle: 'வாடிக்கையாளர் கணக்கு & பராமரிப்பு பலகை',
      portalSub: 'உங்கள் சுயவிவரம், முன்பதிவுகள், குடும்ப நோயாளிகள் மற்றும் கட்டணங்களை நிர்வகிக்கவும்.',
      newBookingBtn: '+ புதிய முன்பதிவு',
      guestTitle: 'உங்கள் கணக்கில் உள்நுழையவும்',
      guestSub: 'பராமரிப்பாளர்களை முன்பதிவு செய்ய உங்கள் கணக்கில் நுழையவும்.',
      guestLoginBtn: 'உள்நுழைக / பதிவு செய்க',
      guestDemoBtn: 'டெமோ கணக்கு ⚡',
      verifiedMember: '✓ சரிபார்க்கப்பட்ட உறுப்பினர்',
      activeDutiesStat: 'செயலில் உள்ளவை',
      savedPatientsStat: 'நோயாளிகள்',
      changePhoto: 'புகைப்படத்தை மாற்றுக',

      // Sidebar Tabs
      tabBookings: 'முன்பதிவுகள் (Care Bookings)',
      tabDetails: 'சுயவிவரம் (Personal Profile)',
      tabFamily: 'குடும்பத்தினர் (Family Directory)',
      tabOrders: 'உபகரண ஆர்டர்கள் (Medical Orders)',
      tabPayments: 'கட்டணங்கள் (Invoices)',
      tabNotifications: 'அறிவிப்புகள் (Notifications)',
      tabEmergency: 'அவசர உதவி (Emergency)',
      signOut: 'வெளியேறு (Sign Out)',
      confirmSignOutTitle: 'வெளியேறுவதை உறுதிப்படுத்தவும்',
      confirmSignOutMessage: 'உங்கள் Prime Life Care கணக்கிலிருந்து வெளியேற விரும்புகிறீர்களா? உங்கள் முன்பதிவுகள் பாதுகாப்பாக இருக்கும்.',
      confirmSignOutYes: 'ஆம், வெளியேறு',
      confirmSignOutCancel: 'இல்லை, உள்நுழைந்திரு',

      // Hotline Sidebar Card
      hotlineHeader: 'Prime Life Care உதவி',
      hotlineTitle: '24/7 நர்சிங் & பராமரிப்பு உதவி எண்',
      hotlineDesc: 'அவசர பராமரிப்பு தேவைகளுக்கு எங்கள் ஒருங்கிணைப்பாளரை எப்போது வேண்டுமானாலும் தொடர்பு கொள்ளவும்.',
      callHotlineBtn: 'அழைக்க 077 123 4567',

      // Tab 1: Bookings
      bookingsTitle: 'பராமரிப்பு முன்பதிவுகள்',
      bookingsSub: 'பணியாளர் விவரங்கள் மற்றும் நேரடி நிலை',
      filterAll: 'அனைத்தும்',
      filterActive: 'செயலில்',
      filterCompleted: 'முடிந்தது',
      noBookingsTitle: 'முன்பதிவுகள் எதுவும் இல்லை',
      noBookingsSub: 'நீங்கள் இன்னும் எந்த முன்பதிவும் செய்யவில்லை. புதிய முன்பதிவு செய்ய கீழே கிளிக் செய்யவும்.',
      statusOnDuty: 'செயலில் (On Duty)',
      statusAssigned: 'பணியாளர் நியமிக்கப்பட்டார்',
      statusPending: 'மதிப்பாய்வில் உள்ளது',
      statusCompleted: 'முடிந்தது (Completed)',
      step1: '1. உறுதி செய்யப்பட்டது',
      step2: '2. நியமிக்கப்பட்டது',
      step3: '3. பணியில் உள்ளது',
      step4: '4. முடிந்தது',
      labelService: 'சேவை',
      labelPatient: 'நோயாளி',
      labelDuration: 'கால அளவு',
      labelDaysDuty: 'நாட்கள்',
      labelTotalCost: 'மொத்த தொகை',
      labelPaidVerified: '✓ கட்டணம் செலுத்தப்பட்டது',
      labelAssignedStaff: 'நியமிக்கப்பட்ட பணியாளர்:',
      labelAssigningStaff: 'பணியாளர் தேர்வு செய்யப்படுகிறார்...',
      btnCallStaff: 'அழைக்க',
      btnWhatsapp: 'WhatsApp',

      // Tab 2: Profile Details
      detailsTitle: 'சுயவிவரம் மற்றும் முகவரி',
      detailsSub: 'பராமரிப்பாளர் உங்கள் வீட்டிற்கு வர சரியான தகவல்கள்',
      savedSuccess: 'வெற்றிகரமாக சேமிக்கப்பட்டது!',
      fullNameLabel: 'முழுப் பெயர் *',
      phoneLabel: 'தொலைபேசி / வாட்ஸ்அப் *',
      districtLabel: 'மாவட்டம் *',
      cityLabel: 'நகரம் *',
      addressLabel: 'வீட்டு முகவரி *',
      addressPlaceholder: 'No 24, Chapel Road, Nugegoda',
      secondaryHeader: 'அவசர தொடர்பு எண் (Secondary Contact)',
      secondaryNameLabel: 'உறவினரின் பெயர்',
      secondaryPhoneLabel: 'தொலைபேசி எண்',
      saveChangesBtn: 'சேமிக்க (Save Changes)',

      // Tab 3: Family Directory
      familyTitle: 'சேமிக்கப்பட்ட நோயாளிகள்',
      familySub: 'மறுபடியும் விவரங்களை உள்ளிடாமல் எளிதாக முன்பதிவு செய்ய',
      addPatientBtn: '+ புதிய நோயாளியை சேர்க்க',
      addPatientHeader: 'புதிய குடும்ப உறுப்பினரை சேர்க்க',
      patientNameLabel: 'நோயாளியின் பெயர் *',
      relationLabel: 'உறவுமுறை *',
      relFather: 'தந்தை (Father)',
      relMother: 'தாய் (Mother)',
      relGrandfather: 'தாத்தா (Grandfather)',
      relGrandmother: 'பாட்டி (Grandmother)',
      relSpouse: 'மனைவி / கணவர் (Spouse)',
      relRelative: 'உறவினர் (Relative)',
      relSelf: 'நான் (Self)',
      ageLabel: 'வயது *',
      genderLabel: 'பாலினம்',
      genderMale: 'ஆண் (Male)',
      genderFemale: 'பெண் (Female)',
      mobilityLabel: 'இயக்கம் நிலை (Mobility)',
      mobWheelchair: 'Wheelchair (சக்கர நாற்காலி)',
      mobBedridden: 'Bedridden (படுக்கையில் உள்ளவர்)',
      mobStick: 'Walking Stick (ஊன்றுகோல்)',
      mobNormal: 'Normal (சாதாரணம்)',
      conditionsLabel: 'மருத்துவ நிலை / குறிப்புகள்',
      cancelBtn: 'ரத்து',
      savePatientBtn: 'சேமிக்க (Save)',
      noFamilyTitle: 'நோயாளிகள் சேமிக்கப்படவில்லை',
      noFamilySub: 'விரைவான முன்பதிவுக்கு உங்கள் குடும்பத்தினரை இங்கே சேர்க்கவும்.',
      bookCaregiverFor: 'முன்பதிவு செய்ய:',

      // Tab 4: Equipment Orders
      ordersTitle: 'உபகரண ஆர்டர்கள்',
      ordersSub: 'வாங்கிய மற்றும் வாடகைக்கு எடுத்த மருத்துவ உபகரணங்கள்',
      goToStoreBtn: 'மருத்துவ கடைக்கு செல்ல',
      noOrdersTitle: 'ஆர்டர்கள் எதுவும் இல்லை',
      noOrdersSub: 'மருத்துவ உபகரணங்களை எங்கள் கடையில் இருந்து உடனடியாக ஆர்டர் செய்யலாம்.',
      deliveryAddressLabel: 'டெலிவரி முகவரி:',
      totalAmountLabel: 'மொத்த தொகை:',

      // Tab 5: Invoices
      invoicesTitle: 'கட்டணங்கள் மற்றும் ரசீதுகள்',
      invoicesSub: 'அனைத்து கட்டண பதிவுகள்',
      colInvoice: 'ரசீது #',
      colService: 'சேவை',
      colAmount: 'தொகை',
      colMethod: 'முறை',
      colDate: 'தேதி',
      colStatus: 'நிலை',
      statusPaid: 'Paid ✓',

      // Tab 6: Notifications
      notifTitle: 'அறிவிப்புகள்',
      notifSub: 'பராமரிப்பாளர் வருகை மற்றும் ஆரோக்கிய தகவல்கள்',
      markAllReadBtn: 'அனைத்தையும் வாசித்ததாக குறிக்கவும்',
      noNotifTitle: 'அறிவிப்புகள் இல்லை',
      newBadge: 'புதியது',

      // Tab 7: Emergency
      emergencyTitle: '24/7 அவசர உதவி எண்கள்',
      emergencySub: 'அவசர ஆம்புலன்ஸ் மற்றும் மருத்துவ உதவி எண்கள்',
      card1990Title: '1990 சுவசரிய (Suwa Seriya)',
      card1990Sub: 'இலவச ஆம்புலன்ஸ் சேவை',
      call1990Btn: 'அழைக்க 1990',
      cardHotlineTitle: 'Prime Life Care உதவி எண்',
      cardHotlineSub: '24/7 நர்சிங் உதவி',
      cardDoctorTitle: 'WhatsApp மருத்துவ ஆலோசனை',
      cardDoctorSub: 'மருத்துவ ஆலோசனை பெற',
      cardHospitalTitle: 'கொழும்பு தேசிய மருத்துவமனை',
      cardHospitalSub: 'அவசர சிகிச்சை பிரிவு',
    }
  };

  const t = translations[language] || translations.en;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({
      name,
      phone,
      district,
      city,
      address,
      photoURL
    });
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 3000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoURL(base64);
        updateUserProfile({ photoURL: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    const newPatient: SavedPatient = {
      id: `p_${Date.now()}`,
      name: patientName.trim(),
      relation: patientRelation,
      age: Number(patientAge) || 60,
      gender: patientGender,
      mobility: patientMobility,
      conditions: patientConditions.trim() || 'General elderly assistance'
    };

    const updatedPatients = [...(user?.savedPatients || []), newPatient];
    await updateUserProfile({ savedPatients: updatedPatients });
    setShowAddPatientModal(false);
    setPatientName('');
    setPatientConditions('');
  };

  const handleDeletePatient = async (id: string) => {
    const updatedPatients = (user?.savedPatients || []).filter((p) => p.id !== id);
    await updateUserProfile({ savedPatients: updatedPatients });
  };

  const handleOpenBookingForPatient = (patient: SavedPatient) => {
    router.push(
      `/booking?patient=${encodeURIComponent(patient.name)}&patientAge=${patient.age}&patientGender=${patient.gender}&patientConditions=${encodeURIComponent(patient.conditions || '')}&patientMobility=${encodeURIComponent(patient.mobility || '')}`
    );
  };

  const unreadNotificationsCount = user?.notifications?.filter((n) => !n.isRead).length || 0;

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === 'active') {
      return b.status === 'in_progress' || b.status === 'caregiver_assigned';
    }
    if (bookingFilter === 'completed') {
      return b.status === 'completed';
    }
    return true;
  });

  const getStatusBadge = (status: BookingSubmission['status']) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t.statusOnDuty}</span>
          </span>
        );
      case 'caregiver_assigned':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5 shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.statusAssigned}</span>
          </span>
        );
      case 'pending_review':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.statusPending}</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {t.statusCompleted}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        onOpenBooking={() => router.push('/booking')}
        onNavigateToStore={() => router.push('/store')}
        onNavigateToTracker={() => router.push('/#tracker')}
        onOpenProfile={() => {}}
        onOpenAuth={() => openAuthModal()}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Breadcrumb & Portal Heading */}
        <div className="mb-6">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link href="/" className="hover:text-blue-600 transition-colors">{t.home}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-800 font-bold">{t.profile}</span>
          </nav>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {t.portalTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {t.portalSub}
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/booking')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{t.newBookingBtn}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Guest View: If user is not logged in */}
        {!user ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm text-center max-w-2xl mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-xs">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">{t.guestTitle}</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
              {t.guestSub}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              <button
                onClick={() => openAuthModal()}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t.guestLoginBtn}</span>
              </button>

              <button
                onClick={loginAsDemoUser}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>{t.guestDemoBtn}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Logged In View: Full Two-Column Dashboard (Like SummerCabs Profile) */
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* LEFT COLUMN: User Identity & Navigation Sidebar (4 Columns) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Profile Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
                
                {/* Avatar with Camera Uploader */}
                <div className="flex flex-col items-center text-center pb-5 border-b border-slate-100">
                  <div className="relative group mb-3">
                    {photoURL || user.photoURL ? (
                      <img
                        src={photoURL || user.photoURL}
                        alt={user.name}
                        className="w-24 h-24 rounded-3xl object-cover border-2 border-slate-100 shadow-md group-hover:opacity-90 transition-opacity"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-3xl bg-blue-600 text-white font-black text-3xl flex items-center justify-center shadow-md">
                        {user.name.charAt(0) || 'U'}
                      </div>
                    )}

                    {/* Camera Change Icon */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-md border-2 border-white transition-transform hover:scale-110 cursor-pointer"
                      title={t.changePhoto}
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{user.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                      {t.verifiedMember}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 flex flex-col gap-0.5">
                    <span>{user.email}</span>
                    {user.phone && <span className="font-semibold text-slate-800">{user.phone}</span>}
                  </p>

                  <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>{user.city ? `${user.city}, ` : ''}{user.district || 'Colombo'}</span>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-4 text-center">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.activeDutiesStat}</span>
                    <span className="text-xl font-black text-blue-600 mt-0.5 block">
                      {bookings.filter(b => b.status === 'in_progress' || b.status === 'caregiver_assigned').length}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.savedPatientsStat}</span>
                    <span className="text-xl font-black text-slate-800 mt-0.5 block">
                      {user.savedPatients?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sidebar Navigation Menu */}
              <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-xs space-y-1">
                
                {/* 1. Care Bookings */}
                <button
                  type="button"
                  onClick={() => setActiveTab('bookings')}
                  className={`w-full p-3 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${
                    activeTab === 'bookings'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4" />
                    <span>{t.tabBookings}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'bookings' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {bookings.length}
                  </span>
                </button>

                {/* 2. Personal Profile */}
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`w-full p-3 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${
                    activeTab === 'details'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4" />
                    <span>{t.tabDetails}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                {/* 3. Saved Family / Patients */}
                <button
                  type="button"
                  onClick={() => setActiveTab('family')}
                  className={`w-full p-3 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${
                    activeTab === 'family'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4" />
                    <span>{t.tabFamily}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'family' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {user.savedPatients?.length || 0}
                  </span>
                </button>

                {/* 4. Equipment Orders */}
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className={`w-full p-3 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${
                    activeTab === 'orders'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t.tabOrders}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'orders' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {orders.length}
                  </span>
                </button>

                {/* 5. Payments & Invoices */}
                <button
                  type="button"
                  onClick={() => setActiveTab('payments')}
                  className={`w-full p-3 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${
                    activeTab === 'payments'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4" />
                    <span>{t.tabPayments}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'payments' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {payments.length}
                  </span>
                </button>

                {/* 6. Notifications */}
                <button
                  type="button"
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full p-3 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${
                    activeTab === 'notifications'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4" />
                    <span>{t.tabNotifications}</span>
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse">
                      {unreadNotificationsCount} {t.newBadge}
                    </span>
                  )}
                </button>

                {/* 7. Emergency Support */}
                <button
                  type="button"
                  onClick={() => setActiveTab('emergency')}
                  className={`w-full p-3 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${
                    activeTab === 'emergency'
                      ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 fill-current" />
                    <span>{t.tabEmergency}</span>
                  </div>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    Hotlines
                  </span>
                </button>

                {/* Logout Button */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowSignOutModal(true)}
                    className="w-full p-3 rounded-2xl font-bold text-xs sm:text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all flex items-center gap-3 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t.signOut}</span>
                  </button>
                </div>

              </div>

              {/* 24/7 Hotline Support Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white space-y-3 shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold">
                    <PhoneCall className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-blue-200 uppercase tracking-wider">{t.hotlineHeader}</h4>
                    <p className="text-sm font-black">{t.hotlineTitle}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {t.hotlineDesc}
                </p>
                <a
                  href="tel:+94771234567"
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t.callHotlineBtn}</span>
                </a>
              </div>

            </div>

            {/* RIGHT COLUMN: Main Content Area (8 Columns) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* TAB 1: CARE BOOKINGS */}
              {activeTab === 'bookings' && (
                <div className="space-y-6">
                  
                  {/* Top Bar with Filter & Add Button */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-black text-slate-900">{t.bookingsTitle}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">{t.bookingsSub}</p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setBookingFilter('all')}
                        className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                          bookingFilter === 'all' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        {t.filterAll} ({bookings.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingFilter('active')}
                        className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                          bookingFilter === 'active' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        {t.filterActive}
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingFilter('completed')}
                        className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                          bookingFilter === 'completed' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        {t.filterCompleted}
                      </button>
                    </div>
                  </div>

                  {/* Bookings List */}
                  {filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
                      <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h4 className="text-base font-bold text-slate-800">{t.noBookingsTitle}</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        {t.noBookingsSub}
                      </p>
                      <button
                        onClick={() => router.push('/booking')}
                        className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer shadow-xs"
                      >
                        {t.newBookingBtn}
                      </button>
                    </div>
                  ) : (
                    filteredBookings.map((b) => (
                      <div
                        key={b.id}
                        className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-slate-300 shadow-xs space-y-5 transition-all"
                      >
                        {/* Booking Header: Code + Staff Tier + Status */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <span className="font-black text-slate-900 text-lg">{b.bookingCode}</span>
                            {b.staffTierName && (
                              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                {b.staffTierName}
                              </span>
                            )}
                            <span className="text-xs text-slate-400">Date: {b.startDate}</span>
                          </div>
                          {getStatusBadge(b.status)}
                        </div>

                        {/* Step Progress Bar (Real-time Duty Stages) */}
                        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-2">
                            <span className="text-blue-600">{t.step1}</span>
                            <span className={b.status !== 'pending_review' ? 'text-blue-600' : 'text-slate-400'}>
                              {t.step2}
                            </span>
                            <span className={b.status === 'in_progress' ? 'text-emerald-600' : 'text-slate-400'}>
                              {t.step3}
                            </span>
                            <span className={b.status === 'completed' ? 'text-slate-900' : 'text-slate-400'}>
                              {t.step4}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                            <div className="bg-blue-600 h-full w-1/4" />
                            <div className={`h-full w-1/4 ${b.status !== 'pending_review' ? 'bg-blue-600' : 'bg-slate-200'}`} />
                            <div className={`h-full w-1/4 ${b.status === 'in_progress' ? 'bg-emerald-500 animate-pulse' : b.status === 'completed' ? 'bg-blue-600' : 'bg-slate-200'}`} />
                            <div className={`h-full w-1/4 ${b.status === 'completed' ? 'bg-slate-700' : 'bg-slate-200'}`} />
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 block text-[11px] font-medium">{t.labelService}</span>
                            <strong className="text-slate-900 text-sm mt-0.5 block">{b.serviceName}</strong>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 block text-[11px] font-medium">{t.labelPatient}</span>
                            <strong className="text-slate-900 text-sm mt-0.5 block">{b.patientName} ({b.patientAge} yrs)</strong>
                            <span className="text-[11px] text-slate-500 capitalize">{b.mobilityLevel?.replace('_', ' ') || 'Normal'}</span>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 block text-[11px] font-medium">{t.labelDuration}</span>
                            <strong className="text-slate-900 text-sm mt-0.5 block">{b.durationDays} {t.labelDaysDuty}</strong>
                            <span className="text-[11px] text-slate-500">From {b.startDate}</span>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 block text-[11px] font-medium">{t.labelTotalCost}</span>
                            <strong className="text-blue-700 text-base mt-0.5 block font-black">
                              LKR {(b.totalCostLKR || b.priceLKR).toLocaleString()}
                            </strong>
                            <span className="text-[10px] text-emerald-600 font-bold">{t.labelPaidVerified}</span>
                          </div>
                        </div>

                        {/* Assigned Caregiver Direct Contact Bar */}
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                              {b.assignedCaregiverName ? b.assignedCaregiverName.charAt(0) : <Shield className="w-6 h-6" />}
                            </div>
                            <div>
                              <div className="text-[11px] text-slate-500 font-semibold">{t.labelAssignedStaff}</div>
                              <div className="font-extrabold text-slate-900 text-sm sm:text-base">
                                {b.assignedCaregiverName || t.labelAssigningStaff}
                              </div>
                              {b.assignedCaregiverPhone && (
                                <div className="text-xs text-blue-700 font-semibold">{b.assignedCaregiverPhone}</div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            {b.assignedCaregiverPhone ? (
                              <>
                                <a
                                  href={`tel:${b.assignedCaregiverPhone}`}
                                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
                                >
                                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{t.btnCallStaff}</span>
                                </a>
                                <a
                                  href={`https://wa.me/${b.assignedCaregiverPhone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>{t.btnWhatsapp}</span>
                                </a>
                              </>
                            ) : (
                              <a
                                href="tel:+94771234567"
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Hotline: 077 123 4567</span>
                              </a>
                            )}
                          </div>
                        </div>

                      </div>
                    ))
                  )}

                </div>
              )}

              {/* TAB 2: PERSONAL DETAILS & EDIT PROFILE */}
              {activeTab === 'details' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                  
                  <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-black text-slate-900">{t.detailsTitle}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">{t.detailsSub}</p>
                    </div>
                    {isSavedSuccess && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t.savedSuccess}</span>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleProfileSave} className="space-y-5">
                    
                    {/* Basic Info */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.fullNameLabel}</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Rohan Jayasinghe"
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-blue-600 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.phoneLabel}</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="077 123 4567"
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-blue-600 transition-all"
                        />
                      </div>
                    </div>

                    {/* District & City */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.districtLabel}</label>
                        <select
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-blue-600 transition-all bg-white"
                        >
                          {districtList.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.cityLabel}</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Nugegoda / Maharagama"
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-blue-600 transition-all"
                        />
                      </div>
                    </div>

                    {/* House Address */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {t.addressLabel}
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder={t.addressPlaceholder}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-blue-600 transition-all resize-none"
                      />
                    </div>

                    {/* Emergency Contact */}
                    <div className="pt-2 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                        {t.secondaryHeader}
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">{t.secondaryNameLabel}</label>
                          <input
                            type="text"
                            value={emergencyContactName}
                            onChange={(e) => setEmergencyContactName(e.target.value)}
                            placeholder="e.g. Mrs. Jayasinghe (Spouse)"
                            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">{t.secondaryPhoneLabel}</label>
                          <input
                            type="tel"
                            value={emergencyContactPhone}
                            onChange={(e) => setEmergencyContactPhone(e.target.value)}
                            placeholder="071 234 5678"
                            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-3 flex justify-end">
                      <button
                        type="submit"
                        className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>{t.saveChangesBtn}</span>
                      </button>
                    </div>

                  </form>

                </div>
              )}

              {/* TAB 3: SAVED FAMILY MEMBERS / PATIENTS */}
              {activeTab === 'family' && (
                <div className="space-y-6">
                  
                  {/* Top Bar */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-black text-slate-900">{t.familyTitle}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t.familySub}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddPatientModal(true)}
                      className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t.addPatientBtn}</span>
                    </button>
                  </div>

                  {/* Add Patient Drawer / Form */}
                  {showAddPatientModal && (
                    <div className="bg-white rounded-3xl p-6 border-2 border-blue-500 shadow-lg space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h4 className="font-black text-base text-slate-900 flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          <span>{t.addPatientHeader}</span>
                        </h4>
                        <button
                          onClick={() => setShowAddPatientModal(false)}
                          className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handleAddPatient} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">{t.patientNameLabel}</label>
                            <input
                              type="text"
                              required
                              value={patientName}
                              onChange={(e) => setPatientName(e.target.value)}
                              placeholder="e.g. Sunil Jayasinghe"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">{t.relationLabel}</label>
                            <select
                              value={patientRelation}
                              onChange={(e) => setPatientRelation(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600 bg-white"
                            >
                              <option value="Father">{t.relFather}</option>
                              <option value="Mother">{t.relMother}</option>
                              <option value="Grandfather">{t.relGrandfather}</option>
                              <option value="Grandmother">{t.relGrandmother}</option>
                              <option value="Spouse">{t.relSpouse}</option>
                              <option value="Relative">{t.relRelative}</option>
                              <option value="Self">{t.relSelf}</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">{t.ageLabel}</label>
                            <input
                              type="number"
                              required
                              value={patientAge}
                              onChange={(e) => setPatientAge(Number(e.target.value))}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">{t.genderLabel}</label>
                            <select
                              value={patientGender}
                              onChange={(e) => setPatientGender(e.target.value as any)}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600 bg-white"
                            >
                              <option value="male">{t.genderMale}</option>
                              <option value="female">{t.genderFemale}</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">{t.mobilityLabel}</label>
                            <select
                              value={patientMobility}
                              onChange={(e) => setPatientMobility(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600 bg-white"
                            >
                              <option value="Wheelchair Assisted (රෝද පුටුව)">{t.mobWheelchair}</option>
                              <option value="Bedridden (ඇඳ මත සිටින)">{t.mobBedridden}</option>
                              <option value="Walking Stick (සැරයටිය)">{t.mobStick}</option>
                              <option value="Normal / Mobile (සාමාන්‍ය)">{t.mobNormal}</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {t.conditionsLabel}
                          </label>
                          <input
                            type="text"
                            value={patientConditions}
                            onChange={(e) => setPatientConditions(e.target.value)}
                            placeholder="e.g. Hypertension, Diabetes, Post-stroke rehab, Catheter care"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddPatientModal(false)}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                          >
                            {t.cancelBtn}
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                          >
                            {t.savePatientBtn}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Directory Cards */}
                  {!user.savedPatients || user.savedPatients.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h4 className="text-base font-bold text-slate-800">{t.noFamilyTitle}</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        {t.noFamilySub}
                      </p>
                      <button
                        onClick={() => setShowAddPatientModal(true)}
                        className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer shadow-xs"
                      >
                        {t.addPatientBtn}
                      </button>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {user.savedPatients.map((pat) => (
                        <div
                          key={pat.id}
                          className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-slate-300 shadow-xs space-y-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 font-black text-lg flex items-center justify-center border border-blue-100 shrink-0">
                                {pat.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-black text-slate-900 text-base">{pat.name}</h4>
                                <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-lg mt-0.5 inline-block">
                                  {pat.relation} • {pat.age} yrs • {pat.gender}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeletePatient(pat.id)}
                              className="text-slate-300 hover:text-red-500 p-1.5 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Patient"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-xs space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-slate-700">
                            <div>
                              <span className="text-slate-400 font-medium">Mobility: </span>
                              <strong className="text-slate-900 font-bold">{pat.mobility}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 font-medium">Conditions: </span>
                              <span>{pat.conditions}</span>
                            </div>
                          </div>

                          {/* 1-Click Fast Booking Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenBookingForPatient(pat)}
                            className="w-full py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                          >
                            <Heart className="w-4 h-4" />
                            <span>{t.bookCaregiverFor} {pat.name.split(' ')[0]}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* TAB 4: MEDICAL EQUIPMENT ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-black text-slate-900">{t.ordersTitle}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">{t.ordersSub}</p>
                    </div>

                    <Link
                      href="/store"
                      className="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{t.goToStoreBtn}</span>
                    </Link>
                  </div>

                  {orders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
                      <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h4 className="text-base font-bold text-slate-800">{t.noOrdersTitle}</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        {t.noOrdersSub}
                      </p>
                    </div>
                  ) : (
                    orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <span className="font-black text-slate-900 text-base">{ord.orderCode}</span>
                            <span className="text-xs text-slate-400">{ord.createdAt}</span>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 flex items-center gap-1.5 border border-blue-100">
                            <Truck className="w-3.5 h-3.5" />
                            <span>{ord.status.toUpperCase()}</span>
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between p-3 rounded-xl bg-slate-50">
                              <span className="font-bold text-slate-900">{it.quantity}x {it.name}</span>
                              <span className="font-extrabold text-blue-700">LKR {(it.priceLKR * it.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
                          <span>{t.deliveryAddressLabel} <strong className="text-slate-800">{ord.deliveryAddress}</strong></span>
                          <span className="font-black text-blue-700 text-base">
                            {t.totalAmountLabel} LKR {ord.totalAmountLKR.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 5: INVOICES & PAYMENTS */}
              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
                    <h2 className="text-lg font-black text-slate-900">{t.invoicesTitle}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{t.invoicesSub}</p>
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="py-4 px-4">{t.colInvoice}</th>
                          <th className="py-4 px-4">{t.colService}</th>
                          <th className="py-4 px-4">{t.colAmount}</th>
                          <th className="py-4 px-4">{t.colMethod}</th>
                          <th className="py-4 px-4">{t.colDate}</th>
                          <th className="py-4 px-4 text-right">{t.colStatus}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-4 px-4 font-black text-slate-900">{p.invoiceNumber}</td>
                            <td className="py-4 px-4 text-slate-700 font-medium">{p.serviceName}</td>
                            <td className="py-4 px-4 font-black text-blue-700">LKR {p.amountLKR.toLocaleString()}</td>
                            <td className="py-4 px-4 text-slate-500 capitalize">{p.paymentMethod.replace('_', ' ')}</td>
                            <td className="py-4 px-4 text-slate-500">{p.paymentDate}</td>
                            <td className="py-4 px-4 text-right">
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {t.statusPaid}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-black text-slate-900">{t.notifTitle}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">{t.notifSub}</p>
                    </div>
                    {user.notifications && user.notifications.length > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                      >
                        {t.markAllReadBtn}
                      </button>
                    )}
                  </div>

                  {!user.notifications || user.notifications.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
                      <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h4 className="text-base font-bold text-slate-800">{t.noNotifTitle}</h4>
                    </div>
                  ) : (
                    user.notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`p-5 rounded-3xl border transition-all cursor-pointer flex items-start gap-4 ${
                          notif.isRead
                            ? 'bg-white border-slate-200 text-slate-700'
                            : 'bg-blue-50/60 border-blue-200 text-slate-900 shadow-xs'
                        }`}
                      >
                        <div className="p-3 rounded-2xl bg-blue-100 text-blue-700 shrink-0">
                          {notif.type === 'clinical' ? <Stethoscope className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                              <span>{notif.title}</span>
                              {!notif.isRead && <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />}
                            </h4>
                            <span className="text-[11px] text-slate-400 shrink-0">{notif.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{notif.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 7: 24/7 EMERGENCY & MEDICAL ASSISTANCE */}
              {activeTab === 'emergency' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
                    <h2 className="text-lg font-black text-slate-900">{t.emergencyTitle}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{t.emergencySub}</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* 1990 Suwa Seriya */}
                    <div className="p-5 rounded-3xl bg-red-50 border border-red-200 flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                          1990
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm">{t.card1990Title}</h4>
                          <p className="text-xs text-slate-600">{t.card1990Sub}</p>
                        </div>
                      </div>
                      <a
                        href="tel:1990"
                        className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs"
                      >
                        {t.call1990Btn}
                      </a>
                    </div>

                    {/* Prime Life Care 24/7 Hotline */}
                    <div className="p-5 rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                          <Phone className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm">{t.cardHotlineTitle}</h4>
                          <p className="text-xs text-slate-600">{t.cardHotlineSub}</p>
                        </div>
                      </div>
                      <a
                        href="tel:+94771234567"
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
                      >
                        077 123 4567
                      </a>
                    </div>

                    {/* WhatsApp Doctor Support */}
                    <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
                          <MessageCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm">{t.cardDoctorTitle}</h4>
                          <p className="text-xs text-slate-600">{t.cardDoctorSub}</p>
                        </div>
                      </div>
                      <a
                        href="https://wa.me/94771234567"
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                      >
                        WhatsApp
                      </a>
                    </div>

                    {/* National Hospital Colombo */}
                    <div className="p-5 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-bold shadow-md">
                          <Shield className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm">{t.cardHospitalTitle}</h4>
                          <p className="text-xs text-slate-600">{t.cardHospitalSub}</p>
                        </div>
                      </div>
                      <a
                        href="tel:0112691111"
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors shadow-xs"
                      >
                        011 269 1111
                      </a>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 sm:p-7 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-xs">
              <LogOut className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center mb-2">
              {t.confirmSignOutTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 text-center leading-relaxed mb-6">
              {t.confirmSignOutMessage}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowSignOutModal(false)}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
              >
                {t.confirmSignOutCancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSignOutModal(false);
                  logout();
                  router.push('/');
                }}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/20 transition-all cursor-pointer"
              >
                {t.confirmSignOutYes}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setBookingPrefillPatient(null);
        }}
        onBookingSubmitted={(newBooking: BookingSubmission) => {
          setBookings((prev) => [newBooking, ...prev]);
        }}
      />

      {/* Global Auth Modal */}
      <AuthModal />

      {/* Footer */}
      <Footer />

    </div>
  );
}
