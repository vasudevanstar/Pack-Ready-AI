'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { API_BASE } from '@/config';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  initialData?: any | null; // If provided, Edit mode; else Add mode
}

const MATERIAL_OPTIONS = ['Plastic', 'Paper', 'Cardboard', 'Glass', 'Metal', 'Composite'];
const FORMAT_OPTIONS = [
  'Primary (Direct Food/Product Contact)',
  'Secondary (Multipack/Carton)',
  'Tertiary (Transport/Pallet)'
];
const RECYCLABILITY_OPTIONS = [
  'Class A (>=95% Recyclable in practice)',
  'Class B (70-80% Recyclable)',
  'Class D (<50% Recyclable - Design Improvement Needed)',
  'Class E (Non-recyclable under PPWR Art. 6)',
  'Declared Recyclable (Conflicting Lab Report)'
];
const EVIDENCE_OPTIONS = [
  'Verified (EN 13430 / ISO 14021)',
  'Missing / Expired',
  'Third-Party RecyClass Audit'
];

export default function RecordModal({ isOpen, onClose, onSaveSuccess, initialData }: RecordModalProps) {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
    sku: '',
    productName: '',
    packagingId: '',
    materialGroup: 'Plastic',
    packagingLevel: 'Primary (Direct Food/Product Contact)',
    weightGrams: '',
    recycledContentPercent: '',
    supplierName: '',
    recyclabilityClass: 'Class B (70-80% Recyclable)',
    supplierDeclarationStatus: 'Verified (EN 13430 / ISO 14021)',
    substancesOfConcernDeclared: 'Compliant (<0.01% w/w PFAS & Heavy Metals)'
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        sku: initialData.sku || '',
        productName: initialData.productName || '',
        packagingId: initialData.id || '',
        materialGroup: initialData.materialGroup || 'Plastic',
        packagingLevel: initialData.packagingLevel || 'Primary (Direct Food/Product Contact)',
        weightGrams: initialData.weightGrams !== null && initialData.weightGrams !== undefined ? String(initialData.weightGrams) : '',
        recycledContentPercent: initialData.recycledContentPercent !== null && initialData.recycledContentPercent !== undefined ? String(initialData.recycledContentPercent) : '',
        supplierName: initialData.supplierName || '',
        recyclabilityClass: initialData.recyclabilityClass || 'Class B (70-80% Recyclable)',
        supplierDeclarationStatus: initialData.supplierDeclarationStatus || 'Verified (EN 13430 / ISO 14021)',
        substancesOfConcernDeclared: initialData.substancesOfConcernDeclared || 'Compliant (<0.01% w/w PFAS & Heavy Metals)'
      });
    } else {
      setFormData({
        sku: '',
        productName: '',
        packagingId: '',
        materialGroup: 'Plastic',
        packagingLevel: 'Primary (Direct Food/Product Contact)',
        weightGrams: '',
        recycledContentPercent: '',
        supplierName: '',
        recyclabilityClass: 'Class B (70-80% Recyclable)',
        supplierDeclarationStatus: 'Verified (EN 13430 / ISO 14021)',
        substancesOfConcernDeclared: 'Compliant (<0.01% w/w PFAS & Heavy Metals)'
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName.trim()) {
      setError('Product Name is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const url = isEdit 
        ? `${API_BASE}/records/${initialData.id}`
        : `${API_BASE}/records`;

      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          weightGrams: formData.weightGrams !== '' ? Number(formData.weightGrams) : null,
          recycledContentPercent: formData.recycledContentPercent !== '' ? Number(formData.recycledContentPercent) : null,
          user: 'Packaging Specialist'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save packaging record.');
      }

      onSaveSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-[#0d2818] px-6 py-4 text-white flex items-center justify-between">
          <h3 className="font-bold text-base">
            {isEdit ? `Edit Packaging Record (${initialData.id})` : 'Add New Packaging Record'}
          </h3>
          <button 
            onClick={onClose}
            className="text-emerald-200/80 hover:text-white transition p-1 rounded-lg hover:bg-[#164324]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Product ID / SKU */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Product ID (SKU)</label>
              <input
                type="text"
                placeholder="e.g. SKU-1045"
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            {/* Product Name */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Product Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Eco Sparkling Water 500ml"
                value={formData.productName}
                onChange={e => setFormData({ ...formData, productName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            {/* Material Group */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Packaging Material *</label>
              <select
                value={formData.materialGroup}
                onChange={e => setFormData({ ...formData, materialGroup: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white"
              >
                {MATERIAL_OPTIONS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Packaging Format / Level */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Packaging Format / Level</label>
              <select
                value={formData.packagingLevel}
                onChange={e => setFormData({ ...formData, packagingLevel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white"
              >
                {FORMAT_OPTIONS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Net Weight */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Packaging Net Weight (grams)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 24.5"
                value={formData.weightGrams}
                onChange={e => setFormData({ ...formData, weightGrams: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
              <span className="text-[10px] text-gray-500">Leave blank to test missing weight detection</span>
            </div>

            {/* Recycled Content (%) */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Recycled Content (PCR %)</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="e.g. 35"
                value={formData.recycledContentPercent}
                onChange={e => setFormData({ ...formData, recycledContentPercent: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
              <span className="text-[10px] text-gray-500">PPWR Art. 7 target is typically &gt;= 30-35%</span>
            </div>

            {/* Supplier Name */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Supplier Name</label>
              <input
                type="text"
                placeholder="e.g. Amcor Flexibles"
                value={formData.supplierName}
                onChange={e => setFormData({ ...formData, supplierName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            {/* Recyclability Class */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Recyclability Class (PPWR Art. 6)</label>
              <select
                value={formData.recyclabilityClass}
                onChange={e => setFormData({ ...formData, recyclabilityClass: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white"
              >
                {RECYCLABILITY_OPTIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Supporting Evidence Status */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Supporting Evidence Status</label>
              <select
                value={formData.supplierDeclarationStatus}
                onChange={e => setFormData({ ...formData, supplierDeclarationStatus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white"
              >
                {EVIDENCE_OPTIONS.map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            {/* Substances of Concern */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Substances of Concern (SVHC / PFAS)</label>
              <select
                value={formData.substancesOfConcernDeclared}
                onChange={e => setFormData({ ...formData, substancesOfConcernDeclared: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white"
              >
                <option value="Compliant (<0.01% w/w PFAS & Heavy Metals)">Compliant (&lt;0.01% w/w PFAS &amp; Heavy Metals)</option>
                <option value="Pending SVHC Screening">Pending SVHC Screening</option>
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition disabled:opacity-50 shadow-sm"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Record...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isEdit ? 'Update Record' : 'Save Record'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
