'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { BookingSubmission, PaymentRecord, EquipmentOrder } from '@/types';
import {
  X,
  User,
  Calendar,
  CreditCard,
  ShoppingBag,
  Phone,
  MapPin,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: BookingSubmission[];
  payments: PaymentRecord[];
  orders: EquipmentOrder[];
  onOpenNewBooking: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  bookings,
  payments,
  orders,
  onOpenNewBooking
}) => {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  
  // Simple 3 tabs: Bookings, Equipment Orders, Payments
  const [activeTab, setActiveTab] = useState<'bookings' | 'orders' | 'payments'>('bookings');

  if (!isOpen || !user) return null;

  const t = {
    si: {
      title: 'මගේ ගිණුම',
      tabBookings: 'සාත්තු සේවා (Bookings)',
      tabOrders: 'උපකරණ ඇණවුම් (Orders)',
      tabPayments: 'ගෙවීම් (Payments)',
      newBookingBtn: '+ අලුත් Booking එකක්',
      noBookings: 'ඔබ තවමත් කිසිදු සාත්තු සේවාවක් වෙන්කර ගෙන නොමැත.',
      noOrders: 'ඔබ තවමත් කිසිදු උපකරණයක් ඇණවුම් කර නොමැත.',
      noPayments: 'ගෙවීම් වාර්තා නොමැත.',
      code: 'කේතය:',
      patient: 'රෝගියා:',
      service: 'සේවාව:',
      duration: 'කාලසීමාව:',
      staff: 'සාත්තු සේවකයා:',
      searchingStaff: 'සේවකයෙකු යොමු කරමින් පවතී',
      total: 'මුදල:',
      status: 'තත්ත්වය:',
      deliveryAddress: 'බෙදාහැරීමේ ලිපිනය:',
      paymentMethod: 'ගෙවූ ක්‍රමය:',
      invoice: 'බිල්පත් අංකය:',
      date: 'දිනය:',
      callHelp: 'විමසීම්:',
      signOut: 'ඉවත් වන්න (Sign Out)',
      close: 'වසන්න'
    },
    en: {
      title: 'My Profile',
      tabBookings: 'Care Bookings',
      tabOrders: 'Equipment Orders',
      tabPayments: 'Payment History',
      newBookingBtn: '+ New Booking',
      noBookings: 'You have not placed any caregiver bookings yet.',
      noOrders: 'You have not placed any equipment orders yet.',
      noPayments: 'No payment records found.',
      code: 'Code:',
      patient: 'Patient:',
      service: 'Service:',
      duration: 'Duration:',
      staff: 'Assigned Staff:',
      searchingStaff: 'Caregiver Assignment in Progress',
      total: 'Total:',
      status: 'Status:',
      deliveryAddress: 'Delivery Address:',
      paymentMethod: 'Payment Method:',
      invoice: 'Invoice #:',
      date: 'Date:',
      callHelp: 'Help Hotline:',
      signOut: 'Sign Out',
      close: 'Close'
    },
    ta: {
      title: 'எனது கணக்கு',
      tabBookings: 'முன்பதிவுகள் (Bookings)',
      tabOrders: 'உபகரண ஆர்டர்கள்',
      tabPayments: 'கட்டணங்கள்',
      newBookingBtn: '+ புதிய முன்பதிவு',
      noBookings: 'முன்பதிவுகள் எதுவும் இல்லை.',
      noOrders: 'ஆர்டர்கள் எதுவும் இல்லை.',
      noPayments: 'கட்டண பதிவுகள் இல்லை.',
      code: 'குறியீடு:',
      patient: 'நோயாளி:',
      service: 'சேவை:',
      duration: 'கால அளவு:',
      staff: 'பணியாளர்:',
      searchingStaff: 'பணியாளர் தேர்வு செய்யப்படுகிறார்',
      total: 'மொத்தம்:',
      status: 'நிலை:',
      deliveryAddress: 'முகவரி:',
      paymentMethod: 'முறை:',
      invoice: 'விலைப்பட்டியல்:',
      date: 'தேதி:',
      callHelp: 'உதவி எண்:',
      signOut: 'வெளியேறு',
      close: 'மூடுக'
    }
  }[language];

  const getStatusBadge = (status: BookingSubmission['status']) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            ක්‍රියාත්මකයි (On Duty)
          </span>
        );
      case 'caregiver_assigned':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            සේවකයා පත්කළා (Assigned)
          </span>
        );
      case 'pending_review':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            සලකා බලමින් (Pending)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            අවසන් (Completed)
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Simple & Clean Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-8">
            <div className="flex items-center gap-3.5">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow-sm"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {user.name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-lg sm:text-xl font-bold">{user.name}</h3>
                <p className="text-xs text-slate-300 mt-0.5">{user.email} • {user.phone}</p>
                {user.address && (
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{user.address}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950/80 hover:text-red-300 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.signOut}</span>
            </button>
          </div>

          {/* Simple Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 pt-3 border-t border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'bookings'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t.tabBookings} ({bookings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t.tabOrders} ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'payments'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{t.tabPayments} ({payments.length})</span>
            </button>
          </div>
        </div>

        {/* Modal Body - Simple & Clean */}
        <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto bg-slate-50">
          
          {/* TAB 1: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t.tabBookings}
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onOpenNewBooking();
                  }}
                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {t.newBookingBtn}
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">{t.noBookings}</p>
                </div>
              ) : (
                bookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 hover:border-slate-300 shadow-2xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{b.bookingCode}</span>
                        {b.staffTierName && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {b.staffTierName}
                          </span>
                        )}
                      </div>
                      {getStatusBadge(b.status)}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-700">
                      <div>
                        <span className="text-slate-400 block text-[11px]">{t.service}</span>
                        <span className="font-bold text-slate-900">{b.serviceName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">{t.patient}</span>
                        <span className="font-semibold text-slate-800">{b.patientName} ({b.patientAge} yrs)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">{t.duration}</span>
                        <span className="font-semibold text-slate-800">From {b.startDate} • {b.durationDays} Days</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">{t.staff}</span>
                        <span className="font-bold text-blue-700">
                          {b.assignedCaregiverName || t.searchingStaff}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400">{t.total} </span>
                        <strong className="text-slate-900">LKR {(b.totalCostLKR || b.priceLKR).toLocaleString()}</strong>
                      </div>
                      <a
                        href="tel:+94771234567"
                        className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Hotline: 077 123 4567</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: EQUIPMENT ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t.tabOrders}
                </span>
                <a
                  href="/store"
                  className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                >
                  Store
                </a>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
                  <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">{t.noOrders}</p>
                </div>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="font-bold text-slate-900 text-sm">{ord.orderCode}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        <span>{ord.status.toUpperCase()}</span>
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-700">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{it.quantity}x {it.name}</span>
                          <span className="font-bold text-slate-900">LKR {(it.priceLKR * it.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
                      <span>{t.deliveryAddress} <strong className="text-slate-800">{ord.deliveryAddress}</strong></span>
                      <span className="font-bold text-slate-900 text-sm">
                        {t.total} LKR {ord.totalAmountLKR.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-3.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                {t.tabPayments}
              </span>

              {payments.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
                  <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">{t.noPayments}</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Invoice</th>
                        <th className="py-2.5 px-3">Service</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payments.map((p) => (
                        <tr key={p.id}>
                          <td className="py-3 px-3 font-bold text-slate-900">{p.invoiceNumber}</td>
                          <td className="py-3 px-3 text-slate-600 max-w-[180px] truncate">{p.serviceName}</td>
                          <td className="py-3 px-3 font-bold text-slate-900">LKR {p.amountLKR.toLocaleString()}</td>
                          <td className="py-3 px-3 text-slate-500">{p.paymentDate}</td>
                          <td className="py-3 px-3 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}>
                              {p.status === 'paid' ? 'Paid' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Simple Footer */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
};
