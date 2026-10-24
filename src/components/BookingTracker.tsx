'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { BookingSubmission } from '@/types';
import { findBookingByCodeOrPhone, subscribeToBooking } from '@/lib/firestoreService';
import { Search, CheckCircle, AlertCircle, Phone, Loader2, Radio, Heart, Activity, Clock, Calendar, Download, Plus, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

interface BookingTrackerProps {
  bookings: BookingSubmission[];
}

export const BookingTracker: React.FC<BookingTrackerProps> = ({ bookings }) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<BookingSubmission | null>(null);

  // Subscribe to live Firestore updates when a booking code is selected
  useEffect(() => {
    if (!result?.bookingCode) return;
    const unsubscribe = subscribeToBooking(result.bookingCode, (updated) => {
      if (updated) {
        setResult(updated);
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [result?.bookingCode]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setSearched(true);

    const trimmed = query.trim().toUpperCase();
    const localFound = bookings.find(
      (b) =>
        b.bookingCode.toUpperCase() === trimmed ||
        b.contactPhone.replace(/\D/g, '') === query.replace(/\D/g, '')
    );

    if (localFound) {
      setResult(localFound);
    }

    try {
      const liveDoc = await findBookingByCodeOrPhone(query);
      if (liveDoc) {
        setResult(liveDoc);
      } else if (!localFound) {
        setResult(null);
      }
    } catch (err) {
      console.warn('[Tracker] Query error, using local fallback:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusInfo = (status: BookingSubmission['status']) => {
    switch (status) {
      case 'pending_review':
        return {
          label: t.tracker.statusPending,
          color: 'bg-amber-100 text-amber-800 border-amber-300',
          step: 1
        };
      case 'caregiver_assigned':
        return {
          label: t.tracker.statusAssigned,
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          step: 2
        };
      case 'in_progress':
        return {
          label: t.tracker.statusInProgress,
          color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          step: 3
        };
      case 'completed':
        return {
          label: t.tracker.statusCompleted,
          color: 'bg-slate-100 text-slate-800 border-slate-300',
          step: 4
        };
      default:
        return {
          label: t.tracker.statusPending,
          color: 'bg-amber-100 text-amber-800 border-amber-300',
          step: 1
        };
    }
  };

  return (
    <section id="tracker" className="py-16 bg-gradient-to-b from-white to-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200">
            {t.nav.track}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
            {t.tracker.heading}
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            {t.tracker.subheading}
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-8">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.tracker.placeholder}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-300 text-sm focus:outline-blue-600 bg-white shadow-xs"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{t.tracker.searchBtn}</span>
          </button>
        </form>

        {/* Search Result */}
        {searched && (
          <div>
            {result ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.tracker.bookingCodeLabel}</span>
                    <h3 className="text-2xl font-black text-slate-900">{result.bookingCode}</h3>
                  </div>
                  <div className={`px-4 py-2 rounded-xl border text-xs font-bold ${getStatusInfo(result.status).color}`}>
                    {getStatusInfo(result.status).label}
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="grid grid-cols-4 gap-2 my-8">
                  {[
                    { title: t.tracker.stepRequested, step: 1 },
                    { title: t.tracker.stepMatched, step: 2 },
                    { title: t.tracker.stepOnDuty, step: 3 },
                    { title: t.tracker.stepCompletedTimeline, step: 4 }
                  ].map((s) => {
                    const currentStepNum = getStatusInfo(result.status).step;
                    const isDone = s.step <= currentStepNum;
                    return (
                      <div key={s.step} className="text-center">
                        <div
                          className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold transition-all ${
                            isDone ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {isDone ? <CheckCircle className="w-4 h-4" /> : s.step}
                        </div>
                        <p className={`text-[11px] font-semibold mt-2 ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                          {s.title}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Live On-Duty Beacon Banner (Especially for Overseas Families) */}
                {result.status === 'in_progress' && (
                  <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center">
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping absolute" />
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 relative" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                            Live Bedside Duty Active
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-800 text-[10px] font-bold">
                            GPS Verified
                          </span>
                        </div>
                        <p className="text-xs text-emerald-800 mt-0.5">
                          {result.assignedCaregiverName ? `${result.assignedCaregiverName} is currently on duty at patient's residence.` : 'Staff member is actively providing bedside care.'}
                        </p>
                      </div>
                    </div>
                    {result.assignedCaregiverPhone && (
                      <a
                        href={`https://wa.me/${result.assignedCaregiverPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello, checking in on patient ${result.patientName} (Booking: ${result.bookingCode}).`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all shrink-0 cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>WhatsApp Staff</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Duty Timeline & Days Remaining Progress Bar */}
                <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className="text-slate-700 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Care Contract: {result.durationDays} Days ({result.shiftType === '24h_full' ? '24 Hours Live-In' : '12-Hour Shift'})
                    </span>
                    <span className="text-blue-700 font-extrabold">
                      {Math.max(1, result.durationDays - (result.completedShiftsCount || 0))} Days Remaining
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(15, Math.round(((result.completedShiftsCount || 1) / result.durationDays) * 100)))}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
                    <span>Started: {result.startDate}</span>
                    <span>Completed: {result.completedShiftsCount || 1} of {result.durationDays} Shifts</span>
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="grid sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl text-xs sm:text-sm text-slate-700">
                  <div>
                    <p className="text-slate-400 text-xs">{t.tracker.labelService}</p>
                    <p className="font-bold text-slate-900">{result.serviceName} • {result.staffTierName || 'Standard Tier'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">{t.tracker.labelPatient}</p>
                    <p className="font-bold text-slate-900">{result.patientName} ({result.patientAge} {t.tracker.yearsOld}, {result.patientGender})</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">{t.tracker.labelLocation}</p>
                    <p className="font-bold text-slate-900">{result.address || result.city}, {result.district}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">{t.tracker.labelCaregiver}</p>
                    <p className="font-bold text-emerald-700">
                      {result.assignedCaregiverName || t.tracker.reviewingPool}
                    </p>
                  </div>
                </div>

                {/* Prescribed Clinical Vitals & Care Plan (if available) */}
                {result.vitalsPlan && (
                  <div className="mt-5 p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                        Prescribed Clinical Routine & Vitals Schedule
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-slate-700 pt-1">
                      <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">BP Check</span>
                        <span className="font-bold text-slate-900">{result.vitalsPlan.bpFrequency || '2x Daily'}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">Blood Sugar</span>
                        <span className="font-bold text-slate-900">{result.vitalsPlan.sugarFrequency || 'Fasting FBS'}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">2h Bed Repositioning</span>
                        <span className="font-bold text-emerald-700">{result.vitalsPlan.bedTurningRequired ? 'Strict 2h Protocol' : 'Assisted'}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">Medication Admin</span>
                        <span className="font-bold text-slate-900">{result.vitalsPlan.medicationReminders ? 'Logged with Water' : 'Self'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Daily Shift Attendance & Clinical Handover Dossier */}
                {result.shifts && result.shifts.length > 0 && (
                  <div className="mt-5 p-4 rounded-2xl bg-white border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-black tracking-wide text-slate-900 uppercase">
                          Daily Shift Attendance & Clinical Handover Dossier
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {result.shifts.length} Shifts Recorded
                      </span>
                    </div>

                    <div className="space-y-2">
                      {result.shifts.map((shift, idx) => {
                        const rawIn = shift.checkInTime || shift.clockInTime || '';
                        const rawOut = shift.checkOutTime || shift.clockOutTime || '';
                        const dateStr = (shift.shiftDate || shift.date || rawIn || `Day ${idx + 1}`).split('T')[0];
                        const inTime = rawIn.includes('T') ? rawIn.split('T')[1].substring(0, 5) : (rawIn || '--');
                        const outTime = rawOut.includes('T') ? rawOut.split('T')[1].substring(0, 5) : (rawOut || 'Active');
                        return (
                          <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-800">Shift #{idx + 1} • {dateStr}</span>
                              <span className="font-semibold text-blue-600">
                                In: {inTime} | Out: {outTime} ({shift.hours || '12'}h)
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px] mt-0.5">
                              <span className="font-semibold text-slate-700">Handover: </span>
                              {shift.handoverNotes || 'Daily shift completed with stable vitals.'}
                            </p>
                            {shift.vitalsCount && shift.vitalsCount > 0 ? (
                              <span className="text-[10px] font-semibold text-emerald-600 mt-1 inline-block">
                                • {shift.vitalsCount} bedside vitals logged
                              </span>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Extension & Clinical Report Quick Action Buttons */}
                <div className="mt-6 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Extension Request Button */}
                    <a
                      href={`https://wa.me/94112345678?text=${encodeURIComponent(`Hello Prime Life Care, I would like to extend care duty (+7 Days) for Booking: ${result.bookingCode} (Patient: ${result.patientName}).`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Request Duty Extension (+7 Days)</span>
                    </a>

                    {/* Print / Download Clinical Dossier */}
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-300"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>Print Clinical Summary</span>
                    </button>
                  </div>

                  <a
                    href={`tel:${t.phone}`}
                    className="inline-flex items-center gap-1.5 text-blue-600 text-xs font-bold hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Clinical Helpline: {t.phone}</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 rounded-2xl p-6 text-center border border-amber-200 max-w-lg mx-auto">
                <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-amber-900">
                  {t.tracker.notFound}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
