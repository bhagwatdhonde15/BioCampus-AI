import React, { useState } from 'react';
import { Key, Building2, X, Check, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  campusName: string;
  onSaveCampusName: (name: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  campusName,
  onSaveCampusName,
}) => {
  const [tempKey, setTempKey] = useState(apiKey);
  const [tempCampus, setTempCampus] = useState(campusName);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(tempKey.trim());
    onSaveCampusName(tempCampus.trim() || 'Sanjivani University');
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-slide-up overflow-hidden">
        <div className="bg-bioblue px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Key size={20} className="text-bioskyblue" />
            <h2 className="font-bold text-lg">Settings & API Configuration</h2>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-bioblue mb-1">
              Campus / Institution Name
            </label>
            <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2.5">
              <Building2 size={18} className="text-bioskyblue flex-shrink-0" />
              <input
                type="text"
                value={tempCampus}
                onChange={(e) => setTempCampus(e.target.value)}
                placeholder="e.g. Sanjivani University"
                className="bg-transparent text-sm text-slate-700 flex-1 outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-bioblue">
                Plant.id API Key
              </label>
              <a
                href="https://plant.id/"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-bioskyblue font-semibold hover:underline flex items-center gap-1"
              >
                Get Free Key <ExternalLink size={10} />
              </a>
            </div>
            <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2.5">
              <Key size={18} className="text-bioskyblue flex-shrink-0" />
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="Paste Plant.id API key here..."
                className="bg-transparent text-sm text-slate-700 flex-1 outline-none font-mono"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Key is stored safely in your browser session/env and used directly for Plant.id API v3 calls.
            </p>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-sky-50 text-slate-600 font-semibold py-2.5 rounded-xl hover:bg-sky-100 border border-sky-200 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-bioblue text-white font-semibold py-2.5 rounded-xl hover:bg-bioskyblue transition-colors text-sm shadow-lg shadow-bioblue/30"
            >
              {saved ? <Check size={18} /> : null}
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
