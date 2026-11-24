'use client';

import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  Building2, 
  Layers, 
  RefreshCw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

import { API_BASE } from '@/config';

export default function ReportsView() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComprehensiveReport();
  }, []);

  const fetchComprehensiveReport = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/reports/comprehensive?user=Assessment+Reporter`);
      if (!res.ok) throw new Error('Failed to load comprehensive report');
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    window.open(`${API_BASE}/reports/export-csv`, '_blank');
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleDownloadSummary = () => {
    if (!reportData) return;
    const summaryJson = JSON.stringify(reportData, null, 2);
    const blob = new Blob([summaryJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PackReady_Assessment_Summary_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-600">Generating live assessment report from current catalog...</p>
      </div>
    );
  }

  const rSummary = reportData?.readinessSummary || {};
  const qSummary = reportData?.dataQualitySummary || {};
  const gSummary = reportData?.gapsSummary || {};
  const recSummary = reportData?.recommendationsSummary || {};

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Action Header - Hidden on Print */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Executive Assessment Report</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              Live Application Data
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Consolidated readiness, data quality, gap analysis, and converter summaries ready for TECHgium jury evaluation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-50 transition shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleDownloadSummary}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-50 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-blue-700" />
            <span>Download Summary</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6 print:p-0 print:border-none print:shadow-none">
        {/* Report Official Banner */}
        <div className="border-b border-gray-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl text-emerald-950 tracking-tight">PackReady AI</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-700 text-white font-mono font-semibold">TG0900889</span>
            </div>
            <h1 className="text-sm font-semibold text-gray-800 mt-1">
              Intelligent Packaging Data Readiness Assessment for PPWR Reporting
            </h1>
            <p className="text-xs text-gray-500">
              Institution: <span className="font-medium text-gray-700">M. Kumarasamy College of Engineering, Karur</span>
            </p>
          </div>

          <div className="text-left md:text-right text-xs text-gray-500">
            <div>Generated: <span className="font-mono text-gray-800">{new Date(reportData?.generatedAt).toLocaleString()}</span></div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Evaluation Assessment Prototype</div>
          </div>
        </div>

        {/* Prototype Honesty Notice */}
        <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 flex items-start space-x-2.5">
          <HelpCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-emerald-900">Official Report Notice: </span>
            {reportData?.disclaimer}
          </div>
        </div>

        {/* Section 1: Overall Readiness Summary */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">1. Overall Readiness Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[#0d2818] text-white">
              <span className="text-[11px] text-emerald-300 font-semibold uppercase block">Readiness Score</span>
              <span className="text-3xl font-extrabold text-white mt-1 block">{rSummary.overallScore || 0}%</span>
              <span className="text-[10px] text-emerald-200/70 mt-1 block">5-Dimension Weighted Portfolio Score</span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-[11px] text-emerald-800 font-semibold uppercase block">Ready Records</span>
              <span className="text-3xl font-bold text-emerald-950 mt-1 block">{rSummary.readyRecords || 0}</span>
              <span className="text-[10px] text-emerald-700 mt-1 block">Score 80–100% (Audit Ready)</span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
              <span className="text-[11px] text-amber-800 font-semibold uppercase block">Partially Ready</span>
              <span className="text-3xl font-bold text-amber-950 mt-1 block">{rSummary.partiallyReadyRecords || 0}</span>
              <span className="text-[10px] text-amber-700 mt-1 block">Score 50–79% (Gaps Identified)</span>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
              <span className="text-[11px] text-rose-800 font-semibold uppercase block">Action Required</span>
              <span className="text-3xl font-bold text-rose-950 mt-1 block">{rSummary.actionRequiredRecords || 0}</span>
              <span className="text-[10px] text-rose-700 mt-1 block">Score &lt;50% (High Non-Compliance Risk)</span>
            </div>
          </div>
        </div>

        {/* Section 2: Data Quality & Regulatory Gaps Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Data Quality Summary */}
          <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">2. Data Quality Audit</h4>
              <span className="text-xs font-bold text-emerald-700">{qSummary.qualityPercentage || 0}% Score</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-500 block text-[11px]">Valid Records</span>
                <span className="font-bold text-gray-900 text-base">{qSummary.validRecords || 0}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-500 block text-[11px]">Records w/ Errors</span>
                <span className="font-bold text-rose-700 text-base">{qSummary.recordsWithErrors || 0}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-500 block text-[11px]">Duplicate Records</span>
                <span className="font-bold text-gray-900 text-base">{qSummary.duplicateRecords || 0}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-500 block text-[11px]">Missing Fields</span>
                <span className="font-bold text-gray-900 text-base">{qSummary.missingInformationCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Identified Gaps & Recommendations */}
          <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">3. Gaps &amp; Recommendations</h4>
              <span className="text-xs font-bold text-amber-700">{gSummary.totalGaps || 0} Gaps Active</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-500 block text-[11px]">Critical Gaps</span>
                <span className="font-bold text-rose-700 text-base">{gSummary.criticalGaps || 0}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-500 block text-[11px]">Moderate Gaps</span>
                <span className="font-bold text-amber-700 text-base">{gSummary.moderateGaps || 0}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-500 block text-[11px]">Recommendations</span>
                <span className="font-bold text-gray-900 text-base">{recSummary.total || 0}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-500 block text-[11px]">Resolved Items</span>
                <span className="font-bold text-emerald-700 text-base">{recSummary.completed || 0} ({recSummary.completionRate || 0}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Supplier-Level Summary Table */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">4. Supplier-Level Readiness &amp; Compliance Matrix</h3>
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f4f7f5] text-gray-700 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">Supplier / Converter Name</th>
                  <th className="py-2.5 px-3">Country</th>
                  <th className="py-2.5 px-3 text-center">Packaging SKUs</th>
                  <th className="py-2.5 px-3 text-center">Ready Items</th>
                  <th className="py-2.5 px-3 text-center">Gaps Flagged</th>
                  <th className="py-2.5 px-3 text-center">Avg Readiness</th>
                  <th className="py-2.5 px-3 text-right">Compliance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {(reportData?.supplierSummary || []).map((sup: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50/60 transition">
                    <td className="py-2.5 px-3 font-semibold text-gray-900">{sup.supplierName}</td>
                    <td className="py-2.5 px-3 text-gray-600">{sup.country}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{sup.recordCount}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-emerald-700 font-bold">{sup.readyCount}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-amber-700">{sup.gapCount}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{sup.avgReadiness}%</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sup.complianceRate >= 80 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {sup.complianceRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Report Footer */}
        <div className="pt-4 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between text-[11px] text-gray-500 gap-2">
          <span>PackReady AI • Project ID TG0900889 • M. Kumarasamy College of Engineering</span>
          <span>Phase 7 Demonstration Release</span>
        </div>
      </div>
    </div>
  );
}
