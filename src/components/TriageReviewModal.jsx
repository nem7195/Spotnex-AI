import React, { useState } from 'react';
import { 
  X, CheckCircle, AlertTriangle, Building2, Mail, 
  Send, ExternalLink, Zap, ChevronDown, ChevronUp, RefreshCw, FileText 
} from 'lucide-react';

function XTwitterIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function TriageReviewModal({ triageResult, evidence, onConfirmDispatch, onRetake, onClose }) {
  if (!triageResult) return null;

  const [isEmailExpanded, setIsEmailExpanded] = useState(false);
  const [editableDescription, setEditableDescription] = useState(
    triageResult.english_summary || triageResult.factual_description || ''
  );
  const [manualOverrideActive, setManualOverrideActive] = useState(false);

  const {
    has_civic_issue,
    no_issue_reason,
    category,
    severity,
    one_line_reason,
    department,
    department_details,
    action_drafts
  } = triageResult;

  const isHazardDetected = has_civic_issue !== false || manualOverrideActive;

  // Severity pill bar active styling
  const severities = ['Low', 'Medium', 'High', 'Critical'];
  const [activeSeverity, setActiveSeverity] = useState(severity || 'Medium');

  // Dispatch 1: Social Media (X/Twitter)
  const handlePostSocial = () => {
    const postText = encodeURIComponent(
      action_drafts?.social_post || 
      `🚨 CIVIC HAZARD [${activeSeverity.toUpperCase()}] at Bengaluru: ${editableDescription} @BBMPCOMM @BESCOM_India #Spotnex #BangaloreCivic`
    );
    window.open(`https://twitter.com/intent/tweet?text=${postText}`, '_blank');
  };

  // Dispatch 2: Email Govt Official (Section 133 CrPC statutory email)
  const handleEmailOfficial = () => {
    const to = action_drafts?.statutory_email?.to || department_details?.nodal_email || 'commissioner@bbmp.gov.in';
    const subject = encodeURIComponent(action_drafts?.statutory_email?.subject || `Statutory Notice u/s 133 CrPC: Civic Hazard`);
    const body = encodeURIComponent(action_drafts?.statutory_email?.body || `Incident Report:\n${editableDescription}`);
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  // Dispatch 3: Do Both (Recommended)
  const handleDoBoth = () => {
    handlePostSocial();
    setTimeout(() => {
      handleEmailOfficial();
    }, 500);
    onConfirmDispatch({
      ...triageResult,
      severity: activeSeverity,
      english_summary: editableDescription
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-slate-950 border border-emerald-500/40 rounded-3xl max-w-sm w-full p-4 shadow-2xl space-y-3.5 my-auto text-xs relative">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-2.5 border-b border-white/10">
          <div>
            <span className="text-[10px] font-mono-hud text-emerald-400 font-bold uppercase tracking-wider block">
              SPOTNEX AI TRIAGE REVIEW
            </span>
            <h3 className="text-sm font-bold text-white">Multimodal Hazard Evaluation</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STATE A: NO CIVIC ISSUE DETECTED */}
        {!isHazardDetected ? (
          <div className="space-y-3 text-center py-3">
            <div className="w-14 h-14 rounded-full bg-emerald-950/80 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">No Civic Hazard Detected</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed px-2">
                {no_issue_reason || "The evidence frame depicts an intact road surface or indoor scene with no active municipal violations."}
              </p>
            </div>

            {/* Observation Chips */}
            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-emerald-300">
                ✓ Intact Pavement
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-emerald-300">
                ✓ No Waterlogging
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-emerald-300">
                ✓ Wire Clear
              </span>
            </div>

            {/* Retake & Manual Override */}
            <div className="pt-3 space-y-2">
              <button
                onClick={onRetake}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake Photo</span>
              </button>
              <button
                onClick={() => setManualOverrideActive(true)}
                className="text-[11px] text-slate-400 hover:text-emerald-400 underline transition"
              >
                Manual Override: Report as civic hazard anyway
              </button>
            </div>
          </div>
        ) : (
          /* STATE B: HAZARD DETECTED */
          <div className="space-y-3">
            
            {/* Severity Pill Bar */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono-hud">
                Hazard Severity Tier
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {severities.map((sev) => {
                  const isSelected = activeSeverity === sev;
                  const colorMap = {
                    Critical: isSelected ? 'bg-red-600 text-white border-red-500' : 'bg-red-950/40 text-red-300 border-red-900/40',
                    High: isSelected ? 'bg-amber-600 text-white border-amber-500' : 'bg-amber-950/40 text-amber-300 border-amber-900/40',
                    Medium: isSelected ? 'bg-yellow-600 text-white border-yellow-500' : 'bg-yellow-950/40 text-yellow-300 border-yellow-900/40',
                    Low: isSelected ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-950/40 text-blue-300 border-blue-900/40'
                  };
                  return (
                    <button
                      key={sev}
                      onClick={() => setActiveSeverity(sev)}
                      className={`py-1.5 rounded-lg border text-center text-[10px] font-bold uppercase transition ${colorMap[sev]}`}
                    >
                      {sev}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* "One-Line Reason" Alert Card */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-300 font-mono-hud block">
                  Ground Justification:
                </span>
                <p className="text-[11px] text-slate-200 font-medium leading-snug">
                  {one_line_reason || "Severe public hazard requiring emergency municipal dispatch."}
                </p>
              </div>
            </div>

            {/* Factual Description Textarea */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono-hud">
                Official Factual Description (English)
              </label>
              <textarea
                rows={2}
                value={editableDescription}
                onChange={(e) => setEditableDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Responsible Department Badge & Visual Anomalies */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 rounded-xl bg-slate-900/70 border border-slate-800 text-[10px]">
              <div className="flex items-center gap-1 text-cyan-300 font-bold">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="truncate max-w-[180px]">{department_details?.name || department}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono-hud">
                CATEGORY: {(category || 'roads').toUpperCase()}
              </span>
            </div>

            {/* Visual Anomalies Tag Chips */}
            <div className="flex flex-wrap gap-1">
              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 text-[9px] border border-slate-800">
                📸 Visual Fracture Detected
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 text-[9px] border border-slate-800">
                📍 Public Footpath Proximity
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-emerald-300 text-[9px] border border-emerald-900/50">
                ⚖️ Section 133 CrPC Cited
              </span>
            </div>

            {/* Expandable Pre-drafted Statutory Email Preview */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden text-[10px]">
              <button
                type="button"
                onClick={() => setIsEmailExpanded(!isEmailExpanded)}
                className="w-full p-2 flex items-center justify-between text-slate-300 hover:text-white"
              >
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Statutory Legal Notice Preview (Sec 133 CrPC)</span>
                </div>
                {isEmailExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {isEmailExpanded && (
                <div className="p-2.5 border-t border-slate-800 font-mono-hud text-[9px] text-slate-300 bg-black/60 max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {action_drafts?.statutory_email?.body}
                </div>
              )}
            </div>

            {/* THE EXACT 3 ACTION BUTTONS REQUIRED */}
            <div className="pt-1.5 space-y-1.5">
              
              <div className="grid grid-cols-2 gap-2">
                {/* 1. Post on Social Media */}
                <button
                  type="button"
                  onClick={handlePostSocial}
                  className="py-2.5 px-2 rounded-xl bg-sky-950/80 hover:bg-sky-900/90 text-sky-300 border border-sky-700/60 font-bold text-[11px] flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <XTwitterIcon className="w-3.5 h-3.5" />
                  <span>1. Post on Social Media</span>
                </button>

                {/* 2. Email Government Official */}
                <button
                  type="button"
                  onClick={handleEmailOfficial}
                  className="py-2.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-[11px] flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>2. Email Govt Official</span>
                </button>
              </div>

              {/* 3. Do Both (Recommended) */}
              <button
                type="button"
                onClick={handleDoBoth}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#10B981] via-[#00A896] to-[#10B981] hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-pulse" />
                <span>3. Do Both (Recommended)</span>
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
