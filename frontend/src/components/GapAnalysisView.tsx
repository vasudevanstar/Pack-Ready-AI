'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Search,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Layers,
  Building2,
  Filter,
  FileWarning,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import RecordModal from './RecordModal';

import { API_BASE } from '@/config';

export default function GapAnalysisView() {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [gapData, setGapData] = useState<any>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'>('ALL');
  const [materialFilter, setMaterialFilter] = useState('ALL');
  const [supplierFilter, setSupplierFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Edit / Correct Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recordToCorrect, setRecordToCorrect] = useState<any | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchGapAnalysis();
  }, []);

  const fetchGapAnalysis = async () => {
    try {
      setAnalyzing(true);
      const res = await fetch(`${API_BASE}/gaps/analysis?user=Regulatory+Gap+Analyst`);
      if (!res.ok) throw new Error('Failed to run gap analysis');
      const data = await res.json();
      setGapData(data.analysis);
      setFeedbackMsg(`Gap analysis complete: identified ${data.analysis.totalGaps} potential reporting gaps.`);
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err: any) {
      console.error(err);
      setFeedbackMsg('Error executing gap analysis.');
    } finally {
      setAnalyzing(false);
      setLoading(false);
    }
  };

  const handleOpenCorrection = async (recordId: string) => {
    try {
      const res = await fetch(`${API_BASE}/records/${recordId}`);
      if (!res.ok) throw new Error('Could not fetch record');
      const data = await res.json();
      setRecordToCorrect(data.record);
      setIsEditModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Unique lists for dropdowns
  const availableMaterials: string[] = ['ALL', ...Array.from(new Set<string>((gapData?.gaps || []).map((g: any) => String(g.material))))];
  const availableSuppliers: string[] = ['ALL', ...Array.from(new Set<string>((gapData?.gaps || []).map((g: any) => String(g.supplier))))];
  const availableStatuses: string[] = ['ALL', 'Open', 'In Progress', 'Pending Review', 'Under Investigation'];

  // Filtered Gaps list
  const filteredGaps = (gapData?.gaps || []).filter((gap: any) => {
    const matchesPriority = priorityFilter === 'ALL' || gap.priority === priorityFilter;
    const matchesMaterial = materialFilter === 'ALL' || gap.material === materialFilter;
    const matchesSupplier = supplierFilter === 'ALL' || gap.supplier === supplierFilter;
    const matchesStatus = statusFilter === 'ALL' || gap.status === statusFilter;
    const matchesSearch = search === '' ||
      gap.recordId.toLowerCase().includes(search.toLowerCase()) ||
      gap.productName.toLowerCase().includes(search.toLowerCase()) ||
      gap.supplier.toLowerCase().includes(search.toLowerCase()) ||
      gap.gapType.toLowerCase().includes(search.toLowerCase()) ||
      gap.description.toLowerCase().includes(search.toLowerCase());

    return matchesPriority && matchesMaterial && matchesSupplier && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Rules-Based Gap Analysis</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              Regulatory Discrepancy Matrix
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Deterministic gap identification benchmarking packaging specifications against prototype PPWR reporting requirements.
          </p>
        </div>

        <button
          onClick={fetchGapAnalysis}
          disabled={analyzing}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
          <span>{analyzing ? 'Scanning Portfolio...' : 'Re-Run Gap Analysis'}</span>
        </button>
      </div>

      {/* Honesty Notice */}
      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start space-x-3 text-xs text-emerald-950">
        <HelpCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-emerald-900">Prototype Rules Disclosure: </span>
          All requirements checked below (missing tare weights, unmapped polymer categories, DfR Class D/E restrictions, PCR &lt; 30% thresholds, and missing DoC compliance certificates) are configurable prototype demonstration rules. They do not constitute an exhaustive or legally binding interpretation of European Union PPWR legislation.
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-medium flex items-center justify-between">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs font-bold px-1">&times;</button>
        </div>
      )}

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Gaps */}
        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Total Identified Gaps</span>
            <span className="text-2xl font-bold text-gray-900 mt-1 block">{gapData?.totalGaps || 0}</span>
            <span className="text-[11px] text-gray-400 mt-0.5 block">Across {gapData?.totalRecordsEvaluated || 0} Packaging Items</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
            <AlertTriangle className="w-5 h-5 text-gray-600" />
          </div>
        </div>

        {/* Critical Gaps */}
        <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider block">Critical Gaps</span>
            <span className="text-2xl font-bold text-rose-900 mt-1 block">{gapData?.criticalGaps || 0}</span>
            <span className="text-[11px] text-rose-600 mt-0.5 block">Market Restriction Risk</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Moderate Gaps */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block">Moderate Gaps</span>
            <span className="text-2xl font-bold text-amber-900 mt-1 block">{gapData?.moderateGaps || 0}</span>
            <span className="text-[11px] text-amber-600 mt-0.5 block">PCR Target &amp; Evidence Gaps</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
            <FileWarning className="w-5 h-5" />
          </div>
        </div>

        {/* Low Priority Gaps */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">Low-Priority Gaps</span>
            <span className="text-2xl font-bold text-emerald-900 mt-1 block">{gapData?.lowGaps || 0}</span>
            <span className="text-[11px] text-emerald-600 mt-0.5 block">Dimensional Volume Ratio</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Two Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Material Distribution Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Gap Distribution by Material</h3>
              <p className="text-xs text-gray-500">Compliance gaps grouped by packaging substrate</p>
            </div>
            <Layers className="w-4 h-4 text-gray-400" />
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gapData?.materialDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '11px', border: '1px solid #e5e7eb' }} />
                <Bar dataKey="count" fill="#047857" radius={[4, 4, 0, 0]} name="Gaps Identified" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Supplier Distribution Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Gap Distribution by Supplier</h3>
              <p className="text-xs text-gray-500">Tier-1 converters with highest documentation gaps</p>
            </div>
            <Building2 className="w-4 h-4 text-gray-400" />
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gapData?.supplierDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '11px', border: '1px solid #e5e7eb' }} />
                <Bar dataKey="count" fill="#d97706" radius={[4, 4, 0, 0]} name="Converter Gaps" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, product, supplier, or gap..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-gray-50/50"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Priority */}
          <div className="flex items-center space-x-1">
            <span className="text-gray-500 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value as any)}
              className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MODERATE">Moderate</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Material */}
          <div className="flex items-center space-x-1">
            <span className="text-gray-500 font-medium">Material:</span>
            <select
              value={materialFilter}
              onChange={e => setMaterialFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              {availableMaterials.map(m => (
                <option key={m} value={m}>{m === 'ALL' ? 'All Materials' : m}</option>
              ))}
            </select>
          </div>

          {/* Supplier */}
          <div className="flex items-center space-x-1">
            <span className="text-gray-500 font-medium">Supplier:</span>
            <select
              value={supplierFilter}
              onChange={e => setSupplierFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 max-w-35 truncate"
            >
              {availableSuppliers.map(s => (
                <option key={s} value={s}>{s === 'ALL' ? 'All Suppliers' : s}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-1">
            <span className="text-gray-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              {availableStatuses.map(st => (
                <option key={st} value={st}>{st === 'ALL' ? 'All Statuses' : st}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Gaps List Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-sm text-gray-900">Identified Packaging Gaps</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
              Showing {filteredGaps.length} of {gapData?.totalGaps || 0} gaps
            </span>
          </div>
          <span className="text-xs text-gray-400">Click &ldquo;Remediate&rdquo; to update specification</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f4f7f5] text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-3">Packaging ID</th>
                <th className="py-3 px-3">Product Name</th>
                <th className="py-3 px-3">Supplier</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Gap Description</th>
                <th className="py-3 px-3">Recommended Corrective Action</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      <span>Running rules-based gap analysis...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredGaps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-emerald-800">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      <p className="font-semibold text-sm">No compliance gaps matching the selected filters!</p>
                      <p className="text-xs text-gray-500">All matching packaging records conform to the prototype reporting criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredGaps.map((gap: any) => {
                  const isCrit = gap.priority === 'CRITICAL';
                  const isHigh = gap.priority === 'HIGH';
                  const isMod = gap.priority === 'MODERATE';

                  return (
                    <tr key={gap.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3 px-3 font-mono font-medium text-emerald-800 whitespace-nowrap">
                        {gap.recordId}
                      </td>
                      <td className="py-3 px-3 font-semibold text-gray-900 max-w-37.5 truncate" title={gap.productName}>
                        {gap.productName}
                      </td>
                      <td className="py-3 px-3 text-gray-600 max-w-35 truncate" title={gap.supplier}>
                        {gap.supplier}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isCrit
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : isHigh
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : isMod
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-gray-100 text-gray-700 border border-gray-300'
                          }`}>
                          {gap.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-800 max-w-65">
                        <span className="font-semibold text-gray-900 block">{gap.gapType}</span>
                        <span className="text-[11px] text-gray-600 leading-normal">{gap.description}</span>
                        <span className="text-[10px] text-emerald-700 block mt-0.5 font-mono">{gap.ruleReference}</span>
                      </td>
                      <td className="py-3 px-3 text-emerald-900 bg-emerald-50/30 max-w-60 text-[11px] leading-normal italic">
                        {gap.recommendedAction}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          {gap.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenCorrection(gap.recordId)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-emerald-700 text-white text-[11px] font-semibold hover:bg-emerald-800 transition shadow-sm"
                        >
                          <span>Remediate</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Correction Modal */}
      <RecordModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={recordToCorrect}
        onSaveSuccess={() => {
          setFeedbackMsg('Record updated! Re-evaluating gap analysis matrix...');
          fetchGapAnalysis();
        }}
      />
    </div>
  );
}
