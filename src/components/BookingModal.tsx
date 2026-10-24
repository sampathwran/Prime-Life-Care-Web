'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { ServiceItem, BookingSubmission, StaffTierId } from '@/types';
import { districtList } from '@/data/services';
import { staffTiers } from '@/data/staffTiers';
import { saveBookingToFirestore } from '@/lib/firestoreService';
import { initialServices } from '@/data/services';
import { getDefaultCarePlanForService, allStandardCareTasks } from '@/data/packageCarePlans';
import { X, CheckCircle, ArrowRight, ArrowLeft, MessageSquare, Heart, Lock, User, LogIn, Award, Stethoscope, Loader2, MapPin, Navigation, ExternalLink, Plus, Trash2, Sparkles, Activity, Banknote, Landmark, CreditCard, Receipt } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService?: ServiceItem | null;
  selectedTierId?: StaffTierId;
  allServices?: ServiceItem[];
  onBookingSubmitted?: (booking: BookingSubmission) => void;
  onOpenProfile?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  selectedService = null,
  selectedTierId: initialTierId,
  allServices = initialServices,
  onBookingSubmitted,
  onOpenProfile
}) => {
  const { language, t } = useLanguage();
  const { user, openAuthModal } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activeServiceId, setActiveServiceId] = useState<string>('');
  const [activeTierId, setActiveTierId] = useState<StaffTierId>(initialTierId || 'nvq_4_caregiver');
  
  // Form State
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>(75);
  const [patientGender, setPatientGender] = useState<'male' | 'female'>('female');
  const [mobilityLevel, setMobilityLevel] = useState<'independent' | 'partial_assistance' | 'bedridden' | 'wheelchair'>('partial_assistance');
  const [medicalConditions, setMedicalConditions] = useState('');
  
  // Care Plan & Vitals Schedule Preferences (Optional / Package-Adaptive)
  const [isCustomCarePlanEnabled, setIsCustomCarePlanEnabled] = useState(false);
  const [bpFrequency, setBpFrequency] = useState<string>('2x_daily');
  const [sugarFrequency, setSugarFrequency] = useState<string>('fasting');
  const [bedTurningRequired, setBedTurningRequired] = useState(false);
  const [medicationReminders, setMedicationReminders] = useState(true);
  const [catheterCare, setCatheterCare] = useState(false);
  const [woundDressing, setWoundDressing] = useState(false);
  const [activeCareTasks, setActiveCareTasks] = useState<string[]>([]);
  const [customBedsideTaskInput, setCustomBedsideTaskInput] = useState('');

  // Sync package-specific default care plan whenever activeService changes
  useEffect(() => {
    if (activeServiceId) {
      const selected = allServices.find((s) => s.id === activeServiceId);
      const plan = getDefaultCarePlanForService(activeServiceId, selected?.category);
      setBpFrequency(plan.bpFrequency);
      setSugarFrequency(plan.sugarFrequency);
      setBedTurningRequired(plan.bedTurningRequired);
      setMedicationReminders(plan.medicationReminders);
      setCatheterCare(plan.catheterCare || false);
      setWoundDressing(plan.woundDressing || false);
      setActiveCareTasks(plan.carePlanTasks);
    }
  }, [activeServiceId, allServices]);

  const handleToggleTask = (task: string) => {
    setActiveCareTasks((prev) =>
      prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task]
    );
  };

  const handleAddCustomTask = () => {
    if (customBedsideTaskInput.trim()) {
      const task = customBedsideTaskInput.trim();
      if (!activeCareTasks.includes(task)) {
        setActiveCareTasks((prev) => [...prev, task]);
      }
      setCustomBedsideTaskInput('');
    }
  };
  
  const [district, setDistrict] = useState(districtList[0]);
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatusMsg, setLocationStatusMsg] = useState<string>('');

  const handleDetectLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationStatusMsg('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    setLocationStatusMsg('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);
        const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        setGoogleMapsUrl(mapUrl);
        setIsLocating(false);
        setLocationStatusMsg('✓ Location captured successfully via GPS!');
      },
      (error) => {
        setIsLocating(false);
        setLocationStatusMsg('Could not detect GPS automatically. You can paste a Google Maps link or enter coordinates below.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [specialNotes, setSpecialNotes] = useState('');

  // Payment method & advance payment states
  const [paymentMethod, setPaymentMethod] = useState<'cash_to_caregiver' | 'bank_transfer'>('cash_to_caregiver');
  const [advancePaymentOption, setAdvancePaymentOption] = useState<'pay_on_duty' | 'pay_advance'>('pay_on_duty');
  const [advanceAmountLKR, setAdvanceAmountLKR] = useState<number>(0);
  const [transferReference, setTransferReference] = useState<string>('');

  // Confirmation state
  const [confirmedBooking, setConfirmedBooking] = useState<BookingSubmission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (selectedService) {
      setActiveServiceId(selectedService.id);
    } else if (allServices.length > 0 && !activeServiceId) {
      setActiveServiceId(allServices[0].id);
    }
  }, [selectedService, allServices, activeServiceId]);

  useEffect(() => {
    if (initialTierId) {
      setActiveTierId(initialTierId);
    }
  }, [initialTierId]);

  // Pre-fill user data when user changes
  useEffect(() => {
    if (user) {
      setContactName(user.name);
      setContactPhone(user.phone);
      if (user.address && !address) {
        setAddress(user.address);
      }
    }
  }, [user, address]);

  if (!isOpen) return null;

  const currentServiceObj = allServices.find(s => s.id === activeServiceId) || allServices[0];
  const currentTierObj = staffTiers.find(t => t.id === activeTierId) || staffTiers[2];

  const effectiveDailyRate = currentTierObj.dailyRateLKR;

  const handleNext = () => {
    // Authentication requirement: User MUST be logged in
    if (!user) {
      openAuthModal();
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 4) {
      // Calculate total estimate based on selected staff tier
      const totalAmount = effectiveDailyRate * (Number(durationDays) || 7);

      // Generate Booking Submission
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const code = `PLC-2026-${randomSuffix}`;
      const newBooking: BookingSubmission = {
        id: `b_${Date.now()}`,
        userId: user.id,
        bookingCode: code,
        serviceId: currentServiceObj.id,
        serviceName: currentServiceObj.name[language],
        staffTierId: currentTierObj.id,
        staffTierName: currentTierObj.name[language],
        shiftType: currentServiceObj.shiftType,
        priceLKR: effectiveDailyRate,
        patientName: patientName || 'Elder Patient',
        patientAge: Number(patientAge) || 75,
        patientGender,
        mobilityLevel,
        medicalConditions: medicalConditions || 'None specified',
        district,
        city: city || 'Colombo',
        address: address || user.address || 'House address provided',
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        googleMapsUrl: googleMapsUrl || (latitude && longitude ? `https://www.google.com/maps?q=${latitude},${longitude}` : undefined),
        contactName: contactName || user.name,
        contactPhone: contactPhone || user.phone,
        contactEmail: user.email,
        startDate: startDate || new Date().toISOString().split('T')[0],
        durationDays: Number(durationDays) || 7,
        totalCostLKR: totalAmount,
        specialNotes,
        status: 'pending_review',
        paymentStatus: advancePaymentOption === 'pay_advance' && advanceAmountLKR > 0 ? 'advance_paid' : 'unpaid',
        paymentMethod,
        advancePaymentOption,
        advanceAmountLKR: advancePaymentOption === 'pay_advance' ? advanceAmountLKR : 0,
        transferReference: paymentMethod === 'bank_transfer' && transferReference ? transferReference.trim() : undefined,
        createdAt: new Date().toISOString(),
        vitalsPlan: isCustomCarePlanEnabled
          ? {
              bpFrequency,
              sugarFrequency,
              spo2Monitoring: true,
              bedTurningRequired: bedTurningRequired || mobilityLevel === 'bedridden',
              bedTurningFrequencyHours: (bedTurningRequired || mobilityLevel === 'bedridden') ? 2 : 0,
              bedTurnIntervalHours: (bedTurningRequired || mobilityLevel === 'bedridden') ? 2 : 0,
              medicationReminders,
              catheterCare,
              woundDressing,
            }
          : {
              ...getDefaultCarePlanForService(activeServiceId, currentServiceObj?.category),
              spo2Monitoring: true,
              bedTurnIntervalHours: (bedTurningRequired || mobilityLevel === 'bedridden') ? 2 : 0,
            },
        carePlanTasks: isCustomCarePlanEnabled && activeCareTasks.length > 0
          ? activeCareTasks
          : getDefaultCarePlanForService(activeServiceId, currentServiceObj?.category).carePlanTasks,
      };

      setIsSubmitting(true);
      saveBookingToFirestore(newBooking)
        .catch((err) => {
          console.warn('[Firestore] Booking write fallback (proceeding offline):', err);
        })
        .finally(() => {
          setIsSubmitting(false);
          setConfirmedBooking(newBooking);
          onBookingSubmitted?.(newBooking);
          setCurrentStep(5);
        });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetAndClose = () => {
    setCurrentStep(1);
    setConfirmedBooking(null);
    onClose();
  };

  const authWarning = {
    si: {
      text: 'Booking එකක් දැමීමට පෙර කරුණාකර ඔබගේ ඊමේල් ලිපිනය මඟින් පිවිසෙන්න.',
      btn: 'පළමුව ලොග් වන්න'
    },
    en: {
      text: 'Please sign in with your email to submit and link this booking to your profile.',
      btn: 'Sign In First'
    },
    ta: {
      text: 'முன்பதிவு செய்ய உங்கள் மின்னஞ்சலில் உள்நுழையவும்.',
      btn: 'முதலில் உள்நுழைக'
    }
  }[language];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header - Clinical Slate */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            type="button"
            onClick={resetAndClose}
            className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-red-600 text-white font-bold text-xs transition-all border border-white/20 shadow-xs cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
            <span>{language === 'si' ? 'වසන්න' : language === 'ta' ? 'மூடு' : 'Close'}</span>
          </button>
          <div className="flex items-center gap-2 mb-1 text-slate-300 text-xs font-bold uppercase tracking-wider pr-20">
            <img src="/logo.png" alt="Logo" className="w-5 h-5 rounded-full bg-white object-contain p-0.5" />
            <span>Prime Life Care Dispatch Portal</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">
            {t.booking.modalTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {t.booking.modalSubtitle}
          </p>

          {/* Stepper Progress */}
          {currentStep < 5 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800 text-xs font-semibold">
              <span className={currentStep >= 1 ? 'text-white font-bold' : 'text-slate-400'}>1. Service & Staff</span>
              <span className={currentStep >= 2 ? 'text-white font-bold' : 'text-slate-400'}>{t.booking.step2}</span>
              <span className={currentStep >= 3 ? 'text-white font-bold' : 'text-slate-400'}>{t.booking.step3}</span>
              <span className={currentStep >= 4 ? 'text-white font-bold' : 'text-slate-400'}>{t.booking.step4}</span>
            </div>
          )}
        </div>

        {/* Auth Required Banner if not signed in */}
        {!user && currentStep < 5 && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{authWarning.text}</span>
            </div>
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold shrink-0 flex items-center gap-1 shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              {authWarning.btn}
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          {/* STEP 1: SERVICE & STAFF QUALIFICATION TIER */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Service Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  1. Select Care Package
                </label>
                <div className="grid gap-2.5">
                  {allServices.map((svc) => (
                    <div
                      key={svc.id}
                      onClick={() => setActiveServiceId(svc.id)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        activeServiceId === svc.id
                          ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {svc.name[language]}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {svc.hours} Hours • {svc.shortDescription[language]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Staff Qualification Tier Selector */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  2. Select Caregiver Qualification Level (Staff Tier)
                </label>
                <div className="grid gap-2.5">
                  {staffTiers.map((tier) => (
                    <div
                      key={tier.id}
                      onClick={() => setActiveTierId(tier.id)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        activeTierId === tier.id
                          ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{tier.name[language]}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {tier.id === 'doctor' ? 'MBBS Doctor' : tier.id.toUpperCase().replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {tier.experienceYears} • {tier.idealFor[language]}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className="font-black text-emerald-800 text-sm">
                          LKR {tier.dailyRateLKR.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block">/ day</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PATIENT DETAILS */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* Quick Select from Saved Family / Patient Profiles */}
              {user?.savedPatients && user.savedPatients.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/90 shadow-2xs">
                  <span className="block text-[11px] font-bold text-blue-900 mb-1.5">
                    {language === 'si' ? '⚡ සුරැකි පවුලේ සාමාජිකයෙකු තෝරාගන්න (1-Click Fill):' : '⚡ Quick-fill from saved family members:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {user.savedPatients.map((sp) => (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => {
                          setPatientName(sp.name.split(' (')[0]);
                          setPatientAge(sp.age);
                          setPatientGender(sp.gender);
                          if (sp.mobility.toLowerCase().includes('bedridden')) {
                            setMobilityLevel('bedridden');
                          } else if (sp.mobility.toLowerCase().includes('wheelchair')) {
                            setMobilityLevel('wheelchair');
                          } else if (sp.mobility.toLowerCase().includes('independent')) {
                            setMobilityLevel('independent');
                          } else {
                            setMobilityLevel('partial_assistance');
                          }
                          setMedicalConditions(sp.conditions);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-slate-800 text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                        <span>{sp.name} ({sp.relation})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.booking.patientName} *
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Mrs. Soma Perera"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.booking.patientAge} *
                  </label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value ? Number(e.target.value) : '')}
                    placeholder="75"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.booking.patientGender}
                  </label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value as 'male' | 'female')}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600 bg-white"
                  >
                    <option value="female">{t.booking.genderFemale}</option>
                    <option value="male">{t.booking.genderMale}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.booking.mobilityLabel}
                </label>
                <select
                  value={mobilityLevel}
                  onChange={(e) => setMobilityLevel(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600 bg-white"
                >
                  <option value="partial_assistance">{t.booking.mobilityPartial}</option>
                  <option value="bedridden">{t.booking.mobilityBedridden}</option>
                  <option value="wheelchair">{t.booking.mobilityWheelchair}</option>
                  <option value="independent">{t.booking.mobilityIndependent}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.booking.medicalConditions}
                </label>
                <textarea
                  rows={2}
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder="e.g. Hypertension, Mild Alzheimer's, Bed rest after hip surgery"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                />
              </div>

              {/* Care Plan & Vitals Schedule Preferences (Optional Add-on) */}
              <div className="p-4 bg-gradient-to-r from-blue-50/90 to-indigo-50/80 rounded-2xl border border-blue-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                      {language === 'si' ? 'සායනික Vitals සහ Care Plan සකස් කිරීම' : 'Clinical Vitals & Bedside Care Plan'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      {language === 'si' ? 'අවශ්‍ය නම් පමණක් (Optional)' : 'Optional Add-on'}
                    </span>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none bg-white/80 px-3 py-1.5 rounded-xl border border-blue-200 hover:bg-white transition-all shadow-2xs">
                    <input
                      type="checkbox"
                      checked={isCustomCarePlanEnabled}
                      onChange={(e) => setIsCustomCarePlanEnabled(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-blue-900">
                      {isCustomCarePlanEnabled
                        ? (language === 'si' ? 'Plan එක සක්‍රීයයි' : 'Plan Customizer Active')
                        : (language === 'si' ? '+ Plan එක සකස් කරන්න' : '+ Customize Care Plan')}
                    </span>
                  </label>
                </div>

                {!isCustomCarePlanEnabled ? (
                  <div className="p-3 bg-white/80 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">
                        {language === 'si'
                          ? `තෝරාගත් Package එකට (${currentServiceObj?.name[language] || currentServiceObj?.name.en || 'General Care'}) අදාළ සම්මත සායනික ක්‍රමවේදය ක්‍රියාත්මක වේ.`
                          : `Standard clinical package protocol will be applied automatically for ${currentServiceObj?.name.en || 'selected service'}.`}
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        {language === 'si'
                          ? 'ලෙඩාට විශේෂිත Vitals frequency හෝ bedside duties අවශ්‍ය නම් පමණක් ඉහත බොත්තම ඔබා customize කරන්න.'
                          : 'Only enable if you have specialized bedside vitals or clinical instructions for the caregiver.'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCustomCarePlanEnabled(true)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs"
                    >
                      {language === 'si' ? '+ Customize කරන්න' : '+ Customize Now'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-1 border-t border-blue-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-blue-800">
                        {language === 'si'
                          ? `Package එක අනුව සකස් වූ නිර්දේශිත සත්කාර සැලැස්ම: ${currentServiceObj?.name[language] || currentServiceObj?.name.en}`
                          : `Recommended plan optimized for: ${currentServiceObj?.name.en || 'Selected Service'}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (activeServiceId) {
                            const selected = allServices.find((s) => s.id === activeServiceId);
                            const plan = getDefaultCarePlanForService(activeServiceId, selected?.category);
                            setBpFrequency(plan.bpFrequency);
                            setSugarFrequency(plan.sugarFrequency);
                            setBedTurningRequired(plan.bedTurningRequired);
                            setMedicationReminders(plan.medicationReminders);
                            setCatheterCare(plan.catheterCare || false);
                            setWoundDressing(plan.woundDressing || false);
                            setActiveCareTasks(plan.carePlanTasks);
                          }
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        {language === 'si' ? 'Package Defaults වලට හරවන්න' : 'Reset to Package Defaults'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          {language === 'si' ? 'රුධිර පීඩන (BP) පරීක්ෂාව' : 'Blood Pressure (BP) Frequency'}
                        </label>
                        <select
                          value={bpFrequency}
                          onChange={(e) => setBpFrequency(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-semibold focus:outline-blue-600"
                        >
                          <option value="none">Not Required (අවශ්‍ය නොවේ)</option>
                          <option value="1x_daily">Once Daily (දිනකට 1 වරක් - උදෑසන)</option>
                          <option value="2x_daily">Twice Daily (දිනකට 2 වරක් - උදේ සහ සවස)</option>
                          <option value="thrice_daily">Thrice Daily (දිනකට 3 වරක්)</option>
                          <option value="4x_daily">Every 4 Hours (පැය 4න් 4ට - Critical)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          {language === 'si' ? 'රුධිර සීනි (Sugar) පරීක්ෂාව' : 'Blood Glucose (Sugar) Testing'}
                        </label>
                        <select
                          value={sugarFrequency}
                          onChange={(e) => setSugarFrequency(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-semibold focus:outline-blue-600"
                        >
                          <option value="none">Not Required (අවශ්‍ය නොවේ)</option>
                          <option value="fasting">Morning Fasting (නිරාහාරව උදෑසන - FBS)</option>
                          <option value="pre_meals">Pre-Meals (ආහාරයට පෙර - AC)</option>
                          <option value="fasting_and_pp">Fasting + Post-Meal (උදේ නිරාහාරව + කෑමෙන් පසු - 2x)</option>
                          <option value="random">Random Blood Sugar (අවශ්‍යතාව අනුව - RBS)</option>
                        </select>
                      </div>
                    </div>

                    {/* Protocol Switches */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px] text-slate-700">
                      <label className="flex items-center gap-2 p-2 bg-white/90 rounded-xl border border-blue-100 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={bedTurningRequired || mobilityLevel === 'bedridden'}
                          onChange={(e) => setBedTurningRequired(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-semibold">
                          {language === 'si' ? 'පැය 2න් 2ට පැත්ත මාරු කිරීම (Bedsore Care)' : 'Strict 2-Hour Bed Repositioning'}
                        </span>
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white/90 rounded-xl border border-blue-100 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={medicationReminders}
                          onChange={(e) => setMedicationReminders(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-semibold">
                          {language === 'si' ? 'නියමිත වේලාවට ඖෂධ ලබා දීම' : 'Medication Reminders & Admin'}
                        </span>
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white/90 rounded-xl border border-blue-100 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={catheterCare}
                          onChange={(e) => setCatheterCare(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-semibold">
                          {language === 'si' ? 'කැතීටර් / නළ පෝෂණ සත්කාරය' : 'Catheter & Urine Bag Care'}
                        </span>
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white/90 rounded-xl border border-blue-100 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={woundDressing}
                          onChange={(e) => setWoundDressing(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-semibold">
                          {language === 'si' ? 'තුවාල වෙළුම් සත්කාරය' : 'Wound Dressing & Aseptic Care'}
                        </span>
                      </label>
                    </div>

                    {/* Active Bedside Routine Tasks Badges */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        {language === 'si' ? 'ක්‍රියාත්මක Bedside Routine Tasks (ක්ලික් කර වෙනස් කරන්න):' : 'Active Bedside Routine Tasks (Click to Toggle):'}
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {allStandardCareTasks.map((task) => {
                          const isChecked = activeCareTasks.includes(task);
                          return (
                            <button
                              key={task}
                              type="button"
                              onClick={() => handleToggleTask(task)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                                isChecked
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {task}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Add Custom Bedside Task */}
                    <div className="pt-2 border-t border-blue-100">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {language === 'si' ? '+ විශේෂිත අමතර Bedside Task එකක් ඇතුළත් කරන්න:' : '+ Add Custom Bedside Task:'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={customBedsideTaskInput}
                          onChange={(e) => setCustomBedsideTaskInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomTask();
                            }
                          }}
                          placeholder={language === 'si' ? 'උදා: උදේ 8ට ඉන්සියුලින් විදීම, හවස ඇවිද්දවීම...' : 'e.g. Insulin injection at 8 AM, Assisted walking at 5 PM...'}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-blue-600"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomTask}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{language === 'si' ? 'එක් කරන්න' : 'Add'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: LOCATION DETAILS */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.booking.districtLabel} *
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600 bg-white"
                >
                  {districtList.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.booking.cityLabel} *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Nugegoda / Rajagiriya / Kandy Town"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.booking.addressLabel} *
                </label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. No 45/2, Temple Road, near St. Joseph Church"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                />
              </div>

              {/* Google Map Exact Location Pinning */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {language === 'si' ? 'රෝගියාගේ නිවසේ සිතියම් ස්ථානය (Google Map Pin)' : 'Patient Residence Google Map Pin'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {language === 'si' ? 'සාත්තු සේවකයාට පහසුවෙන් නිවස සොයාගැනීමට GPS මඟින් සලකුණු කරන්න' : 'Allows caregivers and operations dispatch to navigate directly via GPS'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isLocating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{language === 'si' ? 'හඳුනාගනිමින්...' : 'Locating...'}</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-3.5 h-3.5" />
                        <span>{language === 'si' ? '⚡ මගේ GPS ස්ථානය ලබාගන්න' : '⚡ Use My GPS'}</span>
                      </>
                    )}
                  </button>
                </div>

                {locationStatusMsg && (
                  <div className={`text-xs px-3 py-1.5 rounded-xl font-medium ${locationStatusMsg.startsWith('✓') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {locationStatusMsg}
                  </div>
                )}

                {/* Google Maps Coordinates Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Latitude (අක්ෂාංශය)</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={latitude ?? ''}
                      onChange={(e) => {
                        const val = e.target.value ? parseFloat(e.target.value) : null;
                        setLatitude(val);
                        if (val && longitude) setGoogleMapsUrl(`https://www.google.com/maps?q=${val},${longitude}`);
                      }}
                      placeholder="e.g. 6.927079"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Longitude (දේශාංශය)</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={longitude ?? ''}
                      onChange={(e) => {
                        const val = e.target.value ? parseFloat(e.target.value) : null;
                        setLongitude(val);
                        if (latitude && val) setGoogleMapsUrl(`https://www.google.com/maps?q=${latitude},${val}`);
                      }}
                      placeholder="e.g. 79.861244"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs"
                    />
                  </div>
                </div>

                {/* Live Google Maps Link & Coordinates Display */}
                {latitude && longitude && (
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-emerald-900 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Pinned: {latitude.toFixed(5)}, {longitude.toFixed(5)}
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 underline underline-offset-2"
                    >
                      <span>{language === 'si' ? 'Google Maps හි බලන්න' : 'Preview on Google Maps'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: SCHEDULE & CONTACT */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.booking.startDate} *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.booking.durationDays}
                  </label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    min={1}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.booking.contactName} *
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Dr. Kasun Silva (Son / Daughter)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.booking.contactPhone} *
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="077 123 4567"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.booking.specialNotes}
                </label>
                <input
                  type="text"
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="e.g. Vegetarian food only / Female caregiver preferred"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                />
              </div>

              {/* Payment Method Selection */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Payment Method (ගෙවීම් ක්‍රමය) *
                  </label>
                  <span className="text-[10px] text-blue-700 font-bold bg-blue-100/70 px-2 py-0.5 rounded-md">
                    Cash or Bank Transfer
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Cash to Caregiver */}
                  <div
                    onClick={() => setPaymentMethod('cash_to_caregiver')}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                      paymentMethod === 'cash_to_caregiver'
                        ? 'bg-emerald-50/80 border-emerald-600 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${paymentMethod === 'cash_to_caregiver' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Cash to Caregiver on Duty
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5 leading-snug">
                        Pay cash directly to your assigned care worker on duty upon arrival or shift handover.
                      </span>
                    </div>
                  </div>

                  {/* Bank Transfer */}
                  <div
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                      paymentMethod === 'bank_transfer'
                        ? 'bg-blue-50/80 border-blue-600 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${paymentMethod === 'bank_transfer' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Direct Bank Transfer
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5 leading-snug">
                        Deposit or online transfer to Prime Life Care company corporate account.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bank Account Details (shown if Bank Transfer chosen) */}
                {paymentMethod === 'bank_transfer' && (
                  <div className="mt-2.5 p-3.5 rounded-xl bg-white border border-blue-200 text-xs text-blue-950 space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-blue-100 pb-1.5">
                      <span className="font-bold text-[11px] uppercase tracking-wide text-blue-900">Official Company Bank Account</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">Commercial Bank</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Account Name:</span>
                        <span className="font-bold text-slate-900">Prime Life Care (Pvt) Ltd</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Account Number:</span>
                        <span className="font-mono font-bold text-blue-700 text-xs">1000 489 231</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Bank:</span>
                        <span className="font-semibold text-slate-800">Commercial Bank of Ceylon</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Branch:</span>
                        <span className="font-semibold text-slate-800">Kollupitiya (035)</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-blue-950 block mb-1">
                        Bank Transfer Reference / Deposit Slip No. (Optional):
                      </label>
                      <input
                        type="text"
                        value={transferReference}
                        onChange={(e) => setTransferReference(e.target.value)}
                        placeholder="e.g. Ref: TXN-49102 or Slip No."
                        className="w-full text-xs p-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 focus:outline-blue-600"
                      />
                    </div>
                  </div>
                )}

                {/* Advance Payment Preference */}
                <div className="pt-2 border-t border-blue-200/60">
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Advance Payment Option (අත්තිකාරම් මුදලක් ගෙවීමට අවශ්‍යද?):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAdvancePaymentOption('pay_on_duty');
                        setAdvanceAmountLKR(0);
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left ${
                        advancePaymentOption === 'pay_on_duty'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span>Pay on Duty / Shifts</span>
                      <span className="text-[10px] block opacity-80 font-normal">Pay when service begins</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAdvancePaymentOption('pay_advance');
                        const total = effectiveDailyRate * (Number(durationDays) || 7);
                        if (advanceAmountLKR === 0) {
                          setAdvanceAmountLKR(Math.round(total * 0.20));
                        }
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left ${
                        advancePaymentOption === 'pay_advance'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50/50'
                      }`}
                    >
                      <span>Pay Advance Now</span>
                      <span className="text-[10px] block opacity-80 font-normal">Confirm with partial deposit</span>
                    </button>
                  </div>

                  {advancePaymentOption === 'pay_advance' && (
                    <div className="mt-2.5 p-3 rounded-xl bg-white border border-emerald-300 text-xs space-y-2 animate-in fade-in">
                      {(() => {
                        const total = effectiveDailyRate * (Number(durationDays) || 7);
                        return (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-700">Quick Advance Percentage:</span>
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setAdvanceAmountLKR(Math.round(total * 0.20))}
                                  className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                                >
                                  20% (LKR {Math.round(total * 0.20).toLocaleString()})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAdvanceAmountLKR(Math.round(total * 0.50))}
                                  className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                                >
                                  50% (LKR {Math.round(total * 0.50).toLocaleString()})
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-600">LKR</span>
                              <input
                                type="number"
                                min={500}
                                max={total}
                                value={advanceAmountLKR}
                                onChange={(e) => setAdvanceAmountLKR(Number(e.target.value))}
                                className="flex-1 text-xs font-bold p-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 focus:outline-emerald-600"
                              />
                            </div>
                            <div className="flex justify-between text-[11px] text-emerald-800 pt-1 border-t border-slate-100 font-semibold">
                              <span>Advance to Pay: LKR {advanceAmountLKR.toLocaleString()}</span>
                              <span>Remaining on Duty: LKR {Math.max(0, total - advanceAmountLKR).toLocaleString()}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Estimate Breakdown */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Selected Staff Qualification:</span>
                  <strong className="text-slate-900">{currentTierObj.name[language]}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Rate per Day:</span>
                  <span>LKR {effectiveDailyRate.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 font-bold text-slate-900 text-sm">
                  <span>Total for {durationDays} Days:</span>
                  <span className="text-emerald-800 font-black">
                    LKR {(effectiveDailyRate * (Number(durationDays) || 7)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS CONFIRMATION */}
          {currentStep === 5 && confirmedBooking && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl sm:text-2xl font-black text-slate-900">
                  {t.booking.successTitle}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  {t.booking.successMessage}
                </p>
              </div>

              <div className="bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-2xl p-4 max-w-sm mx-auto">
                <span className="text-xs uppercase font-bold text-emerald-700 tracking-wider">Booking Tracking Code</span>
                <p className="text-2xl sm:text-3xl font-black text-emerald-900 tracking-wider mt-0.5">
                  {confirmedBooking.bookingCode}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl text-left text-xs sm:text-sm text-slate-700 space-y-1.5 max-w-md mx-auto border border-slate-200">
                <p><strong>Package:</strong> {confirmedBooking.serviceName}</p>
                <p><strong>Staff Tier:</strong> {confirmedBooking.staffTierName}</p>
                <p><strong>Patient:</strong> {confirmedBooking.patientName} ({confirmedBooking.patientAge} yrs)</p>
                <p><strong>Location:</strong> {confirmedBooking.city}, {confirmedBooking.district}</p>
                <p><strong>Payment Method:</strong> {confirmedBooking.paymentMethod === 'bank_transfer' ? 'Direct Bank Transfer (Prime Life Care A/C 1000489231)' : 'Cash to Caregiver on Duty'}</p>
                {confirmedBooking.advanceAmountLKR && confirmedBooking.advanceAmountLKR > 0 ? (
                  <p><strong>Advance Amount:</strong> LKR {confirmedBooking.advanceAmountLKR.toLocaleString()} (Remaining Due: LKR {Math.max(0, (confirmedBooking.totalCostLKR || 0) - confirmedBooking.advanceAmountLKR).toLocaleString()})</p>
                ) : null}
                <p><strong>Account:</strong> {confirmedBooking.contactEmail}</p>
              </div>

              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {t.booking.successCallNotice}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={() => {
                    resetAndClose();
                    onOpenProfile?.();
                  }}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
                >
                  View in My Profile
                </button>

                <a
                  href={`https://wa.me/94771234567?text=Hello%20Prime%20Life%20Care,%20I%20have%20submitted%20booking%20${confirmedBooking.bookingCode}%20for%20${encodeURIComponent(confirmedBooking.patientName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  {t.booking.whatsappBtn}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        {currentStep < 5 && (
          <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-white flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.booking.backBtn}
              </button>
            ) : <div />}

            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to Cloud...</span>
                </>
              ) : (
                <>
                  <span>{currentStep === 4 ? t.booking.submitBtn : t.booking.nextBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
