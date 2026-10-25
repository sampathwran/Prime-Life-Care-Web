'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { GalleryItem } from '@/types';
import { subscribeToLiveGallery } from '@/lib/firestoreService';
import {
  Camera,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Images,
  HeartHandshake
} from 'lucide-react';

// Curated default 8 gallery items used as instant fallback before/if Firestore is empty
const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal_01',
    title: 'In-Home Senior Vital Monitoring',
    titleSi: 'නිවසේදී රෝගී දෛනික සෞඛ්‍ය පරීක්ෂාව',
    imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800',
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
    imageUrl: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&q=80&w=800',
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
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
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
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
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
    imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=800',
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
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
    category: 'Medical Equipment',
    description: 'Home delivery and setup of hospital beds, oxygen concentrators, and ripple mattresses.',
    isPublished: true,
    sortOrder: 6,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gal_07',
    title: 'Medication Management & Doctor Consultations',
    titleSi: 'නියමිත ඖෂධ ලබාදීම සහ වෛද්‍ය උපදෙස් පිළිපැදීම',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
    category: 'Clinical Nursing',
    description: 'Accurate pill organizer tracking, insulin administration and dosage compliance.',
    isPublished: true,
    sortOrder: 7,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gal_08',
    title: 'Happy Seniors & Joyful Home Environment',
    titleSi: 'සතුටුදායක සහ ආදරණීය නිවසේ රැකවරණ පරිසරය',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800',
    category: 'Elderly Care',
    description: 'Providing genuine smile, warmth, and peace of mind for families in Sri Lanka.',
    isPublished: true,
    sortOrder: 8,
    createdAt: new Date().toISOString(),
  },
];

export const GallerySection: React.FC = () => {
  const { language } = useLanguage();
  const [items, setItems] = useState<GalleryItem[]>(DEFAULT_GALLERY_ITEMS);
  const [showAll, setShowAll] = useState<boolean>(false);
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

  // Limit initially to 8 images, or show all when requested
  const INITIAL_LIMIT = 8;
  const displayedItems = showAll ? items : items.slice(0, INITIAL_LIMIT);
  const hasMoreThanEight = items.length > INITIAL_LIMIT;

  // Lightbox keyboard navigation (ESC, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : items.length - 1));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null && prev < items.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, items.length]);

  const activeLightboxItem = lightboxIndex !== null ? items[lightboxIndex] : null;

  return (
    <section id="gallery" className="py-14 sm:py-16 bg-slate-50/70 border-t border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Camera className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {language === 'si' ? 'අපගේ සත්කාර අවස්ථා ඡායාරූප' : 'Moments & Care In Action'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {language === 'si' ? (
              <>
                සැබෑ සත්කාර සහ සේවාවන්හි <span className="text-blue-600">ඡායාරූප එකතුව</span>
              </>
            ) : (
              <>
                Compassionate Care <span className="text-blue-600">Photo Gallery</span>
              </>
            )}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {language === 'si'
              ? 'අපගේ සුදුසුකම්ලත් සාත්තු සේවක සේවිකාවන්, රෝගී සත්කාරක ක්‍රියාවලි සහ සැබෑ සත්කාර අවස්ථා දැකබලාගන්න.'
              : 'Real snapshots of our dedicated caregivers, certified nurses, and professional home care services across Sri Lanka.'}
          </p>
        </div>

        {/* Compact 4-Column Responsive Grid (around 8 photos) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
          {displayedItems.map((item, index) => {
            const displayTitle = language === 'si' && item.titleSi ? item.titleSi : item.title;
            const isEighthCardWithMore = !showAll && hasMoreThanEight && index === INITIAL_LIMIT - 1;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isEighthCardWithMore) {
                    setShowAll(true);
                  } else {
                    setLightboxIndex(index);
                  }
                }}
                className="group relative rounded-xl overflow-hidden bg-slate-900 shadow-xs hover:shadow-lg border border-slate-200/90 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
              >
                {/* Photo Aspect Ratio (Compact 4:3 or 1:1) */}
                <div className="aspect-4/3 w-full overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-106"
                    loading="lazy"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent opacity-75 group-hover:opacity-90 transition-opacity" />

                  {/* 8th Card Special Overlay if there are more photos */}
                  {isEighthCardWithMore ? (
                    <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-2xs flex flex-col items-center justify-center text-white p-3 text-center transition-all group-hover:bg-slate-950/85">
                      <Images className="w-6 h-6 text-blue-400 mb-1 animate-bounce" />
                      <span className="text-base sm:text-lg font-black text-white">
                        +{items.length - INITIAL_LIMIT + 1} More
                      </span>
                      <span className="text-[11px] text-slate-300 font-medium">
                        {language === 'si' ? 'සියල්ල බලන්න' : 'View All'}
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* Zoom Button */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-7 h-7 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-xs">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Photo Title (Bottom) */}
                      <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-3">
                        <h3 className="text-white font-bold text-xs sm:text-[13px] leading-tight line-clamp-2 drop-shadow-sm">
                          {displayTitle}
                        </h3>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* View All / Show Less Button if more than 8 images exist */}
        {hasMoreThanEight && (
          <div className="mt-8 flex justify-center">
            {showAll ? (
              <button
                onClick={() => setShowAll(false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm border border-slate-300 shadow-2xs transition-all cursor-pointer active:scale-95"
              >
                <span>{language === 'si' ? 'අඩු කරන්න (Show Less)' : 'Show Less'}</span>
                <ChevronUp className="w-4 h-4 text-slate-500" />
              </button>
            ) : (
              <button
                onClick={() => setShowAll(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <Images className="w-4 h-4 text-blue-400" />
                <span>
                  {language === 'si'
                    ? `සියලුම ඡායාරූප බලන්න (${items.length})`
                    : `View All Photos (${items.length})`}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-300" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Fullscreen Modal */}
      {activeLightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Lightbox Topbar */}
          <div
            className="flex items-center justify-between text-white max-w-5xl mx-auto w-full pb-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 font-medium">
              <Camera className="w-4 h-4 text-blue-400" />
              <span>
                {lightboxIndex! + 1} / {items.length}
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
            {items.length > 1 && (
              <button
                onClick={() =>
                  setLightboxIndex((prev) =>
                    prev !== null && prev > 0 ? prev - 1 : items.length - 1
                  )
                }
                className="absolute left-1 sm:left-4 z-10 p-2.5 sm:p-3 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-white/20 transition-all cursor-pointer"
                aria-label="Previous Image"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

            {/* Main Image */}
            <div className="max-h-[75vh] max-w-full overflow-hidden rounded-2xl border border-white/15 shadow-2xl flex items-center justify-center bg-black/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeLightboxItem.imageUrl}
                alt={activeLightboxItem.title}
                className="max-h-[75vh] max-w-full object-contain select-none"
              />
            </div>

            {/* Next Button */}
            {items.length > 1 && (
              <button
                onClick={() =>
                  setLightboxIndex((prev) =>
                    prev !== null && prev < items.length - 1 ? prev + 1 : 0
                  )
                }
                className="absolute right-1 sm:right-4 z-10 p-2.5 sm:p-3 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-white/20 transition-all cursor-pointer"
                aria-label="Next Image"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
          </div>

          {/* Lightbox Bottom Info */}
          <div
            className="text-center max-w-2xl mx-auto w-full pt-2 text-white space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm sm:text-base font-bold">
              {language === 'si' && activeLightboxItem.titleSi
                ? activeLightboxItem.titleSi
                : activeLightboxItem.title}
            </h3>
            {activeLightboxItem.description && (
              <p className="text-xs text-slate-300">
                {activeLightboxItem.description}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
