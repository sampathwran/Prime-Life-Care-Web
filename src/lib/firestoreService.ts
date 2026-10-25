import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { BookingSubmission, EquipmentOrder, ServiceItem, ServiceTierOption, GoogleReviewItem, GalleryItem, MedicalItem, StoreCategory } from '@/types';
import { initialMedicalItems } from '@/data/medicalItems';

// ======================== BOOKINGS ========================

/**
 * Save new booking to Firestore 'bookings' collection
 */
export async function saveBookingToFirestore(booking: BookingSubmission): Promise<void> {
  try {
    const docRef = doc(db, 'bookings', booking.bookingCode);
    await setDoc(docRef, {
      ...booking,
      mobility: booking.mobilityLevel || 'partial',
      mobilityLevel: booking.mobilityLevel || 'partial',
      shiftHours: booking.shiftType === '24h_full' ? 24 : 12,
      pricePerDayLKR: booking.priceLKR,
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
 * Update an existing booking in Firestore
 */
export async function updateBookingInFirestore(
  bookingCode: string,
  updates: Partial<BookingSubmission>
): Promise<void> {
  try {
    const code = bookingCode.trim().toUpperCase();
    const docRef = doc(db, 'bookings', code);
    await setDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log('[Firestore] Booking updated successfully:', code);
  } catch (error) {
    console.error('[Firestore] Error updating booking:', error);
    throw error;
  }
}

/**
 * Delete or cancel a booking from Firestore, archiving to deleted_bookings for 7-day retention
 */
export async function deleteOrCancelBookingFromFirestore(
  bookingCode: string,
  bookingData?: Partial<BookingSubmission>,
  reason: string = 'Cancelled by customer'
): Promise<void> {
  try {
    const code = bookingCode.trim().toUpperCase();
    const docRef = doc(db, 'bookings', code);

    // Fetch latest data if not provided
    let fullData = bookingData;
    if (!fullData || !fullData.bookingCode) {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        fullData = snap.data() as BookingSubmission;
      }
    }

    // 1. Archive to deleted_bookings collection (7-day retention matching Flutter Admin)
    const archiveRef = doc(db, 'deleted_bookings', code);
    await setDoc(archiveRef, {
      ...(fullData || {}),
      id: code,
      bookingCode: code,
      originalDocId: code,
      deletedAt: new Date().toISOString(),
      deletedBy: 'Customer (Web Portal)',
      cancellationReason: reason,
      status: 'cancelled',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }, { merge: true });

    // 2. Delete from active bookings
    await deleteDoc(docRef);
    console.log('[Firestore] Booking archived and deleted successfully:', code);
  } catch (error) {
    console.error('[Firestore] Error deleting booking:', error);
    throw error;
  }
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
    const list = snap.docs.map(d => d.data() as BookingSubmission);
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (error) {
    console.error('[Firestore] Error fetching user bookings:', error);
    return [];
  }
}

/**
 * Real-time listener for all bookings belonging to a user
 */
export function subscribeToUserBookings(
  userId: string,
  onUpdate: (bookings: BookingSubmission[]) => void
): () => void {
  const q = query(
    collection(db, 'bookings'),
    where('userId', '==', userId)
  );
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => d.data() as BookingSubmission);
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(list);
    },
    (err) => {
      console.warn('[Firestore] Realtime user bookings sync error:', err);
    }
  );
}

// ======================== EQUIPMENT ORDERS ========================

/**
 * Save new medical equipment / supplies order to Firestore 'orders' collection
 */
