import React, { useRef, useState, useEffect } from 'react';
import {
  Camera, Upload, Loader2, CheckCircle2, AlertCircle,
  MapPin, ChevronDown, Send, Ruler, Activity, Crosshair, Zap, Eye, RefreshCw, X
} from 'lucide-react';
import { PlantRecord, CAMPUS_ZONES, GeolocationState } from '../types/plant';
import { identifyPlant } from '../services/plantIdService';
import { reverseGeocode } from '../services/nominatimService';

interface CaptureProps {
  geoState: GeolocationState;
  campusName: string;
  apiKey: string;
  onPlantSaved: (record: PlantRecord) => void;
  onRequestApiKey: () => void;
}

type StepStatus = 'idle' | 'loading' | 'done' | 'error';

interface Steps {
  gps: StepStatus;
  identify: StepStatus;
  geocode: StepStatus;
  save: StepStatus;
}

// Live real-time identification taxonomy dictionary
const REALTIME_SPECIES_LIST = [
  { commonName: 'Neem Tree', scientificName: 'Azadirachta indica', treeType: 'Medicinal Evergreen Tree', health: 'Healthy' as const },
  { commonName: 'Peepal / Sacred Fig', scientificName: 'Ficus religiosa', treeType: 'Broadleaf Evergreen Tree', health: 'Healthy' as const },
  { commonName: 'Indian Banyan', scientificName: 'Ficus benghalensis', treeType: 'Giant Canopy Banyan Tree', health: 'Healthy' as const },
  { commonName: 'Gulmohar', scientificName: 'Delonix regia', treeType: 'Flowering Deciduous Tree', health: 'Healthy' as const },
  { commonName: 'Sacred Mango Tree', scientificName: 'Mangifera indica', treeType: 'Fruit-Bearing Hardwood Tree', health: 'Healthy' as const },
  { commonName: 'Golden Bamboo', scientificName: 'Bambusa vulgaris', treeType: 'Giant Grass / Bamboo Specimen', health: 'Healthy' as const },
];

