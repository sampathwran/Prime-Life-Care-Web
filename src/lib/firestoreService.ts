import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { BookingSubmission, EquipmentOrder } from '@/types';

// ======================== BOOKINGS ========================

/**
 * Save new booking to Firestore 'bookings' collection
 */
export async function saveBookingToFirestore(booking: BookingSubmission): Promise<void> {
  try {
    const docRef = doc(db, 'bookings', booking.bookingCode);
    await setDoc(docRef, {
      ...booking,
      updatedAt: new Date().toISOString()
    });
    console.log('[Firestore] Booking saved successfully:', booking.bookingCode);
  } catch (error) {
    console.error('[Firestore] Error saving booking:', error);
    throw error;
  }
}

/**
 * Find booking by booking code (case-insensitive search) or contact phone
 */
export async function findBookingByCodeOrPhone(queryInput: string): Promise<BookingSubmission | null> {
  try {
    const trimmed = queryInput.trim().toUpperCase();
    
    // 1. Direct doc lookup by bookingCode
    const directDoc = await getDoc(doc(db, 'bookings', trimmed));
    if (directDoc.exists()) {
      return directDoc.data() as BookingSubmission;
    }

    // 2. Query by bookingCode field
    const qCode = query(collection(db, 'bookings'), where('bookingCode', '==', trimmed));
    const snapCode = await getDocs(qCode);
    if (!snapCode.empty) {
      return snapCode.docs[0].data() as BookingSubmission;
    }

    // 3. Query by contactPhone (cleaned digits)
    const cleanPhone = queryInput.replace(/\D/g, '');
    if (cleanPhone.length >= 7) {
      const qPhone = query(collection(db, 'bookings'));
      const snapAll = await getDocs(qPhone);
      for (const d of snapAll.docs) {
        const data = d.data() as BookingSubmission;
        if (data.contactPhone && data.contactPhone.replace(/\D/g, '').includes(cleanPhone)) {
          return data;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('[Firestore] Error finding booking:', error);
    return null;
  }
}

/**
 * Real-time listener for single booking by bookingCode
 */
export function subscribeToBooking(
  bookingCode: string,
  onUpdate: (booking: BookingSubmission | null) => void
): () => void {
  const docRef = doc(db, 'bookings', bookingCode.trim().toUpperCase());
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as BookingSubmission);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.warn('[Firestore] Booking subscription error:', err);
    }
  );
}

/**
 * Fetch all bookings for a user
 */
export async function fetchUserBookingsFromFirestore(userId: string): Promise<BookingSubmission[]> {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as BookingSubmission);
  } catch (error) {
    console.error('[Firestore] Error fetching user bookings:', error);
    return [];
  }
}

// ======================== EQUIPMENT ORDERS ========================

/**
 * Save new medical equipment / supplies order to Firestore 'orders' collection
 */
export async function saveOrderToFirestore(order: EquipmentOrder): Promise<void> {
  try {
    const docRef = doc(db, 'orders', order.orderCode);
    await setDoc(docRef, {
      ...order,
      customerName: order.contactName,
      customerPhone: order.contactPhone,
      orderStatus: order.status === 'order_received' ? 'pending' : order.status,
      updatedAt: new Date().toISOString()
    });
    console.log('[Firestore] Order saved successfully:', order.orderCode);
  } catch (error) {
    console.error('[Firestore] Error saving order:', error);
    throw error;
  }
}

/**
 * Fetch all orders for a user
 */
export async function fetchUserOrdersFromFirestore(userId: string): Promise<EquipmentOrder[]> {
  try {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as EquipmentOrder);
  } catch (error) {
    console.error('[Firestore] Error fetching user orders:', error);
    return [];
  }
}