export async function saveOrderToFirestore(order: EquipmentOrder): Promise<void> {
  try {
    const docRef = doc(db, 'orders', order.orderCode);
    const orderData = {
      id: order.id || order.orderCode,
      orderCode: order.orderCode,
      userId: order.userId || 'guest',
      customerName: order.contactName,
      customerPhone: order.contactPhone,
      deliveryAddress: order.deliveryAddress,
      district: order.district,
      items: order.items.map((it) => ({
        itemId: it.itemId,
        itemName: it.name,
        name: it.name,
        quantity: it.quantity,
        priceLKR: it.priceLKR,
        regularPriceLKR: it.regularPriceLKR || it.priceLKR,
        imageUrl: it.imageUrl || '',
        type: 'purchase'
      })),
      totalAmountLKR: order.totalAmountLKR,
      paymentMethod: order.paymentMethod, // 'cod' or 'bank_transfer'
      paymentStatus: order.paymentMethod === 'cod' ? 'cod_pending' : 'pending_verification',
      bankSlipUrl: order.bankSlipUrl || '',
      bankReference: order.bankReference || '',
      orderStatus: 'pending',
      isRental: false,
      createdAt: order.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(docRef, orderData, { merge: true });
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
    const list = snap.docs.map(d => d.data() as EquipmentOrder);
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (error) {
    console.error('[Firestore] Error fetching user orders:', error);
    return [];
  }
}

/**
 * Real-time listener for all orders belonging to a user
 */
export function subscribeToUserOrders(
  userId: string,
  onUpdate: (orders: EquipmentOrder[]) => void
): () => void {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId)
  );
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => d.data() as EquipmentOrder);
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(list);
    },
    (err) => {
      console.warn('[Firestore] Realtime user orders sync error:', err);
    }
  );
}

// ======================== WEBSITE VISITOR TRACKING ========================

/**
 * Track unique website visitor sessions in Firestore (Real-time live traffic)
 */
export async function trackSiteVisit(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const isTracked = sessionStorage.getItem('plc_session_tracked');
    if (!isTracked) {
      sessionStorage.setItem('plc_session_tracked', 'true');
      const statsRef = doc(db, 'site_stats', 'traffic');
      const todayStr = new Date().toISOString().split('T')[0];

      const snap = await getDoc(statsRef);
      if (snap.exists()) {
        const data = snap.data();
        const lastDate = data.lastDate || todayStr;
        const isNewDay = lastDate !== todayStr;

        // Reset if it had legacy dummy counts (>= 14820)
        let currentTotal = typeof data.totalVisitors === 'number' ? data.totalVisitors : 0;
        if (currentTotal >= 14820) currentTotal = 0;

        let currentToday = typeof data.todayVisitors === 'number' ? data.todayVisitors : 0;
        if (isNewDay || currentToday >= 340) currentToday = 0;

        await setDoc(statsRef, {
          totalVisitors: currentTotal + 1,
          todayVisitors: currentToday + 1,
          lastDate: todayStr,
          lastVisitAt: new Date().toISOString()
        }, { merge: true });
      } else {
        await setDoc(statsRef, {
          totalVisitors: 1,
          todayVisitors: 1,
          lastDate: todayStr,
          lastVisitAt: new Date().toISOString()
        }, { merge: true });
      }
    }
  } catch (e) {
    console.warn('[Analytics] Visitor tracking warning:', e);
  }
}

// ======================== CARE SERVICES & PACKAGES ========================

/**
 * Real-time listener for published care packages & services from Firestore
 */
