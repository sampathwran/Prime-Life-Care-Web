'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  ShieldCheck,
  HeartHandshake,
  PhoneCall,
  CheckCircle2,
  Star,
  Clock4,
  Users,
  Zap,
  ArrowRight
} from 'lucide-react';

interface HeroProps {
  onOpenBooking: () => void;
  onExploreServices: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking, onExploreServices }) => {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 lg:pt-14 lg:pb-22">
      {/* =====================================================================
          MOBILE & TABLET WORDPRESS-STYLE FULL-BLEED HERO BANNER (< lg)
          ===================================================================== */}
      <div className="lg:hidden relative min-h-[560px] sm:min-h-[600px] flex flex-col justify-between overflow-hidden bg-slate-950 text-white">
        {/* Full-Bleed Background Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero.jpg"
          alt="Compassionate elderly care nurse with smiling grandmother in Sri Lanka"
          className="absolute inset-0 w-full h-full object-cover object-center scale-102"
        />

        {/* Rich WordPress Agency Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/55 to-slate-950/95 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/50 via-transparent to-transparent pointer-events-none" />

        {/* Mobile Hero Content Container */}
        <div className="relative z-10 flex-1 flex flex-col justify-between px-4 sm:px-6 pt-5 pb-6 max-w-2xl mx-auto w-full gap-6">
          {/* Top Bar: Live Dispatch Pill + Rating Pill */}
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] font-bold border border-white/25 shadow-sm min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-85"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="truncate">{t.hero.liveDispatch}</span>
            </div>

            <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/20 text-[11px] font-extrabold text-amber-300 shrink-0 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>4.9</span>
            </div>
          </div>

          {/* Center / Lower Editorial Headline & CTAs */}
          <div className="space-y-4 mt-10 sm:mt-16">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-300">
              <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{t.hero.policeMedicalCleared}</span>
            </div>

            <h1 className="text-[26px] sm:text-4xl font-black text-white tracking-tight leading-[1.22] drop-shadow-sm">
              {t.hero.titleStart}{' '}
              <span className="text-sky-400">
                {t.hero.titleHighlight}
              </span>{' '}
              {t.hero.titleEnd}
            </h1>

            <p className="text-[13px] sm:text-base text-slate-200/95 leading-relaxed max-w-xl">
              {t.hero.description}
            </p>

            {/* WordPress-Style Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={onOpenBooking}
                className="w-full px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-lg shadow-blue-600/35 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <HeartHandshake className="w-5 h-5 text-white shrink-0" />
                <span>{t.hero.bookBtn}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={onExploreServices}
                  className="px-3.5 py-3 rounded-2xl bg-white/12 hover:bg-white/20 backdrop-blur-md text-white font-bold text-xs border border-white/25 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span className="truncate">{t.hero.exploreBtn}</span>
                </button>

                <a
                  href={`tel:${t.phone}`}
                  className="px-3.5 py-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 backdrop-blur-md text-emerald-100 font-bold text-xs border border-emerald-400/35 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span className="truncate">{t.phone}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Frosted Glass Highlights Strip */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/15">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-white">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate">{t.hero.stats.verifiedStaff}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-white">
              <Clock4 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{t.hero.stats.availability}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-white">
              <Users className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate">{t.hero.stats.familiesServed}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-white">
              <Zap className="w-3.5 h-3.5 text-sky-300 shrink-0" />
              <span className="truncate">{t.hero.stats.districts}</span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          DESKTOP / PC ORIGINAL 12-COLUMN SPLIT HERO (lg+)
          ===================================================================== */}
      <div className="hidden lg:block relative">
        {/* Subtle Soft Slate Ambient Glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-100/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-slate-200/40 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Live Status Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-slate-800 text-sm font-semibold border border-slate-200 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>{t.hero.liveDispatch}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {t.hero.titleStart}{' '}
                <span className="text-blue-600 underline decoration-blue-200 decoration-wavy decoration-2">
                  {t.hero.titleHighlight}
                </span>{' '}
                {t.hero.titleEnd}
              </h1>

              {/* Description */}
              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                {t.hero.description}
              </p>

              {/* Quick Benefits Bullet List with Clean Slate Pills */}
              <div className="grid grid-cols-2 gap-2.5 text-left pt-1 max-w-xl">
                <div className="flex items-center gap-2 text-sm text-slate-800 font-semibold bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{t.hero.stats.verifiedStaff}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-800 font-semibold bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{t.hero.stats.availability}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-800 font-semibold bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{t.hero.stats.familiesServed}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-800 font-semibold bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{t.hero.stats.districts}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row items-center justify-start gap-3.5 pt-3">
                <button
                  onClick={onOpenBooking}
                  className="px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md shadow-blue-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <HeartHandshake className="w-5 h-5 text-white" />
                  <span>{t.hero.bookBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onExploreServices}
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-300 hover:border-slate-400 shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{t.hero.exploreBtn}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Visual Showcase with Photo */}
            <div className="lg:col-span-5 relative">
              {/* Top-Right Floating Review Pill */}
              <div className="flex absolute -top-3 -right-3 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-lg border border-slate-200 items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{t.hero.ratingText}</span>
                  <p className="text-[10px] text-slate-500">{t.hero.familiesText}</p>
                </div>
              </div>

              {/* Bottom-Left Floating Express Dispatch Pill */}
              <div className="flex absolute -bottom-3 -left-3 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-lg border border-slate-200 items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{t.hero.rapidResponse}</span>
                  <p className="text-[10px] text-slate-500">{t.hero.rapidSubtitle}</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-4 shadow-xl border border-slate-200 relative">
                {/* Main Photo with gradient overlay */}
                <div className="relative rounded-2xl overflow-hidden aspect-4/3 shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/hero.jpg"
                    alt="Compassionate elderly care nurse with smiling grandmother in Sri Lanka"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent pointer-events-none" />

                  {/* Overlaid Badges */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">{t.hero.policeMedicalCleared}</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-blue-200">{t.hero.certifiedNurseAides}</p>
                      <p className="text-sm font-bold">{t.hero.oneOnOneCare}</p>
                    </div>
                    <div className="bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1 text-xs font-bold shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                      <span>4.9 / 5.0</span>
                    </div>
                  </div>
                </div>

                {/* Service Features Row */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                    <Clock4 className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{t.hero.shiftsTitle}</p>
                      <p className="text-[10px] text-slate-500">{t.hero.shiftsSubtitle}</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-700 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{t.hero.islandwideTitle}</p>
                      <p className="text-[10px] text-slate-500">{t.hero.islandwideSubtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Hotline Call Strip - Deep Slate */}
                <div className="mt-2.5 bg-slate-900 text-white rounded-2xl p-3 flex items-center justify-between shadow-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold">{t.hero.callNow}</p>
                    <p className="text-base font-bold tracking-wide">{t.phone}</p>
                  </div>
                  <a
                    href={`tel:${t.phone}`}
                    aria-label="Call Prime Life Care Hotline"
                    className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
