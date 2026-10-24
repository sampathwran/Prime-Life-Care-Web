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
  Minus,
  Calendar,
  Clock,
  Sparkles,
  Layers,
  Baby,
  RefreshCw,
  UserCheck,
  UserX,
  Send,
  MessageSquare
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

  // Schedule & Duration (Extend / Shorten)
  const [startDate, setStartDate] = useState<string>('');
  const [durationDays, setDurationDays] = useState<number>(7);

  // Caregiver Replacement Request
  const [showReplacementForm, setShowReplacementForm] = useState<boolean>(false);
  const [replacementReason, setReplacementReason] = useState<string>('');
  const [isSubmittingReplacement, setIsSubmittingReplacement] = useState<boolean>(false);
  const [replacementFeedback, setReplacementFeedback] = useState<string | null>(null);

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
      setShowReplacementForm(false);
      setReplacementReason('');
      setReplacementFeedback(null);
    }
  }, [booking, isOpen]);

  if (!isOpen || !booking) return null;

  // Handle Extend or Shorten Duration
  const handleAdjustDuration = (deltaDays: number) => {
    setDurationDays((prev) => Math.max(1, prev + deltaDays));
  };

  // Handle Caregiver Replacement Request
  const handleSubmitReplacementRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacementReason.trim() || replacementReason.trim().length < 5) {
      setFeedbackMsg({
        type: 'error',
        text: 'Please type a clear reason for requesting a caregiver replacement (හේතුව සඳහන් කිරීම අනිවාර්යයි).'
      });
      return;
    }

    setIsSubmittingReplacement(true);
    setFeedbackMsg(null);

    const changeRequest = {
      requested: true,
      reason: replacementReason.trim(),
      requestedAt: new Date().toISOString(),
      status: 'pending' as const
    };

    try {
      await updateBookingInFirestore(booking.bookingCode, {
        caregiverChangeRequest: changeRequest,
        updatedAt: new Date().toISOString()
      });

      const updatedBooking: BookingSubmission = {
        ...booking,
        caregiverChangeRequest: changeRequest
      };
      onBookingUpdated(updatedBooking);

      setReplacementFeedback(
        'Caregiver replacement request has been submitted to Operations Admin. Our team will review your reason and assign a qualified alternative staff member.'
      );
      setShowReplacementForm(false);
      setFeedbackMsg({
        type: 'success',
        text: 'Caregiver replacement request submitted successfully!'
      });
    } catch (err) {
      console.error('Failed to submit replacement request:', err);
      setFeedbackMsg({
        type: 'error',
        text: 'Failed to submit replacement request. Please check your internet connection.'
      });
    } finally {
      setIsSubmittingReplacement(false);
    }
  };

  // Handle changing the Care Package / Service
  const handleServiceChange = (newServiceId: string) => {
    const selectedSvc = initialServices.find((s) => s.id === newServiceId);
    if (!selectedSvc) return;

    const newServiceName = selectedSvc.name[language] || selectedSvc.name.en;
    setServiceId(newServiceId);
    setServiceName(newServiceName);
    setShiftType(selectedSvc.shiftType);

    const defaultTierId = selectedSvc.defaultTierId || 'nvq_4_caregiver';
    const defaultTier = staffTiers.find((t) => t.id === defaultTierId) || staffTiers[2];
    setStaffTierId(defaultTier.id);
    setStaffTierName(defaultTier.name[language] || defaultTier.name.en);
    setPriceLKR(defaultTier.dailyRateLKR);

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
      setFeedbackMsg({ type: 'success', text: 'Care plan duration and booking details updated successfully!' });
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
                  Manage Booking • {booking.bookingCode}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800">
                  {booking.status?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Extend or shorten care plan duration, or submit a request to change your assigned caregiver.
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
                  This booking will be cancelled and archived.
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
                    <option value="Booked by mistake or duplicate">
                      Booked by mistake or duplicate
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

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[74vh] overflow-y-auto">
          {/* SECTION 1: EXTEND OR SHORTEN CARE PLAN (PRIMARY FEATURE) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-white border-2 border-emerald-300/80 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-950">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>Extend or Shorten Care Plan (දින ගණන දික් කිරීම හෝ කෙටි කිරීම)</span>
              </div>
              <span className="text-xs font-black text-emerald-900 bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-200">
                {durationDays} {durationDays === 1 ? 'Day' : 'Days'} Total
              </span>
            </div>

            <p className="text-xs text-emerald-800 leading-snug">
              Need to extend your patient&apos;s recovery period or conclude duty earlier? Adjust the duration below:
            </p>

            {/* Quick Extension & Shortening Action Buttons */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600 shrink-0">Extend (දික් කරගන්න):</span>
                <button
                  type="button"
                  onClick={() => handleAdjustDuration(3)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+3 Days</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustDuration(7)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+7 Days (1 Week)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustDuration(14)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+14 Days (2 Weeks)</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-emerald-200/60">
                <span className="text-[11px] font-bold text-slate-600 shrink-0">Shorten (කෙටි කරගන්න):</span>
                <button
                  type="button"
                  disabled={durationDays <= 1}
                  onClick={() => handleAdjustDuration(-1)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-300 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>-1 Day</span>
                </button>
                <button
                  type="button"
                  disabled={durationDays <= 3}
                  onClick={() => handleAdjustDuration(-3)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-300 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>-3 Days</span>
                </button>
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-[11px] font-semibold text-slate-600">Exact Days:</span>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Math.max(1, Number(e.target.value)))}
                    className="w-16 px-2 py-1 rounded-lg border border-emerald-300 bg-white font-black text-xs text-center text-slate-900 focus:outline-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Schedule & Fee Preview */}
            <div className="p-3 rounded-xl bg-white border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wide">Revised Schedule</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {startDate} → <span className="text-emerald-700">{computeEndDate(startDate, durationDays)}</span>
                </p>
                {durationDays !== booking.durationDays && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                    {durationDays > booking.durationDays
                      ? `Extended by +${durationDays - booking.durationDays} days`
                      : `Shortened by -${booking.durationDays - durationDays} days`}
                  </span>
                )}
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wide">Revised Total Fee</span>
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
                <span className="text-[10px] text-slate-400">
                  (LKR {priceLKR.toLocaleString()} / day)
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: REQUEST CAREGIVER / CARE WORKER REPLACEMENT (REASON MANDATORY) */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-amber-950">
                <UserCheck className="w-4 h-4 text-amber-600" />
                <span>Care Worker Replacement Request (සේවකයා මාරු කරගැනීම)</span>
              </div>
              {booking.assignedCaregiverName && (
                <span className="text-[10px] font-bold bg-white text-slate-800 px-2.5 py-0.5 rounded-md border border-amber-200">
                  Assigned: {booking.assignedCaregiverName}
                </span>
              )}
            </div>

            {/* Check if replacement request is already pending */}
            {booking.caregiverChangeRequest?.requested ? (
              <div className="p-3 rounded-xl bg-white border border-amber-300 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Replacement Request Under Operations Review</span>
                </div>
                <p className="text-slate-700 text-xs">
                  <strong>Reason given:</strong> &ldquo;{booking.caregiverChangeRequest.reason}&rdquo;
                </p>
                <span className="text-[10px] text-slate-500 block">
                  Requested on {new Date(booking.caregiverChangeRequest.requestedAt).toLocaleString()} • Our Operations Admin is arranging a replacement caregiver.
                </span>
              </div>
            ) : replacementFeedback ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{replacementFeedback}</span>
              </div>
            ) : (
              <div>
                {!showReplacementForm ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-xs text-amber-900">
                      Need a different care worker due to patient preference, language communication, or schedule?
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowReplacementForm(true)}
                      className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Request Care Worker Change</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReplacementRequest} className="mt-2 space-y-3 p-3.5 rounded-xl bg-white border border-amber-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-950">
                        Care Worker Replacement Request Form:
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowReplacementForm(false)}
                        className="text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-800 block mb-1">
                        Reason for Replacement Request (හේතුව සඳහන් කිරීම අනිවාර්යයි) *
                      </label>
                      <textarea
                        required
                        rows={3}
                        minLength={5}
                        value={replacementReason}
                        onChange={(e) => setReplacementReason(e.target.value)}
                        placeholder="කරුණාකර සේවකයා මාරු කිරීමට හේතුව මෙහි type කරන්න (උදා: රෝගියා ගැහැණු සාත්තු සේවිකාවකට කැමති වීම, භාෂා ගැටළුවක්, නියමිත වේලාවන් නොගැලපීම, විශේෂ කුසලතා අවශ්‍ය වීම)..."
                        className="w-full text-xs p-2.5 rounded-xl border border-amber-300 bg-amber-50/20 text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Minimum 5 characters. This reason is sent immediately to the Operations Admin.
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowReplacementForm(false)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingReplacement || !replacementReason.trim()}
                        className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSubmittingReplacement ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Submit Replacement Request</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* SECTION 3: EDIT PATIENT & CONTACT DETAILS */}
          <form onSubmit={handleSaveChanges} className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <User className="w-4 h-4 text-blue-600" />
                <span>Patient & Contact Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Patient Name *
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    City / Town
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Medical Conditions / Emergency Notes
                  </label>
                  <input
                    type="text"
                    value={medicalConditions}
                    onChange={(e) => setMedicalConditions(e.target.value)}
                    placeholder="e.g. Hypertension, Diabetes, special diet..."
                    className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
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
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Care Plan Duration</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};