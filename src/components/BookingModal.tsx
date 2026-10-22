'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { ServiceItem, BookingSubmission, StaffTierId } from '@/types';
import { districtList } from '@/data/services';
import { staffTiers } from '@/data/staffTiers';
import { saveBookingToFirestore } from '@/lib/firestoreService';
import { initialServices } from '@/data/services';
import { X, CheckCircle, ArrowRight, ArrowLeft, MessageSquare, Heart, Lock, User, LogIn, Award, Stethoscope, Loader2 } from 'lucide-react';

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
  
  const [district, setDistrict] = useState(districtList[0]);
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [specialNotes, setSpecialNotes] = useState('');

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
        contactName: contactName || user.name,
        contactPhone: contactPhone || user.phone,
        contactEmail: user.email,
        startDate: startDate || new Date().toISOString().split('T')[0],
        durationDays: Number(durationDays) || 7,
        totalCostLKR: totalAmount,
        specialNotes,
        status: 'pending_review',
        paymentStatus: 'unpaid',
        createdAt: new Date().toISOString()
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
            onClick={resetAndClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 mb-1 text-slate-300 text-xs font-bold uppercase tracking-wider">
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
                  {allServices.slice(0, 4).map((svc) => (
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
