// client/src/components/ui/Table.tsx
import { cn } from '../../lib/utils';
import type { ReactNode } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Column<T = any> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface TableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  // Support both API styles
  rowKey?: (row: T) => string;
  keyExtractor?: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  emptyState?: ReactNode;
  className?: string;
  loading?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Table<T = any>({
  columns, data,
  rowKey, keyExtractor,
  onRowClick,
  emptyMessage, emptyState,
  className, loading,
}: TableProps<T>) {
  const getKey = keyExtractor ?? rowKey ?? (() => Math.random().toString());
  const empty  = emptyState ?? emptyMessage ?? 'No records found';

  return (
    <div className={cn('rounded-xl border border-agri-800/30 overflow-hidden', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-agri-800/30 bg-surface-3">
            {columns.map((col) => (
              <th key={col.key}
                className={cn('px-4 py-3 text-left text-xs font-semibold text-agri-500 uppercase tracking-wide whitespace-nowrap', col.headerClassName)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <tr key={i} className="border-b border-agri-800/20">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 w-full rounded bg-agri-800/20 animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-agri-600 text-sm">
                {empty}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={getKey(row)} onClick={() => onRowClick?.(row)}
                className={cn('border-b border-agri-800/20 transition-colors last:border-0',
                  onRowClick && 'cursor-pointer hover:bg-surface-3')}>
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3 text-agri-200', col.className)}>
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export { Table };