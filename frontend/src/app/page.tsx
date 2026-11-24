'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import OverviewDashboard from '@/components/OverviewDashboard';
import PackagingRecordsView from '@/components/PackagingRecordsView';
import DataQualityView from '@/components/DataQualityView';
import { 
  Gauge, 
  AlertTriangle, 
  Sparkles, 
  FileText, 
  History 
} from 'lucide-react';

export default function Home() {
  const [currentTab, setCurrentTab] = useState('overview');
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleResetDemo = async () => {
    try {
      setIsResetting(true);
      const res = await fetch('http://localhost:5000/api/demo/reset', { method: 'POST' });
      if (res.ok) {
        setMessage('Demonstration data successfully reset to baseline 105 synthetic records.');
        setTimeout(() => setMessage(null), 4000);
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === 'import') setCurrentTab('records');
    else if (action === 'assess') setCurrentTab('readiness');
    else if (action === 'report') setCurrentTab('reports');
    else setCurrentTab(action);
  };

  return (
    <div className="flex h-screen bg-[#f8faf9] overflow-hidden text-gray-900 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header 
          onResetDemo={handleResetDemo} 
          onQuickAction={handleQuickAction}
          isResetting={isResetting}
        />

        {message && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-medium">
            {message}
          </div>
        )}

        <main className="p-6 flex-1 max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && (
            <OverviewDashboard onQuickAction={handleQuickAction} />
          )}

          {currentTab === 'records' && (
            <PackagingRecordsView />
          )}

          {currentTab === 'quality' && (
            <DataQualityView onNavigateToRecords={() => setCurrentTab('records')} />
          )}

          {currentTab !== 'overview' && currentTab !== 'records' && currentTab !== 'quality' && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center max-w-2xl mx-auto my-12">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-700 border border-emerald-200 mb-4">
                {currentTab === 'readiness' && <Gauge className="w-6 h-6" />}
                {currentTab === 'gaps' && <AlertTriangle className="w-6 h-6" />}
                {currentTab === 'recommendations' && <Sparkles className="w-6 h-6" />}
                {currentTab === 'reports' && <FileText className="w-6 h-6" />}
                {currentTab === 'audit' && <History className="w-6 h-6" />}
              </div>
              <h2 className="text-lg font-bold text-gray-900 capitalize">
                {currentTab.replace('-', ' ')} Module
              </h2>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                This module is scheduled for development in subsequent phases of the TECHgium project workflow. The <strong>Data Quality Engine</strong>, <strong>Packaging Data Importer</strong>, and <strong>Overview Dashboard</strong> are active and operational.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => setCurrentTab('quality')}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition shadow-sm"
                >
                  View Data Quality Engine
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
