import React, { useEffect, useState } from 'react'
import { shopApi } from '../../../lib/api'
import type { Expense } from '../../../types'

const today = () => new Date().toISOString().slice(0, 10)
const FIELDS = ['feed', 'labor', 'transport', 'medical', 'misc'] as const
type Field = typeof FIELDS[number]

const ExpensesTab: React.FC = () => {
  const [date,   setDate]   = useState(today())
  const [form,   setForm]   = useState<Record<Field, string>>({ feed: '', labor: '', transport: '', medical: '', misc: '' })
  const [making, setMaking] = useState<{ price: number; milkTotal: number } | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  // Load existing expense and milk stock for this date
  useEffect(() => {
    setSaved(false)
    Promise.all([
      shopApi.getExpenses({ from: date, to: date }),
      shopApi.getMilkStock(date),
    ]).then(([expenses, stock]) => {
      const exp = expenses[0] as Expense | undefined
      if (exp) {
        setForm({ feed: String(exp.feed), labor: String(exp.labor), transport: String(exp.transport), medical: String(exp.medical), misc: String(exp.misc) })
      } else {
        setForm({ feed: '', labor: '', transport: '', medical: '', misc: '' })
      }
      if (stock.collected > 0) {
        const total = exp?.total ?? 0
        setMaking({ price: total > 0 ? +(total / stock.collected).toFixed(2) : 0, milkTotal: stock.collected })
      } else {
        setMaking(null)
      }
    }).catch(() => {})
  }, [date])

  const total = FIELDS.reduce((s, f) => s + (Number(form[f]) || 0), 0)

  const updateMaking = (expTotal: number) => {
    if (making) setMaking({ ...making, price: making.milkTotal > 0 ? +(expTotal / making.milkTotal).toFixed(2) : 0 })
  }

  const handleSave = async () => {
    setSaving(true); setSaved(false)
    try {
      await shopApi.upsertExpense({
        date,
        ...Object.fromEntries(FIELDS.map(f => [f, Number(form[f]) || 0])) as Record<Field, number>
      })
      updateMaking(total)
      setSaved(true)
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-5 max-w-md">
      <div>
        <label className="field-label">Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="field-input" />
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <p className="text-sm font-bold text-slate-700 mb-4">Daily expenses</p>
        <div className="space-y-3">
          {FIELDS.map(field => (
            <div key={field} className="flex items-center gap-4">
              <label className="text-sm text-slate-600 capitalize w-20 shrink-0">{field}</label>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₹</span>
                <input
                  type="number" min={0} value={form[field]}
                  onChange={e => { setForm(p => ({ ...p, [field]: e.target.value })); setSaved(false) }}
                  placeholder="0"
                  className="w-full h-10 pl-7 pr-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
          <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-700">Total</span>
            <span className="text-lg font-bold text-slate-900">₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Making price display */}
      {making && making.milkTotal > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">Making Price</p>
          <p className="text-2xl font-bold text-emerald-800">
            ₹{making.milkTotal > 0 && total > 0 ? (total / making.milkTotal).toFixed(2) : '0'} / litre
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            ₹{total.toLocaleString('en-IN')} ÷ {making.milkTotal.toFixed(1)} L
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 h-10 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-2"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save Expenses'}
        </button>
        {saved && <span className="text-sm text-emerald-600 font-semibold flex items-center gap-1">✓ Saved</span>}
      </div>
    </div>
  )
}

export default ExpensesTab