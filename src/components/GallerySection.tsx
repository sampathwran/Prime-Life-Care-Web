'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { GalleryItem } from '@/types';
import { subscribeToLiveGallery } from '@/lib/firestoreService';
import {
  Camera,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HeartHandshake,
  Layers
} from 'lucide-react';

// Curated default gallery items used as instant fallback before/if Firestore is empty
const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal_01',
    title: 'In-Home Senior Vital Monitoring',
    titleSi: 'නිවසේදී රෝගී දෛනික සෞඛ්‍ය පරීක්ෂාව',
    imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=1000',
    category: 'Clinical Nursing',
    description: 'Qualified nursing aide monitoring blood pressure and vital signs at patient residence.',
    isPublished: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gal_02',
    title: 'Compassionate Elderly Companionship',
    titleSi: 'වැඩිහිටියන් රැකබලාගැනීම සහ මිත්‍රශීලී සහාය',
    imageUrl: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&q=80&w=1000',
    category: 'Elderly Care',
    description: 'Gentle daily assistance, companionship, and mobility exercises for senior parents.',
    isPublished: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gal_03',
    title: 'Post-Surgery Bedside Rehabilitation',
    titleSi: 'ශල්‍යකර්ම පසු රෝගී ඇඳ විවේක සත්කාරය',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=1000',
    category: 'Clinical Nursing',
    description: 'Assisted bed positioning, recovery management and surgical wound dressing.',
    isPublished: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gal_04',
    title: 'Physical Therapy & Assisted Walking',
    titleSi: 'භෞත චිකිත්සක සහ ඇවිදීමේ සහායක සේවය',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1000',
    category: 'Physiotherapy',
    description: 'Guided mobility training, limb movement, and stroke rehabilitation exercises.',
    isPublished: true,
    sortOrder: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gal_05',
    title: 'Caregiver Training & Hygiene Standards',
    titleSi: 'සාත්තු සේවක පුහුණුව සහ සනීපාරක්ෂක ප්‍රමිතීන්',
    imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=1000',
    category: 'Staff Training',
    description: 'Continuous hospital-grade infection control and caregiver qualification workshops.',
    isPublished: true,
    sortOrder: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gal_06',
    title: 'Specialized Medical Equipment Setup',
    titleSi: 'රෝහල් ඇඳන් සහ උපකරණ නිවසේ ස්ථාපනය',
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1000',
    category: 'Medical Equipment',
    description: 'Home delivery and setup of hospital beds, oxygen concentrators, and ripple mattresses.',
    isPublished: true,
    sortOrder: 6,
    createdAt: new Date().toISOString(),
  },
];

