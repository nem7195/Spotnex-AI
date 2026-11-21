import React, { useState } from 'react';
import { 
  Inbox, AlertTriangle, Zap, CheckCircle2, Search, Filter, 
  MapPin, Building2, ChevronRight, Copy, ShieldAlert, Sparkles, Image as ImageIcon
} from 'lucide-react';

export default function OfficerDashboard({ tickets, onUpdateStatus, onSelectTicket }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Compute Metrics
  const total = tickets.length;
  const critical = tickets.filter(t => t.severity === 'Critical').length;
  const high = tickets.filter(t => t.severity === 'High').length;
  const resolved = tickets.filter(t => t.status === 'Resolved').length;

  // Filter tickets
  const filteredTickets = tickets.filter(t => {
    if (selectedSeverity !== 'ALL' && t.severity !== selectedSeverity) return false;
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
    if (selectedStatus !== 'ALL' && t.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const match = `${t.id} ${t.english_summary} ${t.citizen_text} ${t.department} ${t.location} ${t.reason}`.toLowerCase();
      if (!match.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  const categoryEmoji = {
    electricity: '⚡',
    roads: '🛣️',
    water: '💧',
    waste: '🗑️',
    drainage: '🕳️',
    trees: '🌳'
  };

  return (
    <div className="space-y-5 py-2">
      
      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div className="glass-panel p-3.5 sm:p-4 rounded-xl border border-slate-800 bg-[#0e131f]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Total Complaints</span>
            <Inbox className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{total}</div>
          <div className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>Live Triage Stream</span>
          </div>
        </div>

        {/* Metric 2: Critical */}
        <div className="glass-panel p-3.5 sm:p-4 rounded-xl border border-red-900/40 bg-red-950/20">
          <div className="flex items-center justify-between text-red-300 text-xs mb-1.5">
            <span className="font-semibold">Critical Threats</span>
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 pulse-critical"></div>
          </div>
          <div className="text-2xl font-bold text-red-400 tracking-tight">{critical}</div>
          <div className="text-[11px] text-red-300/80 mt-1 font-mono-hud">
            Emergency SLA &lt;2h
          </div>
        </div>

        {/* Metric 3: High */}
        <div className="glass-panel p-3.5 sm:p-4 rounded-xl border border-amber-900/40 bg-amber-950/20">
          <div className="flex items-center justify-between text-amber-300 text-xs mb-1.5">
            <span className="font-semibold">High Priority</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 tracking-tight">{high}</div>
          <div className="text-[11px] text-amber-300/80 mt-1 font-mono-hud">
            Service disruption risk
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-3.5 sm:p-4 rounded-xl border border-slate-800 bg-[#0e131f]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>AI Triage Latency</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">&lt; 1.1s</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Multimodal + Multilingual
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-3 sm:p-4 rounded-xl border border-slate-800 space-y-3 bg-[#0e131f]">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets by grievance, ward, department, or ID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Filter Pills Groups */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80 text-xs">
          
          {/* Severity Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 text-[11px] mr-1 font-medium">Severity:</span>
            {['ALL', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  selectedSeverity === sev
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 text-[11px] mr-1 font-medium">Category:</span>
            {['ALL', 'electricity', 'roads', 'water', 'waste', 'drainage', 'trees'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition flex items-center gap-1 ${
                  selectedCategory === cat
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-500 ring-1 ring-cyan-500'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <span>{categoryEmoji[cat] || ''}</span>
                <span>{cat}</span>
              </button>
            ))}

            {/* Status Select */}
            <div className="ml-auto flex items-center gap-1">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

        </div>

      </div>

      {/* Ticket List (Sorted Critical -> Low) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Displaying {filteredTickets.length} tickets (Priority Sorted: Critical ➜ Low)</span>
          <span className="text-cyan-400 font-mono-hud text-[11px]">Realtime Queue</span>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="p-10 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
            No complaints match the selected filter criteria.
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const isCrit = ticket.severity === 'Critical';
            const isHi = ticket.severity === 'High';
            const isMed = ticket.severity === 'Medium';

            const sevBorder = isCrit
              ? 'border-red-900/60 bg-red-950/10'
              : isHi
              ? 'border-amber-900/50 bg-amber-950/10'
              : 'border-slate-800/80 bg-[#0e131f]';

            const sevBadge = isCrit
              ? 'bg-red-950/80 text-red-300 border-red-800'
              : isHi
              ? 'bg-amber-950/80 text-amber-300 border-amber-800'
              : isMed
              ? 'bg-yellow-950/80 text-yellow-300 border-yellow-800'
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-800';

            return (
              <div
                key={ticket.id}
                className={`p-4 rounded-xl border ${sevBorder} space-y-3 transition-all hover:border-slate-700`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${sevBadge} flex items-center gap-1.5`}>
                      {isCrit && <span className="w-2 h-2 rounded-full bg-red-500 pulse-critical"></span>}
                      {ticket.severity}
                    </span>

                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                      {categoryEmoji[ticket.category] || '📌'} {ticket.category}
                    </span>

                    <span className="font-mono-hud text-xs font-bold text-slate-400">
                      {ticket.id}
                    </span>

                    {ticket.is_duplicate && (
                      <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] font-semibold border border-purple-800 flex items-center gap-1">
                        <Copy className="w-3 h-3" /> Duplicate
                      </span>
                    )}
                  </div>

                  {/* Status Toggle Dropdown */}
                  <select
                    value={ticket.status}
                    onChange={(e) => onUpdateStatus(ticket.id, e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-semibold text-cyan-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                {/* English Summary */}
                <div className="space-y-1">
                  <h4 className="text-sm sm:text-base font-semibold text-white tracking-tight leading-snug">
                    {ticket.english_summary}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span>{ticket.department}</span>
                  </div>
                </div>

                {/* 1-Line Severity Justification */}
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300">
                  <strong className="text-slate-200">Severity Justification: </strong>
                  <span>{ticket.reason}</span>
                </div>

                {/* Metadata & Inspect Action */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800 truncate max-w-[220px]">
                      Original: "{ticket.citizen_text}"
                    </span>

                    {ticket.image_url && (
                      <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                        <ImageIcon className="w-3.5 h-3.5" /> Photo Attached
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectTicket(ticket)}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
