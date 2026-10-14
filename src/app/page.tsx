'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { TrustSection } from '@/components/TrustSection';
import { ServicesSection } from '@/components/ServicesSection';
import { ReviewsSection } from '@/components/ReviewsSection';
import { BookingModal } from '@/components/BookingModal';
import { BookingTracker } from '@/components/BookingTracker';
import { ProfileModal } from '@/components/ProfileModal';
import { AuthModal } from '@/components/AuthModal';
import { Footer } from '@/components/Footer';
import { initialServices } from '@/data/services';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ServiceItem, BookingSubmission, PaymentRecord, EquipmentOrder, StaffTierId } from '@/types';
import { Phone, MessageCircle, ShoppingBag, ArrowRight, Truck } from 'lucide-react';

export default function Home() {
  const { user, openAuthModal } = useAuth();
  const { t } = useLanguage();

  // Dynamic Services state
  const [services] = useState<ServiceItem[]>(initialServices);
  
  // Bookings state (linked to profile)
  const [bookings, setBookings] = useState<BookingSubmission[]>([
    {
      id: 'demo_1',
      userId: 'usr_rohan_01',
      bookingCode: 'PLC-2026-1024',
      serviceId: 'day_care_12h',
      serviceName: '12-Hour Day Shift Care (NVQ 4)',
      staffTierId: 'nvq_4_caregiver',
      staffTierName: 'NVQ Level 4 Certified Aide',
      shiftType: '12h_day',
      priceLKR: 4500,
      patientName: 'Mrs. Jayasinghe (Mother)',
      patientAge: 78,
      patientGender: 'female',
      mobilityLevel: 'partial_assistance',
      medicalConditions: 'Hypertension, Mild Arthritis',
      district: 'Colombo (කොළඹ)',
      city: 'Nugegoda',
      address: 'No 24, Chapel Road, Nugegoda',
      contactName: 'Mr. Rohan Jayasinghe',
      contactPhone: '077 123 4567',
      contactEmail: 'rohan.j@gmail.com',
      startDate: '2026-10-12',
      durationDays: 14,
      totalCostLKR: 63000,
      status: 'caregiver_assigned',
      paymentStatus: 'fully_paid',
      assignedCaregiverName: 'Sister K. Chamila (Certified NVQ 4 Aide)',
      createdAt: '2026-10-10T08:30:00Z'
    },
    {
      id: 'demo_2',
      userId: 'usr_rohan_01',
      bookingCode: 'PLC-2026-2048',
      serviceId: 'live_in_24h',
      serviceName: '24-Hour Live-in Care (NVQ 5)',
      staffTierId: 'nvq_5_nurse',
      staffTierName: 'NVQ Level 5 Senior Nurse',
      shiftType: '24h_full',
      priceLKR: 7000,
      patientName: 'Mr. Dharmadasa (Father-in-law)',
      patientAge: 82,
      patientGender: 'male',
      mobilityLevel: 'bedridden',
      medicalConditions: 'Post-Stroke Recovery, Catheter care',
      district: 'Gampaha (ගම්පහ)',
      city: 'Kelaniya',
      address: 'No 18/A, Station Road, Kelaniya',
      contactName: 'Mr. Rohan Jayasinghe',
      contactPhone: '077 123 4567',
      contactEmail: 'rohan.j@gmail.com',
      startDate: '2026-10-11',
      durationDays: 30,
      totalCostLKR: 210000,
      status: 'in_progress',
      paymentStatus: 'advance_paid',
      assignedCaregiverName: 'Mr. Sunimal Perera (Senior NVQ 5 Nurse)',
      createdAt: '2026-10-09T14:15:00Z'
    }
  ]);

  // Equipment Orders State
  const [orders] = useState<EquipmentOrder[]>([
    {
      id: 'ord_demo_1',
      orderCode: 'ORD-2026-1049',
      userId: 'usr_rohan_01',
      items: [
        {
          itemId: 'air_mattress_pump',
          name: 'Anti-Bedsore Ripple Air Mattress with Pump',
          quantity: 1,
          priceLKR: 14500
        }
      ],
      totalAmountLKR: 14500,
      paymentMethod: 'cod',
      deliveryAddress: 'No 24, Chapel Road, Nugegoda',
      district: 'Colombo (කොළඹ)',
      contactName: 'Rohan Jayasinghe',
      contactPhone: '077 123 4567',
      status: 'dispatched',
      createdAt: '2026-10-10T09:15:00Z'
    }
  ]);

  // Payment History State
  const [payments, setPayments] = useState<PaymentRecord[]>([
    {
      id: 'pay_01',
      invoiceNumber: 'INV-2026-1024',
      bookingCode: 'PLC-2026-1024',
      serviceName: '12-Hour Day Shift Care (NVQ 4 Tier - 14 Days)',
      amountLKR: 63000,
      paymentDate: '2026-10-10',
      paymentMethod: 'bank_transfer',
      status: 'paid'
    },
    {
      id: 'pay_02',
      invoiceNumber: 'INV-2026-2048',
      bookingCode: 'PLC-2026-2048',
      serviceName: '24-Hour Live-in Care (NVQ 5 Tier - Advance)',
      amountLKR: 105000,
      paymentDate: '2026-10-09',
      paymentMethod: 'credit_card',
      status: 'paid'
    },
    {
      id: 'pay_03',
      invoiceNumber: 'INV-2026-1049',
      bookingCode: 'ORD-2026-1049',
      serviceName: 'Medical Equipment: Anti-Bedsore Ripple Air Mattress',
      amountLKR: 14500,
      paymentDate: '2026-10-10',
      paymentMethod: 'cod',
      status: 'paid'
    }
  ]);

  // Modals state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<ServiceItem | null>(null);
  const [selectedTierForBooking, setSelectedTierForBooking] = useState<StaffTierId>('nvq_4_caregiver');

  const handleOpenBooking = (service?: ServiceItem, tierId?: StaffTierId) => {
    if (!user) {
      openAuthModal(() => {
        setSelectedServiceForBooking(service || null);
        if (tierId) setSelectedTierForBooking(tierId);
        setIsBookingOpen(true);
      });
      return;
    }
    setSelectedServiceForBooking(service || null);
    if (tierId) setSelectedTierForBooking(tierId);
    setIsBookingOpen(true);
  };

  const handleBookingSubmitted = (newBooking: BookingSubmission) => {
    setBookings((prev) => [newBooking, ...prev]);

    // Create a pending invoice in Payment History automatically
    const newInvoice: PaymentRecord = {
      id: `pay_${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingCode: newBooking.bookingCode,
      serviceName: `${newBooking.serviceName} (${newBooking.staffTierName || 'Care'} - ${newBooking.durationDays} Days)`,
      amountLKR: newBooking.totalCostLKR || newBooking.priceLKR,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash_on_duty',
      status: 'pending_verification'
    };
    setPayments((prev) => [newInvoice, ...prev]);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        onNavigateToServices={() => scrollToSection('services')}
        onNavigateToStore={() => { window.location.href = '/store'; }}
        onNavigateToTrust={() => scrollToSection('trust')}
        onNavigateToTracker={() => scrollToSection('tracker')}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAuth={() => openAuthModal()}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Banner with authentic photo */}
        <Hero
          onOpenBooking={() => handleOpenBooking()}
          onExploreServices={() => scrollToSection('services')}
        />

        {/* Why Choose Us with nursing vitals photo */}
        <TrustSection />

        {/* Care Services & Interactive Staff Qualification Pricing */}
        <ServicesSection
          services={services}
          onSelectServiceToBook={(svc, tierId) => handleOpenBooking(svc, tierId)}
        />

        {/* Verified Google Reviews Section */}
        <ReviewsSection />

        {/* Dedicated Medical Equipment Store Showcase Banner linking to /store - 100% Pure Localized */}
        <section className="py-12 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden relative border border-slate-800">
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-400/30">
                    {t.storeBanner.tag}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {t.storeBanner.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                    {t.storeBanner.description}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-3 py-1 rounded-lg bg-white/10 text-slate-200 text-xs font-semibold backdrop-blur-xs border border-white/10">
                      {t.storeBanner.badgeBeds}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-white/10 text-slate-200 text-xs font-semibold backdrop-blur-xs border border-white/10">
                      {t.storeBanner.badgeMattress}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-white/10 text-slate-200 text-xs font-semibold backdrop-blur-xs border border-white/10">
                      {t.storeBanner.badgeWheelchairs}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-white/10 text-slate-200 text-xs font-semibold backdrop-blur-xs border border-white/10">
                      {t.storeBanner.badgeDiapers}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-3">
                    <Link
                      href="/store"
                      className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <ShoppingBag className="w-4 h-4 text-white" />
                      <span>{t.storeBanner.visitBtn}</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </Link>

                    <div className="text-xs text-slate-300 flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700">
                      <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>{t.storeBanner.deliveryBadge}</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-white/10 aspect-4/3 relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/medical_store.jpg"
                      alt="Medical Supplies Showroom"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-bold bg-slate-950/80 backdrop-blur-xs p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                      <span>{t.storeBanner.catalogBadge}</span>
                      <span className="text-blue-400 font-bold">{t.storeBanner.perksBadge}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Booking Tracker */}
        <BookingTracker bookings={bookings} />
      </main>

      {/* Footer */}
      <Footer
        onNavigateToServices={() => scrollToSection('services')}
        onNavigateToTrust={() => scrollToSection('trust')}
        onNavigateToTracker={() => scrollToSection('tracker')}
      />

      {/* Booking Form Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedService={selectedServiceForBooking}
        selectedTierId={selectedTierForBooking}
        allServices={services}
        onBookingSubmitted={handleBookingSubmitted}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Customer Profile & Booking/Payment/Equipment Orders Dashboard */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        bookings={bookings}
        payments={payments}
        orders={orders}
        onOpenNewBooking={() => handleOpenBooking()}
      />

      {/* Email Login & Registration Modal */}
      <AuthModal />

      {/* Floating Instant WhatsApp / Hotline Helper Buttons */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-2.5">
        <a
          href="https://wa.me/94771234567?text=Hello%20Prime%20Life%20Care,%20I%20would%20like%20to%20inquire%20about%20caregiver%20services%20and%20patient%20equipment."
          target="_blank"
          rel="noopener noreferrer"
          title="Chat on WhatsApp"
          className="w-13 h-13 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          <MessageCircle className="w-7 h-7 fill-white text-emerald-500" />
        </a>

        <a
          href="tel:+94771234567"
          title="Call 24/7 Hotline"
          className="w-13 h-13 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          <Phone className="w-6 h-6" />
        </a>
      </div>
    </div>
  );
}
