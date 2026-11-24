'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import GuidedDemoBar from '@/components/GuidedDemoBar';
import OverviewDashboard from '@/components/OverviewDashboard';
import PackagingRecordsView from '@/components/PackagingRecordsView';
import DataQualityView from '@/components/DataQualityView';
import DigitalReadinessView from '@/components/DigitalReadinessView';
import GapAnalysisView from '@/components/GapAnalysisView';
import RecommendationsView from '@/components/RecommendationsView';
import ReportsView from '@/components/ReportsView';
import AuditTrailView from '@/components/AuditTrailView';
import { API_BASE } from '@/config';

export default function Home() {
  const [currentTab, setCurrentTab] = useState('overview');
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleResetDemo = async () => {
    try {
      setIsResetting(true);
      const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
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
    <div className="flex h-screen bg-[#f8faf9] overflow-hidden text-gray-900 font-sans flex-col">
      {/* Presentation Mode Guided Walkthrough Bar */}
      <GuidedDemoBar
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Responsive Sidebar (Persistent on Desktop, Slide-out Drawer on Mobile) */}
        <Sidebar 
          currentTab={currentTab} 
          onSelectTab={setCurrentTab}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Header 
            onResetDemo={handleResetDemo} 
            onQuickAction={handleQuickAction}
            isResetting={isResetting}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          />

          {message && (
            <div className="mx-4 sm:mx-6 mt-4 p-3 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-medium">
              {message}
            </div>
          )}

          <main className="p-4 sm:p-6 flex-1 max-w-7xl w-full mx-auto">
            {currentTab === 'overview' && (
              <OverviewDashboard onQuickAction={handleQuickAction} />
            )}

            {currentTab === 'records' && (
              <PackagingRecordsView />
            )}

            {currentTab === 'quality' && (
              <DataQualityView onNavigateToRecords={() => setCurrentTab('records')} />
            )}

            {currentTab === 'readiness' && (
              <DigitalReadinessView />
            )}

            {currentTab === 'gaps' && (
              <GapAnalysisView />
            )}

            {currentTab === 'recommendations' && (
              <RecommendationsView />
            )}

            {currentTab === 'reports' && (
              <ReportsView />
            )}

            {currentTab === 'audit' && (
              <AuditTrailView />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
