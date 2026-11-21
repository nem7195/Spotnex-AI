import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Plus, Minus, Navigation, RotateCcw, Milestone, Trash2, Droplets, Zap, Eye } from 'lucide-react';
import { getTranslation } from '../utils/i18n';

export default function CivicLiveMapView({ tickets, onSelectTicket, currentLang = 'en' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);

  const [mapFilter, setMapFilter] = useState('pins'); // 'heat' | 'pins' | 'all'
  const [tileTheme, setTileTheme] = useState('streets'); // 'streets' | 'hd_roads' | 'satellite'

  const t = (k) => getTranslation(k, currentLang);

  // Wards coordinates for quick navigation
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

  const tileUrls = {
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    hd_roads: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default zoomControl is false as requested
    const map = L.map(mapContainerRef.current, {
      center: [12.9716, 77.6100],
      zoom: 13,
      zoomControl: false
    });
    mapInstanceRef.current = map;

    // Base Tile Layer
    const currentUrl = tileUrls[tileTheme] || tileUrls.streets;
    tileLayerRef.current = L.tileLayer(currentUrl, {
      attribution: tileTheme === 'satellite' ? '&copy; Esri World Imagery' : '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Layer group for markers & heat circles
    markersLayerRef.current = L.layerGroup().addTo(map);

    renderMapData();

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
      const currentUrl = tileUrls[tileTheme] || tileUrls.streets;
      tileLayerRef.current.setUrl(currentUrl);
    }
  }, [tileTheme]);

  // Update pins/heat when mapFilter or tickets change
  useEffect(() => {
    renderMapData();
  }, [mapFilter, tickets]);

  const categoryConfig = {
    electricity: { icon: '⚡', color: '#ef4444' }, // red
    roads: { icon: '🛣️', color: '#f97316' }, // orange
    water: { icon: '💧', color: '#0284c7' }, // blue
    waste: { icon: '🗑️', color: '#eab308' }, // amber
    trees: { icon: '🌳', color: '#10b981' }, // emerald
    drainage: { icon: '🕳️', color: '#06b6d4' } // cyan
  };

  const renderMapData = () => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;
    markersLayerRef.current.clearLayers();

    // Map base tickets with coordinates
    const defaultCoords = [
      { id: "TKT-1001", lat: 12.9785, lng: 77.5980, label: 'Snapped Live Wire Near School', category: 'electricity', sev: 'Critical' },
      { id: "TKT-1002", lat: 12.9640, lng: 77.6180, label: 'Main Pipeline Burst (Water Works)', category: 'water', sev: 'High' },
      { id: "TKT-1003", lat: 12.9510, lng: 77.6350, label: 'Deep Crater Pothole (100ft Road)', category: 'roads', sev: 'Critical' },
      { id: "TKT-1004", lat: 12.9380, lng: 77.6100, label: 'Garbage Dump Overflow (SWM)', category: 'waste', sev: 'Medium' },
      { id: "TKT-1005", lat: 12.9620, lng: 77.6420, label: 'Fallen Banyan Tree on Sidewalk', category: 'trees', sev: 'Critical' }
    ];

    const dataToRender = tickets.length > 0 ? tickets.map((t, i) => {
      const fallback = defaultCoords[i % defaultCoords.length];
      return {
        ...t,
        lat: t.latitude || fallback.lat,
        lng: t.longitude || fallback.lng,
        category: t.category || fallback.category,
        sev: t.severity || fallback.sev,
        label: t.english_summary || fallback.label
      };
    }) : defaultCoords;

    // 1. Render Heatmap Radii if mode is 'heat' or 'all'
    if (mapFilter === 'heat' || mapFilter === 'all') {
      dataToRender.forEach((m) => {
        const radius = m.sev === 'Critical' ? 480 : m.sev === 'High' ? 340 : 220;
        const heatColor = m.sev === 'Critical' ? '#ef4444' : m.sev === 'High' ? '#f59e0b' : '#10b981';
        
        L.circle([m.lat, m.lng], {
          radius: radius,
          fillColor: heatColor,
          fillOpacity: 0.38,
          color: 'transparent',
          weight: 0
        }).addTo(markersLayerRef.current);
      });
    }

    // 2. Render Custom Circular L.divIcon Pins if mode is 'pins' or 'all'
    if (mapFilter === 'pins' || mapFilter === 'all') {
      dataToRender.forEach((m, index) => {
        const cfg = categoryConfig[m.category?.toLowerCase()] || { icon: '📌', color: '#f97316' };
        const pinCount = index + 1;

        // Custom circular L.divIcon: white outer ring, color-coded fill, category icon inside, dark-green count badge top-right
        const divHtml = `
          <div style="position: relative; width: 34px; height: 34px; border-radius: 9999px; background-color: ${cfg.color}; border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s;">
            <span style="font-size: 14px; line-height: 1;">${cfg.icon}</span>
            <span style="position: absolute; top: -6px; right: -6px; min-width: 16px; height: 16px; border-radius: 9999px; background-color: #071713; border: 1.5px solid #10b981; color: #6ee7b7; font-size: 9px; font-weight: 800; font-family: monospace; display: flex; align-items: center; justify-content: center; padding: 0 3px; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">
              ${pinCount}
            </span>
          </div>
        `;

        const customIcon = L.divIcon({
          html: divHtml,
          className: 'spotnex-map-pin',
          iconSize: [34, 34],
          iconAnchor: [17, 17],
          popupAnchor: [0, -18]
        });

        const marker = L.marker([m.lat, m.lng], { icon: customIcon }).addTo(markersLayerRef.current);

        marker.bindPopup(`
          <div style="font-family: 'Space Grotesk', sans-serif; font-size: 11px; padding: 5px; min-width: 170px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-weight: 800; color: ${cfg.color}; text-transform: uppercase; font-size: 11px;">
                ${m.sev} • ${m.category}
              </span>
              <span style="font-family: monospace; font-size: 10px; color: #64748b; font-weight: 700;">#${m.id}</span>
            </div>
            <p style="margin: 0 0 6px 0; color: #0f172a; font-weight: 700; line-height: 1.3;">${m.label}</p>
            <div style="font-size: 10px; color: #0b6e4f; font-weight: 600;">Department: ${m.department || 'BBMP'}</div>
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

  // Zoom In / Out Handlers
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  // GPS Locate Handler
  const handleLocateGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          mapInstanceRef.current?.flyTo([pos.coords.latitude, pos.coords.longitude], 15, { duration: 1.2 });
        },
        () => {
          mapInstanceRef.current?.flyTo([12.9716, 77.5946], 15, { duration: 1.2 });
        }
      );
    } else {
      mapInstanceRef.current?.flyTo([12.9716, 77.5946], 15, { duration: 1.2 });
    }
  };

  // Reset View Handler (Bengaluru Central)
  const handleResetView = () => {
    mapInstanceRef.current?.flyTo([12.9716, 77.6100], 13, { duration: 1 });
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

      {/* 3. Upgraded Rounded Leaflet Map with crisp border-2 border-emerald-800/80 */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] min-h-[50vh] rounded-3xl overflow-hidden border-2 border-emerald-800/80 shadow-lg">
        
        {/* Map Container */}
        <div ref={mapContainerRef} className="w-full h-full min-h-[50vh]" />

        {/* Top-Left: Stack of 2 Dark Obsidian Floating Pill Bars */}
        <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2 pointer-events-auto">
          
          {/* Pill Bar 1: [Heat | Pins | All] */}
          <div className="bg-[#071713]/90 backdrop-blur-md p-1 rounded-2xl border border-emerald-500/40 flex items-center shadow-lg text-[10px] font-space gap-0.5">
            <button
              onClick={() => setMapFilter('heat')}
              className={`px-3 py-1 rounded-xl font-extrabold transition ${
                mapFilter === 'heat' ? 'bg-[#10b981] text-[#071713] shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              Heat
            </button>
            <button
              onClick={() => setMapFilter('pins')}
              className={`px-3 py-1 rounded-xl font-extrabold transition ${
                mapFilter === 'pins' ? 'bg-[#10b981] text-[#071713] shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              Pins
            </button>
            <button
              onClick={() => setMapFilter('all')}
              className={`px-3 py-1 rounded-xl font-extrabold transition ${
                mapFilter === 'all' ? 'bg-[#10b981] text-[#071713] shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              All
            </button>
          </div>

          {/* Pill Bar 2: [Streets (OSM) | HD Roads | Satellite] */}
          <div className="bg-[#071713]/90 backdrop-blur-md p-1 rounded-2xl border border-emerald-500/40 flex items-center shadow-lg text-[10px] font-space gap-0.5">
            <button
              onClick={() => setTileTheme('streets')}
              className={`px-2.5 py-1 rounded-xl font-extrabold transition ${
                tileTheme === 'streets' ? 'bg-[#0b6e4f] text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              Streets (OSM)
            </button>
            <button
              onClick={() => setTileTheme('hd_roads')}
              className={`px-2.5 py-1 rounded-xl font-extrabold transition ${
                tileTheme === 'hd_roads' ? 'bg-[#0b6e4f] text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              HD Roads
            </button>
            <button
              onClick={() => setTileTheme('satellite')}
              className={`px-2.5 py-1 rounded-xl font-extrabold transition ${
                tileTheme === 'satellite' ? 'bg-[#0b6e4f] text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              Satellite
            </button>
          </div>

        </div>

        {/* Top-Right: Vertical Stack of 4 Dark Circular Icon Buttons */}
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-auto">
          {/* 1. Zoom In (+) */}
          <button
            onClick={handleZoomIn}
            className="w-9 h-9 rounded-full bg-[#071713]/90 backdrop-blur-md border border-emerald-500/40 flex items-center justify-center text-white shadow-lg hover:bg-slate-900 transition active:scale-95"
            title="Zoom In"
          >
            <Plus className="w-4 h-4 text-slate-100" />
          </button>

          {/* 2. Zoom Out (-) */}
          <button
            onClick={handleZoomOut}
            className="w-9 h-9 rounded-full bg-[#071713]/90 backdrop-blur-md border border-emerald-500/40 flex items-center justify-center text-white shadow-lg hover:bg-slate-900 transition active:scale-95"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4 text-slate-100" />
          </button>

          {/* 3. Locate / GPS (Emerald) */}
          <button
            onClick={handleLocateGPS}
            className="w-9 h-9 rounded-full bg-emerald-950/90 backdrop-blur-md border border-emerald-400 text-emerald-400 flex items-center justify-center shadow-lg hover:bg-emerald-900 transition active:scale-95"
            title="Locate GPS Position"
          >
            <Navigation className="w-4 h-4 text-emerald-300 animate-pulse" />
          </button>

          {/* 4. Reset View */}
          <button
            onClick={handleResetView}
            className="w-9 h-9 rounded-full bg-[#071713]/90 backdrop-blur-md border border-emerald-500/40 flex items-center justify-center text-white shadow-lg hover:bg-slate-900 transition active:scale-95"
            title="Reset View to Bengaluru Central"
          >
            <RotateCcw className="w-4 h-4 text-slate-300" />
          </button>
        </div>

        {/* Bottom-Left: Dark Floating Pill */}
        <div className="absolute bottom-3 left-3 z-[1000] px-3.5 py-1.5 rounded-full bg-[#071713]/90 backdrop-blur-md border border-emerald-500/40 text-[10px] font-mono-hud font-bold text-emerald-300 shadow-lg flex items-center gap-1.5 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>BENGALURU MAP • 12.9716° N, 77.5946° E</span>
        </div>

      </div>

    </div>
  );
}
