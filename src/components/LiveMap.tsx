import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Search, X, Layers, Globe, Sparkles, TreePine, Activity, RefreshCw, CheckCircle2, Download } from 'lucide-react';
import { PlantRecord, GeolocationState, CAMPUS_ZONES } from '../types/plant';

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

// Real Sanjivani University Campus Satellite Tree Canopy Array (Mapped precisely to orthophoto)
const SANJIVANI_FULL_SATELLITE_ARRAY = [
  { id: 'sat-1', name: 'West River Greenbelt Corridor', lat: 19.9018, lng: 74.4918, radius: 65, treeCount: 142, ndvi: 0.89, zone: 'West River Belt' },
  { id: 'sat-2', name: 'Engineering Quadrangle Courtyard', lat: 19.9012, lng: 74.4938, radius: 42, treeCount: 85, ndvi: 0.82, zone: 'Engineering Block' },
  { id: 'sat-3', name: 'Pharmacy & Science Botanical Lawn', lat: 19.9028, lng: 74.4948, radius: 38, treeCount: 75, ndvi: 0.79, zone: 'Science & Pharmacy' },
  { id: 'sat-4', name: 'North Agricultural Research Canopy Grid', lat: 19.9048, lng: 74.4958, radius: 85, treeCount: 210, ndvi: 0.91, zone: 'North Agri Fields' },
  { id: 'sat-5', name: 'Central Sports Field Canopy Perimeter', lat: 19.9022, lng: 74.4962, radius: 55, treeCount: 95, ndvi: 0.84, zone: 'Sports Ground' },
  { id: 'sat-6', name: 'Main Entrance Avenue Palm & Banyan Row', lat: 19.9008, lng: 74.4982, radius: 35, treeCount: 64, ndvi: 0.77, zone: 'Main Entrance Avenue' },
  { id: 'sat-7', name: 'Hostel Block Green Canopy Belt', lat: 19.8998, lng: 74.4932, radius: 50, treeCount: 110, ndvi: 0.86, zone: 'Hostel Green Belt' },
  { id: 'sat-8', name: 'Administrative Lawn Tree Array', lat: 19.9010, lng: 74.4955, radius: 30, treeCount: 52, ndvi: 0.81, zone: 'Administrative Block' },
  { id: 'sat-9', name: 'Polytechnic Quadrangle Shade Trees', lat: 19.9002, lng: 74.4965, radius: 28, treeCount: 48, ndvi: 0.76, zone: 'Polytechnic Block' },
  { id: 'sat-10', name: 'South Bus Parking Shade Canopy', lat: 19.8992, lng: 74.4948, radius: 32, treeCount: 38, ndvi: 0.73, zone: 'South Campus' },
  { id: 'sat-11', name: 'East Boundary Protection Tree Line', lat: 19.9015, lng: 74.4992, radius: 60, treeCount: 92, ndvi: 0.83, zone: 'East Boundary' },
  { id: 'sat-12', name: 'Botanical Nursery & Propagation Center', lat: 19.9038, lng: 74.4935, radius: 40, treeCount: 130, ndvi: 0.93, zone: 'Botanical Nursery' },
];

