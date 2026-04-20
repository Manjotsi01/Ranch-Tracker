import React, { useEffect, useState } from 'react'
import { Plus, Droplets } from 'lucide-react'
import { useMilk } from '../../../hooks/useMilk'

const today  = () => new Date().toISOString().slice(0, 10)
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

type FormState = {
  date: string; shift: 'MORNING' | 'EVENING'; quantityLiters: string
  fat: string; snf: string; source: 'OWN' | 'PURCHASED'; notes: string
}

const EMPTY: FormState = {
  date: today(), shift: 'MORNING', quantityLiters: '',
  fat: '', snf: '', source: 'OWN', notes: '',
}

const MilkTab: React.FC = () => {
  const { entries, stock, loading, fetchEntries, fetchStock, addEntry } = useMilk()
  const [showForm, setShowForm] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [form,     setForm]     = useState<FormState>(EMPTY)
  const [errors,   setErrors]   = useState<Partial<Record<keyof FormState, string>>>({})

  useEffect(() => { fetchEntries(); fetchStock(today()) }, [fetchEntries, fetchStock])

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm(p => ({ ...p, [key]: val }))
    setErrors(p => ({ ...p, [key]: undefined }))
  }

  const validate = (): boolean => {
    const e: typeof errors = {}
    if (!form.quantityLiters || +form.quantityLiters <= 0) e.quantityLiters = 'Required'
    if (form.fat && (+form.fat < 0 || +form.fat > 10)) e.fat = '0–10'
    if (form.snf && (+form.snf < 0 || +form.snf > 15)) e.snf = '0–15'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await addEntry({
        date: form.date, shift: form.shift,
        quantityLiters: +form.quantityLiters,
        fat:   form.fat   ? +form.fat   : undefined,
        snf:   form.snf   ? +form.snf   : undefined,
        source: form.source,
        notes:  form.notes || undefined,
      })
      setShowForm(false)
      setForm(EMPTY)
      fetchStock(today())
    } catch { /* error shown via hook */ }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      {/* Stock summary */}
      {stock && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Collected today', value: `${stock.collected.toFixed(1)} L`, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Wholesaled',      value: `${stock.wholesaled.toFixed(1)} L`, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Available',       value: `${stock.available.toFixed(1)} L`,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-sm font-semibold text-slate-700">
          {entries.length > 0 ? `${entries.length} recent entries` : 'No entries yet'}
        </p>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus size={14} /> Add Entry
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="bg-white border border-blue-100 rounded-2xl p-5 space-y-4 shadow-sm">
          <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Droplets size={15} className="text-blue-500" /> New Milk Entry
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="field-input" />
            </Field>
            <Field label="Shift">
              <select value={form.shift} onChange={e => set('shift', e.target.value as 'MORNING' | 'EVENING')}
                className="field-input">
                <option value="MORNING">Morning</option>
                <option value="EVENING">Evening</option>
              </select>
            </Field>
          </div>

          <Field label="Quantity (Liters)" error={errors.quantityLiters}>
            <input type="number" min="0" step="0.1" value={form.quantityLiters}
              onChange={e => set('quantityLiters', e.target.value)}
              placeholder="e.g. 80"
              className={`field-input ${errors.quantityLiters ? 'border-red-400' : ''}`} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="FAT %" error={errors.fat}>
              <input type="number" step="0.1" value={form.fat}
                onChange={e => set('fat', e.target.value)}
                placeholder="Optional"
                className={`field-input ${errors.fat ? 'border-red-400' : ''}`} />
            </Field>
            <Field label="SNF %" error={errors.snf}>
              <input type="number" step="0.1" value={form.snf}
                onChange={e => set('snf', e.target.value)}
                placeholder="Optional"
                className={`field-input ${errors.snf ? 'border-red-400' : ''}`} />
            </Field>
          </div>

          <Field label="Source">
            <select value={form.source} onChange={e => set('source', e.target.value as 'OWN' | 'PURCHASED')}
              className="field-input">
              <option value="OWN">Own herd</option>
              <option value="PURCHASED">Purchased</option>
            </select>
          </Field>

          <Field label="Notes (optional)">
            <input type="text" value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Any notes…"
              className="field-input" />
          </Field>

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => { setShowForm(false); setForm(EMPTY); setErrors({}) }}
              className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 h-10 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save Entry'}
            </button>
          </div>
        </div>
      )}

      {/* Entries list */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 && !showForm ? (
        <div className="py-12 text-center">
          <Droplets size={32} className="text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No milk entries yet</p>
          <p className="text-xs text-slate-300 mt-1">Add morning or evening shift</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map(e => (
            <div key={e._id} className="bg-white border border-slate-100 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">{fmtDate(e.date)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    e.shift === 'MORNING' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                  }`}>{e.shift}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">{e.source}</span>
                </div>
                {(e.fat || e.snf) && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {e.fat ? `FAT ${e.fat}%` : ''}{e.fat && e.snf ? ' · ' : ''}{e.snf ? `SNF ${e.snf}%` : ''}
                  </p>
                )}
              </div>
              <p className="text-base font-bold text-blue-600">{e.quantityLiters} L</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const Field: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({ label, error, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

export default MilkTab