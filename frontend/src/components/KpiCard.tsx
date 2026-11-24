import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badgeText?: string;
  variant?: 'green' | 'amber' | 'red' | 'default';
}

export default function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  variant = 'default'
}: KpiCardProps) {
  const colorMap = {
    green: {
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-700',
      badge: 'bg-emerald-100 text-emerald-800'
    },
    amber: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-200',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-700',
      badge: 'bg-amber-100 text-amber-800'
    },
    red: {
      bg: 'bg-rose-50/70',
      border: 'border-rose-200',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-700',
      badge: 'bg-rose-100 text-rose-800'
    },
    default: {
      bg: 'bg-white',
      border: 'border-gray-200',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-700',
      badge: 'bg-gray-100 text-gray-800'
    }
  };

  const current = colorMap[variant];

  return (
    <div className={`p-4 rounded-xl border ${current.border} ${current.bg} shadow-sm transition hover:shadow-md flex flex-col justify-between`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{title}</span>
        <div className={`w-8 h-8 rounded-lg ${current.iconBg} flex items-center justify-center ${current.iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold text-gray-900 tracking-tight">{value}</div>
        <div className="flex items-center justify-between mt-1 text-xs">
          {subtitle && <span className="text-gray-500">{subtitle}</span>}
          {badgeText && (
            <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${current.badge}`}>
              {badgeText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
