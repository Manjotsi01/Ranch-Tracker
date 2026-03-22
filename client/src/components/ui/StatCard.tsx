// Path: ranch-tracker/client/src/components/ui/StatCard.tsx

import { cn, formatCurrency, formatNumber, formatPercent, getTrendColor } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  format?: 'currency' | 'number' | 'raw';
  compact?: boolean;
  className?: string;
  loading?: boolean;
  animIndex?: number;
}

export default function StatCard({
  label,
  value,
  prefix,
  suffix,
  trend,
  trendLabel,
  icon,
  accentColor = '#4ade80',
  format = 'raw',
  compact = true,
  className,
  loading = false,
  animIndex = 0,
}: StatCardProps) {
  const formattedValue = (() => {
    if (loading) return '';
    if (typeof value === 'number') {
      if (format === 'currency') return formatCurrency(value, compact);
      if (format === 'number') return formatNumber(value);
    }
    return String(value);
  })();

  const TrendIcon = trend === undefined ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;

  if (loading) {
    return (
      <div className={cn(
        'bg-[#111417] border border-[#1e2328] rounded-2xl p-5',
        className
      )}>
        <div className="skeleton h-3 w-20 mb-4" />
        <div className="skeleton h-8 w-28 mb-3" />
        <div className="skeleton h-2.5 w-16" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative bg-[#111417] border border-[#1e2328] rounded-2xl p-5 overflow-hidden',
        'hover:border-[#2a2f36] transition-all duration-300 group cursor-default',
        'animate-fade-up',
        className
      )}
      style={{ animationDelay: `${animIndex * 0.06}s` }}
    >
      {/* Accent glow */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-10 transition-opacity duration-500"
        style={{ background: accentColor }}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <p className="text-xs font-medium text-[#555d66] uppercase tracking-widest font-display">{label}</p>
          {icon && (
            <div
              className="p-2 rounded-xl opacity-80"
              style={{ background: `${accentColor}18` }}
            >
              <span style={{ color: accentColor }} className="block w-4 h-4">{icon}</span>
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-1 mb-3">
          {prefix && <span className="text-sm text-[#555d66]">{prefix}</span>}
          <span className="text-2xl font-bold font-display" style={{ color: accentColor }}>
            {formattedValue}
          </span>
          {suffix && <span className="text-sm text-[#555d66]">{suffix}</span>}
        </div>

        {trend !== undefined && TrendIcon && (
          <div className={cn('flex items-center gap-1.5 text-xs', getTrendColor(trend))}>
            <TrendIcon className="w-3 h-3" />
            <span className="font-medium">{formatPercent(trend)}</span>
            {trendLabel && <span className="text-[#555d66]">{trendLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}