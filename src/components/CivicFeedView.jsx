import React, { useState } from 'react';
import { 
  Camera, ArrowUp, Bell, CheckCircle2, MapPin, Building2, 
  MessageSquare, Send, User, Clock, ChevronDown, ChevronUp, ShieldCheck 
} from 'lucide-react';
import { getTranslation } from '../utils/i18n';

// Pre-seeded realistic demo comments for tickets
const initialComments = {
  'TKT-1001': [
    { id: 1, author: 'BESCOM Control Room', text: 'Feeder line #4 tripped for safety. Rapid lineman gang dispatched to Ward 42.', time: '28m ago', role: 'Official' },
    { id: 2, author: 'Suresh K. (Citizen)', text: 'Children moved away safely. Waiting for wire tape insulation.', time: '14m ago', role: 'Citizen' }
  ],
  'TKT-1002': [
    { id: 1, author: 'BWSSB Zone Officer', text: 'Main inlet gate valve V-12 isolated. Pressure subsiding on MG Road.', time: '45m ago', role: 'Official' }
  ],
  'TKT-1003': [
    { id: 1, author: 'Praveen Rao (RWA)', text: 'Reflective cones placed by traffic police after 2 scooter skids.', time: '1h ago', role: 'Citizen' },
    { id: 2, author: 'BBMP Ward Engineer', text: 'Cold-mix asphalt patch scheduled for tonight 11 PM.', time: '30m ago', role: 'Official' }
  ],
  'TKT-1004': [
    { id: 1, author: 'BBMP SWM Marshall', text: 'Compactor tipper vehicle en route for clearing primary bin.', time: '1h ago', role: 'Official' }
  ],
  'TKT-1005': [
    { id: 1, author: 'Forest Cell Wing', text: 'Chainsaw crew deployed to clear fallen trunk from 12th Main.', time: '2h ago', role: 'Official' }
  ]
};