export function subscribeToLiveServices(
  onUpdate: (services: ServiceItem[]) => void
): () => void {
  const q = query(collection(db, 'services'));
  return onSnapshot(
    q,
    (snap) => {
      if (snap.empty) {
        onUpdate([]);
        return;
      }
      const list: ServiceItem[] = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        const basePrice = typeof d.priceLKR === 'number'
          ? d.priceLKR
          : (typeof d.defaultPriceLKR === 'number' ? d.defaultPriceLKR : 4500);

        const pricingUnitObj = typeof d.pricingUnit === 'object' && d.pricingUnit !== null
          ? d.pricingUnit
          : { en: d.pricingUnit || '/ day', si: d.pricingUnit || '/ දිනකට', ta: '' };

        const parsedTiers: ServiceTierOption[] = Array.isArray(d.tiers) ? d.tiers.map((t: any) => {
          const tPrice = typeof t.priceLKR === 'number' ? t.priceLKR : basePrice;
          const tUnit = typeof t.pricingUnit === 'object' && t.pricingUnit !== null
            ? t.pricingUnit
            : { en: t.pricingUnit || pricingUnitObj.en || '/ day', si: t.pricingUnit || pricingUnitObj.si || '/ දිනකට', ta: '' };

          let respEn: string[] = [];
          let respSi: string[] = [];
          let respTa: string[] = [];

          if (t.responsibilities && typeof t.responsibilities === 'object') {
            if (Array.isArray(t.responsibilities.en)) respEn = t.responsibilities.en;
            if (Array.isArray(t.responsibilities.si)) respSi = t.responsibilities.si;
            if (Array.isArray(t.responsibilities.ta)) respTa = t.responsibilities.ta;
          }
          if (respEn.length === 0 && Array.isArray(t.duties)) {
            respEn = t.duties;
          }
          if (respSi.length === 0 && Array.isArray(t.dutiesSi)) {
            respSi = t.dutiesSi;
          } else if (respSi.length === 0 && respEn.length > 0) {
            respSi = respEn;
          }

          const tNameEn = t.tierName?.en || t.tierNameEn || (typeof t.tierName === 'string' ? t.tierName : 'Caregiver Tier');
          const tNameSi = t.tierName?.si || t.tierNameSi || tNameEn;
          const tBadgeEn = t.badge?.en || t.badgeEn || (typeof t.badge === 'string' ? t.badge : '');
          const tBadgeSi = t.badge?.si || t.badgeSi || tBadgeEn;

          return {
            tierId: t.tierId || 'tier_' + Math.random().toString(36).substring(2, 7),
            tierName: { en: tNameEn, si: tNameSi, ta: '' },
            badge: { en: tBadgeEn, si: tBadgeSi, ta: '' },
            priceLKR: tPrice,
            pricingUnit: tUnit,
            responsibilities: {
              en: respEn,
              si: respSi,
              ta: respTa
            },
            isRecommended: !!t.isRecommended
          };
        }) : [];

        // Fallback features from first tier if not provided
        let featuresObj = typeof d.features === 'object' && d.features !== null ? d.features : null;
        if (!featuresObj || (!featuresObj.en?.length && !featuresObj.si?.length)) {
          const firstTier = parsedTiers[0];
          featuresObj = {
            en: firstTier ? firstTier.responsibilities.en : [],
            si: firstTier ? firstTier.responsibilities.si : [],
            ta: firstTier ? firstTier.responsibilities.ta : []
          };
        }

        const defaultTierId = d.defaultTierId || (parsedTiers.find(t => t.isRecommended)?.tierId) || parsedTiers[0]?.tierId || 'nvq_4_caregiver';

        const nameEn = d.name?.en || d.nameEn || (typeof d.name === 'string' ? d.name : 'Care Package');
        const nameSi = d.name?.si || d.nameSi || nameEn;
        const shortDescEn = d.shortDescription?.en || d.shortDescriptionEn || (typeof d.shortDescription === 'string' ? d.shortDescription : '');
        const shortDescSi = d.shortDescription?.si || d.shortDescriptionSi || shortDescEn;

        return {
          id: d.id || docSnap.id,
          category: d.category || 'elderly_care',
          name: { en: nameEn, si: nameSi, ta: '' },
          shortDescription: { en: shortDescEn, si: shortDescSi, ta: '' },
          description: { en: shortDescEn, si: shortDescSi, ta: '' },
          shiftType: d.shiftType || (d.hours === 24 ? '24h_full' : d.hours === 2 ? 'short_visit' : '12h_day'),
          hours: typeof d.hours === 'number' ? d.hours : 12,
          priceLKR: basePrice,
          pricingUnit: pricingUnitObj,
          icon: d.icon || 'HeartPulse',
          features: featuresObj,
          defaultTierId,
          tiers: parsedTiers,
          isActive: d.isActive !== false,
          sortOrder: typeof d.sortOrder === 'number' ? d.sortOrder : 0
        };
      });

      // Filter to only active/published services and sort by sortOrder
      const activeList = list.filter(s => s.isActive !== false);
      activeList.sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      onUpdate(activeList);
    },
    (err) => {
      console.warn('[Firestore] Error subscribing to live services:', err);
    }
  );
}

