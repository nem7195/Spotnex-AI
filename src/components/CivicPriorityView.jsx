import React, { useState } from 'react';
import { 
  Flame, Clock, MapPin, Building2, ShieldAlert, 
  Send, ExternalLink, ArrowUp, CheckCircle2, ChevronRight, Award
} from 'lucide-react';

export default function CivicPriorityView({ tickets, onSelectTicket, onQuickDispatch }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'severity' | 'upvotes' | 'sla'

  const categories = ['All', 'Roads', 'Waste', 'Water', 'Electricity', 'Trees', 'Drainage'];

  // Severity Weightings
  const severityWeight = {
    Critical: 250,
    High: 175,
    Medium: 100,
    Low: 40
  };

  // Compute Dynamic Priority Score:
  // Priority Score = (Severity_Weight) + (Verifications × 40) + (Upvotes × 3) + SLA Urgency - Spam Penalty
  const scoredTickets = tickets.map((t) => {
    const sWeight = severityWeight[t.severity] || 100;
    const verifications = t.verifications_count || (t.is_verified ? 3 : 1);
    const upvotes = t.upvotes_count || 14;
    const spamPenalty = t.reports_count ? t.reports_count * 35 : 0;
    
    // SLA urgency points: Critical gets +50, High +25
    const slaUrgency = t.severity === 'Critical' ? 50 : t.severity === 'High' ? 25 : 10;
    const score = sWeight + (verifications * 40) + (upvotes * 3) + slaUrgency - spamPenalty;

    return {
      ...t,
      computedScore: Math.max(score, 0),
      verifications_count: verifications,
      upvotes_count: upvotes
    };
  });

  // Filter by category
  const filtered = scoredTickets.filter((t) => {
    if (selectedCategory === 'All') return true;
    return (t.category || '').toLowerCase() === selectedCategory.toLowerCase();
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'score') return b.computedScore - a.computedScore;
    if (sortBy === 'severity') {
      const rank = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return (rank[b.severity] || 0) - (rank[a.severity] || 0);
    }
    if (sortBy === 'upvotes') return b.upvotes_count - a.upvotes_count;
    if (sortBy === 'sla') {
      return new Date(a.created_at) - new Date(b.created_at);
    }
    return b.computedScore - a.computedScore;
  });

  const rankBadges = [
    { label: '🥇 Critical Priority #1', color: 'bg-red-950 text-red-300 border-red-500/60' },
    { label: '🥈 High Priority #2', color: 'bg-amber-950 text-amber-300 border-amber-500/60' },
    { label: '🥉 Priority #3', color: 'bg-yellow-950 text-yellow-300 border-yellow-500/60' }
  ];

  return (
    <div className="space-y-3 pb-20">
      
      {/* Top Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/40 via-amber-950/30 to-slate-900 border border-red-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-600/30 border border-red-500 flex items-center justify-center text-red-400">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white font-space">Command Priority Matrix</h3>
            <p className="text-[10px] text-slate-400">Algorithmically ranked by hazard weight &amp; community verification</p>
          </div>
        </div>
        <span className="font-mono-hud text-[10px] text-red-400 font-bold px-2 py-0.5 rounded bg-red-950/80 border border-red-800">
          HOT DECK
        </span>
      </div>

      {/* Horizontal Category Pill Rail */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sort Toggles Bar */}
      <div className="flex items-center justify-between text-[11px] px-1">
        <span className="text-slate-400 font-mono-hud">Sort:</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSortBy('score')}
            className={`px-2 py-0.5 rounded-md font-bold transition ${
              sortBy === 'score' ? 'bg-emerald-950 text-emerald-400 border border-emerald-600' : 'text-slate-400'
            }`}
          >
            Score
          </button>
          <button
            onClick={() => setSortBy('severity')}
            className={`px-2 py-0.5 rounded-md font-bold transition ${
              sortBy === 'severity' ? 'bg-emerald-950 text-emerald-400 border border-emerald-600' : 'text-slate-400'
            }`}
          >
            Severity
          </button>
          <button
            onClick={() => setSortBy('upvotes')}
            className={`px-2 py-0.5 rounded-md font-bold transition ${
              sortBy === 'upvotes' ? 'bg-emerald-950 text-emerald-400 border border-emerald-600' : 'text-slate-400'
            }`}
          >
            Upvotes
          </button>
          <button
            onClick={() => setSortBy('sla')}
            className={`px-2 py-0.5 rounded-md font-bold transition ${
              sortBy === 'sla' ? 'bg-emerald-950 text-emerald-400 border border-emerald-600' : 'text-slate-400'
            }`}
          >
            SLA
          </button>
        </div>
      </div>

      {/* Priority Cards Stream */}
      <div className="space-y-3">
        {sorted.map((ticket, index) => {
          const rankBadge = rankBadges[index] || {
            label: `#${index + 1} Queued Priority`,
            color: 'bg-slate-900 text-slate-400 border-slate-800'
          };

          const isCritical = ticket.severity === 'Critical';
          const maxScore = 500;
          const scorePercent = Math.min(100, Math.round((ticket.computedScore / maxScore) * 100));

          return (
            <div
              key={ticket.id}
              className={`p-3.5 rounded-2xl bg-slate-950/85 backdrop-blur-xl border ${
                isCritical ? 'border-red-500/50 shadow-lg shadow-red-950/30' : 'border-emerald-500/40'
              } text-white space-y-2.5 transition`}
            >
              {/* Card Header: Urgency Rank Badge + Score */}
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${rankBadge.color} flex items-center gap-1 font-space`}>
                  {rankBadge.label}
                </span>

                <div className="text-right">
                  <span className="font-mono-hud text-xs font-bold text-emerald-400">
                    {ticket.computedScore} PTS
                  </span>
                </div>
              </div>

              {/* Progress Score Bar */}
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isCritical
                      ? 'bg-gradient-to-r from-amber-500 to-red-500'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: `${scorePercent}%` }}
                ></div>
              </div>

              {/* Description & Department */}
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                  {ticket.english_summary}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-cyan-400">
                  <Building2 className="w-3 h-3 text-cyan-500 shrink-0" />
                  <span className="truncate">{ticket.department}</span>
                </div>
              </div>

              {/* SLA Countdown Timer & Verification Pill */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900 font-mono-hud">
                <div className="flex items-center gap-1 text-amber-400">
                  <Clock className="w-3 h-3" />
                  <span>SLA: {isCritical ? '< 2h Emergency' : '< 12h Next Shift'}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{ticket.verifications_count} Verifications</span>
                  </span>
                  <span>•</span>
                  <span>{ticket.upvotes_count} Upvotes</span>
                </div>
              </div>

              {/* Footer: Geotag link + 1-Tap Dispatch Trigger */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate max-w-[180px]">
                  <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="truncate">{ticket.location || 'Bengaluru Ward'}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onSelectTicket(ticket)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-[10px] font-semibold flex items-center gap-1 border border-slate-800 transition"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onQuickDispatch && onQuickDispatch(ticket)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 transition shadow-md shadow-emerald-600/30 active:scale-95"
                  >
                    <Send className="w-3 h-3" />
                    <span>Dispatch</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
