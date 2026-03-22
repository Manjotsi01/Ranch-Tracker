// src/components/shared/ExportBtn.tsx
import React, { useState } from 'react'
import { Download, FileText, FileSpreadsheet } from 'lucide-react'
import { Button } from '../../components/ui/Button'

interface ExportBtnProps {
  onExportCSV?: () => void
  onExportPDF?: () => void
  className?: string
}

export const ExportBtn: React.FC<ExportBtnProps> = ({
  onExportCSV, onExportPDF, className = ''
}) => {
  const [open, setOpen] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="secondary"
        size="sm"
        icon={<Download size={14} />}
        onClick={() => setOpen((v) => !v)}
      >
        Export
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
