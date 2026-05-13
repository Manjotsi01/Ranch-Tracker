// src/components/shared/AlertPanel.tsx
import { X, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { formatRelativeTime} from '../../lib/utils';
import type { Alert } from '../../types';

interface AlertPanelProps {
  alerts?:   Alert[];
  onDismiss?: (id: string) => void;
  loading?:  boolean;
  compact?:  boolean;
}

/* Type → visual config */
const TYPE_CONFIG: Record<string, {
  bg: string; border: string; iconColor: string;
  badgeBg: string; badgeText: string;
  Icon: React.FC<{ size?: number }>;
}> = {
  danger: {
    bg: 'rgba(248,113,113,0.07)', border: 'rgba(248,113,113,0.18)',
    iconColor: '#f87171', badgeBg: 'rgba(248,113,113,0.12)', badgeText: '#fca5a5',
    Icon: ({ size }) => <XCircle size={size} />,
  },
  warning: {
    bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.18)',
    iconColor: '#fbbf24', badgeBg: 'rgba(251,191,36,0.12)', badgeText: '#fde68a',
    Icon: ({ size }) => <AlertTriangle size={size} />,
  },
  success: {
    bg: 'rgba(52,211,153,0.07)', border: 'rgba(52,211,153,0.18)',
    iconColor: '#34d399', badgeBg: 'rgba(52,211,153,0.12)', badgeText: '#6ee7b7',
    Icon: ({ size }) => <CheckCircle size={size} />,
  },
  info: {
    bg: 'rgba(96,165,250,0.07)', border: 'rgba(96,165,250,0.18)',
    iconColor: '#60a5fa', badgeBg: 'rgba(96,165,250,0.12)', badgeText: '#93c5fd',
    Icon: ({ size }) => <Info size={size} />,
  },
};

export default function AlertPanel({ alerts = [], onDismiss, loading = false, compact = false }: AlertPanelProps) {

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} aria-busy="true">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: compact ? 50 : 66, borderRadius: 12 }} />
        ))}
      </div>
    );
  }

  /* ── Empty ── */
  if (alerts.length === 0) {
    return (
      <div
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '28px 16px', gap: 10,
        }}
        role="status"
      >
        <div
          style={{
            width: 42, height: 42, borderRadius: '50%',
            background: 'rgba(52,211,153,0.1)',
            border: '1px solid rgba(52,211,153,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <CheckCircle size={20} style={{ color: '#34d399' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#34d399', margin: '0 0 3px' }}>All clear</p>
          <p style={{ fontSize: 12, color: '#4b5e76', margin: 0 }}>No active alerts</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} role="list" aria-label="System alerts">
      {alerts.map(alert => {
        const cfg = TYPE_CONFIG[alert.type] ?? TYPE_CONFIG.info;
        const { Icon } = cfg;

        return (
          <div
            key={alert.id}
            role="listitem"
            className="animate-fade-in"
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: compact ? '10px 12px' : '12px 14px',
              borderRadius: 12,
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              transition: 'box-shadow .15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            {/* Icon */}
            <span style={{ color: cfg.iconColor, flexShrink: 0, marginTop: 1 }} aria-hidden="true">
              <Icon size={14} />
            </span>

            {/* Body */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                {/* Module badge */}
                <span
                  style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    padding: '2px 7px', borderRadius: 20,
                    background: cfg.badgeBg, color: cfg.badgeText,
                    fontFamily: "'Syne', sans-serif",
                  }}
                >
                  {alert.module}
                </span>
                <time style={{ fontSize: 10, color: '#4b5e76' }} dateTime={alert.createdAt}>
                  {formatRelativeTime(alert.createdAt)}
                </time>
              </div>
              <p
                style={{
                  fontSize: compact ? 12 : 12.5,
                  color: '#94a3b8', lineHeight: 1.55, margin: 0,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {alert.message}
              </p>
            </div>

            {/* Dismiss */}
            {onDismiss && (
              <button
                onClick={() => onDismiss(alert.id)}
                aria-label={`Dismiss: ${alert.message}`}
                style={{
                  flexShrink: 0, background: 'transparent', border: 'none',
                  cursor: 'pointer', color: '#2a3a50', padding: 3,
                  borderRadius: 6, display: 'flex', alignItems: 'center',
                  transition: 'color .15s, background .15s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = '#94a3b8';
                  el.style.background = 'rgba(255,255,255,0.06)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = '#2a3a50';
                  el.style.background = 'transparent';
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export { AlertPanel };