// ======================== GOOGLE REVIEWS ========================

/**
 * Real-time listener for published Google Reviews from Firestore
 */
export function subscribeToLiveReviews(
  onUpdate: (reviews: GoogleReviewItem[]) => void
): () => void {
  const q = query(collection(db, 'reviews'));
  return onSnapshot(
    q,
    (snap) => {
      if (snap.empty) {
        onUpdate([]);
        return;
      }
      const list: GoogleReviewItem[] = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: d.id || docSnap.id,
          authorName: d.authorName || 'Google User',
          authorLocation: d.authorLocation || '',
          rating: typeof d.rating === 'number' ? d.rating : 5,
          timeAgo: d.timeAgo || d.relativeTime || 'Recently',
          relativeTime: d.relativeTime || d.timeAgo || 'Recently',
          text: d.text || '',
          category: d.category || 'elderly_care',
          serviceUsed: d.serviceUsed || 'Care Service',
          caregiverMentioned: d.caregiverMentioned,
          verified: d.isVerified !== false && d.verified !== false,
          isVerified: d.isVerified !== false && d.verified !== false,
          isPublished: d.isPublished !== false,
          avatarUrl: d.avatarUrl || '',
          createdAt: d.createdAt
        };
      });

      // Filter to only published reviews
      const published = list.filter((r) => r.isPublished !== false);
      // Sort newest first
      published.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      onUpdate(published);
    },
    (err) => {
      console.warn('[Firestore] Error subscribing to live reviews:', err);
    }
  );
}

// ======================== PHOTO GALLERY ========================

/**
 * Subscribe to live published gallery items in Firestore 'gallery' collection
 */
export function subscribeToLiveGallery(onUpdate: (items: GalleryItem[]) => void): () => void {
  const collRef = collection(db, 'gallery');
  return onSnapshot(
    collRef,
    (snap) => {
      if (snap.empty) {
        onUpdate([]);
        return;
      }
      const list: GalleryItem[] = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: d.id || docSnap.id,
          title: d.title || 'Prime Life Care Moment',
          titleSi: d.titleSi || '',
          imageUrl: d.imageUrl || '',
          category: d.category || 'General Care',
          description: d.description || '',
          isPublished: d.isPublished !== false,
          sortOrder: typeof d.sortOrder === 'number' ? d.sortOrder : 0,
          createdAt: d.createdAt || new Date().toISOString(),
        };
      });

      // Filter only published items with valid imageUrl
      const published = list.filter((item) => item.isPublished !== false && item.imageUrl);
      // Sort by sortOrder ascending, then createdAt descending
      published.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder;
        }
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      onUpdate(published);
    },
    (err) => {
      console.warn('[Firestore] Error subscribing to live gallery:', err);
    }
  );
}

// ======================== MEDICAL STORE PRODUCTS ========================

/**
 * Subscribe to live published medical store items in Firestore 'medical_items' collection
 */
