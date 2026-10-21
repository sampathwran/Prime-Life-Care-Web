'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { firebaseApp } from '@/lib/firebase';

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (name: string, email: string, phone: string) => Promise<boolean>;
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
  address: 'No 24, Chapel Road, Nugegoda',
  createdAt: '2026-09-15T10:00:00Z'
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
      phone: '077 123 4567',
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=2563eb&color=fff&rounded=true&bold=true`,
      district: 'Colombo (කොළඹ)',
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
      const result = await signInWithPopup(auth, provider);
      const gUser = result.user;

      const profile: UserProfile = {
        id: gUser.uid,
        name: gUser.displayName || gUser.email?.split('@')[0] || 'Google User',
        email: gUser.email || '',
        phone: gUser.phoneNumber || '077 123 4567',
        photoURL: gUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(gUser.displayName || 'Google User')}&background=0D8ABC&color=fff&rounded=true`,
        district: 'Colombo (කොළඹ)',
        createdAt: new Date().toISOString()
      };

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
      // Fallback for instant 1-click test with Google avatar
      const fallbackUser: UserProfile = {
        id: `usr_g_${Date.now()}`,
        name: 'Sampath Ranasinghe',
        email: 'sampathwran@gmail.com',
        phone: '077 123 4567',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256',
        district: 'Colombo (කොළඹ)',
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
