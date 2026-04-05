// client/src/components/shared/AlertPanel.tsx
import { X, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { getAlertColor, formatRelativeTime, getModuleColor } from '../../lib/utils';
import type { Alert } from '../../types';

interface AlertPanelProps {
  alerts?: Alert[];
  onDismiss?: (id: string) => void;
  loading?: boolean;
}

const AlertIcon = ({ type }: { type: string }) => {
  const cls = 'w-3.5 h-3.5 flex-shrink-0';
  switch (type) {
    case 'danger':  return <XCircle className={cls} />;
    case 'warning': return <AlertTriangle className={cls} />;
    case 'success': return <CheckCircle className={cls} />;
    default:        return <Info className={cls} />;
  }
};

export default function AlertPanel({ alerts = [], onDismiss, loading = false }: AlertPanelProps) {
  if (loading) {
    return (
      <div className="space-y-2" aria-busy="true" aria-label="Loading alerts">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton h-12 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-10 text-center"
        role="status"
        aria-label="No active alerts"
      >
        <CheckCircle className="w-7 h-7 text-emerald-500/25 mb-2" aria-hidden="true" />
        <p className="text-xs text-[#2a4a3a]">All clear — no active alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-2" role="list" aria-label="System alerts">
      {alerts.map(alert => {
        const colors      = getAlertColor(alert.type);
        const moduleColor = getModuleColor(alert.module);

        return (
          <div
            key={alert.id}
            role="listitem"
            className={`
              flex items-start gap-3 p-3 rounded-xl border group
              transition-all duration-200 animate-fade-in
              ${colors.bg} ${colors.border}
            `}
          >
            {/* Icon */}
            <span className={`mt-0.5 flex-shrink-0 ${colors.text}`} aria-hidden="true">
              <AlertIcon type={alert.type} />
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.12em] font-display px-1.5 py-0.5 rounded"
                  style={{ color: moduleColor, background: `${moduleColor}18` }}
                >
                  {alert.module}
                </span>
                <time
                  className="text-[10px] text-[#2a4a3a]"
                  dateTime={alert.createdAt}
                >
                  {formatRelativeTime(alert.createdAt)}
                </time>
              </div>
              <p className={`text-xs leading-relaxed ${colors.text}`}>
                {alert.message}
              </p>
            </div>

            {/* Dismiss */}
            {onDismiss && (
              <button
                onClick={() => onDismiss(alert.id)}
                className="opacity-0 group-hover:opacity-100 text-[#2a4a3a] hover:text-[#6a8a7a] transition-all duration-200 flex-shrink-0 mt-0.5"
                aria-label={`Dismiss alert: ${alert.message}`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export { AlertPanel };
