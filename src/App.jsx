import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CitizenIntake from './components/CitizenIntake';
import OfficerDashboard from './components/OfficerDashboard';
import TicketModal from './components/TicketModal';
import CitizenReviewModal from './components/CitizenReviewModal';
import { initialDemoTickets, triageHazardAPI, classifyClientFallback } from './utils/triageEngine';

const severityRank = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1
};

export default function App() {
  const [role, setRole] = useState('citizen'); // 'citizen' or 'officer'
  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem('civiclens_tickets');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialDemoTickets;
  });
  const [activeModalTicket, setActiveModalTicket] = useState(null);
  const [reviewModalData, setReviewModalData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('civiclens_tickets', JSON.stringify(tickets));
  }, [tickets]);

  // Try to sync with backend on mount
  useEffect(() => {
    fetch('/api/tickets')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.tickets?.length) {
          setTickets(data.tickets);
        }
      })
      .catch(() => {
        // Backend not running; fallback to client state
      });
  }, []);

  // Sort tickets: Critical -> High -> Medium -> Low, then newest
  const sortedTickets = [...tickets].sort((a, b) => {
    const sDiff = (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
    if (sDiff !== 0) return sDiff;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Handle complaint submission from CitizenIntake:
  // Runs Multimodal AI Triage & Opens the Citizen Triage Review Modal
  const handleComplaintSubmit = async (complaintData) => {
    setIsSubmitting(true);

    try {
      const triage = await triageHazardAPI({
        complaintText: complaintData.citizen_text,
        imageBase64: complaintData.evidence?.dataUrl || null,
        latitude: 12.97159,
        longitude: 77.59456,
        citizen_name: complaintData.citizen_name || "Citizen"
      });

      // Open Citizen Triage Review Modal for inspection and dispatch options
      setReviewModalData({
        triageResult: triage,
        originalInput: complaintData.citizen_text,
        evidence: complaintData.evidence,
        complaintData
      });

    } catch (err) {
      console.error('Triage failed:', err);
      alert('Error triaging hazard. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Called when citizen confirms dispatch in CitizenReviewModal (Social, Email, or Both)
  const handleConfirmDispatch = (triageResult) => {
    const { complaintData, evidence } = reviewModalData;

    const newTicket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      citizen_text: complaintData.citizen_text || "Evidence-based report",
      detected_language: triageResult.detected_language,
      category: triageResult.category || "roads",
      severity: triageResult.severity || "Medium",
      reason: triageResult.reason || triageResult.one_line_reason,
      one_line_reason: triageResult.one_line_reason,
      department: triageResult.department || "BBMP Municipal Corporation",
      department_details: triageResult.department_details,
      english_summary: triageResult.english_summary,
      status: 'Pending',
      location: complaintData.location || 'Ward 174, Bengaluru',
      citizen_name: complaintData.citizen_name || 'Citizen User',
      citizen_phone: complaintData.citizen_phone || '+91 98XXX XXXXX',
      image_url: evidence?.dataUrl || null,
      watermark_hash: evidence?.hash || '0x9E21B4F81E',
      action_drafts: triageResult.action_drafts,
      created_at: new Date().toISOString(),
      action_recommendation: triageResult.action_recommendation || "Dispatch inspection squad.",
      is_duplicate: false
    };

    // Add to ticket registry
    setTickets((prev) => [newTicket, ...prev]);

    // Close review modal & switch to Officer Dashboard
    setReviewModalData(null);
    setRole('officer');
    setActiveModalTicket(newTicket);

    // Sync with backend asynchronously
    fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        citizen_text: newTicket.citizen_text,
        location: newTicket.location,
        citizen_name: newTicket.citizen_name,
        citizen_phone: newTicket.citizen_phone
      })
    }).catch(() => {});
  };

  const handleUpdateStatus = (id, newStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    if (activeModalTicket && activeModalTicket.id === id) {
      setActiveModalTicket((prev) => ({ ...prev, status: newStatus }));
    }

    // Attempt backend update
    fetch(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).catch(() => {});
  };

  const handleResetDemo = () => {
    if (confirm('Reset CivicLens database to 3 initial demo tickets?')) {
      setTickets(initialDemoTickets);
      localStorage.removeItem('civiclens_tickets');
      fetch('/api/tickets/reset', { method: 'POST' }).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans">
      
      {/* Header & Role Switcher */}
      <Header
        currentRole={role}
        onRoleChange={setRole}
        onResetDemo={handleResetDemo}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
        {role === 'citizen' ? (
          <CitizenIntake
            onSubmitComplaint={handleComplaintSubmit}
            isSubmitting={isSubmitting}
          />
        ) : (
          <OfficerDashboard
            tickets={sortedTickets}
            onUpdateStatus={handleUpdateStatus}
            onSelectTicket={setActiveModalTicket}
          />
        )}
      </main>

      {/* Citizen Triage Review Modal with 3 Dispatch Options */}
      {reviewModalData && (
        <CitizenReviewModal
          triageResult={reviewModalData.triageResult}
          originalInput={reviewModalData.originalInput}
          evidence={reviewModalData.evidence}
          onConfirmDispatch={handleConfirmDispatch}
          onClose={() => setReviewModalData(null)}
        />
      )}

      {/* Ticket Inspection Modal */}
      {activeModalTicket && (
        <TicketModal
          ticket={activeModalTicket}
          onClose={() => setActiveModalTicket(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Mobile-first sticky bottom role bar */}
      <nav className="sm:hidden sticky bottom-0 z-40 bg-[#0e131f]/95 border-t border-slate-800/80 px-4 py-2 flex items-center justify-around text-xs">
        <button
          onClick={() => setRole('citizen')}
          className={`flex flex-col items-center gap-1 font-semibold ${
            role === 'citizen' ? 'text-cyan-400' : 'text-slate-500'
          }`}
        >
          <span>Citizen Portal</span>
        </button>
        <button
          onClick={() => setRole('officer')}
          className={`flex flex-col items-center gap-1 font-semibold ${
            role === 'officer' ? 'text-cyan-400' : 'text-slate-500'
          }`}
        >
          <span>Officer Center</span>
        </button>
      </nav>

    </div>
  );
}
