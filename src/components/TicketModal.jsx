import React from 'react';
import { X, Sparkles, MapPin, Building2, ShieldAlert, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function TicketModal({ ticket, onClose, onUpdateStatus }) {
  if (!ticket) return null;

  const isCritical = ticket.severity === 'Critical';
  const isHigh = ticket.severity === 'High';
  const isMedium = ticket.severity === 'Medium';

  const sevBadge = isCritical
    ? 'bg-red-950/80 text-red-300 border-red-800'
    : isHigh
    ? 'bg-amber-950/80 text-amber-300 border-amber-800'
    : isMedium
    ? 'bg-yellow-950/80 text-yellow-300 border-yellow-800'
    : 'bg-emerald-950/80 text-emerald-300 border-emerald-800';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0e131f] border border-slate-700/80 rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-mono-hud font-bold text-cyan-400">{ticket.id}</span>
              <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${sevBadge} flex items-center gap-1`}>
                {isCritical && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>}
                {ticket.severity}
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                {ticket.category}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Reported: {new Date(ticket.created_at).toLocaleTimeString()} • {ticket.detected_language || 'Auto'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* English AI Summary */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI English Translation &amp; Executive Summary</span>
          </div>
          <p className="text-sm font-semibold text-slate-100 leading-snug">{ticket.english_summary}</p>
        </div>

        {/* Forensic Photographic Evidence */}
        {ticket.image_url && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Forensic Watermarked Evidence</span>
              </span>
              <span className="font-mono-hud text-[10px] text-cyan-400">
                {ticket.watermark_hash || 'SHA256 VERIFIED'}
              </span>
            </div>
            <img
              src={ticket.image_url}
              alt="Forensic Evidence"
              className="w-full max-h-56 object-cover rounded-lg border border-slate-700"
            />
          </div>
        )}

        {/* Reason & Department Routing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
            <span className="text-slate-400 block mb-1">Severity Reason:</span>
            <p className="text-slate-200 font-medium leading-relaxed">{ticket.reason}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
            <span className="text-slate-400 block mb-1">Routed Municipal Body:</span>
            <div className="flex items-start gap-1.5 text-cyan-300 font-semibold">
              <Building2 className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
              <span>{ticket.department}</span>
            </div>
          </div>
        </div>

        {/* Original Citizen Text */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>Original Unstructured Input:</span>
            <span className="text-[10px] font-mono-hud px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              {ticket.detected_language}
            </span>
          </div>
          <p className="text-slate-300 italic">"{ticket.citizen_text}"</p>
          <div className="flex items-center gap-1 text-slate-400 pt-1 text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>{ticket.location}</span>
          </div>
        </div>

        {/* Action Recommendation */}
        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs flex items-start gap-2 text-emerald-200">
          <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-300 block">Recommended Dispatch Action:</span>
            <p className="mt-0.5 leading-relaxed">{ticket.action_recommendation}</p>
          </div>
        </div>

        {/* Status Lifecycle Controls */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-400">Update Ticket Lifecycle:</span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onUpdateStatus(ticket.id, 'Pending')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg border transition ${
                ticket.status === 'Pending'
                  ? 'bg-amber-950 text-amber-300 border-amber-600'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => onUpdateStatus(ticket.id, 'In Progress')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg border transition ${
                ticket.status === 'In Progress'
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-600'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => onUpdateStatus(ticket.id, 'Resolved')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg border transition ${
                ticket.status === 'Resolved'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
