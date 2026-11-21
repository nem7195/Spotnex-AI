import React from 'react';

export default function SpotNexLogo({ size = 36, showText = true, className = "" }) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* SVG Map Pin with Aperture & Circuit Nodes */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform hover:scale-105"
      >
        <defs>
          {/* Orange/Coral Gradient for Left Pin */}
          <linearGradient id="pinOrangeGrad" x1="15" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>

          {/* Teal/Cyan Gradient for Right Pin */}
          <linearGradient id="pinTealGrad" x1="85" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="50%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>

          {/* Lens Outer Ring Gradient */}
          <radialGradient id="lensRing" cx="50" cy="45" r="26" gradientUnits="userSpaceOnUse">
            <stop offset="70%" stopColor="#071713" />
            <stop offset="90%" stopColor="#0f291e" />
            <stop offset="100%" stopColor="#10b981" />
          </radialGradient>

          {/* Glowing Node Filter */}
          <filter id="nodeGlow" x="0" y="0" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Circuit-Node Branches on Right Side */}
        <g stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" opacity="0.95">
          {/* Top branch */}
          <path d="M72 32 L84 24" />
          <circle cx="85" cy="23" r="3.5" fill="#2dd4bf" filter="url(#nodeGlow)" stroke="#0f766e" strokeWidth="1" />
          
          {/* Middle branch */}
          <path d="M76 45 L91 45" />
          <circle cx="92" cy="45" r="4" fill="#0d9488" filter="url(#nodeGlow)" stroke="#115e59" strokeWidth="1" />
          
          {/* Bottom branch */}
          <path d="M72 58 L85 67" />
          <circle cx="86" cy="68" r="3.5" fill="#14b8a6" filter="url(#nodeGlow)" stroke="#0f766e" strokeWidth="1" />
        </g>

        {/* 2. Main Map Pin Body (Teardrop shape) */}
        {/* Left Half (Coral/Orange) */}
        <path
          d="M50 88 C43 78 20 58 20 42 C20 25.5 33.5 12 50 12 L50 88 Z"
          fill="url(#pinOrangeGrad)"
        />

        {/* Right Half (Teal/Cyan) */}
        <path
          d="M50 12 C66.5 12 80 25.5 80 42 C80 58 57 78 50 88 L50 12 Z"
          fill="url(#pinTealGrad)"
        />

        {/* Pin Border & Highlight */}
        <path
          d="M50 88 C43 78 20 58 20 42 C20 25.5 33.5 12 50 12 C66.5 12 80 25.5 80 42 C80 58 57 78 50 88 Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.5"
          opacity="0.6"
        />

        {/* 3. Circular Camera Iris / Aperture Outer Bezel */}
        <circle cx="50" cy="42" r="23" fill="url(#lensRing)" stroke="#10b981" strokeWidth="2.5" />
        <circle cx="50" cy="42" r="19" fill="#071713" stroke="#2dd4bf" strokeWidth="1.2" opacity="0.8" />

        {/* 4. Six Multitone Camera Aperture / Iris Blades */}
        <g transform="translate(50, 42)">
          {/* Blade 1 - Coral Orange */}
          <path d="M0 -15 L10 -8 L4 0 Z" fill="#f97316" opacity="0.9" />
          {/* Blade 2 - Rose Crimson */}
          <path d="M10 -8 L13 5 L3 3 Z" fill="#e11d48" opacity="0.9" />
          {/* Blade 3 - Deep Coral */}
          <path d="M13 5 L3 13 L-1 4 Z" fill="#fb7185" opacity="0.9" />
          {/* Blade 4 - Teal */}
          <path d="M3 13 L-10 8 L-4 0 Z" fill="#0d9488" opacity="0.9" />
          {/* Blade 5 - Cyan */}
          <path d="M-10 8 L-13 -5 L-3 -3 Z" fill="#06b6d4" opacity="0.9" />
          {/* Blade 6 - Emerald */}
          <path d="M-13 -5 L-3 -13 L1 -4 Z" fill="#10b981" opacity="0.9" />
          
          {/* Center Aperture Pupil */}
          <circle cx="0" cy="0" r="4.5" fill="#071713" stroke="#ffffff" strokeWidth="1" />
          <circle cx="-1" cy="-1" r="1.5" fill="#ffffff" opacity="0.8" />
        </g>
      </svg>

      {/* Styled Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center text-lg sm:text-xl font-black font-space tracking-tight">
            <span className="text-[#f97316]">SPOT</span>
            <span className="text-[#0d9488]">NEX</span>
          </div>
          <span className="text-[9px] font-mono-hud font-extrabold uppercase tracking-widest text-[#0d9488] mt-0.5">
            AI CIVIC CONNECT
          </span>
        </div>
      )}
    </div>
  );
}
