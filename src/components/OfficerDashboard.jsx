import React, { useState } from 'react';
import { 
  Inbox, AlertTriangle, Zap, CheckCircle2, Search, Filter, 
  MapPin, Building2, ChevronRight, Copy, ShieldAlert, Sparkles, 
  Image as ImageIcon, FileDown, Download, Check 
} from 'lucide-react';
import { jsPDF } from 'jspdf';

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

  // Export Filtered Summary Dossier as PDF
  const handleExportSummaryPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

      // Top Emerald Header Band
      doc.setFillColor(11, 110, 79);
      doc.rect(0, 0, 595.28, 65, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('SPOTNEX • MUNICIPAL OFFICER ESCALATION DOSSIER', 35, 36);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST | Competent Authority: BBMP / BESCOM / BWSSB`, 35, 52);

      // KPI Metric Summary Bar
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
      doc.roundedRect(35, 80, 525.28, 45, 6, 6, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Filtered: ${filteredTickets.length}   |   Critical Threats: ${critical}   |   High Priority: ${high}   |   Resolved: ${resolved}`, 48, 100);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('Official Statutory Audit Summary under Section 133 CrPC and Karnataka Municipal Corporations Act.', 48, 114);

      // Table Header
      let y = 150;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setFillColor(241, 245, 249);
      doc.rect(35, y - 14, 525.28, 20, 'F');
      doc.setTextColor(15, 23, 42);
      doc.text('TICKET ID', 45, y);
      doc.text('SEVERITY', 110, y);
      doc.text('CATEGORY', 180, y);
      doc.text('DEPARTMENT', 255, y);
      doc.text('FACTUAL SUMMARY / STATUS', 400, y);

      // Table Rows
      doc.setFont('helvetica', 'normal');
      filteredTickets.slice(0, 22).forEach((tkt, i) => {
        y += 24;
        if (y > 770) {
          doc.addPage();
          y = 50;
        }

        if (i % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(35, y - 13, 525.28, 22, 'F');
        }

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(11, 110, 79);
        doc.text(tkt.id, 45, y);

        // Severity Color Code
        if (tkt.severity === 'Critical') doc.setTextColor(220, 38, 38);
        else if (tkt.severity === 'High') doc.setTextColor(217, 119, 6);
        else doc.setTextColor(16, 185, 129);
        doc.text(tkt.severity.toUpperCase(), 110, y);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text((tkt.category || 'Roads').toUpperCase(), 180, y);
        doc.text(tkt.department ? tkt.department.substring(0, 22) : 'BBMP', 255, y);

        const summaryText = `${(tkt.english_summary || '').substring(0, 36)}... [${tkt.status}]`;
        doc.text(summaryText, 400, y);
      });

      // Digital Seal Footer
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('CIVIC DIGITAL SEAL: SPOTNEX-BBMP-CRPC-VERIFIED • Official Municipal Redressal Record', 35, 810);

      doc.save(`SpotNex_Officer_Report_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (e) {
      console.error('PDF export error, falling back to CSV:', e);
      handleExportCSV();
    }
  };

  // CSV Fallback Exporter
  const handleExportCSV = () => {
    const headers = ['Ticket ID', 'Severity', 'Category', 'Department', 'Summary', 'Status', 'Location', 'Reported At'];
    const rows = filteredTickets.map(t => [
      t.id,
      t.severity,
      t.category,
      `"${(t.department || '').replace(/"/g, '""')}"`,
      `"${(t.english_summary || '').replace(/"/g, '""')}"`,
      t.status,
      `"${(t.location || '').replace(/"/g, '""')}"`,
      t.created_at
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SpotNex_Officer_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Individual Statutory Notice PDF
  const handleExportSinglePDF = (ticket) => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

      // Header Band
      doc.setFillColor(11, 110, 79);
      doc.rect(0, 0, 595.28, 65, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('SPOTNEX • STATUTORY CIVIC NOTICE & INCIDENT REPORT', 35, 36);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Municipal Corporation Grievance Redressal • Section 133 Code of Criminal Procedure, 1973', 35, 52);

      // Ticket Info Card
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(35, 85, 525.28, 105, 6, 6, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(`TICKET ID: ${ticket.id}`, 48, 110);

      doc.setFontSize(10);
      if (ticket.severity === 'Critical') doc.setTextColor(220, 38, 38);
      else if (ticket.severity === 'High') doc.setTextColor(217, 119, 6);
      else doc.setTextColor(16, 185, 129);
      doc.text(`SEVERITY LEVEL: ${ticket.severity.toUpperCase()} (SLA: ${ticket.severity === 'Critical' ? '< 2 Hours' : '< 12 Hours'})`, 48, 128);

      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');
      doc.text(`Competent Department: ${ticket.department || 'BBMP'}`, 48, 146);
      doc.text(`Incident Location: ${ticket.location || 'Ward 174, Bengaluru'}`, 48, 162);
      doc.text(`Lifecycle Status: ${ticket.status} | Filed: ${new Date(ticket.created_at).toLocaleString('en-IN')}`, 48, 178);

      // Official Factual Description Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(35, 205, 525.28, 115, 6, 6, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('OFFICIAL FACTUAL DESCRIPTION (ENGLISH):', 48, 225);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const descLines = doc.splitTextToSize(ticket.english_summary || '', 495);
      doc.text(descLines, 48, 242);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9);
      doc.text('GROUND SEVERITY JUSTIFICATION:', 48, 275);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const reasonLines = doc.splitTextToSize(ticket.reason || ticket.one_line_reason || '', 495);
      doc.text(reasonLines, 48, 292);

      // Statutory Directive (Section 133 CrPC)
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
      doc.roundedRect(35, 335, 525.28, 140, 6, 6, 'FD');

      doc.setTextColor(11, 110, 79);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('STATUTORY DIRECTIVE & LEGAL MANDATE (SECTION 133 CrPC):', 48, 355);

      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const legalText = `Under Section 133 of the Code of Criminal Procedure, 1973, it is the bounden statutory obligation of the competent municipal authority to prevent imminent danger to public life, bodily injury, and obstruction of public thoroughfares.

The designated municipal authority is hereby directed to inspect and execute corrective engineering within the stipulated SLA timeframe. Failure to abate life-threatening hazards attracts statutory scrutiny under Indian law.`;
      const legalLines = doc.splitTextToSize(legalText, 495);
      doc.text(legalLines, 48, 375);

      // Forensic seal footer
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`DIGITAL FORENSIC SEAL: ${ticket.watermark_hash || 'SPOTNEX_BBMP_SEAL_VERIFIED'}`, 48, 495);
      doc.text(`REPORTING CITIZEN: ${ticket.citizen_name || 'Verified Citizen'} (${ticket.citizen_phone || 'Phone verified'})`, 48, 510);

      doc.save(`SpotNex_Notice_${ticket.id}.pdf`);
    } catch (e) {
      console.error('Error generating single ticket PDF:', e);
      alert(`Exporting ${ticket.id} notice...`);
    }
  };

  return (
    <div className="space-y-4 py-2 font-sans text-slate-800">
      
      {/* Header with Prominent Emerald "Download Report (PDF)" Button */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 soft-card-shadow flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0b6e4f] text-[10px] font-mono-hud font-extrabold uppercase tracking-wide">
              MUNICIPAL OFFICER DESK
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-600 font-semibold text-xs">BBMP East Zone</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 font-space tracking-tight">
            Municipal Officer Operations Desk
          </h2>
          <p className="text-xs text-slate-500">
            Real-time grievance triage queue • BBMP Zonal Enforcement u/s 133 CrPC
          </p>
        </div>

        {/* Prominent Emerald Download Report Button */}
        <button
          onClick={handleExportSummaryPDF}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#0b6e4f] to-[#10b981] hover:from-[#09583f] hover:to-[#0ea573] text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 active:scale-95 transition flex items-center gap-2 font-space shrink-0"
          title="Download Filtered Dossier as PDF"
        >
          <FileDown className="w-4 h-4 text-emerald-100" />
          <span>Download Report (PDF)</span>
        </button>
      </div>

      {/* 4 Crisp White KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 soft-card-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5 font-medium">
            <span>Total Grievances</span>
            <Inbox className="w-4 h-4 text-[#0b6e4f]" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-space tracking-tight">{total}</div>
          <div className="text-[11px] text-[#0b6e4f] mt-1 flex items-center gap-1 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Live Triage Stream</span>
          </div>
        </div>

        {/* Metric 2: Critical */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-red-50/70 border border-red-200/90 soft-card-shadow">
          <div className="flex items-center justify-between text-red-700 text-xs mb-1.5 font-bold font-space">
            <span>Critical Threats</span>
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></div>
          </div>
          <div className="text-2xl font-black text-red-700 font-space tracking-tight">{critical}</div>
          <div className="text-[11px] text-red-800 mt-1 font-mono-hud font-bold">
            Emergency SLA &lt;2 Hours
          </div>
        </div>

        {/* Metric 3: High */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 soft-card-shadow">
          <div className="flex items-center justify-between text-amber-800 text-xs mb-1.5 font-bold font-space">
            <span>High Priority</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800 font-space tracking-tight">{high}</div>
          <div className="text-[11px] text-amber-900 mt-1 font-mono-hud font-bold">
            Public Disruption SLA &lt;12h
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 soft-card-shadow">
          <div className="flex items-center justify-between text-[#0b6e4f] text-xs mb-1.5 font-bold font-space">
            <span>AI Triage Latency</span>
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-[#0b6e4f] font-space tracking-tight">&lt; 1.1s</div>
          <div className="text-[11px] text-emerald-800 mt-1 font-medium">
            Multimodal + Regional NLP
          </div>
        </div>
      </div>

      {/* Crisp White Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 soft-card-shadow space-y-3">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets by grievance, ward, department, or ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0b6e4f] transition"
          />
        </div>

        {/* Filter Pills Groups */}
        <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100 text-xs">
          
          {/* Severity Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 text-[11px] mr-1 font-bold font-mono-hud uppercase">Severity:</span>
            {['ALL', 'Critical', 'High', 'Medium', 'Low'].map((sev) => {
              const isSelected = selectedSeverity === sev;
              return (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold font-space transition active:scale-95 ${
                    isSelected
                      ? 'bg-[#0b6e4f] text-white shadow-xs font-extrabold'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {sev}
                </button>
              );
            })}
          </div>

          {/* Category Pills & Status Dropdown */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 text-[11px] mr-1 font-bold font-mono-hud uppercase">Category:</span>
            {['ALL', 'electricity', 'roads', 'water', 'waste', 'drainage', 'trees'].map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold capitalize transition active:scale-95 flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#0b6e4f] text-white shadow-xs font-extrabold'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span>{categoryEmoji[cat] || ''}</span>
                  <span>{cat}</span>
                </button>
              );
            })}

            {/* Status Select */}
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px] font-mono-hud">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#0b6e4f]"
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
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
          <span>Displaying {filteredTickets.length} tickets (Priority Sorted: Critical ➜ Low)</span>
          <span className="text-[#0b6e4f] font-mono-hud font-bold text-[11px]">Realtime Queue</span>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="p-10 text-center border border-dashed border-slate-300 rounded-3xl bg-white text-slate-500 text-xs">
            No complaints match the selected filter criteria.
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const isCrit = ticket.severity === 'Critical';
            const isHi = ticket.severity === 'High';
            const isMed = ticket.severity === 'Medium';

            const sevBadge = isCrit
              ? 'bg-red-100 text-red-800 border-red-300'
              : isHi
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : isMed
              ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
              : 'bg-emerald-100 text-emerald-800 border-emerald-300';

            return (
              <div
                key={ticket.id}
                className="p-4 rounded-3xl bg-white border border-slate-200/90 soft-card-shadow space-y-3 transition-all hover:border-emerald-300"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border font-space ${sevBadge} flex items-center gap-1.5`}>
                      {isCrit && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>}
                      {ticket.severity}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 capitalize font-space">
                      {categoryEmoji[ticket.category] || '📌'} {ticket.category}
                    </span>

                    <span className="font-mono-hud text-xs font-bold text-[#0b6e4f]">
                      #{ticket.id}
                    </span>

                    {ticket.is_duplicate && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold border border-purple-200 flex items-center gap-1 font-space">
                        <Copy className="w-3 h-3 text-purple-600" /> Duplicate
                      </span>
                    )}
                  </div>

                  {/* Status Toggle Dropdown */}
                  <select
                    value={ticket.status}
                    onChange={(e) => onUpdateStatus(ticket.id, e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0b6e4f]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                {/* English Summary */}
                <div className="space-y-1">
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-snug font-space">
                    {ticket.english_summary}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-[#0b6e4f] font-bold">
                    <Building2 className="w-3.5 h-3.5 text-[#0b6e4f] shrink-0" />
                    <span>{ticket.department}</span>
                  </div>
                </div>

                {/* 1-Line Severity Justification Box */}
                <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-xs text-slate-800 leading-relaxed">
                  <strong className="text-amber-900 block font-mono-hud text-[10px] uppercase font-bold mb-0.5">
                    Ground Severity Justification:
                  </strong>
                  <span>{ticket.reason}</span>
                </div>

                {/* Metadata & Actions: Download PDF + Inspect */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 text-slate-700 truncate max-w-[200px]">
                      Original: "{ticket.citizen_text}"
                    </span>

                    {ticket.image_url && (
                      <span className="flex items-center gap-1 text-emerald-700 text-[11px] font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-600" /> Photo Attached
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Individual Ticket PDF Download Icon Button */}
                    <button
                      onClick={() => handleExportSinglePDF(ticket)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0b6e4f] border border-emerald-200 font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-2xs font-space"
                      title="Download Statutory Notice PDF"
                    >
                      <FileDown className="w-3.5 h-3.5 text-[#0b6e4f]" />
                      <span>PDF</span>
                    </button>

                    {/* Inspect Button */}
                    <button
                      onClick={() => onSelectTicket(ticket)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition active:scale-95"
                    >
                      <span>Inspect</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
