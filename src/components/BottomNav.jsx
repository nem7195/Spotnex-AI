import React from 'react';
import { Newspaper, Flame, Camera, MapPin, UserCheck } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto pointer-events-none px-3 pb-3">
      <nav className="pointer-events-auto bg-slate-950/92 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.8)] py-1.5 px-3 flex justify-around items-center">
        
        {/* 1. Feed */}
        <button
          onClick={() => onTabChange('feed')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition ${
            activeTab === 'feed' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span className="text-[10px]">Feed</span>
        </button>

        {/* 2. Priority */}
        <button
          onClick={() => onTabChange('priority')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl relative transition ${
            activeTab === 'priority' ? 'text-[#F0533A] font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Flame className="w-4 h-4" />
            <span className="absolute -top-1.5 -right-3 px-1 py-0.2 rounded-full bg-red-600 text-[8px] font-extrabold text-white leading-none">
              HOT
            </span>
          </div>
          <span className="text-[10px]">Priority</span>
        </button>

        {/* 3. Lens (Elevated Center Button) */}
        <button
          onClick={() => onTabChange('lens')}
          title="Open Spotnex Forensic Camera"
          className="relative -translate-y-3 group focus:outline-none"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#10B981] to-[#00A896] text-white ring-4 ring-[#10B981]/30 flex items-center justify-center shadow-lg shadow-emerald-500/40 group-hover:scale-105 active:scale-95 transition-all">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <span className="block text-center text-[9px] font-bold text-emerald-400 mt-0.5 font-space">
            LENS
          </span>
        </button>

        {/* 4. Map */}
        <button
          onClick={() => onTabChange('map')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition ${
            activeTab === 'map' ? 'text-[#00A896] font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span className="text-[10px]">Map</span>
        </button>

        {/* 5. Profile */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition ${
            activeTab === 'profile' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span className="text-[10px]">Profile</span>
        </button>

      </nav>
    </div>
  );
}
