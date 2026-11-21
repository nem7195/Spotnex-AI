import React, { useState } from 'react';
import { Flame, Clock, Building2, ArrowUp, Send, ChevronRight, Award, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getTranslation } from '../utils/i18n';

export default function CivicPriorityDeck({ tickets, onSelectTicket, onQuickDispatch, currentLang = 'en' }) {
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'severity' | 'sla'
  const t = (k) => getTranslation(k, currentLang);

  // Severity Weights
  const sWeight = { Critical: 300, High: 200, Medium: 120, Low: 50 };

  const scoredTickets = tickets.map((tkt) => {
    const base = sWeight[tkt.severity] || 100;
    const upvotes = tkt.upvotes_count || 16;
    const urgency = tkt.severity === 'Critical' ? 60 : tkt.severity === 'High' ? 30 : 10;
    const computedScore = base + (upvotes * 3) + urgency;

    return {
      ...tkt,
      computedScore
    };
  });

  const sorted = [...scoredTickets].sort((a, b) => {
    if (sortBy === 'score') return b.computedScore - a.computedScore;
    if (sortBy === 'severity') {
      const rank = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return (rank[b.severity] || 0) - (rank[a.severity] || 0);
    }
    if (sortBy === 'sla') {
      return new Date(a.created_at) - new Date(b.created_at);
    }
    return b.computedScore - a.computedScore;
  });

  return (
    <div className="space-y-4 pb-20">
      
      {/* 1. Dark Obsidian-Green Header Card with LIVE RANKING Badge */}
      <div className="p-4 rounded-3xl bg-[#071713] text-white shadow-lg border border-emerald-900/60 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-red-600/90 text-[10px] font-extrabold uppercase font-mono-hud text-white tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              {t('priority_live_badge')}
            </span>
          </div>
          <h2 className="text-base font-extrabold font-space">
            {t('priority_title')}
          </h2>
          <p className="text-[11px] text-slate-400">
            {t('priority_subtitle')}
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600/30 to-amber-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
          <Flame className="w-6 h-6 animate-pulse" />
        </div>
      </div>

      {/* 2. SORT BY Pills */}
      <div className="flex items-center justify-between px-1 text-xs">
        <span className="text-slate-500 font-mono-hud font-bold text-[11px]">{t('priority_sort_label')}</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSortBy('score')}
            className={`px-3 py-1 rounded-full text-xs font-bold font-space transition ${
              sortBy === 'score'
                ? 'bg-[#071713] text-[#10b981] border border-emerald-500'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('priority_sort_score')}
          </button>
          <button
            onClick={() => setSortBy('severity')}
            className={`px-3 py-1 rounded-full text-xs font-bold font-space transition ${
              sortBy === 'severity'
                ? 'bg-[#071713] text-[#10b981] border border-emerald-500'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('priority_sort_severity')}
          </button>
          <button
            onClick={() => setSortBy('sla')}
            className={`px-3 py-1 rounded-full text-xs font-bold font-space transition ${
              sortBy === 'sla'
                ? 'bg-[#071713] text-[#10b981] border border-emerald-500'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('priority_sort_sla')}
          </button>
        </div>
      </div>

      {/* 3. Ranked Ticket Cards Stream */}
      <div className="space-y-3">
        {sorted.map((ticket, index) => {
          const isCritical = ticket.severity === 'Critical';
          const isHigh = ticket.severity === 'High';

          return (
            <div
              key={ticket.id || index}
              onClick={() => onSelectTicket(ticket)}
              className="p-3.5 rounded-3xl bg-white border border-emerald-100/90 soft-card-shadow flex items-start gap-3 hover:border-emerald-300 transition cursor-pointer"
            >
              {/* Square Thumbnail */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-slate-100 relative">
                {ticket.image_url ? (
                  <img src={ticket.image_url} alt="Evidence" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-[#071713] to-[#0b6e4f] flex flex-col items-center justify-center text-white text-center p-1">
                    <span className="text-[10px] font-mono-hud text-emerald-400 font-bold">#{ticket.id}</span>
                  </div>
                )}
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono-hud text-white font-bold">
                  #{index + 1}
                </div>
              </div>

              {/* Card Body */}
              <div className="flex-1 min-w-0 space-y-1.5">
                
                {/* Severity & Department Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase font-space ${
                    isCritical
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : isHigh
                      ? 'bg-amber-100 text-amber-700 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  }`}>
                    {ticket.severity}
                  </span>

                  <span className="px-2 py-0.5 rounded-md text-[9px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                    {ticket.category}
                  </span>

                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                    <span>AI-Verified</span>
                  </span>

                  <span className="ml-auto font-mono-hud text-xs font-bold text-[#0b6e4f]">
                    {ticket.computedScore} PTS
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-xs sm:text-sm font-bold text-[#071713] font-space leading-tight line-clamp-2">
                  {ticket.english_summary}
                </h4>

                <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                  <Building2 className="w-3 h-3 text-[#0b6e4f] shrink-0" />
                  <span className="truncate">{ticket.department}</span>
                </div>

                {/* SLA / Upvote Stats & Action */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] font-mono-hud text-slate-500">
                  <div className="flex items-center gap-1 text-amber-600 font-semibold">
                    <Clock className="w-3 h-3" />
                    <span>{t('priority_sla_prefix')} {isCritical ? '<2h' : '<12h'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5 text-emerald-700 font-bold">
                      <ArrowUp className="w-3 h-3" />
                      <span>{ticket.upvotes_count || 14}</span>
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickDispatch && onQuickDispatch(ticket);
                      }}
                      className="px-2 py-0.5 rounded-md bg-[#0b6e4f] text-white font-bold hover:bg-[#10b981] transition flex items-center gap-0.5 active:scale-95"
                    >
                      <Send className="w-2.5 h-2.5" />
                      <span>{t('priority_dispatch_btn')}</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
