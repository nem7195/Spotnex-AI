import React, { useState } from 'react';
import { 
  ArrowUp, Bell, CheckCircle2, Flag, MessageSquare, 
  MapPin, ShieldCheck, Send, Camera, User 
} from 'lucide-react';

export default function CityFeed({ tickets, onOpenLens }) {
  // Local state for interactive counters, accordion collapses, and comments
  const [ticketState, setTicketState] = useState(() => {
    const map = {};
    tickets.forEach((t) => {
      map[t.id] = {
        upvotes: t.upvotes_count || 18,
        hasUpvoted: false,
        follows: t.follows_count || 5,
        hasFollowed: false,
        isReported: false,
        showVerifyAccordion: false,
        showCommentAccordion: false,
        verifiedCitizens: [
          'Kavita R. (Resident)',
          'Anand Murthy (Ward Warden)',
          'Suresh Gowda (Cyclist)'
        ],
        comments: [
          { author: 'Prasad K.', text: 'Very dangerous during evening peak hours. BBMP must act!', time: '12m ago' },
          { author: 'Meera Deshmukh', text: 'School bus had to reverse because of this.', time: '28m ago' }
        ],
        newComment: ''
      };
    });
    return map;
  });

  const toggleUpvote = (id) => {
    setTicketState((prev) => {
      const current = prev[id] || { upvotes: 18, hasUpvoted: false };
      return {
        ...prev,
        [id]: {
          ...current,
          upvotes: current.hasUpvoted ? current.upvotes - 1 : current.upvotes + 1,
          hasUpvoted: !current.hasUpvoted
        }
      };
    });
  };

  const toggleFollow = (id) => {
    setTicketState((prev) => {
      const current = prev[id] || { follows: 5, hasFollowed: false };
      return {
        ...prev,
        [id]: {
          ...current,
          follows: current.hasFollowed ? current.follows - 1 : current.follows + 1,
          hasFollowed: !current.hasFollowed
        }
      };
    });
  };

  const toggleReport = (id) => {
    setTicketState((prev) => {
      const current = prev[id] || { isReported: false };
      return {
        ...prev,
        [id]: {
          ...current,
          isReported: !current.isReported
        }
      };
    });
  };

  const toggleVerifyAccordion = (id) => {
    setTicketState((prev) => {
      const current = prev[id] || {};
      return {
        ...prev,
        [id]: {
          ...current,
          showVerifyAccordion: !current.showVerifyAccordion
        }
      };
    });
  };

  const toggleCommentAccordion = (id) => {
    setTicketState((prev) => {
      const current = prev[id] || {};
      return {
        ...prev,
        [id]: {
          ...current,
          showCommentAccordion: !current.showCommentAccordion
        }
      };
    });
  };

  const addComment = (id) => {
    const text = ticketState[id]?.newComment?.trim();
    if (!text) return;

    setTicketState((prev) => {
      const current = prev[id];
      return {
        ...prev,
        [id]: {
          ...current,
          comments: [...current.comments, { author: 'You (Citizen)', text, time: 'Just now' }],
          newComment: ''
        }
      };
    });
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* City Feed Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-sm font-bold text-white font-space">Community City Feed</h2>
          <p className="text-[10px] text-slate-400">Citizen verified grievances across Bengaluru</p>
        </div>
        <button
          onClick={onOpenLens}
          className="px-3 py-1 rounded-full bg-emerald-600/30 border border-emerald-500/60 text-emerald-400 text-xs font-bold flex items-center gap-1 active:scale-95 transition"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Snap Hazard</span>
        </button>
      </div>

      {/* Feed Cards Stream */}
      <div className="space-y-3.5">
        {tickets.map((ticket) => {
          const state = ticketState[ticket.id] || {
            upvotes: 18,
            hasUpvoted: false,
            follows: 5,
            hasFollowed: false,
            isReported: false,
            showVerifyAccordion: false,
            showCommentAccordion: false,
            verifiedCitizens: ['Resident A', 'Ward Member B'],
            comments: [],
            newComment: ''
          };

          const isCrit = ticket.severity === 'Critical';

          return (
            <article
              key={ticket.id}
              className="p-3.5 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-emerald-500/40 text-white space-y-3 shadow-xl transition"
            >
              {/* Card Author & Time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#F0533A] to-[#00A896] p-0.5">
                    <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                      {ticket.citizen_name ? ticket.citizen_name.substring(0, 2).toUpperCase() : 'CZ'}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block leading-tight">
                      {ticket.citizen_name || 'Verified Citizen'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono-hud">
                      {ticket.location || 'Bengaluru Ward'}
                    </span>
                  </div>
                </div>

                {/* Severity Badge */}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono-hud ${
                  isCrit
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {ticket.severity}
                </span>
              </div>

              {/* Forensic Photographic Evidence if available */}
              {ticket.image_url && (
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-black">
                  <img
                    src={ticket.image_url}
                    alt="Civic Evidence"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-emerald-500/50 text-[9px] font-mono-hud text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>FORENSIC TAMPER-SEALED</span>
                  </div>
                </div>
              )}

              {/* Factual Description & English Summary */}
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-bold text-white leading-snug">
                  {ticket.english_summary}
                </h3>
                {ticket.citizen_text && ticket.citizen_text !== ticket.english_summary && (
                  <p className="text-[11px] text-slate-400 italic">
                    Raw: "{ticket.citizen_text}"
                  </p>
                )}
                <div className="text-[10px] text-cyan-400 font-medium pt-0.5">
                  Assigned Authority: {ticket.department}
                </div>
              </div>

              {/* EXACT 5 CIVIC ACTION BUTTONS PER CARD */}
              <div className="grid grid-cols-5 gap-1 pt-2 border-t border-slate-800/80 text-[10px] font-bold">
                
                {/* 1. ▲ Upvote (count) */}
                <button
                  onClick={() => toggleUpvote(ticket.id)}
                  className={`py-1.5 px-1 rounded-lg border flex items-center justify-center gap-1 transition active:scale-95 ${
                    state.hasUpvoted
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-sm'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:text-white'
                  }`}
                >
                  <ArrowUp className="w-3 h-3 text-emerald-400" />
                  <span>▲ {state.upvotes}</span>
                </button>

                {/* 2. 🔔 Follow (count) */}
                <button
                  onClick={() => toggleFollow(ticket.id)}
                  className={`py-1.5 px-1 rounded-lg border flex items-center justify-center gap-1 transition active:scale-95 ${
                    state.hasFollowed
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-sm'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:text-white'
                  }`}
                >
                  <Bell className="w-3 h-3 text-cyan-400" />
                  <span>{state.follows}</span>
                </button>

                {/* 3. ✅ Verify (count) ▼ */}
                <button
                  onClick={() => toggleVerifyAccordion(ticket.id)}
                  className={`py-1.5 px-1 rounded-lg border flex items-center justify-center gap-0.5 transition active:scale-95 ${
                    state.showVerifyAccordion
                      ? 'bg-teal-950 text-teal-300 border-teal-500 shadow-sm'
                      : 'bg-slate-900/80 text-teal-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-teal-400 shrink-0" />
                  <span>{state.verifiedCitizens.length} ▼</span>
                </button>

                {/* 4. 🚩 Report (in RED) */}
                <button
                  onClick={() => toggleReport(ticket.id)}
                  className={`py-1.5 px-1 rounded-lg border flex items-center justify-center gap-1 transition active:scale-95 ${
                    state.isReported
                      ? 'bg-red-600 text-white border-red-500'
                      : 'text-red-500 bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
                  }`}
                >
                  <Flag className="w-3 h-3" />
                  <span>{state.isReported ? 'Reported' : 'Report'}</span>
                </button>

                {/* 5. 💬 Comment (count) ▼ */}
                <button
                  onClick={() => toggleCommentAccordion(ticket.id)}
                  className={`py-1.5 px-1 rounded-lg border flex items-center justify-center gap-0.5 transition active:scale-95 ${
                    state.showCommentAccordion
                      ? 'bg-slate-800 text-white border-slate-600'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{state.comments.length} ▼</span>
                </button>

              </div>

              {/* COLLAPSIBLE ACCORDION 1: ✅ VERIFY LIST */}
              {state.showVerifyAccordion && (
                <div className="p-3 rounded-xl bg-slate-900/90 border border-teal-500/30 text-xs space-y-2 mt-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-teal-300">
                    <span>Citizens Who Ground-Verified This ({state.verifiedCitizens.length}):</span>
                    <span className="text-[10px] text-slate-400">GPS Locked Evidence</span>
                  </div>
                  <ul className="space-y-1">
                    {state.verifiedCitizens.map((name, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{name}</span>
                      </li>
                    ))}
                  </ul>

                  {/* "Click Photo to Verify" Button */}
                  <button
                    onClick={onOpenLens}
                    className="w-full py-2 rounded-lg bg-teal-600/30 hover:bg-teal-600/50 border border-teal-500/60 text-teal-300 font-bold text-[10px] flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Click Photo to Verify on Ground</span>
                  </button>
                </div>
              )}

              {/* COLLAPSIBLE ACCORDION 2: 💬 COMMENTS THREAD */}
              {state.showCommentAccordion && (
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2.5 mt-2">
                  <span className="text-[11px] font-bold text-slate-300 block">
                    Public Civic Discussion:
                  </span>
                  
                  {state.comments.length === 0 ? (
                    <p className="text-[10px] text-slate-500 italic">No comments yet. Be the first to add evidence notes.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {state.comments.map((c, i) => (
                        <div key={i} className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] space-y-0.5">
                          <div className="flex items-center justify-between text-slate-400 text-[10px]">
                            <strong className="text-emerald-400">{c.author}</strong>
                            <span>{c.time}</span>
                          </div>
                          <p className="text-slate-200">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Instant Post Input */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      value={state.newComment}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTicketState((prev) => ({
                          ...prev,
                          [ticket.id]: { ...prev[ticket.id], newComment: val }
                        }));
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && addComment(ticket.id)}
                      placeholder="Add civic comment or eyewitness note..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => addComment(ticket.id)}
                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

            </article>
          );
        })}
      </div>

    </div>
  );
}
