'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { MedicalItem } from '@/types';
import { subscribeToLiveProducts } from '@/lib/firestoreService';
import { initialMedicalItems } from '@/data/medicalItems';
import {
  ShoppingBag,
  Heart,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Truck,
  ShieldCheck,
  Sparkles,
  Layers,
  Check,
  Eye
} from 'lucide-react';

export const HomeStoreShowcase: React.FC = () => {
  const { language } = useLanguage();
  const { addToCart, toggleSaveItem, isSaved } = useCart();
  const router = useRouter();

  const [products, setProducts] = useState<MedicalItem[]>(initialMedicalItems);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);

  // Subscribe to live products from Firestore
  useEffect(() => {
    const unsub = subscribeToLiveProducts((liveItems) => {
      if (liveItems && liveItems.length > 0) {
        setProducts(liveItems);
      }
    });
    return () => unsub();
  }, []);

  // Auto-play sliding interval (shifts every 3.5 seconds when not paused)
  useEffect(() => {
    if (products.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [products.length, isPaused]);

  const handleAddToCart = (e: React.MouseEvent, item: MedicalItem) => {
    e.stopPropagation();
    addToCart(item, 1);
    setAddedItemNotice(item.id);
    setTimeout(() => setAddedItemNotice(null), 2500);
  };

  const handleToggleSave = (e: React.MouseEvent, item: MedicalItem) => {
    e.stopPropagation();
    toggleSaveItem(item);
  };

  const currentProduct = products[currentIndex] || products[0];

  return (
    <section className="py-10 sm:py-12 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white border-b border-slate-800 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Header Row with Heading & "Go to Store" Button */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-400/30">
              <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
              <span>
                {language === 'si'
                  ? 'රෝගී සත්කාරක උපකරණ වෙළඳසැල'
                  : 'Prime Medical & ICU Equipment Store'}
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              {language === 'si' ? (
                <>
                  නිවසේ සත්කාරක සහ <span className="text-blue-400">ICU උපකරණ</span>
                </>
              ) : (
                <>
                  Essential In-Home <span className="text-blue-400">Medical Supplies</span>
                </>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {language === 'si'
                ? 'රෝහල් ඇඳන්, මෙට්ට, රෝද පුටු ඇතුළු සියලුම උපකරණ දිවයින පුරා නිවසටම ගෙන්වා ගන්න.'
                : 'Hospital beds, alternating air mattresses, and specialized home nursing supplies delivered islandwide.'}
            </p>
          </div>

          <Link
            href="/store"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto cursor-pointer hover:scale-102 active:scale-95 shrink-0"
          >
            <span>{language === 'si' ? 'සියලුම භාණ්ඩ බලන්න (Store)' : 'Explore Full Store'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Sliding Product Card Showcase */}
        <div
          className="bg-slate-950/80 rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl backdrop-blur-md relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="grid lg:grid-cols-12 gap-6 items-center">
            {/* Left: Product Images Stage (Large View + 5 Thumbnail Badges) */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-2xl overflow-hidden aspect-4/3 sm:aspect-16/10 relative bg-slate-900 border border-slate-700/80 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentProduct.images[0]}
                  alt={currentProduct.name.en}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-104"
                />

                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                {/* Discount Badge */}
                {currentProduct.discountPercentage && currentProduct.discountPercentage > 0 && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-black shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>-{currentProduct.discountPercentage}% OFF</span>
                  </div>
                )}

                {/* 5-Photo Indicator */}
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/10">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>{currentProduct.images.length || 5} Photos</span>
                </div>

                {/* Wishlist Button on Image */}
                <button
                  onClick={(e) => handleToggleSave(e, currentProduct)}
                  className={`absolute bottom-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer ${
                    isSaved(currentProduct.id)
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-900/80 hover:bg-slate-900 text-white border border-white/10'
                  }`}
                  title={isSaved(currentProduct.id) ? 'Saved' : 'Save to Wishlist'}
                >
                  <Heart className={`w-4 h-4 ${isSaved(currentProduct.id) ? 'fill-white' : ''}`} />
                </button>
              </div>

              {/* 5 Thumbnails Preview Strip */}
              {currentProduct.images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {currentProduct.images.slice(0, 5).map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => router.push(`/store?item=${currentProduct.id}`)}
                      className="w-14 h-11 sm:w-16 sm:h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0 cursor-pointer hover:border-blue-500 transition-all opacity-80 hover:opacity-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="Angle" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Details & Purchase Actions */}
            <div className="lg:col-span-6 space-y-4">
              {/* Brand & Stock */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-400 tracking-wide uppercase">
                  {currentProduct.brand || 'Paramount Health'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {language === 'si' ? 'තොග ඇත (In Stock)' : 'In Stock • Ready to Deliver'}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg sm:text-2xl font-bold text-white leading-tight">
                {language === 'si' && currentProduct.name.si
                  ? currentProduct.name.si
                  : currentProduct.name.en}
              </h3>

              {/* Description Snippet */}
              <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
                {language === 'si' && currentProduct.description.si
                  ? currentProduct.description.si
                  : currentProduct.description.en}
              </p>

              {/* Pricing Section (Regular Price crossed out, Sale Price bold) */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    LKR {(currentProduct.salePriceLKR || currentProduct.priceLKR).toLocaleString()}
                  </span>
                  {currentProduct.regularPriceLKR &&
                    currentProduct.regularPriceLKR > (currentProduct.salePriceLKR || currentProduct.priceLKR) && (
                      <span className="text-sm sm:text-base text-slate-400 line-through">
                        LKR {currentProduct.regularPriceLKR.toLocaleString()}
                      </span>
                    )}
                  {currentProduct.discountPercentage && currentProduct.discountPercentage > 0 && (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      {language === 'si'
                        ? `රු. ${(currentProduct.regularPriceLKR! - (currentProduct.salePriceLKR || currentProduct.priceLKR)).toLocaleString()} ක ලාභයක්`
                        : `Save LKR ${(currentProduct.regularPriceLKR! - (currentProduct.salePriceLKR || currentProduct.priceLKR)).toLocaleString()}`}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                  <Truck className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    {language === 'si'
                      ? 'කොළඹ ඇතුළු සියලු දිස්ත්‍රික්කවලට පැය 24ක් තුළ නිවසටම බෙදාහැරීම'
                      : 'Express 24h delivery & bedside assembly across Sri Lanka'}
                  </span>
                </p>
              </div>

              {/* Action Buttons: Add to Cart & View 5 Photos in Store */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={(e) => handleAddToCart(e, currentProduct)}
                  className="flex-1 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  {addedItemNotice === currentProduct.id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>{language === 'si' ? 'කරත්තයට එක්විය!' : 'Added to Cart!'}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>
                        {language === 'si' ? 'කරත්තයට එක්කරන්න (Add to Cart)' : 'Add to Cart'}
                      </span>
                    </>
                  )}
                </button>

                <Link
                  href={`/store?item=${currentProduct.id}`}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span>{language === 'si' ? 'ඡායාරූප 5 බලන්න' : 'View 5 Photos'}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Carousel Slider Controls & Indicators */}
          {products.length > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5">
                {products.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      currentIndex === idx ? 'w-6 bg-blue-500' : 'w-2 bg-slate-700 hover:bg-slate-600'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : products.length - 1))
                  }
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % products.length)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
