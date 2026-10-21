'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { X, Mail, Lock, User, Phone, Heart, CheckCircle2, ShieldAlert } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register, loginWithGoogle } = useAuth();
  const { language } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email.includes('@')) {
          setError('Please provide a valid email address');
          setLoading(false);
          return;
        }
        await login(email);
      } else {
        if (!name || !email.includes('@') || !phone) {
          setError('Please fill in all required fields');
          setLoading(false);
          return;
        }
        await register(name, email, phone);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    si: {
      loginTitle: 'ගිණුමට ඇතුල් වන්න (Login)',
      registerTitle: 'නව ගිණුමක් සාදන්න (Sign Up)',
      subtitle: 'Booking එකක් දැමීමට සහ ඔබගේ ඉතිහාසය පරීක්ෂා කිරීමට ඊමේල් මඟින් පිවිසෙන්න.',
      emailLabel: 'ඊමේල් ලිපිනය (Email)',
      passLabel: 'මුරපදය (Password)',
      nameLabel: 'ඔබගේ සම්පූර්ණ නම (Full Name)',
      phoneLabel: 'දුරකථන / WhatsApp අංකය (Phone)',
      loginBtn: 'ඇතුල් වන්න',
      registerBtn: 'ලියාපදිංචි වන්න',
      demoLogin: 'පහසු Demo Login එක භාවිතා කරන්න',
      noAccount: 'ගිණුමක් නොමැතිද? ලියාපදිංචි වන්න',
      haveAccount: 'දැනටමත් ගිණුමක් තිබේද? ඇතුල් වන්න'
    },
    en: {
      loginTitle: 'Customer Login',
      registerTitle: 'Create Family Account',
      subtitle: 'Please sign in with your email to place and track your caregiver bookings.',
      emailLabel: 'Email Address',
      passLabel: 'Password',
      nameLabel: 'Your Full Name',
      phoneLabel: 'WhatsApp / Phone Number',
      loginBtn: 'Sign In to Continue',
      registerBtn: 'Create Account & Continue',
      demoLogin: 'Instant Demo Login (One-Click)',
      noAccount: "Don't have an account? Sign Up",
      haveAccount: 'Already have an account? Sign In'
    },
    ta: {
      loginTitle: 'உள்நுழையவும் (Login)',
      registerTitle: 'புதிய கணக்கு தொடங்க (Sign Up)',
      subtitle: 'முன்பதிவு செய்ய மற்றும் கண்காணிக்க உங்கள் மின்னஞ்சலில் உள்நுழையவும்.',
      emailLabel: 'மின்னஞ்சல் முகவரி (Email)',
      passLabel: 'கடவுச்சொல் (Password)',
      nameLabel: 'உங்கள் முழுப் பெயர்',
      phoneLabel: 'தொலைபேசி எண்',
      loginBtn: 'உள்நுழைக',
      registerBtn: 'பதிவு செய்க',
      demoLogin: 'டெமோ உள்நுழைவு',
      noAccount: 'கணக்கு இல்லையா? பதிவு செய்க',
      haveAccount: 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழைக'
    }
  };

  const t = titles[language];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white p-6 relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 text-emerald-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1 text-emerald-200 text-xs font-bold uppercase tracking-wider">
            <img src="/logo.png" alt="Logo" className="w-5 h-5 rounded-full bg-white object-contain p-0.5" />
            <span>Prime Life Care Security</span>
          </div>
          <h3 className="text-xl font-black">
            {mode === 'login' ? t.loginTitle : t.registerTitle}
          </h3>
          <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.nameLabel} *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Kasun Fernando"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.phoneLabel} *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="077 123 4567"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t.emailLabel} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t.passLabel}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-200 transition-all cursor-pointer mt-2"
            >
              {loading ? 'Please wait...' : mode === 'login' ? t.loginBtn : t.registerBtn}
            </button>
          </form>

          {/* Google Sign In Divider & Button */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-bold">
                {language === 'si' ? 'හෝ Google මඟින්' : language === 'ta' ? 'அல்லது Google மூலம்' : 'or with Google'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              try {
                await loginWithGoogle();
              } catch (e: any) {
                setError(e?.message || 'Google Sign-in failed');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.67-5.17 3.67-9.15z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.25v3.15C3.25 21.36 7.34 24 12 24z"/>
              <path fill="#FBBC05" d="M5.27 14.24A7.18 7.18 0 0 1 4.89 12c0-.78.14-1.53.38-2.24V6.61H1.25A11.967 11.967 0 0 0 0 12c0 1.92.45 3.74 1.25 5.39l4.02-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.25 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
            </svg>
            <span>{language === 'si' ? 'Google ගිණුමෙන් පිවිසෙන්න' : language === 'ta' ? 'Google மூலம் உள்நுழைக' : 'Continue with Google'}</span>
          </button>

          {/* Quick Demo Login Pill */}
          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => login('rohan.j@gmail.com')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-all inline-flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t.demoLogin}
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              {mode === 'login' ? t.noAccount : t.haveAccount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
