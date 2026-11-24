import React from 'react';
import { Bell, RefreshCw, Upload, FileBarChart, CheckCircle2, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  onResetDemo: () => void;
  onQuickAction: (action: string) => void;
  isResetting: boolean;
}

export default function Header({ onResetDemo, onQuickAction, isResetting }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20">
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">PackReady AI</h1>
          <span className="text-xs px-2 py-0.5 font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Phase 1 Demonstration
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          Intelligent Packaging Data Readiness Assessment for PPWR Reporting • Project ID: <span className="font-semibold text-gray-700">TG0900889</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={() => onQuickAction('import')}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 bg-white transition shadow-sm"
        >
          <Upload className="w-3.5 h-3.5 text-emerald-600" />
          <span>Import Data</span>
        </button>

        <button
          onClick={() => onQuickAction('assess')}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition shadow-sm"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Run Assessment</span>
        </button>

        <button
          onClick={() => onQuickAction('report')}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 bg-white transition shadow-sm"
        >
          <FileBarChart className="w-3.5 h-3.5 text-blue-600" />
          <span>Generate Report</span>
        </button>

        <button
          onClick={onResetDemo}
          disabled={isResetting}
          title="Reset demonstration data to original 105 synthetic records"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-700 ${isResetting ? 'animate-spin' : ''}`} />
          <span>Reset Demo</span>
        </button>
      </div>
    </header>
  );
}
