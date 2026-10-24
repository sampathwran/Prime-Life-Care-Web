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
  Lock,
  CheckSquare,
  Square,
  HelpCircle
} from 'lucide-react';

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingSubmission | null;
  onBookingUpdated: (updated: BookingSubmission) => void;
  onBookingDeleted?: (bookingCode: string) => void;
}

type ModalTab = 'duration' | 'care_plan' | 'replacement' | 'patient_info';

export const EditBookingModal: React.FC<EditBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onBookingUpdated,
  onBookingDeleted
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<ModalTab>('duration');

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
  const [replacementCategory, setReplacementCategory] = useState<string>('caregiver_personal_issue');
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
  const [bpFrequency, setBpFrequency] = useState<string>('2x_daily');
  const [sugarFrequency, setSugarFrequency] = useState<string>('morning_fasting');
  const [bedTurningRequired, setBedTurningRequired] = useState<boolean>(true);
  const [medicationReminders, setMedicationReminders] = useState<boolean>(true);
  const [spo2Monitoring, setSpo2Monitoring] = useState<boolean>(true);
  const [vitalsNotes, setVitalsNotes] = useState<string>('');
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
        setBpFrequency(booking.vitalsPlan.bpFrequency || '2x_daily');
        setSugarFrequency(booking.vitalsPlan.sugarFrequency || 'morning_fasting');
        setBedTurningRequired(booking.vitalsPlan.bedTurningRequired ?? true);
        setMedicationReminders(booking.vitalsPlan.medicationReminders ?? true);
        setSpo2Monitoring(booking.vitalsPlan.spo2Monitoring ?? true);
        setVitalsNotes(booking.vitalsPlan.notes || '');
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

  // Duty and Assignment Status Checkers
  const hasCaregiverAssigned = Boolean(
    booking.assignedCaregiverName &&
    booking.assignedCaregiverName.trim() !== '' &&
    booking.status !== 'pending_review'
  );

  const hasCaregiverCheckedIn = Boolean(
    booking.isCaregiverCheckedIn ||
    booking.status === 'in_progress' ||
    Boolean(booking.lastCheckInTime) ||
    (booking.shifts && booking.shifts.length > 0 && booking.shifts.some((s) => s.checkInTime || s.clockInTime))
  );

  // RULE 1: Caregiver Replacement can ONLY be requested if caregiver is assigned AND has checked in on duty!
  const canRequestReplacement = hasCaregiverAssigned && hasCaregiverCheckedIn;

  // RULE 2: Customer can add/edit Vitals & Care Plan BEFORE check-in! Once checked in, duty is live in the field.
  const canEditCarePlan = !hasCaregiverCheckedIn && booking.status !== 'completed';

  const replacementCategories = [
    {
      id: 'caregiver_personal_issue',
      label: 'Caregiver Personal Emergency / Health (සේවකයාගේ පෞද්ගලික / අසනීප ගැටලුවක්)',
      desc: 'Staff member faced an unexpected personal emergency, illness, or transport issue.'
    },
    {
      id: 'language_communication',
      label: 'Language / Communication Barrier (භාෂා හෝ සන්නිවේදන ගැටලුවක්)',
      desc: 'Difficulty communicating instructions effectively with patient or family members.'
    },
    {
      id: 'patient_preference',
      label: 'Patient Preference / Comfort (රෝගියාගේ කැමැත්ත / විශේෂ සාත්තු අවශ්‍යතාවයක්)',
      desc: 'Patient prefers a different gender, bedside manner, or specific routine approach.'
    },
    {
      id: 'schedule_mismatch',
      label: 'Punctuality / Schedule Mismatch (නියමිත වේලාවන් නොගැලපීම)',
      desc: 'Shift timing or arrival schedule conflicts with household routine.'
    },
    {
      id: 'care_quality_attitude',
      label: 'Care Standards / Attitude (සේවා ගුණාත්මකභාවය පිළිබඳ ගැටලුවක්)',
      desc: 'Bedside routine, empathy, or care hygiene did not meet expected hospital-grade standards.'
    },
    {
      id: 'other',
      label: 'Other Specific Reason (වෙනත් හේතුවක්)',
      desc: 'Describe your detailed reason below.'
    }
  ];

  // Handle Extend or Shorten Duration
  const handleAdjustDuration = (deltaDays: number) => {
    setDurationDays((prev) => Math.max(1, prev + deltaDays));
  };

  // Handle Caregiver Replacement Request
  const handleSubmitReplacementRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canRequestReplacement) {
      setFeedbackMsg({
        type: 'error',
        text: 'A replacement can only be requested once the assigned care worker has checked in for duty.'
      });
      return;
    }

    if (!replacementReason.trim() || replacementReason.trim().length < 5) {
      setFeedbackMsg({
        type: 'error',
        text: 'Please type a clear reason for requesting a caregiver replacement (හේතුව සඳහන් කිරීම අනිවාර්යයි).'
      });
      return;
    }

    setIsSubmittingReplacement(true);
    setFeedbackMsg(null);

    const categoryObj = replacementCategories.find((c) => c.id === replacementCategory);
    const changeRequest = {
      requested: true,
      category: replacementCategory,
      categoryLabel: categoryObj?.label || 'General',
      reason: replacementReason.trim(),
      requestedAt: new Date().toISOString(),
      status: 'pending' as const,
      caregiverNameAtRequest: booking.assignedCaregiverName || 'Assigned Staff'
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
        'Caregiver replacement request has been submitted to Operations Admin. Our coordinator will review your request immediately and dispatch an alternative qualified staff member.'
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
  const originalCost =
    Number(booking.totalCostLKR) ||
    (Number(booking.priceLKR) || 4500) * (Number(booking.durationDays) || 7);

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
      spo2Monitoring,
      bedTurnIntervalHours: bedTurningRequired ? 2 : 0,
      notes: vitalsNotes.trim() || medicalConditions.trim()
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
      setFeedbackMsg({
        type: 'success',
        text: 'Care plan, duration, and booking details updated successfully!'
      });
      setTimeout(() => {
        onClose();
      }, 1200);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-slate-900">
                  Manage Booking • {booking.bookingCode}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800">
                  {booking.status?.replace('_', ' ')}
                </span>
                {hasCaregiverCheckedIn ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Checked In & Active</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                    Pre-Checkin Phase
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize vitals & care routine, extend or shorten duration, or request caregiver change.
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

        {/* Tab Navigation Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50/90 px-4 pt-2 gap-1 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('duration')}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'duration'
                ? 'bg-white text-emerald-800 border-t-2 border-emerald-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Extend / Shorten Plan</span>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-[10px] font-black text-emerald-800">
              {durationDays}d
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('care_plan')}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'care_plan'
                ? 'bg-white text-blue-800 border-t-2 border-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>Vitals & Care Plan</span>
            {canEditCarePlan ? (
              <span className="px-1.5 py-0.2 rounded-md bg-blue-100 text-[10px] font-black text-blue-800">
                Editable
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-md bg-slate-200 text-[10px] font-black text-slate-700 flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5" />
                Active
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('replacement')}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'replacement'
                ? 'bg-white text-amber-900 border-t-2 border-amber-500 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Care Worker Change</span>
            {canRequestReplacement ? (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            ) : (
              <Lock className="w-3 h-3 text-slate-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('patient_info')}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'patient_info'
                ? 'bg-white text-slate-900 border-t-2 border-slate-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <User className="w-3.5 h-3.5 text-slate-600" />
            <span>Patient & Address</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`mx-6 mt-3 p-3 rounded-2xl flex items-center gap-2 text-xs font-bold shrink-0 ${
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
        {showDeleteConfirm && (
          <div className="p-5 space-y-3 bg-rose-50/80 border-b border-rose-200 shrink-0">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
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

                <div className="mt-2.5">
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

                <div className="mt-3 flex items-center gap-2">
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
        )}

        {/* Content Body - Scrollable */}
        <form onSubmit={handleSaveChanges} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* TAB 1: EXTEND OR SHORTEN CARE CONTRACT */}
          {activeTab === 'duration' && (
            <div className="space-y-4">
              <div className="p-4.5 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-white border-2 border-emerald-300/80 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-950">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                    <span>Extend or Shorten Care Plan Duration (දින ගණන දික් කිරීම හෝ කෙටි කිරීම)</span>
                  </div>
                  <span className="text-xs font-black text-emerald-900 bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-200">
                    {durationDays} {durationDays === 1 ? 'Day' : 'Days'} Total
                  </span>
                </div>

                <p className="text-xs text-emerald-800 leading-snug">
                  Need to extend your patient&apos;s recovery period or conclude duty earlier? Adjust the duration below:
                </p>

                {/* Quick Extension & Shortening Action Buttons */}
                <div className="space-y-2 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-700 shrink-0">Extend (දික් කරගන්න):</span>
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

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-200/60">
                    <span className="text-[11px] font-bold text-slate-700 shrink-0">Shorten (කෙටි කරගන්න):</span>
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
                <div className="p-3.5 rounded-xl bg-white border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wide">Revised Schedule</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {startDate} → <span className="text-emerald-700 font-extrabold">{computeEndDate(startDate, durationDays)}</span>
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
                      <span className="text-base font-black text-emerald-800">
                        LKR {totalCalculatedCost.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      (LKR {priceLKR.toLocaleString()} / day)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VITALS MONITORING & BEDSIDE CARE PLAN (CONFIGURABLE BEFORE CHECK-IN) */}
          {activeTab === 'care_plan' && (
            <div className="space-y-4">
              {/* Permission & Status Banner */}
              {canEditCarePlan ? (
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Customize Before Check-In (සේවකයා පැමිණීමට පෙර වෙනස් කළ හැක):</span>
                    <p className="text-[11px] text-blue-800 mt-0.5">
                      You can add or update your patient&apos;s vitals monitoring schedule and bedside routine tasks below. Once the care worker checks in for duty, this care plan will be locked and actively tracked on-site.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Duty In Progress - Care Plan Locked (සේවය සක්‍රීයව පවතී):</span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Caregiver <strong>{booking.assignedCaregiverName || 'Staff'}</strong> is currently on-site executing this care routine. For medical safety, active clinical changes must be confirmed via the Clinical Supervisor at 077 123 4567.
                    </p>
                  </div>
                </div>
              )}

              {/* Package Selector (if wrong package was booked) */}
              {canEditCarePlan && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      Care Package / Service Category
                    </span>
                    <button
                      type="button"
                      onClick={handleResetToPackageDefaults}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset to Package Defaults</span>
                    </button>
                  </div>

                  <select
                    value={serviceId}
                    onChange={(e) => handleServiceChange(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {initialServices.map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {svc.name.en} ({svc.shiftType === '24h_full' ? '24h Full Live-In' : '12h Shift'})
                      </option>
                    ))}
                  </select>

                  {packageNotice && (
                    <p className="text-[11px] text-emerald-700 font-semibold">{packageNotice}</p>
                  )}
                </div>
              )}

              {/* Sub-Section A: Clinical Vitals Monitoring Plan */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Activity className="w-4 h-4 text-rose-600" />
                  <span>Clinical Vitals Monitoring Frequencies (විටල්ස් පරීක්ෂා කිරීමේ කාලසටහන)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      BP & Heart Pulse Monitoring
                    </label>
                    <select
                      disabled={!canEditCarePlan}
                      value={bpFrequency}
                      onChange={(e) => setBpFrequency(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      <option value="2x_daily">Twice Daily (Morning & Evening) - රෙකමදාරු</option>
                      <option value="1x_daily">Once Daily (Morning)</option>
                      <option value="4x_daily">Every 4-6 Hours (Strict Surgical/Cardiac)</option>
                      <option value="as_needed">As Needed / When Symptomatic (PRN)</option>
                      <option value="none">Not Required / None</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Blood Glucose (Sugar) Testing
                    </label>
                    <select
                      disabled={!canEditCarePlan}
                      value={sugarFrequency}
                      onChange={(e) => setSugarFrequency(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      <option value="morning_fasting">Pre-Meals / Fasting (AC) - උදෑසන නිරාහාරව</option>
                      <option value="fasting_and_pp">Fasting (AC) & 2h Post-Meals (PC)</option>
                      <option value="random">Random Spot Checks (සසම්භාවී)</option>
                      <option value="bedtime">Bedtime Glucometer Check</option>
                      <option value="weekly">Weekly Routine Check</option>
                      <option value="none">Not Required / None</option>
                    </select>
                  </div>
                </div>

                {/* Vitals Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                    bedTurningRequired ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' : 'bg-white border-slate-200 text-slate-600'
                  }`}>
                    <input
                      type="checkbox"
                      disabled={!canEditCarePlan}
                      checked={bedTurningRequired}
                      onChange={(e) => setBedTurningRequired(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Strict 2h Bed Repositioning</span>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                    medicationReminders ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' : 'bg-white border-slate-200 text-slate-600'
                  }`}>
                    <input
                      type="checkbox"
                      disabled={!canEditCarePlan}
                      checked={medicationReminders}
                      onChange={(e) => setMedicationReminders(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Medication Administration Log</span>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                    spo2Monitoring ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' : 'bg-white border-slate-200 text-slate-600'
                  }`}>
                    <input
                      type="checkbox"
                      disabled={!canEditCarePlan}
                      checked={spo2Monitoring}
                      onChange={(e) => setSpo2Monitoring(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>SpO2 Pulse Oximeter Checks</span>
                  </label>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Special Clinical Vitals Notes / Target Readings (වෛද්‍ය උපදෙස්)
                  </label>
                  <input
                    type="text"
                    disabled={!canEditCarePlan}
                    value={vitalsNotes}
                    onChange={(e) => setVitalsNotes(e.target.value)}
                    placeholder="e.g. Notify family if BP > 140/90, Insulin dose 8 units before breakfast..."
                    className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 disabled:bg-slate-100"
                  />
                </div>
              </div>

              {/* Sub-Section B: Active Bedside Routine Tasks Checklist */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Heart className="w-4 h-4 text-emerald-600" />
                    <span>Bedside Routine Care Tasks Checklist ({selectedCareTasks.length} Selected)</span>
                  </div>
                  {canEditCarePlan && (
                    <span className="text-[10px] text-slate-400 font-medium">Click to select/deselect</span>
                  )}
                </div>

                {/* Available & Selected Task Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {allStandardCareTasks.map((task) => {
                    const isSelected = selectedCareTasks.includes(task);
                    return (
                      <button
                        type="button"
                        key={task}
                        disabled={!canEditCarePlan}
                        onClick={() => toggleTask(task)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        } ${!canEditCarePlan ? 'cursor-default opacity-85' : 'cursor-pointer'}`}
                      >
                        <span className="text-xs">{task}</span>
                        {isSelected ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-slate-300 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Task Addition (Customer can add specific needs) */}
                {canEditCarePlan && (
                  <div className="pt-2 border-t border-slate-200/80">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Add Custom Bedside Task (අමතර සාත්තු සේවාවක් ඇතුළත් කරන්න):
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
                        placeholder="e.g. Prepare warm salt water gargle, apply moisturizer to feet..."
                        className="flex-1 text-xs p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomTask}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Task</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CARE WORKER REPLACEMENT REQUEST (ONLY AFTER CHECK-IN ON DUTY) */}
          {activeTab === 'replacement' && (
            <div className="space-y-4">
              {/* Check if replacement request is ALREADY submitted */}
              {booking.caregiverChangeRequest?.requested ? (
                <div className="p-4.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-950 font-bold">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                      <span className="text-sm">Replacement Request Under Operations Review (සමාලෝචනය වෙමින් පවතී)</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-200 text-amber-900 border border-amber-300">
                      {booking.caregiverChangeRequest.status || 'PENDING'}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-amber-200 text-slate-800 space-y-1">
                    <p>
                      <strong>Reason Category:</strong> &ldquo;{booking.caregiverChangeRequest.category || 'General'}&rdquo;
                    </p>
                    <p>
                      <strong>Details:</strong> &ldquo;{booking.caregiverChangeRequest.reason}&rdquo;
                    </p>
                    <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-100">
                      Submitted: {new Date(booking.caregiverChangeRequest.requestedAt).toLocaleString()} • Our Operations Admin is coordinating an alternative qualified caregiver for you.
                    </span>
                  </div>
                </div>
              ) : replacementFeedback ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 font-semibold flex items-center gap-2.5">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{replacementFeedback}</span>
                </div>
              ) : !hasCaregiverAssigned ? (
                /* STATE 1: No Caregiver Assigned yet */
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                    <UserX className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    No Caregiver Assigned Yet (සේවකයෙකු තවම පත් කර නොමැත)
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Your booking is currently under review by our operations coordinator. A replacement cannot be requested before a care worker has been assigned to your booking.
                  </p>
                </div>
              ) : !hasCaregiverCheckedIn ? (
                /* STATE 2: Assigned, BUT Caregiver Has NOT Checked In Yet! */
                <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/90 border-2 border-amber-300/80 space-y-3.5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-amber-950">
                        Care Worker Replacement Locked Until Check-In (සේවකයා Check-in වන තුරු අවහිර කර ඇත)
                      </h4>
                      <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                        Assigned Caregiver: <strong className="text-slate-900 font-extrabold">{booking.assignedCaregiverName}</strong>.
                      </p>
                      <p className="text-xs text-amber-800 mt-1">
                        Per Prime Life Care policy, a care worker replacement request can <strong>only be submitted after the care worker reports and checks in for duty</strong> on-site. The staff member has not checked in for this shift yet.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-600">
                      Need urgent pre-arrival cancellation or change? Contact duty coordinator directly:
                    </span>
                    <a
                      href="tel:+94771234567"
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all shrink-0 self-start sm:self-auto"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Hotline: 077 123 4567</span>
                    </a>
                  </div>
                </div>
              ) : (
                /* STATE 3: Caregiver is Assigned AND Checked In on Duty! Replacement is ELIGIBLE! */
                <div className="p-4.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-950">
                      <UserCheck className="w-4 h-4 text-amber-600" />
                      <span>Care Worker Replacement Request (සේවකයා මාරු කරගැනීම)</span>
                    </div>
                    <span className="text-[11px] font-bold bg-white text-emerald-800 px-2.5 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Active on Duty: {booking.assignedCaregiverName}</span>
                    </span>
                  </div>

                  {!showReplacementForm ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-amber-200">
                      <div>
                        <p className="text-xs font-bold text-amber-950">
                          Need a different care worker due to personal issue, patient comfort, or schedule?
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Since {booking.assignedCaregiverName} has checked in for duty, you are eligible to request an immediate qualified replacement.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowReplacementForm(true)}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Request Care Worker Change</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitReplacementRequest} className="mt-2 space-y-3 p-4 rounded-xl bg-white border border-amber-200">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
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

                      {/* Reason Category Selector */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-800 block mb-1.5">
                          Select Primary Reason Category (ප්‍රධාන හේතුව තෝරන්න) *
                        </label>
                        <div className="space-y-1.5">
                          {replacementCategories.map((cat) => (
                            <label
                              key={cat.id}
                              className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 cursor-pointer transition-colors ${
                                replacementCategory === cat.id
                                  ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <input
                                type="radio"
                                name="replacement_cat"
                                value={cat.id}
                                checked={replacementCategory === cat.id}
                                onChange={(e) => setReplacementCategory(e.target.value)}
                                className="mt-0.5 text-amber-600 focus:ring-amber-500"
                              />
                              <div>
                                <span className="block text-xs">{cat.label}</span>
                                <span className="block text-[10px] text-slate-400 font-normal">{cat.desc}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Detailed Description */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-800 block mb-1">
                          Detailed Explanation for Admin (විස්තරය සඳහන් කරන්න - අනිවාර්යයි) *
                        </label>
                        <textarea
                          required
                          rows={3}
                          minLength={5}
                          value={replacementReason}
                          onChange={(e) => setReplacementReason(e.target.value)}
                          placeholder="කරුණාකර සේවකයා මාරු කිරීමට හේතුව මෙහි type කරන්න (උදා: සේවකයාට පෞද්ගලික හදිසි ගැටලුවක් මතු වීම, රෝගියා ගැහැණු සාත්තු සේවිකාවකට කැමති වීම, භාෂා ගැටලුවක්)..."
                          className="w-full text-xs p-2.5 rounded-xl border border-amber-300 bg-amber-50/20 text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                        />
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Minimum 5 characters. This reason is forwarded immediately to the Operations Lead.
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setShowReplacementForm(false)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingReplacement || !replacementReason.trim()}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
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
          )}

          {/* TAB 4: PATIENT & CONTACT INFORMATION */}
          {activeTab === 'patient_info' && (
            <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <User className="w-4 h-4 text-blue-600" />
                <span>Patient Demographics & Address</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Patient Full Name *
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Patient Age
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={patientAge}
                    onChange={(e) => setPatientAge(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    District
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold"
                  >
                    {districtList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
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
                    className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Full Street Address & Landmarks
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="No 24, Chapel Road, Nugegoda (Near Arpico Supercentre)..."
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold"
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
                  placeholder="e.g. Hypertension, Diabetes, post-stroke mobility assistance..."
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900"
                />
              </div>
            </div>
          )}

          {/* MODAL FOOTER ACTIONS */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Cancel / Delete Booking</span>
            </button>

            <div className="flex items-center gap-2 ml-auto">
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
                    <span>Save Care Plan & Changes</span>
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
