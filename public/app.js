// CivicLens Client Application Logic

let allTickets = [];
let activeFilters = {
  severity: 'ALL',
  category: 'ALL',
  status: 'ALL',
  search: ''
};
let activeModalTicket = null;
let speechRecognition = null;
let isRecording = false;

// Sample demo scenarios for instant hackathon demonstration
const demoScenarios = {
  1: {
    text: "बिजली का तार खंभे से टूटकर सड़क पर गिर गया है और बारिश हो रही है, पास में बच्चे खेल रहे हैं!",
    location: "Ward 42, Near Govt Primary School, 8th Cross",
    name: "Ramesh Sharma / +91 98451 23456"
  },
  2: {
    text: "Main water pipeline burst at 4th block junction, flooding the entire street and entering local commercial shops.",
    location: "4th Block Commercial Complex Junction, MG Road",
    name: "Anita Deshmukh / +91 97412 87654"
  },
  3: {
    text: "ಕಸದ ತೊಟ್ಟಿ ತುಂಬಿ ರಸ್ತೆಗೆ ಹರಡಿದೆ, ಬೀದಿ ನಾಯಿಗಳು ಕಸವನ್ನು ಎಲ್ಲೆಡೆ ಎಳೆದಾಡುತ್ತಿವೆ, ತುಂಬಾ ದುರ್ವಾಸನೆ ಬರುತ್ತಿದೆ.",
    location: "Ward 18, Residential Area, 2nd Main Road",
    name: "Venkatesh Rao / +91 94480 33221"
  },
  4: {
    text: "Open deep stormwater manhole without any cover or warning sign directly outside the DPS kindergarten gate. It is waterlogged and invisible at night.",
    location: "DPS Kindergarten Gate, Outer Ring Road Service Lane",
    name: "Dr. Arvind Kumar / +91 99123 45678"
  }
};

// Category icon map
const categoryIcons = {
  electricity: 'zap',
  roads: 'milestone',
  water: 'droplets',
  waste: 'trash-2',
  drainage: 'layers',
  trees: 'trees'
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  fetchTickets();
  fetchStats();
  initVoiceRecognition();
  lucide.createIcons();
});

// Switch between Officer and Citizen views
function switchView(viewName) {
  const officerView = document.getElementById('officerView');
  const citizenView = document.getElementById('citizenView');
  const tabOfficerBtn = document.getElementById('tabOfficerBtn');
  const tabCitizenBtn = document.getElementById('tabCitizenBtn');

  if (viewName === 'officer') {
    officerView.classList.remove('hidden');
    citizenView.classList.add('hidden');

    tabOfficerBtn.className = "px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md";
    tabCitizenBtn.className = "px-4 py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-white flex items-center gap-2 transition-all";
    fetchTickets();
  } else {
    officerView.classList.add('hidden');
    citizenView.classList.remove('hidden');

    tabCitizenBtn.className = "px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md";
    tabOfficerBtn.className = "px-4 py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-white flex items-center gap-2 transition-all";
  }
  lucide.createIcons();
}

// Fetch tickets from backend
async function fetchTickets() {
  try {
    const res = await fetch('/api/tickets');
    const data = await res.json();
    if (data.success) {
      allTickets = data.tickets;
      applyFilters();
      fetchStats();
    }
  } catch (err) {
    console.error("Error fetching tickets:", err);
  }
}

// Fetch stats for metric cards
async function fetchStats() {
  try {
    const res = await fetch('/api/stats');
    const stats = await res.json();
    document.getElementById('statTotal').innerText = stats.total || 0;
    document.getElementById('statCritical').innerText = stats.critical || 0;
    document.getElementById('statHigh').innerText = stats.high || 0;
  } catch (err) {
    console.error("Error fetching stats:", err);
  }
}

// Filter handling
function setFilter(type, value) {
  activeFilters[type] = value;

  // Update button visual styles
  const group = document.getElementById(type === 'severity' ? 'severityFilterGroup' : 'categoryFilterGroup');
  if (group) {
    const buttons = group.querySelectorAll('button');
    buttons.forEach(btn => {
      if (btn.getAttribute('data-val') === value) {
        btn.classList.add('border-cyan-500', 'text-white', 'ring-1', 'ring-cyan-500');
      } else {
        btn.classList.remove('border-cyan-500', 'text-white', 'ring-1', 'ring-cyan-500');
      }
    });
  }

  applyFilters();
}

