import React from 'react';
import { ShieldAlert, Users, LayoutDashboard, RotateCcw } from 'lucide-react';

export default function Header({ currentRole, onRoleChange, onResetDemo }) {
  return (
    <header className="sticky top-0 z-40 bg-[#0e131f]/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Brand & City Badge */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/10 shrink-0">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-white">
                  Civic<span className="text-cyan-400">Lens</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono-hud">
                  AI TRIAGE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none mt-0.5 hidden xs:block">
                Automated Municipal Grievance Routing
              </p>
            </div>
          </div>

          {/* Active City Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Bengaluru Municipal Corporation (BBMP / BESCOM / BWSSB)</span>
          </div>
        </div>

        {/* Top Bar Role Toggle & Demo Reset */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
          
          {/* Active City Badge for Mobile View */}
          <div className="lg:hidden flex items-center gap-1 text-[10px] text-slate-400 bg-slate-900/60 px-2 py-1 rounded-md border border-slate-800 truncate max-w-[150px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="truncate">BBMP • BESCOM • BWSSB</span>
          </div>

          {/* Role Toggle Switcher */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shrink-0">
            <button
              onClick={() => onRoleChange('citizen')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                currentRole === 'citizen'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Citizen Mode</span>
            </button>
            <button
              onClick={() => onRoleChange('officer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                currentRole === 'officer'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Officer Dashboard</span>
            </button>
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={onResetDemo}
            title="Reset to 3 demo tickets"
            className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-400 hover:text-white transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
}
