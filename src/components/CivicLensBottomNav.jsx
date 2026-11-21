import React from 'react';
import { Newspaper, Flame, Camera, Map, CheckSquare } from 'lucide-react';
import { getTranslation } from '../utils/i18n';

export default function CivicLensBottomNav({ activeTab, onTabChange, currentLang = 'en' }) {
  const t = (k) => getTranslation(k, currentLang);

  return (
    <div className="sticky bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-emerald-100/90 py-1.5 px-3 flex justify-around items-center shadow-lg rounded-b-3xl">
      
      {/* 1. Feed */}
      <button
        onClick={() => onTabChange('feed')}
        className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-2xl transition ${
          activeTab === 'feed' ? 'text-[#0b6e4f] font-bold' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <Newspaper className="w-5 h-5" />
        <span className="text-[10px] font-space font-medium">{t('nav_feed')}</span>
      </button>

      {/* 2. Priority with RED NOTIFICATION DOT */}
      <button
        onClick={() => onTabChange('priority')}
        className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-2xl relative transition ${
          activeTab === 'priority' ? 'text-[#0b6e4f] font-bold' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <div className="relative">
          <Flame className="w-5 h-5" />
          {/* Red notification dot */}
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white ring-1 ring-red-400"></span>
        </div>
        <span className="text-[10px] font-space font-medium">{t('nav_priority')}</span>
      </button>

      {/* 3. LENS (Elevated circular green center camera button) */}
      <button
        onClick={() => onTabChange('lens')}
        title="Open CivicLens Camera"
        className="relative -translate-y-3 group focus:outline-none"
      >
        <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#0b6e4f] to-[#10b981] text-white ring-4 ring-emerald-400/30 flex items-center justify-center shadow-lg shadow-emerald-700/30 group-hover:scale-105 active:scale-95 transition-all">
          <Camera className="w-6 h-6 text-white" />
        </div>
        <span className="block text-center text-[9px] font-extrabold text-[#0b6e4f] mt-0.5 font-space tracking-wide">
          {t('nav_lens')}
        </span>
      </button>

      {/* 4. Live Map */}
      <button
        onClick={() => onTabChange('map')}
        className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-2xl transition ${
          activeTab === 'map' ? 'text-[#0b6e4f] font-bold' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <Map className="w-5 h-5" />
        <span className="text-[10px] font-space font-medium">{t('nav_map')}</span>
      </button>

      {/* 5. Tracker */}
      <button
        onClick={() => onTabChange('tracker')}
        className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-2xl transition ${
          activeTab === 'tracker' ? 'text-[#0b6e4f] font-bold' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <CheckSquare className="w-5 h-5" />
        <span className="text-[10px] font-space font-medium">{t('nav_tracker')}</span>
      </button>

    </div>
  );
}
