import React, { useState } from 'react';
import { 
  Camera, ArrowRight, ShieldCheck, Eye, EyeOff, Lock, User, 
  Phone, Mail, CheckCircle2, ArrowLeft, Sparkles, Building2, ExternalLink 
} from 'lucide-react';
import SpotNexLogo from './SpotNexLogo';

export default function LoginOnboardingView({ 
  onLoginSuccess, 
  onQuickStartGuest, 
  canReturnToDashboard = false, 
  onBackToDashboard 
}) {
  const [selectedDemoProfile, setSelectedDemoProfile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [socialPlatform, setSocialPlatform] = useState('Twitter');
  
  const [formData, setFormData] = useState({
    name: '',
    roleOrOrg: '',
    mobile: '',
    email: '',
    password: '',
    socialHandle: ''
  });

  // 4 Fast-Track Demo Profiles
  const demoProfiles = [
    {
      id: 'commuter',
      label: '🚆 Commuter',
      name: 'Ramesh Kumar',
      roleOrOrg: 'Daily Metro Commuter (Purple Line)',
      mobile: '9845112233',
      email: 'ramesh.commuter@gmail.com',
      password: 'DemoPassword@2026',
      platform: 'Twitter',
      socialHandle: 'ramesh_blr_rider'
    },
    {
      id: 'resident',
      label: '🏡 Resident',
      name: 'Rajesh Gowda',
      roleOrOrg: 'Resident (Ward 174, HSR Layout)',
      mobile: '9845123456',
      email: 'rajesh.gowda@outlook.com',
      password: 'DemoPassword@2026',
      platform: 'Twitter',
      socialHandle: 'rajesh_gowda_blr'
    },
    {
      id: 'rwa',
      label: '🏛️ RWA Leader',
      name: 'Priya Sundaram',
      roleOrOrg: 'Secretary (Koramangala 4th Block RWA)',
      mobile: '9880198765',
      email: 'priya.rwa@koramangala.org',
      password: 'DemoPassword@2026',
      platform: 'Twitter',
      socialHandle: 'priya_krmg_rwa'
    },
    {
      id: 'trader',
      label: '🏪 Trader Union',
      name: 'Suresh M.',
      roleOrOrg: 'President (Commercial St Merchants Assoc)',
      mobile: '9844055667',
      email: 'suresh.trader@bengaluru-trade.in',
      password: 'DemoPassword@2026',
      platform: 'Instagram',
      socialHandle: 'commercial_st_merchants'
    }
  ];

  const handleSelectDemo = (profile) => {
    setSelectedDemoProfile(profile.id);
    setSocialPlatform(profile.platform);
    setFormData({
      name: profile.name,
      roleOrOrg: profile.roleOrOrg,
      mobile: profile.mobile,
      email: profile.email,
      password: profile.password,
      socialHandle: profile.socialHandle
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalUser = {
      name: formData.name.trim() || 'Rajesh Gowda',
      roleOrOrg: formData.roleOrOrg.trim() || 'Resident Citizen',
      mobile: formData.mobile.trim() ? `+91 ${formData.mobile.trim()}` : '+91 98451 23456',
      email: formData.email.trim() || 'citizen@spotnex.gov.in',
      socialPlatform,
      socialHandle: formData.socialHandle.trim() || null
    };
    onLoginSuccess(finalUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f7f1] via-[#f0fbf7] to-[#f8fafc] text-slate-800 flex flex-col justify-center items-center p-3 sm:p-6 font-sans">
      
      {/* Return to Dashboard link if already initialized */}
      {canReturnToDashboard && (
        <div className="max-w-lg w-full mb-3 px-2 flex justify-start">
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-bold font-space text-[#0b6e4f] hover:text-[#10b981] transition bg-white/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-emerald-200/90 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Back to Active Civic Dashboard</span>
          </button>
        </div>
      )}

      {/* Centered White Rounded-3xl Login Card */}
      <div className="bg-white rounded-3xl soft-card-shadow border border-emerald-100/90 max-w-lg w-full p-5 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* 1. Header: SpotNex Logo & Tagline */}
        <div className="text-center space-y-2">
          <div className="flex justify-center py-2">
            <img 
              src="/spotnex-logo.png" 
              alt="SpotNex AI Civic Connect" 
              className="h-24 sm:h-32 w-auto max-w-[90%] object-contain drop-shadow-md transition-transform hover:scale-105" 
            />
          </div>

          <p className="text-xs sm:text-[13px] text-slate-600 font-medium leading-relaxed max-w-sm mx-auto">
            Caring for our Bengaluru neighborhoods together with verified community action.
          </p>
        </div>

        {/* 2. Emerald-tinted Rounded Banner */}
        <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#0b6e4f] text-center shadow-2xs font-space">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Community Verified Civic Hub • Bengaluru Green Initiative</span>
        </div>

        {/* 3. Full-Width Emerald Quick-Start Button (1-Tap Direct Start) */}
        <div>
          <button
            type="button"
            onClick={onQuickStartGuest}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#0b6e4f] to-[#10b981] hover:from-[#09583f] hover:to-[#0ea573] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-700/25 active:scale-98 transition flex items-center justify-center gap-2.5 text-center leading-snug group"
          >
            <Camera className="w-5 h-5 text-emerald-200 shrink-0 group-hover:scale-110 transition" />
            <div className="text-left flex-1 min-w-0">
              <span className="block font-black font-space tracking-wide">
                1-Tap Direct Start (Guest Mode)
              </span>
              <span className="block text-[10px] text-emerald-100 font-normal truncate">
                No typing or password needed • Jump straight to camera
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-200 shrink-0" />
          </button>
        </div>

        {/* Divider with OR */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-[10px] font-mono-hud font-bold uppercase text-slate-400">
            or choose demo profile
          </span>
        </div>

        {/* 4. Fast-Track Demo Profiles Row (4 clickable pills) */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase font-mono-hud block">
            Fast-Track Demo Profiles (Auto-Fill):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {demoProfiles.map((p) => {
              const isSelected = selectedDemoProfile === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectDemo(p)}
                  className={`py-2 px-2 rounded-xl text-center text-[11px] font-bold font-space transition active:scale-95 border ${
                    isSelected
                      ? 'bg-[#071713] text-[#10b981] border-emerald-500 shadow-sm'
                      : 'bg-slate-50 hover:bg-emerald-50/60 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="block truncate">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Create & Add Account Card */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-emerald-100 bg-slate-50/70 p-4 space-y-3.5">
          
          <div className="flex items-center justify-between pb-1 border-b border-slate-200/80">
            <span className="text-xs font-extrabold text-[#071713] font-space flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#0b6e4f]" />
              <span>Create &amp; Add Account</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold font-mono-hud">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Safe &amp; Encrypted</span>
            </span>
          </div>

          {/* Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase font-mono-hud">
                Name / Citizen
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rajesh Gowda"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase font-mono-hud">
                Neighborhood / Org
              </label>
              <input
                type="text"
                value={formData.roleOrOrg}
                onChange={(e) => setFormData({ ...formData, roleOrOrg: e.target.value })}
                placeholder="e.g. Ward 174, HSR Layout"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          {/* Mobile & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase font-mono-hud">
                Mobile (+91)
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-2.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-[11px] font-mono-hud font-bold text-slate-600">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="98451 23456"
                  className="w-full bg-white border border-slate-200 rounded-r-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase font-mono-hud">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="citizen@bengaluru.in"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          {/* Password with show/hide eye toggle */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase font-mono-hud">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create secure password"
                className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Optional Verified Social Link Pills + Handle */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase font-mono-hud flex items-center justify-between">
              <span>Verified Social Link (Optional)</span>
              <span className="text-emerald-700 font-semibold normal-case text-[10px]">For civic escalation</span>
            </label>
            
            <div className="flex items-center gap-1.5">
              {['Twitter', 'Facebook', 'Instagram'].map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setSocialPlatform(plat)}
                  className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold font-space border transition ${
                    socialPlatform === plat
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {plat === 'Twitter' ? 'Twitter / X' : plat}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">@</span>
              <input
                type="text"
                value={formData.socialHandle}
                onChange={(e) => setFormData({ ...formData, socialHandle: e.target.value })}
                placeholder={`Enter your ${socialPlatform} handle`}
                className="w-full bg-white border border-slate-200 rounded-xl pl-7 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Subtle IT Act Section 79 Info Box */}
          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[10px] text-slate-600 leading-relaxed font-sans flex items-start gap-1.5">
            <span className="text-amber-700 font-bold shrink-0">⚖️</span>
            <div>
              <span className="font-bold text-amber-900">IT Act Section 79 Statutory Compliance: </span>
              SpotNex operates as a civic intermediary platform. Citizen complaints are recorded in good faith for statutory triage u/s 133 CrPC and municipal routing.
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#0b6e4f] to-[#10b981] hover:from-[#09583f] hover:to-[#0ea573] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-emerald-700/20 active:scale-98 transition flex items-center justify-center gap-2"
          >
            <span>Create &amp; Add Account →</span>
          </button>

        </form>

      </div>

    </div>
  );
}
