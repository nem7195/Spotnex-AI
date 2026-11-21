import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert, User, ShieldCheck, Settings, Info, Languages, LogIn, ChevronDown, Check, Building2, Train, Store } from 'lucide-react';
import { getTranslation } from '../utils/i18n';

export default function CivicLensNavbar({ 
  userRole, 
  onToggleUserRole, 
  onOpenLegal, 
  onOpenSettings, 
  currentLang, 
  onLanguageChange,
  currentUser = null,
  onOpenLogin = null,
  onLogoClick = null,
  onSelectAccount = null
}) {
  const isCitizen = userRole === 'citizen';
  const t = (k) => getTranslation(k, currentLang);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Quick-switch accounts
  const quickAccounts = [
    {
      id: 'resident',
      name: 'Rajesh Gowda',
      roleOrOrg: 'Resident • Ward 174 HSR Layout',
      mobile: '+91 98451 23456',
      email: 'rajesh.gowda@spotnex.gov.in',
      role: 'citizen',
      badge: 'Resident',
      icon: User
    },
    {
      id: 'rwa',
      name: 'Priya Sundaram',
      roleOrOrg: 'Secretary • Koramangala 4th Block RWA',
      mobile: '+91 98801 98765',
      email: 'priya.rwa@koramangala.org',
      role: 'citizen',
      badge: 'RWA Leader',
      icon: Building2
    },
    {
      id: 'commuter',
      name: 'Ramesh Kumar',
      roleOrOrg: 'Daily Commuter • Metro Purple Line',
      mobile: '+91 98451 12233',
      email: 'ramesh.commuter@gmail.com',
      role: 'citizen',
      badge: 'Commuter',
      icon: Train
    },
    {
      id: 'trader',
      name: 'Suresh M.',
      roleOrOrg: 'President • Commercial St Merchants',
      mobile: '+91 98440 55667',
      email: 'suresh.trader@bengaluru-trade.in',
      role: 'citizen',
      badge: 'Trader',
      icon: Store
    },
    {
      id: 'officer',
      name: 'Officer Sharma (BBMP)',
      roleOrOrg: 'Zonal Municipal Officer • BBMP East',
      mobile: '+91 80222 21188',
      email: 'officer.sharma@bbmp.gov.in',
      role: 'officer',
      badge: 'BBMP Nodal',
      icon: ShieldCheck
    }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleAccountClick = (acc) => {
    setIsDropdownOpen(false);
    if (onSelectAccount) {
      onSelectAccount(acc);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100/80 px-3 sm:px-4 py-2 shadow-xs">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Brand Logo with Click-to-Priority Redirect */}
        <div 
          onClick={onLogoClick}
          className="flex items-center cursor-pointer transition hover:opacity-95 active:scale-95 py-0.5" 
          title="SpotNex • Click to view Priority List"
        >
          <img 
            src="/spotnex-logo.png" 
            alt="SpotNex AI Civic Connect" 
            className="h-11 sm:h-13 md:h-14 w-auto object-contain drop-shadow-xs transition-transform hover:scale-105" 
          />
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

          {/* Top-Right Clickable Profile Pill with Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200 text-[#0b6e4f] text-xs font-bold transition shadow-2xs active:scale-95"
              title="Switch Account & Persona"
            >
              {isCitizen ? (
                <>
                  <User className="w-3.5 h-3.5 text-[#0b6e4f]" />
                  <span className="text-[11px] font-bold truncate max-w-[130px]">
                    {currentUser?.name || t('citizen_role')}
                  </span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] font-bold">Officer Sharma</span>
                </>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-emerald-100 shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-mono-hud font-bold text-slate-400 uppercase">
                    Switch Active Persona
                  </span>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {userRole === 'officer' ? 'Officer Mode' : 'Citizen Mode'}
                  </span>
                </div>

                <div className="py-1 max-h-64 overflow-y-auto">
                  {quickAccounts.map((acc) => {
                    const Icon = acc.icon;
                    const isActive = userRole === acc.role && (
                      acc.role === 'officer' || currentUser?.name === acc.name
                    );

                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleAccountClick(acc)}
                        className={`w-full px-3 py-2 text-left flex items-start gap-2.5 transition hover:bg-emerald-50/70 ${
                          isActive ? 'bg-emerald-50/90' : ''
                        }`}
                      >
                        <div className={`p-1.5 rounded-xl shrink-0 mt-0.5 ${
                          acc.role === 'officer' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-[#0b6e4f]'
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 font-space truncate text-xs">
                              {acc.name}
                            </span>
                            <span className="text-[9px] font-mono-hud font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {acc.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {acc.roleOrOrg}
                          </p>
                        </div>
                        {isActive && (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 self-center" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1.5 border-t border-slate-100 px-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      if (onOpenLogin) onOpenLogin();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-[#0b6e4f] font-bold text-xs font-space flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#0b6e4f]" />
                    <span>+ Switch / Add Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>

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
