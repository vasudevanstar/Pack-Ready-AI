'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Download } from 'lucide-react';
import { API_BASE } from '@/config';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export default function CsvUploadModal({ isOpen, onClose, onUploadSuccess }: CsvUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith('.csv')) {
        setError('Please select a valid .csv file.');
        setFile(null);
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file to upload.');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('user', 'Presentation Evaluator');

      const res = await fetch(`${API_BASE}/upload-csv`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process CSV file.');
      }

      setSuccessMsg(data.message || 'CSV records imported successfully!');
      setTimeout(() => {
        onUploadSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error uploading file.');
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleCsv = () => {
    window.open(`${API_BASE}/sample-csv`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#0d2818] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Import Packaging Data (CSV)</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-emerald-200/80 hover:text-white transition p-1 rounded-lg hover:bg-[#164324]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-gray-600 leading-relaxed">
            Upload packaging BOMs or supplier packaging data in CSV format to trigger real-time data completeness and PPWR digital readiness assessment.
          </p>

          {/* Sample CSV Download pill */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="text-xs">
              <span className="font-semibold text-emerald-900">Need the standardized template?</span>
              <p className="text-[11px] text-emerald-700">Pre-formatted with PPWR required fields</p>
            </div>
            <button
              onClick={downloadSampleCsv}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample CSV</span>
            </button>
          </div>

          {/* Drag & Drop / File Input Box */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
              file ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-300 hover:border-emerald-600 hover:bg-gray-50'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".csv" 
              className="hidden" 
            />
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                <FileText className="w-6 h-6" />
              </div>
              {file ? (
                <div>
                  <p className="text-xs font-bold text-gray-900">{file.name}</p>
                  <p className="text-[11px] text-gray-500">{(file.size / 1024).toFixed(1)} KB • Click to replace</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-gray-800">Click to choose a CSV file</p>
                  <p className="text-[11px] text-gray-400">Standard UTF-8 comma-separated format</p>
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-200 flex items-center justify-end space-x-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition disabled:opacity-50 shadow-sm"
          >
            {uploading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing CSV...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Upload & Ingest</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
