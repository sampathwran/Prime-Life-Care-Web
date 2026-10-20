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
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">PRIME LIFE</span>
                <span className="text-xl sm:text-2xl font-black text-blue-600">CARE</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-700">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              {t.nav.home}
            </button>
            <button
              onClick={onNavigateToStore}
              className="hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1.5 text-slate-900 font-bold"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.nav.store}</span>
            </button>
            <button
              onClick={onNavigateToTracker}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              {t.nav.track}
            </button>
          </nav>

          {/* Right Actions: Interactive Language Dropdown, Profile / Auth & Book CTA */}
          <div className="hidden sm:flex items-center gap-3">
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

            {/* Auth / Profile Button */}
            {user ? (
              <button
                onClick={onOpenProfile}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-900 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0)}
                </div>
                <span className="max-w-[100px] truncate">{t.nav.myProfile}</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.nav.signIn}</span>
              </button>
            )}

            {/* Book Now Button */}
            <button
              onClick={onOpenBooking}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>{t.nav.bookNow}</span>
            </button>
          </div>

          {/* Mobile Menu & Auth Quick Button */}
          <div className="flex items-center gap-2 sm:hidden">
            {user ? (
              <button
                onClick={onOpenProfile}
                className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold"
              >
                {user.name.charAt(0)}
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="p-2 text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <LogIn className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={onOpenBooking}
              className="bg-blue-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold"
            >
              {t.nav.bookNow}
            </button>
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
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">{user.name}</p>
                <p className="text-[11px] text-slate-500">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenProfile();
                }}
                className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold"
              >
                {t.nav.myProfile}
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2 font-semibold text-slate-800 text-sm">
            <button
              onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="text-left py-2 border-b border-slate-100"
            >
              {t.nav.home}
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigateToStore(); }}
              className="text-left py-2 border-b border-slate-100 font-bold text-slate-900 flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              <span>{t.nav.store}</span>
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
