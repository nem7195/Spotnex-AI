import React from 'react';
import { ShieldAlert, User, ShieldCheck, Settings, Info, Languages, LogIn } from 'lucide-react';
import { getTranslation } from '../utils/i18n';
import SpotNexLogo from './SpotNexLogo';

export default function CivicLensNavbar({ 
  userRole, 
  onToggleUserRole, 
  onOpenLegal, 
  onOpenSettings, 
  currentLang, 
  onLanguageChange,
  currentUser = null,
  onOpenLogin = null
}) {
  const isCitizen = userRole === 'citizen';
  const t = (k) => getTranslation(k, currentLang);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100/80 px-3 sm:px-4 py-2.5 shadow-xs">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Brand & Subtitle with SpotNex SVG Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={onOpenLogin} title="SpotNex AI Civic Connect">
          <SpotNexLogo size={36} showText={true} />
        </div>

        {/* Center / Right: Regional Language Switcher Pill + Profile + Settings */}
        <div className="flex items-center flex-wrap gap-2">
          
          {/* Regional Language Switcher Pill (Default: English) */}
          <div className="flex items-center rounded-full bg-emerald-50/80 p-0.5 border border-emerald-200/90 text-[11px] font-bold font-space shadow-2xs">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 rounded-full transition ${
                currentLang === 'en'
                  ? 'bg-[#0b6e4f] text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-[#0b6e4f]'
              }`}
              title="English (Default)"
            >
              English
            </button>
            <button
              onClick={() => onLanguageChange('kn')}
              className={`px-2.5 py-1 rounded-full transition ${
                currentLang === 'kn'
                  ? 'bg-[#0b6e4f] text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-[#0b6e4f]'
              }`}
              title="ಕನ್ನಡ (Kannada)"
            >
              ಕನ್ನಡ
            </button>
            <button
              onClick={() => onLanguageChange('hi')}
              className={`px-2.5 py-1 rounded-full transition ${
                currentLang === 'hi'
                  ? 'bg-[#0b6e4f] text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-[#0b6e4f]'
              }`}
              title="हिन्दी (Hindi)"
            >
              हिन्दी
            </button>
          </div>

          {/* Profile Switcher Pill */}
          <button
            onClick={onToggleUserRole}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-[#0b6e4f] text-xs font-bold transition shadow-2xs active:scale-95"
            title="Switch User Persona (Citizen / Officer)"
          >
            {isCitizen ? (
              <>
                <User className="w-3.5 h-3.5 text-[#0b6e4f]" />
                <span className="text-[11px] font-semibold">{currentUser?.name || t('citizen_role')}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-semibold">{t('officer_role')}</span>
              </>
            )}
          </button>

          {/* Account Login / Profile Switcher button */}
          {onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="p-2 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-[#0b6e4f] transition"
              title="Account Profiles & Onboarding"
            >
              <LogIn className="w-4 h-4" />
            </button>
          )}

          {/* Info Icon (Legal Shield) */}
          <button
            onClick={onOpenLegal}
            className="p-2 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-[#0b6e4f] transition"
            title="Legal Shield & Sec 133 CrPC Statutory Info"
          >
            <Info className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
}