export const GallerySection: React.FC = () => {
  const { language } = useLanguage();
  const [items, setItems] = useState<GalleryItem[]>(DEFAULT_GALLERY_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Subscribe to real-time gallery updates uploaded/published from Admin panel
  useEffect(() => {
    const unsub = subscribeToLiveGallery((liveItems) => {
      if (liveItems && liveItems.length > 0) {
        setItems(liveItems);
      }
    });
    return () => unsub();
  }, []);

  // Unique categories derived dynamically + 'All'
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.category && it.category.trim()) {
        set.add(it.category.trim());
      }
    });
    return ['All', ...Array.from(set)];
  }, [items]);

  // Filtered items based on active category
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return items;
    return items.filter((it) => it.category === selectedCategory);
  }, [items, selectedCategory]);

  // Lightbox keyboard controls (ESC, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredItems.length]);

  const activeLightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <section id="gallery" className="py-16 sm:py-20 bg-gradient-to-b from-white via-slate-50 to-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold uppercase tracking-wider shadow-xs">
            <Camera className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {language === 'si' ? 'අපගේ සත්කාර අවස්ථා ඡායාරූප' : 'Care In Action & Moments'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {language === 'si' ? (
              <>
                සැබෑ සත්කාර සහ සේවාවන්හි <span className="text-blue-600">ඡායාරූප එකතුව</span>
              </>
            ) : (
              <>
                Compassionate Care <span className="text-blue-600">Captured in Action</span>
              </>
            )}
          </h2>

          <p className="text-xs sm:text-base text-slate-600 leading-relaxed">
            {language === 'si'
              ? 'අපගේ සුදුසුකම්ලත් සාත්තු සේවක සේවිකාවන්, රෝගී සත්කාරක ක්‍රියාවලි, භෞත චිකිත්සක ප්‍රතිකාර සහ වෛද්‍ය පහසුකම් සැබෑ අයුරින් දැකබලාගන්න.'
              : 'Explore real snapshots of our dedicated caregivers, certified nurses, physiotherapy sessions, and professional home medical setups.'}
          </p>
        </div>

        {/* Category Filter Pills */}
        {categories.length > 1 && (
          <div className="flex items-center justify-center flex-wrap gap-2 mb-8 sm:mb-10">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              let label = cat;
              if (language === 'si') {
                if (cat === 'All') label = 'සියල්ල (All)';
                else if (cat === 'Elderly Care') label = 'වැඩිහිටි සත්කාර';
                else if (cat === 'Clinical Nursing') label = 'සාත්තු සේවා';
                else if (cat === 'Physiotherapy') label = 'භෞත චිකිත්සාව';
                else if (cat === 'Staff Training') label = 'පුහුණු සැසි';
                else if (cat === 'Medical Equipment') label = 'වෛද්‍ය උපකරණ';
              }
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-102'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* Gallery Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredItems.map((item, index) => {
            const displayTitle = language === 'si' && item.titleSi ? item.titleSi : item.title;
            return (
              <div
                key={item.id}
                onClick={() => setLightboxIndex(index)}
                className="group relative rounded-2xl overflow-hidden bg-slate-100 shadow-sm hover:shadow-xl border border-slate-200/80 cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Photo Aspect Container */}
                <div className="aspect-4/3 w-full overflow-hidden bg-slate-900 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                    loading="lazy"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                  {/* Category Badge (Top-left) */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/10 shadow-xs">
                      {item.category}
                    </span>
                  </div>

                  {/* Fullscreen Expand Icon Button (Top-right) */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-md">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Caption & Title (Bottom) */}
                  <div className="absolute bottom-0 inset-x-0 p-4 space-y-1">
                    <h3 className="text-white font-bold text-sm sm:text-base leading-snug line-clamp-2 drop-shadow-sm">
                      {displayTitle}
                    </h3>
                    {item.description && (
                      <p className="text-slate-300 text-xs line-clamp-1 opacity-90">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state when category has no items */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 max-w-md mx-auto">
            <Camera className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">
              {language === 'si' ? 'මෙම කාණ්ඩයට ඡායාරූප තවම එක් කර නැත' : 'No Photos in this Category'}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'si'
                ? 'කරුණාකර වෙනත් කාණ්ඩයක් තෝරන්න හෝ පසුව පරීක්ෂා කරන්න.'
                : 'Please select another category or check back later.'}
            </p>
          </div>
        )}

        {/* Live Admin Sync Notice Badge */}
        <div className="mt-10 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100/90 text-slate-600 text-xs font-medium border border-slate-200">
            <HeartHandshake className="w-4 h-4 text-blue-600" />
            <span>
              {language === 'si'
                ? 'සියලුම ඡායාරූප Prime Life Care පරිපාලන අංශය (Admin) මගින් සෘජුවම කළමනාකරණය කෙරේ.'
                : 'All photos are authentic and continuously updated by the Prime Life Care Admin team.'}
            </span>
          </div>
        </div>
      </div>

      {/* Lightbox Fullscreen Modal */}
      {activeLightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Lightbox Topbar */}
          <div
            className="flex items-center justify-between text-white max-w-5xl mx-auto w-full pb-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-white/10 text-xs font-semibold border border-white/10">
                {activeLightboxItem.category}
              </span>
              <span className="text-xs text-slate-400">
                {lightboxIndex! + 1} / {filteredItems.length}
              </span>
            </div>

            <button
              onClick={() => setLightboxIndex(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lightbox Image Stage with Prev/Next Controls */}
          <div
            className="relative flex-1 flex items-center justify-center max-w-5xl mx-auto w-full my-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Button */}
            {filteredItems.length > 1 && (
              <button
                onClick={() =>
                  setLightboxIndex((prev) =>
                    prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1
                  )
                }
                className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white border border-white/20 transition-all cursor-pointer"
                aria-label="Previous Image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Main Image */}
            <div className="max-h-[75vh] max-w-full overflow-hidden rounded-2xl border border-white/15 shadow-2xl flex items-center justify-center bg-black/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeLightboxItem.imageUrl}
                alt={activeLightboxItem.title}
                className="max-h-[75vh] max-w-full object-contain"
              />
            </div>

            {/* Next Button */}
            {filteredItems.length > 1 && (
              <button
                onClick={() =>
                  setLightboxIndex((prev) =>
                    prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0
                  )
                }
                className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white border border-white/20 transition-all cursor-pointer"
                aria-label="Next Image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Lightbox Bottom Info */}
          <div
            className="text-center max-w-2xl mx-auto w-full pt-2 text-white space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base sm:text-lg font-bold">
              {language === 'si' && activeLightboxItem.titleSi
                ? activeLightboxItem.titleSi
                : activeLightboxItem.title}
            </h3>
            {activeLightboxItem.description && (
              <p className="text-xs sm:text-sm text-slate-300">
                {activeLightboxItem.description}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
