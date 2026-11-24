import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  PackageSearch, 
  ShieldCheck, 
  Gauge, 
  AlertTriangle, 
  Sparkles, 
  FileText, 
  History,
  Boxes,
  HelpCircle
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const navigationItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'records', label: 'Packaging Records', icon: PackageSearch },
  { id: 'quality', label: 'Data Quality', icon: ShieldCheck },
  { id: 'readiness', label: 'Readiness Assessment', icon: Gauge },
  { id: 'gaps', label: 'Gap Analysis', icon: AlertTriangle },
  { id: 'recommendations', label: 'Recommendations', icon: Sparkles },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'audit', label: 'Audit Trail', icon: History }
];

export default function Sidebar({ currentTab, onSelectTab }: SidebarProps) {
  return (
    <aside className="w-64 bg-[#0d2818] text-white flex flex-col justify-between shrink-0 shadow-xl border-r border-[#164324]">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#1b4d2b] flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30 text-emerald-300">
            <Boxes className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg text-white tracking-tight">PackReady</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-500 text-[#0d2818]">AI</span>
            </div>
            <p className="text-[10px] text-emerald-200/60 font-mono tracking-wider">TG0900889 • MKCE</p>
          </div>
        </div>

        {/* Project Meta Badge */}
        <div className="mx-4 my-3 p-2.5 rounded-lg bg-[#143d22] border border-emerald-600/30 text-xs text-emerald-100">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-0.5">TECHgium Project</div>
          <p className="text-xs leading-relaxed opacity-90 line-clamp-2">PPWR Data Readiness Evaluation</p>
        </div>

        {/* Navigation Menu */}
        <nav className="px-3 py-2 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold' 
                    : 'text-emerald-100/80 hover:bg-[#164324] hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-emerald-400/80'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Info & Disclaimer */}
      <div className="p-4 border-t border-[#1b4d2b] bg-[#091b10] text-[11px] text-emerald-200/70 space-y-2">
        <div className="flex items-center space-x-2 text-emerald-400">
          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="font-medium text-xs">Prototype Notice</span>
        </div>
        <p className="leading-normal text-[11px]">
          Demonstration prototype. Assessment rules are transparent and rule-based. Non-certified data.
        </p>
        <div className="text-[10px] text-emerald-400/60 pt-1">
          Institution: M. Kumarasamy CE
        </div>
      </div>
    </aside>
  );
}
