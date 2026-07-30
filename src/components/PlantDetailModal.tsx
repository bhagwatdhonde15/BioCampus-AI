import React from 'react';
import { X, MapPin, Calendar, Activity, QrCode, ShieldCheck, HeartPulse } from 'lucide-react';
import { PlantRecord } from '../types/plant';

interface PlantDetailModalProps {
  plant: PlantRecord | null;
  onClose: () => void;
  onOpenQR: (plant: PlantRecord) => void;
}

export const PlantDetailModal: React.FC<PlantDetailModalProps> = ({
  plant,
  onClose,
  onOpenQR,
}) => {
  if (!plant) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-slide-up overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Top Header with Image background banner */}
        <div className="relative h-56 bg-slate-900 flex-shrink-0">
          <img
            src={plant.photoBase64}
            alt={plant.commonName}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bioblue via-transparent to-black/30" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/40 hover:bg-black/70 text-white rounded-full p-1.5 backdrop-blur-md transition-colors"
          >
            <X size={20} />
          </button>

          <div className="absolute bottom-4 left-6 right-6 text-white">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1.5 shadow ${
              plant.healthStatus === 'Healthy' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {plant.healthStatus}
            </span>
            <h2 className="text-2xl font-extrabold leading-tight">{plant.commonName}</h2>
            <p className="text-sky-200 italic text-sm">{plant.scientificName}</p>
          </div>
        </div>

        {/* Scrollable details */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-slate-700">
          
          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 gap-3 bg-sky-50 p-4 rounded-xl border border-sky-100 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block uppercase">AI Confidence</span>
              <span className="text-base font-bold text-bioblue">{(plant.confidence * 100).toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase">Campus Zone</span>
              <span className="text-base font-bold text-bioblue">{plant.zone}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase">Date Mapped</span>
              <span className="text-sm font-semibold text-slate-700">{new Date(plant.dateMapped).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase">Tree ID</span>
              <span className="text-sm font-mono font-bold text-bioskyblue">{plant.id}</span>
            </div>
          </div>

          {/* Location & Reverse Geocoding */}
          <div>
            <h4 className="text-xs font-bold text-bioblue uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin size={14} className="text-bioskyblue" /> Location & Coordinates
            </h4>
            <p className="text-sm font-medium text-slate-800 bg-sky-50/50 p-3 rounded-xl border border-sky-100">
              {plant.address}
            </p>
            <p className="text-xs font-mono text-slate-500 mt-1 pl-1">
              GPS: {plant.latitude.toFixed(6)}, {plant.longitude.toFixed(6)}
            </p>
          </div>

          {/* Diseases if any */}
          {plant.diseases && plant.diseases.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <HeartPulse size={14} /> Detected Symptoms / Health Notes
              </h4>
              <ul className="list-disc list-inside text-xs text-slate-600 bg-red-50 p-3 rounded-xl border border-red-100 space-y-1">
                {plant.diseases.map((d, i) => (
                  <li key={i} className="font-medium text-red-800">{d}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Notes */}
          {plant.notes && (
            <div>
              <h4 className="text-xs font-bold text-bioblue uppercase tracking-wider mb-1.5">
                Field Observations
              </h4>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 italic">
                "{plant.notes}"
              </p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-sky-100 bg-white flex gap-3 flex-shrink-0">
          <button
            onClick={() => {
              onClose();
              onOpenQR(plant);
            }}
            className="w-full flex items-center justify-center gap-2 bg-bioblue text-white font-bold py-3 rounded-xl hover:bg-bioskyblue transition-colors shadow-lg shadow-bioblue/30 text-sm"
          >
            <QrCode size={18} /> Generate Digital Tree Tag Badge
          </button>
        </div>

      </div>
    </div>
  );
};
