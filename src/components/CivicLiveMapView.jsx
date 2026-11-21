import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, MapPin, Zap, Droplets, Trash2, Milestone } from 'lucide-react';
import { getTranslation } from '../utils/i18n';

export default function CivicLiveMapView({ tickets, onSelectTicket, currentLang = 'en' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);

  const [mapMode, setMapMode] = useState('pins'); // 'pins' | 'heat'
  const [tileTheme, setTileTheme] = useState('streets'); // 'streets' | 'satellite'

  const t = (k) => getTranslation(k, currentLang);

  // Wards coordinates for JUMP TO feature
  const wardJumps = {
    Indiranagar: [12.9785, 77.6408],
    Koramangala: [12.9352, 77.6245],
    'HSR Layout': [12.9121, 77.6446],
    'MG Road': [12.9750, 77.6050],
    Whitefield: [12.9698, 77.7500]
  };

  // 4 Category Stat Counts
  const roadsCount = tickets.filter(t => t.category === 'roads').length;
  const wasteCount = tickets.filter(t => t.category === 'waste').length;
  const waterCount = tickets.filter(t => t.category === 'water').length;
  const electricCount = tickets.filter(t => t.category === 'electricity' || t.category === 'trees').length;

  const streetUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const satUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [12.9716, 77.6100],
      zoom: 13,
      zoomControl: false
    });
    mapInstanceRef.current = map;

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const currentUrl = tileTheme === 'satellite' ? satUrl : streetUrl;
    tileLayerRef.current = L.tileLayer(currentUrl, {
      attribution: tileTheme === 'satellite' ? '&copy; Esri World Imagery' : '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Create layer group for markers
    markersLayerRef.current = L.layerGroup().addTo(map);

    renderPinsOrHeat();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update tile layer smoothly when tileTheme changes
  useEffect(() => {
    if (mapInstanceRef.current && tileLayerRef.current) {
      const currentUrl = tileTheme === 'satellite' ? satUrl : streetUrl;
      tileLayerRef.current.setUrl(currentUrl);
    }
  }, [tileTheme]);

  // Update pins/heat when mapMode or tickets change
  useEffect(() => {
    renderPinsOrHeat();
  }, [mapMode, tickets]);

  const renderPinsOrHeat = () => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;
    markersLayerRef.current.clearLayers();

    // Default sample markers
    const baseMarkers = [
      { id: "TKT-1001", lat: 12.9785, lng: 77.5980, label: 'Snapped Live Wire Near School', category: 'electricity', sev: 'Critical', color: '#ef4444' },
      { id: "TKT-1002", lat: 12.9640, lng: 77.6180, label: 'Main Pipeline Burst (Water Works)', category: 'water', sev: 'High', color: '#0284c7' },
      { id: "TKT-1003", lat: 12.9510, lng: 77.6350, label: 'Deep Crater Pothole (100ft Road)', category: 'roads', sev: 'Critical', color: '#ef4444' },
      { id: "TKT-1004", lat: 12.9380, lng: 77.6100, label: 'Garbage Dump Overflow (SWM)', category: 'waste', sev: 'Medium', color: '#eab308' },
      { id: "TKT-1005", lat: 12.9620, lng: 77.6420, label: 'Fallen Banyan Tree on Sidewalk', category: 'trees', sev: 'Critical', color: '#10b981' }
    ];

    if (mapMode === 'heat') {
      // Heat Map Mode: Render soft-intensity gradient heat radii
      baseMarkers.forEach((m) => {
        const radius = m.sev === 'Critical' ? 450 : m.sev === 'High' ? 320 : 220;
        L.circle([m.lat, m.lng], {
          radius: radius,
          fillColor: m.sev === 'Critical' ? '#ef4444' : m.sev === 'High' ? '#f59e0b' : '#10b981',
          fillOpacity: 0.35,
          color: 'transparent',
          weight: 0
        }).addTo(markersLayerRef.current);
      });
    } else {
      // Pins Mode: High-contrast circular markers
      baseMarkers.forEach((m) => {
        const circle = L.circleMarker([m.lat, m.lng], {
          radius: m.sev === 'Critical' ? 10 : 8,
          fillColor: m.color,
          color: '#ffffff',
          weight: 2.5,
          opacity: 1,
          fillOpacity: 0.95
        }).addTo(markersLayerRef.current);

        circle.bindPopup(`
          <div style="font-family: 'Space Grotesk', sans-serif; font-size: 11px; padding: 4px;">
            <strong style="color: ${m.color}; font-size: 12px;">${m.sev.toUpperCase()} • ${m.category.toUpperCase()}</strong>
            <p style="margin: 4px 0 0; color: #1e293b; font-weight: 600;">${m.label}</p>
            <span style="font-size: 10px; color: #64748b; font-family: monospace;">Location: Bengaluru Central Ward</span>
          </div>
        `);
      });
    }
  };

  const jumpToWard = (coords) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(coords, 14, { duration: 1.2 });
    }
  };

  return (
    <div className="space-y-3 pb-20">
      
      {/* 1. Header with 4 Category Stat Tiles */}
      <div className="grid grid-cols-4 gap-2">
        <div className="p-2.5 rounded-2xl bg-white border border-emerald-100/80 soft-card-shadow text-center">
          <Milestone className="w-4 h-4 text-[#0b6e4f] mx-auto mb-1" />
          <div className="font-mono-hud font-bold text-xs text-slate-800">{roadsCount}</div>
          <div className="text-[9px] text-slate-400 font-medium">{t('map_stat_roads')}</div>
        </div>

        <div className="p-2.5 rounded-2xl bg-white border border-emerald-100/80 soft-card-shadow text-center">
          <Trash2 className="w-4 h-4 text-amber-600 mx-auto mb-1" />
          <div className="font-mono-hud font-bold text-xs text-slate-800">{wasteCount}</div>
          <div className="text-[9px] text-slate-400 font-medium">{t('map_stat_waste')}</div>
        </div>

        <div className="p-2.5 rounded-2xl bg-white border border-emerald-100/80 soft-card-shadow text-center">
          <Droplets className="w-4 h-4 text-sky-600 mx-auto mb-1" />
          <div className="font-mono-hud font-bold text-xs text-slate-800">{waterCount}</div>
          <div className="text-[9px] text-slate-400 font-medium">{t('map_stat_water')}</div>
        </div>

        <div className="p-2.5 rounded-2xl bg-white border border-emerald-100/80 soft-card-shadow text-center">
          <Zap className="w-4 h-4 text-red-500 mx-auto mb-1" />
          <div className="font-mono-hud font-bold text-xs text-slate-800">{electricCount}</div>
          <div className="text-[9px] text-slate-400 font-medium">{t('map_stat_power')}</div>
        </div>
      </div>

      {/* 2. JUMP TO Ward Pills */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-slate-500 font-mono-hud uppercase px-1">
          {t('map_jump_label')}
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {Object.entries(wardJumps).map(([wardName, coords]) => (
            <button
              key={wardName}
              onClick={() => jumpToWard(coords)}
              className="shrink-0 px-3 py-1 rounded-full bg-white hover:bg-emerald-50 text-slate-700 hover:text-[#0b6e4f] border border-emerald-100 font-bold font-space text-[11px] transition shadow-2xs"
            >
              📍 {wardName}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Clean Rounded Leaflet Map with Floating Dark Toggles */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] min-h-[50vh] rounded-3xl overflow-hidden border border-emerald-200/80 shadow-md">
        
        {/* Map Container */}
        <div ref={mapContainerRef} className="w-full h-full min-h-[50vh]" />

        {/* Floating Dark Toggles: Heat | Pins & Streets | Satellite */}
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5">
          
          {/* Heat / Pins Toggle */}
          <div className="bg-[#071713]/90 backdrop-blur-md p-0.5 rounded-xl border border-emerald-500/40 flex items-center shadow-lg text-[10px] font-space">
            <button
              onClick={() => setMapMode('pins')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                mapMode === 'pins' ? 'bg-[#10b981] text-[#071713]' : 'text-slate-300 hover:text-white'
              }`}
            >
              {t('map_mode_pins')}
            </button>
            <button
              onClick={() => setMapMode('heat')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                mapMode === 'heat' ? 'bg-[#10b981] text-[#071713]' : 'text-slate-300 hover:text-white'
              }`}
            >
              {t('map_mode_heat')}
            </button>
          </div>

          {/* Streets / Satellite Toggle */}
          <div className="bg-[#071713]/90 backdrop-blur-md p-0.5 rounded-xl border border-emerald-500/40 flex items-center shadow-lg text-[10px] font-space">
            <button
              onClick={() => setTileTheme('streets')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                tileTheme === 'streets' ? 'bg-[#0b6e4f] text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              {t('map_tile_streets')}
            </button>
            <button
              onClick={() => setTileTheme('satellite')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                tileTheme === 'satellite' ? 'bg-[#0b6e4f] text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              {t('map_tile_satellite')}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
