import React from 'react';
import { ShieldAlert, User, ShieldCheck, Settings, Info } from 'lucide-react';

export default function CivicLensNavbar({ userRole, onToggleUserRole, onOpenLegal, onOpenSettings }) {
  const isCitizen = userRole === 'citizen';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100/80 px-4 py-2.5 shadow-xs">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#0b6e4f] to-[#10b981] flex items-center justify-center shadow-md shadow-emerald-700/20 text-white">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-lg font-black tracking-tight text-[#071713] font-space">
                Civic<span className="text-[#0b6e4f]">Lens</span>
              </span>
            </div>
            <span className="text-[9px] font-extrabold uppercase font-mono-hud text-[#0b6e4f] tracking-widest block mt-0.5">
              AI CIVIC TRIAGE
            </span>
          </div>
        </div>

        {/* Right Controls: Profile Switcher Pill, Settings, Info */}
        <div className="flex items-center gap-2">
          
          {/* Profile Switcher Pill */}
          <button
            onClick={onToggleUserRole}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-[#0b6e4f] text-xs font-bold transition shadow-xs active:scale-95"
            title="Switch User Persona"
          >
            {isCitizen ? (
              <>
                <User className="w-3.5 h-3.5 text-[#0b6e4f]" />
                <span className="text-[11px]">Citizen Rajesh G.</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px]">Officer Sharma (BBMP)</span>
              </>
            )}
          </button>

          {/* Settings Icon */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 transition"
            title="Settings & System Diagnostics"
          >
            <Settings className="w-4 h-4" />
          </button>

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
