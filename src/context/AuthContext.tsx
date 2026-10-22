'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { firebaseApp, auth, db, googleAuthProvider } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithEmail: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password?: string) => Promise<boolean>;
  registerWithEmail: (name: string, email: string, password: string, phone: string) => Promise<boolean>;
  loginAsDemoUser: () => void;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  logout: () => Promise<void>;
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
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [postAuthCallback, setPostAuthCallback] = useState<(() => void) | null>(null);

  // Synchronize with Firebase Auth state
  useEffect(() => {
    // First, load from localStorage if previously stored
    const saved = localStorage.getItem('prime_life_care_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing local user:', e);
      }
    }

    // Subscribe to Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      if (fUser) {
        try {
          // Fetch user document from Firestore
          const userDocRef = doc(db, 'users', fUser.uid);
          const userDoc = await getDoc(userDocRef);

          let profile: UserProfile;
          if (userDoc.exists()) {
            profile = userDoc.data() as UserProfile;
          } else {
            profile = {
              id: fUser.uid,
              name: fUser.displayName || fUser.email?.split('@')[0] || 'Prime Member',
              email: fUser.email || '',
              phone: fUser.phoneNumber || '',
              photoURL: fUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fUser.displayName || 'Member')}&background=0D8ABC&color=fff&rounded=true`,
              district: 'Colombo (කොළඹ)',
              city: 'Colombo',
              address: '',
              savedPatients: [],
              notifications: [
                {
                  id: `notif_${Date.now()}`,
                  title: 'සාදරයෙන් පිළිගනිමු! 🩺',
                  message: 'Prime Life Care පවුලට ඔබව සාදරයෙන් පිළිගනිමු. ඔබගේ රෝගී සාත්තු සේවා සහ උපකරණ අවශ්‍යතා පහසුවෙන් මෙතැනින් ඉටුකරගත හැක.',
                  type: 'system',
                  timestamp: 'මීට සුළු මොහොතකට පෙර',
                  isRead: false
                }
              ],
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, profile, { merge: true });
          }

          setUser(profile);
          localStorage.setItem('prime_life_care_user', JSON.stringify(profile));
        } catch (err) {
          console.warn('Firestore fetch user warning:', err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Sign-In / Sign-Up (Triggers device Gmail selector)
  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const gUser = result.user;

      // Sync with Firestore
      const userDocRef = doc(db, 'users', gUser.uid);
      const userDoc = await getDoc(userDocRef);

      let profile: UserProfile;
      if (userDoc.exists()) {
        profile = userDoc.data() as UserProfile;
      } else {
        profile = {
          id: gUser.uid,
          name: gUser.displayName || gUser.email?.split('@')[0] || 'Prime Member',
          email: gUser.email || '',
          phone: gUser.phoneNumber || '',
          photoURL: gUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(gUser.displayName || 'Member')}&background=0D8ABC&color=fff&rounded=true`,
          district: 'Colombo (කොළඹ)',
          city: 'Colombo',
          address: '',
          savedPatients: [],
          notifications: [
            {
              id: `notif_${Date.now()}`,
              title: 'සාදරයෙන් පිළිගනිමු! 🩺',
              message: 'Prime Life Care පවුලට ඔබව සාදරයෙන් පිළිගනිමු. ඔබගේ රෝගී සාත්තු සේවා සහ උපකරණ අවශ්‍යතා පහසුවෙන් මෙතැනින් ඉටුකරගත හැක.',
              type: 'system',
              timestamp: 'මීට සුළු මොහොතකට පෙර',
              isRead: false
            }
          ],
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, profile, { merge: true });
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
      console.error('Google Sign-In Error:', err);
      throw err;
    }
  };

  // Email & Password Registration
  const registerWithEmail = async (name: string, email: string, password: string, phone: string): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const fUser = userCredential.user;

      try {
        await updateProfile(fUser, {
          displayName: name.trim()
        });
      } catch (e) {
        console.warn('Profile update warning:', e);
      }

      const profile: UserProfile = {
        id: fUser.uid,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=10b981&color=fff&rounded=true&bold=true`,
        district: 'Colombo (කොළඹ)',
        city: 'Colombo',
        address: '',
        savedPatients: [],
        notifications: [
          {
            id: `notif_${Date.now()}`,
            title: 'ගිණුම සාර්ථකව සාදන ලදී! 🎉',
            message: 'Prime Life Care පවුලට ඔබව සාදරයෙන් පිළිගනිමු. ඔබගේ රෝගී සාත්තු සේවා සහ උපකරණ අවශ්‍යතා පහසුවෙන් මෙතැනින් ඉටුකරගත හැක.',
            type: 'system',
            timestamp: 'මීට සුළු මොහොතකට පෙර',
            isRead: false
          }
        ],
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'users', fUser.uid), profile, { merge: true });
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
      console.error('Registration Error:', err);
      throw err;
    }
  };

  // Email & Password Login
  const loginWithEmail = async (email: string, password?: string): Promise<boolean> => {
    try {
      if (password) {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const fUser = userCredential.user;

        const userDocRef = doc(db, 'users', fUser.uid);
        const userDoc = await getDoc(userDocRef);

        let profile: UserProfile;
        if (userDoc.exists()) {
          profile = userDoc.data() as UserProfile;
        } else {
          profile = {
            id: fUser.uid,
            name: fUser.displayName || email.split('@')[0],
            email: email.trim(),
            phone: '077 123 4567',
            photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(fUser.displayName || email)}&background=2563eb&color=fff&rounded=true&bold=true`,
            district: 'Colombo (කොළඹ)',
            city: 'Colombo',
            address: '',
            savedPatients: [],
            notifications: [],
            createdAt: new Date().toISOString()
          };
          await setDoc(userDocRef, profile, { merge: true });
        }

        setUser(profile);
        localStorage.setItem('prime_life_care_user', JSON.stringify(profile));
      } else {
        // Fallback for simple email without password
        const formattedName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        const profile: UserProfile = {
          id: `usr_${Date.now()}`,
          name: formattedName,
          email: email.trim(),
          phone: '077 123 4567',
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=2563eb&color=fff&rounded=true&bold=true`,
          district: 'Colombo (කොළඹ)',
          city: 'Colombo',
          address: '',
          savedPatients: [],
          notifications: [],
          createdAt: new Date().toISOString()
        };
        setUser(profile);
        localStorage.setItem('prime_life_care_user', JSON.stringify(profile));
      }

      setIsAuthModalOpen(false);
      if (postAuthCallback) {
        postAuthCallback();
        setPostAuthCallback(null);
      }
      return true;
    } catch (err: any) {
      console.error('Login Error:', err);
      throw err;
    }
  };

  // Helper Aliases for backward compatibility
  const login = async (email: string, password?: string): Promise<boolean> => {
    return loginWithEmail(email, password);
  };

  const register = async (name: string, email: string, phone: string, password?: string): Promise<boolean> => {
    if (password) {
      return registerWithEmail(name, email, password, phone);
    }
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name,
      email: email.trim(),
      phone,
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff&rounded=true&bold=true`,
      district: 'Colombo (කොළඹ)',
      city: 'Colombo',
      address: '',
      savedPatients: [],
      notifications: [],
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

  // Demo user login for testing
  const loginAsDemoUser = () => {
    setUser(defaultDemoUser);
    localStorage.setItem('prime_life_care_user', JSON.stringify(defaultDemoUser));
    setIsAuthModalOpen(false);
  };

  // Update Profile
  const updateUserProfile = async (data: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    const updatedUser: UserProfile = {
      ...user,
      ...data
    };
    setUser(updatedUser);
    localStorage.setItem('prime_life_care_user', JSON.stringify(updatedUser));

    try {
      const userDocRef = doc(db, 'users', updatedUser.id);
      await setDoc(userDocRef, updatedUser, { merge: true });
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

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signout warning:', e);
    }
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
        loading,
        login,
        loginWithGoogle,
        loginWithEmail,
        register,
        registerWithEmail,
        loginAsDemoUser,
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