function applyFilters() {
  const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  const statusSelect = document.getElementById('statusFilterSelect')?.value || 'ALL';

  activeFilters.search = searchTerm;
  activeFilters.status = statusSelect;

  const filtered = allTickets.filter(ticket => {
    // Severity filter
    if (activeFilters.severity !== 'ALL' && ticket.severity !== activeFilters.severity) {
      return false;
    }
    // Category filter
    if (activeFilters.category !== 'ALL' && ticket.category !== activeFilters.category) {
      return false;
    }
    // Status filter
    if (activeFilters.status !== 'ALL' && ticket.status !== activeFilters.status) {
      return false;
    }
    // Search filter
    if (activeFilters.search) {
      const matchTarget = `${ticket.id} ${ticket.english_summary} ${ticket.citizen_text} ${ticket.department} ${ticket.location} ${ticket.reason}`.toLowerCase();
      if (!matchTarget.includes(activeFilters.search)) {
        return false;
      }
    }
    return true;
  });

  renderTickets(filtered);
}

function clearAllFilters() {
  activeFilters = { severity: 'ALL', category: 'ALL', status: 'ALL', search: '' };
  document.getElementById('searchInput').value = '';
  document.getElementById('statusFilterSelect').value = 'ALL';
  setFilter('severity', 'ALL');
  setFilter('category', 'ALL');
  applyFilters();
}

