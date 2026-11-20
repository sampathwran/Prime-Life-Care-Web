'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  ShieldCheck,
  Stethoscope,
  Eye,
  RefreshCw,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const TrustSection: React.FC = () => {
  const { t } = useLanguage();

  const icons = [
    <ShieldCheck key="shield" className="w-5 h-5 text-blue-600" />,
    <Stethoscope key="steth" className="w-5 h-5 text-slate-700" />,
    <Eye key="eye" className="w-5 h-5 text-indigo-600" />,
    <RefreshCw key="refresh" className="w-5 h-5 text-rose-500" />
  ];

  const iconBgClasses = [
    'bg-blue-50 border-blue-100',
    'bg-slate-100 border-slate-200',
    'bg-indigo-50 border-indigo-100',
    'bg-rose-50 border-rose-100'
  ];

  return (
    <section id="trust" className="py-12 sm:py-20 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.nav.whyUs}</span>
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mt-3 tracking-tight leading-snug">
            {t.trust.heading}
          </h2>
          <p className="text-xs sm:text-base text-slate-600 mt-2.5 leading-relaxed">
            {t.trust.subheading}
          </p>
        </div>

        {/* 4 Key Statistics Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mb-8 sm:mb-12">
          {t.trust.stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-slate-50 rounded-2xl p-3.5 sm:p-5 text-center border border-slate-200/80 hover:border-slate-300 transition-all"
            >
              <div className="text-xl sm:text-3xl font-black text-slate-900">
                {stat.value}
              </div>
              <p className="text-[11px] sm:text-sm font-semibold text-slate-600 mt-1 leading-snug">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Visual & Pillars Grid */}
        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          
          {/* Left Column: Authentic Nursing Photo */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border-2 border-slate-200 relative aspect-4/3 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/health_check.jpg"
                alt="Professional caregiver checking senior patient health in Sri Lanka"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />

              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 text-white">
                <span className="px-2 sm:px-2.5 py-0.5 rounded-md bg-blue-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider inline-block mb-1">
                  {t.trust.vitalsBadge}
                </span>
                <h4 className="font-bold text-sm sm:text-lg leading-snug">
                  {t.trust.vitalsHeading}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-200 mt-0.5 line-clamp-2">
                  {t.trust.vitalsDesc}
                </p>
              </div>
            </div>

            {/* Clean inline strip on mobile, overlaid floating badge on sm+ */}
            <div className="mt-3 sm:mt-0 sm:absolute sm:-bottom-3 sm:right-3 bg-white rounded-2xl p-3 shadow-md border border-slate-200 flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">{t.trust.standardBadge}</p>
                <p className="text-[10px] text-slate-500">{t.trust.standardSub}</p>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Key Pillars (2x2 Grid on Mobile & Desktop) */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-2.5 sm:gap-3.5">
            {t.trust.items.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-2xs hover:shadow-md transition-all border border-slate-200 hover:border-slate-300 flex flex-col justify-between group min-w-0"
              >
                <div>
                  <div
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl border flex items-center justify-center mb-2.5 sm:mb-3.5 ${iconBgClasses[index % iconBgClasses.length]}`}
                  >
                    {icons[index % icons.length]}
                  </div>
                  <h3 className="text-xs sm:text-base font-bold text-slate-900 mb-1 sm:mb-1.5 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-xs text-slate-500 font-semibold">
                  <span className="truncate">{t.trust.standardPrefix}{index + 1}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};
