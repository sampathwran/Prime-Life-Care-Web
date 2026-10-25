'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { googleReviews } from '@/data/reviews';
import { GoogleReviewItem, LocalizedString } from '@/types';
import { subscribeToLiveReviews } from '@/lib/firestoreService';
import {
  Star,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  ExternalLink,
  MapPin
} from 'lucide-react';

const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-rose-600',
  'bg-amber-600',
  'bg-purple-600',
  'bg-cyan-600',
  'bg-indigo-600',
];

function getAvatarBg(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getLocalizedText(
  value: string | LocalizedString | undefined,
  lang: string
): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return (value as any)[lang] || value.en || '';
}

export const ReviewsSection: React.FC = () => {
  const { language, t } = useLanguage();
  const [reviews, setReviews] = useState<GoogleReviewItem[]>(googleReviews);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [cardsPerView, setCardsPerView] = useState<number>(3);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const touchStartX = useRef<number | null>(null);

  // Subscribe to real-time reviews from Firestore (managed by Admin Panel)
  useEffect(() => {
    const unsubscribe = subscribeToLiveReviews((liveList) => {
      if (liveList && liveList.length > 0) {
        setReviews(liveList);
      }
    });
    return () => unsubscribe();
  }, []);

  // Update cardsPerView based on window width
  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth < 640) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };

    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  const maxIndex = Math.max(0, reviews.length - cardsPerView);

  // Keep currentIndex within bounds if maxIndex changes
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [maxIndex, currentIndex]);

  // Automatic slide animation every 4.5 seconds
  useEffect(() => {
    if (isPaused || reviews.length <= cardsPerView) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, maxIndex, reviews.length, cardsPerView]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 40) {
      handlePrev();
    } else if (deltaX < -40) {
      handleNext();
    }
    touchStartX.current = null;
  };

  return (
    <section id="reviews" className="py-14 sm:py-18 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          {/* Google 5-Star Official Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 shadow-2xs mb-2.5">
            {/* Google Multi-Color G Icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="text-xs font-bold text-slate-800">{t.reviews.badge}</span>
            <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.5 rounded">
              ⭐ 4.9 / 5.0
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t.reviews.heading}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl mx-auto leading-relaxed">
            {t.reviews.subheading}
          </p>

          {/* Quick Stats Strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mt-3 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="font-bold text-slate-900">{t.reviews.googleRating}</span>
            </div>
            <span className="text-slate-300">•</span>
            <span>{t.reviews.reviewsCount}</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              100% Police Verified
            </span>
          </div>
        </div>

        {/* Carousel Wrapper with Controls */}
        <div
          className="relative max-w-6xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Previous Button */}
          {reviews.length > cardsPerView && (
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous reviews"
              className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 hover:text-slate-950 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Next Button */}
          {reviews.length > cardsPerView && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next reviews"
              className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 hover:text-slate-950 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Carousel Viewport (Overflow Hidden) */}
          <div className="overflow-hidden py-2 px-1">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`,
              }}
            >
              {reviews.map((rev) => {
                const textStr = getLocalizedText(rev.text, language);
                const locStr = getLocalizedText(rev.authorLocation, language);
                const timeStr = getLocalizedText(rev.timeAgo || rev.relativeTime, language) || 'Recently';
                const initial = rev.authorName ? rev.authorName.charAt(0).toUpperCase() : 'G';
                const avatarBg = getAvatarBg(rev.authorName);

                return (
                  <div
                    key={rev.id}
                    className="shrink-0 px-2 sm:px-2.5"
                    style={{ width: `${100 / cardsPerView}%` }}
                  >
                    {/* Compact Modern Google Review Card */}
                    <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between h-[210px] sm:h-[220px]">
                      <div>
                        {/* Header: Avatar, Name, Location, Date & Google G Logo */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-full ${avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
                            >
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">
                                {rev.authorName}
                              </h3>
                              {locStr && (
                                <p className="text-[10.5px] text-slate-500 flex items-center gap-1 truncate mt-0.5">
                                  <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{locStr}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Google G logo + Relative Time */}
                          <div className="flex flex-col items-end shrink-0">
                            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                              <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              />
                              <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              />
                              <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                              />
                              <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                              />
                            </svg>
                            <span className="text-[9.5px] text-slate-400 font-medium mt-0.5">
                              {timeStr}
                            </span>
                          </div>
                        </div>

                        {/* Star Rating */}
                        <div className="flex items-center gap-1 mb-2">
                          <div className="flex text-amber-400">
                            {[...Array(rev.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400" />
                            ))}
                          </div>
                        </div>

                        {/* Review Quote Text */}
                        <p className="text-[11.5px] sm:text-xs text-slate-700 leading-relaxed italic line-clamp-3">
                          &ldquo;{textStr}&rdquo;
                        </p>
                      </div>

                      {/* Card Footer: Verified Badge */}
                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10.5px]">
                        <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{t.reviews.verifiedClient}</span>
                        </div>
                        <span className="text-[9.5px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          Google Maps
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Carousel Dot Indicators */}
          {reviews.length > cardsPerView && (
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx
                      ? 'w-6 bg-slate-900'
                      : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Banner */}
        <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              {language === 'si'
                ? 'ඔබත් ප්‍රයිම් ලයිෆ් කෙයාර් සේවාව ලබාගත් පවුලක්ද?'
                : language === 'ta'
                ? 'நீங்களும் எங்கள் சேவையைப் பெற்ற குடும்பமா?'
                : 'Are you a family supported by Prime Life Care?'}
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              {language === 'si'
                ? 'ඔබගේ සැබෑ අත්දැකීම ගූගල් (Google) හරහා සටහන් කර අනෙක් පවුල් වලටත් නිවැරදි තීරණයක් ගැනීමට සහාය වන්න.'
                : language === 'ta'
                ? 'உங்கள் அனுபவத்தை Google இல் பகிர்ந்து மற்ற குடும்பங்களுக்கும் உதவுங்கள்.'
                : 'Share your sincere experience on Google to help other families find dependable care.'}
            </p>
          </div>

          <a
            href="https://google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 shadow-2xs flex items-center gap-1.5 shrink-0 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {language === 'si'
                ? 'ගූගල් ඇගයීමක් එක්කරන්න'
                : language === 'ta'
                ? 'Google மதிப்பாய்வு இடுக'
                : 'Write a Google Review'}
            </span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>

      </div>
    </section>
  );
};
