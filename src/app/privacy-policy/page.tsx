'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, UserCheck, Trash2, Mail, Phone, ArrowLeft, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Privacy Policy & Data Protection
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Prime Life Care (Pvt) Ltd &bull; Prime Life Care Staff App (com.primelifecare.staff.prime_life_care_staff)
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 text-sm leading-relaxed">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 text-xs text-slate-500">
            <span><strong>Effective Date:</strong> October 27, 2026</span>
            <span><strong>Entity:</strong> Prime Life Care (Pvt) Ltd, Sri Lanka</span>
          </div>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">1. Introduction</h2>
            <p className="text-slate-600">
              Prime Life Care (Pvt) Ltd (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) operates the Prime Life Care platform and the <strong>Prime Life Care Staff</strong> mobile application (Package ID: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">com.primelifecare.staff.prime_life_care_staff</code>). We are committed to protecting the privacy, confidentiality, and security of personal data belonging to our patients, families, and healthcare staff members (nurses, caregivers, and physiotherapists).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <span>2. Information We Collect</span>
            </h2>
            <p className="text-slate-600">We collect only the information necessary to deliver safe, verified healthcare services and manage staff operations:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Staff Profile & Verification Data:</strong> Full name, phone number, residential address, National Identity Card (NIC) details, professional nursing/caregiver qualifications, certificate images, and profile photographs uploaded for identity and credential verification.
              </li>
              <li>
                <strong>Shift, Attendance & Clinical Logs:</strong> Assigned duty schedules, shift clock-in/clock-out timestamps, patient vitals logs (blood pressure, temperature, pulse, blood sugar), bed-turning schedules, and daily care notes recorded during active duties.
              </li>
              <li>
                <strong>Financial & Payout Information:</strong> Bank name, branch, account holder name, and bank account number provided by staff members strictly for salary and duty allowance disbursements.
              </li>
              <li>
                <strong>Device Permissions (Camera & Photos):</strong> Used only when a staff member actively captures or selects a profile photo, face verification photo for shift attendance, or qualification certificate image. We do not access the camera or gallery in the background.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              <span>3. How We Use & Protect Your Data</span>
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>To verify caregiver and nursing credentials before dispatching staff to patient homes or hospitals.</li>
              <li>To coordinate real-time shift assignments, patient care plans, and clinical monitoring.</li>
              <li>To calculate completed duty hours and process direct bank salary transfers for staff members.</li>
              <li>All data transmitted between the mobile application and our cloud database (Google Firebase / Cloud Firestore) is encrypted in transit using industry-standard HTTPS/TLS encryption.</li>
              <li><strong>No Third-Party Selling:</strong> We never sell, rent, or trade personal, clinical, or financial data to third-party advertisers or data brokers.</li>
            </ul>
          </section>

          {/* Dedicated Account & Data Deletion Section required by Google Play */}
          <section id="delete-account" className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
            <h2 className="text-lg font-bold text-rose-900 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-600" />
              <span>4. Account & Data Deletion Policy (Google Play Data Safety)</span>
            </h2>
            <p className="text-slate-700">
              Users and staff members have the right to request complete deletion of their Prime Life Care account and associated personal data at any time.
            </p>
            <div className="space-y-1.5 text-slate-700 text-xs sm:text-sm">
              <p><strong>How to request account deletion:</strong></p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Send an email to <strong>care@primelifecare.lk</strong> with the subject line <code className="bg-white px-1.5 py-0.5 rounded border border-rose-200">&ldquo;Account Deletion Request&rdquo;</code> along with your registered Phone Number or Staff ID, OR</li>
                <li>Contact our Operations Admin Desk via WhatsApp/Phone at <strong>+94 77 123 4567</strong>.</li>
              </ol>
              <p className="pt-1">
                <strong>What gets deleted:</strong> Upon verification, your login credentials, profile photos, uploaded certificates, and personal contact details will be permanently removed from our active database within <strong>7 business days</strong>. Mandatory financial payout records may be retained strictly as required by Sri Lankan tax and healthcare auditing regulations.
              </p>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">5. Contact Us</h2>
            <p className="text-slate-600">
              If you have any questions about this Privacy Policy, data protection practices, or your personal information, please contact us:
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs sm:text-sm">
              <p className="font-bold text-slate-900">Prime Life Care (Pvt) Ltd</p>
              <p className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Email: care@primelifecare.lk</span>
              </p>
              <p className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>Hotline: +94 77 123 4567</span>
              </p>
            </div>
          </section>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link href="/terms" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>View Terms & Conditions</span>
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
