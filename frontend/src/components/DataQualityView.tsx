'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileWarning,
  Copy,
  Search,
  Edit3,
  HelpCircle,
  Filter,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import RecordModal from './RecordModal';

import { API_BASE } from '@/config';

export default function DataQualityView({ onNavigateToRecords }: { onNavigateToRecords?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [auditReport, setAuditReport] = useState<any>(null);
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Edit record modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecordToEdit, setSelectedRecordToEdit] = useState<any | null>(null);

  useEffect(() => {
    runValidation();
  }, []);

  const runValidation = async () => {
    try {
      setValidating(true);
      const res = await fetch(`${API_BASE}/data-quality/audit?user=Quality+Assurance+Officer`);
      if (!res.ok) throw new Error('Data quality audit endpoint returned an error');

      const data = await res.json();
      setAuditReport(data.report);
      setFeedbackMsg(`Data quality audit completed: ${data.report.totalRecords} records audited.`);
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err: any) {
      console.error(err);
      setFeedbackMsg('Failed to run data quality validation.');
    } finally {
      setValidating(false);
      setLoading(false);
    }
  };

  const handleOpenEdit = async (recordId: string) => {
    try {
      const res = await fetch(`${API_BASE}/records/${recordId}`);
      if (!res.ok) throw new Error('Could not fetch record details');
      const data = await res.json();
      setSelectedRecordToEdit(data.record);
      setIsEditModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredIssues = (auditReport?.flaggedIssues || []).filter((issue: any) => {
    const matchesSeverity = severityFilter === 'ALL' || issue.severity === severityFilter;
    const matchesSearch = searchTerm === '' ||
      issue.recordId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.detectedIssue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.ruleName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Data Quality Engine</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              10 Automated Validation Rules
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Automated detection of missing, invalid, duplicate, outdated, and conflicting packaging records prior to PPWR assessment.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={runValidation}
            disabled={validating}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${validating ? 'animate-spin' : ''}`} />
            <span>{validating ? 'Auditing Catalog...' : 'Run Data Validation'}</span>
          </button>
        </div>
      </div>

      {/* Honesty & Methodology Callout */}
      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start space-x-3 text-xs text-emerald-950">
        <HelpCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-emerald-900">Prototype Validation Methodology: </span>
          The Data Quality Engine runs 10 transparent, deterministic JavaScript validation rules (checking mandatory SKU/IDs, tare weights &gt; 0g, standard material classifications, duplicate identifiers, supplier registrations, recyclability declarations, PCR content &gt;= 0%, and test report freshness). No opaque or generative guesswork is utilized.
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className="p-3 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-medium flex items-center justify-between">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs font-bold px-1">&times;</button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Records */}
        <div className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Total Checked</span>
          <span className="text-xl font-bold text-gray-900 mt-1 block">{auditReport?.totalRecords || 0}</span>
          <span className="text-[10px] text-gray-400 mt-0.5 block">100% of Catalog</span>
        </div>

        {/* Valid Records */}
        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 shadow-sm">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">Valid Records</span>
          <span className="text-xl font-bold text-emerald-900 mt-1 block">{auditReport?.validRecords || 0}</span>
          <span className="text-[10px] text-emerald-600 mt-0.5 block">Zero Quality Flags</span>
        </div>

        {/* Records with Errors */}
        <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 shadow-sm">
          <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider block">Records w/ Errors</span>
          <span className="text-xl font-bold text-rose-900 mt-1 block">{auditReport?.recordsWithErrors || 0}</span>
          <span className="text-[10px] text-rose-600 mt-0.5 block">Requires Remediation</span>
        </div>

        {/* Duplicate Records */}
        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 shadow-sm">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">Duplicates</span>
          <span className="text-xl font-bold text-amber-900 mt-1 block">{auditReport?.duplicateRecords || 0}</span>
          <span className="text-[10px] text-amber-600 mt-0.5 block">Identical IDs/SKUs</span>
        </div>

        {/* Missing Fields */}
        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block">Missing Fields</span>
          <span className="text-xl font-bold text-gray-900 mt-1 block">{auditReport?.missingInformationCount || 0}</span>
          <span className="text-[10px] text-gray-500 mt-0.5 block">Null / Blank Attributes</span>
        </div>

        {/* Quality Percentage */}
        <div className="p-3.5 rounded-xl bg-[#0d2818] text-white border border-[#164324] shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider block">Quality Score</span>
          <span className="text-2xl font-bold text-white mt-1 block">{auditReport?.qualityPercentage || 0}%</span>
          <div className="w-full bg-emerald-950 rounded-full h-1.5 mt-1 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${auditReport?.qualityPercentage || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search flagged records by name, ID, or issue..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-gray-50/50"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-gray-500 font-medium">Filter by Severity:</span>
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition ${severityFilter === sev
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {sev === 'ALL' ? 'All Issues' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Flagged Issues Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-sm text-gray-900">Flagged Data Quality Issues</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
              Showing {filteredIssues.length} issues
            </span>
          </div>
          <span className="text-xs text-gray-400">Click &ldquo;Correct Record&rdquo; to resolve inline</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f4f7f5] text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-3">Packaging ID</th>
                <th className="py-3 px-3">Product Name</th>
                <th className="py-3 px-3">Material</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Detected Issue</th>
                <th className="py-3 px-3">Suggested Correction</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      <span>Running 10 automated quality checks...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-emerald-800">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      <p className="font-semibold text-sm">No quality issues found for the selected criteria!</p>
                      <p className="text-xs text-gray-500">All evaluated packaging specifications meet data consistency standards.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue: any, idx: number) => {
                  const isCrit = issue.severity === 'CRITICAL';
                  const isHigh = issue.severity === 'HIGH';

                  return (
                    <tr key={`${issue.recordId}-${idx}`} className="hover:bg-gray-50/70 transition">
                      <td className="py-3 px-3 font-mono font-medium text-emerald-800">
                        {issue.recordId}
                      </td>
                      <td className="py-3 px-3 font-semibold text-gray-900 max-w-40 truncate" title={issue.productName}>
                        {issue.productName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[11px]">
                          {issue.materialGroup}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isCrit
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : isHigh
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}>
                          {issue.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-800 max-w-70">
                        <span className="font-medium text-gray-900 block">{issue.ruleName}</span>
                        <span className="text-[11px] text-gray-600 leading-normal">{issue.detectedIssue}</span>
                      </td>
                      <td className="py-3 px-3 text-emerald-900 bg-emerald-50/30 max-w-60 text-[11px] italic">
                        {issue.suggestedCorrection}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleOpenEdit(issue.recordId)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-emerald-700 text-white text-[11px] font-semibold hover:bg-emerald-800 transition shadow-sm"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Correct</span>
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

      {/* Edit Modal for Immediate Correction */}
      <RecordModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={selectedRecordToEdit}
        onSaveSuccess={() => {
          setFeedbackMsg('Record corrected successfully! Re-running validation audit...');
          runValidation();
        }}
      />
    </div>
  );
}
