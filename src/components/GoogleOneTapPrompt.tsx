'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { X, ShieldCheck, Sparkles } from 'lucide-react';

export const GoogleOneTapPrompt: React.FC = () => {
  const { user, loginWithGoogle, openAuthModal } = useAuth();
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already logged in, do not show
    if (user) {
      setIsVisible(false);
      return;
    }

    // Check if dismissed in this browser session
    const dismissed = sessionStorage.getItem('plc_google_onetap_dismissed');
    if (dismissed) return;

    // Trigger after 1.5s for authentic auto-suggest experience
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [user]);

  if (!isVisible || user) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('plc_google_onetap_dismissed', 'true');
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      setIsVisible(false);
    } catch (e: any) {
      console.warn('Google One Tap sign in failed:', e);
      if (e?.code === 'auth/unauthorized-domain') {
        setIsVisible(false);
        openAuthModal();
      }
    } finally {
      setLoading(false);
    }
  };

  const content = {
    si: {
      header: 'Google ගිණුමෙන් සම්බන්ධ වන්න',
      sub: 'ඔබගේ දුරකථනයේ හෝ PC එකේ ඇති Gmail ගිණුමෙන් තත්පරයෙන් ලියාපදිංචි වී සේවාවන් වෙන්කරවා ගන්න.',
      btn: 'ඔබගේ Gmail එකෙන් පිවිසෙන්න',
      note: 'දුරකථනයේ ඇති ගිණුම් ස්වයංක්‍රීයව පෙන්වයි'
    },
    en: {
      header: 'Sign in with Google',
      sub: 'Quick 1-tap sign up with your saved phone or PC Gmail account for fast booking & live tracking.',
      btn: 'Continue with Google',
      note: 'Auto-detects your saved device accounts'
    },
    ta: {
      header: 'Google மூலம் உள்நுழைக',
      sub: 'உங்கள் போன் அல்லது கணினியில் உள்ள Gmail கணக்கு மூலம் ஒரே கிளிக்கில் பதிவு செய்யவும்.',
      btn: 'Google மூலம் தொடரவும்',
      note: 'சாதன கணக்குகளை தானாகக் கண்டறியும்'
    }
  }[language];

  return (
    <div className="fixed top-24 right-4 sm:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-96 animate-in slide-in-from-top-6 fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-blue-500/20 p-5 relative overflow-hidden backdrop-blur-md">
        {/* Subtle decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-emerald-500 to-indigo-500" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close auto-suggest"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Google & Prime Life Care Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.67-5.17 3.67-9.15z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.25v3.15C3.25 21.36 7.34 24 12 24z"/>
              <path fill="#FBBC05" d="M5.27 14.24A7.18 7.18 0 0 1 4.89 12c0-.78.14-1.53.38-2.24V6.61H1.25A11.967 11.967 0 0 0 0 12c0 1.92.45 3.74 1.25 5.39l4.02-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.25 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-black text-slate-900">{content.header}</h4>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Prime Life Care Sri Lanka</p>
          </div>
        </div>

        {/* Explanation */}
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          {content.sub}
        </p>

        {/* 1-Tap Action Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 active:scale-98 transition-all cursor-pointer"
        >
          {loading ? (
            <span className="inline-block animate-spin mr-1">⌛</span>
          ) : (
            <Sparkles className="w-4 h-4 text-amber-300" />
          )}
          <span>{loading ? 'Connecting...' : content.btn}</span>
        </button>

        {/* Micro-footer note */}
        <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 font-medium px-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Secure 256-bit OAuth</span>
          </span>
          <span>{content.note}</span>
        </div>
      </div>
    </div>
  );
};
