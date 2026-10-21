'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProfileModal } from '@/components/ProfileModal';
import { AuthModal } from '@/components/AuthModal';
import { BookingModal } from '@/components/BookingModal';
import { GoogleOneTapPrompt } from '@/components/GoogleOneTapPrompt';
import { initialMedicalItems } from '@/data/medicalItems';
import { initialServices, districtList } from '@/data/services';
import { MedicalItem, EquipmentOrder, BookingSubmission, PaymentRecord } from '@/types';
import { saveOrderToFirestore } from '@/lib/firestoreService';
import {
  ShoppingBag,
  Search,
  Filter,
  Truck,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowRight,
  Building,
  Banknote,
  Home,
  Heart,
  PhoneCall
} from 'lucide-react';

export default function StorePage() {
  const { language } = useLanguage();
  const { user, openAuthModal } = useAuth();

  // Categories & Search Filter
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterRentOnly, setFilterRentOnly] = useState<boolean>(false);

  // Active Image Slide Index map per item
  const [activeImageIndex, setActiveImageIndex] = useState<{ [itemId: string]: number }>({});

  // Product Detail / Order Modal State
  const [selectedItemForOrder, setSelectedItemForOrder] = useState<MedicalItem | null>(null);
  const [modalImageIndex, setModalImageIndex] = useState<number>(0);
  const [orderType, setOrderType] = useState<'buy' | 'rent'>('buy');
  const [quantity, setQuantity] = useState<number>(1);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [district, setDistrict] = useState<string>(districtList[0]);
  const [contactName, setContactName] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer' | 'online_card'>('cod');
  const [orderSuccess, setOrderSuccess] = useState<EquipmentOrder | null>(null);

  // Global modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Orders and Payments state
  const [orders, setOrders] = useState<EquipmentOrder[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([
    {
      id: 'pay_init',
      invoiceNumber: 'INV-2026-1049',
      bookingCode: 'ORD-2026-1049',
      serviceName: 'Medical Equipment: Anti-Bedsore Ripple Air Mattress',
      amountLKR: 14500,
      paymentDate: '2026-10-10',
      paymentMethod: 'cod',
      status: 'paid'
    }
  ]);
  const [bookings] = useState<BookingSubmission[]>([]);

  const t = {
    si: {
      breadcrumb: 'මුල් පිටුව / රෝගී සත්කාරක උපකරණ වෙළඳසැල',
      title: 'ප්‍රයිම් රෝගී සත්කාරක උපකරණ වෙළඳසැල',
      subtitle: 'රෝහල් ඇඳන්, එයාර් මෙට්ට, රෝද පුටු සහ වැඩිහිටි ඩයපර් ඇතුළු සියලුම සත්කාරක ද්‍රව්‍ය නිවසටම ගෙන්වා ගන්න.',
      searchPlaceholder: 'භාණ්ඩ නම හෝ වර්ගය සොයන්න (උදා: රෝද පුටුව, ඇඳ, ඩයපර්)...',
      allCategories: 'සියලුම භාණ්ඩ',
      catEquipment: 'රෝහල් ඇඳන් සහ මෙට්ට',
      catMobility: 'රෝද පුටු සහ ඇවිදින ආධාරක',
      catHygiene: 'වැඩිහිටි ඩයපර් සහ සනීපාරක්ෂාව',
      catMonitoring: 'රුධිර පීඩන සහ සීනි මාපක',
      rentFilter: 'කුලියට ලබාදෙන භාණ්ඩ පමණක්',
      buyBtn: 'මිලදී ගන්න',
      rentBtn: 'කුලියට ගන්න',
      stockIn: 'තොග ඇත',
      pricePrefix: 'රු.',
      deliveryTitle: 'දිවයින පුරා ආරක්ෂිත ප්‍රවාහනය',
      deliveryDesc: 'කොළඹ ඇතුළු සියලුම දිස්ත්‍රික්කවලට පැය 24-48ක් තුළ නිවසටම බෙදාහැරීම.',
      paymentMethodsTitle: 'පහසු ගෙවීම් ක්‍රම',
      paymentMethodsDesc: 'ලැබුණු පසු මුදල් ගෙවීම (COD), බැංකු තැන්පතු හෝ කාඩ්පත් මඟින් ගෙවීම් පහසුකම්.',
      modalTitle: 'භාණ්ඩය පිළිබඳ විස්තර සහ ඇණවුම් කිරීම',
      modalSubtitle: 'ඡායාරූප 1-5 දක්වා ස්ලයිඩ් කර බලන්න සහ ඇණවුම සම්පූර්ණ කරන්න.',
      imageCount: 'ඡායාරූපය',
      deliveryDetails: 'බෙදාහැරීමේ ලිපිනය සහ විස්තර',
      paymentMethodLabel: 'ගෙවීම් ක්‍රමය තෝරන්න',
      cod: 'ලැබුණු පසු මුදල් ගෙවීම (COD)',
      bank: 'කොමර්ෂල් බැංකු ගිණුමට මුදල් තැන්පත් කිරීම',
      card: 'ඔන්ලයින් කාඩ්පත් ගෙවීම (Visa / Mastercard)',
      confirmBtn: 'ඇණවුම තහවුරු කරන්න',
      successTitle: 'ඔබගේ ඇණවුම සාර්ථකව ලැබිණි!',
      successSub: 'ඇණවුම් අංකය:',
      viewInProfile: 'මගේ ගිණුමෙන් ඇණවුම බලන්න',
      closeBtn: 'අවසන් කරන්න',
      backToHome: 'මුල් පිටුවට ආපසු'
    },
    en: {
      breadcrumb: 'Home / Medical Equipment & Patient Care Store',
      title: 'Prime Medical Equipment & Supplies Store',
      subtitle: 'Doorstep delivery of hospital beds, anti-bedsore mattresses, wheelchairs, and adult diapers across Sri Lanka.',
      searchPlaceholder: 'Search products by name or category (e.g. wheelchair, bed, diapers)...',
      allCategories: 'All Products',
      catEquipment: 'Hospital Beds & Mattresses',
      catMobility: 'Wheelchairs & Walkers',
      catHygiene: 'Adult Diapers & Hygiene',
      catMonitoring: 'BP Monitors & Diagnostics',
      rentFilter: 'Rentals Only',
      buyBtn: 'Order to Buy',
      rentBtn: 'Rent Monthly',
      stockIn: 'In Stock',
      pricePrefix: 'LKR',
      deliveryTitle: 'Islandwide Safe Delivery',
      deliveryDesc: 'Doorstep delivery across all 25 districts within 24-48 hours.',
      paymentMethodsTitle: 'Flexible Payment Options',
      paymentMethodsDesc: 'Cash on Delivery, Direct Commercial Bank Transfer, or Online Cards.',
      modalTitle: 'Product Details & Order Checkout',
      modalSubtitle: 'Slide through multiple product angles and complete your order.',
      imageCount: 'Image',
      deliveryDetails: 'Delivery Details',
      paymentMethodLabel: 'Select Payment Method',
      cod: 'Cash on Delivery (Pay when received)',
      bank: 'Bank Transfer (Commercial Bank Account)',
      card: 'Online Card Payment (Visa / Mastercard)',
      confirmBtn: 'Confirm & Place Order',
      successTitle: 'Order Placed Successfully!',
      successSub: 'Order Reference Code:',
      viewInProfile: 'View Order in My Profile',
      closeBtn: 'Done',
      backToHome: 'Back to Home'
    },
    ta: {
      breadcrumb: 'முகப்பு / மருத்துவ உபகரணங்கள் கடை',
      title: 'பிரைம் மருத்துவ உபகரணங்கள் கடை',
      subtitle: 'மருத்துவமனை படுக்கைகள், சக்கர நாற்காலிகள், மற்றும் டயப்பர்கள் நாடு தழுவிய விநியோகம்.',
      searchPlaceholder: 'பொருட்களை தேடவும்...',
      allCategories: 'அனைத்து பொருட்கள்',
      catEquipment: 'படுக்கைகள் & மெத்தைகள்',
      catMobility: 'சக்கர நாற்காலிகள் & வாக்கர்',
      catHygiene: 'டயப்பர்கள் & சுகாதாரம்',
      catMonitoring: 'இரத்த அழுத்த மானிகள்',
      rentFilter: 'வாடகைக்கு மட்டும்',
      buyBtn: 'வாங்க',
      rentBtn: 'மாதாந்திர வாடகை',
      stockIn: 'கையிருப்பில் உள்ளது',
      pricePrefix: 'ரூ.',
      deliveryTitle: 'நாடு தழுவிய விநியோகம்',
      deliveryDesc: '24-48 மணி நேரத்திற்குள் வீட்டு வாசலில் டெலிவரி.',
      paymentMethodsTitle: 'கட்டண முறைகள்',
      paymentMethodsDesc: 'டெலிவரியின் போது பணம், வங்கி பரிமாற்றம் அல்லது கார்டு.',
      modalTitle: 'பொருள் விவரங்கள் மற்றும் ஆர்டர்',
      modalSubtitle: 'படங்களை ஸ்லைடு செய்து ஆர்டர் செய்யுங்கள்.',
      imageCount: 'படம்',
      deliveryDetails: 'டெலிவரி முகவரி',
      paymentMethodLabel: 'கட்டண முறையை தேர்வு செய்க',
      cod: 'பொருளைப் பெற்றவுடன் பணம் செலுத்துதல் (COD)',
      bank: 'வங்கி கணக்கில் பணம் செலுத்துதல்',
      card: 'அட்டை மூலம் இணையவழி கட்டணம் (Visa / Mastercard)',
      confirmBtn: 'ஆர்டரை உறுதி செய்க',
      successTitle: 'ஆர்டர் வெற்றிகரமாக பெறப்பட்டது!',
      successSub: 'ஆர்டர் எண்:',
      viewInProfile: 'சுயவிவரத்தில் பார்க்க',
      closeBtn: 'முடிந்தது',
      backToHome: 'முகப்பிற்கு செல்க'
    }
  }[language];

  // Filtering products
  const filteredProducts = initialMedicalItems.filter((item) => {
    // Category match
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    // Rental only filter
    if (filterRentOnly && !item.rentalMonthlyLKR) {
      return false;
    }
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName =
        item.name.en.toLowerCase().includes(q) ||
        item.name.si.toLowerCase().includes(q) ||
        item.name.ta.toLowerCase().includes(q);
      const matchDesc =
        item.description.en.toLowerCase().includes(q) ||
        item.description.si.toLowerCase().includes(q) ||
        item.description.ta.toLowerCase().includes(q);
      const matchBrand = item.brand?.toLowerCase().includes(q) || false;
      return matchName || matchDesc || matchBrand;
    }
    return true;
  });

  // Slide Image Handler on Product Cards
  const handleNextCardImage = (itemId: string, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => {
      const current = prev[itemId] || 0;
      return { ...prev, [itemId]: (current + 1) % totalImages };
    });
  };

  const handlePrevCardImage = (itemId: string, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => {
      const current = prev[itemId] || 0;
      return { ...prev, [itemId]: (current - 1 + totalImages) % totalImages };
    });
  };

  // Open Detailed Order Modal
  const handleOpenOrderModal = (item: MedicalItem, type: 'buy' | 'rent' = 'buy') => {
    if (!user) {
      openAuthModal(() => {
        setSelectedItemForOrder(item);
        setModalImageIndex(0);
        setOrderType(type);
        setDeliveryAddress('');
        setContactName('');
        setContactPhone('');
        setOrderSuccess(null);
      });
      return;
    }
    setSelectedItemForOrder(item);
    setModalImageIndex(0);
    setOrderType(type);
    setDeliveryAddress(user.address || '');
    setContactName(user.name);
    setContactPhone(user.phone);
    setOrderSuccess(null);
  };

  // Place Order Action
  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForOrder || !user) return;

    const unitPrice =
      orderType === 'rent' && selectedItemForOrder.rentalMonthlyLKR
        ? selectedItemForOrder.rentalMonthlyLKR
        : selectedItemForOrder.priceLKR;

    const total = unitPrice * quantity;
    const code = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: EquipmentOrder = {
      id: `ord_${Date.now()}`,
      orderCode: code,
      userId: user.id,
      items: [
        {
          itemId: selectedItemForOrder.id,
          name: `${selectedItemForOrder.name[language]} (${orderType === 'rent' ? 'Monthly Rental' : 'Purchase'})`,
          quantity,
          priceLKR: unitPrice
        }
      ],
      totalAmountLKR: total,
      paymentMethod,
      deliveryAddress: deliveryAddress || 'Colombo District Delivery',
      district,
      contactName: contactName || user.name,
      contactPhone: contactPhone || user.phone,
      status: 'order_received',
      createdAt: new Date().toISOString()
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Save order to Firestore cloud database
    saveOrderToFirestore(newOrder).catch((err) => {
      console.warn('[Firestore] Order save fallback:', err);
    });

    // Append to Payment Records
    const newInvoice: PaymentRecord = {
      id: `pay_${Date.now()}`,
      invoiceNumber: `INV-${code.replace('ORD-', '')}`,
      bookingCode: code,
      serviceName: `${selectedItemForOrder.name[language]} (${quantity}x)`,
      amountLKR: total,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: paymentMethod,
      status: paymentMethod === 'online_card' ? 'paid' : 'pending_verification'
    };
    setPayments((prev) => [newInvoice, ...prev]);

    setOrderSuccess(newOrder);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header with Navigation */}
      <Navbar
        onOpenBooking={() => setIsBookingOpen(true)}
        onNavigateToServices={() => { window.location.href = '/#services'; }}
        onNavigateToStore={() => {}}
        onNavigateToTrust={() => { window.location.href = '/#trust'; }}
        onNavigateToTracker={() => { window.location.href = '/#tracker'; }}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAuth={() => openAuthModal()}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb & Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-emerald-700 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>{t.backToHome}</span>
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-bold">{t.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              {t.backToHome}
            </Link>

            {user && (
              <button
                onClick={() => setIsProfileOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>My Orders ({orders.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Store Hero Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 mb-10 shadow-xl overflow-hidden relative">
          <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-400/30">
                Official Healthcare Supplies
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                {t.title}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
                {t.subtitle}
              </p>

              {/* Delivery & Payment Badges */}
              <div className="grid sm:grid-cols-2 gap-3 pt-3">
                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-start gap-3">
                  <Truck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{t.deliveryTitle}</h4>
                    <p className="text-[11px] text-emerald-200 mt-0.5">{t.deliveryDesc}</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{t.paymentMethodsTitle}</h4>
                    <p className="text-[11px] text-emerald-200 mt-0.5">{t.paymentMethodsDesc}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 aspect-4/3 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/medical_store.jpg"
                  alt="Prime Medical Supplies Showroom"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-emerald-600 bg-slate-50 focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Rental Toggle Pill */}
            <button
              onClick={() => setFilterRentOnly(!filterRentOnly)}
              className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                filterRentOnly
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>{t.rentFilter}</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            {[
              { id: 'all', label: t.allCategories },
              { id: 'equipment', label: t.catEquipment },
              { id: 'mobility', label: t.catMobility },
              { id: 'hygiene', label: t.catHygiene },
              { id: 'monitoring', label: t.catMonitoring }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid with 1-5 Interactive Image Slides */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {filteredProducts.map((item) => {
            const currentImgIdx = activeImageIndex[item.id] || 0;
            const imagesList = item.images && item.images.length > 0 ? item.images : ['/images/medical_store.jpg'];
            const totalImgs = imagesList.length;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Interactive Image Carousel (1 to 5 images) */}
                  <div className="relative aspect-4/3 bg-slate-100 overflow-hidden group/img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagesList[currentImgIdx]}
                      alt={item.name[language]}
                      className="w-full h-full object-cover transition-all duration-300"
                    />

                    {/* Badge */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-emerald-800 text-[10px] font-bold shadow-xs">
                        {item.badge || item.brand || t.stockIn}
                      </span>
                    </div>

                    {/* Image Slide Counter */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <span suppressHydrationWarning className="px-2 py-0.5 rounded-full bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-bold">
                        {currentImgIdx + 1} / {totalImgs}
                      </span>
                    </div>

                    {/* Previous / Next Arrow Controls */}
                    {totalImgs > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handlePrevCardImage(item.id, totalImgs, e)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer"
                          title="Previous image"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleNextCardImage(item.id, totalImgs, e)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer"
                          title="Next image"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        {/* Dot Indicators */}
                        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
                          {imagesList.map((_, idx) => (
                            <span
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImageIndex((prev) => ({ ...prev, [item.id]: idx }));
                              }}
                              className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all ${
                                currentImgIdx === idx ? 'bg-emerald-600 w-3' : 'bg-white/80'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Content details */}
                  <div className="p-5">
                    {item.brand && (
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {item.brand}
                      </p>
                    )}

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2 leading-snug line-clamp-2">
                      {item.name[language]}
                    </h3>

                    <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                      {item.description[language]}
                    </p>

                    <div className="pt-3 border-t border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Purchase Price</span>
                      <p className="text-lg font-black text-slate-900">
                        {t.pricePrefix} {item.priceLKR.toLocaleString()}
                      </p>

                      {item.rentalMonthlyLKR && (
                        <p className="text-xs text-emerald-700 font-bold mt-0.5">
                          Rent: {t.pricePrefix} {item.rentalMonthlyLKR.toLocaleString()} / mo
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Order Action Buttons */}
                <div className="p-5 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenOrderModal(item, 'buy')}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{t.buyBtn}</span>
                  </button>

                  {item.rentalMonthlyLKR && (
                    <button
                      onClick={() => handleOpenOrderModal(item, 'rent')}
                      className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                    >
                      {t.rentBtn}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <Footer
        onNavigateToServices={() => { window.location.href = '/#services'; }}
        onNavigateToTrust={() => { window.location.href = '/#trust'; }}
        onNavigateToTracker={() => { window.location.href = '/#tracker'; }}
      />

      {/* Product Detail & Order Checkout Modal */}
      {selectedItemForOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-6 relative">
              <button
                onClick={() => setSelectedItemForOrder(null)}
                className="absolute top-5 right-5 text-emerald-200 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-xl font-black">{t.modalTitle}</h3>
              <p className="text-xs text-emerald-100 mt-1">{t.modalSubtitle}</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
              {!orderSuccess ? (
                <form onSubmit={handleConfirmOrder} className="space-y-6">
                  {/* Multi-Image Slider in Modal (1 to 5 images) */}
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden aspect-16/9 bg-slate-100 border border-slate-200 shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedItemForOrder.images[modalImageIndex] || selectedItemForOrder.images[0]}
                        alt={selectedItemForOrder.name[language]}
                        className="w-full h-full object-cover"
                      />

                      {/* Slider Navigation Arrows */}
                      {selectedItemForOrder.images.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setModalImageIndex(
                                (modalImageIndex - 1 + selectedItemForOrder.images.length) %
                                  selectedItemForOrder.images.length
                              )
                            }
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center cursor-pointer"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setModalImageIndex(
                                (modalImageIndex + 1) % selectedItemForOrder.images.length
                              )
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center cursor-pointer"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      {/* Slide Indicator */}
                      <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold">
                        {t.imageCount} {modalImageIndex + 1} / {selectedItemForOrder.images.length}
                      </div>
                    </div>

                    {/* Thumbnail Strip (1-5 images) */}
                    {selectedItemForOrder.images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {selectedItemForOrder.images.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setModalImageIndex(idx)}
                            className={`w-16 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                              modalImageIndex === idx ? 'border-emerald-600 scale-105 shadow-xs' : 'border-slate-200 opacity-60'
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Item Description */}
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{selectedItemForOrder.name[language]}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {selectedItemForOrder.description[language]}
                    </p>
                  </div>

                  {/* Quantity & Buy/Rent Toggle */}
                  <div className="grid sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Order Mode</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setOrderType('buy')}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                            orderType === 'buy' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border text-slate-700'
                          }`}
                        >
                          Buy ({t.pricePrefix} {selectedItemForOrder.priceLKR.toLocaleString()})
                        </button>
                        {selectedItemForOrder.rentalMonthlyLKR && (
                          <button
                            type="button"
                            onClick={() => setOrderType('rent')}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                              orderType === 'rent' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border text-slate-700'
                            }`}
                          >
                            Rent ({t.pricePrefix} {selectedItemForOrder.rentalMonthlyLKR.toLocaleString()}/mo)
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Quantity</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-9 h-9 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold"
                        >
                          -
                        </button>
                        <span className="font-bold text-base px-2">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-9 h-9 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t.deliveryDetails}</p>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Contact Name *</label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">District *</label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600 bg-white"
                      >
                        {districtList.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Delivery Address *</label>
                      <textarea
                        rows={2}
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="House address, street, landmarks"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Payment Method Selector (COD, Bank Transfer, Online Card) */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {t.paymentMethodLabel}
                    </label>

                    <div className="space-y-2">
                      <label className={`p-3 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200'}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="text-emerald-600"
                        />
                        <Banknote className="w-5 h-5 text-emerald-700" />
                        <span className="text-xs font-semibold text-slate-800">{t.cod}</span>
                      </label>

                      <label className={`p-3 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all ${paymentMethod === 'bank_transfer' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200'}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'bank_transfer'}
                          onChange={() => setPaymentMethod('bank_transfer')}
                          className="text-emerald-600"
                        />
                        <Building className="w-5 h-5 text-teal-700" />
                        <div className="text-xs">
                          <span className="font-semibold text-slate-800 block">{t.bank}</span>
                          <span className="text-[10px] text-slate-500">Commercial Bank A/C: 1000293849 (Prime Life Care)</span>
                        </div>
                      </label>

                      <label className={`p-3 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all ${paymentMethod === 'online_card' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200'}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'online_card'}
                          onChange={() => setPaymentMethod('online_card')}
                          className="text-emerald-600"
                        />
                        <CreditCard className="w-5 h-5 text-indigo-700" />
                        <span className="text-xs font-semibold text-slate-800">{t.card}</span>
                      </label>
                    </div>
                  </div>

                  {/* Total and Submit */}
                  <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Payable</span>
                      <p className="text-xl font-black text-slate-900">
                        LKR {((orderType === 'rent' && selectedItemForOrder.rentalMonthlyLKR ? selectedItemForOrder.rentalMonthlyLKR : selectedItemForOrder.priceLKR) * quantity).toLocaleString()}
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-200 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <span>{t.confirmBtn}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                /* Success View */
                <div className="text-center py-4 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900">{t.successTitle}</h4>
                  <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 max-w-sm mx-auto">
                    <span className="text-xs text-slate-500">{t.successSub}</span>
                    <p className="text-2xl font-black text-emerald-800 mt-0.5">{orderSuccess.orderCode}</p>
                    <p className="text-xs text-slate-600 mt-2">
                      Total: LKR {orderSuccess.totalAmountLKR.toLocaleString()} • Payment: {orderSuccess.paymentMethod.toUpperCase()}
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Our medical delivery fleet will deliver your order to {orderSuccess.deliveryAddress}. We will call you prior to arrival.
                  </p>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setSelectedItemForOrder(null);
                        setIsProfileOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs"
                    >
                      {t.viewInProfile}
                    </button>
                    <button
                      onClick={() => setSelectedItemForOrder(null)}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
                    >
                      {t.closeBtn}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        bookings={bookings}
        payments={payments}
        orders={orders}
        onOpenNewBooking={() => setIsBookingOpen(true)}
      />

      {/* Booking Form Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedService={initialServices[0]}
        allServices={initialServices}
        onBookingSubmitted={() => {}}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Auth Modal */}
      <AuthModal />

      {/* Google 1-Tap Auto-Suggest Floating Banner */}
      <GoogleOneTapPrompt />
    </div>
  );
}
