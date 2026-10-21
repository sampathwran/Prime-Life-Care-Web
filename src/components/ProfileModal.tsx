'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { BookingSubmission, PaymentRecord, EquipmentOrder, SavedPatient } from '@/types';
import {
  X,
  User,
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
  FileText,
  Check,
  MessageCircle,
  Stethoscope,
  Info
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
  
  // Tabs: bookings | notifications | editProfile | savedPatients | orders | payments | emergency
  const [activeTab, setActiveTab] = useState<
    'bookings' | 'notifications' | 'editProfile' | 'savedPatients' | 'orders' | 'payments' | 'emergency'
  >('bookings');

  // Edit Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [district, setDistrict] = useState(user?.district || 'Colombo (කොළඹ)');
  const [city, setCity] = useState(user?.city || 'Nugegoda');
  const [address, setAddress] = useState(user?.address || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [isSavedAlert, setIsSavedAlert] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Patient Form State
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientRelation, setNewPatientRelation] = useState('Father');
  const [newPatientAge, setNewPatientAge] = useState<number>(70);
  const [newPatientGender, setNewPatientGender] = useState<'male' | 'female'>('male');
  const [newPatientMobility, setNewPatientMobility] = useState('Wheelchair Assisted (රෝද පුටුව)');
  const [newPatientConditions, setNewPatientConditions] = useState('');

  // Sync state if user changes
  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setDistrict(user.district || 'Colombo (කොළඹ)');
      setCity(user.city || 'Nugegoda');
      setAddress(user.address || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const unreadNotificationsCount = user.notifications?.filter((n) => !n.isRead).length || 0;

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
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPhotoURL(base64String);
        updateUserProfile({ photoURL: base64String });
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
    setShowAddPatientModal(false);
    setNewPatientName('');
    setNewPatientConditions('');
  };

  const handleDeletePatient = async (patientId: string) => {
    const updatedPatients = (user.savedPatients || []).filter((p) => p.id !== patientId);
    await updateUserProfile({ savedPatients: updatedPatients });
  };

  const t = {
    si: {
      title: 'මගේ ගිණුම සහ සාත්තු පාලක පුවරුව',
      tabBookings: 'සාත්තු සේවා',
      tabNotifications: 'දැනුම්දීම්',
      tabEditProfile: 'තොරතුරු සංස්කරණය',
      tabFamily: 'සුරැකි රෝගීන් (පවුල)',
      tabOrders: 'උපකරණ ඇණවුම්',
      tabPayments: 'ගෙවීම් සහ බිල්පත්',
      tabEmergency: 'හදිසි ඇමතුම්',
      newBookingBtn: '+ අලුත් Booking එකක්',
      noBookings: 'ඔබ තවමත් කිසිදු සාත්තු සේවාවක් වෙන්කර ගෙන නොමැත.',
      noNotifications: 'කිසිදු නව දැනුම්දීමක් නොමැත.',
      markAllRead: 'සියල්ල කියවූ බව සලකුණු කරන්න',
      noOrders: 'ඔබ තවමත් කිසිදු උපකරණයක් ඇණවුම් කර නොමැත.',
      noPayments: 'ගෙවීම් වාර්තා නොමැත.',
      code: 'කේතය:',
      patient: 'රෝගියා:',
      service: 'සේවාව:',
      duration: 'කාලසීමාව:',
      staff: 'සාත්තු සේවකයා:',
      searchingStaff: 'සුදුසුකම්ලත් සේවකයෙකු යොමු කරමින් පවතී',
      total: 'මුදල:',
      status: 'තත්ත්වය:',
      deliveryAddress: 'බෙදාහැරීමේ ලිපිනය:',
      paymentMethod: 'ගෙවූ ක්‍රමය:',
      invoice: 'බිල්පත් අංකය:',
      date: 'දිනය:',
      signOut: 'ගිණුමෙන් ඉවත් වන්න (Sign Out)',
      close: 'වසන්න',
      saveChanges: 'තොරතුරු සුරකින්න',
      savedSuccess: 'ඔබගේ පැතිකඩ තොරතුරු සාර්ථකව සුරැකිණි!',
      changePhoto: 'ෆොටෝව වෙනස් කරන්න',
      fullName: 'සම්පූර්ණ නම',
      phoneWhatsapp: 'දුරකථන / WhatsApp අංකය',
      districtLabel: 'දිස්ත්‍රික්කය',
      cityLabel: 'නගරය / ප්‍රදේශය',
      houseAddress: 'නිවසේ ලිපිනය (සාත්තු සේවය සඳහා)',
      addPatientBtn: '+ අලුත් රෝගියෙකු ඇතුළත් කරන්න',
      patientName: 'රෝගියාගේ නම',
      relation: 'ඥාති සම්බන්ධතාවය',
      age: 'වයස',
      gender: 'ස්ත්‍රී / පුරුෂ භාවය',
      male: 'පුරුෂ (Male)',
      female: 'ස්ත්‍රී (Female)',
      mobility: 'ශාරීරික සංචලන තත්ත්වය (Mobility)',
      conditions: 'විශේෂ රෝග තත්ත්වයන් / සටහන්',
      addNow: 'ඇතුළත් කරන්න',
      cancel: 'අවලංගු කරන්න',
      callCaregiver: 'ඇමතුමක් ගන්න',
      whatsappCaregiver: 'WhatsApp පණිවිඩයක්',
      emergencyTitle: 'හදිසි අවස්ථා සහ වෛද්‍ය සහන සේවා (24/7 Hotlines)'
    },
    en: {
      title: 'My Profile & Patient Dashboard',
      tabBookings: 'Care Bookings',
      tabNotifications: 'Notifications',
      tabEditProfile: 'Edit Profile',
      tabFamily: 'Saved Patients',
      tabOrders: 'Equipment Orders',
      tabPayments: 'Invoices & Payments',
      tabEmergency: 'Emergency 24/7',
      newBookingBtn: '+ New Booking',
      noBookings: 'You have not placed any caregiver bookings yet.',
      noNotifications: 'No notifications at this moment.',
      markAllRead: 'Mark all as read',
      noOrders: 'You have not placed any equipment orders yet.',
      noPayments: 'No payment records found.',
      code: 'Code:',
      patient: 'Patient:',
      service: 'Service:',
      duration: 'Duration:',
      staff: 'Assigned Staff:',
      searchingStaff: 'Caregiver Assignment in Progress',
      total: 'Total:',
      status: 'Status:',
      deliveryAddress: 'Delivery Address:',
      paymentMethod: 'Payment Method:',
      invoice: 'Invoice #:',
      date: 'Date:',
      signOut: 'Sign Out',
      close: 'Close',
      saveChanges: 'Save Profile Changes',
      savedSuccess: 'Profile details saved successfully!',
      changePhoto: 'Change Photo',
      fullName: 'Full Name',
      phoneWhatsapp: 'Phone / WhatsApp Number',
      districtLabel: 'District',
      cityLabel: 'City / Area',
      houseAddress: 'Residential Address (For Caregiver Visits)',
      addPatientBtn: '+ Add Family Member / Patient',
      patientName: "Patient's Full Name",
      relation: 'Relationship',
      age: 'Age (Years)',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      mobility: 'Mobility Condition',
      conditions: 'Medical Conditions & Special Instructions',
      addNow: 'Save Patient Profile',
      cancel: 'Cancel',
      callCaregiver: 'Call Staff',
      whatsappCaregiver: 'WhatsApp',
      emergencyTitle: '24/7 Emergency & Medical Hotlines'
    },
    ta: {
      title: 'எனது கணக்கு மற்றும் பராமரிப்பு பலகை',
      tabBookings: 'முன்பதிவுகள்',
      tabNotifications: 'அறிவிப்புகள்',
      tabEditProfile: 'சுயவிவரம் திருத்து',
      tabFamily: 'சேமிக்கப்பட்ட நோயாளிகள்',
      tabOrders: 'உபகரண ஆர்டர்கள்',
      tabPayments: 'கட்டணங்கள்',
      tabEmergency: 'அவசர உதவி',
      newBookingBtn: '+ புதிய முன்பதிவு',
      noBookings: 'முன்பதிவுகள் எதுவும் இல்லை.',
      noNotifications: 'அறிவிப்புகள் இல்லை.',
      markAllRead: 'அனைத்தையும் வாசித்ததாக குறிக்கவும்',
      noOrders: 'ஆர்டர்கள் எதுவும் இல்லை.',
      noPayments: 'கட்டண பதிவுகள் இல்லை.',
      code: 'குறியீடு:',
      patient: 'நோயாளி:',
      service: 'சேவை:',
      duration: 'கால அளவு:',
      staff: 'பணியாளர்:',
      searchingStaff: 'பணியாளர் தேர்வு செய்யப்படுகிறார்',
      total: 'மொத்தம்:',
      status: 'நிலை:',
      deliveryAddress: 'முகவரி:',
      paymentMethod: 'முறை:',
      invoice: 'விலைப்பட்டியல்:',
      date: 'தேதி:',
      signOut: 'வெளியேறு',
      close: 'மூடுக',
      saveChanges: 'சேமிக்க',
      savedSuccess: 'சுயவிவரம் வெற்றிகரமாக சேமிக்கப்பட்டது!',
      changePhoto: 'புகைப்படத்தை மாற்றுக',
      fullName: 'முழு பெயர்',
      phoneWhatsapp: 'தொலைபேசி / வாட்ஸ்அப்',
      districtLabel: 'மாவட்டம்',
      cityLabel: 'நகரம்',
      houseAddress: 'முகவரி',
      addPatientBtn: '+ புதிய நோயாளியை சேர்க்க',
      patientName: 'நோயாளியின் பெயர்',
      relation: 'உறவுமுறை',
      age: 'வயது',
      gender: 'பாலினம்',
      male: 'ஆண்',
      female: 'பெண்',
      mobility: 'இயக்கம் நிலை',
      conditions: 'மருத்துவ நிலை / குறிப்புகள்',
      addNow: 'சேர்க்க',
      cancel: 'ரத்து',
      callCaregiver: 'அழைக்க',
      whatsappCaregiver: 'வாட்ஸ்அப்',
      emergencyTitle: '24/7 அவசர உதவி எண்கள்'
    }
  }[language];

  const getStatusBadge = (status: BookingSubmission['status']) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>ක්‍රියාත්මකයි (On Duty)</span>
          </span>
        );
      case 'caregiver_assigned':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Shield className="w-3 h-3 text-blue-600" />
            <span>සේවකයා පත්කළා (Assigned)</span>
          </span>
        );
      case 'pending_review':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* TOP PROFILE HEADER BANNER */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-10">
            {/* User Avatar + Identity Info */}
            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                {photoURL || user.photoURL ? (
                  <img
                    src={photoURL || user.photoURL}
                    alt={user.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-400/60 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
                    {user.name.charAt(0)}
                  </div>
                )}

                {/* Instant Change Photo Trigger */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md border-2 border-slate-900 transition-transform hover:scale-110 cursor-pointer"
                  title={t.changePhoto}
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-white">{user.name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    Verified Client
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>{user.email}</span>
                  <span>•</span>
                  <span className="font-semibold text-white">{user.phone}</span>
                </p>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{user.city ? `${user.city}, ` : ''}{user.district || 'Colombo (කොළඹ)'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Sign Out & Edit) */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('editProfile')}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-red-950/80 hover:text-red-300 text-slate-300 text-xs font-semibold border border-slate-700/80 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.signOut}</span>
              </button>
            </div>
          </div>

          {/* TAB NAVIGATION BAR (Horizontally scrollable with smooth badges) */}
          <div className="flex items-center gap-1.5 mt-5 pt-3 border-t border-slate-800/90 text-xs font-semibold overflow-x-auto no-scrollbar scroll-smooth">
            {/* 1. Bookings Tab */}
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'bookings'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t.tabBookings}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'bookings' ? 'bg-blue-800 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {bookings.length}
              </span>
            </button>

            {/* 2. Notifications Tab (With unread red counter) */}
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'notifications'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{t.tabNotifications}</span>
              {unreadNotificationsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-500 text-white animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* 3. Edit Profile Tab */}
            <button
              onClick={() => setActiveTab('editProfile')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'editProfile'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{t.tabEditProfile}</span>
            </button>

            {/* 4. Saved Family / Patients Tab */}
            <button
              onClick={() => setActiveTab('savedPatients')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'savedPatients'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t.tabFamily}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'savedPatients' ? 'bg-blue-800 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {user.savedPatients?.length || 0}
              </span>
            </button>

            {/* 5. Orders Tab */}
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'orders'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t.tabOrders}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'orders' ? 'bg-blue-800 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {orders.length}
              </span>
            </button>

            {/* 6. Payments Tab */}
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'payments'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{t.tabPayments}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'payments' ? 'bg-blue-800 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {payments.length}
              </span>
            </button>

            {/* 7. Emergency 24/7 Tab */}
            <button
              onClick={() => setActiveTab('emergency')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'emergency'
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                  : 'text-red-400 hover:bg-red-950/40'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>{t.tabEmergency}</span>
            </button>
          </div>
        </div>

        {/* MODAL BODY (Scrollable Area) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-slate-50/80">
          
          {/* TAB 1: CARE BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.tabBookings}</h4>
                  <p className="text-xs text-slate-500">ඔබගේ සියලුම සාත්තු සේවා සහ සේවක පත්කිරීම් වල තත්ත්වය</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenNewBooking();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.newBookingBtn}</span>
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-2xs">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700">{t.noBookings}</p>
                  <p className="text-xs text-slate-400 mt-1">ඔබට අවශ්‍ය ඕනෑම වේලාවක පළපුරුදු සාත්තු සේවකයෙකු වෙන්කරවා ගන්න.</p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenNewBooking();
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer hover:bg-blue-700"
                  >
                    {t.newBookingBtn}
                  </button>
                </div>
              ) : (
                bookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-blue-200 shadow-xs space-y-4 transition-all"
                  >
                    {/* Header: Code & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className="font-extrabold text-slate-900 text-base">{b.bookingCode}</span>
                        {b.staffTierName && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-100">
                            {b.staffTierName}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">Created: {b.startDate}</span>
                      </div>
                      {getStatusBadge(b.status)}
                    </div>

                    {/* Grid Details */}
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[11px] font-medium">{t.service}</span>
                        <span className="font-bold text-slate-900 mt-0.5 block">{b.serviceName}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[11px] font-medium">{t.patient}</span>
                        <span className="font-bold text-slate-800 mt-0.5 block">{b.patientName} ({b.patientAge} yrs)</span>
                        <span className="text-[10px] text-slate-500 capitalize">{b.mobilityLevel?.replace('_', ' ') || 'Normal Care'}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[11px] font-medium">{t.duration}</span>
                        <span className="font-bold text-slate-900 mt-0.5 block">{b.durationDays} Days Duty</span>
                        <span className="text-[10px] text-slate-500">From {b.startDate}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[11px] font-medium">{t.total}</span>
                        <span className="font-extrabold text-blue-700 text-sm mt-0.5 block">
                          LKR {(b.totalCostLKR || b.priceLKR).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold">Payment Confirmed</span>
                      </div>
                    </div>

                    {/* Assigned Caregiver Direct Contact Bar */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                          {b.assignedCaregiverName ? b.assignedCaregiverName.charAt(0) : <Shield className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="text-[11px] text-slate-500 font-semibold">{t.staff}</div>
                          <div className="font-bold text-slate-900 text-sm">
                            {b.assignedCaregiverName || t.searchingStaff}
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
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{t.callCaregiver}</span>
                            </a>
                            <a
                              href={`https://wa.me/${b.assignedCaregiverPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          </>
                        ) : (
                          <a
                            href="tel:+94771234567"
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Help Hotline: 077 123 4567</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: NOTIFICATIONS HUB */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.tabNotifications}</h4>
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
                <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-2xs">
                  <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700">{t.noNotifications}</p>
                </div>
              ) : (
                user.notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationAsRead(notif.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      notif.isRead
                        ? 'bg-white border-slate-200/80 text-slate-700'
                        : 'bg-blue-50/50 border-blue-200 text-slate-900 shadow-2xs'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      notif.type === 'clinical'
                        ? 'bg-emerald-100 text-emerald-700'
                        : notif.type === 'order'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {notif.type === 'clinical' ? (
                        <Stethoscope className="w-4 h-4" />
                      ) : notif.type === 'order' ? (
                        <Truck className="w-4 h-4" />
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
                      {notif.linkCode && (
                        <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                          Code: {notif.linkCode}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: EDIT PROFILE FORM */}
          {activeTab === 'editProfile' && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
              <div className="pb-4 border-b border-slate-100 mb-5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.tabEditProfile}</h4>
                  <p className="text-xs text-slate-500">ඔබගේ පුද්ගලික තොරතුරු සහ සාත්තු සේවා සපයන ලිපිනය යාවත්කාලීන කරන්න</p>
                </div>
                {isSavedAlert && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.savedSuccess}</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                {/* Profile Photo Uploader Section */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="relative">
                    {photoURL ? (
                      <img
                        src={photoURL}
                        alt="Profile Preview"
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-sm"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-sm">
                        {name.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5 text-center sm:text-left">
                    <label className="text-xs font-bold text-slate-900 block">Profile Avatar / පින්තූරය</label>
                    <p className="text-[11px] text-slate-500">JPG, PNG හෝ Google Avatar සෘජුවම ඇතුළත් කළ හැක.</p>
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1">
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
                        Use Initials Avatar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.fullName} *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="e.g. Rohan Jayasinghe"
                    />
                  </div>

                  {/* Phone / WhatsApp */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.phoneWhatsapp} *
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="077 123 4567"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* District Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.districtLabel} *
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                    >
                      {sriLankanDistricts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City / Area */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.cityLabel} *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="e.g. Nugegoda / Maharagama"
                    />
                  </div>
                </div>

                {/* House Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.houseAddress} *
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                    placeholder="No 24, Chapel Road, Nugegoda (නිවස සොයාගැනීමට පහසු ස්ථාන සටහන් කරන්න)"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{t.saveChanges}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: SAVED FAMILY / PATIENTS DIRECTORY */}
          {activeTab === 'savedPatients' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.tabFamily}</h4>
                  <p className="text-xs text-slate-500">නැවත නැවත විස්තර නොපුරවා ඉක්මනින් Booking කිරීමට පවුලේ සාමාජිකයන්ගේ විස්තර සුරකින්න</p>
                </div>
                <button
                  onClick={() => setShowAddPatientModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.addPatientBtn}</span>
                </button>
              </div>

              {/* Add Patient Modal / Form Drawer */}
              {showAddPatientModal && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-blue-500 shadow-md space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h5 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>{t.addPatientBtn}</span>
                    </h5>
                    <button
                      onClick={() => setShowAddPatientModal(false)}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleAddPatient} className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">{t.patientName} *</label>
                        <input
                          type="text"
                          value={newPatientName}
                          onChange={(e) => setNewPatientName(e.target.value)}
                          placeholder="e.g. Sunil Jayasinghe"
                          required
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">{t.relation} *</label>
                        <select
                          value={newPatientRelation}
                          onChange={(e) => setNewPatientRelation(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                          value={newPatientAge}
                          onChange={(e) => setNewPatientAge(Number(e.target.value))}
                          required
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">{t.gender}</label>
                        <select
                          value={newPatientGender}
                          onChange={(e) => setNewPatientGender(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="male">{t.male}</option>
                          <option value="female">{t.female}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">{t.mobility}</label>
                        <select
                          value={newPatientMobility}
                          onChange={(e) => setNewPatientMobility(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddPatientModal(false)}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                      >
                        {t.addNow}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* List of Saved Patients */}
              {!user.savedPatients || user.savedPatients.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-2xs">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700">සුරැකි රෝගීන් නොමැත.</p>
                  <p className="text-xs text-slate-400 mt-1">ඉක්මන් booking සඳහා පවුලේ වැඩිහිටියන්ගේ හෝ රෝගීන්ගේ විස්තර මෙහි එක් කරන්න.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3.5">
                  {user.savedPatients.map((pat) => (
                    <div
                      key={pat.id}
                      className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 hover:border-blue-200 shadow-xs space-y-3 relative group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-100">
                            {pat.name.charAt(0)}
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 text-sm">{pat.name}</h5>
                            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                              {pat.relation} • {pat.age} yrs • {pat.gender}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeletePatient(pat.id)}
                          className="text-slate-300 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
                          title="Delete Patient"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-xs space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 font-medium">Mobility: </span>
                          <span className="font-semibold text-slate-800">{pat.mobility}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">Conditions: </span>
                          <span className="text-slate-700">{pat.conditions}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onClose();
                          onOpenNewBooking();
                        }}
                        className="w-full py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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

          {/* TAB 5: EQUIPMENT ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.tabOrders}</h4>
                  <p className="text-xs text-slate-500">Medical store උපකරණ මිලදී ගැනීම් සහ කුලියට ගැනීම් (Rentals)</p>
                </div>
                <a
                  href="/#store"
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Go to Store</span>
                </a>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-2xs">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700">{t.noOrders}</p>
                  <p className="text-xs text-slate-400 mt-1">Wheelchairs, Hospital Beds, Oxygen Concentrators ඇතුළු උපකරණ ඇණවුම් කරන්න.</p>
                </div>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{ord.orderCode}</span>
                        <span className="text-[11px] text-slate-400">{ord.createdAt}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 flex items-center gap-1 border border-blue-100">
                        <Truck className="w-3 h-3" />
                        <span>{ord.status.toUpperCase()}</span>
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between p-2 rounded-lg bg-slate-50">
                          <span className="font-semibold text-slate-800">{it.quantity}x {it.name}</span>
                          <span className="font-bold text-slate-900">LKR {(it.priceLKR * it.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
                      <span>{t.deliveryAddress} <strong className="text-slate-800">{ord.deliveryAddress}</strong></span>
                      <span className="font-extrabold text-blue-700 text-sm">
                        {t.total} LKR {ord.totalAmountLKR.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 6: INVOICES & PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.tabPayments}</h4>
                  <p className="text-xs text-slate-500">ඔබගේ සියලුම ගෙවීම් සහ නිල බිල්පත් වාර්තා (Official Invoices)</p>
                </div>
              </div>

              {payments.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-2xs">
                  <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700">{t.noPayments}</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-3.5">Invoice</th>
                        <th className="py-3 px-3.5">Service</th>
                        <th className="py-3 px-3.5">Amount</th>
                        <th className="py-3 px-3.5">Method</th>
                        <th className="py-3 px-3.5">Date</th>
                        <th className="py-3 px-3.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/60">
                          <td className="py-3.5 px-3.5 font-bold text-slate-900">{p.invoiceNumber}</td>
                          <td className="py-3.5 px-3.5 text-slate-600 max-w-[180px] truncate">{p.serviceName}</td>
                          <td className="py-3.5 px-3.5 font-extrabold text-blue-700">LKR {p.amountLKR.toLocaleString()}</td>
                          <td className="py-3.5 px-3.5 text-slate-500 capitalize">{p.paymentMethod.replace('_', ' ')}</td>
                          <td className="py-3.5 px-3.5 text-slate-500">{p.paymentDate}</td>
                          <td className="py-3.5 px-3.5 text-right">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {p.status === 'paid' ? 'Paid' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: 24/7 EMERGENCY & MEDICAL ASSISTANCE */}
          {activeTab === 'emergency' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{t.emergencyTitle}</h4>
                <p className="text-xs text-slate-500">හදිසි රෝගී තත්ත්වයකදී හෝ ගිලන්රථ අවශ්‍යතාවයකදී ක්ෂණිකව අමතන්න</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                {/* 1990 Suwa Seriya */}
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                      1990
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">1990 සුවසැරිය (Suwa Seriya)</h5>
                      <p className="text-xs text-slate-600">නොමිලේ ගිලන්රථ සේවාව (Free Ambulance)</p>
                    </div>
                  </div>
                  <a
                    href="tel:1990"
                    className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    Call 1990
                  </a>
                </div>

                {/* Prime Life Care 24/7 Hotline */}
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">Prime Life Care Hotline</h5>
                      <p className="text-xs text-slate-600">24/7 රෝගී සහන සහ හෙද සම්බන්ධීකරණය</p>
                    </div>
                  </div>
                  <a
                    href="tel:+94771234567"
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    077 123 4567
                  </a>
                </div>

                {/* WhatsApp Doctor on Duty */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">WhatsApp Doctor Support</h5>
                      <p className="text-xs text-slate-600">වෛද්‍ය උපදෙස් සහ බෙහෙත් වට්ටෝරු විමසීම්</p>
                    </div>
                  </div>
                  <a
                    href="https://wa.me/94771234567"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    WhatsApp
                  </a>
                </div>

                {/* National Hospital Emergency */}
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold shadow-sm">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">Colombo National Hospital</h5>
                      <p className="text-xs text-slate-600">හදිසි ප්‍රතිකාර ඒකකය (Accident Service)</p>
                    </div>
                  </div>
                  <a
                    href="tel:0112691111"
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    011 269 1111
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 hidden sm:block">
            <span>Prime Life Care (Pvt) Ltd • Certified Healthcare Sri Lanka</span>
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
