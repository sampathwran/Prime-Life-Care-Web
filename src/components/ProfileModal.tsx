'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { BookingSubmission, PaymentRecord, EquipmentOrder, SavedPatient } from '@/types';
import {
  X,
  User,
  Calendar,
  CreditCard,
  Phone,
  MapPin,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
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
  ChevronRight
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: BookingSubmission[];
  payments: PaymentRecord[];
  orders: EquipmentOrder[];
  onOpenNewBooking: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  bookings,
  payments,
  orders,
  onOpenNewBooking
}) => {
  const { user, logout, updateUserProfile, markNotificationAsRead, markAllNotificationsAsRead } = useAuth();
  const { language } = useLanguage();

  // 4 Clear, Standard Tabs: bookings | details | family | notifications
  const [activeTab, setActiveTab] = useState<'bookings' | 'details' | 'family' | 'notifications'>('bookings');

  // Edit Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [district, setDistrict] = useState(user?.district || 'Colombo (කොළඹ)');
  const [city, setCity] = useState(user?.city || 'Colombo');
  const [address, setAddress] = useState(user?.address || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Patient Form State
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientRelation, setNewPatientRelation] = useState('Father');
  const [newPatientAge, setNewPatientAge] = useState<number>(72);
  const [newPatientGender, setNewPatientGender] = useState<'male' | 'female'>('male');
  const [newPatientMobility, setNewPatientMobility] = useState('Wheelchair Assisted (රෝද පුටුව)');
  const [newPatientConditions, setNewPatientConditions] = useState('');

  // Synchronize when user updates
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setDistrict(user.district || 'Colombo (කොළඹ)');
      setCity(user.city || 'Colombo');
      setAddress(user.address || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const unreadCount = user.notifications?.filter((n) => !n.isRead).length || 0;

  const sriLankanDistricts = [
    'Colombo (කොළඹ)',
    'Gampaha (ගම්පහ)',
    'Kalutara (කළුතර)',
    'Kandy (මහනුවර)',
    'Matale (මාතලේ)',
    'Nuwara Eliya (නුවරඑළිය)',
    'Galle (ගාල්ල)',
    'Matara (මාතර)',
    'Hambantota (හම්බන්තොට)',
    'Jaffna (යාපනය)',
    'Kilinochchi (කිලිනොච්චිය)',
    'Mannar (මන්නාරම)',
    'Vavuniya (වවුනියාව)',
    'Mullaitivu (මුලතිව්)',
    'Batticaloa (මඩකලපුව)',
    'Ampara (අම්පාර)',
    'Trincomalee (ත්‍රිකුණාමලය)',
    'Kurunegala (කුරුණෑගල)',
    'Puttalam (පුත්තලම)',
    'Anuradhapura (අනුරාධපුරය)',
    'Polonnaruwa (පොළොන්නරුව)',
    'Badulla (බදුල්ල)',
    'Monaragala (මොනරාගල)',
    'Ratnapura (රත්නපුර)',
    'Kegalle (කෑගල්ල)'
  ];

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!newPatientName.trim()) return;

    const newPatient: SavedPatient = {
      id: `p_${Date.now()}`,
      name: newPatientName.trim(),
      relation: newPatientRelation,
      age: Number(newPatientAge) || 60,
      gender: newPatientGender,
      mobility: newPatientMobility,
      conditions: newPatientConditions.trim() || 'General care assistance'
    };

    const updatedPatients = [...(user.savedPatients || []), newPatient];
    await updateUserProfile({ savedPatients: updatedPatients });
    setShowAddPatient(false);
    setNewPatientName('');
    setNewPatientConditions('');
  };

  const handleDeletePatient = async (patientId: string) => {
    const updatedPatients = (user.savedPatients || []).filter((p) => p.id !== patientId);
    await updateUserProfile({ savedPatients: updatedPatients });
  };

  const t = {
    si: {
      accountTitle: 'මගේ ගිණුම',
      tabBookings: 'සාත්තු සේවා (Bookings)',
      tabDetails: 'පුද්ගලික තොරතුරු (Profile)',
      tabFamily: 'පවුලේ සාමාජිකයන් (Family)',
      tabNotifications: 'දැනුම්දීම් (Alerts)',
      newBookingBtn: '+ අලුත් Booking එකක්',
      noBookings: 'ඔබ තවමත් කිසිදු සාත්තු සේවාවක් වෙන්කර ගෙන නොමැත.',
      noBookingsSub: 'ඔබගේ නිවසටම පළපුරුදු හෙද හෝ සාත්තු සේවකයෙකු පහසුවෙන් වෙන්කරවා ගන්න.',
      noFamily: 'සුරැකි රෝගීන් නොමැත.',
      noFamilySub: 'ඉක්මන් booking සඳහා පවුලේ වැඩිහිටියන්ගේ හෝ රෝගීන්ගේ විස්තර මෙහි සුරකින්න.',
      noNotifications: 'කිසිදු නව දැනුම්දීමක් නොමැත.',
      markAllRead: 'සියල්ල කියවූ බව සලකුණු කරන්න',
      signOut: 'ඉවත් වන්න (Sign Out)',
      saveChanges: 'තොරතුරු සුරකින්න',
      savedSuccess: 'තොරතුරු සාර්ථකව සුරැකිණි!',
      changePhoto: 'ඡායාරූපය වෙනස් කරන්න',
      fullName: 'සම්පූර්ණ නම',
      phone: 'දුරකථන / WhatsApp අංකය',
      district: 'දිස්ත්‍රික්කය',
      city: 'නගරය',
      address: 'නිවසේ ලිපිනය',
      addPatientBtn: '+ අලුත් රෝගියෙකු ඇතුළත් කරන්න',
      patientName: 'රෝගියාගේ සම්පූර්ණ නම',
      relation: 'ඥාති සම්බන්ධය',
      age: 'වයස',
      gender: 'ස්ත්‍රී / පුරුෂ භාවය',
      mobility: 'ශාරීරික සංචලනය',
      conditions: 'විශේෂ රෝග තත්ත්වයන් / සටහන්',
      addNow: 'ඇතුළත් කරන්න',
      cancel: 'අවලංගු කරන්න',
      callCaregiver: 'ඇමතුමක්',
      whatsappCaregiver: 'WhatsApp',
      close: 'වසන්න'
    },
    en: {
      accountTitle: 'My Account',
      tabBookings: 'Care Bookings',
      tabDetails: 'Personal Profile',
      tabFamily: 'Family Directory',
      tabNotifications: 'Notifications',
      newBookingBtn: '+ New Booking',
      noBookings: 'No caregiver bookings placed yet.',
      noBookingsSub: 'Book a certified caregiver or registered nurse for home care with one click.',
      noFamily: 'No saved family members yet.',
      noFamilySub: 'Save your elderly family members to book care instantly without re-typing details.',
      noNotifications: 'No notifications at this moment.',
      markAllRead: 'Mark all as read',
      signOut: 'Sign Out',
      saveChanges: 'Save Changes',
      savedSuccess: 'Profile updated successfully!',
      changePhoto: 'Change Photo',
      fullName: 'Full Name',
      phone: 'Phone / WhatsApp Number',
      district: 'District',
      city: 'City / Area',
      address: 'Residential Address',
      addPatientBtn: '+ Add Family Member',
      patientName: "Patient's Full Name",
      relation: 'Relationship',
      age: 'Age',
      gender: 'Gender',
      mobility: 'Mobility Condition',
      conditions: 'Medical Conditions / Notes',
      addNow: 'Save Profile',
      cancel: 'Cancel',
      callCaregiver: 'Call Staff',
      whatsappCaregiver: 'WhatsApp',
      close: 'Close'
    },
    ta: {
      accountTitle: 'எனது கணக்கு',
      tabBookings: 'முன்பதிவுகள்',
      tabDetails: 'சுயவிவரம்',
      tabFamily: 'குடும்பத்தினர்',
      tabNotifications: 'அறிவிப்புகள்',
      newBookingBtn: '+ புதிய முன்பதிவு',
      noBookings: 'முன்பதிவுகள் எதுவும் இல்லை.',
      noBookingsSub: 'உங்கள் வீட்டிற்கு பராமரிப்பாளர்களை எளிதாக முன்பதிவு செய்யுங்கள்.',
      noFamily: 'நோயாளிகள் சேமிக்கப்படவில்லை.',
      noFamilySub: 'விரைவான முன்பதிவுக்கு குடும்ப உறுப்பினர்களை சேர்க்கவும்.',
      noNotifications: 'அறிவிப்புகள் இல்லை.',
      markAllRead: 'அனைத்தையும் வாசித்ததாக குறிக்கவும்',
      signOut: 'வெளியேறு',
      saveChanges: 'சேமிக்க',
      savedSuccess: 'வெற்றிகரமாக சேமிக்கப்பட்டது!',
      changePhoto: 'புகைப்படத்தை மாற்றுக',
      fullName: 'முழு பெயர்',
      phone: 'தொலைபேசி / வாட்ஸ்அப்',
      district: 'மாவட்டம்',
      city: 'நகரம்',
      address: 'முகவரி',
      addPatientBtn: '+ நோயாளியை சேர்க்க',
      patientName: 'நோயாளியின் பெயர்',
      relation: 'உறவுமுறை',
      age: 'வயது',
      gender: 'பாலினம்',
      mobility: 'இயக்கம் நிலை',
      conditions: 'மருத்துவ நிலை',
      addNow: 'சேர்க்க',
      cancel: 'ரத்து',
      callCaregiver: 'அழைக்க',
      whatsappCaregiver: 'வாட்ஸ்அப்',
      close: 'மூடுக'
    }
  }[language];

  const getStatusBadge = (status: BookingSubmission['status']) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ක්‍රියාත්මකයි (On Duty)</span>
          </span>
        );
      case 'caregiver_assigned':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>සේවකයා පත්කළා (Assigned)</span>
          </span>
        );
      case 'pending_review':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>සලකා බලමින් (Pending)</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            අවසන් (Completed)
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* CLEAN, LIGHT, STANDARD WEBSITE HEADER */}
        <div className="bg-white border-b border-slate-100 p-5 sm:p-6 pb-0 shrink-0">
          
          {/* Top Row: User Summary + Sign Out + Close */}
          <div className="flex items-start justify-between gap-4">
            
            {/* User Identity Card */}
            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                {photoURL || user.photoURL ? (
                  <img
                    src={photoURL || user.photoURL}
                    alt={user.name}
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border border-slate-200 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-sm">
                    {user.name.charAt(0) || 'U'}
                  </div>
                )}

                {/* Instant Change Photo Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md border-2 border-white transition-all cursor-pointer"
                  title={t.changePhoto}
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{user.name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    Client Account
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>{user.email}</span>
                  {user.phone && (
                    <>
                      <span>•</span>
                      <span className="font-semibold text-slate-800">{user.phone}</span>
                    </>
                  )}
                </p>
                {user.city && (
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{user.city}, {user.district || 'Colombo'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Buttons: Sign Out & Close */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-slate-600 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.signOut}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* CLEAN, SPACIOUS SEGMENTED NAVIGATION TABS */}
          <div className="flex items-center gap-2 sm:gap-4 mt-6 border-b border-slate-200 text-xs sm:text-sm font-bold overflow-x-auto no-scrollbar">
            
            {/* Tab 1: Bookings */}
            <button
              onClick={() => setActiveTab('bookings')}
              className={`pb-3.5 px-1 border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'bookings'
                  ? 'border-blue-600 text-blue-600 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{t.tabBookings}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'bookings' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {bookings.length}
              </span>
            </button>

            {/* Tab 2: Personal Profile */}
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3.5 px-1 border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'details'
                  ? 'border-blue-600 text-blue-600 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{t.tabDetails}</span>
            </button>

            {/* Tab 3: Saved Family / Patients */}
            <button
              onClick={() => setActiveTab('family')}
              className={`pb-3.5 px-1 border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'family'
                  ? 'border-blue-600 text-blue-600 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t.tabFamily}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'family' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {user.savedPatients?.length || 0}
              </span>
            </button>

            {/* Tab 4: Notifications */}
            <button
              onClick={() => setActiveTab('notifications')}
              className={`pb-3.5 px-1 border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'notifications'
                  ? 'border-blue-600 text-blue-600 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>{t.tabNotifications}</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* MODAL BODY (Spacious, Clean, High Contrast) */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 bg-slate-50">
          
          {/* TAB 1: CARE BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">{t.tabBookings}</h4>
                  <p className="text-xs text-slate-500">ඔබ වෙන්කරගත් සාත්තු සේවාවන් සහ පැමිණෙන සේවකයන්ගේ තොරතුරු</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenNewBooking();
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.newBookingBtn}</span>
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-14 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h5 className="text-sm font-bold text-slate-800">{t.noBookings}</h5>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">{t.noBookingsSub}</p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenNewBooking();
                    }}
                    className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer transition-all"
                  >
                    {t.newBookingBtn}
                  </button>
                </div>
              ) : (
                bookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 shadow-xs space-y-4 transition-all"
                  >
                    {/* Booking Header: Code + Status Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className="font-extrabold text-slate-900 text-base">{b.bookingCode}</span>
                        {b.staffTierName && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                            {b.staffTierName}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">Date: {b.startDate}</span>
                      </div>
                      {getStatusBadge(b.status)}
                    </div>

                    {/* Booking Details Grid */}
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[11px] font-medium">සේවාව (Service)</span>
                        <strong className="text-slate-900 text-sm mt-0.5 block">{b.serviceName}</strong>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[11px] font-medium">රෝගියා (Patient)</span>
                        <strong className="text-slate-900 text-sm mt-0.5 block">{b.patientName} ({b.patientAge} yrs)</strong>
                        <span className="text-[11px] text-slate-500 capitalize">{b.mobilityLevel?.replace('_', ' ') || 'Normal'}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[11px] font-medium">කාලය (Duration)</span>
                        <strong className="text-slate-900 text-sm mt-0.5 block">{b.durationDays} Days Duty</strong>
                        <span className="text-[11px] text-slate-500">From {b.startDate}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[11px] font-medium">ගෙවීම (Total Cost)</span>
                        <strong className="text-blue-700 text-sm mt-0.5 block font-black">
                          LKR {(b.totalCostLKR || b.priceLKR).toLocaleString()}
                        </strong>
                        <span className="text-[10px] text-emerald-600 font-bold">Confirmed</span>
                      </div>
                    </div>

                    {/* Assigned Caregiver Contact Bar */}
                    <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                          {b.assignedCaregiverName ? b.assignedCaregiverName.charAt(0) : <Shield className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="text-[11px] text-slate-500 font-semibold">සාත්තු සේවකයා (Assigned Staff)</div>
                          <div className="font-bold text-slate-900 text-sm">
                            {b.assignedCaregiverName || 'සුදුසුකම්ලත් සේවකයෙකු පත්කරමින් පවතී (Assigning...)'}
                          </div>
                          {b.assignedCaregiverPhone && (
                            <div className="text-xs text-blue-700 font-medium">{b.assignedCaregiverPhone}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {b.assignedCaregiverPhone ? (
                          <>
                            <a
                              href={`tel:${b.assignedCaregiverPhone}`}
                              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{t.callCaregiver}</span>
                            </a>
                            <a
                              href={`https://wa.me/${b.assignedCaregiverPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>{t.whatsappCaregiver}</span>
                            </a>
                          </>
                        ) : (
                          <a
                            href="tel:+94771234567"
                            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
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

          {/* TAB 2: PERSONAL PROFILE & EDIT FORM */}
          {activeTab === 'details' && (
            <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-xs">
              <div className="pb-4 border-b border-slate-100 mb-6 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">{t.tabDetails}</h4>
                  <p className="text-xs text-slate-500">ඔබගේ පුද්ගලික තොරතුරු සහ සේවාව සපයන නිවසේ ලිපිනය</p>
                </div>
                {isSavedSuccess && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.savedSuccess}</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                {/* Avatar Preview & Action */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  {photoURL ? (
                    <img
                      src={photoURL}
                      alt="Avatar"
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center">
                      {name.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="text-center sm:text-left">
                    <span className="text-xs font-bold text-slate-900 block">Profile Avatar</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">ඔබගේ ඡායාරූපය Phone එකෙන් හෝ PC එකෙන් Upload කරන්න.</p>
                    <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoURL(`https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=0D8ABC&color=fff&rounded=true`)}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Reset Avatar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.fullName} *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-blue-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.phone} *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-blue-600 transition-all"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.district} *</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-blue-600 transition-all bg-white"
                    >
                      {sriLankanDistricts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.city} *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Nugegoda / Maharagama"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-blue-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.address} *</label>
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="No 24, Chapel Road, Nugegoda (සාත්තු සේවකයාට නිවස සොයාගැනීමට පහසු ස්ථාන)"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-blue-600 transition-all resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{t.saveChanges}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: SAVED FAMILY / PATIENTS */}
          {activeTab === 'family' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">{t.tabFamily}</h4>
                  <p className="text-xs text-slate-500">නැවත නැවත විස්තර නොපුරවා ඉක්මනින් Caregiver කෙනෙකු වෙන්කරවා ගැනීමට පවුලේ සාමාජිකයන්</p>
                </div>
                <button
                  onClick={() => setShowAddPatient(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addPatientBtn}</span>
                </button>
              </div>

              {/* Add Patient Card Form */}
              {showAddPatient && (
                <div className="bg-white rounded-2xl p-5 border-2 border-blue-500 shadow-md space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h5 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>{t.addPatientBtn}</span>
                    </h5>
                    <button
                      onClick={() => setShowAddPatient(false)}
                      className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleAddPatient} className="space-y-3.5">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">{t.patientName} *</label>
                        <input
                          type="text"
                          required
                          value={newPatientName}
                          onChange={(e) => setNewPatientName(e.target.value)}
                          placeholder="e.g. Sunil Jayasinghe"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">{t.relation} *</label>
                        <select
                          value={newPatientRelation}
                          onChange={(e) => setNewPatientRelation(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600 bg-white"
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

                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">{t.age} *</label>
                        <input
                          type="number"
                          required
                          value={newPatientAge}
                          onChange={(e) => setNewPatientAge(Number(e.target.value))}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">{t.gender}</label>
                        <select
                          value={newPatientGender}
                          onChange={(e) => setNewPatientGender(e.target.value as any)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600 bg-white"
                        >
                          <option value="male">පුරුෂ (Male)</option>
                          <option value="female">ස්ත්‍රී (Female)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">{t.mobility}</label>
                        <select
                          value={newPatientMobility}
                          onChange={(e) => setNewPatientMobility(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600 bg-white"
                        >
                          <option value="Wheelchair Assisted (රෝද පුටුව)">Wheelchair Assisted (රෝද පුටුව)</option>
                          <option value="Bedridden (ඇඳ මත සිටින)">Bedridden (ඇඳ මත සිටින)</option>
                          <option value="Walking Stick (සැරයටිය)">Walking Stick (සැරයටිය)</option>
                          <option value="Normal / Mobile (සාමාන්‍ය)">Normal / Mobile (සාමාන්‍ය)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t.conditions}</label>
                      <input
                        type="text"
                        value={newPatientConditions}
                        onChange={(e) => setNewPatientConditions(e.target.value)}
                        placeholder="e.g. Hypertension, Diabetes, Post-stroke rehab, Bed sore care"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddPatient(false)}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                      >
                        {t.addNow}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Patient Cards */}
              {!user.savedPatients || user.savedPatients.length === 0 ? (
                <div className="text-center py-14 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h5 className="text-sm font-bold text-slate-800">{t.noFamily}</h5>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">{t.noFamilySub}</p>
                  <button
                    onClick={() => setShowAddPatient(true)}
                    className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer transition-all"
                  >
                    {t.addPatientBtn}
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {user.savedPatients.map((pat) => (
                    <div
                      key={pat.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 font-extrabold text-base flex items-center justify-center border border-blue-100 shrink-0">
                            {pat.name.charAt(0)}
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 text-sm">{pat.name}</h5>
                            <span className="text-xs text-blue-600 font-semibold">
                              {pat.relation} • {pat.age} yrs • {pat.gender}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeletePatient(pat.id)}
                          className="text-slate-300 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
                          title="Remove Patient"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-700">
                        <div>
                          <span className="text-slate-400 font-medium">Mobility: </span>
                          <strong className="text-slate-800 font-semibold">{pat.mobility}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">Conditions: </span>
                          <span>{pat.conditions}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onClose();
                          onOpenNewBooking();
                        }}
                        className="w-full py-2 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>Book Caregiver for {pat.name.split(' ')[0]}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h4 className="text-base font-bold text-slate-900">{t.tabNotifications}</h4>
                  <p className="text-xs text-slate-500">සාත්තු සේවිකාවන් පැමිණීම සහ සෞඛ්‍ය යාවත්කාලීන කිරීම්</p>
                </div>
                {user.notifications && user.notifications.length > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                  >
                    {t.markAllRead}
                  </button>
                )}
              </div>

              {!user.notifications || user.notifications.length === 0 ? (
                <div className="text-center py-14 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                  <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h5 className="text-sm font-bold text-slate-800">{t.noNotifications}</h5>
                </div>
              ) : (
                user.notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationAsRead(notif.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      notif.isRead
                        ? 'bg-white border-slate-200 text-slate-700'
                        : 'bg-blue-50/50 border-blue-200 text-slate-900 shadow-2xs'
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 shrink-0 mt-0.5">
                      {notif.type === 'clinical' ? (
                        <Stethoscope className="w-4 h-4" />
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          <span>{notif.title}</span>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                          )}
                        </h5>
                        <span className="text-[11px] text-slate-400 shrink-0">{notif.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-bold text-slate-700">Prime Life Care Hotline:</span>
            <a href="tel:+94771234567" className="text-blue-600 font-bold hover:underline">077 123 4567</a>
            <span className="hidden sm:inline">• 24/7 Home Care Support</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer ml-auto"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
};
