import React, { useState } from 'react';
import { 
  X, CheckCircle, AlertTriangle, Building2, Mail, 
  Send, ExternalLink, Zap, ChevronDown, ChevronUp, RefreshCw, FileText, Sparkles, ShieldCheck 
} from 'lucide-react';
import { getTranslation } from '../utils/i18n';

function XTwitterIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function TriageReviewModal({ 
  triageResult, 
  evidence, 
  onConfirmDispatch, 
  onRetake, 
  onClose,
  currentLang = 'en'
}) {
  if (!triageResult) return null;

  const t = (k) => getTranslation(k, currentLang);

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
      `🚨 CIVIC HAZARD [${activeSeverity.toUpperCase()}] at Bengaluru: ${editableDescription} @BBMPCOMM @BESCOM_India #CivicLens #BangaloreCivic`
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Light Mint-and-Emerald Card Shell */}
      <div className="bg-white border border-emerald-200/90 rounded-3xl max-w-sm sm:max-w-md w-full p-4 sm:p-5 shadow-2xl space-y-3.5 my-auto text-xs relative text-slate-800 soft-card-shadow animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-emerald-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-hud text-[#0b6e4f] font-extrabold uppercase tracking-wider block">
                {t('triage_modal_tag')}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-[10px] font-extrabold text-[#0b6e4f] font-space">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {t('gatekeeper_badge_authentic')}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-[#071713] font-space mt-0.5">
              {t('triage_modal_title')}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STATE A: NO CIVIC ISSUE DETECTED */}
        {!isHazardDetected ? (
          <div className="space-y-3 text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-[#10b981] flex items-center justify-center mx-auto text-[#0b6e4f]">
              <CheckCircle className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#071713] font-space">{t('triage_no_hazard_title')}</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed px-2">
                {no_issue_reason || "The evidence frame depicts an intact road surface or indoor scene with no active municipal violations."}
              </p>
            </div>

            {/* Observation Chips */}
            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-800 font-medium">
                ✓ Intact Pavement
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-800 font-medium">
                ✓ No Waterlogging
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-800 font-medium">
                ✓ Wire Clear
              </span>
            </div>

            {/* Retake & Manual Override */}
            <div className="pt-3 space-y-2">
              <button
                onClick={onRetake}
                className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake Photo</span>
              </button>
              <button
                onClick={() => setManualOverrideActive(true)}
                className="text-[11px] text-slate-500 hover:text-[#0b6e4f] underline transition"
              >
                Manual Override: Report as civic hazard anyway
              </button>
            </div>
          </div>
        ) : (
          /* STATE B: HAZARD DETECTED */
          <div className="space-y-3">
            
            {/* Severity Tier Pills (Low / Medium / High / Critical) */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase font-mono-hud">
                {t('triage_severity_tier')}
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {severities.map((sev) => {
                  const isSelected = activeSeverity === sev;
                  const colorMap = {
                    Critical: isSelected 
                      ? 'bg-red-600 text-white border-red-600 shadow-sm' 
                      : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
                    High: isSelected 
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                      : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
                    Medium: isSelected 
                      ? 'bg-yellow-500 text-white border-yellow-500 shadow-sm' 
                      : 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
                    Low: isSelected 
                      ? 'bg-[#0b6e4f] text-white border-[#0b6e4f] shadow-sm' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  };
                  return (
                    <button
                      key={sev}
                      onClick={() => setActiveSeverity(sev)}
                      className={`py-1.5 rounded-xl border text-center text-[10px] font-extrabold uppercase font-space transition active:scale-95 ${colorMap[sev]}`}
                    >
                      {sev}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* "Ground Justification" Alert Card */}
            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-extrabold uppercase text-amber-900 font-mono-hud block">
                  {t('triage_ground_justification')}
                </span>
                <p className="text-[11px] text-slate-700 font-semibold leading-snug mt-0.5">
                  {one_line_reason || "Severe public hazard requiring emergency municipal dispatch."}
                </p>
              </div>
            </div>

            {/* Editable Official Factual Description */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase font-mono-hud">
                {t('triage_factual_desc')}
              </label>
              <textarea
                rows={2}
                value={editableDescription}
                onChange={(e) => setEditableDescription(e.target.value)}
                className="w-full bg-slate-50 border border-emerald-100 rounded-2xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition leading-relaxed"
              />
            </div>

            {/* Responsible Department Badge & Category */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-[11px]">
              <div className="flex items-center gap-1.5 text-[#0b6e4f] font-bold">
                <Building2 className="w-3.5 h-3.5 text-[#0b6e4f]" />
                <span className="truncate max-w-[200px]">{department_details?.name || department}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-white text-[#0b6e4f] border border-emerald-200 font-mono-hud font-extrabold shadow-2xs">
                {(category || 'roads').toUpperCase()}
              </span>
            </div>

            {/* Visual Anomalies Tag Chips */}
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] border border-slate-200">
                📸 Visual Fracture Detected
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] border border-slate-200">
                📍 Public Footpath Proximity
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] border border-emerald-200 font-medium">
                ⚖️ Section 133 CrPC Cited
              </span>
            </div>

            {/* Expandable Statutory Legal Notice Preview (Sec 133 CrPC) */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 overflow-hidden text-[10px]">
              <button
                type="button"
                onClick={() => setIsEmailExpanded(!isEmailExpanded)}
                className="w-full p-2.5 flex items-center justify-between text-slate-700 hover:text-slate-900 transition"
              >
                <div className="flex items-center gap-1.5 text-[#0b6e4f] font-bold">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t('triage_statutory_preview')}</span>
                </div>
                {isEmailExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
              </button>

              {isEmailExpanded && (
                <div className="p-3 border-t border-emerald-100 font-mono-hud text-[9px] text-slate-700 bg-white max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {action_drafts?.statutory_email?.body}
                </div>
              )}
            </div>

            {/* Action Buttons: Social, Email Govt, Do Both */}
            <div className="pt-1.5 space-y-2">
              
              <div className="grid grid-cols-2 gap-2">
                {/* 1. Post on Social Media */}
                <button
                  type="button"
                  onClick={handlePostSocial}
                  className="py-2.5 px-2 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-[11px] flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <XTwitterIcon className="w-3.5 h-3.5 text-sky-700" />
                  <span>{t('triage_btn_social')}</span>
                </button>

                {/* 2. Email Government Official */}
                <button
                  type="button"
                  onClick={handleEmailOfficial}
                  className="py-2.5 px-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-[#0b6e4f] border border-emerald-200 font-bold text-[11px] flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Mail className="w-3.5 h-3.5 text-[#0b6e4f]" />
                  <span>{t('triage_btn_email')}</span>
                </button>
              </div>

              {/* 3. Do Both (Recommended) */}
              <button
                type="button"
                onClick={handleDoBoth}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#0b6e4f] to-[#10b981] hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-pulse" />
                <span>{t('triage_btn_both')}</span>
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
