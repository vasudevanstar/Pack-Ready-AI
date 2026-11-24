'use client';

import React, { useEffect, useState } from 'react';
import {
  Gauge,
  RefreshCw,
  Sliders,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  ChevronRight,
  Info,
  ShieldCheck,
  FileCheck2,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

const API_BASE = 'http://localhost:5000/api';

export default function DigitalReadinessView() {
  const [loading, setLoading] = useState(true);
  const [assessing, setAssessing] = useState(false);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<'ALL' | 'Ready' | 'Partially Ready' | 'Action Required'>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  // Configurable weights state
  const [weights, setWeights] = useState({
    completeness: 25,
    accuracy: 20,
    traceability: 20,
    standardization: 20,
    availability: 15
  });

  useEffect(() => {
    executeAssessment();
  }, []);

  const executeAssessment = async (overrideWeights?: any) => {
    try {
      setAssessing(true);
      const activeWeights = overrideWeights || {
        completeness: weights.completeness / 100,
        accuracy: weights.accuracy / 100,
        traceability: weights.traceability / 100,
        standardization: weights.standardization / 100,
        availability: weights.availability / 100
      };

      const res = await fetch(`${API_BASE}/readiness/assess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weights: activeWeights,
          user: 'Digital Passport Assessor'
        })
      });

      if (!res.ok) throw new Error('Assessment request failed');
      const data = await res.json();
      setAssessmentData(data.assessment);
      if (data.assessment.records?.length > 0 && !selectedRecord) {
        setSelectedRecord(data.assessment.records[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAssessing(false);
      setLoading(false);
    }
  };

  const handleWeightChange = (key: string, val: number) => {
    const newWeights = { ...weights, [key]: val };
    setWeights(newWeights);
  };

  const applyCustomWeights = () => {
    const total = weights.completeness + weights.accuracy + weights.traceability + weights.standardization + weights.availability;
    if (total !== 100) {
      alert(`Weights must sum to 100%. Current sum: ${total}%`);
      return;
    }
    executeAssessment();
    setShowFormulaModal(false);
  };

  const filteredRecords = (assessmentData?.records || []).filter((r: any) => {
    const matchesClass = classFilter === 'ALL' || r.classification === classFilter;
    const matchesSearch = searchTerm === '' ||
      r.recordId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.materialGroup.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const dimAvg = assessmentData?.dimensionAverages || {
    completeness: 0,
    accuracy: 0,
    traceability: 0,
    standardization: 0,
    availability: 0
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Digital Readiness Assessment Engine</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              5 Evaluation Dimensions
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Deterministic digital passport readiness assessment across data completeness, accuracy, traceability, standardization, and information availability.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowFormulaModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-50 transition shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-700" />
            <span>Formula & Weights</span>
          </button>

          <button
            onClick={() => executeAssessment()}
            disabled={assessing}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${assessing ? 'animate-spin' : ''}`} />
            <span>{assessing ? 'Evaluating Portfolio...' : 'Run Assessment'}</span>
          </button>
        </div>
      </div>

      {/* Honesty & Threshold Disclaimer */}
      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start space-x-3 text-xs text-emerald-950">
        <HelpCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-emerald-900">Prototype Scoring Disclaimer: </span>
          The scores and classifications shown below (<strong>Ready: 80–100</strong>, <strong>Partially Ready: 50–79</strong>, <strong>Action Required: &lt;50</strong>) are illustrative demonstration benchmarks designed to evaluate data maturity for PPWR Digital Product Passport (DPP) readiness. They do not constitute official European Union regulatory certification.
        </div>
      </div>

      {/* Main Score & 5 Dimension Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Score Card */}
        <div className="bg-[#0d2818] text-white p-6 rounded-2xl shadow-md border border-[#164324] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Overall Packaging Readiness</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded">
                Portfolio Score
              </span>
            </div>

            <div className="mt-6 flex items-baseline space-x-3">
              <span className="text-5xl font-extrabold text-white tracking-tight">{assessmentData?.overallScore || 0}%</span>
              <span className="text-sm font-semibold text-emerald-300">
                {(assessmentData?.overallScore || 0) >= 80 ? 'Ready Tier' : (assessmentData?.overallScore || 0) >= 50 ? 'Partially Ready' : 'Action Required'}
              </span>
            </div>

            <p className="text-xs text-emerald-200/80 mt-3 leading-relaxed">
              {assessmentData?.summaryText}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#1b4d2b] grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-[#143d22]">
              <span className="text-[10px] text-emerald-300 block">Ready (80-100)</span>
              <span className="text-base font-bold text-white mt-0.5 block">{assessmentData?.classificationSummary?.ready || 0}</span>
            </div>
            <div className="p-2 rounded-lg bg-[#143d22]">
              <span className="text-[10px] text-amber-300 block">Partially Ready</span>
              <span className="text-base font-bold text-white mt-0.5 block">{assessmentData?.classificationSummary?.partiallyReady || 0}</span>
            </div>
            <div className="p-2 rounded-lg bg-[#143d22]">
              <span className="text-[10px] text-rose-300 block">Action Required</span>
              <span className="text-base font-bold text-white mt-0.5 block">{assessmentData?.classificationSummary?.actionRequired || 0}</span>
            </div>
          </div>
        </div>

        {/* 5 Individual Dimensions Progress Bars */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-1">5 Core Readiness Dimensions</h3>
            <p className="text-xs text-gray-500 mb-4">Average scores across active portfolio specifications</p>

            <div className="space-y-3.5 text-xs">
              {/* Completeness */}
              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-gray-700">1. Data Completeness ({weights.completeness}%)</span>
                  <span className="font-bold text-gray-900">{dimAvg.completeness}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${dimAvg.completeness}%` }} />
                </div>
              </div>

              {/* Accuracy */}
              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-gray-700">2. Data Accuracy ({weights.accuracy}%)</span>
                  <span className="font-bold text-gray-900">{dimAvg.accuracy}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${dimAvg.accuracy}%` }} />
                </div>
              </div>

              {/* Traceability */}
              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-gray-700">3. Traceability ({weights.traceability}%)</span>
                  <span className="font-bold text-gray-900">{dimAvg.traceability}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${dimAvg.traceability}%` }} />
                </div>
              </div>

              {/* Standardization */}
              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-gray-700">4. Standardization ({weights.standardization}%)</span>
                  <span className="font-bold text-gray-900">{dimAvg.standardization}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${dimAvg.standardization}%` }} />
                </div>
              </div>

              {/* Information Availability */}
              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-gray-700">5. Information Availability ({weights.availability}%)</span>
                  <span className="font-bold text-gray-900">{dimAvg.availability}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${dimAvg.availability}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Readiness Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-1">Readiness Distribution</h3>
            <p className="text-xs text-gray-500 mb-2">Classified by prototype benchmark thresholds</p>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assessmentData?.distribution || []}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {(assessmentData?.distribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '11px', border: '1px solid #e5e7eb' }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Record-Level Assessment Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div>
            <h3 className="font-bold text-sm text-gray-900">Record-Level Readiness Breakdown</h3>
            <p className="text-xs text-gray-500">Individual packaging SKU scores across the 5 evaluation dimensions</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by SKU, name, or material..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-gray-50/50 text-xs"
              />
            </div>

            <div className="flex items-center space-x-1">
              {(['ALL', 'Ready', 'Partially Ready', 'Action Required'] as const).map(cls => (
                <button
                  key={cls}
                  onClick={() => setClassFilter(cls)}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold text-xs transition ${classFilter === cls
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {cls === 'ALL' ? 'All Records' : cls}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f4f7f5] text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-3">Item ID</th>
                <th className="py-3 px-3">Product Name</th>
                <th className="py-3 px-3">Material</th>
                <th className="py-3 px-3 text-center">Completeness</th>
                <th className="py-3 px-3 text-center">Accuracy</th>
                <th className="py-3 px-3 text-center">Traceability</th>
                <th className="py-3 px-3 text-center">Standard</th>
                <th className="py-3 px-3 text-center">Availability</th>
                <th className="py-3 px-3">Readiness Score</th>
                <th className="py-3 px-3 text-right">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      <span>Computing 5-dimension readiness assessment...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-500">
                    No packaging records found matching the current search or filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item: any) => {
                  const isReady = item.classification === 'Ready';
                  const isPartial = item.classification === 'Partially Ready';

                  return (
                    <tr
                      key={item.recordId}
                      onClick={() => setSelectedRecord(item)}
                      className={`hover:bg-gray-50/80 cursor-pointer transition ${selectedRecord?.recordId === item.recordId ? 'bg-emerald-50/40' : ''}`}
                    >
                      <td className="py-3 px-3 font-mono font-medium text-emerald-800">{item.recordId}</td>
                      <td className="py-3 px-3 font-semibold text-gray-900 max-w-37.5 truncate" title={item.productName}>
                        {item.productName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-[11px]">
                          {item.materialGroup}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">{item.dimensions?.completeness}%</td>
                      <td className="py-3 px-3 text-center font-mono">{item.dimensions?.accuracy}%</td>
                      <td className="py-3 px-3 text-center font-mono">{item.dimensions?.traceability}%</td>
                      <td className="py-3 px-3 text-center font-mono">{item.dimensions?.standardization}%</td>
                      <td className="py-3 px-3 text-center font-mono">{item.dimensions?.availability}%</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-900">{item.overallScore}%</span>
                          <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${isReady ? 'bg-emerald-600' : isPartial ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${item.overallScore}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isReady
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : isPartial
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                          {item.classification}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Record Detail Drilldown Drawer / Card */}
      {selectedRecord && (
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-gray-900">Score Audit Detail:</span>
              <span className="text-xs font-mono font-bold text-emerald-800">{selectedRecord.recordId}</span>
              <span className="text-xs text-gray-500">({selectedRecord.productName})</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${selectedRecord.classification === 'Ready'
              ? 'bg-emerald-100 text-emerald-900'
              : selectedRecord.classification === 'Partially Ready'
                ? 'bg-amber-100 text-amber-900'
                : 'bg-rose-100 text-rose-900'
              }`}>
              {selectedRecord.classification} • {selectedRecord.overallScore}%
            </span>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            <span className="font-semibold text-gray-800">Calculation Explanation: </span>
            {selectedRecord.explanation}
          </p>

          {selectedRecord.deductions?.length > 0 && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 space-y-1">
              <span className="font-semibold text-gray-800 block">Identified Dimension Deductions:</span>
              {selectedRecord.deductions.map((d: string, i: number) => (
                <div key={i} className="flex items-center space-x-1.5 text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>{d}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Formula & Configurable Weights Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in fade-in">
            <div className="bg-[#0d2818] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm">Configure 5-Dimension Weights</h3>
              </div>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="text-emerald-200 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-gray-600 leading-relaxed">
                Adjust dimension weightings based on enterprise compliance priorities. Total weights must sum to 100%.
              </p>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between font-semibold text-gray-700 mb-1">
                    <span>Data Completeness Weight</span>
                    <span>{weights.completeness}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={weights.completeness}
                    onChange={e => handleWeightChange('completeness', Number(e.target.value))}
                    className="w-full accent-emerald-700"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-gray-700 mb-1">
                    <span>Data Accuracy Weight</span>
                    <span>{weights.accuracy}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={weights.accuracy}
                    onChange={e => handleWeightChange('accuracy', Number(e.target.value))}
                    className="w-full accent-emerald-700"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-gray-700 mb-1">
                    <span>Traceability Weight</span>
                    <span>{weights.traceability}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={weights.traceability}
                    onChange={e => handleWeightChange('traceability', Number(e.target.value))}
                    className="w-full accent-emerald-700"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-gray-700 mb-1">
                    <span>Standardization Weight</span>
                    <span>{weights.standardization}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={weights.standardization}
                    onChange={e => handleWeightChange('standardization', Number(e.target.value))}
                    className="w-full accent-emerald-700"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-gray-700 mb-1">
                    <span>Information Availability Weight</span>
                    <span>{weights.availability}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={weights.availability}
                    onChange={e => handleWeightChange('availability', Number(e.target.value))}
                    className="w-full accent-emerald-700"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between font-bold">
                <span>Total Weight Sum:</span>
                <span className={weights.completeness + weights.accuracy + weights.traceability + weights.standardization + weights.availability === 100 ? 'text-emerald-700' : 'text-red-600'}>
                  {weights.completeness + weights.accuracy + weights.traceability + weights.standardization + weights.availability}%
                </span>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setWeights({ completeness: 25, accuracy: 20, traceability: 20, standardization: 20, availability: 15 });
                }}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-white"
              >
                Reset Default (25/20/20/20/15)
              </button>
              <button
                onClick={applyCustomWeights}
                className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800"
              >
                Apply &amp; Re-Assess
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
