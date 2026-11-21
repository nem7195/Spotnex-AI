import React, { useState, useEffect } from 'react';
import CivicLensNavbar from './components/CivicLensNavbar';
import SubHeaderToggles from './components/SubHeaderToggles';
import CivicLensBottomNav from './components/CivicLensBottomNav';
import CivicFeedView from './components/CivicFeedView';
import CivicPriorityDeck from './components/CivicPriorityDeck';
import CivicLensView from './components/CivicLensView';
import CivicLiveMapView from './components/CivicLiveMapView';
import CivicTrackerView from './components/CivicTrackerView';
import OfficerDashboard from './components/OfficerDashboard';
import TriageReviewModal from './components/TriageReviewModal';
import TicketModal from './components/TicketModal';
import LegalShieldModal from './components/LegalShieldModal';
import LoginOnboardingView from './components/LoginOnboardingView';
import { initialDemoTickets, triageHazardAPI } from './utils/triageEngine';

const severityRank = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('spotnex_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: 'Rajesh Gowda',
      roleOrOrg: 'Resident (Ward 174, HSR Layout)',
      mobile: '+91 98451 23456',
      email: 'rajesh.gowda@spotnex.gov.in'
    };
  });

  const [showLoginScreen, setShowLoginScreen] = useState(() => {
    // First screen user sees on visit
    return !sessionStorage.getItem('spotnex_entered');
  });

  const [viewMode, setViewMode] = useState('citizen'); // 'citizen' | 'officer'
  const [layoutMode, setLayoutMode] = useState('mobile'); // 'mobile' | 'web'
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'priority' | 'lens' | 'map' | 'tracker'
  const [currentLang, setCurrentLang] = useState('en'); // 'en' (default) | 'kn' | 'hi'

  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem('civiclens_tickets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].image_url) {
          return parsed;
        }
      } catch (e) { /* ignore */ }
    }
    return initialDemoTickets;
  });

  const [activeModalTicket, setActiveModalTicket] = useState(null);
  const [reviewModalData, setReviewModalData] = useState(null);
  const [gatekeeperError, setGatekeeperError] = useState(null);
  const [showLegalShield, setShowLegalShield] = useState(false);
  const [isTriaging, setIsTriaging] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('civiclens_tickets', JSON.stringify(tickets));
  }, [tickets]);

  // Sync with backend
  useEffect(() => {
    fetch('/api/tickets')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.tickets?.length) {
          setTickets(data.tickets);
        }
      })
      .catch(() => {});
  }, []);

  // Sorted tickets: Critical -> High -> Medium -> Low
  const sortedTickets = [...tickets].sort((a, b) => {
    const sDiff = (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
    if (sDiff !== 0) return sDiff;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Called when evidence is captured in LENS
  const handleEvidenceConfirmed = async (evidenceData) => {
    setIsTriaging(true);
    try {
      const triage = await triageHazardAPI({
        complaintText: evidenceData.complaintText || "Forensic photo attached",
        imageBase64: evidenceData.dataUrl || null,
        latitude: evidenceData.latitude || 12.9716,
        longitude: evidenceData.longitude || 77.5946,
        citizen_name: currentUser ? `${currentUser.name} (${currentUser.roleOrOrg || 'Citizen'})` : "Rajesh Gowda (Citizen)"
      });

      // AI-Slop & Authenticity Gatekeeper Verification
      if (triage.is_authentic === false) {
        setGatekeeperError({
          reason: triage.authenticity_reason || "Suspected AI-generated, synthetic, or non-authentic civic media.",
          evidence: evidenceData
        });
        setActiveTab('lens');
        return;
      }

      setGatekeeperError(null);
      setReviewModalData({
        triageResult: triage,
        evidence: evidenceData,
        complaintText: evidenceData.complaintText
      });
    } catch (err) {
      console.error('Triage error:', err);
      alert('Error triaging complaint.');
    } finally {
      setIsTriaging(false);
    }
  };

  // Called when user completes dispatch in TriageReviewModal
  const handleConfirmDispatch = (finalTriage) => {
    const { evidence, complaintText } = reviewModalData;

    const newTicket = {
      id: `SPX-${Math.floor(1000 + Math.random() * 9000)}`,
      citizen_text: complaintText || "Forensic camera evidence",
      detected_language: finalTriage.detected_language || "English",
      category: finalTriage.category || "roads",
      severity: finalTriage.severity || "Medium",
      reason: finalTriage.one_line_reason || finalTriage.reason,
      one_line_reason: finalTriage.one_line_reason,
      department: finalTriage.department || "BBMP Municipal Corporation",
      department_details: finalTriage.department_details,
      english_summary: finalTriage.english_summary,
      status: 'Pending',
      location: `Ward 174, Bengaluru (GPS: ${evidence?.latitude?.toFixed(4) || '12.9716'}°, ${evidence?.longitude?.toFixed(4) || '77.5946'}°)`,
      citizen_name: currentUser?.name || 'Rajesh Gowda',
      citizen_phone: currentUser?.mobile || '+91 98451 23456',
      image_url: evidence?.dataUrl || null,
      watermark_hash: evidence?.tamperSeal || 'SPOTNEX_SEAL_0x8F',
      action_drafts: finalTriage.action_drafts,
      created_at: new Date().toISOString(),
      action_recommendation: finalTriage.action_recommendation || "Dispatch response crew.",
      upvotes_count: 1,
      is_duplicate: false,
      is_authentic: true,
      authenticity_badge: "AI-Verified Authentic"
    };

    setTickets((prev) => [newTicket, ...prev]);
    setReviewModalData(null);
    setActiveTab('priority'); // Jump to priority ranking
    setActiveModalTicket(newTicket);

    // Sync to backend
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
  };

  const handleResetDemo = () => {
    if (confirm('Reset CivicLens database to initial demo tickets?')) {
      setTickets(initialDemoTickets);
      localStorage.removeItem('civiclens_tickets');
      fetch('/api/tickets/reset', { method: 'POST' }).catch(() => {});
      setActiveTab('feed');
    }
  };

  if (showLoginScreen) {
    return (
      <LoginOnboardingView
        onLoginSuccess={(userData) => {
          setCurrentUser(userData);
          localStorage.setItem('spotnex_user', JSON.stringify(userData));
          sessionStorage.setItem('spotnex_entered', 'true');
          setShowLoginScreen(false);
        }}
        onQuickStartGuest={() => {
          const guestUser = {
            name: 'Guest Citizen',
            roleOrOrg: 'Bengaluru Resident',
            mobile: '+91 98451 23456',
            email: 'guest@spotnex.gov.in'
          };
          setCurrentUser(guestUser);
          sessionStorage.setItem('spotnex_entered', 'true');
          setShowLoginScreen(false);
          setActiveTab('lens'); // Jump straight to camera/intake
        }}
        canReturnToDashboard={!!sessionStorage.getItem('spotnex_entered')}
        onBackToDashboard={() => setShowLoginScreen(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f7f1] via-[#f0fbf7] to-[#f8fafc] text-[#0f172a] flex flex-col font-sans">
      
      {/* 1. Top Navbar: Sticky white bar with Regional Language Toggle & Account Switcher */}
      <CivicLensNavbar
        userRole={viewMode}
        onToggleUserRole={() => setViewMode(viewMode === 'citizen' ? 'officer' : 'citizen')}
        onOpenLegal={() => setShowLegalShield(true)}
        onOpenSettings={() => alert("SpotNex System Status: Online (Gemini Cascade Active, OpenStreetMap Free Tiles, GPS Lock OK)")}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        currentUser={currentUser}
        onOpenLogin={() => setShowLoginScreen(true)}
        onLogoClick={() => {
          setViewMode('citizen');
          setActiveTab('priority');
        }}
        onSelectAccount={(acc) => {
          if (acc.role === 'officer') {
            setViewMode('officer');
          } else {
            setViewMode('citizen');
            const updated = {
              name: acc.name,
              roleOrOrg: acc.roleOrOrg,
              mobile: acc.mobile,
              email: acc.email
            };
            setCurrentUser(updated);
            localStorage.setItem('spotnex_user', JSON.stringify(updated));
          }
        }}
      />

      {/* 2. Sub-header: Dark pill toggle + Light pill toggle */}
      <SubHeaderToggles
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        layoutMode={layoutMode}
        onLayoutModeChange={setLayoutMode}
        currentLang={currentLang}
      />

      {/* 3. App Container: Centered rounded frame (max-w-lg in mobile, max-w-5xl in web) */}
      <div className={`w-full mx-auto px-2 sm:px-4 pb-8 transition-all duration-300 ${
        layoutMode === 'mobile' ? 'max-w-lg' : 'max-w-5xl'
      }`}>
        <div className="bg-white rounded-3xl soft-card-shadow border border-emerald-100/90 overflow-hidden relative min-h-[80vh] flex flex-col justify-between">
          
          {/* Main Views Container */}
          <div className="p-3.5 sm:p-5 flex-1">
            {viewMode === 'officer' ? (
              /* Officer Dashboard View */
              <OfficerDashboard
                tickets={sortedTickets}
                onUpdateStatus={handleUpdateStatus}
                onSelectTicket={setActiveModalTicket}
              />
            ) : (
              /* Citizen 5-Tab Views */
              <>
                {activeTab === 'feed' && (
                  <CivicFeedView
                    tickets={sortedTickets}
                    onOpenLens={() => setActiveTab('lens')}
                    onSelectTicket={setActiveModalTicket}
                    currentLang={currentLang}
                  />
                )}

                {activeTab === 'priority' && (
                  <CivicPriorityDeck
                    tickets={sortedTickets}
                    onSelectTicket={setActiveModalTicket}
                    onQuickDispatch={(ticket) => {
                      handleUpdateStatus(ticket.id, 'In Progress');
                      alert(`Emergency crew dispatched for ${ticket.id} (${ticket.department})!`);
                    }}
                    currentLang={currentLang}
                  />
                )}

                {activeTab === 'lens' && (
                  <CivicLensView
                    onCaptureConfirmed={handleEvidenceConfirmed}
                    currentLang={currentLang}
                    gatekeeperError={gatekeeperError}
                    onClearGatekeeperError={() => setGatekeeperError(null)}
                  />
                )}

                {activeTab === 'map' && (
                  <CivicLiveMapView
                    tickets={sortedTickets}
                    onSelectTicket={setActiveModalTicket}
                    currentLang={currentLang}
                  />
                )}

                {activeTab === 'tracker' && (
                  <CivicTrackerView
                    tickets={sortedTickets}
                    onResetDemo={handleResetDemo}
                    currentLang={currentLang}
                  />
                )}
              </>
            )}
          </div>

          {/* Sticky 5-Tab Bottom Navigation (Only in Citizen View) */}
          {viewMode === 'citizen' && (
            <CivicLensBottomNav
              activeTab={activeTab}
              onTabChange={setActiveTab}
              currentLang={currentLang}
            />
          )}

        </div>
      </div>

      {/* Review & Triage Modal */}
      {reviewModalData && (
        <TriageReviewModal
          triageResult={reviewModalData.triageResult}
          evidence={reviewModalData.evidence}
          onConfirmDispatch={handleConfirmDispatch}
          onRetake={() => {
            setReviewModalData(null);
            setActiveTab('lens');
          }}
          onClose={() => setReviewModalData(null)}
          currentLang={currentLang}
        />
      )}

      {/* Detailed Ticket Modal */}
      {activeModalTicket && (
        <TicketModal
          ticket={activeModalTicket}
          onClose={() => setActiveModalTicket(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Legal Shield Modal */}
      {showLegalShield && (
        <LegalShieldModal
          onClose={() => setShowLegalShield(false)}
        />
      )}

      {/* Triage Loading Overlay */}
      {isTriaging && (
        <div className="fixed inset-0 z-50 bg-[#071713]/85 backdrop-blur-md flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-400/20 border-t-emerald-400 animate-spin"></div>
          <div className="text-center">
            <span className="font-bold text-sm text-white font-space">SpotNex AI Triaging...</span>
            <p className="text-[11px] text-emerald-200">Processing visual evidence u/s 133 CrPC</p>
          </div>
        </div>
      )}

    </div>
  );
}
