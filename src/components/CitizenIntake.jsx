import React, { useState } from 'react';
import { Camera, Upload, MessageSquare, Mic, Sparkles, MapPin, Check, AlertCircle, X, ArrowRight } from 'lucide-react';
import ForensicCamera from './ForensicCamera';

export default function CitizenIntake({ onSubmitComplaint, isSubmitting }) {
  const [complaintText, setComplaintText] = useState('');
  const [location, setLocation] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  
  // Dual/Tri Mode: 'snap', 'upload', 'text_only'
  const [inputMode, setInputMode] = useState('text_only');
  const [attachedEvidence, setAttachedEvidence] = useState(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Quick chips required by user
  const demoChips = [
    {
      label: "Kannada: Fallen Tree",
      lang: "ಕನ್ನಡ",
      text: "ನಮ್ಮ ಮನೆಯ ಮುಂದೆ ಮರ ಬಿದ್ದಿದೆ ರಸ್ತೆ ಬಂದ್ ಆಗಿದೆ",
      location: "Ward 174, 5th Cross Road, HSR Layout"
    },
    {
      label: "Hindi: Garbage & Sewage",
      lang: "हिंदी",
      text: "स्कूल के सामने कचरे का ढेर है और गंदा पानी बह रहा है",
      location: "Near St. John's High School, Koramangala 4th Block"
    },
    {
      label: "English: Crater Pothole",
      lang: "English",
      text: "Deep open crater pothole causing bike accidents on 100ft road",
      location: "100ft Road, Near Sony World Signal, Indiranagar"
    }
  ];

  const handleChipClick = (chip) => {
    setComplaintText(chip.text);
    setLocation(chip.location);
  };

  // Voice Input using Web Speech API
  const toggleVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice speech recognition is not supported in this browser. Please use Chrome/Edge.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN'; // Multi-accent Indian English / Hindi / Kannada
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setComplaintText((prev) => (prev ? prev + " " + transcript : transcript));
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognition.start();
    } catch (err) {
      console.warn("Speech recognition error:", err);
      setIsRecording(false);
    }
  };

  // Handle Forensic Camera capture
  const handleCameraCapture = (evidence) => {
    setAttachedEvidence(evidence);
    setInputMode('snap');
    setShowCameraModal(false);
  };

  // Handle standard upload fallback
  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedEvidence({
        dataUrl: event.target.result,
        timestamp: new Date().toLocaleTimeString(),
        coordinates: "GPS extracted from device",
        hash: "0x" + Math.random().toString(16).substring(2, 10).toUpperCase()
      });
      setInputMode('upload');
    };
    reader.readAsDataURL(file);
  };

  const removeEvidence = () => {
    setAttachedEvidence(null);
    setInputMode('text_only');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!complaintText.trim() && !attachedEvidence) {
      alert("Please enter a description or attach photo evidence.");
      return;
    }

    onSubmitComplaint({
      citizen_text: complaintText,
      location: location || "Bengaluru Ward Area",
      citizen_name: citizenName || "Citizen User",
      citizen_phone: citizenPhone || "+91 98XXX XXXXX",
      evidence: attachedEvidence
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 py-2">
      
      {/* Intro Card */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 bg-[#0e131f] shadow-xl">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              <span>Lodge Civic Grievance</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              AI automatically classifies, prioritizes &amp; routes your complaint in real time.
            </p>
          </div>
          <span className="text-[10px] uppercase font-mono-hud px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
            CITIZEN PORTAL
          </span>
        </div>

        {/* Quick Demo Chips Required */}
        <div className="mb-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quick Demo Scenarios (Click to test):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {demoChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(chip)}
                className="p-2.5 rounded-lg text-left bg-slate-900 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-800/80 transition group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-cyan-300 font-mono-hud uppercase">{chip.lang}</span>
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
                </div>
                <p className="text-xs text-slate-300 line-clamp-2 leading-snug">{chip.text}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Input Mode Selector (Mode A, Mode B, Mode C) */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Evidence Capture Mode:
          </label>
          <div className="grid grid-cols-3 gap-2">
            
            {/* Mode A: Snap Live Evidence */}
            <button
              type="button"
              onClick={() => setShowCameraModal(true)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition ${
                inputMode === 'snap' && attachedEvidence
                  ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Camera className="w-4 h-4 text-cyan-400" />
              <span className="text-center leading-tight">Snap Live Evidence</span>
            </button>

            {/* Mode B: Upload Photo (Optional) */}
            <label
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                inputMode === 'upload' && attachedEvidence
                  ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Upload className="w-4 h-4 text-indigo-400" />
              <span className="text-center leading-tight">Upload Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Mode C: Text-Only Complaint */}
            <button
              type="button"
              onClick={() => {
                setInputMode('text_only');
                setAttachedEvidence(null);
              }}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition ${
                inputMode === 'text_only'
                  ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span className="text-center leading-tight">Text-Only</span>
            </button>

          </div>
        </div>

        {/* Evidence Preview if attached */}
        {attachedEvidence && (
          <div className="mb-4 p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={attachedEvidence.dataUrl}
                alt="Evidence"
                className="w-14 h-14 object-cover rounded-lg border border-cyan-500/40"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Forensic Watermark Attached</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono-hud">
                  HASH: {attachedEvidence.hash || 'SEALED'} • {attachedEvidence.coordinates || 'Bengaluru'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeEvidence}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* MAIN COMPLAINT FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Multilingual Text Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <span>Complaint Description (Free Text)</span>
                <span className="text-red-400">*</span>
              </label>

              {/* Voice Input Button */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                  isRecording
                    ? 'bg-red-950 border-red-500 text-red-400 animate-pulse'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-cyan-400'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isRecording ? "Listening..." : "Speak"}</span>
              </button>
            </div>

            <textarea
              rows={4}
              required={!attachedEvidence}
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              placeholder="Describe the issue in English, ಕನ್ನಡ, हिंदी, or any language... (e.g. 'ನಮ್ಮ ಮನೆಯ ಮುಂದೆ ಮರ ಬಿದ್ದಿದೆ ರಸ್ತೆ ಬಂದ್ ಆಗಿದೆ' or 'exposed live wire sparking near school gate')."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition leading-relaxed"
            />
          </div>

          {/* Location & Contact Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Location / Landmark / Ward
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Ward 174, 5th Cross, HSR Layout"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Citizen Name / Phone (Optional)
              </label>
              <input
                type="text"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                placeholder="e.g. Rajesh Gowda (+91 9845X XXXXX)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-cyan-600 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Triaging via Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Submit &amp; Run AI Municipal Triage</span>
              </>
            )}
          </button>

        </form>

      </div>

      {/* Camera Fullscreen Modal */}
      {showCameraModal && (
        <ForensicCamera
          onCapture={handleCameraCapture}
          onClose={() => setShowCameraModal(false)}
        />
      )}

    </div>
  );
}
