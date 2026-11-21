import React, { useState } from 'react';
import { 
  X, Sparkles, Building2, Phone, Mail, Share2, Send, 
  CheckCircle, AlertTriangle, ShieldCheck, Languages, ArrowRight, ExternalLink
} from 'lucide-react';

function XTwitterIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function CitizenReviewModal({ triageResult, originalInput, evidence, onConfirmDispatch, onClose }) {
  if (!triageResult) return null;

  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'email' | 'social'

  const {
    has_civic_issue,
    no_issue_reason,
    category,
    severity,
    one_line_reason,
    detected_language,
    english_summary,
    department,
    department_details,
    action_drafts
  } = triageResult;

  // Severity Badges: Critical (red-pulse), High (amber), Medium (yellow), Low (blue)
  const severityConfig = {
    Critical: {
      badge: 'bg-red-950/80 text-red-300 border-red-700/80 ring-1 ring-red-500/50',
      pulse: true,
      color: 'text-red-400'
    },
    High: {
      badge: 'bg-amber-950/80 text-amber-300 border-amber-700/80 ring-1 ring-amber-500/50',
      pulse: false,
      color: 'text-amber-400'
    },
    Medium: {
      badge: 'bg-yellow-950/80 text-yellow-300 border-yellow-700/80 ring-1 ring-yellow-500/50',
      pulse: false,
      color: 'text-yellow-400'
    },
    Low: {
      badge: 'bg-blue-950/80 text-blue-300 border-blue-700/80 ring-1 ring-blue-500/50',
      pulse: false,
      color: 'text-blue-400'
    }
  };

  const currentSev = severityConfig[severity] || severityConfig.Medium;

  // Dispatch Option 1: Post on Social Media (X Intent)
  const handleSocialPost = () => {
    const text = encodeURIComponent(action_drafts?.social_post || `Civic issue reported: ${english_summary} #CivicLens #BBMP`);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(twitterUrl, '_blank');
  };

  // Dispatch Option 2: Email Government Official (mailto:)
  const handleEmailOfficial = () => {
    const email = action_drafts?.statutory_email?.to || department_details?.nodal_email || 'commissioner@bbmp.gov.in';
    const subject = encodeURIComponent(action_drafts?.statutory_email?.subject || 'Statutory Notice u/s 133 CrPC');
    const body = encodeURIComponent(action_drafts?.statutory_email?.body || `Incident: ${english_summary}`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  // Dispatch Option 3: Do Both (Recommended)
  const handleDoBoth = () => {
    handleSocialPost();
    setTimeout(() => {
      handleEmailOfficial();
    }, 500);
    onConfirmDispatch(triageResult);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0e131f] border border-cyan-500/30 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto relative overflow-hidden">
        
        {/* Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500"></div>

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>AI Multimodal Triage Assessment</span>
              </span>
              <span className="text-[10px] uppercase font-mono-hud px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                GEMINI VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Review AI categorization, legal statutory notices &amp; dispatch options before submission.
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If NO Civic Defect Detected */}
        {has_civic_issue === false ? (
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-600 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Civic Hazard Detected</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
              {no_issue_reason || "The uploaded description and photo depict an intact public facility or normal scene with no immediate municipal violation."}
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition"
            >
              Close &amp; Modify Report
            </button>
          </div>
        ) : (
          /* Normal Actionable Hazard Assessment */
          <div className="space-y-4">
            
            {/* Top Badges Row: Category + Department Routing Pill + Severity */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              
              <div className="flex flex-wrap items-center gap-2">
                {/* Detected Category Badge */}
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-cyan-300 border border-slate-700 flex items-center gap-1.5">
                  <span className="capitalize">{category}</span>
                </span>

                {/* Severity Badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 ${currentSev.badge}`}>
                  {currentSev.pulse && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>}
                  <span>{severity} Severity</span>
                </span>
              </div>

              {/* Department Routing Pill with Helpline */}
              <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold">{department_details?.name || department}</span>
                {department_details?.helpline && (
                  <span className="text-[10px] text-cyan-400 font-mono-hud ml-1 border-l border-slate-700 pl-1.5">
                    📞 {department_details.helpline}
                  </span>
                )}
              </div>

            </div>

            {/* "Why this Severity?" Card showing exact One-Line Reason */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Why this Severity?</span>
              </span>
              <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-snug">
                {one_line_reason}
              </p>
            </div>

            {/* English Translation Card (if original text was in regional language) */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-cyan-400 flex items-center gap-1">
                  <Languages className="w-3.5 h-3.5" />
                  <span>English Translation &amp; Standardized Summary</span>
                </span>
                <span className="text-[10px] font-mono-hud px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                  Detected: {detected_language}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                {english_summary}
              </p>
              {originalInput && originalInput !== english_summary && (
                <div className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/80">
                  Raw input: "{originalInput}"
                </div>
              )}
            </div>

            {/* Tab navigation for Pre-drafted Actions */}
            <div className="flex items-center gap-2 border-b border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('summary')}
                className={`pb-2 px-1 font-semibold transition border-b-2 ${
                  activeTab === 'summary' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Evidence Preview
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`pb-2 px-1 font-semibold transition border-b-2 ${
                  activeTab === 'email' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Section 133 CrPC Notice
              </button>
              <button
                onClick={() => setActiveTab('social')}
                className={`pb-2 px-1 font-semibold transition border-b-2 ${
                  activeTab === 'social' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                X/Twitter Draft
              </button>
            </div>

            {/* Tab 1: Evidence & Image */}
            {activeTab === 'summary' && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                {evidence?.dataUrl ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Tamper-Sealed Forensic Evidence</span>
                      </span>
                      <span className="font-mono-hud text-[10px] text-cyan-400">{evidence.hash}</span>
                    </div>
                    <img
                      src={evidence.dataUrl}
                      alt="Evidence"
                      className="w-full max-h-48 object-cover rounded-lg border border-slate-700"
                    />
                  </div>
                ) : (
                  <div className="text-slate-400 text-xs py-2">
                    Text-only grievance filed without photographic evidence. Ready for direct municipal queue.
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Statutory Email Draft */}
            {activeTab === 'email' && (
              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>To: <strong className="text-cyan-300">{action_drafts?.statutory_email?.to}</strong></span>
                  <span className="text-amber-400 font-bold">Sec 133 CrPC</span>
                </div>
                <div className="font-mono-hud text-[11px] text-slate-300 p-2 rounded bg-black/50 border border-slate-800/80 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {action_drafts?.statutory_email?.body}
                </div>
              </div>
            )}

            {/* Tab 3: Social Media Draft */}
            {activeTab === 'social' && (
              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] text-sky-400 font-semibold">
                  <XTwitterIcon className="w-3.5 h-3.5" />
                  <span>Public Accountability Broadcast on X:</span>
                </div>
                <div className="font-mono-hud text-xs text-slate-200 p-2.5 rounded bg-black/50 border border-slate-800/80 leading-relaxed">
                  {action_drafts?.social_post}
                </div>
              </div>
            )}

            {/* 3 DISPATCH OPTIONS REQUIRED */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                Choose Dispatch Protocol:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                
                {/* Option 1: Post on Social Media */}
                <button
                  onClick={handleSocialPost}
                  className="py-2.5 px-3 rounded-xl bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-800/60 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <XTwitterIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Post on Social Media</span>
                </button>

                {/* Option 2: Email Government Official */}
                <button
                  onClick={handleEmailOfficial}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span>Email Govt Official</span>
                </button>

                {/* Option 3: Do Both (Recommended) */}
                <button
                  onClick={handleDoBoth}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-emerald-600 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Do Both (Recommended)</span>
                </button>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