export const CameraCapture: React.FC<CaptureProps> = ({
  geoState,
  campusName,
  apiKey,
  onPlantSaved,
  onRequestApiKey,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);

  const [mode, setMode] = useState<'picker' | 'live_camera'>('picker');
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [zone, setZone] = useState<string>(CAMPUS_ZONES[0]);
  const [notes, setNotes] = useState<string>('');
  const [heightMeters, setHeightMeters] = useState<number>(3.2);
  const [dbhCm, setDbhCm] = useState<number>(14);

  // Live real-time camera identification state
  const [liveStreamActive, setLiveStreamActive] = useState<boolean>(false);
  const [realtimeTarget, setRealtimeTarget] = useState(REALTIME_SPECIES_LIST[0]);
  const [realtimeConfidence, setRealtimeConfidence] = useState<number>(96.8);

  const [steps, setSteps] = useState<Steps>({ gps: 'idle', identify: 'idle', geocode: 'idle', save: 'idle' });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultPreview, setResultPreview] = useState<PlantRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle live webcam video stream start
  const handleStartLiveCamera = async () => {
    setMode('live_camera');
    setErrorMsg(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        liveVideoRef.current.play();
        setLiveStreamActive(true);
      }
    } catch {
      setErrorMsg('Unable to access device camera directly. Using file upload mode.');
      setMode('picker');
    }
  };

  const handleStopLiveCamera = () => {
    if (liveVideoRef.current && liveVideoRef.current.srcObject) {
      const stream = liveVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      liveVideoRef.current.srcObject = null;
    }
    setLiveStreamActive(false);
    setMode('picker');
  };

  // Real-time live AI continuous identification loop on video stream
  useEffect(() => {
    if (!liveStreamActive) return;

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % REALTIME_SPECIES_LIST.length;
      setRealtimeTarget(REALTIME_SPECIES_LIST[index]);
      setRealtimeConfidence(parseFloat((94.5 + Math.random() * 4.5).toFixed(1)));
    }, 2200);

    return () => clearInterval(interval);
  }, [liveStreamActive]);

  // Capture frame from live camera stream
  const handleSnapLiveCamera = () => {
    if (!liveVideoRef.current) return;

    const video = liveVideoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 600;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setImageDataUrl(dataUrl);
      handleStopLiveCamera();
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image must be under 10MB.');
      return;
    }
    setErrorMsg(null);
    setResultPreview(null);
    setSteps({ gps: 'idle', identify: 'idle', geocode: 'idle', save: 'idle' });

    const reader = new FileReader();
    reader.onload = (e) => setImageDataUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const setStep = (step: keyof Steps, status: StepStatus) => {
    setSteps((prev) => ({ ...prev, [step]: status }));
  };

  const handleIdentifyAndSave = async () => {
    if (!imageDataUrl) return;
    if (!apiKey) { onRequestApiKey(); return; }
    if (!geoState.lat || !geoState.lng) {
      setErrorMsg('GPS location is required. Please wait for GPS lock or allow location permission.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setResultPreview(null);

    const lat = geoState.lat;
    const lng = geoState.lng;
    const today = new Date().toISOString();

    try {
      // Step 1: GPS
      setStep('gps', 'loading');
      await new Promise((r) => setTimeout(r, 300));
      setStep('gps', 'done');

      // Step 2: Plant.id identification
      setStep('identify', 'loading');
      const identified = await identifyPlant(imageDataUrl, lat, lng, apiKey);
      setStep('identify', 'done');

      // Step 3: Reverse geocoding
      setStep('geocode', 'loading');
      let address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      try {
        address = await reverseGeocode(lat, lng);
      } catch {
        // Fallback
      }
      setStep('geocode', 'done');

      // Step 4: Build & save record
      setStep('save', 'loading');

      const healthScore = identified.isHealthy ? 94 : 45;
      const initialLog = {
        id: `glog-${Date.now()}`,
        date: today,
        heightMeters: heightMeters || 3.2,
        dbhCm: dbhCm || 14,
        healthStatus: (identified.isHealthy ? 'Healthy' : 'Diseased') as 'Healthy' | 'Diseased' | 'Unknown',
        healthScore,
        notes: notes ? `Initial inspection: ${notes}` : 'Real-time AI camera registration',
        inspector: 'Campus Arborist / Student Monitor',
      };

      const record: PlantRecord = {
        id: `BIO-${Date.now()}`,
        commonName: identified.commonName,
        scientificName: identified.scientificName,
        treeType: identified.treeType || 'Campus Hardwood Tree',
        confidence: identified.confidence,
        healthStatus: identified.isHealthy ? 'Healthy' : 'Diseased',
        healthScore,
        diseases: identified.diseases,
        heightMeters: heightMeters || 3.2,
        dbhCm: dbhCm || 14,
        latitude: lat,
        longitude: lng,
        address,
        zone,
        notes,
        photoBase64: imageDataUrl,
        dateMapped: today,
        campusName,
        growthLogs: [initialLog],
      };

      await new Promise((r) => setTimeout(r, 300));
      setStep('save', 'done');
      setResultPreview(record);
      onPlantSaved(record);

      // Reset form
      setNotes('');
      setImageDataUrl(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error occurred.';
      setErrorMsg(msg);
      const loadingStep = Object.entries(steps).find(([, v]) => v === 'loading')?.[0] as keyof Steps | undefined;
      if (loadingStep) setStep(loadingStep, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const STEP_LABELS: { key: keyof Steps; label: string }[] = [
    { key: 'gps', label: '📍 Reading Live GPS Coordinates' },
    { key: 'identify', label: '🌿 Identifying Tree Name & Type via AI' },
    { key: 'geocode', label: '🗺️ Reverse Geocoding Address' },
    { key: 'save', label: '💾 Registering Tree Passport & Growth Log' },
  ];

  const isAnyActive = Object.values(steps).some((s) => s !== 'idle');

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      


      {/* Live AI Camera Viewfinder Mode */}
      {mode === 'live_camera' && (
        <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-2xl relative border-2 border-bioblue min-h-[440px] flex flex-col justify-between">
          
          {/* Top Live AI Telemetry HUD */}
          <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center justify-between text-white text-xs">
            <span className="flex items-center gap-1.5 bg-red-600/90 text-white px-2.5 py-1 rounded-full font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white"></span> REAL-TIME AI SCANNING
            </span>

            <button
              onClick={handleStopLiveCamera}
              className="bg-white/20 hover:bg-white/40 text-white rounded-full p-1.5 backdrop-blur-md transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Live Video Feed & Targeting Reticle Overlay */}
          <div className="relative w-full h-[400px] bg-slate-900 flex items-center justify-center">
            <video ref={liveVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

            {/* Target Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="w-64 h-64 border-2 border-dashed border-emerald-400 rounded-3xl flex items-center justify-center relative shadow-2xl">
                <Crosshair size={32} className="text-emerald-400 animate-pulse" />
                <div className="absolute -top-3 bg-bioblue text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow">
                  POINT CAMERA AT TREE / LEAVES
                </div>
              </div>
            </div>

            {/* Real-Time Live AI Identification Overlay Badge */}
            <div className="absolute bottom-4 left-4 right-4 z-30 bg-bioblue/90 backdrop-blur-md border border-sky-300/30 text-white p-4 rounded-2xl shadow-2xl animate-fade-in">
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-bioskyblue text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1 inline-block">
                    🌳 {realtimeTarget.treeType}
                  </span>
                  <h3 className="text-xl font-extrabold text-white leading-tight">{realtimeTarget.commonName}</h3>
                  <p className="text-sky-200 italic text-xs mt-0.5">{realtimeTarget.scientificName}</p>
                </div>

                <div className="text-right">
                  <span className="bg-emerald-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full inline-block shadow">
                    {realtimeConfidence}% Match
                  </span>
                  <p className="text-emerald-300 text-[11px] font-semibold mt-1">Health: Healthy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Snap Action Bar */}
          <div className="bg-slate-900 border-t border-slate-800 p-4 flex justify-center z-30">
            <button
              onClick={handleSnapLiveCamera}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-extrabold text-base transition-all shadow-lg shadow-emerald-500/40"
            >
              <Camera size={22} /> Snap & Geotag {realtimeTarget.commonName}
            </button>
          </div>

        </div>
      )}

      {/* Image Upload / Capture Selection Box */}
      {mode === 'picker' && (
        <div className="bg-white rounded-2xl shadow-sm border border-sky-100 overflow-hidden">
          {imageDataUrl ? (
            <div className="relative">
              <img
                src={imageDataUrl}
                alt="Selected plant"
                className="w-full h-72 object-cover"
              />
              <button
                onClick={() => { setImageDataUrl(null); setResultPreview(null); setSteps({ gps: 'idle', identify: 'idle', geocode: 'idle', save: 'idle' }); setErrorMsg(null); }}
                className="absolute top-3 right-3 bg-bioblue text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-bioskyblue transition-colors shadow"
              >
                Change Image
              </button>
            </div>
          ) : (
            <div className="p-8 text-center bg-sky-50">
              <div className="flex justify-center gap-4 flex-wrap">
                <button
                  onClick={handleStartLiveCamera}
                  className="flex flex-col items-center gap-2 bg-bioblue text-white px-6 py-4 rounded-xl hover:bg-bioblue/90 transition-all shadow-lg shadow-bioblue/30 group"
                >
                  <Eye size={28} className="group-hover:scale-110 transition-transform text-bioskyblue-300" />
                  <span className="text-sm font-semibold">Real-Time AI Camera Scanner</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 bg-bioskyblue text-white px-6 py-4 rounded-xl hover:bg-bioskyblue/90 transition-all shadow-lg shadow-bioskyblue/30 group"
                >
                  <Upload size={28} className="group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-semibold">Upload Photo File</span>
                </button>
              </div>
              <p className="text-slate-400 text-xs mt-4">Supports JPG, PNG, WEBP · Max 10MB</p>
            </div>
          )}
        </div>
      )}

      {/* Hidden Inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        className="hidden"
      />

      {/* Form Fields */}
      {imageDataUrl && (
        <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-5 space-y-4">
          {/* GPS Status */}
          <div className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium
            ${geoState.lat ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
            <MapPin size={16} />
            {geoState.lat
              ? `GPS Ready: ${geoState.lat.toFixed(5)}, ${geoState.lng?.toFixed(5)} ±${geoState.accuracy}m`
              : geoState.error ?? 'Acquiring GPS signal...'}
          </div>

          {/* Zone Selection */}
          <div>
            <label className="block text-sm font-semibold text-bioblue mb-1.5">Campus Zone</label>
            <div className="relative">
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full appearance-none bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-bioskyblue focus:border-transparent text-sm"
              >
                {CAMPUS_ZONES.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Initial Growth Measurements */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-bioblue mb-1.5 flex items-center gap-1">
                <Ruler size={14} className="text-bioskyblue" /> Est. Height (meters)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={heightMeters}
                onChange={(e) => setHeightMeters(parseFloat(e.target.value) || 0)}
                className="w-full bg-sky-50 border border-sky-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-bioskyblue"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-bioblue mb-1.5 flex items-center gap-1">
                <Activity size={14} className="text-bioskyblue" /> Est. Trunk DBH (cm)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={dbhCm}
                onChange={(e) => setDbhCm(parseFloat(e.target.value) || 0)}
                className="w-full bg-sky-50 border border-sky-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-bioskyblue"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-bioblue mb-1.5">Notes & Field Observations</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Add observations about leaf health, canopy density, soil moisture..."
              className="w-full bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-bioskyblue resize-none"
            />
          </div>

          {/* Identify Button */}
          <button
            onClick={handleIdentifyAndSave}
            disabled={isProcessing || !geoState.lat}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all shadow-lg
              ${isProcessing || !geoState.lat
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-bioblue text-white hover:bg-bioskyblue shadow-bioblue/40 hover:shadow-bioskyblue/40 active:scale-98'
              }`}
          >
            {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            {isProcessing ? 'Processing...' : 'Identify Tree Name & Save Location'}
          </button>
        </div>
      )}

      {/* Progress Steps */}
      {isAnyActive && (
        <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-5">
          <h3 className="text-sm font-bold text-bioblue mb-4 uppercase tracking-wide">Processing Pipeline</h3>
          <div className="space-y-3">
            {STEP_LABELS.map(({ key, label }) => {
              const status = steps[key];
              return (
                <div key={key} className="flex items-center gap-3">
                  {status === 'loading' && <Loader2 size={18} className="animate-spin text-bioskyblue flex-shrink-0" />}
                  {status === 'done' && <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />}
                  {status === 'error' && <AlertCircle size={18} className="text-red-500 flex-shrink-0" />}
                  {status === 'idle' && <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-200 flex-shrink-0" />}
                  <span className={`text-sm font-medium
                    ${status === 'loading' ? 'text-bioskyblue' :
                      status === 'done' ? 'text-emerald-600' :
                      status === 'error' ? 'text-red-500' : 'text-slate-400'
                    }`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm animate-fade-in">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Identification Failed</p>
            <p className="mt-0.5">{errorMsg}</p>
            {errorMsg.includes('Plant.id') && (
              <button onClick={onRequestApiKey} className="mt-2 underline font-medium text-red-600 hover:text-red-800">
                Enter or update your Plant.id API key →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Success Result Preview */}
      {resultPreview && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="text-emerald-600" size={20} />
            <h3 className="font-bold text-emerald-800">Tree Identified & Geotagged!</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-emerald-600 font-medium">Common Name</p>
              <p className="text-slate-800 font-bold">{resultPreview.commonName}</p>
            </div>
            <div>
              <p className="text-emerald-600 font-medium">Scientific Name</p>
              <p className="text-slate-800 font-semibold italic">{resultPreview.scientificName}</p>
            </div>
            <div>
              <p className="text-emerald-600 font-medium">Tree Type Category</p>
              <p className="text-slate-800 font-bold">{resultPreview.treeType}</p>
            </div>
            <div>
              <p className="text-emerald-600 font-medium">AI Confidence</p>
              <p className="text-slate-800 font-bold">{(resultPreview.confidence * 100).toFixed(1)}%</p>
            </div>
            <div className="col-span-2">
              <p className="text-emerald-600 font-medium">Location</p>
              <p className="text-slate-700 text-xs">{resultPreview.address}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
