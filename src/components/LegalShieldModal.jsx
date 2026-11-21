import React from 'react';
import { X, ShieldAlert, Scale, FileText, CheckCircle2 } from 'lucide-react';

export default function LegalShieldModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-emerald-500/40 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 text-xs">
        
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm text-white">Legal Shield &amp; Statutory Powers</h3>
              <p className="text-[10px] text-slate-400">Citizen Rights under Indian Jurisprudence</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-slate-300 leading-relaxed">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="font-bold text-emerald-400 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Section 133 CrPC (Public Nuisance &amp; Hazard)</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Empowers citizens and municipal magistrates to issue statutory conditional orders for immediate removal of any obstruction, exposed wire, or public hazard endangering human life.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="font-bold text-cyan-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Section 65B Indian Evidence Act Compliance</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Spotnex embeds hardware GPS coordinates, dual UTC/IST timestamps, and offscreen cryptographic checksums to ensure photos qualify as non-tampered judicial digital evidence.
            </p>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 text-[10px]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Complaints logged here are legally escalated directly to BBMP, BESCOM, and BWSSB nodal wings.</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs transition"
        >
          Understood &amp; Protected
        </button>

      </div>
    </div>
  );
}
