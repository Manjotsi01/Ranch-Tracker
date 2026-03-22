// client/src/pages/dairy/tabs/MilkTab.tsx
import { useEffect, useState } from 'react'
import { useMilk, useLactation } from '../../../hooks/useDairyData'
import { Input, Select } from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import { formatDate, formatLiters } from '../../../lib/utils'
import { MILK_SESSIONS } from '../../../lib/constant'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts'
import type { MilkRecord, DailyMilkSummary, Lactation } from '../../../types/index'

interface Props { animalId: string; accent: string }

const sessionOpts = MILK_SESSIONS.map((s) => ({ value: s.value, label: s.label }))

export function MilkTab({ animalId, accent }: Props) {
  const { records, summary, loading, fetchRecords, fetchSummary, addRecord, deleteRecord } = useMilk(animalId)
  const { lactations, fetchLactations, addLactation } = useLactation(animalId)
  const [showLog, setShowLog]           = useState(false)
  const [showLac, setShowLac]           = useState(false)
  const [saving, setSaving]             = useState(false)
  const [chartType, setChartType]       = useState<'area' | 'bar'>('area')
  const [form, setForm] = useState({ date: '', session: 'MORNING', quantity: '', fat: '', snf: '', notes: '' })
  const [lacForm, setLacForm] = useState({ startDate: '', lactationNumber: '' })

  useEffect(() => { fetchRecords(); fetchSummary(); fetchLactations() },
    [fetchRecords, fetchSummary, fetchLactations])

  const totalLiters  = records.reduce((s, r) => s + r.quantity, 0)
  const morningTotal = records.filter(r => r.session === 'MORNING').reduce((s, r) => s + r.quantity, 0)
  const eveningTotal = records.filter(r => r.session === 'EVENING').reduce((s, r) => s + r.quantity, 0)
  const peak         = records.reduce((mx, r) => r.quantity > mx ? r.quantity : mx, 0)
  const avgFat       = records.filter(r => r.fat).length
    ? (records.reduce((s, r) => s + (r.fat ?? 0), 0) / records.filter(r => r.fat).length).toFixed(1)
    : '—'

  const handleLog = async () => {
    setSaving(true)
    try {
      await addRecord({ ...form, quantity: Number(form.quantity), fat: form.fat ? Number(form.fat) : undefined, snf: form.snf ? Number(form.snf) : undefined })
      setShowLog(false)
      setForm({ date: '', session: 'MORNING', quantity: '', fat: '', snf: '', notes: '' })
      fetchRecords(); fetchSummary()
    } catch { } finally { setSaving(false) }
  }

  const handleAddLac = async () => {
    setSaving(true)
    try {
      await addLactation({ ...lacForm, lactationNumber: Number(lacForm.lactationNumber) })
      setShowLac(false); fetchLactations()
    } catch { } finally { setSaving(false) }
  }

  const chartData = (summary as DailyMilkSummary[]).slice(-30)

  return (
    <div style={{ maxWidth: 920 }}>
      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Recorded',  value: formatLiters(totalLiters),  color: accent },
          { label: 'Morning Total',   value: formatLiters(morningTotal),  color: '#f59e0b' },
          { label: 'Evening Total',   value: formatLiters(eveningTotal),  color: '#0891b2' },
          { label: 'Peak Session',    value: formatLiters(peak),          color: '#8b5cf6' },
          { label: 'Avg Fat %',       value: avgFat === '—' ? '—' : `${avgFat}%`, color: '#10b981' },
        ].map((k) => (
          <div key={k.label} style={{
            background: '#fff', borderRadius: 10, padding: '12px 14px',
            border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, margin: '0 0 4px' }}>{k.label}</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: k.color, margin: 0 }}>{loading ? '…' : k.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
          padding: '16px 18px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>Daily Milk Yield</p>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>Last 30 days — morning & evening</p>
            </div>
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 6, padding: 2 }}>
              {(['area', 'bar'] as const).map((ct) => (
                <button key={ct} onClick={() => setChartType(ct)} style={{
                  padding: '4px 10px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                  background: chartType === ct ? '#fff' : 'transparent',
                  color: chartType === ct ? '#0f172a' : '#94a3b8',
                  boxShadow: chartType === ct ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                }}>
                  {ct === 'area' ? '∿ Area' : '▮ Bar'}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            {chartType === 'area' ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="morn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="eve" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} unit="L" />
                <Tooltip formatter={(v) => [`${v}L`]} />
                <Area type="monotone" dataKey="morning" stroke="#f59e0b" fill="url(#morn)" strokeWidth={2} name="Morning" />
                <Area type="monotone" dataKey="evening" stroke="#0891b2" fill="url(#eve)" strokeWidth={2} name="Evening" />
              </AreaChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} unit="L" />
                <Tooltip formatter={(v) => [`${v}L`]} />
                <Bar dataKey="morning" fill="#f59e0b" name="Morning" radius={[2, 2, 0, 0]} />
                <Bar dataKey="evening" fill="#0891b2" name="Evening" radius={[2, 2, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* Actions + Table */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Records <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: 12 }}>({records.length})</span>
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowLac(true)} style={{
            background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8,
            padding: '7px 14px', fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer',
          }}>
            + Lactation
          </button>
          <button onClick={() => setShowLog(true)} style={{
            background: accent, color: '#fff', border: 'none', borderRadius: 8,
            padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            + Log Milk
          </button>
        </div>
      </div>

      {/* Lactation badges */}
      {lactations.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {(lactations as Lactation[]).map((lac) => (
            <div key={lac._id} style={{
              padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: lac.status === 'ACTIVE' ? '#ecfdf5' : '#f8fafc',
              color: lac.status === 'ACTIVE' ? '#065f46' : '#64748b',
              border: `1px solid ${lac.status === 'ACTIVE' ? '#bbf7d0' : '#e2e8f0'}`,
            }}>
              Lact #{lac.lactationNumber} — {lac.status === 'ACTIVE' ? '🟢 Active' : '✓ Done'}
              {lac.totalYield != null && <span style={{ fontWeight: 400, marginLeft: 6 }}>{formatLiters(lac.totalYield)}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Records table */}
      {records.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
          <p style={{ fontSize: 36, margin: '0 0 8px' }}>🥛</p>
          <p style={{ fontSize: 14, margin: 0 }}>No milk records yet. Log the first session!</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Date', 'Session', 'Qty (L)', 'Fat %', 'SNF %', 'Notes', ''].map((h) => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(records as MilkRecord[]).map((r, i) => (
                <tr key={r._id} style={{ borderBottom: i < records.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <td style={{ padding: '9px 14px', color: '#334155', fontWeight: 500 }}>{formatDate(r.date)}</td>
                  <td style={{ padding: '9px 14px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                      background: r.session === 'MORNING' ? '#fefce8' : '#ecfeff',
                      color: r.session === 'MORNING' ? '#78350f' : '#0e7490',
                    }}>
                      {r.session === 'MORNING' ? '☀ Morning' : '🌙 Evening'}
                    </span>
                  </td>
                  <td style={{ padding: '9px 14px', fontWeight: 700, color: accent, fontSize: 14 }}>{r.quantity.toFixed(1)}</td>
                  <td style={{ padding: '9px 14px', color: '#64748b' }}>{r.fat ?? '—'}</td>
                  <td style={{ padding: '9px 14px', color: '#64748b' }}>{r.snf ?? '—'}</td>
                  <td style={{ padding: '9px 14px', color: '#94a3b8', fontSize: 12 }}>{r.notes ?? '—'}</td>
                  <td style={{ padding: '9px 14px' }}>
                    <button onClick={() => deleteRecord(r._id)} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', fontSize: 15,
                    }}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Log Modal */}
      <Modal open={showLog} onClose={() => setShowLog(false)} title="Log Milk Record"
        footer={<>
          <button onClick={() => setShowLog(false)} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button onClick={handleLog} disabled={saving} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            {saving ? 'Saving…' : 'Save Record'}
          </button>
        </>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Date *" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Select label="Session" options={sessionOpts} value={form.session} onChange={(e) => setForm({ ...form, session: e.target.value })} />
          </div>
          <Input label="Quantity (Liters) *" type="number" step="0.1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0.0" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Fat %" type="number" step="0.1" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} placeholder="%" />
            <Input label="SNF %" type="number" step="0.1" value={form.snf} onChange={(e) => setForm({ ...form, snf: e.target.value })} placeholder="%" />
          </div>
          <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional" />
        </div>
      </Modal>

      {/* Lactation Modal */}
      <Modal open={showLac} onClose={() => setShowLac(false)} title="Start Lactation Cycle"
        footer={<>
          <button onClick={() => setShowLac(false)} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button onClick={handleAddLac} disabled={saving} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            {saving ? 'Saving…' : 'Start Lactation'}
          </button>
        </>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label="Lactation Number" type="number" value={lacForm.lactationNumber} onChange={(e) => setLacForm({ ...lacForm, lactationNumber: e.target.value })} />
          <Input label="Start Date" type="date" value={lacForm.startDate} onChange={(e) => setLacForm({ ...lacForm, startDate: e.target.value })} />
        </div>
      </Modal>
    </div>
  )
}