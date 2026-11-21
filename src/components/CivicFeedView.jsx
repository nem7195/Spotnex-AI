import React, { useState } from 'react';
import { Camera, ArrowUp, Bell, CheckCircle2, MapPin, Building2, ChevronRight, ShieldCheck } from 'lucide-react';

export default function CivicFeedView({ tickets, onOpenLens, onSelectTicket }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [upvoteCounts, setUpvoteCounts] = useState({});

  const categories = ['All', 'Roads', 'Waste', 'Water', 'Electricity', 'Trees', 'Drainage'];

  const filteredTickets = tickets.filter((t) => {
    if (selectedCategory === 'All') return true;
    return (t.category || '').toLowerCase() === selectedCategory.toLowerCase();
  });

  const handleUpvote = (id, e) => {
    e.stopPropagation();
    setUpvoteCounts((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const getStatusColor = (status) => {
    if (status === 'Resolved') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (status === 'In Progress') return 'bg-cyan-100 text-cyan-800 border-cyan-300';
    return 'bg-amber-100 text-amber-800 border-amber-300';
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* 1. Emerald Gradient Header Card with "+ Snap Issue" Button */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#0b6e4f] to-[#10b981] text-white shadow-md shadow-emerald-800/15 flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono-hud font-bold uppercase tracking-wider text-emerald-200">
            BBMP • BESCOM • BWSSB
          </span>
          <h2 className="text-base font-extrabold font-space leading-tight">
            Bengaluru Civic Feed
          </h2>
          <p className="text-[11px] text-emerald-100/90">
            Real-time citizen grievances and statutory triaged issues
          </p>
        </div>

        <button
          onClick={onOpenLens}
          className="px-3.5 py-2 rounded-2xl bg-white hover:bg-emerald-50 text-[#0b6e4f] font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition"
        >
          <Camera className="w-4 h-4 text-[#0b6e4f]" />
          <span>+ Snap Issue</span>
        </button>
      </div>

      {/* 2. Horizontal Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold font-space transition ${
              selectedCategory === cat
                ? 'bg-[#0b6e4f] text-white shadow-xs'
                : 'bg-white border border-emerald-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. Ticket Cards Stream */}
      <div className="space-y-3">
        {filteredTickets.map((ticket, index) => {
          const upvotes = (ticket.upvotes_count || 14) + (upvoteCounts[ticket.id] || 0);
          const priorityScore = (ticket.computedScore || (ticket.severity === 'Critical' ? 320 : ticket.severity === 'High' ? 240 : 160));

          return (
            <div
              key={ticket.id || index}
              onClick={() => onSelectTicket(ticket)}
              className="p-4 rounded-3xl bg-white border border-emerald-100/90 soft-card-shadow space-y-3 cursor-pointer hover:border-emerald-300 transition group"
            >
              {/* Header: Ward / Timestamp + Status Pill */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 font-mono-hud text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-[#0b6e4f]" />
                  <span className="font-semibold text-slate-700 truncate max-w-[170px]">
                    {ticket.location || 'Ward 174, Bengaluru'}
                  </span>
                  <span>•</span>
                  <span>{new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border font-space ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>

              {/* Photo with Ticket # & Priority Score Overlays (or fallback banner) */}
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900 border border-slate-100">
                {ticket.image_url ? (
                  <img src={ticket.image_url} alt="Evidence" className="w-full h-full object-cover group-hover:scale-102 transition duration-300" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-[#071713] to-[#0b6e4f] flex flex-col items-center justify-center p-3 text-center">
                    <span className="text-emerald-400 text-xs font-bold font-space uppercase">CIVIC EVIDENCE REPORT</span>
                    <p className="text-white text-xs mt-1 font-semibold line-clamp-2 px-2">"{ticket.english_summary}"</p>
                  </div>
                )}

                {/* Top Left Ticket # Overlay */}
                <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-lg bg-[#071713]/85 backdrop-blur-md border border-emerald-400/40 text-[10px] font-mono-hud font-bold text-white">
                  #{ticket.id}
                </div>

                {/* Top Right Priority Score Overlay */}
                <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-lg bg-[#0b6e4f]/90 backdrop-blur-md border border-emerald-300/40 text-[10px] font-mono-hud font-bold text-emerald-100 flex items-center gap-1">
                  <span>SCORE:</span>
                  <span className="text-white font-extrabold">{priorityScore}</span>
                </div>

                {/* Bottom Left Severity Badge */}
                <div className="absolute bottom-2.5 left-2.5">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase font-space text-white ${
                    ticket.severity === 'Critical' ? 'bg-red-600' : ticket.severity === 'High' ? 'bg-amber-600' : 'bg-emerald-600'
                  }`}>
                    {ticket.severity} Severity
                  </span>
                </div>
              </div>

              {/* Summary & Department Routing */}
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#071713] leading-snug font-space group-hover:text-[#0b6e4f] transition">
                  {ticket.english_summary}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-[#0b6e4f] font-semibold">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{ticket.department}</span>
                </div>
              </div>

              {/* Action Pills: Upvote / Follow / Verify */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  {/* Upvote Pill */}
                  <button
                    onClick={(e) => handleUpvote(ticket.id, e)}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#0b6e4f] font-bold border border-emerald-200 transition active:scale-95"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span>Upvote ({upvotes})</span>
                  </button>

                  {/* Follow Pill */}
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
                  >
                    <Bell className="w-3.5 h-3.5 text-slate-500" />
                    <span>Follow</span>
                  </button>
                </div>

                {/* Verify Pill */}
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>3 Verifications</span>
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
