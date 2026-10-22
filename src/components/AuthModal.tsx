'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { X, Mail, Lock, User, Phone, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    loginAsDemoUser
  } = useAuth();
  const { language } = useLanguage();

  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const t = {
    si: {
      title: mode === 'register' ? 'නව ගිණුමක් ලියාපදිංචි කිරීම' : 'ගිණුමට ඇතුල් වන්න',
      subtitle: 'පළපුරුදු හෙද සහ සාත්තු සේවාවන් වෙන්කරවා ගැනීමට ඔබගේ ගිණුමට පිවිසෙන්න.',
      tabRegister: 'ලියාපදිංචි වන්න (Sign Up)',
      tabLogin: 'ඇතුල් වන්න (Log In)',
      googleBtn: 'Gmail ගිණුමෙන් එක ක්ලික් එකෙන් පිවිසෙන්න',
      googleBadge: 'ඉක්මන් ලියාපදිංචිය',
      googleNote: 'දුරකථනයේ හෝ පරිගණකයේ ඇති Gmail ස්වයංක්‍රීයව තෝරාගත හැක',
      divider: 'හෝ Email සහ Password මඟින් පිවිසෙන්න',
      nameLabel: 'ඔබගේ සම්පූර්ණ නම (Full Name) *',
      namePlaceholder: 'උදා: Rohan Jayasinghe',
      phoneLabel: 'දුරකථන / WhatsApp අංකය *',
      phonePlaceholder: '077 123 4567',
      emailLabel: 'ඊමේල් ලිපිනය (Email Address) *',
      emailPlaceholder: 'youremail@gmail.com',
      passwordLabel: 'මුරපදය (Password) *',
      confirmPasswordLabel: 'මුරපදය නැවත ඇතුළත් කරන්න *',
      passwordHint: 'අවම වශයෙන් අකුරු/ඉලක්කම් 6ක් ඇතුළත් කරන්න',
      submitRegister: 'නොමිලේ ගිණුම සාදන්න (Create Account)',
      submitLogin: 'ගිණුමට පිවිසෙන්න (Sign In)',
      demoTitle: 'පරීක්ෂා කිරීම සඳහා Instant Demo Login එක භාවිතා කරන්න',
      alreadyHave: 'දැනටමත් ගිණුමක් තිබේද? ඇතුල් වන්න',
      needAccount: 'නව සාමාජිකයෙක්ද? ලියාපදිංචි වන්න',
      passMismatch: 'මුරපද දෙක එකිනෙකට නොගැලපේ.',
      passShort: 'මුරපදය සඳහා අවම වශයෙන් අකුරු 6ක් අවශ්‍යයි.',
      fillAll: 'කරුණාකර සියලුම තොරතුරු සම්පූර්ණ කරන්න.'
    },
    en: {
      title: mode === 'register' ? 'Create Family Account' : 'Welcome Back',
      subtitle: 'Sign in or register to book verified caregivers and track elderly patient care.',
      tabRegister: 'Register (Sign Up)',
      tabLogin: 'Sign In (Log In)',
      googleBtn: 'Continue with Google (Gmail)',
      googleBadge: '1-Tap Fast',
      googleNote: 'Auto-selects your phone or PC saved Gmail accounts',
      divider: 'or continue with Email & Password',
      nameLabel: 'Your Full Name *',
      namePlaceholder: 'e.g. Rohan Jayasinghe',
      phoneLabel: 'WhatsApp / Phone Number *',
      phonePlaceholder: '077 123 4567',
      emailLabel: 'Email Address *',
      emailPlaceholder: 'youremail@gmail.com',
      passwordLabel: 'Password *',
      confirmPasswordLabel: 'Confirm Password *',
      passwordHint: 'At least 6 characters required',
      submitRegister: 'Create Account & Continue',
      submitLogin: 'Sign In to Account',
      demoTitle: 'Instant Demo Preview Login (One-Click)',
      alreadyHave: 'Already have an account? Sign In',
      needAccount: 'New to Prime Life Care? Create Account',
      passMismatch: 'Passwords do not match.',
      passShort: 'Password must be at least 6 characters.',
      fillAll: 'Please fill in all required fields.'
    },
    ta: {
      title: mode === 'register' ? 'புதிய கணக்கு தொடங்க' : 'உள்நுழையவும்',
      subtitle: 'பராமரிப்பாளர்களை முன்பதிவு செய்ய உங்கள் கணக்கில் நுழையவும்.',
      tabRegister: 'பதிவு செய்க (Sign Up)',
      tabLogin: 'உள்நுழைக (Log In)',
      googleBtn: 'Gmail மூலம் தொடரவும்',
      googleBadge: 'விரைவானது',
      googleNote: 'சாதன Gmail கணக்குகளை தானாகக் கண்டறியும்',
      divider: 'அல்லது மின்னஞ்சல் மூலம்',
      nameLabel: 'முழுப் பெயர் *',
      namePlaceholder: 'e.g. Rohan Jayasinghe',
      phoneLabel: 'தொலைபேசி / வாட்ஸ்அப் *',
      phonePlaceholder: '077 123 4567',
      emailLabel: 'மின்னஞ்சல் முகவரி *',
      emailPlaceholder: 'youremail@gmail.com',
      passwordLabel: 'கடவுச்சொல் *',
      confirmPasswordLabel: 'கடவுச்சொல்லை உறுதி செய்க *',
      passwordHint: 'குறைந்தது 6 எழுத்துக்கள்',
      submitRegister: 'கணக்கை உருவாக்க',
      submitLogin: 'உள்நுழைக',
      demoTitle: 'டெமோ உள்நுழைவு',
      alreadyHave: 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழைக',
      needAccount: 'புதியவரா? பதிவு செய்க',
      passMismatch: 'கடவுச்சொற்கள் பொருந்தவில்லை.',
      passShort: 'கடவுச்சொல் 6 எழுத்துக்களுக்கு மேல் இருக்க வேண்டும்.',
      fillAll: 'அனைத்து விவரங்களையும் நிரப்பவும்.'
    }
  }[language];

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google login window was closed. Please try again.');
      } else {
        setError(err.message || 'Google sign-in error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!name.trim() || !phone.trim() || !email.trim() || !password) {
        setError(t.fillAll);
        return;
      }
      if (password.length < 6) {
        setError(t.passShort);
        return;
      }
      if (password !== confirmPassword) {
        setError(t.passMismatch);
        return;
      }

      setLoading(true);
      try {
        await registerWithEmail(name, email, password, phone);
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          setError('මෙම Email ලිපිනය දැනටමත් ලියාපදිංචි වී ඇත. කරුණාකර Log In වන්න.');
        } else if (err.code === 'auth/invalid-email') {
          setError('වලංගු ඊමේල් ලිපිනයක් ඇතුළත් කරන්න.');
        } else {
          setError(err.message || 'Registration failed. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Login mode
      if (!email.trim() || !password) {
        setError(t.fillAll);
        return;
      }

      setLoading(true);
      try {
        await loginWithEmail(email, password);
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          setError('ඊමේල් ලිපිනය හෝ මුරපදය වැරදිය. කරුණාකර නැවත පරීක්ෂා කරන්න.');
        } else {
          setError(err.message || 'Login failed. Please check your credentials.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-7 pb-4 bg-gradient-to-b from-blue-50/70 to-white border-b border-slate-100">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center p-1">
              <img src="/logo.png" alt="Prime Life Care" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-700 tracking-wider uppercase block">Prime Life Care</span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">{t.title}</h3>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mt-1">{t.subtitle}</p>

          {/* Segmented Mode Selector (Sign Up / Sign In) */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mt-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.tabRegister}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.tabLogin}
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-7 pt-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-2xl bg-red-50 text-red-700 text-xs flex items-start gap-2.5 border border-red-200 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* OPTION 1: 1-TAP GOOGLE SIGN-IN / SIGN-UP */}
          <div>
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl border-2 border-blue-500/40 hover:border-blue-600 bg-white hover:bg-blue-50/40 text-slate-800 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition-all active:scale-98 cursor-pointer relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-bl-lg">
                ⚡ {t.googleBadge}
              </div>
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.67-5.17 3.67-9.15z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.25v3.15C3.25 21.36 7.34 24 12 24z"/>
                <path fill="#FBBC05" d="M5.27 14.24A7.18 7.18 0 0 1 4.89 12c0-.78.14-1.53.38-2.24V6.61H1.25A11.967 11.967 0 0 0 0 12c0 1.92.45 3.74 1.25 5.39l4.02-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.25 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
              </svg>
              <span>{t.googleBtn}</span>
            </button>
            <p className="text-[11px] text-center text-slate-500 mt-1.5 font-medium flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{t.googleNote}</span>
            </p>
          </div>

          {/* DIVIDER */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-semibold text-[11px]">
                {t.divider}
              </span>
            </div>
          </div>

          {/* OPTION 2: EMAIL & PASSWORD FORM */}
          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.nameLabel}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t.namePlaceholder}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                {/* Phone / WhatsApp */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.phoneLabel}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t.phonePlaceholder}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.emailLabel}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  {t.passwordLabel}
                </label>
                <span className="text-[10px] text-slate-400">{t.passwordHint}</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600 focus:border-blue-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (only in Register mode) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.confirmPasswordLabel}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-blue-600 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : null}
              <span>{loading ? 'Please wait...' : mode === 'register' ? t.submitRegister : t.submitLogin}</span>
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'register' ? 'login' : 'register');
                setError('');
              }}
              className="text-blue-600 hover:underline font-bold cursor-pointer"
            >
              {mode === 'register' ? t.alreadyHave : t.needAccount}
            </button>

            <button
              type="button"
              onClick={loginAsDemoUser}
              className="text-[11px] text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              title="Instant Demo Preview"
            >
              Demo Preview ⚡
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
