'use client';

import React from 'react';
import { Bell, RefreshCw, Upload, FileBarChart, CheckCircle2, ShieldAlert, Menu } from 'lucide-react';

interface HeaderProps {
  onResetDemo: () => void;
  onQuickAction: (action: string) => void;
  isResetting: boolean;
  onOpenMobileMenu?: () => void;
}

export default function Header({ onResetDemo, onQuickAction, isResetting, onOpenMobileMenu }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 sticky top-0 z-20 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Hamburger toggle button for mobile */}
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">PackReady AI</h1>
              <span className="text-[11px] sm:text-xs px-2 py-0.5 font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Enterprise Demonstration
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1">
              Intelligent Packaging Data Readiness Assessment for PPWR Reporting
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons Row - Flex Wrap with responsive touch targets */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => onQuickAction('import')}
          className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 bg-white transition shadow-xs"
        >
          <Upload className="w-3.5 h-3.5 text-emerald-600" />
          <span>Import Data</span>
        </button>

        <button
          onClick={() => onQuickAction('assess')}
          className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition shadow-xs"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Run Assessment</span>
        </button>

        <button
          onClick={() => onQuickAction('report')}
          className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 bg-white transition shadow-xs"
        >
          <FileBarChart className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Generate</span> Report
        </button>

        <button
          onClick={onResetDemo}
          disabled={isResetting}
          title="Reset demonstration data to original 105 synthetic records"
          className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-700 ${isResetting ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Reset</span> Demo
        </button>
      </div>
    </header>
  );
}
