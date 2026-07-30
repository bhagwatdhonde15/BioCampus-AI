import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Globe, Eye, Layers, Sparkles, MapPin, TreePine, Leaf, Shield, Activity, RefreshCw, CheckCircle2, Info, ArrowUpRight
} from 'lucide-react';
import { PlantRecord, GeolocationState, CAMPUS_ZONES } from '../types/plant';

// Fix Leaflet marker icons
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

// Custom Satellite Tree Pin Icon
const satelliteTreeIcon = L.divIcon({
  className: 'custom-satellite-icon',
  html: `<div style="background-color: #10B981; width: 28px; height: 28px; rounded-full; border: 2px solid white; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 4px 10px rgba(16,185,129,0.5); font-size: 14px;">🌳</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

interface SatelliteDetectorProps {
  records: PlantRecord[];
  geoState: GeolocationState;
  campusName: string;
  onPlantSaved: (record: PlantRecord) => void;
  onNavigateTab: (tab: string) => void;
}

// Sanjivani University Coordinates & Satellite Clusters
const SANJIVANI_CENTER: [number, number] = [19.9016, 74.4949];

// Simulated AI Satellite Tree Clusters across Sanjivani University Campus
const SATELLITE_CANOPY_CLUSTERS = [
  { id: 'sat-1', name: 'Central Library Lawn Canopy', lat: 19.9021, lng: 74.4952, radiusMeters: 35, treeCount: 42, ndvi: 0.78, health: 'Dense Healthy' },
  { id: 'sat-2', name: 'Engineering Quadrangle Greenery', lat: 19.9012, lng: 74.4942, radiusMeters: 45, treeCount: 68, ndvi: 0.82, health: 'Optimal Growth' },
  { id: 'sat-3', name: 'Pharmacy & Science Botanical Zone', lat: 19.9028, lng: 74.4960, radiusMeters: 30, treeCount: 35, ndvi: 0.75, health: 'Healthy' },
  { id: 'sat-4', name: 'Hostel Perimeter Green Belt', lat: 19.9004, lng: 74.4935, radiusMeters: 55, treeCount: 84, ndvi: 0.88, health: 'Dense Canopy' },
  { id: 'sat-5', name: 'Main Entrance Avenue Palm Row', lat: 19.9035, lng: 74.4971, radiusMeters: 25, treeCount: 28, ndvi: 0.71, health: 'Moderate' },
];

function RecenterMap({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 17);
  }, [coords, map]);
  return null;
}

export const SatelliteDetector: React.FC<SatelliteDetectorProps> = ({
  records,
  geoState,
  campusName,
  onPlantSaved,
  onNavigateTab,
}) => {
  const [mapLayer, setMapLayer] = useState<'satellite' | 'street' | 'ndvi'>('satellite');
  const [showCanopyCircles, setShowCanopyCircles] = useState<boolean>(true);
  const [isScanningSatellite, setIsScanningSatellite] = useState<boolean>(false);
  const [selectedCluster, setSelectedCluster] = useState<typeof SATELLITE_CANOPY_CLUSTERS[0] | null>(SATELLITE_CANOPY_CLUSTERS[0]);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Trigger Satellite Scan Refresh
  const handleRunSatelliteScan = () => {
    setIsScanningSatellite(true);
    setSavedSuccessMsg(null);
    setTimeout(() => {
      setIsScanningSatellite(false);
    }, 1800);
  };

  // Convert Satellite Canopy Cluster into a Geotagged Plant Passport
  const handleGeotagClusterAsRecord = (cluster: typeof SATELLITE_CANOPY_CLUSTERS[0]) => {
    const record: PlantRecord = {
      id: `BIO-SAT-${Date.now().toString().slice(-6)}`,
      commonName: `${cluster.name} Cluster Tree`,
      scientificName: 'Satellite Detected Canopy Specimen',
      treeType: 'Satellite Monitored Canopy',
      confidence: cluster.ndvi,
      healthStatus: 'Healthy',
      healthScore: Math.round(cluster.ndvi * 100),
      diseases: [],
      heightMeters: 6.2,
      dbhCm: 22,
      latitude: cluster.lat,
      longitude: cluster.lng,
      address: `Sanjivani University Campus, Kopargaon (NDVI: ${cluster.ndvi})`,
      zone: CAMPUS_ZONES[0],
      notes: `Detected via Satellite High-Res Imagery (Canopy Radius: ${cluster.radiusMeters}m, Est Trees: ${cluster.treeCount})`,
      photoBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      dateMapped: new Date().toISOString(),
      campusName,
      growthLogs: [
        {
          id: `glog-${Date.now()}`,
          date: new Date().toISOString(),
          heightMeters: 6.2,
          dbhCm: 22,
          healthStatus: 'Healthy',
          healthScore: Math.round(cluster.ndvi * 100),
          notes: 'Satellite Orthophoto NDVI Canopy Detection',
          inspector: 'BioCampus Satellite AI Engine',
        },
      ],
    };

    onPlantSaved(record);
    setSavedSuccessMsg(`Successfully registered ${record.commonName} into BioCampus AI!`);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
      
      {/* Title Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-bioblue flex items-center gap-2">
              <Globe className="text-bioskyblue" /> Sanjivani University Satellite Plant & Tree AI Detector
            </h2>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
              <Sparkles size={12} /> High-Res Orthophoto AI
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Detecting tree canopy coverage, vegetation density (NDVI), and individual plant clusters across Sanjivani University campus.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunSatelliteScan}
            disabled={isScanningSatellite}
            className="bg-bioblue hover:bg-bioskyblue text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-bioblue/30 transition-all"
          >
            <RefreshCw size={15} className={isScanningSatellite ? 'animate-spin' : ''} />
            {isScanningSatellite ? 'Scanning Campus Satellite Layer...' : 'Run Satellite AI Scan'}
          </button>
        </div>
      </div>

      {/* Main Map & AI Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Interactive Satellite Leaflet Map */}
        <div className="lg:col-span-2 bg-white rounded-2xl overflow-hidden border border-sky-100 shadow-sm flex flex-col justify-between min-h-[520px]">
          
          {/* Map Layer Switcher Bar */}
          <div className="p-3 bg-sky-50 border-b border-sky-100 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-bioblue" />
              <span className="font-bold text-bioblue">Satellite View Layer:</span>
              
              <button
                onClick={() => setMapLayer('satellite')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  mapLayer === 'satellite' ? 'bg-bioskyblue text-white' : 'bg-white text-slate-700 hover:bg-sky-100'
                }`}
              >
                Esri High-Res Satellite
              </button>

              <button
                onClick={() => setMapLayer('street')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  mapLayer === 'street' ? 'bg-bioskyblue text-white' : 'bg-white text-slate-700 hover:bg-sky-100'
                }`}
              >
                OpenStreetMap Vector
              </button>
            </div>

            <label className="flex items-center gap-1.5 font-bold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showCanopyCircles}
                onChange={(e) => setShowCanopyCircles(e.target.checked)}
                className="accent-bioskyblue rounded"
              />
              Show Canopy AI Clusters
            </label>
          </div>

          {/* Map Viewport Container */}
          <div className="relative w-full h-[460px]">
            <MapContainer
              center={SANJIVANI_CENTER}
              zoom={17}
              scrollWheelZoom={true}
              className="w-full h-full z-10"
            >
              <RecenterMap coords={SANJIVANI_CENTER} />

              {mapLayer === 'satellite' ? (
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                />
              ) : (
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
              )}

              {/* Satellite Canopy Circles */}
              {showCanopyCircles && SATELLITE_CANOPY_CLUSTERS.map((cluster) => (
                <React.Fragment key={cluster.id}>
                  <Circle
                    center={[cluster.lat, cluster.lng]}
                    radius={cluster.radiusMeters}
                    pathOptions={{
                      color: '#10B981',
                      fillColor: '#10B981',
                      fillOpacity: 0.35,
                      weight: 2,
                    }}
                    eventHandlers={{
                      click: () => setSelectedCluster(cluster),
                    }}
                  />
                  <Marker
                    position={[cluster.lat, cluster.lng]}
                    icon={satelliteTreeIcon}
                    eventHandlers={{
                      click: () => setSelectedCluster(cluster),
                    }}
                  >
                    <Popup>
                      <div className="text-xs space-y-1">
                        <p className="font-bold text-bioblue">{cluster.name}</p>
                        <p className="text-emerald-600 font-semibold">Tree Count: {cluster.treeCount} Trees</p>
                        <p className="text-slate-500">NDVI Health: {cluster.ndvi}</p>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              ))}

              {/* User Catalogued Pins */}
              {records.map((plant) => (
                <Marker key={plant.id} position={[plant.latitude, plant.longitude]}>
                  <Popup>
                    <div className="text-xs font-sans">
                      <p className="font-bold text-bioblue">{plant.commonName}</p>
                      <p className="text-slate-500 italic">{plant.scientificName}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

            </MapContainer>
          </div>

          {/* Map Footer Metadata Bar */}
          <div className="p-3 bg-bioblue text-white text-xs flex justify-between items-center font-mono">
            <span>📍 Sanjivani University Campus Bounding Box: 19.9016° N, 74.4949° E</span>
            <span className="text-emerald-400 font-bold">Satellite Resolution: 0.5m/px</span>
          </div>

        </div>

        {/* Right 1 Column: Satellite AI Metrics & Cluster Inspector */}
        <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-bioblue text-lg flex items-center gap-2">
                <Sparkles className="text-bioskyblue" /> Satellite AI Analytics
              </h3>
              <span className="bg-emerald-100 text-emerald-800 font-mono font-bold text-xs px-2.5 py-1 rounded-lg">
                NDVI: 0.81
              </span>
            </div>

            {/* High-Level Satellite Canopy Cards */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="bg-sky-50 p-3 rounded-xl border border-sky-100">
                <span className="text-slate-500 font-medium block">Total Campus Canopy</span>
                <span className="text-lg font-extrabold text-bioblue">42.8%</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">38,450 m² Green Cover</span>
              </div>

              <div className="bg-sky-50 p-3 rounded-xl border border-sky-100">
                <span className="text-slate-500 font-medium block">Est. Campus Trees</span>
                <span className="text-lg font-extrabold text-bioblue">1,280</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Satellite Counted</span>
              </div>
            </div>

            {/* Selected Satellite Cluster Inspector */}
            {selectedCluster ? (
              <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    Selected Satellite Canopy Cluster
                  </span>
                  <span className="text-xs font-mono font-bold text-bioblue bg-white px-2 py-0.5 rounded border border-emerald-300">
                    ID: {selectedCluster.id}
                  </span>
                </div>

                <h4 className="text-lg font-extrabold text-bioblue leading-tight">{selectedCluster.name}</h4>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-slate-500 font-medium">Tree Density</span>
                    <p className="font-extrabold text-bioblue text-sm">{selectedCluster.treeCount} Trees</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">NDVI Health</span>
                    <p className="font-extrabold text-emerald-600 text-sm">{selectedCluster.ndvi}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Canopy Radius</span>
                    <p className="font-extrabold text-slate-700">{selectedCluster.radiusMeters} meters</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Health Status</span>
                    <p className="font-extrabold text-emerald-600">{selectedCluster.health}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleGeotagClusterAsRecord(selectedCluster)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-colors mt-2"
                >
                  <TreePine size={15} /> Geotag Satellite Cluster to Inventory
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Globe size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Click any green satellite cluster on the map</p>
              </div>
            )}
          </div>

          {/* Action Success & Navigation Link */}
          <div className="space-y-3 pt-4 border-t border-sky-100">
            {savedSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-800 text-xs space-y-2 animate-slide-up">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 size={16} className="text-emerald-600" /> {savedSuccessMsg}
                </div>
                <button
                  onClick={() => onNavigateTab('growth')}
                  className="w-full bg-bioblue hover:bg-bioskyblue text-white font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors text-xs shadow"
                >
                  <Activity size={14} /> Open Real-Time Growth Monitor <ArrowUpRight size={14} />
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