export default function CivicFeedView({ tickets, onOpenLens, onSelectTicket, currentLang = 'en' }) {
  const t = (k) => getTranslation(k, currentLang);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [upvoteCounts, setUpvoteCounts] = useState({});
  const [followedTickets, setFollowedTickets] = useState({});
  const [commentsMap, setCommentsMap] = useState(initialComments);
  const [expandedComments, setExpandedComments] = useState({});
  const [newCommentInputs, setNewCommentInputs] = useState({});

  const categories = [
    { key: 'All', label: t('feed_filter_all') },
    { key: 'Roads', label: t('feed_filter_roads') },
    { key: 'Waste', label: t('feed_filter_waste') },
    { key: 'Water', label: t('feed_filter_water') },
    { key: 'Electricity', label: t('feed_filter_electricity') },
    { key: 'Trees', label: t('feed_filter_trees') },
    { key: 'Drainage', label: t('feed_filter_drainage') }
  ];

  const filteredTickets = tickets.filter((tkt) => {
    if (selectedCategory === 'All') return true;
    return (tkt.category || '').toLowerCase() === selectedCategory.toLowerCase();
  });

  const handleUpvote = (id, e) => {
    e.stopPropagation();
    setUpvoteCounts((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const handleToggleFollow = (id, e) => {
    e.stopPropagation();
    setFollowedTickets((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleToggleComments = (id, e) => {
    e.stopPropagation();
    setExpandedComments((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAddComment = (ticketId, e) => {
    e.stopPropagation();
    const commentText = (newCommentInputs[ticketId] || '').trim();
    if (!commentText) return;

    const newComment = {
      id: Date.now(),
      author: 'Citizen (You)',
      text: commentText,
      time: 'Just now',
      role: 'Citizen'
    };

    setCommentsMap((prev) => ({
      ...prev,
      [ticketId]: [...(prev[ticketId] || []), newComment]
    }));

    setNewCommentInputs((prev) => ({
      ...prev,
      [ticketId]: ''
    }));

    // Ensure comment section stays open
    setExpandedComments((prev) => ({
      ...prev,
      [ticketId]: true
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
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#0b6e4f] to-[#10b981] text-white shadow-md shadow-emerald-800/15 flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono-hud font-bold uppercase tracking-wider text-emerald-200">
            {t('active_city_badge')}
          </span>
          <h2 className="text-base sm:text-lg font-extrabold font-space leading-tight">
            {t('feed_title')}
          </h2>
          <p className="text-[11px] text-emerald-100/90">
            {t('feed_subtitle')}
          </p>
        </div>

        <button
          onClick={onOpenLens}
          className="shrink-0 px-3.5 py-2.5 rounded-2xl bg-white hover:bg-emerald-50 text-[#0b6e4f] font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition"
        >
          <Camera className="w-4 h-4 text-[#0b6e4f]" />
          <span>{t('feed_snap_btn')}</span>
        </button>
      </div>

      {/* 2. Horizontal Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold font-space transition ${
              selectedCategory === cat.key
                ? 'bg-[#0b6e4f] text-white shadow-xs font-extrabold'
                : 'bg-white border border-emerald-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. Ticket Cards Stream */}
      <div className="space-y-4">
        {filteredTickets.map((ticket, index) => {
          const upvotes = (ticket.upvotes_count || 14) + (upvoteCounts[ticket.id] || 0);
          const priorityScore = (ticket.computedScore || (ticket.severity === 'Critical' ? 320 : ticket.severity === 'High' ? 240 : 160));
          const comments = commentsMap[ticket.id] || [];
          const commentCount = comments.length;
          const isCommentsOpen = !!expandedComments[ticket.id];
          const isFollowed = !!followedTickets[ticket.id];

          return (
            <div
              key={ticket.id || index}
              onClick={() => onSelectTicket(ticket)}
              className="p-4 rounded-3xl bg-white border border-emerald-100/90 soft-card-shadow space-y-3 cursor-pointer hover:border-emerald-300 transition group"
            >
              
              {/* Prominent Full-Width Photo (rounded-2xl, h-56, object-cover) */}
              <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-slate-900 border border-slate-100 shadow-xs">
                {ticket.image_url ? (
                  <img 
                    src={ticket.image_url} 
                    alt="Civic Hazard Evidence" 
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-300" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-[#071713] to-[#0b6e4f] flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-emerald-400 text-xs font-bold font-space uppercase">CIVIC EVIDENCE REPORT</span>
                    <p className="text-white text-xs mt-1 font-semibold line-clamp-2 px-3">"{ticket.english_summary}"</p>
                  </div>
                )}

                {/* Dark Translucent Overlay Pill: Ticket # (Top-Left) */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-[#071713]/85 backdrop-blur-md border border-emerald-400/40 text-xs font-mono-hud font-bold text-white shadow-md">
                  #{ticket.id}
                </div>

                {/* AI-Verified Authentic Badge (Bottom-Left) */}
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-emerald-950/85 backdrop-blur-md border border-emerald-400/50 text-[10px] font-space font-extrabold text-emerald-300 shadow-md flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>{t('gatekeeper_badge_authentic')}</span>
                </div>

                {/* Top-Right: Severity Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase font-space text-white shadow-md ${
                    ticket.severity === 'Critical' ? 'bg-red-600' : ticket.severity === 'High' ? 'bg-amber-600' : 'bg-emerald-600'
                  }`}>
                    {ticket.severity} Severity
                  </span>
                </div>

                {/* Dark Translucent Overlay Pill: Priority Score (Bottom-Right) */}
                <div className="absolute bottom-3 right-3 px-3.5 py-1 rounded-xl bg-[#071713]/85 backdrop-blur-md border border-emerald-300/40 text-xs font-mono-hud font-bold text-emerald-300 shadow-md flex items-center gap-1.5">
                  <span className="text-[10px] text-emerald-400">SCORE:</span>
                  <span className="text-white font-extrabold">{priorityScore}</span>
                </div>

              </div>

              {/* Header: Location & Timestamp + Status Pill */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <div className="flex items-center gap-1.5 text-slate-500 font-mono-hud text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-[#0b6e4f] shrink-0" />
                  <span className="font-semibold text-slate-700 truncate max-w-[190px]">
                    {ticket.location || 'Ward 174, Bengaluru'}
                  </span>
                  <span>•</span>
                  <span>{new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border font-space ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
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

              {/* Action Bar: Upvote, Follow, Verify, Comment Toggle */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  
                  {/* Upvote Pill */}
                  <button
                    onClick={(e) => handleUpvote(ticket.id, e)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#0b6e4f] font-bold border border-emerald-200 transition active:scale-95"
                    title="Upvote this complaint"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-[#0b6e4f]" />
                    <span>{t('feed_upvote')} ({upvotes})</span>
                  </button>

                  {/* Follow Pill */}
                  <button
                    onClick={(e) => handleToggleFollow(ticket.id, e)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-bold transition active:scale-95 ${
                      isFollowed
                        ? 'bg-[#0b6e4f] text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                    title="Follow updates"
                  >
                    <Bell className={`w-3.5 h-3.5 ${isFollowed ? 'text-white' : 'text-slate-500'}`} />
                    <span>{isFollowed ? t('feed_following') : t('feed_follow')}</span>
                  </button>

                  {/* Comment (count) Toggle Button */}
                  <button
                    onClick={(e) => handleToggleComments(ticket.id, e)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full border transition active:scale-95 font-bold ${
                      isCommentsOpen
                        ? 'bg-emerald-100 text-[#0b6e4f] border-emerald-300'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                    title="View or add comments"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#0b6e4f]" />
                    <span>{t('feed_comment')} ({commentCount})</span>
                    {isCommentsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                </div>

                {/* Verify Badge */}
                <span className="hidden xs:flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('feed_verified')}</span>
                </span>
              </div>

              {/* Inline Expandable Comment Section */}
              {isCommentsOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()} 
                  className="mt-3 p-3.5 rounded-2xl bg-slate-50 border border-emerald-100/80 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs border-b border-slate-200/80 pb-2">
                    <span className="font-bold text-[#071713] font-space flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#0b6e4f]" />
                      <span>{t('feed_comment')} ({commentCount})</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono-hud">Live Ward Channel</span>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {comments.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic text-center py-2">
                        {t('feed_no_comments')}
                      </p>
                    ) : (
                      comments.map((c) => (
                        <div key={c.id} className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                              <User className="w-3 h-3 text-[#0b6e4f]" />
                              <span>{c.author}</span>
                              {c.role === 'Official' && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-[#0b6e4f] text-[9px] font-extrabold font-mono-hud">
                                  OFFICIAL
                                </span>
                              )}
                            </div>
                            <span className="text-slate-400 font-mono-hud">{c.time}</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed">{c.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add New Comment Live Input Box */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      value={newCommentInputs[ticket.id] || ''}
                      onChange={(e) => setNewCommentInputs((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment(ticket.id, e);
                      }}
                      placeholder={t('feed_comment_placeholder')}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition shadow-2xs"
                    />
                    <button
                      onClick={(e) => handleAddComment(ticket.id, e)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0b6e4f] to-[#10b981] hover:from-[#09583f] hover:to-[#0ea573] text-white font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t('feed_comment_post')}</span>
                    </button>
                  </div>

                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
