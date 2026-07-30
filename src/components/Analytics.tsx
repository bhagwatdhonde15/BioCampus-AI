import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { Download, FileText, Leaf, TreePine, MapPin, HeartPulse } from 'lucide-react';
import { PlantRecord } from '../types/plant';
import { exportCSV, exportPDF } from '../services/exportService';

interface AnalyticsProps {
  records: PlantRecord[];
  campusName: string;
  getSpeciesDistribution: () => { name: string; count: number }[];
  getZoneDistribution: () => { zone: string; count: number }[];
  getHealthDistribution: () => { name: string; value: number }[];
}

const PIE_COLORS = ['#0284C7', '#1E3A8A', '#38BDF8', '#0369A1', '#7DD3FC', '#075985', '#BAE6FD', '#0EA5E9', '#0C4A6E', '#93C5FD'];
const HEALTH_COLORS: Record<string, string> = { Healthy: '#10B981', Diseased: '#EF4444', Unknown: '#94A3B8' };

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; sub?: string; colorClass: string }> =
  ({ icon, label, value, sub, colorClass }) => (
    <div className={`bg-white rounded-2xl border border-sky-100 shadow-sm p-5 flex items-center gap-4`}>
      <div className={`${colorClass} p-3 rounded-xl`}>{icon}</div>
      <div>
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-extrabold text-bioblue leading-none mt-0.5">{value}</p>
        {sub && <p className="text-slate-400 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );

export const Analytics: React.FC<AnalyticsProps> = ({
  records,
  campusName,
  getSpeciesDistribution,
  getZoneDistribution,
  getHealthDistribution,
}) => {
  const speciesData = getSpeciesDistribution();
  const zoneData = getZoneDistribution();
  const healthData = getHealthDistribution();

  const uniqueSpeciesCount = new Set(records.map((r) => r.scientificName)).size;
  const activeZonesCount = new Set(records.map((r) => r.zone)).size;
  const avgConfidence = records.length
    ? (records.reduce((s, r) => s + r.confidence, 0) / records.length * 100).toFixed(1)
    : '—';

  if (records.length === 0) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-6 text-center py-24">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-bold text-bioblue mb-2">No data to analyze yet</h3>
        <p className="text-slate-500 text-sm">Capture and identify plants to generate real analytics and audit reports.</p>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
      {/* Title + Export */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-bioblue">Biodiversity Analytics</h2>
          <p className="text-slate-500 text-sm mt-0.5">Real-time ecological metrics · {campusName}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => exportCSV(records, campusName)}
            className="flex items-center gap-2 bg-white border border-sky-200 text-bioblue font-semibold px-4 py-2.5 rounded-xl hover:bg-sky-50 transition-colors shadow-sm text-sm"
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            onClick={() => exportPDF(records, campusName)}
            className="flex items-center gap-2 bg-bioblue text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-bioskyblue transition-colors shadow-lg shadow-bioblue/30 text-sm"
          >
            <FileText size={16} /> Export PDF Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<TreePine size={22} className="text-bioblue" />}
          label="Total Trees Catalogued"
          value={records.length}
          sub="All campus zones"
          colorClass="bg-blue-50"
        />
        <StatCard
          icon={<Leaf size={22} className="text-emerald-600" />}
          label="Unique Species"
          value={uniqueSpeciesCount}
          sub="Identified by AI"
          colorClass="bg-emerald-50"
        />
        <StatCard
          icon={<MapPin size={22} className="text-amber-600" />}
          label="Active Campus Zones"
          value={activeZonesCount}
          sub="Mapped locations"
          colorClass="bg-amber-50"
        />
        <StatCard
          icon={<HeartPulse size={22} className="text-bioskyblue" />}
          label="Avg AI Confidence"
          value={`${avgConfidence}%`}
          sub="Plant.id accuracy"
          colorClass="bg-sky-50"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Species Diversity Donut */}
        <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-6">
          <h3 className="text-base font-bold text-bioblue mb-1">Species Diversity Breakdown</h3>
          <p className="text-slate-400 text-xs mb-4">Distribution of identified plant species by count</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={speciesData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="count"
                nameKey="name"
                label={({ name, percent }) => `${name.slice(0, 10)} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {speciesData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val, name) => [`${val} tree(s)`, name]}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E0F2FE', fontSize: '12px' }}
              />
              <Legend
                formatter={(v) => <span style={{ fontSize: '11px', color: '#475569' }}>{v}</span>}
                wrapperStyle={{ fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Health Status Donut */}
        <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-6">
          <h3 className="text-base font-bold text-bioblue mb-1">Health Status Distribution</h3>
          <p className="text-slate-400 text-xs mb-4">Campus tree health assessment from Plant.id API</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={healthData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {healthData.map((entry, idx) => (
                  <Cell key={idx} fill={HEALTH_COLORS[entry.name] ?? '#94A3B8'} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val, name) => [`${val} tree(s)`, name]}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E0F2FE', fontSize: '12px' }}
              />
              <Legend
                formatter={(v) => <span style={{ fontSize: '11px', color: '#475569' }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Zone Distribution Bar Chart — full width */}
        <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-6 lg:col-span-2">
          <h3 className="text-base font-bold text-bioblue mb-1">Tree Distribution by Campus Zone</h3>
          <p className="text-slate-400 text-xs mb-4">Count of catalogued trees per mapped campus zone</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={zoneData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0F2FE" />
              <XAxis
                dataKey="zone"
                tick={{ fontSize: 11, fill: '#64748B' }}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
              <Tooltip
                formatter={(val) => [`${val} tree(s)`, 'Count']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E0F2FE', fontSize: '12px' }}
              />
              <Bar dataKey="count" fill="#0284C7" radius={[6, 6, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Species Table */}
      <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-sky-50">
          <h3 className="text-base font-bold text-bioblue">Most Identified Species</h3>
          <p className="text-slate-400 text-xs">Top 10 species by occurrence across campus</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-50 text-slate-600 text-xs font-semibold uppercase tracking-wide">
                <th className="px-6 py-3 text-left">Rank</th>
                <th className="px-6 py-3 text-left">Common Name</th>
                <th className="px-6 py-3 text-left">Count</th>
                <th className="px-6 py-3 text-left">Share</th>
              </tr>
            </thead>
            <tbody>
              {speciesData.map((s, i) => (
                <tr key={i} className="border-t border-sky-50 hover:bg-sky-50/50 transition-colors">
                  <td className="px-6 py-3 font-bold text-bioblue">#{i + 1}</td>
                  <td className="px-6 py-3 font-semibold text-slate-700">{s.name}</td>
                  <td className="px-6 py-3 text-bioskyblue font-bold">{s.count}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-sky-100 rounded-full h-1.5 max-w-24">
                        <div
                          className="h-1.5 rounded-full bg-bioskyblue"
                          style={{ width: `${((s.count / records.length) * 100).toFixed(0)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">
                        {((s.count / records.length) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
