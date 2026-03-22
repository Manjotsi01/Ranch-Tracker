// ranch-tracker/client/src/components/shared/AlertPanel.tsx

import { X, AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import { getAlertColor, formatRelativeTime, getModuleColor } from "../../lib/utils";
import type { Alert } from "../../types";

interface AlertPanelProps {
  alerts?: Alert[];
  onDismiss?: (id: string) => void;
  loading?: boolean;
}

const AlertIcon = ({ type }: { type: string }) => {
  const props = { className: "w-3.5 h-3.5 flex-shrink-0" };

  switch (type) {
    case "danger":
      return <XCircle {...props} />;
    case "warning":
      return <AlertTriangle {...props} />;
    case "success":
      return <CheckCircle {...props} />;
    default:
      return <Info {...props} />;
  }
};

export default function AlertPanel({
  alerts = [],
  onDismiss,
  loading = false,
}: AlertPanelProps) {
  // Loading state
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-12 w-full" />
        ))}
      </div>
    );
  }

  // Empty state
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <CheckCircle className="w-8 h-8 text-emerald-400/50 mb-2" />
        <p className="text-sm text-[#555d66]">All clear — no active alerts</p>
      </div>
    );
  }

  // Alert list
  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        const colors = getAlertColor(alert.type);
        const moduleColor = getModuleColor(alert.module);

        return (
          <div
            key={alert.id}
            className={`flex items-start gap-3 p-3 rounded-xl border ${colors.bg} ${colors.border} group transition-all duration-200`}
          >
            {/* Alert Icon */}
            <span className={`mt-0.5 ${colors.text}`}>
              <AlertIcon type={alert.type} />
            </span>

            {/* Alert Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="text-[9px] font-bold uppercase tracking-widest font-display px-1.5 py-0.5 rounded"
                  style={{
                    color: moduleColor,
                    background: `${moduleColor}18`,
                  }}
                >
                  {alert.module}
                </span>

                <span className="text-[10px] text-[#555d66]">
                  {formatRelativeTime(alert.createdAt)}
                </span>
              </div>

              <p className={`text-xs leading-relaxed ${colors.text}`}>
                {alert.message}
              </p>
            </div>

            {/* Dismiss Button */}
            {onDismiss && (
              <button
                onClick={() => onDismiss(alert.id)}
                className="opacity-0 group-hover:opacity-100 text-[#555d66] hover:text-[#8a9099] transition-all duration-200 flex-shrink-0 mt-0.5"
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