'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { BookingSubmission } from '@/types';
import { findBookingByCodeOrPhone, subscribeToBooking } from '@/lib/firestoreService';
import { Search, CheckCircle, AlertCircle, Phone, Loader2, Radio } from 'lucide-react';

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

                {/* Details Breakdown */}
                <div className="grid sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl text-xs sm:text-sm text-slate-700">
                  <div>
                    <p className="text-slate-400 text-xs">{t.tracker.labelService}</p>
                    <p className="font-bold text-slate-900">{result.serviceName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">{t.tracker.labelPatient}</p>
                    <p className="font-bold text-slate-900">{result.patientName} ({result.patientAge} {t.tracker.yearsOld})</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">{t.tracker.labelLocation}</p>
                    <p className="font-bold text-slate-900">{result.city}, {result.district}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">{t.tracker.labelCaregiver}</p>
                    <p className="font-bold text-emerald-700">
                      {result.assignedCaregiverName || t.tracker.reviewingPool}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
                  <span>{t.tracker.helpQuestion}</span>
                  <a
                    href={`tel:${t.phone}`}
                    className="inline-flex items-center gap-1.5 text-blue-600 font-bold hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {t.tracker.callBtn}
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
