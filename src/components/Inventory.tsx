import React, { useState } from 'react';
import { Search, Trash2, QrCode, ChevronUp, ChevronDown, CheckCircle, AlertCircle, HelpCircle, X } from 'lucide-react';
import { PlantRecord } from '../types/plant';
import { QRModal } from './QRModal';

interface InventoryProps {
  records: PlantRecord[];
  campusName: string;
  onDelete: (id: string) => void;
  onSelectPlant: (record: PlantRecord) => void;
}

type SortKey = 'dateMapped' | 'commonName' | 'confidence' | 'zone';

export const Inventory: React.FC<InventoryProps> = ({ records, campusName, onDelete, onSelectPlant }) => {
  const [search, setSearch] = useState('');
  const [filterHealth, setFilterHealth] = useState('all');
  const [filterZone, setFilterZone] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('dateMapped');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [qrTarget, setQrTarget] = useState<PlantRecord | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const uniqueZones = ['all', ...Array.from(new Set(records.map((r) => r.zone)))];

  const filtered = records
    .filter((r) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        r.commonName.toLowerCase().includes(q) ||
        r.scientificName.toLowerCase().includes(q) ||
        r.zone.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q);
      const matchHealth = filterHealth === 'all' || r.healthStatus === filterHealth;
      const matchZone = filterZone === 'all' || r.zone === filterZone;
      return matchSearch && matchHealth && matchZone;
    })
    .sort((a, b) => {
      let valA: string | number = a[sortKey] as string | number;
      let valB: string | number = b[sortKey] as string | number;
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col
      ? (sortDir === 'asc' ? <ChevronUp size={14} className="text-bioskyblue" /> : <ChevronDown size={14} className="text-bioskyblue" />)
      : <ChevronDown size={14} className="text-slate-300" />;

  const HealthBadge = ({ status }: { status: string }) => {
    const map: Record<string, { icon: React.ReactNode; cls: string }> = {
      Healthy: { icon: <CheckCircle size={12} />, cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      Diseased: { icon: <AlertCircle size={12} />, cls: 'bg-red-100 text-red-700 border-red-200' },
      Unknown: { icon: <HelpCircle size={12} />, cls: 'bg-slate-100 text-slate-600 border-slate-200' },
    };
    const { icon, cls } = map[status] ?? map['Unknown'];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
        {icon} {status}
      </span>
    );
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      {/* Title & Stats */}
      <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-bioblue">Digital Plant Inventory</h2>
          <p className="text-slate-500 text-sm mt-0.5">{filtered.length} of {records.length} records shown · {campusName}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-4 mb-6 flex gap-3 flex-wrap items-center">
        <div className="flex items-center gap-2 flex-1 min-w-52 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2.5">
          <Search size={16} className="text-bioskyblue flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name, species, ID, or zone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-slate-700 flex-1 outline-none placeholder-slate-400"
          />
          {search && <button onClick={() => setSearch('')}><X size={14} className="text-slate-400" /></button>}
        </div>

        <select
          value={filterHealth}
          onChange={(e) => setFilterHealth(e.target.value)}
          className="bg-sky-50 border border-sky-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none"
        >
          <option value="all">All Health</option>
          <option value="Healthy">Healthy</option>
          <option value="Diseased">Diseased</option>
          <option value="Unknown">Unknown</option>
        </select>

        <select
          value={filterZone}
          onChange={(e) => setFilterZone(e.target.value)}
          className="bg-sky-50 border border-sky-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none"
        >
          {uniqueZones.map((z) => (
            <option key={z} value={z}>{z === 'all' ? 'All Zones' : z}</option>
          ))}
        </select>
      </div>

      {/* Empty State */}
      {records.length === 0 && (
        <div className="text-center py-24 bg-white rounded-2xl border border-sky-100 shadow-sm">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-xl font-bold text-bioblue mb-2">No plants catalogued yet</h3>
          <p className="text-slate-500 text-sm">Go to the <strong>Capture</strong> tab to photograph and identify your first campus plant.</p>
        </div>
      )}

      {/* Table */}
      {records.length > 0 && (
        <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bioblue text-white">
                  <th className="px-4 py-3 text-left font-semibold text-xs tracking-wide">Photo</th>
                  <th className="px-4 py-3 text-left cursor-pointer select-none" onClick={() => handleSort('commonName')}>
                    <div className="flex items-center gap-1">Common Name <SortIcon col="commonName" /></div>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-xs tracking-wide">Scientific Name</th>
                  <th className="px-4 py-3 text-left cursor-pointer select-none" onClick={() => handleSort('zone')}>
                    <div className="flex items-center gap-1">Zone <SortIcon col="zone" /></div>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-xs tracking-wide">GPS</th>
                  <th className="px-4 py-3 text-left cursor-pointer select-none" onClick={() => handleSort('confidence')}>
                    <div className="flex items-center gap-1">Confidence <SortIcon col="confidence" /></div>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-xs tracking-wide">Health</th>
                  <th className="px-4 py-3 text-left cursor-pointer select-none" onClick={() => handleSort('dateMapped')}>
                    <div className="flex items-center gap-1">Date <SortIcon col="dateMapped" /></div>
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-xs tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record, idx) => (
                  <tr
                    key={record.id}
                    className={`border-b border-sky-50 hover:bg-sky-50/60 transition-colors group ${idx % 2 === 0 ? 'bg-white' : 'bg-sky-50/30'}`}
                  >
                    <td className="px-4 py-3">
                      <img
                        src={record.photoBase64}
                        alt={record.commonName}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-sky-100 cursor-pointer hover:scale-110 transition-transform"
                        onClick={() => onSelectPlant(record)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onSelectPlant(record)}
                        className="font-bold text-bioblue hover:text-bioskyblue transition-colors text-left"
                      >
                        {record.commonName}
                      </button>
                      <p className="text-xs text-slate-400 font-mono">{record.id.slice(-8)}</p>
                    </td>
                    <td className="px-4 py-3 italic text-slate-600 text-xs">{record.scientificName}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-bioblue/10 text-bioblue text-xs font-semibold px-2.5 py-1 rounded-lg">
                        {record.zone}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono whitespace-nowrap">
                      {record.latitude.toFixed(5)},{'\n'}{record.longitude.toFixed(5)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5 w-16">
                          <div
                            className="h-1.5 rounded-full bg-bioskyblue"
                            style={{ width: `${(record.confidence * 100).toFixed(0)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-bioblue">
                          {(record.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <HealthBadge status={record.healthStatus} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(record.dateMapped).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setQrTarget(record)}
                          className="flex items-center gap-1 bg-bioblue text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-bioskyblue transition-colors"
                          title="Generate Tree Tag QR"
                        >
                          <QrCode size={14} /> Tag
                        </button>
                        <button
                          onClick={() => setConfirmDelete(record.id)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Plant Record?</h3>
            <p className="text-slate-500 text-sm mb-6">This action cannot be undone. The plant record and its photo will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-sky-50 text-slate-600 font-semibold py-2.5 rounded-xl hover:bg-sky-100 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => { onDelete(confirmDelete); setConfirmDelete(null); }}
                className="flex-1 bg-red-500 text-white font-semibold py-2.5 rounded-xl hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Tag Modal */}
      {qrTarget && (
        <QRModal record={qrTarget} campusName={campusName} onClose={() => setQrTarget(null)} />
      )}
    </div>
  );
};
