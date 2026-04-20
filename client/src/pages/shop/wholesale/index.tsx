import React, { useEffect, useState } from 'react'
import { Plus, CheckCircle, Clock } from 'lucide-react'
import { useWholesale } from '../../../hooks/useWholesale'

const fmt  = (n: number) => `₹${n.toLocaleString('en-IN')}`
const fmtL = (n: number) => `${n.toFixed(1)} L`
const today = () => new Date().toISOString().slice(0, 10)
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

type Filter = 'ALL' | 'PENDING' | 'RECEIVED'
type FormState = { date: string; buyerName: string; quantityLiters: string; ratePerLiter: string; fat: string; snf: string; notes: string }
const EMPTY: FormState = { date: today(), buyerName: '', quantityLiters: '', ratePerLiter: '', fat: '', snf: '', notes: '' }

const Wholesale: React.FC = () => {
  const { sales, loading, fetchSales, createSale, markReceived } = useWholesale()
  const [filter,   setFilter]  = useState<Filter>('ALL')
  const [showForm, setShowForm] = useState(false)
  const [saving,   setSaving]  = useState(false)
  const [form,     setForm]    = useState<FormState>(EMPTY)
  const [errors,   setErrors]  = useState<Partial<Record<keyof FormState, string>>>({})

  useEffect(() => {
    fetchSales(filter === 'ALL' ? {} : { status: filter })
  }, [fetchSales, filter])

  const preview = (+form.quantityLiters || 0) * (+form.ratePerLiter || 0)

  const validate = () => {
    const e: typeof errors = {}
    if (!form.buyerName.trim())          e.buyerName      = 'Required'
    if (!form.quantityLiters || +form.quantityLiters <= 0) e.quantityLiters = 'Required'
    if (!form.ratePerLiter || +form.ratePerLiter <= 0)     e.ratePerLiter   = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await createSale({
        date:           form.date,
        buyerName:      form.buyerName.trim(),
        quantityLiters: +form.quantityLiters,
        ratePerLiter:   +form.ratePerLiter,
        fat:   form.fat  ? +form.fat  : undefined,
        snf:   form.snf  ? +form.snf  : undefined,
        notes: form.notes || undefined,
      })
      setShowForm(false); setForm(EMPTY); setErrors({})
    } finally { setSaving(false) }
  }

  const set = <K extends keyof FormState>(k: K, v: string) => {
    setForm(p => ({ ...p, [k]: v }))
    setErrors(p => ({ ...p, [k]: undefined }))
  }

  const totalPending = sales.filter(s => s.paymentStatus === 'PENDING').reduce((s, x) => s + x.totalAmount, 0)

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Wholesale Sales</h2>
          {totalPending > 0 && (
            <p className="text-sm text-amber-600 font-semibold mt-0.5 flex items-center gap-1">
              <Clock size={13} /> {fmt(totalPending)} pending payment
            </p>
          )}
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setForm(EMPTY); setErrors({}) }}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus size={14} /> New Sale
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="bg-white border border-blue-100 rounded-2xl p-5 space-y-4 shadow-sm">
          <p className="text-sm font-bold text-slate-800">New Wholesale Sale</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="field-input" />
            </div>
            <div>
              <label className="field-label">Buyer name</label>
              <input value={form.buyerName} onChange={e => set('buyerName', e.target.value)}
                placeholder="Verka, Amul…" className={`field-input ${errors.buyerName ? 'border-red-400' : ''}`} />
              {errors.buyerName && <p className="text-xs text-red-500 mt-0.5">{errors.buyerName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Quantity (L)</label>
              <input type="number" min="0" step="0.1" value={form.quantityLiters}
                onChange={e => set('quantityLiters', e.target.value)}
                placeholder="0" className={`field-input ${errors.quantityLiters ? 'border-red-400' : ''}`} />
              {errors.quantityLiters && <p className="text-xs text-red-500 mt-0.5">{errors.quantityLiters}</p>}
            </div>
            <div>
              <label className="field-label">Rate (₹/L)</label>
              <input type="number" min="0" step="0.5" value={form.ratePerLiter}
                onChange={e => set('ratePerLiter', e.target.value)}
                placeholder="0" className={`field-input ${errors.ratePerLiter ? 'border-red-400' : ''}`} />
              {errors.ratePerLiter && <p className="text-xs text-red-500 mt-0.5">{errors.ratePerLiter}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">FAT % (optional)</label>
              <input type="number" step="0.1" value={form.fat} onChange={e => set('fat', e.target.value)} placeholder="—" className="field-input" />
            </div>
            <div>
              <label className="field-label">SNF % (optional)</label>
              <input type="number" step="0.1" value={form.snf} onChange={e => set('snf', e.target.value)} placeholder="—" className="field-input" />
            </div>
          </div>

          {/* Preview */}
          {preview > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-blue-700 font-medium">Total amount</span>
              <span className="text-base font-bold text-blue-800">{fmt(preview)}</span>
            </div>
          )}

          <div>
            <label className="field-label">Notes (optional)</label>
            <input value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any notes…" className="field-input" />
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setShowForm(false); setErrors({}) }}
              className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 h-10 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save Sale'}
            </button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['ALL', 'PENDING', 'RECEIVED'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={[
              'px-4 py-1.5 rounded-xl text-xs font-bold border transition-colors',
              filter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
            ].join(' ')}>
            {s}
          </button>
        ))}
      </div>

      {/* Sales list */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : sales.length === 0 ? (
        <p className="text-sm text-slate-400 py-10 text-center">No wholesale sales found.</p>
      ) : (
        <div className="space-y-3">
          {sales.map(s => (
            <div key={s._id} className={`bg-white border rounded-2xl px-5 py-4 ${s.paymentStatus === 'PENDING' ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-slate-900">{s.buyerName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {fmtDate(s.date)} · {fmtL(s.quantityLiters)} @ ₹{s.ratePerLiter}/L
                    {s.fat ? ` · FAT ${s.fat}%` : ''}{s.snf ? ` · SNF ${s.snf}%` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="font-bold text-slate-900">{fmt(s.totalAmount)}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    s.paymentStatus === 'PENDING'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>{s.paymentStatus}</span>
                </div>
              </div>
              {s.paymentStatus === 'PENDING' && (
                <button
                  onClick={() => markReceived(s._id)}
                  className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <CheckCircle size={13} /> Mark as received
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Wholesale