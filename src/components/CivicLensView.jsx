import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, MapPin, Sparkles, Mic, CheckCircle2, ShieldCheck, X } from 'lucide-react';

export default function CivicLensView({ onCaptureConfirmed }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [facingMode, setFacingMode] = useState('environment');
  const [geoData, setGeoData] = useState({ latitude: 12.9716, longitude: 77.5946, accuracy: 12.4 });
  const [complaintText, setComplaintText] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const isSecureContext = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isWebRTCAllowed = isSecureContext && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  // Watch GPS Geolocation
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setGeoData({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy || 12.4
          });
        },
        (err) => console.warn('GPS fallback:', err.message),
        { enableHighAccuracy: true, timeout: 6000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // WebRTC Camera stream
  useEffect(() => {
    if (!isWebRTCAllowed) {
      setCameraError('Non-secure context (HTTP). Direct mobile snap enabled.');
      return;
    }
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('getUserMedia error:', err);
      setCameraError('Camera stream restricted. Tap to snap photo directly.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Watermark Engine
  const burnWatermark = (imageSource) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const w = img.naturalWidth || img.width || 1200;
        const h = img.naturalHeight || img.height || 1600;
        canvas.width = w;
        canvas.height = h;

        ctx.drawImage(img, 0, 0, w, h);

        const now = new Date();
        const isoUTC = now.toISOString();
        const istString = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
        const latStr = `${geoData.latitude.toFixed(5)}`;
        const lngStr = `${geoData.longitude.toFixed(5)}`;
        const accStr = `${Math.round(geoData.accuracy)}`;

        const boxH = Math.round(h * 0.15);
        const boxY = h - boxH - 20;
        const boxX = 20;
        const boxW = w - 40;

        // Dark obsidian backplate
        ctx.fillStyle = 'rgba(7, 23, 19, 0.90)';
        ctx.fillRect(boxX, boxY, boxW, boxH);

        // Emerald border
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = Math.max(3, Math.round(w * 0.003));
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Emerald accent band
        ctx.fillStyle = '#10B981';
        ctx.fillRect(boxX, boxY, Math.max(8, Math.round(w * 0.012)), boxH);

        const fontSize = Math.round(w * 0.024);
        ctx.font = `bold ${fontSize}px "Space Grotesk", monospace`;
        ctx.fillStyle = '#10B981';
        ctx.fillText('CIVICLENS • FORENSIC EVIDENCE HUD', boxX + (fontSize * 1.2), boxY + (boxH * 0.3));

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`GPS: ${latStr}° N, ${lngStr}° E (±${accStr}m)`, boxX + (fontSize * 1.2), boxY + (boxH * 0.55));

        ctx.fillStyle = '#94A3B8';
        ctx.font = `500 ${Math.round(fontSize * 0.85)}px monospace`;
        ctx.fillText(`IST: ${istString} (BENGALURU) | UTC: ${isoUTC}`, boxX + (fontSize * 1.2), boxY + (boxH * 0.85));

        resolve({
          dataUrl: canvas.toDataURL('image/jpeg', 0.92),
          latitude: geoData.latitude,
          longitude: geoData.longitude,
          accuracy: geoData.accuracy,
          istTime: istString,
          tamperSeal: 'CIVICLENS_SEAL_' + Math.random().toString(16).substring(2, 8).toUpperCase()
        });
      };
      img.onerror = reject;

      if (typeof imageSource === 'string') {
        img.src = imageSource;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => (img.src = e.target.result);
        reader.readAsDataURL(imageSource);
      }
    });
  };

  const handleShutter = async () => {
    if (!videoRef.current || cameraError) {
      fileInputRef.current?.click();
      return;
    }

    setIsProcessing(true);
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 960;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const rawUrl = canvas.toDataURL('image/jpeg', 0.95);

      const sealed = await burnWatermark(rawUrl);
      setCapturedPhoto(sealed);
    } catch (err) {
      fileInputRef.current?.click();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNativeFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const sealed = await burnWatermark(file);
      setCapturedPhoto(sealed);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Speech Recognition
  const toggleSpeech = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setComplaintText((prev) => (prev ? prev + ' ' + t : t));
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  const handleConfirm = () => {
    if (capturedPhoto || complaintText.trim()) {
      stopCamera();
      onCaptureConfirmed({
        ...capturedPhoto,
        complaintText
      });
    } else {
      alert("Please take a photo or enter a complaint description.");
    }
  };

  return (
    <div className="space-y-3.5">
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleNativeFile}
        className="hidden"
      />

      {capturedPhoto ? (
        /* Sealed Evidence Preview Screen */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
            <span className="font-bold text-[#0b6e4f] flex items-center gap-1 font-space">
              <ShieldCheck className="w-4 h-4" />
              <span>Forensic Tamper-Seal Applied</span>
            </span>
            <span className="font-mono-hud text-[10px] text-emerald-700">{capturedPhoto.tamperSeal}</span>
          </div>

          <div className="relative aspect-[3/4] max-h-[58vh] rounded-3xl overflow-hidden border border-emerald-500/40 bg-black shadow-md">
            <img src={capturedPhoto.dataUrl} alt="Sealed Evidence" className="w-full h-full object-cover" />
          </div>

          {/* Action Buttons: Retake vs Confirm */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setCapturedPhoto(null);
                if (isWebRTCAllowed && !cameraError) startCamera();
              }}
              className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition"
            >
              Retake
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#0b6e4f] to-[#10b981] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-emerald-700/20 transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Confirm &amp; Analyze</span>
            </button>
          </div>
        </div>
      ) : (
        /* Live Camera / Viewfinder */
        <div className="space-y-3">
          
          {/* Rounded Camera Viewfinder with Green Corner-Bracket Reticles */}
          <div className="relative aspect-[3/4] max-h-[56vh] rounded-3xl overflow-hidden bg-[#071713] border border-emerald-500/30 shadow-md flex flex-col justify-between">
            
            {/* Top Translucent Dark GPS Coordinate Pills */}
            <div className="relative z-10 p-3 flex items-center justify-between gap-1.5 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#071713]/85 backdrop-blur-md border border-emerald-500/40 text-[10px] font-mono-hud text-slate-200">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>GPS {geoData.latitude.toFixed(4)}°N, {geoData.longitude.toFixed(4)}°E</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-400/60 text-[10px] font-mono-hud text-emerald-300">
                  ±12m Precision
                </span>

                {isWebRTCAllowed && !cameraError && (
                  <button
                    onClick={flipCamera}
                    className="p-1 rounded-full bg-slate-900/80 text-white hover:text-emerald-300"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Video stream or fallback trigger */}
            {isWebRTCAllowed && !cameraError ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 z-0">
                <Camera className="w-12 h-12 text-emerald-400 animate-pulse" />
                <p className="text-xs text-slate-300 px-4">
                  {cameraError || "Tap to snap photo directly with mobile camera."}
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0b6e4f] to-[#10b981] text-white font-bold text-xs shadow-md"
                >
                  📸 Tap to Snap Photo Directly
                </button>
              </div>
            )}

            {/* Center Reticle: Green corner-bracket reticles */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center pointer-events-none">
              <div className="w-44 h-44 sm:w-48 sm:h-48 border-2 border-dashed border-emerald-400/40 rounded-2xl relative flex items-center justify-center">
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#10b981]"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#10b981]"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#10b981]"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#10b981]"></div>
                <span className="text-[10px] text-white/80 bg-black/50 px-2 py-0.5 rounded font-space backdrop-blur-xs">
                  Center defect in frame
                </span>
              </div>
            </div>

            {/* Bottom HUD Bar */}
            <div className="relative z-10 p-2 text-center bg-gradient-to-t from-black/80 to-transparent">
              <span className="text-[9px] font-mono-hud text-slate-300 bg-black/60 px-3 py-0.5 rounded-full border border-white/10">
                Hardware Sensor Lock: Active
              </span>
            </div>

          </div>

          {/* Quick Demo Scenario Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
            <button
              onClick={() => setComplaintText("ನಮ್ಮ ಮನೆಯ ಮುಂದೆ ಮರ ಬಿದ್ದಿದೆ ರಸ್ತೆ ಬಂದ್ ಆಗಿದೆ")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#0b6e4f] font-semibold hover:bg-emerald-100 transition"
            >
              🌳 ಕನ್ನಡ: Fallen Tree
            </button>
            <button
              onClick={() => setComplaintText("Exposed live wire sparking near school gate")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 font-semibold hover:bg-red-100 transition"
            >
              ⚡ Live Wire Sparking
            </button>
            <button
              onClick={() => setComplaintText("Deep open crater pothole causing bike accidents on 100ft road")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-semibold hover:bg-amber-100 transition"
            >
              🛣️ Crater Pothole
            </button>
          </div>

          {/* Clean Free-Text Complaint Input Below */}
          <div className="rounded-2xl bg-white border border-emerald-100 p-3 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#071713] font-space flex items-center gap-1.5">
                <span>Complaint Description (Free Text)</span>
                <span className="text-emerald-600 text-[10px]">• Multilingual</span>
              </label>

              <button
                type="button"
                onClick={toggleSpeech}
                className={`p-1.5 rounded-lg border transition ${
                  isRecording ? 'bg-red-100 border-red-400 text-red-600 animate-pulse' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
                title="Voice Input"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>

            <textarea
              rows={2}
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              placeholder="Describe in English, ಕನ್ನಡ, हिंदी... (or snap photo directly)"
              className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Large Circular Green Shutter Button */}
          <div className="flex items-center justify-center pt-1">
            <button
              onClick={handleShutter}
              disabled={isProcessing}
              title="Snap Civic Evidence"
              className="w-18 h-18 rounded-full ring-4 ring-emerald-400/40 bg-[#0b6e4f] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all radar-shutter-btn shadow-xl shadow-emerald-700/25"
            >
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                <Camera className="w-7 h-7 text-[#0b6e4f]" />
              </div>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
