import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Search, X, Layers, Globe, Sparkles } from 'lucide-react';
import { PlantRecord, GeolocationState } from '../types/plant';

// Fix Leaflet default icon path in Vite
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LiveMapProps {
  records: PlantRecord[];
  geoState: GeolocationState;
  onSelectPlant: (record: PlantRecord) => void;
  onPlantSaved?: (record: PlantRecord) => void;
}

// Plant pin icon
const createPlantIcon = () =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:#0284C7;border:3px solid white;
      box-shadow:0 2px 8px rgba(2,132,199,0.6);
      display:flex;align-items:center;justify-content:center;
      font-size:13px;cursor:pointer;
    ">🌿</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

// Satellite Tree Pin Icon
const createSatelliteIcon = () =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:#10B981;border:3px solid white;
      box-shadow:0 2px 8px rgba(16,185,129,0.6);
      display:flex;align-items:center;justify-content:center;
      font-size:13px;cursor:pointer;
    ">🌳</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

// Pulsing GPS icon
const createGpsIcon = () =>
  L.divIcon({
    className: '',
    html: `<div style="position:relative;width:20px;height:20px;display:flex;align-items:center;justify-content:center;">
      <div style="position:absolute;width:20px;height:20px;border-radius:50%;background:rgba(30,58,138,0.25);animation:gps-ripple 1.5s ease-out infinite;"></div>
      <div style="width:12px;height:12px;border-radius:50%;background:#1E3A8A;border:2px solid white;box-shadow:0 2px 6px rgba(30,58,138,0.5);"></div>
    </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

// Sanjivani University Satellite Clusters
const SANJIVANI_CLUSTERS = [
  { id: 'sat-1', name: 'Central Library Lawn Canopy', lat: 19.9021, lng: 74.4952, radius: 35, treeCount: 42, ndvi: 0.78 },
  { id: 'sat-2', name: 'Engineering Quadrangle Greenery', lat: 19.9012, lng: 74.4942, radius: 45, treeCount: 68, ndvi: 0.82 },
  { id: 'sat-3', name: 'Pharmacy & Science Botanical Zone', lat: 19.9028, lng: 74.4960, radius: 30, treeCount: 35, ndvi: 0.75 },
  { id: 'sat-4', name: 'Hostel Perimeter Green Belt', lat: 19.9004, lng: 74.4935, radius: 55, treeCount: 84, ndvi: 0.88 },
  { id: 'sat-5', name: 'Main Entrance Avenue Palm Row', lat: 19.9035, lng: 74.4971, radius: 25, treeCount: 28, ndvi: 0.71 },
];

export const LiveMap: React.FC<LiveMapProps> = ({ records, geoState, onSelectPlant }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const gpsMarkerRef = useRef<L.Marker | null>(null);
  const plantMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const satelliteLayersRef = useRef<L.LayerGroup | null>(null);

  const [mapLayer, setMapLayer] = useState<'satellite' | 'street'>('satellite');
  const [showSatelliteCanopy, setShowSatelliteCanopy] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterZone, setFilterZone] = useState('all');
  const [filterHealth, setFilterHealth] = useState('all');

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [19.9016, 74.4949],
      zoom: 17,
      zoomControl: true,
    });

    const tileUrl = mapLayer === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: mapLayer === 'satellite' ? 'Esri World Imagery' : 'OpenStreetMap',
      maxZoom: 20,
    }).addTo(map);

    satelliteLayersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle Tile Layer Switch (Satellite vs Street)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileUrl = mapLayer === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: mapLayer === 'satellite' ? 'Esri High-Res Satellite' : 'OpenStreetMap',
      maxZoom: 20,
    }).addTo(map);
  }, [mapLayer]);

  // Sync Satellite Canopy Clusters
  useEffect(() => {
    const group = satelliteLayersRef.current;
    if (!group) return;

    group.clearLayers();

    if (showSatelliteCanopy) {
      SANJIVANI_CLUSTERS.forEach((cluster) => {
        const circle = L.circle([cluster.lat, cluster.lng], {
          radius: cluster.radius,
          color: '#10B981',
          fillColor: '#10B981',
          fillOpacity: 0.3,
          weight: 2,
        });

        const marker = L.marker([cluster.lat, cluster.lng], { icon: createSatelliteIcon() })
          .bindPopup(`
            <div style="padding:10px;width:220px;font-family:sans-serif;">
              <span style="background:#10B981;color:white;font-size:10px;font-weight:800;padding:2px 8px;border-radius:12px;text-transform:uppercase;">
                🛰️ SATELLITE CANOPY AI
              </span>
              <h4 style="font-size:14px;font-weight:800;color:#1E3A8A;margin:6px 0 2px">${cluster.name}</h4>
              <p style="font-size:11px;color:#059669;margin:0 0 6px">Trees Counted: <strong>${cluster.treeCount} Trees</strong></p>
              <p style="font-size:11px;color:#64748B;margin:0 0 8px">NDVI Density Score: <strong>${cluster.ndvi}</strong></p>
            </div>
          `);

        group.addLayer(circle);
        group.addLayer(marker);
      });
    }
  }, [showSatelliteCanopy]);

  // Update GPS user marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geoState.lat || !geoState.lng) return;

    const pos: L.LatLngExpression = [geoState.lat, geoState.lng];

    if (gpsMarkerRef.current) {
      gpsMarkerRef.current.setLatLng(pos);
    } else {
      gpsMarkerRef.current = L.marker(pos, { icon: createGpsIcon(), zIndexOffset: 1000 })
        .addTo(map)
        .bindTooltip('📍 Your GPS Location', { permanent: false, direction: 'top' });
      map.setView(pos, 17);
    }
  }, [geoState.lat, geoState.lng]);

  // Filter records
  const filteredRecords = records.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      r.commonName.toLowerCase().includes(q) ||
      r.scientificName.toLowerCase().includes(q) ||
      r.zone.toLowerCase().includes(q);
    const matchZone = filterZone === 'all' || r.zone === filterZone;
    const matchHealth = filterHealth === 'all' || r.healthStatus === filterHealth;
    return matchSearch && matchZone && matchHealth;
  });

  // Sync plant markers with filtered records
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    plantMarkersRef.current.forEach((marker, id) => {
      if (!filteredRecords.find((r) => r.id === id)) {
        map.removeLayer(marker);
        plantMarkersRef.current.delete(id);
      }
    });

    filteredRecords.forEach((record) => {
      if (plantMarkersRef.current.has(record.id)) return;

      const marker = L.marker([record.latitude, record.longitude], { icon: createPlantIcon() })
        .addTo(map)
        .bindPopup(() => {
          const div = document.createElement('div');
          div.className = 'w-64';
          div.innerHTML = `
            <div class="relative">
              <img src="${record.photoBase64}" alt="${record.commonName}"
                class="w-full h-36 object-cover" style="border-radius:0" />
              <div style="position:absolute;top:8px;right:8px;
                background:${record.healthStatus === 'Healthy' ? '#10B981' : '#EF4444'};
                color:white;font-size:11px;font-weight:700;
                padding:2px 8px;border-radius:20px;">
                ${record.healthStatus}
              </div>
            </div>
            <div style="padding:12px;">
              <p style="font-weight:800;font-size:15px;color:#1E3A8A;margin:0 0 2px">${record.commonName}</p>
              <p style="font-style:italic;font-size:12px;color:#475569;margin:0 0 8px">${record.scientificName}</p>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;color:#64748B;margin-bottom:10px;">
                <div><strong>Confidence:</strong><br/>${(record.confidence * 100).toFixed(1)}%</div>
                <div><strong>Zone:</strong><br/>${record.zone}</div>
                <div style="grid-column:span 2"><strong>GPS:</strong> ${record.latitude.toFixed(5)}, ${record.longitude.toFixed(5)}</div>
              </div>
              <button
                onclick="window.__biocampus_select('${record.id}')"
                style="width:100%;background:#1E3A8A;color:white;border:none;padding:8px;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;transition:background 0.2s"
                onmouseover="this.style.background='#0284C7'"
                onmouseout="this.style.background='#1E3A8A'"
              >
                View Full Details →
              </button>
            </div>
          `;
          return div;
        }, { maxWidth: 280 });

      plantMarkersRef.current.set(record.id, marker);
    });
  }, [filteredRecords]);

  // Bridge popup button clicks to React via global
  useEffect(() => {
    (window as { __biocampus_select?: (id: string) => void }).__biocampus_select = (id: string) => {
      const record = records.find((r) => r.id === id);
      if (record) onSelectPlant(record);
    };
    return () => {
      delete (window as { __biocampus_select?: (id: string) => void }).__biocampus_select;
    };
  }, [records, onSelectPlant]);

  const uniqueZones = ['all', ...Array.from(new Set(records.map((r) => r.zone)))];

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 120px)' }}>
      
      {/* Top Controls Bar */}
      <div className="bg-white border-b border-sky-100 px-4 py-3 flex gap-3 items-center flex-wrap shadow-sm z-10">
        
        {/* Layer Switcher */}
        <div className="flex items-center gap-1.5 bg-sky-50 border border-sky-200 rounded-xl p-1 text-xs">
          <button
            onClick={() => setMapLayer('satellite')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-colors ${
              mapLayer === 'satellite' ? 'bg-bioskyblue text-white shadow' : 'text-slate-600 hover:text-bioblue'
            }`}
          >
            <Globe size={13} /> Satellite Imagery
          </button>
          <button
            onClick={() => setMapLayer('street')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-colors ${
              mapLayer === 'street' ? 'bg-bioskyblue text-white shadow' : 'text-slate-600 hover:text-bioblue'
            }`}
          >
            <Layers size={13} /> OpenStreetMap
          </button>
        </div>

        {/* Toggle Canopy Overlay */}
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer bg-sky-50 border border-sky-200 rounded-xl px-3 py-2">
          <input
            type="checkbox"
            checked={showSatelliteCanopy}
            onChange={(e) => setShowSatelliteCanopy(e.target.checked)}
            className="accent-bioskyblue rounded"
          />
          <Sparkles size={13} className="text-emerald-600" />
          Satellite Canopy AI Clusters
        </label>

        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-48 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2">
          <Search size={16} className="text-bioskyblue flex-shrink-0" />
          <input
            type="text"
            placeholder="Search species, zone, or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-slate-700 flex-1 outline-none placeholder-slate-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <X size={14} className="text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>

        {/* Filters */}
        <select
          value={filterZone}
          onChange={(e) => setFilterZone(e.target.value)}
          className="bg-sky-50 border border-sky-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none"
        >
          {uniqueZones.map((z) => (
            <option key={z} value={z}>{z === 'all' ? 'All Zones' : z}</option>
          ))}
        </select>
      </div>

      {/* Map Viewport & Floating Satellite HUD */}
      <div className="flex-1 relative">
        
        {/* Floating Satellite AI Canopy HUD Badge */}
        <div className="absolute top-4 right-4 z-20 bg-bioblue/90 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-sky-300/30 text-xs max-w-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-bioskyblue uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Globe size={12} /> Sanjivani University Canopy AI
            </span>
            <span className="bg-emerald-500 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
              NDVI: 0.81
            </span>
          </div>
          <p className="font-bold text-white text-sm">42.8% Green Canopy Cover</p>
          <p className="text-sky-200 text-[11px]">38,450 m² Total Greenery · 1,280 Trees Counted</p>
        </div>

        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

    </div>
  );
};
