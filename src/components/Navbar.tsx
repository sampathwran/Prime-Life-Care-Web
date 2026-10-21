'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Heart, Phone, Menu, X, Shield, Clock, LogIn, ShoppingBag, Globe, ChevronDown, Check } from 'lucide-react';
import { Language } from '@/types';

interface NavbarProps {
  onOpenBooking: () => void;
  onNavigateToServices?: () => void;
  onNavigateToStore: () => void;
  onNavigateToTrust?: () => void;
  onNavigateToTracker: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  onNavigateToServices,
  onNavigateToStore,
  onNavigateToTrust,
  onNavigateToTracker,
  onOpenProfile,
  onOpenAuth
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languageOptions: { id: Language; label: string; nativeName: string; flag: string }[] = [
    { id: 'si', label: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰' },
    { id: 'en', label: 'English', nativeName: 'English', flag: '🇬🇧' },
    { id: 'ta', label: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' }
  ];

  const currentLang = languageOptions.find((l) => l.id === language) || languageOptions[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Hotline Bar - Elegant Dark Slate */}
      <div className="bg-slate-900 text-slate-200 text-xs sm:text-sm py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {t.nav.emergency}: <a href={`tel:${t.emergencyPhone}`} className="font-bold text-white hover:underline">{t.emergencyPhone}</a>
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="hidden md:inline-flex items-center gap-1 text-slate-300">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              {t.hero.stats.verifiedStaff}
            </span>
            <span className="text-slate-300">
              {t.nav.hotline}: <a href={`tel:${t.phone}`} className="font-semibold text-white hover:underline">{t.phone}</a>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white shadow-md shadow-blue-500/10 border border-slate-200/80 p-0.5 shrink-0 transition-transform duration-200 hover:scale-105">
              <img
                src="/logo.png"
                alt="Prime Life Care Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">PRIME LIFE</span>
                <span className="text-xl sm:text-2xl font-black text-blue-600">CARE</span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight hidden sm:block mt-0.5">
                <span>{language === 'si' ? 'කරුණාවන්ත, සහතිකලත්' : language === 'ta' ? 'அன்பான, சான்றளிக்கப்பட்ட' : 'Compassionate, Certified'}</span>
                <span className="block">{language === 'si' ? 'වැඩිහිටි සහ රෝගී සාත්තු සේවය' : language === 'ta' ? 'முதியோர் සහ நோயாளி பராமரிப்பு' : 'Elderly & Patient Care in Sri Lanka'}</span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-semibold text-slate-700">
            <button
              onClick={onNavigateToStore}
              className="cursor-pointer flex items-center gap-2 text-slate-900 font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200/80 shadow-2xs group transition-all"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="inline-block animate-sway-x text-blue-900 font-black tracking-tight text-xs sm:text-sm">
                {t.nav.store}
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>
            <button
              onClick={onNavigateToTracker}
              className="hover:text-blue-600 transition-colors cursor-pointer text-xs sm:text-sm"
            >
              {t.nav.track}
            </button>
          </nav>

          {/* Right Actions: Book CTA in middle, Language Dropdown, Profile / Auth at the far right */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Book Now Button (In the Middle) */}
            <button
              onClick={onOpenBooking}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>{t.nav.bookNow}</span>
            </button>

            {/* Elegant Language Select Dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-sm">{currentLang.flag}</span>
                <span>{currentLang.nativeName}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {language === 'si' ? 'භාෂාව තෝරන්න' : language === 'ta' ? 'மொழியை தேர்வு செய்க' : 'Select Language'}
                  </div>
                  {languageOptions.map((opt) => {
                    const isSelected = opt.id === language;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setLanguage(opt.id);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                          isSelected ? 'font-bold text-blue-600 bg-blue-50/60' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{opt.flag}</span>
                          <span>{opt.nativeName}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Auth / Profile Button (At the very end / kelawaratama with Google Profile Icon) */}
            {user ? (
              <button
                onClick={onOpenProfile}
                className="relative px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50 hover:bg-blue-50/50 text-slate-900 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs group"
                title={user.name}
              >
                <div className="relative">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-300 shadow-2xs shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  {user.notifications && user.notifications.some((n) => !n.isRead) && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
                  )}
                </div>
                <span className="max-w-[110px] truncate">{user.name.split(' ')[0] || t.nav.myProfile}</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/40 text-slate-700 hover:text-blue-600 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.nav.signIn}</span>
              </button>
            )}
          </div>

          {/* Mobile Menu & Auth Quick Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={onOpenBooking}
              className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-xs active:scale-95"
            >
              {t.nav.bookNow}
            </button>

            {user ? (
              <button
                onClick={onOpenProfile}
                className="relative w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center bg-blue-600 text-white text-xs font-bold shadow-xs"
                title={user.name}
              >
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                {user.notifications && user.notifications.some((n) => !n.isRead) && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="p-1.5 text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-100"
              >
                <LogIn className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4">
          {/* Mobile Language Selector */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200">
            {languageOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setLanguage(opt.id)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-all ${
                  language === opt.id
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 font-semibold hover:bg-slate-200'
                }`}
              >
                <span>{opt.flag}</span>
                <span>{opt.nativeName}</span>
              </button>
            ))}
          </div>

          {user && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-300 shadow-2xs"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-900">{user.name}</p>
                  <p className="text-[11px] text-slate-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenProfile();
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs"
              >
                {t.nav.myProfile}
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2 font-semibold text-slate-800 text-sm">
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigateToStore(); }}
              className="text-left py-2.5 border-b border-slate-100 font-bold text-slate-900 flex items-center gap-2"
            >
              <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center">
                <ShoppingBag className="w-3 h-3 text-white" />
              </div>
              <span className="animate-sway-x text-blue-900">{t.nav.store}</span>
              <span className="relative flex h-2 w-2 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigateToTracker(); }}
              className="text-left py-2 border-b border-slate-100"
            >
              {t.nav.track}
            </button>
            <a
              href={`tel:${t.emergencyPhone}`}
              className="flex items-center gap-2 text-blue-600 py-2 font-bold"
            >
              <Phone className="w-4 h-4" />
              <span>{t.nav.emergency}: {t.emergencyPhone}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
