import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, CheckCircle, AlertTriangle, Crosshair, MapPin, ShieldCheck, X } from 'lucide-react';
import { burnForensicWatermark } from '../utils/forensicWatermark';

export default function ForensicCamera({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (rear) or 'user' (front)
  const [geoData, setGeoData] = useState(null);
  const [geoStatus, setGeoStatus] = useState('Acquiring GPS fix...');
  const [cameraError, setCameraError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedPreview, setCapturedPreview] = useState(null);

  // Check if WebRTC getUserMedia is supported & secure context
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
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude
          });
          setGeoStatus(`LOCKED • ±${Math.round(pos.coords.accuracy)}m`);
        },
        (err) => {
          console.warn('Geolocation warning:', err.message);
          // Default to Bengaluru Civic Center coordinates for realistic demo
          setGeoData({
            latitude: 12.97159,
            longitude: 77.59456,
            accuracy: 6.2
          });
          setGeoStatus('SIMULATED GPS FIX (BBMP HQ)');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setGeoStatus('GPS UNAVAILABLE');
    }
  }, []);

  // WebRTC Camera Stream Management
  useEffect(() => {
    if (!isWebRTCAllowed) {
      setCameraError('Non-secure context (HTTP). Using direct native camera fallback.');
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
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
      console.warn('getUserMedia failed:', err);
      setCameraError('Camera access unavailable or restricted. Use native mobile snap below.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture from live WebRTC video frame
  const takeSnapshot = async () => {
    if (!videoRef.current) return;
    setIsProcessing(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const rawDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      // Burn forensic watermark
      const watermarked = await burnForensicWatermark(rawDataUrl, geoData);
      setCapturedPreview(watermarked);
    } catch (err) {
      console.error('Snapshot failed:', err);
      alert('Snapshot failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle fallback file / native camera input
  const handleNativeFallback = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const watermarked = await burnForensicWatermark(file, geoData);
      setCapturedPreview(watermarked);
    } catch (err) {
      console.error('Watermark error:', err);
      alert('Error processing photo watermark.');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmEvidence = () => {
    if (capturedPreview) {
      stopCamera();
      onCapture(capturedPreview);
    }
  };

  const retake = () => {
    setCapturedPreview(null);
    if (isWebRTCAllowed) {
      startCamera();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6 overflow-hidden">
      
      {/* Top HUD Bar */}
      <div className="w-full max-w-md flex items-center justify-between text-xs text-slate-300 font-mono-hud py-2 px-3 bg-slate-900/80 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white tracking-wider">CIVICLENS FORENSIC CAM</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Viewfinder / Preview Container */}
      <div className="relative w-full max-w-sm aspect-[3/4] bg-slate-950 rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl flex items-center justify-center">
        
        {capturedPreview ? (
          /* Captured & Watermarked Preview */
          <div className="relative w-full h-full">
            <img src={capturedPreview.dataUrl} alt="Forensic Evidence" className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/75 border border-emerald-500/60 text-emerald-400 text-[10px] font-mono-hud flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>FORENSIC HUD SEALED</span>
            </div>
          </div>
        ) : isWebRTCAllowed && !cameraError ? (
          /* Live WebRTC Viewfinder */
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Viewfinder Crosshairs & Grid */}
            <div className="absolute inset-0 pointer-events-none border border-cyan-500/20 m-4 rounded-xl flex items-center justify-center">
              <Crosshair className="w-12 h-12 text-cyan-400/40 animate-pulse" />
            </div>

            {/* Live GPS Lock Indicator */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono-hud">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 border border-cyan-500/40 text-cyan-300">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{geoStatus}</span>
              </div>
              <div className="px-2 py-0.5 rounded bg-black/70 text-slate-400 text-[10px] border border-slate-800">
                REC • 3:4
              </div>
            </div>

            {/* Bottom HUD Over Live Video */}
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <span className="text-[10px] font-mono-hud px-2.5 py-1 rounded bg-black/80 text-slate-300 border border-slate-800/80">
                {geoData ? `${geoData.latitude.toFixed(5)}°N, ${geoData.longitude.toFixed(5)}°E` : 'Calibrating GPS...'}
              </span>
            </div>
          </div>
        ) : (
          /* Fallback view when WebRTC is not supported/allowed */
          <div className="p-6 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Direct Mobile Camera Mode</h4>
              <p className="text-xs text-slate-400">
                Tap below to capture using your phone's camera. CivicLens will burn the GPS &amp; IST timestamp onto your photo.
              </p>
            </div>
            
            <label className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-cyan-600/30 cursor-pointer active:scale-95 transition">
              <Camera className="w-4 h-4" />
              <span>📸 Tap to Snap Photo Directly</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleNativeFallback}
                className="hidden"
              />
            </label>
          </div>
        )}

      </div>

      {/* Camera Controls & Actions */}
      <div className="w-full max-w-sm py-2">
        {capturedPreview ? (
          /* Preview Action Buttons */
          <div className="flex items-center gap-3">
            <button
              onClick={retake}
              className="flex-1 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retake</span>
            </button>
            <button
              onClick={confirmEvidence}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Attach Evidence</span>
            </button>
          </div>
        ) : isWebRTCAllowed && !cameraError ? (
          /* WebRTC Controls */
          <div className="flex items-center justify-around">
            <button
              onClick={flipCamera}
              title="Flip Camera"
              className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition active:scale-95"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            {/* Shutter Button */}
            <button
              onClick={takeSnapshot}
              disabled={isProcessing}
              className="w-18 h-18 rounded-full border-4 border-cyan-500/40 p-1 flex items-center justify-center active:scale-90 transition"
            >
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 shadow-lg shadow-cyan-500/50 flex items-center justify-center">
                <Camera className="w-7 h-7 text-white" />
              </div>
            </button>

            {/* Fallback File Trigger */}
            <label
              title="Upload existing file"
              className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer active:scale-95 transition"
            >
              <MapPin className="w-5 h-5 text-cyan-400" />
              <input
                type="file"
                accept="image/*"
                onChange={handleNativeFallback}
                className="hidden"
              />
            </label>
          </div>
        ) : null}
      </div>

    </div>
  );
}
