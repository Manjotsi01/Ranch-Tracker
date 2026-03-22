// client/src/components/ui/Tabs.tsx
import { cn } from '../../lib/utils';
import type { ReactNode } from 'react';

// Support both APIs: {key} (original) and {id} (dairy pages)
export interface Tab {
  key?: string;
  id?: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  // Support both prop names
  active?: string;
  activeTab?: string;
  onChange: (key: string) => void;
  className?: string;
}

export default function Tabs({ tabs, active, activeTab, onChange, className }: TabsProps) {
  const current = activeTab ?? active ?? '';

  return (
    <div className={cn(
      'flex gap-1 rounded-xl bg-surface-3 p-1 border border-agri-800/30 flex-wrap',
      className
    )}>
      {tabs.map((tab) => {
        const tabKey = tab.id ?? tab.key ?? tab.label;
        const isActive = current === tabKey;
        return (
          <button
            key={tabKey}
            onClick={() => onChange(tabKey)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 cursor-pointer',
              isActive
                ? 'bg-agri-700/60 text-agri-100 shadow-sm'
                : 'text-agri-500 hover:text-agri-300 hover:bg-surface-4'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export { Tabs };