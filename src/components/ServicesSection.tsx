'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ServiceItem, ServiceCategory, StaffTierId, ServiceTierOption } from '@/types';
import { staffTiers } from '@/data/staffTiers';
import {
  Sun,
  Moon,
  Home,
  HeartPulse,
  Brain,
  Clock,
  Check,
  ArrowRight,
  Sparkles,
  Baby,
  Smile,
  X,
  Info
} from 'lucide-react';

interface ServicesSectionProps {
  services: ServiceItem[];
  onSelectServiceToBook: (service: ServiceItem, tierId?: StaffTierId) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  onSelectServiceToBook
}) => {
  const { language, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('all');
  
  // Track selected tier per service id. If none, default to service's defaultTierId or first tier
  const [selectedTiers, setSelectedTiers] = useState<Record<string, StaffTierId>>({});
  
  // Tier comparison modal open state
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun':
        return (
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-500">
            <Sun className="w-5 h-5" />
          </div>
        );
      case 'Moon':
        return (
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-500">
            <Moon className="w-5 h-5" />
          </div>
        );
      case 'Home':
        return (
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
            <Home className="w-5 h-5" />
          </div>
        );
      case 'HeartPulse':
        return (
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-500">
            <HeartPulse className="w-5 h-5" />
          </div>
        );
      case 'Brain':
        return (
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-500">
            <Brain className="w-5 h-5" />
          </div>
        );
      case 'Clock':
        return (
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <Clock className="w-5 h-5" />
          </div>
        );
      case 'Baby':
        return (
          <div className="w-12 h-12 rounded-xl bg-pink-50 border border-pink-200/60 flex items-center justify-center text-pink-500">
            <Baby className="w-5 h-5" />
          </div>
        );
      case 'Smile':
        return (
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-600">
            <Smile className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
            <HeartPulse className="w-5 h-5" />
          </div>
        );
    }
  };

  const filteredServices = services.filter((svc) => {
    if (selectedCategory === 'all') return true;
    return svc.category === selectedCategory;
  });

  const handleTierSelect = (serviceId: string, tierId: StaffTierId) => {
    setSelectedTiers((prev) => ({
      ...prev,
      [serviceId]: tierId
    }));
  };

  const getTierShortLabel = (tierId: string, tierObj?: ServiceTierOption) => {
    if (tierObj?.tierName && typeof tierObj.tierName === "object") {
      const localized = tierObj.tierName[language] || tierObj.tierName["en"];
      if (localized) return localized;
    }
    switch (tierId) {
      case "basic_aide":
        return { en: "Basic Aide", si: "මූලික සහායක", ta: "அடிப்படை" }[language];
      case "nurse_assistant":
        return { en: "Nurse Assistant", si: "හෙද සහායක", ta: "செவிலியர் உதவி" }[language];
      case "nvq_4_caregiver":
        return { en: "NVQ 4 ⭐", si: "NVQ 4 ⭐", ta: "NVQ 4 ⭐" }[language];
      case "nvq_5_nurse":
        return { en: "NVQ 5 Nurse", si: "NVQ 5 හෙද", ta: "NVQ 5 செவிலியர்" }[language];
      case "doctor":
        return { en: "MBBS Doctor", si: "MBBS වෛද්‍ය", ta: "மருத்துவர்" }[language];
      default:
        return tierId.replace(/_/g, " ");
    }
  };

  return (
    <section id="services" className="py-16 sm:py-20 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-slate-800 text-xs sm:text-sm font-bold tracking-wide uppercase shadow-2xs border border-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.nav.services}</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3.5 tracking-tight">
            {t.services.heading}
          </h2>
          
          <p className="text-sm sm:text-base text-slate-600 mt-2.5 leading-relaxed">
            {t.services.subheading}
          </p>

          {/* Quick Staff Tiers Interactive Comparison Modal Trigger */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.services.compareTiersBtn}</span>
              <span className="text-[10px] bg-slate-100 text-slate-700 font-extrabold px-1.5 py-0.5 rounded">
                NVQ 4 vs NVQ 5
              </span>
            </button>
          </div>
        </div>

        {/* Category Filter Tabs - Including Child Care */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.services.filterAll}
          </button>
          <button
            onClick={() => setSelectedCategory('elderly_care')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedCategory === 'elderly_care'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.services.filterElderly}
          </button>
          <button
            onClick={() => setSelectedCategory('child_care')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedCategory === 'child_care'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.services.filterChild}
          </button>
          <button
            onClick={() => setSelectedCategory('recovery')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedCategory === 'recovery'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.services.filterRecovery}
          </button>
          <button
            onClick={() => setSelectedCategory('specialized')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedCategory === 'specialized'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.services.filterSpecialized}
          </button>
          <button
            onClick={() => setSelectedCategory('short_visit')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedCategory === 'short_visit'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.services.filterShort}
          </button>
        </div>

        {/* Dynamic Services Grid with Interactive Qualification Tiers */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const currentTierId: StaffTierId =
              selectedTiers[service.id] ||
              service.defaultTierId ||
              service.tiers?.[0]?.tierId ||
              'nvq_4_caregiver';

            const activeTierOption: ServiceTierOption | undefined = service.tiers?.find(
              (t) => t.tierId === currentTierId
            );

            const activePrice = activeTierOption ? activeTierOption.priceLKR : service.priceLKR;
            
            const activeDuties = (activeTierOption
              ? (activeTierOption.responsibilities?.[language] || activeTierOption.responsibilities?.["en"] || (activeTierOption as any).duties)
              : (service.features?.[language] || service.features?.["en"])) || [];

            const activeUnit = activeTierOption
              ? (activeTierOption.pricingUnit?.[language] || activeTierOption.pricingUnit?.["en"] || (typeof activeTierOption.pricingUnit === "string" ? activeTierOption.pricingUnit : "/ day"))
              : (service.pricingUnit?.[language] || service.pricingUnit?.["en"] || (typeof service.pricingUnit === "string" ? service.pricingUnit : "/ day"));

            const activeBadge = activeTierOption
              ? (activeTierOption.badge?.[language] || activeTierOption.badge?.["en"] || (typeof activeTierOption.badge === "string" ? activeTierOption.badge : ""))
              : null;

            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top: Icon + Dynamic Price & Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className="shrink-0">
                      {getServiceIcon(service.icon)}
                    </div>

                    <div className="text-right">
                      {activeBadge && (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-bold border border-slate-200 mb-1">
                          {activeBadge}
                        </span>
                      )}
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="text-xs text-slate-400 font-semibold uppercase">
                          {t.services.lkrPrefix}
                        </span>
                        <span className="text-2xl font-black text-slate-900 tracking-tight">
                          {activePrice.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium block">
                        {activeUnit}
                      </span>
                    </div>
                  </div>

                  {/* Title & Shift Hours Badge */}
                  <div className="mb-2">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold mb-1.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{t.services.hoursPrefix} {service.hours}h</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {service.name[language]}
                    </h3>
                  </div>

                  {/* Short Description */}
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    {service.shortDescription[language]}
                  </p>

                  {/* INTERACTIVE QUALIFICATION TIER TOGGLE PILLS */}
                  {service.tiers && service.tiers.length > 1 && (
                    <div className="mb-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {t.services.selectStaffTier}
                        </span>
                        <span className="text-[10px] text-blue-700 font-bold">
                          {activeTierOption?.tierName[language]}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        {service.tiers.map((tier) => {
                          const isSelected = tier.tierId === currentTierId;
                          return (
                            <button
                              key={tier.tierId}
                              type="button"
                              onClick={() => handleTierSelect(service.id, tier.tierId)}
                              className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all text-left flex flex-col justify-between cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 w-full">
                                <span className="truncate">{getTierShortLabel(tier.tierId, tier)}</span>
                                {tier.isRecommended && (
                                  <span className="text-[9px]">
                                    ⭐
                                  </span>
                                )}
                              </div>
                              <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                                LKR {tier.priceLKR.toLocaleString()}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* DUTIES CHECKLIST */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 mb-5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {t.services.includedDuties}
                    </p>
                    {activeDuties.map((duty, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-normal">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{duty}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary CTA Button */}
                <button
                  type="button"
                  onClick={() => onSelectServiceToBook(service, currentTierId)}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>{t.services.bookThis} ({getTierShortLabel(currentTierId, activeTierOption)})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Dynamic Admin Notification Note */}
        <div className="mt-10 text-center text-xs text-slate-500 bg-white py-3 px-4 rounded-xl border border-slate-200 max-w-xl mx-auto">
          💡 {t.services.dynamicNotice}
        </div>
      </div>

      {/* COMPREHENSIVE TIER COMPARISON GUIDE MODAL */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 sm:p-6 relative">
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg sm:text-xl font-bold">
                {t.services.compareModalTitle}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                {t.services.compareModalSubtitle}
              </p>
            </div>

            {/* Modal Content - Comparison Cards */}
            <div className="p-5 sm:p-6 max-h-[70vh] overflow-y-auto space-y-4 bg-slate-50">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {staffTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                          {tier.id === 'doctor' ? 'MBBS Doctor' : tier.id.toUpperCase().replace('_', ' ')}
                        </span>
                        <span className="font-bold text-slate-900 text-xs">
                          LKR {tier.dailyRateLKR.toLocaleString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">
                        {tier.name[language]}
                      </h4>
                      <p className="text-xs text-slate-500 mb-2.5 leading-relaxed">
                        {tier.qualifications[language]}
                      </p>

                      <div className="text-[11px] font-medium text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-100 mb-2.5">
                        <span className="text-blue-700 font-bold block mb-0.5">
                          {t.services.idealFor}
                        </span>
                        <span>{tier.idealFor[language]}</span>
                      </div>

                      <div className="space-y-1 pt-2 border-t border-slate-100 text-xs text-slate-600">
                        <span className="font-bold text-slate-700 text-[10px] uppercase block">
                          {t.services.coreDuties}
                        </span>
                        {tier.responsibilities[language].slice(0, 3).map((r, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-white px-5 py-3.5 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                {t.services.closeModal}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
