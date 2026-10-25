'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { BookingModal } from '@/components/BookingModal';
import { AuthModal } from '@/components/AuthModal';
import { GoogleOneTapPrompt } from '@/components/GoogleOneTapPrompt';
import { initialMedicalItems } from '@/data/medicalItems';
import { initialServices } from '@/data/services';
import { MedicalItem, BookingSubmission } from '@/types';
import { subscribeToLiveProducts } from '@/lib/firestoreService';
import {
  ShoppingBag,
  Heart,
  Search,
  Filter,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowRight,
  Plus,
  Minus,
  Sparkles,
  Layers,
  Check,
  Eye,
  PhoneCall
} from 'lucide-react';

function StoreContent() {
  const { language } = useLanguage();
  const { user, openAuthModal } = useAuth();
  const { addToCart, toggleSaveItem, isSaved, openCartDrawer } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Products State (Real-time Firestore sync)
  const [products, setProducts] = useState<MedicalItem[]>(initialMedicalItems);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Product 5-Image Detail Modal State
  const [activeModalItem, setActiveModalItem] = useState<MedicalItem | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);

  // Global modals
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookings] = useState<BookingSubmission[]>([]);

  // Subscribe to live products from Firestore
  useEffect(() => {
    const unsub = subscribeToLiveProducts((liveItems) => {
      if (liveItems && liveItems.length > 0) {
        setProducts(liveItems);
      }
    });
    return () => unsub();
  }, []);

  // Check query param `?item=id` to auto-open product modal
  useEffect(() => {
    const itemId = searchParams?.get('item');
    if (itemId && products.length > 0) {
      const found = products.find((p) => p.id === itemId);
      if (found) {
        setActiveModalItem(found);
        setActivePhotoIdx(0);
        setModalQuantity(1);
      }
    }
  }, [searchParams, products]);

  // Filter products
  const filteredProducts = products.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEn = item.name.en?.toLowerCase().includes(q);
      const matchSi = item.name.si?.toLowerCase().includes(q);
      const matchBrand = item.brand?.toLowerCase().includes(q);
      return matchEn || matchSi || matchBrand;
    }
    return true;
  });

  const handleOpenDetailModal = (item: MedicalItem, initialIdx: number = 0) => {
    setActiveModalItem(item);
    setActivePhotoIdx(initialIdx);
    setModalQuantity(1);
  };

  const handleAddToCart = (item: MedicalItem, qty: number = 1) => {
    addToCart(item, qty);
    setAddedItemNotice(item.id);
    setTimeout(() => setAddedItemNotice(null), 2500);
  };

  const handleBuyNow = (item: MedicalItem) => {
    addToCart(item, modalQuantity);
    setActiveModalItem(null);
    openCartDrawer();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navbar */}
      <Navbar
        onOpenBooking={() => setIsBookingOpen(true)}
        onNavigateToServices={() => { window.location.href = '/#services'; }}
        onNavigateToStore={() => {}}
        onNavigateToTrust={() => { window.location.href = '/#trust'; }}
        onNavigateToTracker={() => { window.location.href = '/#tracker'; }}
        onOpenProfile={() => router.push('/profile')}
        onOpenAuth={() => openAuthModal()}
      />

      <main className="flex-1 pb-16">
        {/* Store Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white py-12 sm:py-16 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-400/30">
                <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  {language === 'si'
                    ? 'ප්‍රයිම් රෝගී සත්කාරක උපකරණ වෙළඳසැල'
                    : 'Prime Medical Equipment & Supplies Store'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {language === 'si' ? (
                  <>
                    රෝහල් ඇඳන්, මෙට්ට සහ <span className="text-blue-400">ICU උපකරණ</span>
                  </>
                ) : (
                  <>
                    Hospital Beds, Mattresses & <span className="text-blue-400">ICU Supplies</span>
                  </>
                )}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {language === 'si'
                  ? 'රෝගී සත්කාරයට අවශ්‍ය උසස් තත්ත්වයේ විදුලි රෝහල් ඇඳන්, රිපල් මෙට්ට සහ ආධාරක ද්‍රව්‍ය සෘජුවම නිවසටම ගෙන්වා ගන්න. ලැබුණු පසු මුදල් ගෙවීම (COD) හෝ බැංකු තැන්පතු මඟින් ගෙවන්න.'
                  : 'Certified ICU-grade hospital beds, alternating pressure mattresses, and recovery equipment delivered to your home with bedside assembly. Cash on Delivery (COD) & Bank Transfer available.'}
              </p>

              {/* Delivery Perks Badges */}
              <div className="flex flex-wrap gap-3 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                  <Truck className="w-4 h-4 text-blue-400" />
                  <span>
                    {language === 'si'
                      ? 'පැය 24-48ක් තුළ දිවයින පුරා බෙදාහැරීම'
                      : 'Express 24h Islandwide Delivery'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>
                    {language === 'si' ? 'වගකීම් සහතිකය සහ සහාය' : 'Warranty & Technical Support'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'si'
                    ? 'උපකරණ සොයන්න (උදා: රෝහල් ඇඳ)...'
                    : 'Search products (e.g. Hospital Bed)...'
                }
                className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {[
                { id: 'all', label: language === 'si' ? 'සියල්ල' : 'All Products' },
                { id: 'equipment', label: language === 'si' ? 'රෝහල් ඇඳන් සහ මෙට්ට' : 'Hospital Beds & ICU' },
                { id: 'mobility', label: language === 'si' ? 'රෝද පුටු' : 'Mobility Aids' },
                { id: 'hygiene', label: language === 'si' ? 'සනීපාරක්ෂාව' : 'Hygiene & Diapers' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Catalog Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((product) => {
              const title = language === 'si' && product.name.si ? product.name.si : product.name.en;
              const desc = language === 'si' && product.description.si ? product.description.si : product.description.en;
              const salePrice = product.salePriceLKR || product.priceLKR;
              const regularPrice = product.regularPriceLKR;
              const discount = product.discountPercentage;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Photo Container with 5-Angle Badge & Zoom Action */}
                  <div
                    onClick={() => handleOpenDetailModal(product, 0)}
                    className="aspect-4/3 w-full overflow-hidden bg-slate-900 relative cursor-pointer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.images[0]}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-106"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {discount && discount > 0 ? (
                        <span className="px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-black shadow-md flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>-{discount}% OFF</span>
                        </span>
                      ) : null}
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/10 shadow-xs">
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      <span>{product.images.length || 5} Photos</span>
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveItem(product);
                      }}
                      className={`absolute bottom-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer ${
                        isSaved(product.id)
                          ? 'bg-rose-600 text-white'
                          : 'bg-white/90 hover:bg-white text-slate-800'
                      }`}
                      title={isSaved(product.id) ? 'Saved' : 'Save to Wishlist'}
                    >
                      <Heart className={`w-4 h-4 ${isSaved(product.id) ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  {/* 5 Thumbnails Bar */}
                  {product.images.length > 1 && (
                    <div className="flex gap-2 p-3 bg-slate-50 border-b border-slate-100 overflow-x-auto">
                      {product.images.slice(0, 5).map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleOpenDetailModal(product, idx)}
                          className="w-14 h-11 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 cursor-pointer hover:border-blue-500 hover:scale-105 transition-all"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt="Angle" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Details Area */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                          {product.brand || 'Paramount Health'}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          ✓ {language === 'si' ? 'තොග ඇත' : 'In Stock'}
                        </span>
                      </div>

                      <h3
                        onClick={() => handleOpenDetailModal(product, 0)}
                        className="text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors"
                      >
                        {title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {desc}
                      </p>
                    </div>

                    {/* Pricing Box */}
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div>
                        <div className="flex items-baseline gap-2.5 flex-wrap">
                          <span className="text-xl sm:text-2xl font-black text-slate-900">
                            LKR {salePrice.toLocaleString()}
                          </span>
                          {regularPrice && regularPrice > salePrice && (
                            <span className="text-xs sm:text-sm text-slate-400 line-through">
                              LKR {regularPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {regularPrice && regularPrice > salePrice && (
                          <span className="text-[11px] font-bold text-emerald-600 block mt-0.5">
                            {language === 'si'
                              ? `රු. ${(regularPrice - salePrice).toLocaleString()} ක් ඉතිරියි!`
                              : `Save LKR ${(regularPrice - salePrice).toLocaleString()}!`}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons: View Details & Add to Cart */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleOpenDetailModal(product, 0)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>{language === 'si' ? 'විස්තර සහ ඡායාරූප 5' : 'View 5 Photos'}</span>
                        </button>

                        <button
                          onClick={() => handleAddToCart(product, 1)}
                          className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          {addedItemNotice === product.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-300" />
                              <span>{language === 'si' ? 'එක්විය!' : 'Added!'}</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>{language === 'si' ? 'කරත්තයට' : 'Add to Cart'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 max-w-md mx-auto">
              <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">
                {language === 'si' ? 'කිසිදු භාණ්ඩයක් හමු නොවීය' : 'No Products Found'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'si'
                  ? 'කරුණාකර සෙවුම් වචනය වෙනස් කරන්න.'
                  : 'Try searching with a different term.'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* 5-IMAGE PRODUCT DETAIL & ORDER MODAL */}
      {activeModalItem && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setActiveModalItem(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Topbar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
                  {activeModalItem.brand || 'Paramount Health'}
                </span>
                <span className="text-xs text-slate-500">
                  {activePhotoIdx + 1} of {activeModalItem.images.length || 5} Photos
                </span>
              </div>

              <button
                onClick={() => setActiveModalItem(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid md:grid-cols-12 gap-6 p-4 sm:p-6">
              {/* Left: 5-Photo Multi-Angle Viewer */}
              <div className="md:col-span-6 space-y-3">
                {/* Large Main Photo with Left/Right Arrows */}
                <div className="aspect-4/3 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeModalItem.images[activePhotoIdx]}
                    alt="Active Angle"
                    className="w-full h-full object-cover"
                  />

                  {/* Prev Button */}
                  {activeModalItem.images.length > 1 && (
                    <button
                      onClick={() =>
                        setActivePhotoIdx((prev) =>
                          prev > 0 ? prev - 1 : activeModalItem.images.length - 1
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-all cursor-pointer opacity-90 hover:opacity-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}

                  {/* Next Button */}
                  {activeModalItem.images.length > 1 && (
                    <button
                      onClick={() =>
                        setActivePhotoIdx((prev) =>
                          (prev + 1) % activeModalItem.images.length
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-all cursor-pointer opacity-90 hover:opacity-100"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}

                  {/* Discount Badge */}
                  {activeModalItem.discountPercentage && activeModalItem.discountPercentage > 0 && (
                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-black shadow-md">
                      -{activeModalItem.discountPercentage}% OFF
                    </div>
                  )}
                </div>

                {/* 5 Thumbnails Strip */}
                <div className="grid grid-cols-5 gap-2">
                  {activeModalItem.images.slice(0, 5).map((thumb, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`aspect-4/3 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activePhotoIdx === idx
                          ? 'border-blue-600 scale-102 shadow-sm'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={thumb} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Info & Purchase Controls */}
              <div className="md:col-span-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                    {language === 'si' && activeModalItem.name.si
                      ? activeModalItem.name.si
                      : activeModalItem.name.en}
                  </h2>

                  {/* Pricing Box */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-baseline gap-2.5 flex-wrap">
                      <span className="text-2xl font-black text-blue-600">
                        LKR {(activeModalItem.salePriceLKR || activeModalItem.priceLKR).toLocaleString()}
                      </span>
                      {activeModalItem.regularPriceLKR &&
                        activeModalItem.regularPriceLKR > (activeModalItem.salePriceLKR || activeModalItem.priceLKR) && (
                          <span className="text-xs sm:text-sm text-slate-400 line-through">
                            LKR {activeModalItem.regularPriceLKR.toLocaleString()}
                          </span>
                        )}
                    </div>
                    {activeModalItem.discountPercentage && activeModalItem.discountPercentage > 0 && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md inline-block">
                        {language === 'si'
                          ? `රු. ${(activeModalItem.regularPriceLKR! - (activeModalItem.salePriceLKR || activeModalItem.priceLKR)).toLocaleString()} ක මුදල් ඉතිරියක්`
                          : `Save LKR ${(activeModalItem.regularPriceLKR! - (activeModalItem.salePriceLKR || activeModalItem.priceLKR)).toLocaleString()} (14% OFF)`}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed max-h-36 overflow-y-auto">
                    {language === 'si' && activeModalItem.description.si
                      ? activeModalItem.description.si
                      : activeModalItem.description.en}
                  </p>

                  {/* Features List */}
                  {Array.isArray(activeModalItem.features) && activeModalItem.features.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                        {language === 'si' ? 'ප්‍රධාන පහසුකම්:' : 'Key Specifications:'}
                      </span>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {activeModalItem.features.slice(0, 4).map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <span>{typeof f === 'string' ? f : (f as any).en || ''}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Quantity & CTA Buttons */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      {language === 'si' ? 'ප්‍රමාණය (Quantity):' : 'Quantity:'}
                    </span>
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <button
                        onClick={() => setModalQuantity((prev) => Math.max(1, prev - 1))}
                        className="p-1.5 px-3 hover:bg-slate-200 text-slate-600 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-slate-900">
                        {modalQuantity}
                      </span>
                      <button
                        onClick={() => setModalQuantity((prev) => prev + 1)}
                        className="p-1.5 px-3 hover:bg-slate-200 text-slate-600 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddToCart(activeModalItem, modalQuantity)}
                      className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <ShoppingBag className="w-4 h-4 text-blue-400" />
                      <span>{language === 'si' ? 'කරත්තයට එක්කරන්න' : 'Add to Cart'}</span>
                    </button>

                    <button
                      onClick={() => handleBuyNow(activeModalItem)}
                      className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <span>{language === 'si' ? 'දැන්ම මිලදී ගන්න' : 'Buy Now'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Cart & Checkout Drawer */}
      <CartDrawer />

      {/* Booking Form Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedService={null}
        allServices={initialServices}
        onBookingSubmitted={() => {}}
        onOpenProfile={() => router.push('/profile')}
      />

      <AuthModal />
      <GoogleOneTapPrompt />

      {/* Footer */}
      <Footer
        onNavigateToServices={() => { window.location.href = '/#services'; }}
        onNavigateToTrust={() => { window.location.href = '/#trust'; }}
        onNavigateToTracker={() => { window.location.href = '/#tracker'; }}
      />
    </div>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Loading Store...</div>}>
      <StoreContent />
    </Suspense>
  );
}
