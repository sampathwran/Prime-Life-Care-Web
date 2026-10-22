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
import { fetchUserBookingsFromFirestore, fetchUserOrdersFromFirestore } from '@/lib/firestoreService';
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

  // Bookings & Orders state
  const [bookings, setBookings] = useState<BookingSubmission[]>([
    {
      id: 'demo_b1',
      userId: 'usr_rohan_01',
      bookingCode: 'PLC-2026-1024',
      serviceId: 'day_care_12h',
      serviceName: '12-Hour Day Shift Care (NVQ 4)',
      staffTierId: 'nvq_4_caregiver',
      staffTierName: 'NVQ Level 4 Certified Aide',
      shiftType: '12h_day',
      priceLKR: 4500,
      patientName: 'Mrs. Jayasinghe (Mother)',
      patientAge: 78,
      patientGender: 'female',
      mobilityLevel: 'partial_assistance',
      medicalConditions: 'Hypertension, Mild Arthritis, Needs companionship',
      district: 'Colombo (කොළඹ)',
      city: 'Nugegoda',
      address: 'No 24, Chapel Road, Nugegoda',
      contactName: 'Mr. Rohan Jayasinghe',
      contactPhone: '077 123 4567',
      contactEmail: 'rohan.j@gmail.com',
      startDate: '2026-10-14',
      durationDays: 14,
      totalCostLKR: 63000,
      status: 'in_progress',
      paymentStatus: 'fully_paid',
      assignedCaregiverName: 'Sister K. Chamila (RN Certified Aide)',
      assignedCaregiverPhone: '077 987 6543',
      createdAt: '2026-10-12T08:30:00Z'
    },
    {
      id: 'demo_b2',
      userId: 'usr_rohan_01',
      bookingCode: 'PLC-2026-2048',
      serviceId: 'live_in_24h',
      serviceName: '24-Hour Live-in Care (NVQ 5)',
      staffTierId: 'nvq_5_nurse',
      staffTierName: 'NVQ Level 5 Senior Nurse',
      shiftType: '24h_full',
      priceLKR: 7000,
      patientName: 'Mr. Dharmadasa (Father-in-law)',
      patientAge: 82,
      patientGender: 'male',
      mobilityLevel: 'bedridden',
      medicalConditions: 'Post-Stroke Recovery, Catheter care, Bed sore prevention',
      district: 'Gampaha (ගම්පහ)',
      city: 'Kelaniya',
      address: 'No 18/A, Station Road, Kelaniya',
      contactName: 'Mr. Rohan Jayasinghe',
      contactPhone: '077 123 4567',
      contactEmail: 'rohan.j@gmail.com',
      startDate: '2026-10-18',
      durationDays: 30,
      totalCostLKR: 210000,
      status: 'caregiver_assigned',
      paymentStatus: 'advance_paid',
      assignedCaregiverName: 'Mr. Sunimal Perera (Senior NVQ 5 Nurse)',
      assignedCaregiverPhone: '071 234 5678',
      createdAt: '2026-10-15T14:15:00Z'
    }
  ]);

  const [orders, setOrders] = useState<EquipmentOrder[]>([
    {
      id: 'demo_ord1',
      orderCode: 'ORD-2026-1049',
      userId: 'usr_rohan_01',
      items: [
        {
          itemId: 'air_mattress_pump',
          name: 'Medical Ripple Air Mattress with Anti-Bed Sore Pump',
          quantity: 1,
          priceLKR: 24500
        },
        {
          itemId: 'wheelchair_foldable',
          name: 'Standard Commode Wheelchair (Foldable)',
          quantity: 1,
          priceLKR: 38500
        }
      ],
      totalAmountLKR: 63000,
      paymentMethod: 'bank_transfer',
      deliveryAddress: 'No 24, Chapel Road, Nugegoda',
      district: 'Colombo (කොළඹ)',
      contactName: 'Rohan Jayasinghe',
      contactPhone: '077 123 4567',
      status: 'dispatched',
      createdAt: '2026-10-18'
    }
  ]);

  const [payments, setPayments] = useState<PaymentRecord[]>([
    {
      id: 'pay_1',
      invoiceNumber: 'INV-PLC-2026-089',
      bookingCode: 'PLC-2026-1024',
      serviceName: '12-Hour Day Shift Care (14 Days)',
      amountLKR: 63000,
      paymentDate: '2026-10-12',
      paymentMethod: 'bank_transfer',
      status: 'paid'
    },
    {
      id: 'pay_2',
      invoiceNumber: 'INV-PLC-2026-102',
      bookingCode: 'PLC-2026-2048',
      serviceName: '24-Hour Live-in Care Advance (30 Days)',
      amountLKR: 105000,
      paymentDate: '2026-10-15',
      paymentMethod: 'online_card',
      status: 'paid'
    }
  ]);

  // Synchronize form fields when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setDistrict(user.district || 'Colombo (කොළඹ)');
      setCity(user.city || 'Colombo');
      setAddress(user.address || '');
      setPhotoURL(user.photoURL || '');

      // Load user bookings from Firestore
      fetchUserBookingsFromFirestore(user.id)
        .then((userBookings) => {
          if (userBookings && userBookings.length > 0) {
            setBookings(userBookings);
          }
        })
        .catch((e) => console.warn('Bookings load fallback:', e));

      // Load user orders from Firestore
      fetchUserOrdersFromFirestore(user.id)
        .then((userOrders) => {
          if (userOrders && userOrders.length > 0) {
            setOrders(userOrders);
          }
        })
        .catch((e) => console.warn('Orders load fallback:', e));
    }
  }, [user]);

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
    setBookingPrefillPatient(patient);
    setIsBookingModalOpen(true);
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
            <span>ක්‍රියාත්මකයි (On Duty)</span>
          </span>
        );
      case 'caregiver_assigned':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5 shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>සේවකයා පත්කළා (Staff Assigned)</span>
          </span>
        );
      case 'pending_review':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>සලකා බලමින් (Pending Review)</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            අවසන් (Duty Completed)
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        onOpenBooking={() => setIsBookingModalOpen(true)}
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
            <Link href="/" className="hover:text-blue-600 transition-colors">මුල් පිටුව (Home)</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-800 font-bold">පාරිභෝගික ගිණුම (My Profile)</span>
          </nav>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {language === 'si' ? 'පාරිභෝගික ගිණුම සහ සාත්තු පාලක පුවරුව' : 'Customer Account & Patient Portal'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {language === 'si'
                  ? 'ඔබගේ පුද්ගලික තොරතුරු, වෙන්කරගත් සාත්තු සේවා, පවුලේ රෝගීන් සහ බිල්පත් මෙතැනින් කළමනාකරණය කරන්න.'
                  : 'Manage your profile details, caregiver duty schedules, family health records, and billing receipts.'}
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ අලුත් Booking එකක්</span>
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
            <h2 className="text-2xl font-black text-slate-900">ඔබගේ ගිණුමට පිවිසෙන්න</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
              සාත්තු සේවා වෙන්කරවා ගැනීම් සහ ඔබගේ පවුලේ වැඩිහිටියන්ගේ තොරතුරු බලාගැනීමට කරුණාකර ඔබගේ ගිණුමට Log In වන්න.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              <button
                onClick={() => openAuthModal()}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ගිණුමට ඇතුල් වන්න / ලියාපදිංචි වන්න</span>
              </button>

              <button
                onClick={loginAsDemoUser}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Demo Profile Preview ⚡</span>
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
                      title="Change Photo"
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
                      ✓ Verified Member
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 flex flex-col gap-0.5">
                    <span>{user.email}</span>
                    {user.phone && <span className="font-semibold text-slate-800">{user.phone}</span>}
                  </p>

                  <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>{user.city ? `${user.city}, ` : ''}{user.district || 'Colombo (කොළඹ)'}</span>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-4 text-center">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Duties</span>
                    <span className="text-xl font-black text-blue-600 mt-0.5 block">
                      {bookings.filter(b => b.status === 'in_progress' || b.status === 'caregiver_assigned').length}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Saved Patients</span>
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
                    <span>සාත්තු සේවා (Care Bookings)</span>
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
                    <span>පුද්ගලික තොරතුරු (Personal Profile)</span>
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
                    <span>පවුලේ සාමාජිකයන් (Family Directory)</span>
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
                    <span>උපකරණ ඇණවුම් (Medical Orders)</span>
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
                    <span>බිල්පත් සහ ගෙවීම් (Invoices)</span>
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
                    <span>දැනුම්දීම් (Notifications)</span>
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse">
                      {unreadNotificationsCount} New
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
                    <span>24/7 හදිසි සහන (Emergency)</span>
                  </div>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    Hotlines
                  </span>
                </button>

                {/* Logout Button */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      router.push('/');
                    }}
                    className="w-full p-3 rounded-2xl font-bold text-xs sm:text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all flex items-center gap-3 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>ගිණුමෙන් ඉවත් වන්න (Sign Out)</span>
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
                    <h4 className="text-xs font-bold text-blue-200 uppercase tracking-wider">Prime Life Care Support</h4>
                    <p className="text-sm font-black">24/7 Caregiver Hotline</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  සාත්තු සේවිකාවන් සම්බන්ධ ඕනෑම හදිසි අවශ්‍යතාවයකදී අපගේ සම්බන්ධීකාරක නිලධාරියා අමතන්න.
                </p>
                <a
                  href="tel:+94771234567"
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Call 077 123 4567</span>
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
                      <h2 className="text-lg font-black text-slate-900">සාත්තු සේවා වෙන්කිරීම් (Care Bookings)</h2>
                      <p className="text-xs text-slate-500 mt-0.5">පැමිණෙන සේවකයන්ගේ තොරතුරු සහ සජීවී රාජකාරි තත්ත්වය</p>
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
                        සියල්ල ({bookings.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingFilter('active')}
                        className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                          bookingFilter === 'active' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        ක්‍රියාත්මකයි
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingFilter('completed')}
                        className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                          bookingFilter === 'completed' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        අවසන් වූ
                      </button>
                    </div>
                  </div>

                  {/* Bookings List */}
                  {filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
                      <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h4 className="text-base font-bold text-slate-800">සාත්තු සේවා වාර්තා නොමැත</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        ඔබ තවමත් මෙම කාණ්ඩයේ සාත්තු සේවාවක් වෙන්කරගෙන නොමැත. අලුත් සේවාවක් වෙන්කරවා ගැනීමට පහත බොත්තම ඔබන්න.
                      </p>
                      <button
                        onClick={() => setIsBookingModalOpen(true)}
                        className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer shadow-xs"
                      >
                        + අලුත් Booking එකක් දමන්න
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
                            <span className="text-blue-600">1. වෙන්කිරීම තහවුරුයි</span>
                            <span className={b.status !== 'pending_review' ? 'text-blue-600' : 'text-slate-400'}>
                              2. සේවකයා පත්කළා
                            </span>
                            <span className={b.status === 'in_progress' ? 'text-emerald-600' : 'text-slate-400'}>
                              3. රාජකාරියේ (On Duty)
                            </span>
                            <span className={b.status === 'completed' ? 'text-slate-900' : 'text-slate-400'}>
                              4. අවසන්
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
                            <span className="text-slate-400 block text-[11px] font-medium">සේවාව (Package)</span>
                            <strong className="text-slate-900 text-sm mt-0.5 block">{b.serviceName}</strong>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 block text-[11px] font-medium">රෝගියා (Patient)</span>
                            <strong className="text-slate-900 text-sm mt-0.5 block">{b.patientName} ({b.patientAge} yrs)</strong>
                            <span className="text-[11px] text-slate-500 capitalize">{b.mobilityLevel?.replace('_', ' ') || 'Normal'}</span>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 block text-[11px] font-medium">කාලය (Duration)</span>
                            <strong className="text-slate-900 text-sm mt-0.5 block">{b.durationDays} Days Duty</strong>
                            <span className="text-[11px] text-slate-500">From {b.startDate}</span>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 block text-[11px] font-medium">මුළු මුදල (Total Cost)</span>
                            <strong className="text-blue-700 text-base mt-0.5 block font-black">
                              LKR {(b.totalCostLKR || b.priceLKR).toLocaleString()}
                            </strong>
                            <span className="text-[10px] text-emerald-600 font-bold">✓ Payment Verified</span>
                          </div>
                        </div>

                        {/* Assigned Caregiver Direct Contact Bar */}
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                              {b.assignedCaregiverName ? b.assignedCaregiverName.charAt(0) : <Shield className="w-6 h-6" />}
                            </div>
                            <div>
                              <div className="text-[11px] text-slate-500 font-semibold">පත්කරන ලද සාත්තු සේවකයා / හෙද නිලධාරි:</div>
                              <div className="font-extrabold text-slate-900 text-sm sm:text-base">
                                {b.assignedCaregiverName || 'සුදුසුකම්ලත් සේවකයෙකු පත්කරමින් පවතී...'}
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
                                  <span>ඇමතුමක්</span>
                                </a>
                                <a
                                  href={`https://wa.me/${b.assignedCaregiverPhone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
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
                      <h2 className="text-lg font-black text-slate-900">පුද්ගලික තොරතුරු සහ නිවසේ ලිපිනය</h2>
                      <p className="text-xs text-slate-500 mt-0.5">සාත්තු සේවිකාවන් නිවසට පැමිණීමට අවශ්‍ය නිවැරදි තොරතුරු</p>
                    </div>
                    {isSavedSuccess && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>තොරතුරු සාර්ථකව සුරැකිණි!</span>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleProfileSave} className="space-y-5">
                    
                    {/* Basic Info */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">සම්පූර්ණ නම (Full Name) *</label>
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
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">දුරකථන / WhatsApp අංකය *</label>
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
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">දිස්ත්‍රික්කය (District) *</label>
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
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">නගරය / ප්‍රදේශය (City / Area) *</label>
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
                        නිවසේ ලිපිනය (Residential Address for Caregiver Visits) *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="No 24, Chapel Road, Nugegoda (නිවස සොයාගැනීමට පහසු ස්ථාන සටහන් කරන්න)"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-blue-600 transition-all resize-none"
                      />
                    </div>

                    {/* Emergency Contact */}
                    <div className="pt-2 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                        හදිසි ඇමතුම් සඳහා තවත් දුරකථන අංකයක් (Secondary Contact)
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">ඥාතියාගේ නම</label>
                          <input
                            type="text"
                            value={emergencyContactName}
                            onChange={(e) => setEmergencyContactName(e.target.value)}
                            placeholder="e.g. Mrs. Jayasinghe (Spouse)"
                            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">දුරකථන අංකය</label>
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
                        <span>තොරතුරු සුරකින්න (Save Changes)</span>
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
                      <h2 className="text-lg font-black text-slate-900">පවුලේ රෝගීන් නාමාවලිය (Saved Family Directory)</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        නැවත නැවත විස්තර නොපුරවා එක ක්ලික් එකෙන් සාත්තු සේවිකාවන් වෙන්කරවා ගැනීමට රෝගීන්ගේ විස්තර
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddPatientModal(true)}
                      className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ අලුත් රෝගියෙකු එක් කරන්න</span>
                    </button>
                  </div>

                  {/* Add Patient Drawer / Form */}
                  {showAddPatientModal && (
                    <div className="bg-white rounded-3xl p-6 border-2 border-blue-500 shadow-lg space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h4 className="font-black text-base text-slate-900 flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          <span>නව පවුලේ සාමාජිකයෙකුගේ විස්තර ඇතුළත් කිරීම</span>
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
                            <label className="block text-xs font-bold text-slate-700 mb-1">රෝගියාගේ නම (Patient Name) *</label>
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
                            <label className="block text-xs font-bold text-slate-700 mb-1">ඥාති සම්බන්ධය (Relationship) *</label>
                            <select
                              value={patientRelation}
                              onChange={(e) => setPatientRelation(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600 bg-white"
                            >
                              <option value="Father">තාත්තා (Father)</option>
                              <option value="Mother">අම්මා (Mother)</option>
                              <option value="Grandfather">සීයා (Grandfather)</option>
                              <option value="Grandmother">ආච්චි (Grandmother)</option>
                              <option value="Spouse">සැමියා / බිරිඳ (Spouse)</option>
                              <option value="Relative">ඥාතියෙකු (Relative)</option>
                              <option value="Self">මම (Self)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">වයස (Age) *</label>
                            <input
                              type="number"
                              required
                              value={patientAge}
                              onChange={(e) => setPatientAge(Number(e.target.value))}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">ස්ත්‍රී / පුරුෂ භාවය</label>
                            <select
                              value={patientGender}
                              onChange={(e) => setPatientGender(e.target.value as any)}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600 bg-white"
                            >
                              <option value="male">පුරුෂ (Male)</option>
                              <option value="female">ස්ත්‍රී (Female)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">ශාරීරික සංචලනය (Mobility)</label>
                            <select
                              value={patientMobility}
                              onChange={(e) => setPatientMobility(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600 bg-white"
                            >
                              <option value="Wheelchair Assisted (රෝද පුටුව)">Wheelchair Assisted (රෝද පුටුව)</option>
                              <option value="Bedridden (ඇඳ මත සිටින)">Bedridden (ඇඳ මත සිටින)</option>
                              <option value="Walking Stick (සැරයටිය)">Walking Stick (සැරයටිය)</option>
                              <option value="Normal / Mobile (සාමාන්‍ය)">Normal / Mobile (සාමාන්‍ය)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            විශේෂ රෝග තත්ත්වයන් / සටහන් (Medical Conditions & Notes)
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
                            අවලංගු කරන්න
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                          >
                            සුරකින්න (Save Patient)
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Directory Cards */}
                  {!user.savedPatients || user.savedPatients.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h4 className="text-base font-bold text-slate-800">සුරැකි රෝගීන් නොමැත</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        ඉක්මන් booking සඳහා පවුලේ වැඩිහිටියන්ගේ හෝ රෝගීන්ගේ විස්තර මෙහි ඇතුළත් කර තබන්න.
                      </p>
                      <button
                        onClick={() => setShowAddPatientModal(true)}
                        className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer shadow-xs"
                      >
                        + අලුත් රෝගියෙකු ඇතුළත් කරන්න
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
                            <span>Book Caregiver for {pat.name.split(' ')[0]}</span>
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
                      <h2 className="text-lg font-black text-slate-900">උපකරණ ඇණවුම් (Medical Store Orders)</h2>
                      <p className="text-xs text-slate-500 mt-0.5">මිලදී ගත් සහ කුලියට ගත් Hospital Bed, Wheelchair ආදී උපකරණ</p>
                    </div>

                    <Link
                      href="/store"
                      className="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Medical Store එකට යන්න</span>
                    </Link>
                  </div>

                  {orders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
                      <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h4 className="text-base font-bold text-slate-800">උපකරණ ඇණවුම් නොමැත</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        Wheelchairs, Hospital Beds, Oxygen Concentrators ඇතුළු රෝගී උපකරණ අපගේ Medical Store වෙතින් පහසුවෙන් නිවසටම ඇණවුම් කරන්න.
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
                          <span>බෙදාහැරීමේ ලිපිනය: <strong className="text-slate-800">{ord.deliveryAddress}</strong></span>
                          <span className="font-black text-blue-700 text-base">
                            මුළු මුදල: LKR {ord.totalAmountLKR.toLocaleString()}
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
                    <h2 className="text-lg font-black text-slate-900">නිල බිල්පත් සහ ගෙවීම් වාර්තා (Invoices)</h2>
                    <p className="text-xs text-slate-500 mt-0.5">ඔබ ගෙවූ සියලුම සාත්තු සේවා ගාස්තු සහ නිල බිල්පත්</p>
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="py-4 px-4">Invoice #</th>
                          <th className="py-4 px-4">සේවාව (Service)</th>
                          <th className="py-4 px-4">මුදල (Amount)</th>
                          <th className="py-4 px-4">ක්‍රමය (Method)</th>
                          <th className="py-4 px-4">දිනය (Date)</th>
                          <th className="py-4 px-4 text-right">තත්ත්වය (Status)</th>
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
                                Paid ✓
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
                      <h2 className="text-lg font-black text-slate-900">දැනුම්දීම් පුවරුව (Notifications)</h2>
                      <p className="text-xs text-slate-500 mt-0.5">සාත්තු සේවිකාවන් නිවසට පැමිණීම සහ සෞඛ්‍ය යාවත්කාලීන කිරීම්</p>
                    </div>
                    {user.notifications && user.notifications.length > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                      >
                        සියල්ල කියවූ බව සලකුණු කරන්න
                      </button>
                    )}
                  </div>

                  {!user.notifications || user.notifications.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
                      <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h4 className="text-base font-bold text-slate-800">නව දැනුම්දීම් නොමැත</h4>
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
                    <h2 className="text-lg font-black text-slate-900">24/7 හදිසි ඇමතුම් සහ සුවසැරිය (Emergency Services)</h2>
                    <p className="text-xs text-slate-500 mt-0.5">හදිසි රෝගී තත්ත්වයකදී හෝ ගිලන්රථ අවශ්‍යතාවයකදී ක්ෂණිකව අමතන්න</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* 1990 Suwa Seriya */}
                    <div className="p-5 rounded-3xl bg-red-50 border border-red-200 flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                          1990
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm">1990 සුවසැරිය (Suwa Seriya)</h4>
                          <p className="text-xs text-slate-600">නොමිලේ ගිලන්රථ සේවාව</p>
                        </div>
                      </div>
                      <a
                        href="tel:1990"
                        className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs"
                      >
                        Call 1990
                      </a>
                    </div>

                    {/* Prime Life Care 24/7 Hotline */}
                    <div className="p-5 rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                          <Phone className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm">Prime Life Care Hotline</h4>
                          <p className="text-xs text-slate-600">24/7 හෙද සහන සේවය</p>
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
                          <h4 className="font-black text-slate-900 text-sm">WhatsApp Doctor Consultation</h4>
                          <p className="text-xs text-slate-600">වෛද්‍ය උපදෙස් සහ බෙහෙත් විමසීම්</p>
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
                          <h4 className="font-black text-slate-900 text-sm">Colombo National Hospital</h4>
                          <p className="text-xs text-slate-600">හදිසි ප්‍රතිකාර ඒකකය</p>
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