export function subscribeToLiveProducts(onUpdate: (items: MedicalItem[]) => void): () => void {
  const collRef = collection(db, 'medical_items');
  return onSnapshot(
    collRef,
    (snap) => {
      if (snap.empty) {
        onUpdate(initialMedicalItems);
        return;
      }
      const list: MedicalItem[] = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        const regularPrice = Number(d.regularPriceLKR || d.buyPriceLKR || d.priceLKR || 0);
        const salePrice = Number(d.salePriceLKR || d.buyPriceLKR || d.priceLKR || regularPrice);
        const discountPct = d.discountPercentage !== undefined
          ? Number(d.discountPercentage)
          : (regularPrice > salePrice ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) : 0);

        // Normalize images: ensure array of strings with up to 5 images
        let images: string[] = [];
        if (Array.isArray(d.images) && d.images.length > 0) {
          images = d.images;
        } else if (Array.isArray(d.imageUrls) && d.imageUrls.length > 0) {
          images = d.imageUrls;
        } else if (typeof d.imageUrl === 'string') {
          images = [d.imageUrl];
        } else {
          images = initialMedicalItems[0].images;
        }

        // Normalize localized name
        const nameObj = typeof d.name === 'object' && d.name !== null
          ? d.name
          : {
              en: d.nameEn || d.name || 'Medical Product',
              si: d.nameSi || d.nameEn || d.name || 'වෛද්‍ය උපකරණය',
              ta: d.nameTa || d.nameEn || d.name || 'மருத்துவ உபகரணங்கள்'
            };

        // Normalize localized description
        const descObj = typeof d.description === 'object' && d.description !== null
          ? d.description
          : {
              en: typeof d.description === 'string' ? d.description : 'High quality medical equipment.',
              si: typeof d.descriptionSi === 'string' ? d.descriptionSi : typeof d.description === 'string' ? d.description : 'උසස් තත්ත්වයේ වෛද්‍ය උපකරණය.',
              ta: typeof d.descriptionTa === 'string' ? d.descriptionTa : typeof d.description === 'string' ? d.description : 'உயர்தர மருத்துவ உபகரணங்கள்.'
            };

        const stock = typeof d.stock === 'number' ? d.stock : 1;

        return {
          id: d.id || docSnap.id,
          name: nameObj,
          category: d.category || 'equipment',
          priceLKR: salePrice,
          regularPriceLKR: regularPrice,
          salePriceLKR: salePrice,
          discountPercentage: discountPct,
          rentalMonthlyLKR: d.rentalMonthlyLKR ? Number(d.rentalMonthlyLKR) : undefined,
          stock: stock,
          inStock: d.inStock !== false && stock > 0,
          badge: d.badge || (discountPct > 0 ? `${discountPct}% OFF • Verified ICU` : 'Essential Care'),
          brand: d.brand || 'Paramount Health',
          description: descObj,
          images: images,
          features: Array.isArray(d.features) ? d.features : initialMedicalItems[0].features,
          isAvailable: d.isAvailable !== false,
          createdAt: d.createdAt || new Date().toISOString()
        };
      });

      // Filter available products
      const available = list.filter((p) => p.isAvailable !== false);
      if (available.length === 0) {
        onUpdate(initialMedicalItems);
      } else {
        onUpdate(available);
      }
    },
    (err) => {
      console.warn('[Firestore] Error subscribing to live products, using fallback:', err);
      onUpdate(initialMedicalItems);
    }
  );
}

/**
 * Find order by order code or phone
 */
export async function findOrderByCode(queryCode: string): Promise<EquipmentOrder | null> {
  try {
    const trimmed = queryCode.trim().toUpperCase();
    const docRef = doc(db, 'orders', trimmed);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as EquipmentOrder;
    }
    // Also try search by orderCode field
    const q = query(collection(db, 'orders'), where('orderCode', '==', trimmed));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      return querySnap.docs[0].data() as EquipmentOrder;
    }
    return null;
  } catch (err) {
    console.error('[Firestore] Error finding order:', err);
    return null;
  }
}

/**
 * Real-time listener for store categories synced from Admin Panel
 */
export function subscribeToStoreCategories(
  onUpdate: (categories: StoreCategory[]) => void
): () => void {
  const colRef = collection(db, 'store_categories');
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate([]);
        return;
      }
      const list: StoreCategory[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          nameEn: d.nameEn || d.name || doc.id,
          nameSi: d.nameSi || d.nameEn || d.name || doc.id,
          icon: d.icon,
          description: d.description,
          isDefault: d.isDefault === true,
          sortOrder: typeof d.sortOrder === 'number' ? d.sortOrder : 0,
        };
      });
      list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      onUpdate(list);
    },
    (err) => {
      console.warn('[Firestore] Error subscribing to store_categories:', err);
      onUpdate([]);
    }
  );
}




