// client/src/components/shared/ExportBtn.tsx

import { useState } from 'react'
import { Download, FileText, FileSpreadsheet } from 'lucide-react'
import Button from '../ui/Button'

interface ExportBtnProps {
  /** Simple mode — single action, no dropdown */
  onClick?: () => void
  label?: string
  loading?: boolean
  /** Dropdown mode — provide one or both handlers */
  onExportCSV?: () => void
  onExportPDF?: () => void
  className?: string
}

export default function ExportBtn({
  onClick,
  label = 'Export',
  loading = false,
  onExportCSV,
  onExportPDF,
  className = '',
}: ExportBtnProps) {
  const [open, setOpen] = useState(false)

  // Simple mode: no dropdown options provided
  if (!onExportCSV && !onExportPDF) {
    return (
      <Button
        variant="outline"
        size="sm"
        icon={<Download size={13} />}
        loading={loading}
        onClick={onClick}
        className={className}
      >
        {label}
      </Button>
    )
  }

  // Dropdown mode
  return (
    <div className={`relative ${className}`}>
      <Button
        variant="secondary"
        size="sm"
        icon={<Download size={14} />}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-40 bg-white border border-slate-100 rounded-xl shadow-lg py-1 w-44">
            {onExportCSV && (
              <button
                onClick={() => { onExportCSV(); setOpen(false) }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <FileSpreadsheet size={14} className="text-green-600" />
                Export CSV
              </button>
            )}
            {onExportPDF && (
              <button
                onClick={() => { onExportPDF(); setOpen(false) }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <FileText size={14} className="text-red-500" />
                Export PDF
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// Named export for imports that use { ExportBtn }
export { ExportBtn }
