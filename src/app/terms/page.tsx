'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, CheckCircle2, ShieldAlert, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Header */}
      <header className="bg-slate-900 text-white py-10 px-4 border-b border-slate-800">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Prime Life Care Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Terms & Conditions of Service
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Prime Life Care (Pvt) Ltd &bull; Web Platform, Medical Store & Staff Portal App
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 text-sm leading-relaxed">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 text-xs text-slate-500">
            <span><strong>Last Updated:</strong> October 27, 2026</span>
            <span><strong>Jurisdiction:</strong> Democratic Socialist Republic of Sri Lanka</span>
          </div>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p className="text-slate-600">
              By accessing or using the Prime Life Care website, Medical Equipment Store, or the <strong>Prime Life Care Staff</strong> mobile application, you agree to be bound by these Terms & Conditions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <span>2. Terms for Healthcare Staff Members (Staff App)</span>
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Accurate Credentials:</strong> All nurses, caregivers, and healthcare professionals registering on the Prime Life Care Staff app must provide authentic, valid NIC and qualification documents. Providing falsified medical credentials will result in immediate termination.
              </li>
              <li>
                <strong>Duty & Clinical Integrity:</strong> Staff members must accurately log shift attendance, patient vital signs, and bed-turning schedules in real time during active shifts.
              </li>
              <li>
                <strong>Patient Confidentiality:</strong> Staff members are strictly prohibited from sharing patient photos, residential addresses, or medical conditions outside the official Prime Life Care clinical reporting system.
              </li>
              <li>
                <strong>Payouts & Allowances:</strong> Earnings displayed in the app reflect verified shifts and are disbursed to the staff member&apos;s designated bank account upon administrative verification.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">3. Patient Care Bookings & Medical Equipment Store</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Home nursing and caregiver bookings are confirmed upon review by our clinical dispatch team.</li>
              <li>Medical equipment orders (Cash on Delivery or Bank Transfer) are subject to stock availability and verification of bank transfer slips where applicable.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <span>4. Emergency Disclaimer</span>
            </h2>
            <p className="text-slate-600">
              In the event of an acute, life-threatening medical emergency, clients and caregivers must immediately contact the <strong>1990 Suwa Seriya Ambulance Service</strong> or visit the nearest hospital Emergency Treatment Unit (ETU).
            </p>
          </section>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link href="/privacy-policy" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>View Privacy Policy</span>
            </Link>
            <Link href="/" className="text-slate-500 hover:text-slate-800">
              Return to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
