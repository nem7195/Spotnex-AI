import React, { useState } from 'react';
import SpotnexLogo from './SpotnexLogo';
import LegalShieldModal from './LegalShieldModal';
import { Info, AlertCircle } from 'lucide-react';

export default function AppHeader() {
  const [showLegal, setShowLegal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-white/10 px-3.5 py-2.5">
        <div className="flex items-center justify-between gap-2">
          
          {/* Logo */}
          <SpotnexLogo compact={true} size="small" />

          {/* Action Pills */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Active Ward Pill */}
            <div className="hidden xs:flex items-center gap-1 px-2 py-1 rounded-full bg-slate-900 border border-emerald-500/30 text-[10px] text-emerald-300 font-medium">
              <span>Bengaluru Ward</span>
              <span className="text-xs">🌱</span>
            </div>

            {/* Emergency Hotline Pill */}
            <a
              href="tel:112"
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-950/60 border border-red-500/40 text-[10px] font-bold text-red-300 hover:bg-red-900/60 transition"
              title="Call National Emergency 112"
            >
              <span>🚨 112</span>
            </a>

            {/* Info Button for Legal Shield */}
            <button
              onClick={() => setShowLegal(true)}
              className="p-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500 transition"
              title="Legal Shield & Statutory Powers"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {showLegal && <LegalShieldModal onClose={() => setShowLegal(false)} />}
    </>
  );
}
