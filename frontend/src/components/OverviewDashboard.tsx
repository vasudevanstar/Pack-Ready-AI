'use client';

import React, { useEffect, useState } from 'react';
import {
  Package,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  ArrowUpRight,
  Info,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import KpiCard from './KpiCard';

const API_BASE = 'http://localhost:5000/api';

const COLORS = ['#047857', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'];
const TIER_COLORS: Record<string, string> = {
  'Tier 1 (>=90%)': '#047857',
  'Tier 2 (75-89%)': '#10b981',
  'Tier 3 (50-74%)': '#f59e0b',
  'Tier 4 (<50%)': '#ef4444'
};

export default function OverviewDashboard({ onQuickAction }: { onQuickAction: (tab: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, recordsRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard/stats`),
        fetch(`${API_BASE}/records?limit=6`)
      ]);

      if (!statsRes.ok || !recordsRes.ok) {
        throw new Error('Could not connect to backend server. Make sure backend is running on port 5000.');
      }

      const statsData = await statsRes.json();
      const recordsData = await recordsRes.json();

      setStats(statsData.metrics);
      setRecentAudits(statsData.recentAudits || []);
      setRecentRecords(recordsData.records || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-600">Loading PackReady AI Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-800">
        <div className="flex items-center space-x-2 font-semibold">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span>Backend Connection Notice</span>
        </div>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-3 px-3 py-1.5 bg-red-700 text-white rounded text-xs font-semibold hover:bg-red-800"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Honesty Banner */}
      <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-start space-x-3 text-emerald-950 text-xs">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-emerald-900">Prototype Transparency Note: </span>
          This is an <strong>AI-assisted packaging data readiness demonstration</strong> for the TECHgium evaluation (TG0900889). All scoring and gap detection utilize transparent, rule-based algorithms based on EU PPWR draft articles (Articles 5, 6, 7 & 11). Synthetic sample data is used for demonstration purposes. Not an official legal certification.
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Packaging Records"
          value={stats?.totalRecords || 0}
          subtitle="Portfolio Coverage"
          badgeText="100% Monitored"
          icon={Package}
          variant="default"
        />
        <KpiCard
          title="Ready (Tier 1 & 2)"
          value={stats?.highReadinessCount || 0}
          subtitle={`Score >= 85% • ${Math.round(((stats?.highReadinessCount || 0) / (stats?.totalRecords || 1)) * 100)}% of catalog`}
          badgeText="Audit Ready"
          icon={CheckCircle}
          variant="green"
        />
        <KpiCard
          title="Partially Ready"
          value={stats?.moderateRiskCount || 0}
          subtitle="Attestations & Gaps Found"
          badgeText="Review Needed"
          icon={AlertTriangle}
          variant="amber"
        />
        <KpiCard
          title="Action Required"
          value={stats?.criticalRiskCount || 0}
          subtitle="Missing Weight / Class D-E"
          badgeText="High Risk"
          icon={XCircle}
          variant="red"
        />
      </div>

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Readiness Distribution Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Digital Readiness Distribution</h2>
              <p className="text-xs text-gray-500">Classification by PPWR Compliance Readiness Tiers</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Avg: {stats?.averageReadiness}%
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.statusDistribution || []}
                  dataKey="count"
                  nameKey="tier"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {(stats?.statusDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={TIER_COLORS[entry.tier] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '12px', border: '1px solid #e5e7eb' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Material Distribution Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Packaging Material Distribution</h2>
              <p className="text-xs text-gray-500">Records grouped by primary material category</p>
            </div>
            <span className="text-xs font-medium text-gray-500">
              {stats?.materialBreakdown?.length || 0} Material Classes
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.materialBreakdown || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="material"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '12px', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="count" fill="#047857" radius={[4, 4, 0, 0]} name="Packaging SKUs" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Packaging Records & Recent Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Packaging Records Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Recent Packaging Records</h2>
              <p className="text-xs text-gray-500">Sample of evaluated packaging specifications</p>
            </div>
            <button
              onClick={() => onQuickAction('records')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
            >
              <span>View All Records</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">Item ID</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Material</th>
                  <th className="py-2.5 px-3">PCR %</th>
                  <th className="py-2.5 px-3">Readiness Score</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {recentRecords.map((item) => {
                  const score = item.assessment?.readinessScore ?? 0;
                  const isHigh = score >= 85;
                  const isMedium = score >= 55 && score < 85;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-2.5 px-3 font-mono font-medium text-emerald-800">{item.id}</td>
                      <td className="py-2.5 px-3 font-medium max-w-37.5 truncate" title={item.productName}>
                        {item.productName}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px]">
                          {item.materialGroup}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {item.recycledContentPercent !== null ? `${item.recycledContentPercent}%` : (
                          <span className="text-red-500 font-semibold">Missing</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold">{score}%</span>
                          <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${isHigh ? 'bg-emerald-600' : isMedium ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${isHigh
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isMedium
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                          {item.assessment?.readinessGrade || 'Evaluated'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity / Audit Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Activity & Audit Trail</h2>
                <p className="text-xs text-gray-500">Chronological validation actions</p>
              </div>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>

            <div className="space-y-3">
              {recentAudits.map((log: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                  <div className="flex items-center justify-between font-semibold text-gray-800">
                    <span className="text-[11px] font-mono text-emerald-700">{log.action}</span>
                    <span className="text-[10px] text-gray-400">Just now</span>
                  </div>
                  <p className="text-gray-600 mt-1 text-[11px] line-clamp-2">{log.details}</p>
                  <div className="text-[10px] text-gray-400 mt-1 flex justify-between">
                    <span>By: {log.user}</span>
                    <span>{log.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={() => onQuickAction('audit')}
              className="w-full py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              View Full Audit Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
