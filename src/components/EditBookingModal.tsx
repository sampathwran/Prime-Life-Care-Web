'use client';

import React, { useState, useEffect } from 'react';
import { BookingSubmission, MobilityLevel, VitalsCarePlan } from '@/types';
import { updateBookingInFirestore, deleteOrCancelBookingFromFirestore } from '@/lib/firestoreService';
import { districtList } from '@/data/services';
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
  Plus
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
  // Form fields
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

  // Vitals & Care Plan
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

  const handleResetToPackageDefaults = () => {
    if (booking) {
      const plan = getDefaultCarePlanForService(booking.serviceId || booking.serviceName);
      setBpFrequency(plan.bpFrequency);
      setSugarFrequency(plan.sugarFrequency);
      setBedTurningRequired(plan.bedTurningRequired);
      setMedicationReminders(plan.medicationReminders);
      setSelectedCareTasks(plan.carePlanTasks);
    }
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

  // Prefill state when booking opens
  useEffect(() => {
    if (booking) {
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
      setSelectedCareTasks(booking.carePlanTasks || [
        'BP & Pulse Monitoring',
        'Blood Glucose (Sugar) Test',
        '2-Hour Bed Repositioning (Bedsore Care)'
      ]);
      setShowDeleteConfirm(false);
      setFeedbackMsg(null);
    }
  }, [booking, isOpen]);

  if (!isOpen || !booking) return null;

  const toggleTask = (task: string) => {
    setSelectedCareTasks((prev) =>
      prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task]
    );
  };

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
      setFeedbackMsg({ type: 'success', text: 'Booking details updated successfully!' });
      setTimeout(() => {
        onClose();
      }, 900);
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
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 to-indigo-50/70">
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
                Update patient medical details, bedside vitals schedule, or care address.
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
                  Are you sure you want to cancel and delete Booking {booking.bookingCode}?
                </h4>
                <p className="text-xs text-rose-700 mt-1">
                  Patient: <span className="font-semibold">{booking.patientName}</span> ({booking.serviceName}).
                  This booking will be cancelled and removed from active care duties. (Admin retains a 7-day archive record).
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
                    <option value="Booked by mistake or duplicate entry">
                      Booked by mistake or duplicate entry
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
        <form onSubmit={handleSaveChanges} className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          {/* Section 1: Patient Details */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <User className="w-4 h-4 text-blue-600" />
              <span>Patient Medical Information</span>
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
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="1"
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
                  <option value="independent">Fully Mobile / Independent</option>
                  <option value="partial">Partial Assistance Required</option>
                  <option value="wheelchair">Wheelchair Bound</option>
                  <option value="bedridden">Bedridden (High Care Need)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Medical Conditions & Clinical Notes
              </label>
              <textarea
                rows={2}
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
                placeholder="e.g. Hypertension, Type 2 Diabetes, post-stroke rehab, needs walker support..."
                className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 2: Care Address & Guardian Contact */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Location & Family Contact</span>
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

          {/* Section 3: Vitals Care Plan & Bedside Routine */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Heart className="w-4 h-4 text-blue-600" />
                <span>Vitals Monitoring & Bedside Tasks</span>
              </div>
              <button
                type="button"
                onClick={handleResetToPackageDefaults}
                className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Reset to {booking.serviceName} Defaults
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
                  <option value="none">Not Required</option>
                  <option value="1x_daily">Once Daily (Morning)</option>
                  <option value="twice_daily">Twice Daily (Morning & Evening)</option>
                  <option value="thrice_daily">Thrice Daily (TDS)</option>
                  <option value="every_4_hours">Every 4 Hours (Critical)</option>
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
                  Medication Administration Reminders
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
                + Add Custom Bedside Task:
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
                  placeholder="e.g. Nebulizer twice daily, Walker support, Special low-salt meal..."
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

          {/* Modal Actions */}
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
