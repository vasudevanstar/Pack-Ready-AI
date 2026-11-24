'use client';

import React, { useEffect, useState } from 'react';
import {
  Upload,
  Plus,
  Search,
  Filter,
  Download,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import CsvUploadModal from './CsvUploadModal';
import RecordModal from './RecordModal';

import { API_BASE } from '@/config';

const MATERIALS = ['ALL', 'Plastic', 'Paper', 'Cardboard', 'Glass', 'Metal', 'Composite'];
const STATUS_FILTERS = [
  { id: 'ALL', label: 'All Statuses' },
  { id: 'READY', label: 'Ready (Tier 1 & 2)' },
  { id: 'MODERATE', label: 'Partially Ready' },
  { id: 'ACTION_REQUIRED', label: 'Action Required' }
];

export default function PackagingRecordsView() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [materialFilter, setMaterialFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchRecords();
  }, [page, materialFilter, statusFilter]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search: search.trim(),
        material: materialFilter,
        status: statusFilter
      });

      const res = await fetch(`${API_BASE}/records?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load packaging records');

      const data = await res.json();
      setRecords(data.records || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error fetching records' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRecords();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" (${id})?`)) return;

    try {
      const res = await fetch(`${API_BASE}/records/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete record');

      setFeedbackMsg({ type: 'success', text: `Record ${id} was deleted.` });
      setTimeout(() => setFeedbackMsg(null), 3500);
      fetchRecords();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error deleting record' });
    }
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setIsRecordModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingRecord(null);
    setIsRecordModalOpen(true);
  };

  const downloadSampleCsv = () => {
    window.open(`${API_BASE}/sample-csv`, '_blank');
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Packaging Records & Data Importer</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              {total} Total Records
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Maintain packaging BOMs, upload CSVs, audit physical parameters, and review PPWR digital readiness.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={downloadSampleCsv}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-50 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Sample CSV</span>
          </button>

          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV</span>
          </button>

          <button
            onClick={handleAddNew}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#0d2818] text-white text-xs font-semibold hover:bg-[#164324] transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {feedbackMsg && (
        <div className={`p-3 rounded-lg text-xs font-medium flex items-center justify-between ${feedbackMsg.type === 'success'
            ? 'bg-emerald-100 border border-emerald-300 text-emerald-900'
            : 'bg-red-100 border border-red-300 text-red-900'
          }`}>
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs font-bold px-1">&times;</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, SKU, product, or supplier..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-gray-50/50"
          />
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Material Filter */}
          <div className="flex items-center space-x-1">
            <span className="text-gray-500 font-medium">Material:</span>
            <select
              value={materialFilter}
              onChange={e => { setMaterialFilter(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              {MATERIALS.map(m => (
                <option key={m} value={m}>{m === 'ALL' ? 'All Materials' : m}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1">
            <span className="text-gray-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              {STATUS_FILTERS.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => { setSearch(''); setMaterialFilter('ALL'); setStatusFilter('ALL'); setPage(1); }}
            title="Reset Filters"
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-600 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f4f7f5] text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-3">Product ID</th>
                <th className="py-3 px-3">Product Name</th>
                <th className="py-3 px-3">Packaging ID</th>
                <th className="py-3 px-3">Material</th>
                <th className="py-3 px-3">Weight (g)</th>
                <th className="py-3 px-3">Packaging Format</th>
                <th className="py-3 px-3">Supplier Name</th>
                <th className="py-3 px-3">PCR %</th>
                <th className="py-3 px-3">Readiness</th>
                <th className="py-3 px-3">Evidence Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading packaging records...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-gray-500">
                    No packaging records found matching the current search or filters.
                  </td>
                </tr>
              ) : (
                records.map((item) => {
                  const score = item.assessment?.readinessScore ?? 0;
                  const isReady = score >= 85;
                  const isModerate = score >= 55 && score < 85;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition">
                      {/* Product ID */}
                      <td className="py-3 px-3 font-mono font-medium text-gray-900">{item.sku}</td>

                      {/* Product Name */}
                      <td className="py-3 px-3 font-semibold text-gray-900 max-w-42.5 truncate" title={item.productName}>
                        {item.productName}
                      </td>

                      {/* Packaging ID */}
                      <td className="py-3 px-3 font-mono text-emerald-800 font-medium">{item.id}</td>

                      {/* Material */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-[11px] font-medium border border-gray-200">
                          {item.materialGroup}
                        </span>
                      </td>

                      {/* Weight */}
                      <td className="py-3 px-3">
                        {item.weightGrams !== null && item.weightGrams !== undefined ? (
                          <span>{item.weightGrams} g</span>
                        ) : (
                          <span className="text-red-600 font-semibold bg-red-50 px-1.5 py-0.5 rounded border border-red-200 text-[10px]">
                            Missing
                          </span>
                        )}
                      </td>

                      {/* Packaging Format */}
                      <td className="py-3 px-3 max-w-32.5 truncate text-gray-600" title={item.packagingLevel}>
                        {item.packagingLevel?.split(' ')[0] || 'Primary'}
                      </td>

                      {/* Supplier Name */}
                      <td className="py-3 px-3 max-w-32.5 truncate text-gray-600" title={item.supplierName}>
                        {item.supplierName}
                      </td>

                      {/* PCR % */}
                      <td className="py-3 px-3">
                        {item.recycledContentPercent !== null && item.recycledContentPercent !== undefined ? (
                          <span className="font-semibold text-gray-800">{item.recycledContentPercent}%</span>
                        ) : (
                          <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px]">
                            N/A
                          </span>
                        )}
                      </td>

                      {/* Readiness */}
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold">{score}%</span>
                          <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-emerald-500' : isModerate ? 'bg-amber-500' : 'bg-red-500'
                            }`} />
                        </div>
                      </td>

                      {/* Evidence Status */}
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${item.supplierDeclarationStatus?.includes('Verified')
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                          {item.supplierDeclarationStatus?.includes('Verified') ? 'Verified' : 'Missing'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => handleEdit(item)}
                            title="Edit Record"
                            className="p-1 rounded text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.productName)}
                            title="Delete Record"
                            className="p-1 rounded text-gray-500 hover:text-red-700 hover:bg-red-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Pagination Footer */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
          <div>
            Showing <span className="font-semibold text-gray-900">{records.length}</span> of <span className="font-semibold text-gray-900">{total}</span> records
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="p-1.5 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-medium text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="p-1.5 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* CSV Upload Modal */}
      <CsvUploadModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onUploadSuccess={() => {
          setFeedbackMsg({ type: 'success', text: 'CSV uploaded and packaging database updated!' });
          fetchRecords();
        }}
      />

      {/* Add / Edit Record Modal */}
      <RecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        initialData={editingRecord}
        onSaveSuccess={() => {
          setFeedbackMsg({
            type: 'success',
            text: editingRecord ? 'Packaging record updated successfully.' : 'New packaging record created.'
          });
          fetchRecords();
        }}
      />
    </div>
  );
}
