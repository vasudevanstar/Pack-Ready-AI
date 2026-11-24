'use client';

import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  HelpCircle, 
  PlayCircle, 
  Check, 
  ExternalLink,
  Layers,
  ChevronRight
} from 'lucide-react';
import RecordModal from './RecordModal';

const API_BASE = 'http://localhost:5000/api';

export default function RecommendationsView() {
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [recData, setRecData] = useState<any>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending' | 'In Progress' | 'Completed'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'>('ALL');

  // Related Record Modal
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordUnderView, setRecordUnderView] = useState<any | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/recommendations`);
      if (!res.ok) throw new Error('Failed to load recommendations');
      const data = await res.json();
      setRecData(data.report);
    } catch (err: any) {
      console.error(err);
      setNotification('Failed to fetch recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (recId: string, newStatus: 'In Progress' | 'Completed') => {
    try {
      setUpdatingId(recId);
      const res = await fetch(`${API_BASE}/recommendations/${recId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          user: 'Remediation Coordinator'
        })
      });

      if (!res.ok) throw new Error('Status update failed');
      const data = await res.json();
      setRecData(data.report);
      setNotification(`Recommendation ${recId} status set to "${newStatus}".`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      console.error(err);
      setNotification('Failed to update recommendation status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewRelatedRecord = async (recordId: string) => {
    try {
      const res = await fetch(`${API_BASE}/records/${recordId}`);
      if (!res.ok) throw new Error('Could not fetch record');
      const data = await res.json();
      setRecordUnderView(data.record);
      setIsRecordModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRecs = (recData?.recommendations || []).filter((r: any) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || r.priority === priorityFilter;
    const matchesSearch = search === '' ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.recordId.toLowerCase().includes(search.toLowerCase()) ||
      r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.identifiedGap.toLowerCase().includes(search.toLowerCase()) ||
      r.suggestedAction.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Corrective Recommendation Engine</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              Deterministic Remediation Pipeline
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Rules-driven actionable recommendations generated directly from identified regulatory discrepancies and data quality gaps.
          </p>
        </div>

        <button
          onClick={fetchRecommendations}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Recommendations</span>
        </button>
      </div>

      {/* Honesty Notice */}
      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start space-x-3 text-xs text-emerald-950">
        <HelpCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-emerald-900">Prototype Rules Disclosure: </span>
          All corrective actions shown below are derived using deterministic, rule-based mappings (e.g. missing weight &rarr; request scale tare data from converter; missing PCR &rarr; request EN 15343 chain of custody attestation). No black-box or generative AI hallucinations are utilized.
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="p-3 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-medium flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-xs font-bold px-1">&times;</button>
        </div>
      )}

      {/* Progress & KPI Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Overall Completion Progress */}
        <div className="bg-[#0d2818] text-white p-5 rounded-xl border border-[#164324] shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">Remediation Progress</span>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-3xl font-extrabold text-white">{recData?.completionPercentage || 0}%</span>
              <span className="text-xs text-emerald-300">Resolved</span>
            </div>
            <div className="w-full bg-emerald-950 h-2 rounded-full overflow-hidden mt-3">
              <div 
                className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${recData?.completionPercentage || 0}%` }} 
              />
            </div>
          </div>
          <span className="text-[10px] text-emerald-200/70 mt-3 block">
            {recData?.completedCount || 0} of {recData?.totalRecommendations || 0} recommendations closed
          </span>
        </div>

        {/* Pending Actions */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Pending Actions</span>
            <span className="text-2xl font-bold text-gray-900 mt-1 block">{recData?.pendingCount || 0}</span>
            <span className="text-[11px] text-rose-600 mt-0.5 block">Awaiting converter response</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">In Progress</span>
            <span className="text-2xl font-bold text-amber-900 mt-1 block">{recData?.inProgressCount || 0}</span>
            <span className="text-[11px] text-amber-600 mt-0.5 block">Under lab/audit review</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
            <PlayCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Completed</span>
            <span className="text-2xl font-bold text-emerald-900 mt-1 block">{recData?.completedCount || 0}</span>
            <span className="text-[11px] text-emerald-600 mt-0.5 block">Attested &amp; verified</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, product, gap, or action..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-gray-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center space-x-1">
            <span className="text-gray-500 font-medium">Status:</span>
            {(['ALL', 'Pending', 'In Progress', 'Completed'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 rounded-lg font-semibold text-xs transition ${
                  statusFilter === st 
                    ? 'bg-emerald-700 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {st === 'ALL' ? 'All' : st}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <div className="flex items-center space-x-1 ml-2">
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
        </div>
      </div>

      {/* Recommendations Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-sm text-gray-900">Corrective Action Items</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
              Showing {filteredRecs.length} of {recData?.totalRecommendations || 0}
            </span>
          </div>
          <span className="text-xs text-gray-400">Click action buttons to update progress</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f4f7f5] text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-3">Rec ID</th>
                <th className="py-3 px-3">Related Packaging</th>
                <th className="py-3 px-3">Identified Gap</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Suggested Corrective Action</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      <span>Generating rule-based recommendations...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRecs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-emerald-800">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      <p className="font-semibold text-sm">No action items matching the active filter!</p>
                      <p className="text-xs text-gray-500">All matching gaps have either been resolved or filtered out.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecs.map((rec: any) => {
                  const isCrit = rec.priority === 'CRITICAL';
                  const isHigh = rec.priority === 'HIGH';
                  const isDone = rec.status === 'Completed';
                  const isInProg = rec.status === 'In Progress';

                  return (
                    <tr key={rec.id} className={`hover:bg-gray-50/70 transition ${isDone ? 'bg-emerald-50/20 opacity-75' : ''}`}>
                      <td className="py-3 px-3 font-mono font-medium text-emerald-800 whitespace-nowrap">
                        {rec.id}
                      </td>

                      {/* Related packaging record */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleViewRelatedRecord(rec.recordId)}
                          className="text-left font-semibold text-gray-900 hover:text-emerald-700 flex items-center space-x-1 group max-w-35 truncate"
                          title={`Click to view record ${rec.recordId}`}
                        >
                          <span className="truncate">{rec.recordId}</span>
                          <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-emerald-700 shrink-0" />
                        </button>
                        <span className="text-[10px] text-gray-500 block truncate" title={rec.productName}>
                          {rec.productName}
                        </span>
                      </td>

                      {/* Identified gap */}
                      <td className="py-3 px-3 text-gray-800 max-w-35">
                        <span className="font-medium block leading-tight">{rec.identifiedGap}</span>
                        <span className="text-[10px] text-gray-400">{rec.material}</span>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isCrit 
                            ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                            : isHigh 
                              ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          {rec.priority}
                        </span>
                      </td>

                      {/* Suggested Action */}
                      <td className="py-3 px-3 text-gray-800 max-w-70">
                        <span className="text-[11px] font-medium text-gray-900 block leading-normal">
                          {rec.suggestedAction}
                        </span>
                        <span className="text-[10px] text-gray-500 mt-0.5 block">
                          Supplier: <span className="font-semibold text-gray-700">{rec.supplier}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isDone 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : isInProg 
                              ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                              : 'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}>
                          {rec.status}
                        </span>
                      </td>

                      {/* Workflow Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center space-x-1.5">
                          {rec.status !== 'In Progress' && !isDone && (
                            <button
                              onClick={() => handleUpdateStatus(rec.id, 'In Progress')}
                              disabled={updatingId === rec.id}
                              className="px-2 py-1 rounded bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition text-[11px] font-medium inline-flex items-center space-x-1"
                              title="Mark as In Progress"
                            >
                              <PlayCircle className="w-3 h-3 text-amber-700" />
                              <span>In Progress</span>
                            </button>
                          )}

                          {!isDone && (
                            <button
                              onClick={() => handleUpdateStatus(rec.id, 'Completed')}
                              disabled={updatingId === rec.id}
                              className="px-2 py-1 rounded bg-emerald-700 text-white hover:bg-emerald-800 transition text-[11px] font-semibold inline-flex items-center space-x-1 shadow-sm"
                              title="Mark as Completed"
                            >
                              <Check className="w-3 h-3" />
                              <span>Complete</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleViewRelatedRecord(rec.recordId)}
                            className="p-1 rounded text-gray-500 hover:text-emerald-700 hover:bg-gray-100 transition"
                            title="View / Edit Related Packaging Record"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Related Record Inspection & Edit Modal */}
      <RecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        initialData={recordUnderView}
        onSaveSuccess={() => {
          setNotification('Packaging record updated! Re-generating recommendations...');
          fetchRecommendations();
        }}
      />
    </div>
  );
}
