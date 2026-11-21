import React from 'react';

/**
 * SpotNex Brand Logo - Vector SVG Component
 * Zero distortion, infinite scalability, crisp at all resolutions.
 */
export default function SpotNexLogo({ 
  className = "h-11 w-auto", 
  onClick = null,
  showSubtitle = true 
}) {
  return (
    <div 
      onClick={onClick} 
      className={`inline-flex items-center select-none ${onClick ? 'cursor-pointer' : ''}`}
      title="SpotNex • AI Civic Connect"
    >
      <svg
        viewBox="0 0 380 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`object-contain ${className}`}
      >
        <defs>
          {/* Left Ribbon Gradient (Mint to Vibrant Emerald) */}
          <linearGradient id="snxPinMintGrad" x1="10%" y1="10%" x2="90%" y2="90%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="25%" stopColor="#34d399" />
            <stop offset="60%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Right Outer Ribbon (Deep Civic Forest Green) */}
          <linearGradient id="snxPinForestGrad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="35%" stopColor="#047857" />
            <stop offset="70%" stopColor="#065f46" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>

          {/* Pin Inner Loop Fold */}
          <linearGradient id="snxPinInnerFold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="50%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Camera Lens / Iris Radial Gradient */}
          <radialGradient id="snxLensIrisGrad" cx="44%" cy="42%" r="56%">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="65%" stopColor="#033527" />
            <stop offset="100%" stopColor="#022118" />
          </radialGradient>

          {/* Checkmark & Antenna Gradient */}
          <linearGradient id="snxCheckGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="45%" stopColor="#10b981" />
            <stop offset="85%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Leaf Gradient */}
          <linearGradient id="snxLeafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>

          {/* Wordmark 'nex' Gradient */}
          <linearGradient id="snxNexTextGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* 1. PIN EMBLEM */}
        <g transform="translate(6, 4)">
          {/* Right outer curved ribbon */}
          <path
            d="M 45 12
               C 68 12, 86 28, 84 52
               C 82 70, 63 86, 41 100
               C 40 98, 39 91, 44 83
               C 59 73, 71 59, 72 47
               C 73 33, 61 22, 45 21
               Z"
            fill="url(#snxPinForestGrad)"
          />

          {/* Left outer ribbon loop */}
          <path
            d="M 41 100
               C 29 86, 12 65, 12 45
               C 12 25, 27 12, 45 12
               C 58 12, 70 17, 77 26
               C 71 20, 59 16, 45 17
               C 30 17, 18 29, 18 45
               C 18 62, 31 79, 41 100
               Z"
            fill="url(#snxPinMintGrad)"
          />

          {/* Inner fold ribbon highlighting the teardrop apex */}
          <path
            d="M 45 22
               C 32 22, 22 32, 22 45
               C 22 58, 32 72, 41 85
               C 36 74, 28 61, 28 47
               C 28 36, 35 27, 45 27
               C 55 27, 64 34, 65 44
               C 65 43, 65 42, 65 41
               C 64 30, 55 22, 45 22
               Z"
            fill="url(#snxPinInnerFold)"
            opacity="0.9"
          />

          {/* Camera Lens / Iris Background Disc */}
          <circle cx="45" cy="46" r="23" fill="url(#snxLensIrisGrad)" />
          {/* Outer glass rim reflection */}
          <circle cx="45" cy="46" r="22.5" stroke="#34d399" strokeWidth="1.2" opacity="0.45" />

          {/* Center pupil core */}
          <circle cx="45" cy="46" r="11" fill="#03261c" />
          <circle cx="45" cy="46" r="6" fill="#065f46" />
          <circle cx="42.5" cy="43.5" r="2" fill="#ffffff" opacity="0.8" />

          {/* Checkmark sweeping into IoT antenna */}
          <path
            d="M 31 46
               L 41 57
               L 67 31
               L 83 17"
            stroke="url(#snxCheckGrad)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Checkmark crisp inner specular line */}
          <path
            d="M 32 46
               L 41 55
               L 67 31"
            stroke="#a7f3d0"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />

          {/* IoT Network Terminal Node */}
          <circle cx="83" cy="17" r="7.5" fill="#ffffff" stroke="#059669" strokeWidth="4.5" />
          <circle cx="83" cy="17" r="2.5" fill="#10b981" />
        </g>

        {/* 2. WORDMARK: 'spotnex' (Single continuous word, zero gap) */}
        <g transform="translate(108, 0)">
          <text
            x="0"
            y="66"
            fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            fontSize="52"
            fontWeight="900"
            letterSpacing="-1.5"
          >
            <tspan fill="#064e3b">spot</tspan>
            <tspan fill="url(#snxNexTextGrad)">nex</tspan>
          </text>

          {/* Eco-Sprout Leaf atop 'x' */}
          <g transform="translate(188, 21)">
            {/* Leaf body */}
            <path
              d="M 1 18
                 C 0 10, 11 3, 19 0
                 C 22 9, 18 19, 8 22
                 C 5 22, 2 20, 1 18
                 Z"
              fill="url(#snxLeafGrad)"
            />
            {/* Leaf central vein */}
            <path
              d="M 2 18 Q 11 11 18 2"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.8"
            />
            {/* Node dot inside leaf */}
            <circle cx="10" cy="12" r="1.5" fill="#ffffff" opacity="0.9" />
          </g>

          {/* 3. SUBTITLE: 'AI CIVIC CONNECT' */}
          {showSubtitle && (
            <text
              x="2"
              y="91"
              fontFamily="'Space Grotesk', system-ui, -apple-system, monospace"
              fontSize="11.5"
              fontWeight="800"
              fill="#064e3b"
              letterSpacing="4.8"
            >
              AI CIVIC CONNECT
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}