// Render tickets in Officer Dashboard
function renderTickets(tickets) {
  const container = document.getElementById('ticketsContainer');
  const emptyState = document.getElementById('emptyState');
  const countLabel = document.getElementById('ticketCountLabel');

  if (!container) return;

  countLabel.innerText = `Displaying ${tickets.length} tickets (Sorted by Priority: Critical → Low)`;

  if (tickets.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  container.innerHTML = tickets.map(ticket => {
    const isCritical = ticket.severity === 'Critical';
    const isHigh = ticket.severity === 'High';
    const isMedium = ticket.severity === 'Medium';

    const severityClass = isCritical 
      ? 'badge-critical' 
      : isHigh 
      ? 'badge-high' 
      : isMedium 
      ? 'badge-medium' 
      : 'badge-low';

    const borderHighlight = isCritical 
      ? 'border-red-900/50 hover:border-red-600/80 bg-red-950/10' 
      : isHigh 
      ? 'border-amber-900/40 hover:border-amber-600/70 bg-amber-950/5' 
      : 'border-slate-800/80 hover:border-slate-700 bg-[#0e131f]';

    const iconName = categoryIcons[ticket.category] || 'alert-circle';

    return `
      <div class="glass-card p-4 sm:p-5 rounded-xl border ${borderHighlight} transition-all space-y-3 relative group">
        
        <!-- Header row -->
        <div class="flex flex-wrap items-center justify-between gap-2">
          
          <div class="flex items-center gap-2.5">
            <!-- Severity Badge -->
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${severityClass} flex items-center gap-1.5">
              ${isCritical ? '<span class="w-2 h-2 rounded-full bg-red-500 pulse-critical-ring"></span>' : ''}
              ${ticket.severity}
            </span>

            <!-- Category Badge -->
            <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
              <i data-lucide="${iconName}" class="w-3.5 h-3.5 text-cyan-400"></i>
              <span class="capitalize">${ticket.category}</span>
            </span>

            <!-- Ticket ID -->
            <span class="font-mono-code text-xs text-slate-400 font-semibold">${ticket.id}</span>

            <!-- Duplicate Warning Tag if applicable -->
            ${ticket.is_duplicate ? `
              <span class="px-2 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-800/60 text-[10px] font-semibold flex items-center gap-1">
                <i data-lucide="copy" class="w-3 h-3"></i> Duplicate of ${ticket.duplicate_of}
              </span>
            ` : ''}
          </div>

          <!-- Status toggle dropdown -->
          <div class="flex items-center gap-2">
            <span class="text-[11px] text-slate-400">Status:</span>
            <select onchange="updateTicketStatusInline('${ticket.id}', this.value)" 
              class="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold ${getStatusColor(ticket.status)} focus:outline-none focus:border-cyan-500">
              <option value="Pending" ${ticket.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="In Progress" ${ticket.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Resolved" ${ticket.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
            </select>
          </div>

        </div>

        <!-- English AI Summary & Department -->
        <div class="space-y-1">
          <h3 class="text-sm sm:text-base font-semibold text-white tracking-tight flex items-start justify-between gap-2">
            <span>${escapeHtml(ticket.english_summary)}</span>
          </h3>
          <div class="flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
            <i data-lucide="building-2" class="w-3.5 h-3.5 text-cyan-500 shrink-0"></i>
            <span>${escapeHtml(ticket.department)}</span>
          </div>
        </div>

        <!-- 1-Line AI Severity Justification -->
        <div class="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
          <i data-lucide="info" class="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0"></i>
          <div>
            <strong class="text-slate-200">Severity Justification:</strong>
            <span class="text-slate-300">${escapeHtml(ticket.reason)}</span>
          </div>
        </div>

        <!-- Citizen Raw Grievance & Metadata Footer -->
        <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
          <div class="flex items-center gap-3">
            <span class="flex items-center gap-1 text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              <i data-lucide="languages" class="w-3 h-3 text-cyan-400"></i>
              Original (${ticket.detected_language || 'Auto'}):
              <span class="text-slate-300 truncate max-w-[200px] sm:max-w-[280px]">"${escapeHtml(ticket.citizen_text)}"</span>
            </span>

            ${ticket.location ? `
              <span class="hidden sm:flex items-center gap-1 text-[11px]">
                <i data-lucide="map-pin" class="w-3 h-3 text-slate-500"></i>
                <span class="truncate max-w-[150px]">${escapeHtml(ticket.location)}</span>
              </span>
            ` : ''}

            ${ticket.image_url ? `
              <span class="flex items-center gap-1 text-emerald-400 text-[11px]">
                <i data-lucide="image" class="w-3 h-3"></i> Photo Attached
              </span>
            ` : ''}
          </div>

          <!-- Inspect details button -->
          <button onclick="openModal('${ticket.id}')" class="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium flex items-center gap-1 transition">
            <span>View Full Triage</span>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
          </button>
        </div>

      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function getStatusColor(status) {
  if (status === 'Pending') return 'text-amber-400';
  if (status === 'In Progress') return 'text-cyan-400';
  if (status === 'Resolved') return 'text-emerald-400';
  return 'text-slate-300';
}

// Inline status update
async function updateTicketStatusInline(id, newStatus) {
  try {
    const res = await fetch(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      const idx = allTickets.findIndex(t => t.id === id);
      if (idx !== -1) {
        allTickets[idx].status = newStatus;
      }
      applyFilters();
      fetchStats();
    }
  } catch (err) {
    console.error("Error updating status:", err);
  }
}

// Modal inspection
function openModal(ticketId) {
  const ticket = allTickets.find(t => t.id === ticketId);
  if (!ticket) return;

  activeModalTicket = ticket;

  document.getElementById('modalTicketId').innerText = ticket.id;
  
  const sevBadge = document.getElementById('modalSeverityBadge');
  sevBadge.innerText = ticket.severity.toUpperCase();
  sevBadge.className = `text-xs px-2.5 py-0.5 rounded-full font-bold ${
    ticket.severity === 'Critical' ? 'badge-critical' :
    ticket.severity === 'High' ? 'badge-high' :
    ticket.severity === 'Medium' ? 'badge-medium' : 'badge-low'
  }`;

  document.getElementById('modalCategoryBadge').innerText = ticket.category.toUpperCase();
  document.getElementById('modalSummary').innerText = ticket.english_summary;
  document.getElementById('modalReason').innerText = ticket.reason;
  document.getElementById('modalDept').innerText = ticket.department;
  document.getElementById('modalLanguage').innerText = ticket.detected_language || 'Auto-detected';
  document.getElementById('modalRawText').innerText = ticket.citizen_text;
  document.getElementById('modalLocation').innerText = ticket.location || 'Not provided';
  document.getElementById('modalAction').innerText = ticket.action_recommendation || 'Standard dispatch';

  const modalImgCont = document.getElementById('modalImageContainer');
  const modalImg = document.getElementById('modalImage');
  if (ticket.image_url) {
    modalImg.src = ticket.image_url;
    modalImgCont.classList.remove('hidden');
  } else {
    modalImgCont.classList.add('hidden');
  }

  document.getElementById('ticketModal').classList.remove('hidden');
  lucide.createIcons();
}

function closeModal() {
  document.getElementById('ticketModal').classList.add('hidden');
  activeModalTicket = null;
}

// Update status from inside modal
async function updateTicketStatus(status) {
  if (!activeModalTicket) return;
  await updateTicketStatusInline(activeModalTicket.id, status);
  closeModal();
}

// Auto-fill demo scenarios
function loadSample(id) {
  const sample = demoScenarios[id];
  if (!sample) return;

  document.getElementById('complaintText').value = sample.text;
  document.getElementById('locationInput').value = sample.location;
  document.getElementById('citizenName').value = sample.name;

  // Visual pulse on text box
  const tb = document.getElementById('complaintText');
  tb.focus();
  tb.classList.add('ring-2', 'ring-cyan-500');
  setTimeout(() => tb.classList.remove('ring-2', 'ring-cyan-500'), 800);
}

// Voice input using Web Speech API
function initVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn("Web Speech API not supported on this browser.");
    const vBtn = document.getElementById('voiceBtn');
    if (vBtn) vBtn.title = "Voice recognition not supported in this browser";
    return;
  }

  speechRecognition = new SpeechRecognition();
  speechRecognition.continuous = false;
  speechRecognition.interimResults = false;
  speechRecognition.lang = 'hi-IN'; // defaults to Hindi / English

  speechRecognition.onstart = () => {
    isRecording = true;
    document.getElementById('voiceText').innerText = "Listening...";
    document.getElementById('voiceIcon').classList.add('text-red-500', 'animate-pulse');
  };

  speechRecognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const txtArea = document.getElementById('complaintText');
    txtArea.value = (txtArea.value ? txtArea.value + " " : "") + transcript;
  };

  speechRecognition.onerror = (e) => {
    console.error("Speech recognition error:", e);
    stopVoiceRecording();
  };

  speechRecognition.onend = () => {
    stopVoiceRecording();
  };
}

function toggleVoiceRecording() {
  if (!speechRecognition) {
    alert("Speech recognition is not supported in this browser. Please use Chrome/Edge or type directly.");
    return;
  }
  if (isRecording) {
    speechRecognition.stop();
  } else {
    speechRecognition.start();
  }
}

function stopVoiceRecording() {
  isRecording = false;
  document.getElementById('voiceText').innerText = "Voice Input";
  document.getElementById('voiceIcon').classList.remove('text-red-500', 'animate-pulse');
}

// Image handling
function previewImage(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('previewImg').src = e.target.result;
      document.getElementById('previewName').innerText = file.name;
      document.getElementById('dropzonePrompt').classList.add('hidden');
      document.getElementById('dropzonePreview').classList.remove('hidden');
      lucide.createIcons();
    };
    reader.readAsDataURL(file);
  }
}

function removeImage() {
  const input = document.getElementById('imageInput');
  input.value = '';
  document.getElementById('dropzonePrompt').classList.remove('hidden');
  document.getElementById('dropzonePreview').classList.add('hidden');
}

// Submit complaint to backend
async function handleComplaintSubmit(e) {
  e.preventDefault();

  const text = document.getElementById('complaintText').value.trim();
  const location = document.getElementById('locationInput').value.trim();
  const citizenName = document.getElementById('citizenName').value.trim();
  const imageInput = document.getElementById('imageInput');

  if (!text && (!imageInput.files || imageInput.files.length === 0)) {
    alert("Please provide a complaint description or attach a photo.");
    return;
  }

  // Show loading overlay
  const overlay = document.getElementById('loadingOverlay');
  overlay.classList.remove('hidden');
  lucide.createIcons();

  const formData = new FormData();
  formData.append('citizen_text', text);
  formData.append('location', location);
  formData.append('citizen_name', citizenName);
  if (imageInput.files && imageInput.files[0]) {
    formData.append('image', imageInput.files[0]);
  }

  try {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      body: formData
    });
    const result = await res.json();

    if (result.success) {
      // Reset form
      document.getElementById('complaintForm').reset();
      removeImage();

      // Refresh tickets and switch to Officer Dashboard
      await fetchTickets();
      switchView('officer');

      // Open new ticket in inspection modal to show triage output immediately
      setTimeout(() => {
        openModal(result.ticket.id);
      }, 300);
    } else {
      alert("Error triaging complaint: " + (result.error || "Unknown error"));
    }
  } catch (err) {
    console.error("Submission failed:", err);
    alert("Network error processing complaint. Please verify server connection.");
  } finally {
    overlay.classList.add('hidden');
  }
}

// Reset Demo Data
async function resetDemoData() {
  if (!confirm("Reset database to initial 3 sample tickets?")) return;
  try {
    const res = await fetch('/api/tickets/reset', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      await fetchTickets();
      alert("CivicLens database reset to initial 3 demo tickets!");
    }
  } catch (err) {
    console.error("Error resetting data:", err);
  }
}

// Helper to escape HTML and prevent XSS
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
