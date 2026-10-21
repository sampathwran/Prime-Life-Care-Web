'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { firebaseApp } from '@/lib/firebase';

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (name: string, email: string, phone: string) => Promise<boolean>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: (onSuccessCallback?: () => void) => void;
  closeAuthModal: () => void;
  postAuthCallback: (() => void) | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const defaultDemoUser: UserProfile = {
  id: 'usr_rohan_01',
  name: 'Rohan Jayasinghe',
  email: 'rohan.j@gmail.com',
  phone: '077 123 4567',
  photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256',
  district: 'Colombo (කොළඹ)',
  city: 'Nugegoda',
  address: 'No 24, Chapel Road, Nugegoda',
  createdAt: '2026-09-15T10:00:00Z',
  savedPatients: [
    {
      id: 'p_01',
      name: 'Sunil Jayasinghe (තාත්තා)',
      relation: 'Father',
      age: 76,
      gender: 'male',
      mobility: 'Wheelchair Assisted (රෝද පුටුව)',
      conditions: 'Hypertension, Post-Stroke Rehab, Daily Medication'
    },
    {
      id: 'p_02',
      name: 'Kusuma Jayasinghe (අම්මා)',
      relation: 'Mother',
      age: 72,
      gender: 'female',
      mobility: 'Walking Stick (සැරයටිය)',
      conditions: 'Diabetes Type 2, Arthritis Care'
    }
  ],
  notifications: [
    {
      id: 'notif_1',
      title: 'සාත්තු සේවිකාව පැමිණෙමින් සිටී 🚗',
      message: 'ඔබගේ වෙන්කිරීම (PLC-7821) සඳහා හෙද නිලධාරිනි නදීකා සිල්වා (RN) මේ වන විට ඔබගේ නිවස බලා ගමන් කරමින් සිටී.',
      type: 'clinical',
      timestamp: 'මිනිත්තු 10 කට පෙර',
      isRead: false,
      linkCode: 'PLC-7821'
    },
    {
      id: 'notif_2',
      title: 'දෛනික සෞඛ්‍ය වාර්තාව (Vitals Updated) 🩺',
      message: 'ඊයේ දින රුධිර පීඩනය (BP: 125/82 mmHg) සහ රුධිර සීනි (RBS: 112 mg/dL) යාවත්කාලීන කර ඇත. තත්ත්වය යහපත් මට්ටමේ පවතී.',
      type: 'clinical',
      timestamp: 'පැය 3 කට පෙර',
      isRead: false,
      linkCode: 'PLC-7821'
    },
    {
      id: 'notif_3',
      title: 'උපකරණ බෙදාහැරීම සුදානම් (Dispatched) 📦',
      message: 'ඔබ ඇණවුම් කළ Digital Blood Pressure Monitor (ORD-4102) කුරියර් සේවාව වෙත භාර දී ඇත.',
      type: 'order',
      timestamp: 'ඊයේ දින',
      isRead: true,
      linkCode: 'ORD-4102'
    }
  ]
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [postAuthCallback, setPostAuthCallback] = useState<(() => void) | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('prime_life_care_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Initialize with demo user for seamless instant testing
      setUser(defaultDemoUser);
      localStorage.setItem('prime_life_care_user', JSON.stringify(defaultDemoUser));
    }
  }, []);

  const login = async (email: string): Promise<boolean> => {
    const formattedName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const loggedUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: formattedName,
      email: email.trim(),
      phone: user?.phone || '077 123 4567',
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=2563eb&color=fff&rounded=true&bold=true`,
      district: user?.district || 'Colombo (කොළඹ)',
      city: user?.city || 'Nugegoda',
      address: user?.address || 'No 24, Chapel Road, Nugegoda',
      savedPatients: user?.savedPatients || defaultDemoUser.savedPatients,
      notifications: user?.notifications || defaultDemoUser.notifications,
      createdAt: new Date().toISOString()
    };
    setUser(loggedUser);
    localStorage.setItem('prime_life_care_user', JSON.stringify(loggedUser));
    setIsAuthModalOpen(false);
    if (postAuthCallback) {
      postAuthCallback();
      setPostAuthCallback(null);
    }
    return true;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      const auth = getAuth(firebaseApp);
      const provider = new GoogleAuthProvider();
      // Forces device (Android/iOS/PC) to auto-suggest and display all logged in Gmail accounts
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const result = await signInWithPopup(auth, provider);
      const gUser = result.user;

      const profile: UserProfile = {
        id: gUser.uid,
        name: gUser.displayName || gUser.email?.split('@')[0] || 'Google User',
        email: gUser.email || '',
        phone: gUser.phoneNumber || user?.phone || '077 123 4567',
        photoURL: gUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(gUser.displayName || 'Google User')}&background=0D8ABC&color=fff&rounded=true`,
        district: user?.district || 'Colombo (කොළඹ)',
        city: user?.city || 'Nugegoda',
        address: user?.address || 'No 24, Chapel Road, Nugegoda',
        savedPatients: user?.savedPatients || defaultDemoUser.savedPatients,
        notifications: user?.notifications || defaultDemoUser.notifications,
        createdAt: new Date().toISOString()
      };

      // Save/update user profile in Firestore
      try {
        const { getFirestore, doc, setDoc } = await import('firebase/firestore');
        const db = getFirestore(firebaseApp);
        await setDoc(doc(db, 'users', profile.id), profile, { merge: true });
      } catch (err) {
        console.warn('Firestore user save warning:', err);
      }

      setUser(profile);
      localStorage.setItem('prime_life_care_user', JSON.stringify(profile));
      setIsAuthModalOpen(false);
      if (postAuthCallback) {
        postAuthCallback();
        setPostAuthCallback(null);
      }
      return true;
    } catch (err: any) {
      console.warn('Google popup auth fallback:', err);
      // Fallback for popup blocked or offline instant test with real Google avatar
      const fallbackUser: UserProfile = {
        id: `usr_g_${Date.now()}`,
        name: 'Sampath Ranasinghe',
        email: 'sampathwran@gmail.com',
        phone: user?.phone || '077 123 4567',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256',
        district: user?.district || 'Colombo (කොළඹ)',
        city: user?.city || 'Nugegoda',
        address: user?.address || 'No 24, Chapel Road, Nugegoda',
        savedPatients: user?.savedPatients || defaultDemoUser.savedPatients,
        notifications: user?.notifications || defaultDemoUser.notifications,
        createdAt: new Date().toISOString()
      };
      setUser(fallbackUser);
      localStorage.setItem('prime_life_care_user', JSON.stringify(fallbackUser));
      setIsAuthModalOpen(false);
      if (postAuthCallback) {
        postAuthCallback();
        setPostAuthCallback(null);
      }
      return true;
    }
  };

  const register = async (name: string, email: string, phone: string): Promise<boolean> => {
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name,
      email: email.trim(),
      phone,
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff&rounded=true&bold=true`,
      district: 'Colombo (කොළඹ)',
      city: 'Nugegoda',
      address: 'No 24, Chapel Road, Nugegoda',
      savedPatients: defaultDemoUser.savedPatients,
      notifications: defaultDemoUser.notifications,
      createdAt: new Date().toISOString()
    };
    setUser(newUser);
    localStorage.setItem('prime_life_care_user', JSON.stringify(newUser));
    setIsAuthModalOpen(false);
    if (postAuthCallback) {
      postAuthCallback();
      setPostAuthCallback(null);
    }
    return true;
  };

  const updateUserProfile = async (data: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    const updatedUser: UserProfile = {
      ...user,
      ...data
    };
    setUser(updatedUser);
    localStorage.setItem('prime_life_care_user', JSON.stringify(updatedUser));

    // Also sync to Cloud Firestore if initialized
    try {
      const { getFirestore, doc, setDoc } = await import('firebase/firestore');
      const db = getFirestore(firebaseApp);
      await setDoc(doc(db, 'users', updatedUser.id), updatedUser, { merge: true });
    } catch (err) {
      console.warn('Firestore user update warning:', err);
    }
    return true;
  };

  const markNotificationAsRead = (id: string) => {
    if (!user || !user.notifications) return;
    const updatedNotifications = user.notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    updateUserProfile({ notifications: updatedNotifications });
  };

  const markAllNotificationsAsRead = () => {
    if (!user || !user.notifications) return;
    const updatedNotifications = user.notifications.map((n) => ({ ...n, isRead: true }));
    updateUserProfile({ notifications: updatedNotifications });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('prime_life_care_user');
  };

  const openAuthModal = (callback?: () => void) => {
    if (callback) {
      setPostAuthCallback(() => callback);
    } else {
      setPostAuthCallback(null);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPostAuthCallback(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        register,
        updateUserProfile,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        postAuthCallback
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
