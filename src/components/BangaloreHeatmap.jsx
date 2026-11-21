import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Layers, MapPin, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function BangaloreHeatmap({ tickets, onSelectTicket }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center on Bengaluru Central / East Wards
    const centerLatLng = [12.9716, 77.6000];

    // Destroy prior map instance if any (for hot reloading safety)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: centerLatLng,
      zoom: 13,
      zoomControl: false
    });
    mapInstanceRef.current = map;

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // 100% Free OpenStreetMap Carto tiles (Zero API key, zero watermarks)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Local Ward Boundary Outline (Dashed Emerald Polygon)
    const wardBoundaryCoords = [
      [12.9880, 77.5800],
      [12.9940, 77.6350],
      [12.9650, 77.6520],
      [12.9320, 77.6410],
      [12.9250, 77.5920],
      [12.9550, 77.5750]
    ];

    L.polygon(wardBoundaryCoords, {
      color: '#10B981',
      weight: 2,
      dashArray: '6, 6',
      fillColor: '#10B981',
      fillOpacity: 0.05
    }).addTo(map).bindPopup(`
      <div style="font-family: 'Space Grotesk', sans-serif; font-size: 11px;">
        <strong style="color: #10B981;">Bengaluru Ward 174 &amp; Indiranagar Zone</strong><br/>
        BBMP Civic Jurisdiction • Real-time Health Index: <strong>68/100</strong>
      </div>
    `);

    // Density Risk Heat Clusters:
    // 1. Road Degradation (Red #ef4444)
    L.circle([12.9750, 77.6100], {
      color: '#ef4444',
      fillColor: '#ef4444',
      fillOpacity: 0.35,
      radius: 650,
      weight: 1
    }).addTo(map).bindPopup(`
      <div style="font-size: 11px;">
        <strong style="color: #ef4444;">🚨 Road Degradation Cluster</strong><br/>
        8 Reported Potholes u/s 133 CrPC • PWD / BBMP Alert
      </div>
    `);

    // 2. Waterlogging (Blue #0284c7)
    L.circle([12.9580, 77.6320], {
      color: '#0284c7',
      fillColor: '#0284c7',
      fillOpacity: 0.35,
      radius: 500,
      weight: 1
    }).addTo(map).bindPopup(`
      <div style="font-size: 11px;">
        <strong style="color: #0284c7;">💧 Chronic Waterlogging Hazard</strong><br/>
        Low-lying intersection near Stormwater drain junction
      </div>
    `);

    // 3. SLA Breaches (Amber #f59e0b)
    L.circle([12.9420, 77.6050], {
      color: '#f59e0b',
      fillColor: '#f59e0b',
      fillOpacity: 0.35,
      radius: 450,
      weight: 1
    }).addTo(map).bindPopup(`
      <div style="font-size: 11px;">
        <strong style="color: #f59e0b;">⏳ SLA Escalation Cluster</strong><br/>
        4 unresolved grievances exceeding 72h municipal deadline
      </div>
    `);

    // Top Critical Hazard Pin Markers with Circular Number Badges (#1, #2, #3) and Ticket Age Days
    const criticalPins = [
      {
        num: '#1',
        age: '21d',
        lat: 12.9785,
        lng: 77.5980,
        title: 'Snapped Live Wire Near School Gate',
        dept: 'BESCOM Electricity',
        severity: 'Critical'
      },
      {
        num: '#2',
        age: '17d',
        lat: 12.9640,
        lng: 77.6180,
        title: 'High-Pressure Water Main Rupture',
        dept: 'BWSSB Water Works',
        severity: 'High'
      },
      {
        num: '#3',
        age: '8d',
        lat: 12.9510,
        lng: 77.6350,
        title: 'Deep Open Crater Pothole (100ft Rd)',
        dept: 'BBMP Road Infrastructure',
        severity: 'Critical'
      }
    ];

    criticalPins.forEach((pin) => {
      const pinHtml = `
        <div style="
          display: flex;
          align-items: center;
          gap: 3px;
          background: rgba(2, 6, 23, 0.92);
          border: 1.5px solid ${pin.severity === 'Critical' ? '#ef4444' : '#f59e0b'};
          border-radius: 9999px;
          padding: 2px 6px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.8);
          font-family: 'Space Grotesk', sans-serif;
          white-space: nowrap;
          transform: translate(-50%, -50%);
        ">
          <span style="
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: ${pin.severity === 'Critical' ? '#ef4444' : '#f59e0b'};
            color: #ffffff;
            font-size: 9px;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
          ">${pin.num}</span>
          <span style="color: #f8fafc; font-size: 10px; font-weight: 700;">${pin.age}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        html: pinHtml,
        className: 'custom-hazard-pin',
        iconSize: [60, 24]
      });

      const marker = L.marker([pin.lat, pin.lng], { icon: customIcon }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; space-y: 2px;">
          <div style="color: #ef4444; font-weight: 800; font-size: 10px; text-transform: uppercase;">
            ${pin.severity} HAZARD • ${pin.num}
          </div>
          <strong style="color: #ffffff; display: block; margin: 2px 0;">${pin.title}</strong>
          <div style="color: #00A896; font-size: 10px;">${pin.dept}</div>
          <div style="color: #94a3b8; font-size: 9px; margin-top: 4px;">Unresolved for ${pin.age}</div>
        </div>
      `);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col space-y-2 pb-20 relative">
      
      {/* Top Map HUD Controls */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white font-space">Bengaluru Civic Hazard Heatmap</span>
        </div>
        <span className="font-mono-hud text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
          OSM TILES • 100% FREE
        </span>
      </div>

      {/* Legend Bar */}
      <div className="flex items-center justify-around bg-slate-950/85 backdrop-blur-xl border border-white/10 rounded-xl p-2 text-[10px] font-mono-hud text-slate-300">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          <span>Road Damage</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span>Waterlogging</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>SLA Breach</span>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="flex-1 min-h-[60vh] rounded-3xl overflow-hidden border border-emerald-500/40 shadow-2xl relative">
        <div ref={mapContainerRef} className="w-full h-full min-h-[60vh]" />
        
        {/* Floating Ward Info Overlay */}
        <div className="absolute top-3 left-3 z-[1000] p-2.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-emerald-500/40 text-[10px] space-y-0.5 pointer-events-none">
          <div className="font-bold text-emerald-400 flex items-center gap-1 font-space">
            <MapPin className="w-3 h-3 text-[#F0533A]" />
            <span>Ward 174 • Bengaluru</span>
          </div>
          <div className="text-slate-300 font-mono-hud">3 Critical Pins Active</div>
        </div>
      </div>

    </div>
  );
}
