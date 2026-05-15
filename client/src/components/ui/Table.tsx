// client/src/components/ui/Table.tsx
import { cn } from '../../lib/utils';
import type { ReactNode } from 'react';
import { PackageOpen } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Column<T = any> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  /** Minimum width (px) — helps prevent squishing on mobile */
  minWidth?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface TableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  rowKey?: (row: T) => string;
  keyExtractor?: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  emptyState?: ReactNode;
  className?: string;
  loading?: boolean;
  /** Number of skeleton rows shown while loading */
  skeletonRows?: number;
  caption?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Table<T = any>({
  columns,
  data,
  rowKey,
  keyExtractor,
  onRowClick,
  emptyMessage,
  emptyState,
  className,
  loading,
  skeletonRows = 4,
  caption,
}: TableProps<T>) {
  const getKey = keyExtractor ?? rowKey ?? (() => Math.random().toString());

  return (
    <div className={cn('table-responsive', className)}>
      <table
        className="w-full text-sm"
        style={{ borderCollapse: 'separate', borderSpacing: 0 }}
        aria-busy={loading}
        role="table"
      >
        {caption && <caption className="sr-only">{caption}</caption>}

        <thead>
          <tr
            style={{
              background: 'rgba(255,255,255,0.02)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {columns.map(col => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'px-4 py-3 text-left whitespace-nowrap',
                  'text-[10px] font-bold uppercase tracking-[0.1em] text-[#2a4a3a]',
                  'font-display',
                  col.headerClassName
                )}
                style={{ minWidth: col.minWidth }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* Loading skeleton rows */}
          {loading && Array.from({ length: skeletonRows }).map((_, i) => (
            <tr
              key={`skeleton-${i}`}
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              aria-hidden="true"
            >
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3">
                  <div
                    className="skeleton rounded"
                    style={{
                      height: 14,
                      width: `${50 + Math.random() * 40}%`,
                      maxWidth: '100%',
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}

          {/* Empty state */}
          {!loading && data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-14 text-center">
                {emptyState ?? (
                  <div className="flex flex-col items-center gap-3 text-[#1e3028]">
                    <PackageOpen size={28} className="opacity-40" />
                    <p className="text-sm text-[#2a4a3a]">
                      {emptyMessage ?? 'No records found'}
                    </p>
                  </div>
                )}
              </td>
            </tr>
          )}

          {/* Data rows */}
          {!loading && data.map((row, rowIdx) => (
            <tr
              key={getKey(row)}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'transition-colors duration-100',
                'last:border-0',
                onRowClick && 'cursor-pointer'
              )}
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: 'transparent',
              }}
              onMouseEnter={e => {
                if (onRowClick) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)';
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
              role={onRowClick ? 'button' : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={e => {
                if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onRowClick(row);
                }
              }}
              aria-rowindex={rowIdx + 2}
            >
              {columns.map(col => (
                <td
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-[#8a9aaa]',
                    col.className
                  )}
                >
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { Table };
