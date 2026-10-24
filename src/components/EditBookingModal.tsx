'use client';

import React, { useState, useEffect } from 'react';
import { BookingSubmission, MobilityLevel, ShiftType, StaffTierId, VitalsCarePlan } from '@/types';
import { updateBookingInFirestore, deleteOrCancelBookingFromFirestore } from '@/lib/firestoreService';
import { districtList, initialServices } from '@/data/services';
import { staffTiers } from '@/data/staffTiers';
import { useLanguage } from '@/context/LanguageContext';
import { allStandardCareTasks, getDefaultCarePlanForService } from '@/data/packageCarePlans';
import {
  X,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader2,
  User,
  MapPin,
  Phone,
  Activity,
  Heart,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Calendar,
  Clock,
  Sparkles,
  Layers,
  Baby,
  RefreshCw
} from 'lucide-react';

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingSubmission | null;
  onBookingUpdated: (updated: BookingSubmission) => void;
  onBookingDeleted?: (bookingCode: string) => void;
}

export const EditBookingModal: React.FC<EditBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onBookingUpdated,
  onBookingDeleted
}) => {
  const { language } = useLanguage();

  // Package & Tier
  const [serviceId, setServiceId] = useState<string>('day_care_12h');
  const [serviceName, setServiceName] = useState<string>('');
  const [shiftType, setShiftType] = useState<ShiftType>('12h_day');
  const [staffTierId, setStaffTierId] = useState<StaffTierId>('nvq_4_caregiver');
  const [staffTierName, setStaffTierName] = useState<string>('NVQ 4 Certified');
  const [priceLKR, setPriceLKR] = useState<number>(4500);
  const [packageNotice, setPackageNotice] = useState<string | null>(null);

  // Schedule & Duration
  const [startDate, setStartDate] = useState<string>('');
  const [durationDays, setDurationDays] = useState<number>(7);

  // Patient Info
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number>(75);
  const [patientGender, setPatientGender] = useState<'Male' | 'Female'>('Male');
  const [mobilityLevel, setMobilityLevel] = useState<MobilityLevel>('partial');
  const [medicalConditions, setMedicalConditions] = useState('');

  // Location & Contact
  const [district, setDistrict] = useState('Colombo');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Vitals & Bedside Care Plan
  const [bpFrequency, setBpFrequency] = useState<string>('twice_daily');
  const [sugarFrequency, setSugarFrequency] = useState<string>('morning_fasting');
  const [bedTurningRequired, setBedTurningRequired] = useState<boolean>(true);
  const [medicationReminders, setMedicationReminders] = useState<boolean>(true);
  const [selectedCareTasks, setSelectedCareTasks] = useState<string[]>([]);
  const [customBedsideTaskInput, setCustomBedsideTaskInput] = useState('');

  // State flags
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState('Customer requested cancellation / schedule changed');
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Prefill state when modal opens
  useEffect(() => {
    if (booking) {
      setServiceId(booking.serviceId || 'day_care_12h');
      setServiceName(booking.serviceName || '');
      setShiftType(booking.shiftType || '12h_day');
      setStaffTierId(booking.staffTierId || 'nvq_4_caregiver');
      setStaffTierName(booking.staffTierName || 'NVQ 4 Certified');
      setPriceLKR(Number(booking.priceLKR) || 4500);

      setStartDate(booking.startDate || new Date().toISOString().split('T')[0]);
      setDurationDays(Number(booking.durationDays) || 7);

      setPatientName(booking.patientName || '');
      setPatientAge(booking.patientAge || 75);
      const isFemale = String(booking.patientGender || '').toLowerCase() === 'female';
      setPatientGender(isFemale ? 'Female' : 'Male');
      setMobilityLevel((booking.mobilityLevel as MobilityLevel) || 'partial');
      setMedicalConditions(booking.medicalConditions || '');
      setDistrict(booking.district || 'Colombo');
      setCity(booking.city || '');
      setAddress(booking.address || '');
      setContactName(booking.contactName || '');
      setContactPhone(booking.contactPhone || '');

      if (booking.vitalsPlan) {
        setBpFrequency(booking.vitalsPlan.bpFrequency || 'twice_daily');
        setSugarFrequency(booking.vitalsPlan.sugarFrequency || 'morning_fasting');
        setBedTurningRequired(booking.vitalsPlan.bedTurningRequired ?? true);
        setMedicationReminders(booking.vitalsPlan.medicationReminders ?? true);
      }
      setSelectedCareTasks(
        booking.carePlanTasks && booking.carePlanTasks.length > 0
          ? booking.carePlanTasks
          : getDefaultCarePlanForService(booking.serviceId || 'day_care_12h').carePlanTasks
      );
      setShowDeleteConfirm(false);
      setFeedbackMsg(null);
      setPackageNotice(null);
    }
  }, [booking, isOpen]);

  if (!isOpen || !booking) return null;

  // Handle changing the Care Package / Service
  const handleServiceChange = (newServiceId: string) => {
    const selectedSvc = initialServices.find((s) => s.id === newServiceId);
    if (!selectedSvc) return;

    const newServiceName = selectedSvc.name[language] || selectedSvc.name.en;
    setServiceId(newServiceId);
    setServiceName(newServiceName);
    setShiftType(selectedSvc.shiftType);

    // Auto pick tier
    const defaultTierId = selectedSvc.defaultTierId || 'nvq_4_caregiver';
    const defaultTier = staffTiers.find((t) => t.id === defaultTierId) || staffTiers[2];
    setStaffTierId(defaultTier.id);
    setStaffTierName(defaultTier.name[language] || defaultTier.name.en);
    setPriceLKR(defaultTier.dailyRateLKR);

    // Auto-update care plan & vitals to the new package preset
    const newPlan = getDefaultCarePlanForService(newServiceId, selectedSvc.category);
    setBpFrequency(newPlan.bpFrequency);
    setSugarFrequency(newPlan.sugarFrequency);
    setBedTurningRequired(newPlan.bedTurningRequired);
    setMedicationReminders(newPlan.medicationReminders);
    setSelectedCareTasks(newPlan.carePlanTasks);

    setPackageNotice(
      `Package changed to "${newServiceName}". Care routine & vitals plan have been auto-adapted to this package protocol.`
    );
  };

  // Handle changing Staff Tier
  const handleTierChange = (tierId: StaffTierId) => {
    const tier = staffTiers.find((t) => t.id === tierId);
    if (!tier) return;
    setStaffTierId(tier.id);
    setStaffTierName(tier.name[language] || tier.name.en);
    setPriceLKR(tier.dailyRateLKR);
  };

  // Reset Care Plan to current selected service defaults
  const handleResetToPackageDefaults = () => {
    const plan = getDefaultCarePlanForService(serviceId || booking.serviceId || booking.serviceName);
    setBpFrequency(plan.bpFrequency);
    setSugarFrequency(plan.sugarFrequency);
    setBedTurningRequired(plan.bedTurningRequired);
    setMedicationReminders(plan.medicationReminders);
    setSelectedCareTasks(plan.carePlanTasks);
    setPackageNotice('Reset vitals schedule and tasks to default package protocol.');
  };

  const handleAddCustomTask = () => {
    if (customBedsideTaskInput.trim()) {
      const task = customBedsideTaskInput.trim();
      if (!selectedCareTasks.includes(task)) {
        setSelectedCareTasks((prev) => [...prev, task]);
      }
      setCustomBedsideTaskInput('');
    }
  };

  const toggleTask = (task: string) => {
    setSelectedCareTasks((prev) =>
      prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task]
    );
  };

  // Compute calculated end date
  const computeEndDate = (start: string, days: number): string => {
    if (!start) return '';
    try {
      const d = new Date(start);
      if (isNaN(d.getTime())) return '';
      d.setDate(d.getDate() + (days > 1 ? days - 1 : 0));
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const totalCalculatedCost = (Number(priceLKR) || 4500) * (Number(durationDays) || 1);
  const originalCost = Number(booking.totalCostLKR) || (Number(booking.priceLKR) || 4500) * (Number(booking.durationDays) || 7);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Please enter patient name.' });
      return;
    }
    if (!contactPhone.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Please enter a contact phone number.' });
      return;
    }
    if (durationDays < 1) {
      setFeedbackMsg({ type: 'error', text: 'Duration must be at least 1 day.' });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);

    const vitalsPlan: VitalsCarePlan = {
      bpFrequency,
      sugarFrequency,
      bedTurningRequired,
      medicationReminders,
      bedTurnIntervalHours: bedTurningRequired ? 2 : 0,
      notes: medicalConditions
    };

    const updates: Partial<BookingSubmission> = {
      serviceId,
      serviceName,
      shiftType,
      staffTierId,
      staffTierName,
      priceLKR: Number(priceLKR),
      startDate,
      durationDays: Number(durationDays),
      totalCostLKR: totalCalculatedCost,
      patientName: patientName.trim(),
      patientAge: Number(patientAge),
      patientGender,
      mobilityLevel,
      medicalConditions: medicalConditions.trim(),
      district,
      city: city.trim(),
      address: address.trim(),
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      vitalsPlan,
      carePlanTasks: selectedCareTasks,
      updatedAt: new Date().toISOString()
    };

    try {
      await updateBookingInFirestore(booking.bookingCode, updates);
      const updatedBooking: BookingSubmission = {
        ...booking,
        ...updates
      };
      onBookingUpdated(updatedBooking);
      setFeedbackMsg({ type: 'success', text: 'Booking details, package & dates updated successfully!' });
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: unknown) {
      console.error('Update booking failed:', err);
      setFeedbackMsg({
        type: 'error',
        text: 'Failed to update booking. Please check network connection.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setFeedbackMsg(null);
    try {
      await deleteOrCancelBookingFromFirestore(booking.bookingCode, booking, deleteReason);
      setFeedbackMsg({ type: 'success', text: 'Booking cancelled & removed successfully.' });
      if (onBookingDeleted) {
        onBookingDeleted(booking.bookingCode);
      }
      setTimeout(() => {
        setShowDeleteConfirm(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Delete booking failed:', err);
      setFeedbackMsg({
        type: 'error',
        text: 'Failed to cancel booking. Please try again or contact support.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  Edit Booking • {booking.bookingCode}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800">
                  {booking.status?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Modify care package, dates, duration, medical bedside routine, or contact details.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`mx-6 mt-4 p-3.5 rounded-2xl flex items-center gap-2 text-xs font-bold ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Delete Confirmation Warning Overlay */}
        {showDeleteConfirm ? (
          <div className="p-6 space-y-4 bg-rose-50/60 border-b border-rose-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-rose-950">
                  Are you sure you want to cancel Booking {booking.bookingCode}?
                </h4>
                <p className="text-xs text-rose-700 mt-1">
                  Patient: <span className="font-semibold">{booking.patientName}</span> ({booking.serviceName}).
                  This booking will be cancelled and removed from active caregiver duties. (Operations retains an archive record).
                </p>

                <div className="mt-3">
                  <label className="text-[11px] font-bold text-rose-900 block mb-1">
                    Reason for Cancellation:
                  </label>
                  <select
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl bg-white border border-rose-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Customer requested cancellation / schedule changed">
                      Schedule changed / Family plans changed
                    </option>
                    <option value="Booked by mistake or wrong package">
                      Booked by mistake or wrong package
                    </option>
                    <option value="Patient admitted to hospital / recovered">
                      Patient admitted to hospital / recovered
                    </option>
                    <option value="Found alternative care arrangement">
                      Found alternative care arrangement
                    </option>
                    <option value="Other customer reason">Other reason</option>
                  </select>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Cancelling Booking...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Yes, Permanently Cancel Booking</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3.5 py-2 rounded-xl bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold border border-slate-200 cursor-pointer"
                  >
                    Keep Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Edit Form */}
        <form onSubmit={handleSaveChanges} className="p-6 space-y-5 max-h-[74vh] overflow-y-auto">
          {/* SECTION 1: CARE PACKAGE & STAFF TIER SELECTION */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-blue-50/40 border border-indigo-100/90 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Care Service Package & Staff Tier</span>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                LKR {priceLKR.toLocaleString()} / day
              </span>
            </div>

            {/* Service Dropdown */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Select Service Package (e.g. Elderly, Child Care, Post-Surgery, Palliative)
              </label>
              <select
                value={serviceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full text-xs font-bold p-2.5 rounded-xl bg-white border border-indigo-200 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                {initialServices.map((svc) => (
                  <option key={svc.id} value={svc.id}>
                    {svc.name[language] || svc.name.en} • ({svc.shiftType.replace('_', ' ')}) — LKR {svc.priceLKR.toLocaleString()}/day
                  </option>
                ))}
              </select>
            </div>

            {/* Notification when package is changed */}
            {packageNotice && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold flex items-center gap-2 animate-in fade-in">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="flex-1">{packageNotice}</span>
                <button
                  type="button"
                  onClick={() => setPackageNotice(null)}
                  className="text-amber-700 hover:text-amber-950 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Staff Tier Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                Staff Competency Tier:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {staffTiers
                  .filter((tier) => tier.id !== 'doctor' || serviceId === 'doctor_home_visit')
                  .map((tier) => {
                    const isSelected = staffTierId === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => handleTierChange(tier.id)}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/30 shadow-xs'
                            : 'bg-white/70 border-slate-200 hover:border-indigo-200 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-800'}`}>
                            {tier.name[language] || tier.name.en}
                          </span>
                        </div>
                        <span className="text-[10px] font-black text-slate-500 block mt-0.5">
                          LKR {tier.dailyRateLKR.toLocaleString()}/day
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* SECTION 2: DATES, DURATION & COST CALCULATION */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/90 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Duty Dates, Duration & Schedule</span>
              </div>
              <span className="text-[11px] font-black text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {durationDays} {durationDays === 1 ? 'Day' : 'Days'} Total
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Start Date */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Care Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl bg-white border border-emerald-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Shift Type */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Daily Shift Type
                </label>
                <select
                  value={shiftType}
                  onChange={(e) => setShiftType(e.target.value as ShiftType)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl bg-white border border-emerald-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="12h_day">12-Hour Day Shift (07 AM - 07 PM)</option>
                  <option value="12h_night">12-Hour Night Shift (07 PM - 07 AM)</option>
                  <option value="24h">24-Hour Full Day Care (Live-in)</option>
                  <option value="visit">Single Clinical Consultation Visit</option>
                </select>
              </div>

              {/* Custom Duration Number Input */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Duration (Number of Days) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  required
                  value={durationDays}
                  onChange={(e) => setDurationDays(Math.max(1, Number(e.target.value)))}
                  className="w-full text-xs font-black p-2.5 rounded-xl bg-white border border-emerald-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Quick Duration Preset Pills */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 block mb-1">
                Quick Select Duration (Days):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[1, 3, 5, 7, 10, 14, 21, 30].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDurationDays(days)}
                    className={`px-3 py-1 rounded-lg text-xs font-black border transition-all cursor-pointer ${
                      durationDays === days
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-emerald-200 hover:bg-emerald-100/50'
                    }`}
                  >
                    {days === 1 ? '1 Day' : days === 30 ? '30 Days (1 Month)' : `${days} Days`}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Care Window & Pricing Summary Card */}
            <div className="p-3 rounded-xl bg-white border border-emerald-200/90 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                  Scheduled Care Window
                </span>
                <p className="text-xs font-bold text-slate-900">
                  {startDate} → <span className="text-emerald-700">{computeEndDate(startDate, durationDays)}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                  Total Estimated Fee
                </span>
                <div className="flex items-baseline gap-1.5 justify-end">
                  {totalCalculatedCost !== originalCost && (
                    <span className="text-xs text-slate-400 line-through">
                      LKR {originalCost.toLocaleString()}
                    </span>
                  )}
                  <span className="text-sm font-black text-emerald-800">
                    LKR {totalCalculatedCost.toLocaleString()}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  (LKR {priceLKR.toLocaleString()} × {durationDays} {durationDays === 1 ? 'day' : 'days'})
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: PATIENT MEDICAL DETAILS */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <User className="w-4 h-4 text-blue-600" />
              <span>Patient / Recipient Medical Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Recipient / Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={patientAge}
                  onChange={(e) => setPatientAge(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Male', 'Female'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setPatientGender(g)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        patientGender === g
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Mobility Level
                </label>
                <select
                  value={mobilityLevel}
                  onChange={(e) => setMobilityLevel(e.target.value as MobilityLevel)}
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="independent">Fully Mobile / Independent / Child</option>
                  <option value="partial">Partial Assistance Required</option>
                  <option value="wheelchair">Wheelchair Bound</option>
                  <option value="bedridden">Bedridden (High Clinical Need)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Medical Conditions / Routine Requirements
              </label>
              <textarea
                rows={2}
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
                placeholder="e.g. Hypertension, Diabetes, post-surgery recovery, toddler feeding assistance, special diet..."
                className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* SECTION 4: LOCATION & FAMILY CONTACT */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Location & Family Contact Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  District
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {districtList.map((d) => {
                    const cleanName = d.split(' ')[0];
                    return (
                      <option key={d} value={cleanName}>
                        {d}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  City / Town
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Maharagama, Dehiwala"
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Detailed Residence Address & Directions
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="No. 45/A, Temple Road, landmark near fuel station"
                className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Family / Contact Person Name
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="0771234567"
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: VITALS CARE PLAN & BEDSIDE TASKS */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Heart className="w-4 h-4 text-blue-600" />
                <span>Vitals Monitoring & Bedside Routine Tasks</span>
              </div>
              <button
                type="button"
                onClick={handleResetToPackageDefaults}
                className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset to {serviceName || 'Package'} Defaults</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  BP & Pulse Monitoring Frequency
                </label>
                <select
                  value={bpFrequency}
                  onChange={(e) => setBpFrequency(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl bg-white border border-blue-200 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="none">Not Required / Child</option>
                  <option value="1x_daily">Once Daily (Morning)</option>
                  <option value="twice_daily">Twice Daily (Morning & Evening)</option>
                  <option value="thrice_daily">Thrice Daily (TDS)</option>
                  <option value="every_4_hours">Every 4 Hours (Critical / Post-Op)</option>
                  <option value="as_needed">As Needed (PRN)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Blood Glucose (Sugar) Testing
                </label>
                <select
                  value={sugarFrequency}
                  onChange={(e) => setSugarFrequency(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl bg-white border border-blue-200 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="none">Not Required</option>
                  <option value="morning_fasting">Morning Fasting (FBS)</option>
                  <option value="pre_meals">Pre-Meals (AC)</option>
                  <option value="post_prandial">Post-Prandial (PPBS)</option>
                  <option value="twice_daily">Twice Daily (FBS + PPBS)</option>
                  <option value="random">Random Blood Sugar Check</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-blue-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bedTurningRequired}
                  onChange={(e) => setBedTurningRequired(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-800">
                  Strict 2-Hour Bed Repositioning
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-blue-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={medicationReminders}
                  onChange={(e) => setMedicationReminders(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-800">
                  Medication Reminders & Dispensing
                </span>
              </label>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                Active Bedside Routine Tasks:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {Array.from(new Set([...allStandardCareTasks, ...selectedCareTasks])).map((task) => {
                  const isChecked = selectedCareTasks.includes(task);
                  return (
                    <button
                      key={task}
                      type="button"
                      onClick={() => toggleTask(task)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
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
                + Add Custom Task (e.g. Toddler formula feeding, Nebulizer, Walker support):
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
                  placeholder="e.g. Baby formula feeding every 3 hours, Special low-salt meal, Walker assistance..."
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-blue-600"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTask}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* MODAL ACTIONS */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Cancel / Delete Booking</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};