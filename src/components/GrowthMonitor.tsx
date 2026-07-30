import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Activity, TrendingUp, AlertTriangle, CheckCircle2, HeartPulse, Plus, Search, Filter, ShieldCheck, Ruler, Calendar, X
} from 'lucide-react';
import { PlantRecord, GrowthLog, HealthStatus } from '../types/plant';

interface GrowthMonitorProps {
  records: PlantRecord[];
  onAddGrowthLog: (plantId: string, log: GrowthLog) => void;
  onSelectPlant: (plant: PlantRecord) => void;
}

export const GrowthMonitor: React.FC<GrowthMonitorProps> = ({
  records,
  onAddGrowthLog,
  onSelectPlant,
}) => {
  const [search, setSearch] = useState('');
  const [filterHealth, setFilterHealth] = useState<string>('all');
  const [inspectModalPlant, setInspectModalPlant] = useState<PlantRecord | null>(null);

  // Form state for new growth inspection log
  const [newHeight, setNewHeight] = useState<number>(3.0);
  const [newDbh, setNewDbh] = useState<number>(15);
  const [newHealthStatus, setNewHealthStatus] = useState<HealthStatus>('Healthy');
  const [newHealthScore, setNewHealthScore] = useState<number>(90);
  const [newNotes, setNewNotes] = useState<string>('');
  const [newCareAction, setNewCareAction] = useState<string>('');

  // Overall KPIs
  const totalTrees = records.length;
  const healthyTrees = records.filter((r) => r.healthStatus === 'Healthy').length;
  const diseasedTrees = records.filter((r) => r.healthStatus === 'Diseased').length;
  
  const avgHealthScore = records.length
    ? Math.round(records.reduce((sum, r) => sum + (r.healthScore || (r.healthStatus === 'Healthy' ? 90 : 45)), 0) / records.length)
    : 0;

  const totalLogsCount = records.reduce((sum, r) => sum + (r.growthLogs?.length || 1), 0);

  // Filtered records
  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.commonName.toLowerCase().includes(q) || r.scientificName.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
    const matchHealth = filterHealth === 'all' || r.healthStatus === filterHealth;
    return matchSearch && matchHealth;
  });

  const handleOpenInspection = (plant: PlantRecord) => {
    setInspectModalPlant(plant);
    setNewHeight(plant.heightMeters || 2.5);
    setNewDbh(plant.dbhCm || 12);
    setNewHealthStatus(plant.healthStatus || 'Healthy');
    setNewHealthScore(plant.healthScore || (plant.healthStatus === 'Healthy' ? 90 : 45));
    setNewNotes('');
    setNewCareAction(plant.careActionNeeded || '');
  };

  const handleSaveInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectModalPlant) return;

    const log: GrowthLog = {
      id: `glog-${Date.now()}`,
      date: new Date().toISOString(),
      heightMeters: newHeight,
      dbhCm: newDbh,
      healthStatus: newHealthStatus,
      healthScore: newHealthScore,
      notes: newNotes || 'Routine growth inspection log.',
      inspector: 'Campus Arborist / Student Monitor',
    };

    onAddGrowthLog(inspectModalPlant.id, log);
    setInspectModalPlant(null);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-bioblue flex items-center gap-2">
            <Activity className="text-bioskyblue" /> Plant & Tree Growth Monitoring System
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Monitor tree health scorecards, diagnostic symptoms, growth velocity, and periodic arborist logs.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Health Index */}
        <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
            <HeartPulse size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Campus Health Score</p>
            <p className="text-2xl font-extrabold text-bioblue mt-0.5">{avgHealthScore}<span className="text-sm font-normal text-slate-400">/100</span></p>
            <p className="text-emerald-600 text-xs font-medium mt-0.5">{healthyTrees} of {totalTrees} trees healthy</p>
          </div>
        </div>

        {/* Diseased / Care Needed */}
        <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 flex items-center gap-4">
          <div className="bg-red-50 text-red-500 p-3 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Needs Care / Attention</p>
            <p className="text-2xl font-extrabold text-red-600 mt-0.5">{diseasedTrees}</p>
            <p className="text-red-500 text-xs font-medium mt-0.5">Symptom alerts flagged</p>
          </div>
        </div>

        {/* Total Logs */}
        <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 flex items-center gap-4">
          <div className="bg-blue-50 text-bioblue p-3 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Growth Logs Recorded</p>
            <p className="text-2xl font-extrabold text-bioblue mt-0.5">{totalLogsCount}</p>
            <p className="text-slate-400 text-xs mt-0.5">Height & DBH tracking</p>
          </div>
        </div>

        {/* Total Monitored */}
        <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 flex items-center gap-4">
          <div className="bg-sky-50 text-bioskyblue p-3 rounded-xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Monitored Specimens</p>
            <p className="text-2xl font-extrabold text-bioblue mt-0.5">{records.length}</p>
            <p className="text-bioskyblue text-xs font-medium mt-0.5">Live GPS geotagged</p>
          </div>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-4 flex gap-3 items-center flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-52 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2.5">
          <Search size={16} className="text-bioskyblue flex-shrink-0" />
          <input
            type="text"
            placeholder="Search plant by name, species or tag ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-slate-700 flex-1 outline-none placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={filterHealth}
            onChange={(e) => setFilterHealth(e.target.value)}
            className="bg-sky-50 border border-sky-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none"
          >
            <option value="all">All Health Conditions</option>
            <option value="Healthy">Healthy Only</option>
            <option value="Diseased">Diseased / Needs Care Only</option>
          </select>
        </div>
      </div>

      {/* Main Monitoring Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-sky-100 shadow-sm text-center py-20">
          <div className="text-5xl mb-3">🌿</div>
          <h3 className="text-lg font-bold text-bioblue">No plant records found</h3>
          <p className="text-slate-500 text-sm mt-1">Capture and identify plants to monitor their health score and growth trajectory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((record) => {
            const score = record.healthScore || (record.healthStatus === 'Healthy' ? 90 : 45);
            const logs = record.growthLogs || [];

            // Transform logs for chart if multiple logs exist
            const chartData = logs.map((l) => ({
              date: new Date(l.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
              height: l.heightMeters,
              score: l.healthScore,
            }));

            return (
              <div key={record.id} className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  {/* Photo & Health Badge */}
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img
                      src={record.photoBase64}
                      alt={record.commonName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-md ${
                        record.healthStatus === 'Healthy' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {record.healthStatus}
                      </span>
                    </div>

                    {/* Health Score Gauge Chip */}
                    <div className="absolute bottom-3 left-3 bg-bioblue/90 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow">
                      <HeartPulse size={14} className="text-emerald-400" />
                      <span>Health Score: {score}/100</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-extrabold text-bioblue text-lg leading-tight">{record.commonName}</h3>
                        <p className="text-slate-500 italic text-xs mt-0.5">{record.scientificName}</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-sky-50 text-bioskyblue border border-sky-200 px-2 py-0.5 rounded-md">
                        {record.id.slice(-6)}
                      </span>
                    </div>

                    {/* Metrics Bar */}
                    <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-sky-50/70 rounded-xl border border-sky-100 text-xs">
                      <div>
                        <span className="text-slate-400 font-medium block">Current Height</span>
                        <span className="font-bold text-bioblue text-sm">{record.heightMeters || 2.5} meters</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium block">Trunk DBH</span>
                        <span className="font-bold text-bioblue text-sm">{record.dbhCm || 12} cm</span>
                      </div>
                    </div>

                    {/* Diseases / Symptoms if any */}
                    {record.diseases && record.diseases.length > 0 && (
                      <div className="mb-3 bg-red-50 p-2.5 rounded-xl border border-red-100 text-xs text-red-700">
                        <span className="font-bold block mb-1">Alert Symptoms Detected:</span>
                        <p>{record.diseases.join(', ')}</p>
                      </div>
                    )}

                    {/* Growth Chart mini preview if logs > 1 */}
                    {chartData.length > 1 && (
                      <div className="mt-4 pt-3 border-t border-sky-100">
                        <span className="text-[11px] font-bold text-bioblue uppercase tracking-wide block mb-2">Growth & Health History</span>
                        <div className="h-28 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#F0F9FF" />
                              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                              <YAxis tick={{ fontSize: 10 }} />
                              <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                              <Line type="monotone" dataKey="height" stroke="#0284C7" strokeWidth={2} name="Height (m)" />
                              <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={2} name="Health Score" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 border-t border-sky-100 bg-sky-50/30 flex gap-2">
                  <button
                    onClick={() => handleOpenInspection(record)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-bioblue text-white py-2.5 rounded-xl text-xs font-bold hover:bg-bioskyblue transition-colors shadow"
                  >
                    <Plus size={14} /> Log Growth Inspection
                  </button>

                  <button
                    onClick={() => onSelectPlant(record)}
                    className="px-3 py-2.5 bg-white border border-sky-200 text-bioblue font-bold rounded-xl text-xs hover:bg-sky-50 transition-colors"
                  >
                    Details
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal to Log Inspection / Growth Measurement */}
      {inspectModalPlant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-slide-up overflow-hidden">
            <div className="bg-bioblue px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Ruler size={20} className="text-bioskyblue" />
                <h3 className="font-bold text-base">Log Growth & Health Inspection</h3>
              </div>
              <button onClick={() => setInspectModalPlant(null)} className="text-blue-200 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveInspection} className="p-6 space-y-4">
              <div className="bg-sky-50 p-3 rounded-xl border border-sky-100">
                <p className="font-bold text-bioblue text-sm">{inspectModalPlant.commonName}</p>
                <p className="text-xs text-slate-500 italic">{inspectModalPlant.scientificName} · ID: {inspectModalPlant.id}</p>
              </div>

              {/* Height & DBH */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-bioblue mb-1">Height (meters)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={newHeight}
                    onChange={(e) => setNewHeight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-sky-50 border border-sky-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-bioblue mb-1">Trunk DBH (cm)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={newDbh}
                    onChange={(e) => setNewDbh(parseFloat(e.target.value) || 0)}
                    className="w-full bg-sky-50 border border-sky-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Health Status & Health Score Slider */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-bioblue mb-1">Health Status</label>
                  <select
                    value={newHealthStatus}
                    onChange={(e) => setNewHealthStatus(e.target.value as HealthStatus)}
                    className="w-full bg-sky-50 border border-sky-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none"
                  >
                    <option value="Healthy">Healthy</option>
                    <option value="Diseased">Diseased / Sick</option>
                    <option value="Unknown">Unknown / Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-bioblue mb-1">Health Score: {newHealthScore}/100</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={newHealthScore}
                    onChange={(e) => setNewHealthScore(parseInt(e.target.value))}
                    className="w-full h-2 bg-sky-200 rounded-lg appearance-none cursor-pointer accent-bioblue mt-2"
                  />
                </div>
              </div>

              {/* Inspection Notes */}
              <div>
                <label className="block text-xs font-bold text-bioblue mb-1">Inspection Notes & Care Action</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  placeholder="Record growth progress, leaf symptoms, watering, pruning or pesticide action..."
                  className="w-full bg-sky-50 border border-sky-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none resize-none"
                />
              </div>

              {/* Save Submit Button */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setInspectModalPlant(null)}
                  className="flex-1 bg-sky-50 text-slate-600 font-bold py-2.5 rounded-xl border border-sky-200 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-bioblue text-white font-bold py-2.5 rounded-xl text-xs hover:bg-bioskyblue transition-colors shadow-lg"
                >
                  Save Inspection Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
