import React, { useState } from 'react';
import { Search, CheckCircle2, Clock, ShieldAlert, ArrowRight, RotateCcw, Building2 } from 'lucide-react';
import { getTranslation } from '../utils/i18n';

export default function CivicTrackerView({ tickets, onResetDemo, currentLang = 'en' }) {
  const [searchId, setSearchId] = useState('');
  const t = (k) => getTranslation(k, currentLang);

  const selectedTicket = searchId.trim()
    ? tickets.find(tkt => tkt.id.toLowerCase().includes(searchId.toLowerCase().trim())) || tickets[0]
    : tickets[0];

  const milestones = [
    { title: 'Grievance Filed & Authenticated', desc: 'Hardware GPS sensor & camera timestamp locked', done: true },
    { title: 'AI Triage & Statutory Evaluation', desc: 'Section 133 CrPC citation generated with severity tier', done: true },
    { title: 'Routed to Nodal Department', desc: `Assigned to ${selectedTicket?.department || 'BBMP'}`, done: true },
    { title: 'Field Crew Dispatched', desc: 'Rapid response beat team mobilized on ground', done: selectedTicket?.status === 'In Progress' || selectedTicket?.status === 'Resolved' },
    { title: 'Defect Abated & Public Verified', desc: 'Ground verification by ward citizens confirmed', done: selectedTicket?.status === 'Resolved' }
  ];

  return (
    <div className="space-y-4 pb-20 text-xs">
      
      {/* Tracker Search Header */}
      <div className="p-4 rounded-3xl bg-white border border-emerald-100/90 soft-card-shadow space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#071713] font-space">
            {t('tracker_title')}
          </h2>
          <span className="font-mono-hud text-[10px] text-[#0b6e4f] font-bold">
            LIVE ESCALATION AUDIT
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder={t('tracker_search_placeholder')}
            className="w-full bg-slate-50 border border-emerald-100 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0b6e4f]"
          />
        </div>
      </div>

      {/* Selected Ticket Status Card */}
      {selectedTicket && (
        <div className="p-4 rounded-3xl bg-white border border-emerald-100/90 soft-card-shadow space-y-4">
          
          {/* Header */}
          <div className="flex items-start justify-between pb-2.5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono-hud font-bold text-sm text-[#0b6e4f]">#{selectedTicket.id}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-space ${
                  selectedTicket.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {selectedTicket.severity}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 font-space line-clamp-1">{selectedTicket.english_summary}</p>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#071713] text-[#10b981] font-mono-hud">
              {selectedTicket.status}
            </span>
          </div>

          {/* Stepper Milestones */}
          <div className="space-y-3 pl-2">
            {milestones.map((m, idx) => (
              <div key={idx} className="flex items-start gap-3 relative">
                {idx < milestones.length - 1 && (
                  <div className={`absolute left-2.5 top-5 w-0.5 h-7 ${m.done ? 'bg-[#10b981]' : 'bg-slate-200'}`}></div>
                )}
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 ${
                  m.done ? 'bg-[#0b6e4f] text-white shadow-xs' : 'bg-slate-100 text-slate-400 border border-slate-300'
                }`}>
                  {m.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                </div>
                <div>
                  <h4 className={`text-xs font-bold font-space ${m.done ? 'text-slate-900' : 'text-slate-400'}`}>
                    {m.title}
                  </h4>
                  <p className="text-[10px] text-slate-500">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Department Detail */}
          <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-[#0b6e4f] font-semibold">
              <Building2 className="w-4 h-4 shrink-0" />
              <span>{selectedTicket.department}</span>
            </div>
            <span className="text-[10px] text-emerald-800 font-mono-hud font-bold">SLA ACTIVE</span>
          </div>

        </div>
      )}

      {/* Demo Reset Button */}
      <div className="text-center pt-2">
        <button
          onClick={onResetDemo}
          className="text-xs text-slate-400 hover:text-red-500 font-medium flex items-center justify-center gap-1 mx-auto py-2 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>

    </div>
  );
}
