'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Phone, Mail, MapPin, AlertTriangle } from 'lucide-react';

interface FooterProps {
  onNavigateToServices?: () => void;
  onNavigateToTrust?: () => void;
  onNavigateToTracker?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateToServices,
  onNavigateToTrust,
  onNavigateToTracker
}) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* 1990 Emergency Alert Banner */}
      <div className="bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{t.footer.emergencyBanner}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-white p-0.5 border border-slate-700 shrink-0">
                <img
                  src="/logo.png"
                  alt="Prime Life Care Logo"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <span className="text-xl font-black text-white tracking-tight">PRIME LIFE <span className="text-blue-400">CARE</span></span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {t.footer.aboutText}
            </p>
            <div className="pt-2 text-xs text-blue-400 font-semibold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{t.footer.locations}</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  {t.nav.home}
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateToServices}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  {t.nav.services}
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateToTrust}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  {t.nav.whyUs}
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateToTracker}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  {t.nav.track}
                </button>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Care Specializations List - Pure Localized */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              {t.footer.specializationsTitle}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {t.footer.specializations.map((spec, i) => (
                <li key={i}>• {spec}</li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Hotlines */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              {t.footer.contactTitle}
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-slate-400">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t.footer.officeLabel} <strong className="text-white">{t.phone}</strong></span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t.footer.carelineLabel} <strong className="text-white">{t.emergencyPhone}</strong></span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>care@primelifecare.lk</span>
              </p>
              <p className="text-xs text-slate-500 pt-2">
                {t.footer.registeredNotice}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{t.footer.copyright}</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy-policy" className="hover:text-blue-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-blue-400 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy-policy#delete-account" className="hover:text-blue-400 transition-colors">
              Data Deletion Request
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
