'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { HomeStoreShowcase } from '@/components/HomeStoreShowcase';
import { TrustSection } from '@/components/TrustSection';
import { ServicesSection } from '@/components/ServicesSection';
import { GallerySection } from '@/components/GallerySection';
import { ReviewsSection } from '@/components/ReviewsSection';
import { BookingModal } from '@/components/BookingModal';
import { BookingTracker } from '@/components/BookingTracker';
import { CartDrawer } from '@/components/CartDrawer';
import { AuthModal } from '@/components/AuthModal';
import { GoogleOneTapPrompt } from '@/components/GoogleOneTapPrompt';
import { Footer } from '@/components/Footer';
import { initialServices } from '@/data/services';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ServiceItem, BookingSubmission, PaymentRecord, EquipmentOrder, StaffTierId } from '@/types';
import {
  fetchUserBookingsFromFirestore,
  fetchUserOrdersFromFirestore,
  subscribeToUserBookings,
  subscribeToUserOrders,
  trackSiteVisit,
  subscribeToLiveServices
} from '@/lib/firestoreService';
import { Phone, MessageCircle, ShoppingBag, ArrowRight, Truck } from 'lucide-react';

export default function Home() {
  const { user, openAuthModal } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  // Dynamic Services state (Synced Live from Firestore with fallback to initialServices)
  const [services, setServices] = useState<ServiceItem[]>(initialServices);

  // Subscribe to Real-Time Care Services & Packages published by Admin
  useEffect(() => {
    const unsub = subscribeToLiveServices((live) => {
      if (live && live.length > 0) {
        setServices(live);
      }
    });
    return () => unsub();
  }, []);
  
  // Bookings state (Loaded Live from Firestore)
  const [bookings, setBookings] = useState<BookingSubmission[]>([]);

  // Equipment Orders State (Loaded Live from Firestore)
  const [orders, setOrders] = useState<EquipmentOrder[]>([]);

  // Payment History State
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  // Track website visit in Firestore analytics
  useEffect(() => {
    trackSiteVisit();
  }, []);

  // Sync with Firestore Cloud when logged in (Real-time)
  useEffect(() => {
    if (!user) {
      setBookings([]);
      setOrders([]);
      setPayments([]);
      return;
    }
    
    // Subscribe to user's real bookings
    const unsubBookings = subscribeToUserBookings(user.id, (cloudBookings) => {
      setBookings(cloudBookings);

      const generatedPayments: PaymentRecord[] = cloudBookings.map((b) => ({
        id: `pay_${b.bookingCode}`,
        invoiceNumber: `INV-${b.bookingCode}`,
        bookingCode: b.bookingCode,
        serviceName: `${b.serviceName} (${b.staffTierName || 'Care'} - ${b.durationDays} Days)`,
        amountLKR: b.totalCostLKR || b.priceLKR,
        paymentDate: b.startDate || b.createdAt.split('T')[0],
        paymentMethod: 'cash_on_duty',
        status: b.paymentStatus === 'fully_paid' ? 'paid' : b.paymentStatus === 'advance_paid' ? 'paid' : 'due'
      }));
      setPayments(generatedPayments);
    });

    // Subscribe to user's real equipment orders
    const unsubOrders = subscribeToUserOrders(user.id, (cloudOrders) => {
      setOrders(cloudOrders);
    });

    return () => {
      unsubBookings();
      unsubOrders();
    };
  }, [user]);

  // Modals state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<ServiceItem | null>(null);
  const [selectedTierForBooking, setSelectedTierForBooking] = useState<StaffTierId>('nvq_4_caregiver');

  const handleOpenBooking = (service?: ServiceItem, tierId?: StaffTierId) => {
    const params = new URLSearchParams();
    if (service) params.set('service', service.id);
    if (tierId) params.set('tier', tierId);
    const queryString = params.toString();
    router.push(queryString ? `/booking?${queryString}` : '/booking');
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
        onOpenProfile={() => router.push('/profile')}
        onOpenAuth={() => openAuthModal()}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Banner with authentic photo */}
        <Hero
          onOpenBooking={() => handleOpenBooking()}
          onExploreServices={() => scrollToSection('services')}
        />

        {/* Sliding Medical Store Products Showcase (Placed directly below Hero as requested) */}
        <HomeStoreShowcase />

        {/* Why Choose Us with nursing vitals photo */}
        <TrustSection />

        {/* Care Services & Interactive Staff Qualification Pricing */}
        <ServicesSection
          services={services}
          onSelectServiceToBook={(svc, tierId) => handleOpenBooking(svc, tierId)}
        />

        {/* Real-time Care Moments & Photo Gallery (Managed from Admin Panel) */}
        <GallerySection />

        {/* Verified Google Reviews Section */}
        <ReviewsSection />

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
        onOpenProfile={() => router.push('/profile')}
      />

      {/* Email Login & Registration Modal */}
      <AuthModal />

      {/* Google 1-Tap Auto-Suggest Floating Banner */}
      <GoogleOneTapPrompt />

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
      {/* Slide-over Cart & Express Checkout Drawer */}
      <CartDrawer />
    </div>
  );
}
