'use client';

import React from 'react';
import { 
  Compass, 
  ChevronRight, 
  ChevronLeft, 
  Presentation
} from 'lucide-react';

interface GuidedDemoBarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onResetDemo: () => void;
  isResetting: boolean;
}

const DEMO_STEPS = [
  { tab: 'overview', stepNumber: 1, title: 'Overview Dashboard', summary: 'View high-level packaging portfolio readiness, material breakdown, and compliance KPI cards.' },
  { tab: 'records', stepNumber: 2, title: 'Data Ingestion & Records', summary: 'Inspect 105 synthetic packaging specifications, download sample CSV, or upload customer packaging data.' },
  { tab: 'quality', stepNumber: 3, title: '10-Rule Data Quality Engine', summary: 'Identify missing weights, missing PCR content, expired evidence, and conflicting records.' },
  { tab: 'readiness', stepNumber: 4, title: '5-Dimension Readiness Engine', summary: 'Score specifications across Completeness, Accuracy, Traceability, Standardization, and Availability.' },
  { tab: 'gaps', stepNumber: 5, title: 'Regulatory Gap Analysis', summary: 'Matrix of identified discrepancies categorized by priority (Critical, High, Moderate, Low).' },
  { tab: 'recommendations', stepNumber: 6, title: 'Corrective Recommendation Engine', summary: 'Execute deterministic remediation workflows and update status from Pending to In Progress to Completed.' },
  { tab: 'reports', stepNumber: 7, title: 'Executive Reporting & Export', summary: 'Review live readiness summary, converter compliance matrix, print view, and export to CSV.' },
  { tab: 'audit', stepNumber: 8, title: 'System Audit Trail', summary: 'Verify real-time chronological activity logging across all user updates and evaluations.' }
];

export default function GuidedDemoBar({ currentTab, onNavigate, onResetDemo, isResetting }: GuidedDemoBarProps) {
  const currentStepIndex = DEMO_STEPS.findIndex(s => s.tab === currentTab);
  const activeStep = currentStepIndex >= 0 ? DEMO_STEPS[currentStepIndex] : DEMO_STEPS[0];

  const handleNext = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      onNavigate(DEMO_STEPS[currentStepIndex + 1].tab);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      onNavigate(DEMO_STEPS[currentStepIndex - 1].tab);
    }
  };

  return (
    <div className="bg-[#091b10] border-b border-[#164324] text-white px-3 sm:px-6 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs z-30 shadow-xs">
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        <div className="flex items-center space-x-1 sm:space-x-1.5 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-semibold text-[10px] sm:text-[11px] shrink-0">
          <Presentation className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="hidden xs:inline">JURY MODE</span>
        </div>

        <div className="flex items-center space-x-1.5 text-emerald-100 truncate">
          <span className="font-bold text-emerald-400 text-[11px] sm:text-xs shrink-0">Step {activeStep.stepNumber}/8:</span>
          <span className="font-semibold text-white truncate text-[11px] sm:text-xs">{activeStep.title}</span>
        </div>
      </div>

      <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
        <button
          onClick={handlePrev}
          disabled={currentStepIndex <= 0}
          className="inline-flex items-center px-2 py-1 rounded border border-[#1b4d2b] bg-[#143d22] text-emerald-200 hover:text-white disabled:opacity-30 transition text-[11px]"
          aria-label="Previous Step"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline ml-0.5">Prev</span>
        </button>

        <button
          onClick={handleNext}
          disabled={currentStepIndex >= DEMO_STEPS.length - 1}
          className="inline-flex items-center px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-500 disabled:opacity-30 transition text-[11px] shadow-xs"
          aria-label="Next Step"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </button>

        <div className="h-3.5 w-px bg-[#1b4d2b] mx-0.5" />

        <button
          onClick={onResetDemo}
          disabled={isResetting}
          title="Restore baseline data"
          className="px-2 py-1 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 hover:bg-amber-500/30 font-semibold text-[10px] sm:text-[11px] transition disabled:opacity-40"
        >
          {isResetting ? 'Resetting...' : 'Reset'}
        </button>
      </div>
    </div>
  );
}
