'use client';

import React, { useEffect, useState } from 'react';
import {
  History,
  RefreshCw,
  Search,
  Clock,
  User,
  Filter,
  Activity,
  CheckCircle2,
  HelpCircle,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

import { API_BASE } from '@/config';

const ACTION_FILTERS = [
  { id: 'ALL', label: 'All Activities' },
  { id: 'PACKAGING_RECORD_CREATED', label: 'Record Created' },
  { id: 'PACKAGING_RECORD_UPDATED', label: 'Record Updated' },
  { id: 'PACKAGING_RECORD_DELETED', label: 'Record Deleted' },
  { id: 'CSV_UPLOADED', label: 'CSV Uploaded' },
  { id: 'DATA_VALIDATION_EXECUTED', label: 'Validation Run' },
  { id: 'READINESS_ASSESSMENT_EXECUTED', label: 'Assessment Run' },
  { id: 'RECOMMENDATION_STATUS_CHANGED', label: 'Rec Status Changed' },
  { id: 'REPORT_GENERATED', label: 'Report Generated' }
];

export default function AuditTrailView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        action: actionFilter,
        limit: '150'
      });
      const res = await fetch(`${API_BASE}/audit?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load audit logs');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.id.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      (log.relatedRecord && log.relatedRecord.toLowerCase().includes(q)) ||
      (log.user && log.user.toLowerCase().includes(q)) ||
      (log.description && log.description.toLowerCase().includes(q))
    );
  });

  const getActionBadge = (action: string) => {
    if (action.includes('CREATED') || action.includes('CSV_UPLOADED')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (action.includes('UPDATED') || action.includes('STATUS_CHANGE')) {
      return 'bg-blue-50 text-blue-800 border-blue-200';
    }
    if (action.includes('DELETED')) {
      return 'bg-rose-50 text-rose-800 border-rose-200';
    }
    if (action.includes('ASSESSMENT') || action.includes('VALIDATION')) {
      return 'bg-amber-50 text-amber-800 border-amber-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">System Audit Trail &amp; Activity Log</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              {logs.length} Logged Events
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Tamper-evident chronological activity history capturing data additions, CSV uploads, rule audits, and remediation workflows.
          </p>
        </div>

        <button
          onClick={fetchAuditLogs}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Activity Log</span>
        </button>
      </div>

      {/* Honesty Disclosure */}
      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start space-x-3 text-xs text-emerald-950">
        <HelpCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-emerald-900">Audit Trail Verification Note: </span>
          The audit history recorded below tracks user operations across all modules in in-memory / local application state for the demonstration. Every CSV upload, manual packaging record edit, quality check, and recommendation status transition is recorded in real time.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search activity ID, user, action, or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-gray-50/50"
          />
        </div>

        <div className="flex items-center space-x-1.5 w-full md:w-auto">
          <span className="text-gray-500 font-medium">Action:</span>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            {ACTION_FILTERS.map(f => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-sm text-gray-900">Chronological Event History</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
              Showing {filteredLogs.length} events
            </span>
          </div>
          <span className="text-xs text-gray-400">Latest actions at top</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f4f7f5] text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-3">Activity ID</th>
                <th className="py-3 px-3">Action Type</th>
                <th className="py-3 px-3">Related Record</th>
                <th className="py-3 px-3">Date &amp; Time</th>
                <th className="py-3 px-3">Actor / User</th>
                <th className="py-3 px-3">Detailed Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading audit history...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No activity logs match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3 px-3 font-mono font-medium text-emerald-800 whitespace-nowrap">
                      {log.id}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-gray-800 whitespace-nowrap">
                      {log.relatedRecord || 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-700 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="font-medium">{log.user}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-800 max-w-85 leading-normal">
                      {log.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
