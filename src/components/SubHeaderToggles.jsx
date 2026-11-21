import React from 'react';
import { Smartphone, Monitor, User, ShieldAlert } from 'lucide-react';
import { getTranslation } from '../utils/i18n';

export default function SubHeaderToggles({ 
  viewMode, 
  onViewModeChange, 
  layoutMode, 
  onLayoutModeChange,
  currentLang = 'en'
}) {
  const t = (k) => getTranslation(k, currentLang);

  return (
    <div className="py-2.5 px-3 flex flex-wrap items-center justify-center gap-2.5">
      
      {/* 1. Centered Dark Obsidian Pill Toggle: (Citizen View | Officer Dashboard) */}
      <div className="bg-[#071713] p-1 rounded-full shadow-md border border-emerald-900/40 flex items-center gap-1">
        <button
          onClick={() => onViewModeChange('citizen')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold font-space transition-all duration-200 flex items-center gap-1.5 ${
            viewMode === 'citizen'
              ? 'bg-[#10b981] text-[#071713] shadow-sm font-extrabold'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>{t('citizen_view')}</span>
        </button>

        <button
          onClick={() => onViewModeChange('officer')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold font-space transition-all duration-200 flex items-center gap-1.5 ${
            viewMode === 'officer'
              ? 'bg-[#10b981] text-[#071713] shadow-sm font-extrabold'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{t('officer_dashboard')}</span>
        </button>
      </div>

      {/* 2. Light Pill Toggle: (Mobile App View | Responsive Web View) */}
      <div className="bg-white/90 p-1 rounded-full shadow-xs border border-emerald-200/80 flex items-center gap-1">
        <button
          onClick={() => onLayoutModeChange('mobile')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold font-space transition-all duration-200 flex items-center gap-1.5 ${
            layoutMode === 'mobile'
              ? 'bg-[#0b6e4f] text-white shadow-xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Simulate Mobile App Frame"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">{t('mobile_view')}</span>
          <span className="xs:hidden">Mobile</span>
        </button>

        <button
          onClick={() => onLayoutModeChange('web')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold font-space transition-all duration-200 flex items-center gap-1.5 ${
            layoutMode === 'web'
              ? 'bg-[#0b6e4f] text-white shadow-xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Full Responsive Web View"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">{t('web_view')}</span>
          <span className="xs:hidden">Web</span>
        </button>
      </div>

    </div>
  );
}
