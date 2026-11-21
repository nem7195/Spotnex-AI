import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, MapPin, Sparkles, Mic, CheckCircle2, ShieldCheck, Upload, AlertCircle, FileText, X } from 'lucide-react';
import { getTranslation } from '../utils/i18n';

export default function CivicLensView({ 
  onCaptureConfirmed, 
  currentLang = 'en', 
  gatekeeperError = null, 
  onClearGatekeeperError = null 
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const t = (k) => getTranslation(k, currentLang);

  const [intakeMode, setIntakeMode] = useState('camera'); // 'camera' | 'text'
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

  // WebRTC Camera stream with 1080p ideal wider FOV
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
          width: { ideal: 1920 },
          height: { ideal: 1080 }
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
        const w = img.naturalWidth || img.width || 1920;
        const h = img.naturalHeight || img.height || 1080;
        canvas.width = w;
        canvas.height = h;

        ctx.drawImage(img, 0, 0, w, h);

        const now = new Date();
        const isoUTC = now.toISOString();
        const istString = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
        const latStr = `${geoData.latitude.toFixed(5)}`;
        const lngStr = `${geoData.longitude.toFixed(5)}`;
        const accStr = `${Math.round(geoData.accuracy)}`;

        const boxH = Math.round(h * 0.16);
        const boxY = h - boxH - 20;
        const boxX = 20;
        const boxW = w - 40;

        // Dark obsidian backplate
        ctx.fillStyle = 'rgba(7, 23, 19, 0.92)';
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
        ctx.fillText('SPOTNEX • FORENSIC EVIDENCE HUD', boxX + (fontSize * 1.2), boxY + (boxH * 0.3));

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`GPS: ${latStr}° N, ${lngStr}° E (±${accStr}m)`, boxX + (fontSize * 1.2), boxY + (boxH * 0.58));

        ctx.fillStyle = '#94A3B8';
        ctx.font = `500 ${Math.round(fontSize * 0.82)}px monospace`;
        ctx.fillText(`IST: ${istString} (BENGALURU) | UTC: ${isoUTC}`, boxX + (fontSize * 1.2), boxY + (boxH * 0.85));

        resolve({
          dataUrl: canvas.toDataURL('image/jpeg', 0.92),
          latitude: geoData.latitude,
          longitude: geoData.longitude,
          accuracy: geoData.accuracy,
          istTime: istString,
          tamperSeal: 'SPOTNEX_SEAL_' + Math.random().toString(16).substring(2, 8).toUpperCase()
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
    if (onClearGatekeeperError) onClearGatekeeperError();
    if (!videoRef.current || cameraError) {
      fileInputRef.current?.click();
      return;
    }

    setIsProcessing(true);
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
      const ctx = canvas.getContext('2d');
      // Mirror flip for selfie/preview match so captured image is not inverted
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
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
    if (onClearGatekeeperError) onClearGatekeeperError();
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
    recognition.lang = currentLang === 'kn' ? 'kn-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-IN';
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
        ...(capturedPhoto || {}),
        complaintText: complaintText.trim(),
        latitude: capturedPhoto?.latitude || geoData.latitude,
        longitude: capturedPhoto?.longitude || geoData.longitude
      });
    } else {
      alert("Please take a photo or enter a complaint description.");
    }
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* Hidden native camera/file picker fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleNativeFile}
        className="hidden"
      />

      {/* AI-Slop & Authenticity Gatekeeper Alert Banner */}
      {gatekeeperError && (
        <div className="p-4 rounded-3xl bg-red-50 border-2 border-red-500 shadow-md space-y-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-2xl bg-red-600 text-white shrink-0 mt-0.5 shadow-sm">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black font-space text-red-700 uppercase tracking-wide">
                  {t('gatekeeper_blocked_title')}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-200 text-red-900 font-mono-hud text-[10px] font-bold">
                  AI GATEKEEPER
                </span>
              </div>
              <p className="text-xs text-red-800 font-medium leading-relaxed">
                {gatekeeperError.reason || "The submitted image or text appears synthetic, AI-generated, or not an authentic civic hazard. CivicLens requires genuine live footage or legitimate civic complaints."}
              </p>
            </div>
          </div>

          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={() => {
                if (onClearGatekeeperError) onClearGatekeeperError();
                setCapturedPhoto(null);
                if (isWebRTCAllowed && !cameraError) startCamera();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs font-space uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('gatekeeper_retake_btn')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Clean 2-Option Intake Mode Toggle: Camera | Text */}
      <div className="flex items-center justify-center p-1 rounded-2xl bg-emerald-50 border border-emerald-200/90 max-w-xs mx-auto shadow-2xs font-space">
        <button
          type="button"
          onClick={() => {
            setIntakeMode('camera');
            if (isWebRTCAllowed && !cameraError) startCamera();
          }}
          className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
            intakeMode === 'camera'
              ? 'bg-[#071713] text-[#10b981] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Camera</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setIntakeMode('text');
            stopCamera();
          }}
          className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
            intakeMode === 'text'
              ? 'bg-[#071713] text-[#10b981] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Text</span>
        </button>
      </div>

      {intakeMode === 'text' ? (
        /* Text Intake Mode View */
        <div className="space-y-4">
          <div className="rounded-3xl bg-white border border-emerald-100/90 p-4 sm:p-5 soft-card-shadow space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-[#071713] font-space flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#0b6e4f]" />
                  <span>{t('lens_free_text_label')}</span>
                  <span className="text-emerald-600 text-[10px] font-semibold">{t('lens_multilingual_tag')}</span>
                </span>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Report grievances in English, ಕನ್ನಡ, or हिंदी. Voice dictation supported.
                </p>
              </div>

              <button
                type="button"
                onClick={toggleSpeech}
                className={`p-2 rounded-xl border transition ${
                  isRecording ? 'bg-red-100 border-red-400 text-red-600 animate-pulse' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                title="Voice Dictation"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            {/* Prominent Large Textarea */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3 focus-within:border-emerald-500 focus-within:bg-white transition">
              <textarea
                rows={5}
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder={t('lens_textarea_placeholder')}
                className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none leading-relaxed bg-transparent border-none p-0"
              />
            </div>

            {/* Compact Optional "Camera / Upload Photo" Bubble Pill */}
            <div className="pt-0.5 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase font-mono-hud block">
                Evidence Attachment (Optional):
              </span>

              {capturedPhoto ? (
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={capturedPhoto.dataUrl} alt="Attached Evidence" className="w-12 h-12 rounded-xl object-cover border border-emerald-300 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#0b6e4f] font-space flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Photo Attached</span>
                      </span>
                      <span className="text-[10px] font-mono-hud text-slate-500 block truncate">
                        {capturedPhoto.tamperSeal}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCapturedPhoto(null)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Remove attached photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#0b6e4f] font-bold text-xs border border-emerald-200 transition active:scale-95 shadow-2xs font-space"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#0b6e4f]" />
                    <span>Camera / Upload Photo</span>
                  </button>
                  <span className="text-[11px] text-slate-400 italic">Optional visual evidence</span>
                </div>
              )}
            </div>

            {/* Quick Demo Scenario Chips */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase font-mono-hud">
                {t('lens_quick_chips')}
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                <button
                  onClick={() => setComplaintText("ನಮ್ಮ ಮನೆಯ ಮುಂದೆ ಮರ ಬಿದ್ದಿದೆ ರಸ್ತೆ ಬಂದ್ ಆಗಿದೆ")}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#0b6e4f] font-semibold hover:bg-emerald-100 transition"
                >
                  {t('chip_fallen_tree')}
                </button>
                <button
                  onClick={() => setComplaintText("Exposed live wire sparking near school gate")}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 font-semibold hover:bg-red-100 transition"
                >
                  {t('chip_live_wire')}
                </button>
                <button
                  onClick={() => setComplaintText("Deep open crater pothole causing bike accidents on 100ft road")}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-semibold hover:bg-amber-100 transition"
                >
                  {t('chip_crater')}
                </button>
                <button
                  onClick={() => setComplaintText("ಕಸದ ತೊಟ್ಟಿ ತುಂಬಿ ರಸ್ತೆಗೆ ಹರಡಿದೆ, ತುಂಬಾ ದುರ್ವಾಸನೆ ಬರುತ್ತಿದೆ")}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-800 font-semibold hover:bg-yellow-100 transition"
                >
                  {t('chip_garbage')}
                </button>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono-hud flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {t('lens_support_text')}
              </span>
              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0b6e4f] to-[#10b981] hover:from-[#09583f] hover:to-[#0ea573] text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 active:scale-95 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('lens_run_triage_btn')}</span>
              </button>
            </div>

          </div>
        </div>
      ) : capturedPhoto ? (
        /* Sealed Evidence Preview Screen */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
            <span className="font-bold text-[#0b6e4f] flex items-center gap-1 font-space">
              <ShieldCheck className="w-4 h-4" />
              <span>Forensic Tamper-Seal Applied</span>
            </span>
            <span className="font-mono-hud text-[10px] text-emerald-700">{capturedPhoto.tamperSeal}</span>
          </div>

          {/* Full-width 100% viewfinder photo preview */}
          <div className="relative w-full aspect-[4/3] min-h-[360px] rounded-3xl overflow-hidden border border-emerald-500/40 bg-black shadow-md">
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
              {t('lens_retake')}
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#0b6e4f] to-[#10b981] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-emerald-700/20 transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('lens_confirm_triage')}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Live Camera / Viewfinder - Full Width & Wider FOV */
        <div className="space-y-3.5">
          
          {/* 1. Full-Width Camera Viewfinder (w-full aspect-[4/3] min-h-[380px]) */}
          <div className="relative w-full aspect-[4/3] min-h-[380px] rounded-3xl overflow-hidden bg-[#071713] border border-emerald-500/30 shadow-md flex flex-col justify-between">
            
            {/* Top Translucent Dark GPS Coordinate Pills */}
            <div className="relative z-10 p-3.5 flex items-center justify-between gap-1.5 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#071713]/85 backdrop-blur-md border border-emerald-500/40 text-[11px] font-mono-hud text-slate-200">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>GPS {geoData.latitude.toFixed(4)}°N, {geoData.longitude.toFixed(4)}°E</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/60 text-[10px] font-mono-hud text-emerald-300">
                  {t('lens_precision')}
                </span>

                {isWebRTCAllowed && !cameraError && (
                  <button
                    onClick={flipCamera}
                    className="p-1.5 rounded-full bg-slate-900/80 text-white hover:text-emerald-300 transition"
                    title="Flip Camera"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Video stream with object-cover and 1080p FOV or fallback trigger */}
            {isWebRTCAllowed && !cameraError ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 z-0">
                <Camera className="w-14 h-14 text-emerald-400 animate-pulse" />
                <p className="text-xs text-slate-300 px-4">
                  {cameraError || "Tap to snap photo directly with mobile camera."}
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0b6e4f] to-[#10b981] text-white font-bold text-xs shadow-md"
                >
                  📸 Tap to Snap Photo Directly
                </button>
              </div>
            )}

            {/* Center Reticle: Green corner-bracket reticles */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center pointer-events-none">
              <div className="w-52 h-44 sm:w-60 sm:h-52 border-2 border-dashed border-emerald-400/40 rounded-2xl relative flex items-center justify-center">
                <div className="absolute -top-1.5 -left-1.5 w-5 h-5 border-t-2 border-l-2 border-[#10b981]"></div>
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 border-t-2 border-r-2 border-[#10b981]"></div>
                <div className="absolute -bottom-1.5 -left-1.5 w-5 h-5 border-b-2 border-l-2 border-[#10b981]"></div>
                <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 border-b-2 border-r-2 border-[#10b981]"></div>
                <span className="text-[10px] text-white/90 bg-black/60 px-2.5 py-1 rounded font-space backdrop-blur-xs">
                  {t('lens_reticle_hint')}
                </span>
              </div>
            </div>

            {/* Bottom HUD Bar */}
            <div className="relative z-10 p-2.5 text-center bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between px-4">
              <span className="text-[10px] font-mono-hud text-slate-300 bg-black/60 px-3 py-0.5 rounded-full border border-white/10">
                {t('lens_wide_fov')}
              </span>
              <span className="text-[10px] font-mono-hud text-emerald-400 bg-black/60 px-3 py-0.5 rounded-full border border-emerald-500/30">
                {t('lens_tamper_locked')}
              </span>
            </div>

          </div>

          {/* 2. Shutter & Photo Upload Controls Bar */}
          <div className="flex items-center justify-center gap-6 py-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-2xl bg-white border border-emerald-200 text-slate-700 hover:text-[#0b6e4f] shadow-xs active:scale-95 transition flex flex-col items-center"
              title="Upload Photo from Device"
            >
              <Upload className="w-4 h-4 text-[#0b6e4f]" />
              <span className="text-[9px] font-space font-bold mt-0.5">{t('lens_upload_btn')}</span>
            </button>

            {/* Large Circular Green Shutter Button */}
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

            <button
              onClick={flipCamera}
              className="p-3 rounded-2xl bg-white border border-emerald-200 text-slate-700 hover:text-[#0b6e4f] shadow-xs active:scale-95 transition flex flex-col items-center"
              title="Flip Camera View"
            >
              <RefreshCw className="w-4 h-4 text-[#0b6e4f]" />
              <span className="text-[9px] font-space font-bold mt-0.5">{t('lens_flip_btn')}</span>
            </button>
          </div>

          {/* 3. Quick Demo Scenario Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
            <button
              onClick={() => setComplaintText("ನಮ್ಮ ಮನೆಯ ಮುಂದೆ ಮರ ಬಿದ್ದಿದೆ ರಸ್ತೆ ಬಂದ್ ಆಗಿದೆ")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#0b6e4f] font-semibold hover:bg-emerald-100 transition"
            >
              {t('chip_fallen_tree')}
            </button>
            <button
              onClick={() => setComplaintText("Exposed live wire sparking near school gate")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 font-semibold hover:bg-red-100 transition"
            >
              {t('chip_live_wire')}
            </button>
            <button
              onClick={() => setComplaintText("Deep open crater pothole causing bike accidents on 100ft road")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-semibold hover:bg-amber-100 transition"
            >
              {t('chip_crater')}
            </button>
            <button
              onClick={() => setComplaintText("ಕಸದ ತೊಟ್ಟಿ ತುಂಬಿ ರಸ್ತೆಗೆ ಹರಡಿದೆ, ತುಂಬಾ ದುರ್ವಾಸನೆ ಬರುತ್ತಿದೆ")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-800 font-semibold hover:bg-yellow-100 transition"
            >
              {t('chip_garbage')}
            </button>
          </div>

          {/* 4. Clean, Always-Accessible Free-Text Complaint Input (Textarea) */}
          <div className="rounded-3xl bg-white border border-emerald-100/90 p-4 soft-card-shadow space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#071713] font-space flex items-center gap-1.5">
                <span>{t('lens_free_text_label')}</span>
                <span className="text-emerald-600 text-[10px] font-semibold">{t('lens_multilingual_tag')}</span>
              </label>

              <button
                type="button"
                onClick={toggleSpeech}
                className={`p-1.5 rounded-xl border transition ${
                  isRecording ? 'bg-red-100 border-red-400 text-red-600 animate-pulse' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
                title="Voice Input"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>

            <textarea
              rows={3}
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              placeholder={t('lens_textarea_placeholder')}
              className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none resize-none leading-relaxed border-none p-0"
            />

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-400 font-mono-hud flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                {t('lens_support_text')}
              </span>

              {/* Direct Triage Execution Button */}
              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0b6e4f] to-[#10b981] hover:from-[#09583f] hover:to-[#0ea573] text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 active:scale-95 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('lens_run_triage_btn')}</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