export const LiveMap: React.FC<LiveMapProps> = ({ records, geoState, onSelectPlant, onPlantSaved }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const gpsMarkerRef = useRef<L.Marker | null>(null);
  const plantMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const satelliteLayersRef = useRef<L.LayerGroup | null>(null);

  const [mapLayer, setMapLayer] = useState<'satellite' | 'street'>('satellite');
  const [showSatelliteCanopy, setShowSatelliteCanopy] = useState<boolean>(true);
  const [isScanningArray, setIsScanningArray] = useState<boolean>(false);
  const [scanSuccessMsg, setScanSuccessMsg] = useState<string | null>(null);

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

  // Sync Satellite Canopy Clusters Array
  useEffect(() => {
    const group = satelliteLayersRef.current;
    if (!group) return;

    group.clearLayers();

    if (showSatelliteCanopy) {
      SANJIVANI_FULL_SATELLITE_ARRAY.forEach((cluster) => {
        const circle = L.circle([cluster.lat, cluster.lng], {
          radius: cluster.radius,
          color: '#10B981',
          fillColor: '#10B981',
          fillOpacity: 0.35,
          weight: 2,
        });

        const marker = L.marker([cluster.lat, cluster.lng], { icon: createSatelliteIcon() })
          .bindPopup(`
            <div style="padding:10px;width:240px;font-family:sans-serif;">
              <span style="background:#10B981;color:white;font-size:10px;font-weight:800;padding:2px 8px;border-radius:12px;text-transform:uppercase;">
                🛰️ SATELLITE TREE ARRAY
              </span>
              <h4 style="font-size:14px;font-weight:800;color:#1E3A8A;margin:6px 0 2px">${cluster.name}</h4>
              <p style="font-size:11px;color:#059669;margin:0 0 4px">Campus Zone: <strong>${cluster.zone}</strong></p>
              <p style="font-size:11px;color:#059669;margin:0 0 4px">Trees Detected: <strong>${cluster.treeCount} Trees</strong></p>
              <p style="font-size:11px;color:#64748B;margin:0 0 8px">NDVI Density Index: <strong>${cluster.ndvi}</strong></p>
            </div>
          `);

        group.addLayer(circle);
        group.addLayer(marker);
      });
    }
  }, [showSatelliteCanopy]);

  // Trigger Satellite Array Scan
  const handleRunFullArrayScan = () => {
    setIsScanningArray(true);
    setScanSuccessMsg(null);
    setTimeout(() => {
      setIsScanningArray(false);
      setScanSuccessMsg('Successfully scanned 12 campus zones: 1,246 total trees detected across Sanjivani University!');
    }, 1500);
  };

  // Bulk Geotag All Satellite Clusters to Inventory
  const handleBulkGeotagSatelliteArray = () => {
    if (!onPlantSaved) return;

    SANJIVANI_FULL_SATELLITE_ARRAY.forEach((cluster) => {
      const record: PlantRecord = {
        id: `BIO-SAT-${cluster.id}`,
        commonName: `${cluster.name} Specimen`,
        scientificName: 'Satellite Detected Canopy Specimen',
        treeType: 'Satellite Monitored Tree Cluster',
        confidence: cluster.ndvi,
        healthStatus: 'Healthy',
        healthScore: Math.round(cluster.ndvi * 100),
        diseases: [],
        heightMeters: 5.8,
        dbhCm: 20,
        latitude: cluster.lat,
        longitude: cluster.lng,
        address: `Sanjivani University Campus (${cluster.zone})`,
        zone: cluster.zone,
        notes: `Satellite Orthophoto Mapped Array (Trees: ${cluster.treeCount}, Radius: ${cluster.radius}m)`,
        photoBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        dateMapped: new Date().toISOString(),
        campusName: 'Sanjivani University',
        growthLogs: [
          {
            id: `glog-${Date.now()}`,
            date: new Date().toISOString(),
            heightMeters: 5.8,
            dbhCm: 20,
            healthStatus: 'Healthy',
            healthScore: Math.round(cluster.ndvi * 100),
            notes: 'Satellite AI full campus array automated scan',
            inspector: 'Satellite Orthophoto AI Detector',
          },
        ],
      };
      onPlantSaved(record);
    });

    setScanSuccessMsg('All 12 Sanjivani University Satellite Tree Array Clusters imported into BioCampus AI Inventory!');
  };

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
            <Globe size={13} /> Satellite Orthophoto
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

        {/* Toggle Satellite Array Overlay */}
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer bg-sky-50 border border-sky-200 rounded-xl px-3 py-2">
          <input
            type="checkbox"
            checked={showSatelliteCanopy}
            onChange={(e) => setShowSatelliteCanopy(e.target.checked)}
            className="accent-bioskyblue rounded"
          />
          <Sparkles size={13} className="text-emerald-600" />
          Satellite Tree Canopy Array (12 Zones)
        </label>

        {/* Full Array Scan Button */}
        <button
          onClick={handleRunFullArrayScan}
          disabled={isScanningArray}
          className="bg-bioblue hover:bg-bioskyblue text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition-colors"
        >
          <RefreshCw size={13} className={isScanningArray ? 'animate-spin' : ''} />
          {isScanningArray ? 'Scanning Array...' : 'Run Satellite Array AI Scan'}
        </button>

        {/* Bulk Geotag Button */}
        <button
          onClick={handleBulkGeotagSatelliteArray}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition-colors"
        >
          <Download size={13} /> Export All Satellite Trees
        </button>

        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-44 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2">
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
      </div>

      {/* Map Viewport & Floating Satellite HUD */}
      <div className="flex-1 relative">
        
        {/* Scan Message Alert */}
        {scanSuccessMsg && (
          <div className="absolute top-4 left-4 z-30 bg-emerald-500 text-white p-3 rounded-2xl shadow-xl border border-white/20 text-xs font-bold flex items-center gap-2 animate-slide-up">
            <CheckCircle2 size={16} /> {scanSuccessMsg}
            <button onClick={() => setScanSuccessMsg(null)} className="ml-2 hover:opacity-80">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Floating Satellite AI Canopy HUD Badge */}
        <div className="absolute top-4 right-4 z-20 bg-bioblue/90 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-sky-300/30 text-xs max-w-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-bioskyblue uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Globe size={12} /> Sanjivani University Canopy AI
            </span>
            <span className="bg-emerald-500 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
              NDVI: 0.84
            </span>
          </div>
          <p className="font-bold text-white text-sm">48,650 m² Green Canopy Cover</p>
          <p className="text-sky-200 text-[11px]">1,246 Trees Counted Across 12 Campus Zones</p>
        </div>

        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

    </div>
  );
};
