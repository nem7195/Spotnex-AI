import React from 'react';
import { UserCheck, Award, ShieldCheck, MapPin, RotateCcw, CheckCircle2, ChevronRight } from 'lucide-react';

export default function CitizenProfile({ onResetDemo }) {
  return (
    <div className="space-y-4 pb-20 text-xs">
      
      {/* Profile Card */}
      <div className="p-4 rounded-3xl bg-slate-950/85 backdrop-blur-xl border border-emerald-500/40 text-white space-y-3 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#F0533A] via-[#10B981] to-[#00A896] p-0.5 shadow-lg">
            <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center font-space text-lg font-bold text-white">
              RG
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-white">Rajesh Gowda</h3>
              <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono-hud">Citizen Warden • ID: BLR-8842</p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-0.5">
              <MapPin className="w-3 h-3 text-[#F0533A]" />
              <span>Indiranagar Ward 174, Bengaluru</span>
            </div>
          </div>
        </div>

        {/* Civic Karma Score Bar */}
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-white flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-yellow-400" />
              <span>Civic Karma Score</span>
            </span>
            <span className="font-mono-hud font-bold text-emerald-400 text-xs">480 PTS (Level 4)</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-[#F0533A] via-[#10B981] to-[#00A896] h-full rounded-full w-[78%]"></div>
          </div>
          <span className="text-[9px] text-slate-400 block text-right font-mono-hud">
            20 pts to Level 5 Civic Sentinel
          </span>
        </div>
      </div>

      {/* Citizen Impact Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
          <div className="font-mono-hud font-bold text-base text-white">12</div>
          <div className="text-[10px] text-slate-400">Filed Hazards</div>
        </div>
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
          <div className="font-mono-hud font-bold text-base text-emerald-400">9</div>
          <div className="text-[10px] text-slate-400">Rectified</div>
        </div>
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
          <div className="font-mono-hud font-bold text-base text-cyan-400">38</div>
          <div className="text-[10px] text-slate-400">Verifications</div>
        </div>
      </div>

      {/* Badges Earned */}
      <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-2.5">
        <span className="font-bold text-white text-xs block font-space">
          Statutory Badges &amp; Credentials
        </span>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-base">🛡️</span>
              <div>
                <span className="font-bold text-white block text-[11px]">Section 133 CrPC First Responder</span>
                <span className="text-[9px] text-slate-400">Logged 3+ life-safety hazards leading to rapid escalation</span>
              </div>
            </div>
            <span className="text-[9px] font-mono-hud text-emerald-400">ACTIVE</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-base">📸</span>
              <div>
                <span className="font-bold text-white block text-[11px]">Forensic Ground Verifier</span>
                <span className="text-[9px] text-slate-400">Confirmed 10+ eyewitness reports with GPS lock</span>
              </div>
            </div>
            <span className="text-[9px] font-mono-hud text-cyan-400">VERIFIED</span>
          </div>
        </div>
      </div>

      {/* Demo Reset Trigger */}
      <div className="pt-2 text-center">
        <button
          onClick={onResetDemo}
          className="text-[11px] text-slate-400 hover:text-red-400 flex items-center justify-center gap-1 mx-auto py-2 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Spotnex Seed Database</span>
        </button>
      </div>

    </div>
  );
}
