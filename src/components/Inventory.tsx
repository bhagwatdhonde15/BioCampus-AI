import React, { useState } from 'react';
import { Search, Trash2, QrCode, ChevronUp, ChevronDown, CheckCircle, AlertCircle, HelpCircle, X, Database, CheckCircle2, Loader2 } from 'lucide-react';
import { PlantRecord } from '../types/plant';
import { QRModal } from './QRModal';
import { syncAllPlantsToSupabase } from '../services/supabaseClient';

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

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const handleBulkSupabaseSync = async () => {
    setIsSyncing(true);
    setSyncMsg(null);

    const res = await syncAllPlantsToSupabase(records);
    setIsSyncing(false);

    if (res.success) {
      setSyncMsg(`Successfully uploaded ${records.length} plant records to Supabase PostgreSQL Database!`);
    } else {
      setSyncMsg(`Supabase upload ready. Add your VITE_SUPABASE_URL in .env to connect.`);
    }
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
    const info = map[status] ?? map.Unknown;
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${info.cls}`}>
        {info.icon}
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-4">
      {/* Title & Sync Action Bar */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-bioblue">Digital Plant Inventory</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            {records.length} total species recorded across {campusName}
          </p>
        </div>

        {/* Sync Data to Supabase Button */}
        <button
          onClick={handleBulkSupabaseSync}
          disabled={isSyncing}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-colors"
        >
          {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
          {isSyncing ? 'Pushing Data to Supabase...' : 'Sync Data to Supabase Database'}
        </button>
      </div>

      {/* Sync Success Alert */}
      {syncMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-emerald-800 text-xs font-bold flex items-center justify-between gap-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            {syncMsg}
          </div>
          <button onClick={() => setSyncMsg(null)} className="text-emerald-600 hover:text-emerald-900">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-4 flex gap-3 flex-wrap items-center">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-48 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2">
          <Search size={16} className="text-bioskyblue flex-shrink-0" />
          <input
            type="text"
            placeholder="Search common, scientific name or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-slate-700 flex-1 outline-none placeholder-slate-400"
          />
        </div>

        {/* Filter Health */}
        <select
          value={filterHealth}
          onChange={(e) => setFilterHealth(e.target.value)}
          className="bg-sky-50 border border-sky-200 text-slate-700 text-xs font-medium rounded-xl px-3 py-2 outline-none"
        >
          <option value="all">All Health Statuses</option>
          <option value="Healthy">Healthy</option>
          <option value="Diseased">Diseased</option>
        </select>

        {/* Filter Zone */}
        <select
          value={filterZone}
          onChange={(e) => setFilterZone(e.target.value)}
          className="bg-sky-50 border border-sky-200 text-slate-700 text-xs font-medium rounded-xl px-3 py-2 outline-none"
        >
          {uniqueZones.map((z) => (
            <option key={z} value={z}>
              {z === 'all' ? 'All Campus Zones' : z}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            No plant records match your search filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sky-50 text-slate-600 uppercase font-semibold border-b border-sky-100">
                <tr>
                  <th className="px-4 py-3">Plant Image</th>
                  <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort('commonName')}>
                    <div className="flex items-center gap-1">Common Name <SortIcon col="commonName" /></div>
                  </th>
                  <th className="px-4 py-3">Scientific Name</th>
                  <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort('zone')}>
                    <div className="flex items-center gap-1">Campus Zone <SortIcon col="zone" /></div>
                  </th>
                  <th className="px-4 py-3">Health Status</th>
                  <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort('confidence')}>
                    <div className="flex items-center gap-1">Confidence <SortIcon col="confidence" /></div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort('dateMapped')}>
                    <div className="flex items-center gap-1">Date Tagged <SortIcon col="dateMapped" /></div>
                  </th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50 text-slate-700">
                {filtered.map((record) => (
                  <tr key={record.id} className="hover:bg-sky-50/50 transition-colors">
                    {/* Thumbnail */}
                    <td className="px-4 py-2.5">
                      <img
                        src={record.photoBase64}
                        alt={record.commonName}
                        className="w-10 h-10 rounded-xl object-cover cursor-pointer border border-sky-100 shadow-sm"
                        onClick={() => onSelectPlant(record)}
                      />
                    </td>

                    {/* Common Name & ID */}
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => onSelectPlant(record)}
                        className="font-bold text-bioblue hover:text-bioskyblue text-left text-sm block"
                      >
                        {record.commonName}
                      </button>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {record.id}</span>
                    </td>

                    {/* Scientific Name */}
                    <td className="px-4 py-2.5 italic text-slate-500">{record.scientificName}</td>

                    {/* Zone */}
                    <td className="px-4 py-2.5 font-medium">{record.zone}</td>

                    {/* Health Status */}
                    <td className="px-4 py-2.5">
                      <HealthBadge status={record.healthStatus} />
                    </td>

                    {/* Confidence */}
                    <td className="px-4 py-2.5 font-mono font-medium text-slate-600">
                      {(record.confidence * 100).toFixed(1)}%
                    </td>

                    {/* Date */}
                    <td className="px-4 py-2.5 text-slate-400 font-mono">
                      {new Date(record.dateMapped).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setQrTarget(record)}
                          className="p-1.5 rounded-lg bg-sky-50 hover:bg-bioskyblue hover:text-white text-bioskyblue transition-colors"
                          title="Generate QR Tag"
                        >
                          <QrCode size={15} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(record.id)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-500 hover:text-white text-red-500 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Modal */}
      {qrTarget && (
        <QRModal record={qrTarget} campusName={campusName} onClose={() => setQrTarget(null)} />
      )}

      {/* Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h3 className="font-bold text-bioblue text-base">Delete Plant Record?</h3>
            <p className="text-xs text-slate-500">This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-3 py-1.5 rounded-xl border text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(confirmDelete);
                  setConfirmDelete(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
