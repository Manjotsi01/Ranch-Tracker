// src/components/ui/StatCard.tsx
import { cn, formatCurrency, formatNumber, formatPercent} from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ReactNode } from 'react';

/* ─── Minimal SVG Sparkline ───────────────────────────────────── */
interface SparkProps { data: number[]; color: string; height?: number; }

function Sparkline({ data, color, height = 38 }: SparkProps) {
  if (!data || data.length < 2) return null;
  const W = 84, H = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 5) - 3;
    return [x, y] as [number, number];
  });

  const linePts  = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const areaPath = `M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L')}` +
                   `L${W},${H} L0,${H} Z`;
  const gradId = `sp${color.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <svg
      width={W} height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ overflow: 'visible', flexShrink: 0, display: 'block' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0"    />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <polyline
        points={linePts}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}

/* ─── StatCard ────────────────────────────────────────────────── */
interface StatCardProps {
  label:        string;
  value:        string | number;
  prefix?:      string;
  suffix?:      string;
  trend?:       number;
  trendLabel?:  string;
  icon?:        ReactNode;
  accentColor?: string;
  format?:      'currency' | 'number' | 'raw';
  compact?:     boolean;
  className?:   string;
  loading?:     boolean;
  animIndex?:   number;
  sparkData?:   number[];
}

export default function StatCard({
  label,
  value,
  prefix,
  suffix,
  trend,
  trendLabel,
  icon,
  accentColor = '#14b8a6',
  format      = 'raw',
  compact     = true,
  className,
  loading     = false,
  animIndex   = 0,
  sparkData,
}: StatCardProps) {
  const formattedValue = (() => {
    if (loading) return '';
    if (typeof value === 'number') {
      if (format === 'currency') return formatCurrency(value, compact);
      if (format === 'number')   return formatNumber(value);
    }
    return String(value);
  })();

  const TrendIcon =
    trend === undefined ? null
    : trend > 0  ? TrendingUp
    : trend < 0  ? TrendingDown
    : Minus;

  /* ── Skeleton ── */
  if (loading) {
    return (
      <div
        className={cn('rounded-2xl p-5 border', className)}
        style={{
          background: '#1a2234',
          borderColor: 'rgba(255,255,255,0.06)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.28)',
        }}
      >
        <div className="skeleton h-2.5 w-20 mb-4 rounded" />
        <div className="skeleton h-8 w-28 mb-3 rounded" />
        <div className="skeleton h-2.5 w-16 rounded" />
      </div>
    );
  }

  return (
    <div
      className={cn('relative overflow-hidden group animate-fade-up', className)}
      style={{
        background: 'linear-gradient(145deg, #1a2234 0%, #1e2a3a 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14,
        padding: '20px 20px 16px',
        cursor: 'default',
        animationDelay: `${animIndex * 0.07}s`,
        animationFillMode: 'both',
        transition: 'border-color .2s, box-shadow .2s, transform .2s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = `${accentColor}35`;
        el.style.boxShadow = `0 8px 24px rgba(0,0,0,0.38), 0 0 0 1px ${accentColor}18`;
        el.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'rgba(255,255,255,0.07)';
        el.style.boxShadow = 'none';
        el.style.transform = 'translateY(0)';
      }}
      role="figure"
      aria-label={`${label}: ${formattedValue}${suffix ?? ''}`}
    >
      {/* Ambient glow blob */}
      <div
        style={{
          position: 'absolute', top: -20, right: -20,
          width: 80, height: 80, borderRadius: '50%',
          background: accentColor,
          opacity: 0.06,
          filter: 'blur(22px)',
          transition: 'opacity .3s',
          pointerEvents: 'none',
        }}
        className="group-hover:[&]:opacity-[0.12]"
        aria-hidden="true"
      />

      {/* Top row: label + icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <p
          style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '.12em',
            textTransform: 'uppercase', color: '#4b5e76',
            fontFamily: "'Syne', sans-serif", lineHeight: 1,
          }}
        >
          {label}
        </p>

        {icon && (
          <div
            style={{
              padding: '7px',
              borderRadius: 10,
              background: `${accentColor}16`,
              border: `1px solid ${accentColor}22`,
              color: accentColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              transition: 'background .15s',
            }}
          >
            <span style={{ display: 'block', width: 15, height: 15, color: accentColor }}>
              {icon}
            </span>
          </div>
        )}
      </div>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 14 }}>
        {prefix && (
          <span style={{ fontSize: 15, color: `${accentColor}99`, fontWeight: 600 }}>
            {prefix}
          </span>
        )}
        <span
          style={{
            fontSize: 30, fontWeight: 800, color: '#f1f5f9',
            fontFamily: "'Syne', sans-serif", lineHeight: 1,
            letterSpacing: '-0.6px',
          }}
        >
          {formattedValue}
        </span>
        {suffix && (
          <span style={{ fontSize: 14, color: '#4b5e76', fontWeight: 500 }}>
            {suffix}
          </span>
        )}
      </div>

      {/* Trend + sparkline */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
        <div>
          {trend !== undefined && TrendIcon && (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 11,
              }}
            >
              {/* Trend pill */}
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  padding: '3px 7px', borderRadius: 20,
                  background: trend > 0
                    ? 'rgba(52,211,153,0.1)'
                    : trend < 0
                    ? 'rgba(248,113,113,0.1)'
                    : 'rgba(148,163,184,0.1)',
                  border: `1px solid ${
                    trend > 0 ? 'rgba(52,211,153,0.2)'
                    : trend < 0 ? 'rgba(248,113,113,0.2)'
                    : 'rgba(148,163,184,0.2)'}`,
                  color: trend > 0 ? '#34d399' : trend < 0 ? '#f87171' : '#94a3b8',
                  fontWeight: 700,
                }}
              >
                <TrendIcon style={{ width: 11, height: 11 }} />
                {formatPercent(trend)}
              </span>
              {trendLabel && (
                <span style={{ color: '#4b5e76', fontSize: 10 }}>{trendLabel}</span>
              )}
            </div>
          )}
        </div>

        {sparkData && sparkData.length >= 2 && (
          <div style={{ opacity: 0.75, transition: 'opacity .2s' }} className="group-hover:[&]:opacity-100">
            <Sparkline data={sparkData} color={accentColor} height={38} />
          </div>
        )}
      </div>
    </div>
  );
}

export { StatCard };