import React from 'react';

export default function SpotnexLogo({ compact = false, size = 'default' }) {
  const isSmall = size === 'small' || compact;

  return (
    <div className={`flex items-center gap-2.5 ${compact ? 'select-none' : ''}`}>
      {/* Teardrop Pin + Aperture + 3 IoT Nodes */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={isSmall ? "36" : "48"}
          height={isSmall ? "36" : "48"}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_4px_12px_rgba(240,83,58,0.35)]"
        >
          <defs>
            {/* Left Gradient: Orange to Crimson */}
            <linearGradient id="pinGradLeft" x1="10" y1="15" x2="50" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F0533A" />
              <stop offset="100%" stopColor="#E11D48" />
            </linearGradient>

            {/* Right Gradient: Orange to Teal */}
            <linearGradient id="pinGradRight" x1="50" y1="15" x2="80" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="60%" stopColor="#00A896" />
              <stop offset="100%" stopColor="#0D9488" />
            </linearGradient>

            {/* Aperture Blade Gradients */}
            <linearGradient id="blade1" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#F0533A"/><stop offset="1" stopColor="#E11D48"/></linearGradient>
            <linearGradient id="blade2" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#FB923C"/><stop offset="1" stopColor="#F0533A"/></linearGradient>
            <linearGradient id="blade3" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#FCD34D"/><stop offset="1" stopColor="#00A896"/></linearGradient>
            <linearGradient id="blade4" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#00A896"/><stop offset="1" stopColor="#06B6D4"/></linearGradient>
            <linearGradient id="blade5" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#0284C7"/><stop offset="1" stopColor="#6366F1"/></linearGradient>
            <linearGradient id="blade6" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#E11D48"/><stop offset="1" stopColor="#9333EA"/></linearGradient>
          </defs>

          {/* Left half of teardrop location pin */}
          <path
            d="M50 14 C32 14 20 28 20 45 C20 62 38 78 50 88 L50 14 Z"
            fill="url(#pinGradLeft)"
          />

          {/* Right half of teardrop location pin */}
          <path
            d="M50 14 C68 14 80 28 80 45 C80 62 62 78 50 88 L50 14 Z"
            fill="url(#pinGradRight)"
          />

          {/* Inner dark camera cavity */}
          <circle cx="50" cy="44" r="22" fill="#090D16" stroke="#1E293B" strokeWidth="1.5" />

          {/* 6-Blade Camera Aperture / Shutter */}
          <g transform="translate(50, 44)">
            {/* Blade 1 */}
            <path d="M0 -20 L14 -12 L5 -4 Z" fill="url(#blade1)" opacity="0.95" />
            {/* Blade 2 */}
            <path d="M14 -12 L20 2 L6 2 Z" fill="url(#blade2)" opacity="0.95" />
            {/* Blade 3 */}
            <path d="M20 2 L8 16 L2 6 Z" fill="url(#blade3)" opacity="0.95" />
            {/* Blade 4 */}
            <path d="M8 16 L-10 16 L-4 4 Z" fill="url(#blade4)" opacity="0.95" />
            {/* Blade 5 */}
            <path d="M-10 16 L-18 2 L-6 -2 Z" fill="url(#blade5)" opacity="0.95" />
            {/* Blade 6 */}
            <path d="M-18 2 L-8 -14 L-2 -5 Z" fill="url(#blade6)" opacity="0.95" />

            {/* Central aperture hole */}
            <circle cx="0" cy="0" r="4.5" fill="#020617" stroke="#10B981" strokeWidth="1.2" />
          </g>

          {/* 3 Circular IoT Network Nodes extending outward to the right */}
          {/* Node 1 & Link */}
          <line x1="72" y1="32" x2="88" y2="24" stroke="#00A896" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="89" cy="23" r="4" fill="#00A896" />
          <circle cx="89" cy="23" r="2" fill="#E6FFFA" />

          {/* Node 2 & Link */}
          <line x1="78" y1="46" x2="94" y2="46" stroke="#10B981" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="94" cy="46" r="4.5" fill="#10B981" />
          <circle cx="94" cy="46" r="2.2" fill="#ECFDF5" />

          {/* Node 3 & Link */}
          <line x1="72" y1="60" x2="88" y2="68" stroke="#F0533A" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="89" cy="69" r="4" fill="#F0533A" />
          <circle cx="89" cy="69" r="2" fill="#FFF1F2" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center tracking-tight">
          <span
            className={`font-extrabold ${isSmall ? 'text-xl' : 'text-2xl'}`}
            style={{ color: '#F0533A' }}
          >
            SPOT
          </span>
          <span
            className={`font-extrabold ${isSmall ? 'text-xl' : 'text-2xl'}`}
            style={{ color: '#00A896' }}
          >
            NEX
          </span>
        </div>
        <span
          className="font-mono-hud text-[9px] font-bold text-emerald-400 mt-1 uppercase"
          style={{ letterSpacing: '0.25em' }}
        >
          AI CIVIC CONNECT
        </span>
      </div>
    </div>
  );
}
