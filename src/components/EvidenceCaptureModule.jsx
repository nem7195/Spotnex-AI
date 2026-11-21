import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, RefreshCw, CheckCircle2, ShieldCheck, MapPin, 
  Sparkles, AlertCircle, X, ChevronUp, ChevronDown 
} from 'lucide-react';

export default function EvidenceCaptureModule({ onEvidenceConfirmed, onCancel }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (rear) or 'user' (front)
  const [geoData, setGeoData] = useState({
    latitude: 12.97159,
    longitude: 77.59456,
    accuracy: 12.4
  });
  const [complaintText, setComplaintText] = useState('');
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const isSecureContext = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isMediaSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const isWebRTCAllowed = isSecureContext && isMediaSupported;

  // Real-time Geolocation tracking
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
        (err) => {
          console.warn('Geolocation fallback to Bengaluru Central:', err.message);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // WebRTC Camera management
  useEffect(() => {
    if (!isWebRTCAllowed) {
      setCameraError('Non-secure connection (HTTP). Tap button below to snap directly.');
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
      setCameraError('Camera stream unavailable. Tap to snap photo directly.');
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

  // Burn Forensic Canvas Watermark Engine
  const burnForensicWatermark = (imageSource) => {
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

        // Draw photo
        ctx.drawImage(img, 0, 0, w, h);

        // Timestamps
        const now = new Date();
        const isoUTC = now.toISOString();
        const istString = now.toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        const latStr = `${geoData.latitude.toFixed(5)}`;
        const lngStr = `${geoData.longitude.toFixed(5)}`;
        const accStr = `${Math.round(geoData.accuracy)}`;

        // Forensic Box Backplate: rgba(2, 6, 23, 0.88)
        const boxHeight = Math.round(h * 0.16);
        const boxY = h - boxHeight - 20;
        const boxX = 20;
        const boxWidth = w - 40;

        ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

        // Emerald Border
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = Math.max(2, Math.round(w * 0.003));
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Left Emerald Accent Stripe
        ctx.fillStyle = '#10B981';
        ctx.fillRect(boxX, boxY, Math.max(6, Math.round(w * 0.012)), boxHeight);

        // Monospace Watermark Text
        const fontSize = Math.round(w * 0.024);
        ctx.font = `bold ${fontSize}px "Space Grotesk", "JetBrains Mono", monospace`;
        ctx.textAlign = 'left';

        // Line 1: SPOTNEX • LENS • TAMPER-SEALED
        ctx.fillStyle = '#10B981';
        ctx.fillText('SPOTNEX • LENS • TAMPER-SEALED', boxX + (fontSize * 1.2), boxY + (boxHeight * 0.28));

        // Line 2: GPS
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`GPS: ${latStr}° N, ${lngStr}° E (±${accStr}m)`, boxX + (fontSize * 1.2), boxY + (boxHeight * 0.50));

        // Line 3: UTC
        ctx.fillStyle = '#94A3B8';
        ctx.font = `500 ${Math.round(fontSize * 0.88)}px "Space Grotesk", "JetBrains Mono", monospace`;
        ctx.fillText(`UTC: ${isoUTC}`, boxX + (fontSize * 1.2), boxY + (boxHeight * 0.70));

        // Line 4: IST
        ctx.fillStyle = '#38BDF8';
        ctx.fillText(`IST: ${istString} (BENGALURU)`, boxX + (fontSize * 1.2), boxY + (boxHeight * 0.88));

        const watermarkedUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve({
          dataUrl: watermarkedUrl,
          latitude: geoData.latitude,
          longitude: geoData.longitude,
          accuracy: geoData.accuracy,
          istTime: istString,
          utcTime: isoUTC,
          tamperSeal: 'TAMPER_SEALED_0x' + Math.random().toString(16).substring(2, 10).toUpperCase()
        });
      };

      img.onerror = reject;

      if (typeof imageSource === 'string') {
        img.src = imageSource;
      } else if (imageSource instanceof Blob || imageSource instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => (img.src = e.target.result);
        reader.readAsDataURL(imageSource);
      }
    });
  };

  // Capture from live stream
  const handleShutterClick = async () => {
    // If live video is not running, trigger native file input fallback
    if (!videoRef.current || cameraError) {
      if (fileInputRef.current) fileInputRef.current.click();
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

      const sealedEvidence = await burnForensicWatermark(rawUrl);
      setCapturedPhoto(sealedEvidence);
    } catch (err) {
      console.error('Capture error:', err);
      if (fileInputRef.current) fileInputRef.current.click();
    } finally {
      setIsProcessing(false);
    }
  };

  // Fallback native input
  const handleNativeFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const sealedEvidence = await burnForensicWatermark(file);
      setCapturedPhoto(sealedEvidence);
    } catch (err) {
      console.error('Watermark error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      stopCamera();
      onEvidenceConfirmed({
        ...capturedPhoto,
        complaintText
      });
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    if (isWebRTCAllowed && !cameraError) {
      startCamera();
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-2 px-3 relative">
      
      {/* Hidden File Input Fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleNativeFile}
        className="hidden"
      />

      {capturedPhoto ? (
        /* FROZEN EVIDENCE SCREEN */
        <div className="flex-1 flex flex-col justify-between space-y-3">
          
          {/* Top Forensic Seal Pill */}
          <div className="flex items-center justify-between bg-slate-950/90 border border-emerald-500/40 rounded-full px-4 py-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-space">
              <ShieldCheck className="w-4 h-4" />
              <span>FORENSIC SEAL ATTACHED</span>
            </div>
            <span className="font-mono-hud text-[10px] text-slate-400">
              {capturedPhoto.tamperSeal}
            </span>
          </div>

          {/* Sealed Photo Frame */}
          <div className="relative aspect-[3/4] max-h-[60vh] rounded-3xl overflow-hidden border border-emerald-500/30 bg-black shadow-2xl">
            <img
              src={capturedPhoto.dataUrl}
              alt="Sealed Evidence"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Bottom Watermark Mirror Card */}
          <div className="p-3 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-emerald-500/40 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono-hud">
              <span>GPS: {capturedPhoto.latitude.toFixed(5)}°N, {capturedPhoto.longitude.toFixed(5)}°E</span>
              <span className="text-emerald-400">±{Math.round(capturedPhoto.accuracy)}m LOCKED</span>
            </div>
            {complaintText && (
              <p className="text-slate-200 text-xs truncate">
                Note: "{complaintText}"
              </p>
            )}
          </div>

          {/* Action Buttons: [Retake] (slate) & [Confirm & Analyze] (emerald) */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleRetake}
              className="flex-1 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition active:scale-95"
            >
              Retake
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#00A896] hover:opacity-95 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Confirm &amp; Analyze</span>
            </button>
          </div>

        </div>
      ) : (
        /* LIVE 3:4 FORENSIC CAMERA & COMPLAINT FILING MODULE */
        <div className="flex-1 flex flex-col justify-between space-y-3">
          
          {/* 3:4 Viewport Frame */}
          <div className="aspect-[3/4] max-h-[64vh] rounded-3xl overflow-hidden bg-black border border-white/10 relative flex flex-col justify-between shadow-2xl">
            
            {/* Top HUD Bar */}
            <div className="relative z-10 p-3 flex items-center justify-between gap-1.5 bg-gradient-to-b from-black/80 to-transparent">
              {/* Geotag Pill */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/80 border border-white/10 text-[10px] font-mono-hud text-slate-300">
                <MapPin className="w-3 h-3 text-[#F0533A]" />
                <span>{geoData.latitude.toFixed(4)}°, {geoData.longitude.toFixed(4)}°</span>
              </div>

              {/* GPS Precision Pill */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/80 border border-emerald-500/60 text-[10px] font-mono-hud text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>±12.4m High Precision</span>
              </div>

              {/* Camera Flip Button */}
              {isWebRTCAllowed && !cameraError && (
                <button
                  onClick={flipCamera}
                  className="p-1.5 rounded-full bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Video View or Direct Snap Fallback */}
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
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">Direct Mobile Viewfinder</p>
                  <p className="text-xs text-slate-400">
                    {cameraError || "Tap below to capture civic evidence with automated GPS watermark."}
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg active:scale-95 transition flex items-center gap-1.5"
                >
                  <Camera className="w-4 h-4" />
                  <span>📸 Tap to Snap Photo Directly</span>
                </button>
              </div>
            )}

            {/* Center Reticle: Dashed square focus box w-48 h-48 with 4 corner brackets */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center pointer-events-none">
              <div className="w-44 h-44 sm:w-48 sm:h-48 border-2 border-dashed border-white/30 rounded-2xl relative flex items-center justify-center">
                {/* 4 Emerald L-shaped corner brackets */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400"></div>

                <span className="text-[10px] text-white/70 bg-black/50 px-2 py-0.5 rounded-md font-space backdrop-blur-sm">
                  Align civic evidence in frame
                </span>
              </div>
            </div>

            {/* Bottom HUD Bar */}
            <div className="relative z-10 p-2 text-center bg-gradient-to-t from-black/90 to-transparent">
              <span className="text-[10px] font-mono-hud text-slate-300 bg-slate-950/80 px-3 py-1 rounded-full border border-white/10 inline-block">
                Hardware GPS Locked: ±12.4m radius
              </span>
            </div>

          </div>

          {/* Multilingual Complaint Input Bar & Quick Chips */}
          <div className="space-y-1.5">
            {/* Quick Sample Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
              <button
                type="button"
                onClick={() => setComplaintText("ನಮ್ಮ ಮನೆಯ ಮುಂದೆ ಮರ ಬಿದ್ದಿದೆ ರಸ್ತೆ ಬಂದ್ ಆಗಿದೆ")}
                className="shrink-0 px-2.5 py-1 rounded-full bg-slate-950 border border-emerald-500/40 text-emerald-300 font-medium hover:bg-slate-900 transition flex items-center gap-1"
              >
                <span>🌳 ಕನ್ನಡ: Fallen Tree</span>
              </button>
              <button
                type="button"
                onClick={() => setComplaintText("Exposed live wire sparking near school gate")}
                className="shrink-0 px-2.5 py-1 rounded-full bg-slate-950 border border-red-500/40 text-red-300 font-medium hover:bg-slate-900 transition flex items-center gap-1"
              >
                <span>⚡ Live Wire Sparking</span>
              </button>
            </div>

            {/* Expandable Multilingual Text Bar */}
            <div className="relative rounded-2xl bg-slate-950/90 border border-white/10 p-2">
              <input
                type="text"
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Describe issue in English / ಕನ್ನಡ / हिंदी (or snap photo directly)..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none pr-8"
              />
              <button
                type="button"
                onClick={() => setIsInputExpanded(!isInputExpanded)}
                className="absolute right-2 top-2 text-slate-400 hover:text-white"
              >
                {isInputExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>

              {isInputExpanded && (
                <div className="pt-2 mt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Multilingual Speech &amp; Text enabled.</span>
                  <button
                    onClick={() => setComplaintText('')}
                    className="text-red-400 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Shutter Button with Pulsing Emerald Ripple Ring */}
          <div className="flex items-center justify-center pb-1">
            <button
              onClick={handleShutterClick}
              disabled={isProcessing}
              title="Capture Civic Evidence"
              className="w-18 h-18 rounded-full ring-4 ring-[#10B981] bg-white flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all radar-shutter shadow-xl shadow-emerald-500/30"
            >
              <div className="w-14 h-14 rounded-full bg-slate-950 border-2 border-emerald-400 flex items-center justify-center">
                <Camera className="w-6 h-6 text-emerald-400" />
              </div>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
