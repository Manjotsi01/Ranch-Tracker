import { useEffect, useState } from 'react'
import { useFeeding } from '../../../hooks/useDairyData'
import { Input, Select } from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import { formatCurrency } from '../../../lib/utils'
import { FODDER_TYPES, FODDER_COLORS } from '../../../lib/constant'
import type { FeedingPlan, DailyFeedBreakdown } from '../../../types/index'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface Props { animalId: string; accent: string }

const fodderOpts = FODDER_TYPES.map((f) => ({ value: f.value, label: f.label }))

const EMPTY_PLAN_FORM = {
  fodderType: 'GREEN', fodderName: '', dailyQuantity: '', unit: 'kg', costPerUnit: '',
}

export default function FeedTab({ animalId, accent }: Props) {
  const { summary, feedingPlan, loading, fetch, addFeedRecord, saveFeedingPlan } = useFeeding(animalId)
  const [showLog, setShowLog]   = useState(false)
  const [showPlan, setShowPlan] = useState(false)
  const [saving, setSaving]     = useState(false)

  const [feedForm, setFeedForm] = useState({
    date: '', fodderType: 'GREEN', fodderName: '', quantity: '', costPerKg: '', notes: '',
  })

  // FIX: Track the new items being added in this modal session separately from planForm
  const [planForm, setPlanForm] = useState(EMPTY_PLAN_FORM)
  // FIX: Items queued for this save session (not yet persisted)
  const [pendingItems, setPendingItems] = useState<typeof EMPTY_PLAN_FORM[]>([])
  // Removed unused addedCount state

  useEffect(() => { fetch() }, [fetch])

  const handleLogFeed = async () => {
    if (!feedForm.date || !feedForm.quantity) return
    setSaving(true)
    try {
      await addFeedRecord({
        ...feedForm,
        quantity:  Number(feedForm.quantity),
        costPerKg: feedForm.costPerKg ? Number(feedForm.costPerKg) : undefined,
      })
      setShowLog(false)
      setFeedForm({ date: '', fodderType: 'GREEN', fodderName: '', quantity: '', costPerKg: '', notes: '' })
      fetch()
    } catch { } finally { setSaving(false) }
  }

  // FIX: "Add Item" now just adds to the pendingItems list — does NOT close modal or save.
  const handleAddItemToQueue = () => {
    if (!planForm.fodderName.trim() || !planForm.dailyQuantity) return
    setPendingItems(prev => [...prev, { ...planForm }])
    // Clear the form for the next item, but keep the modal open
    setPlanForm(EMPTY_PLAN_FORM)
  }

  // FIX: "Save Plan" sends ALL existing plan items + all pending items as one PUT.
  // This prevents the upsert from wiping existing items.
  const handleSavePlan = async () => {
    if (pendingItems.length === 0) {
      setShowPlan(false)
      return
    }
    setSaving(true)
    try {
      const plan = feedingPlan as FeedingPlan[]
      // Build merged plan: keep existing items + add pending ones
      const existingPayload = plan.map(p => ({
        fodderType:    p.fodderType,
        fodderName:    p.fodderName,
        dailyQuantity: p.dailyQuantity,
        unit:          p.unit,
        costPerUnit:   p.costPerUnit,
      }))
      const newPayload = pendingItems.map(item => ({
        fodderType:    item.fodderType,
        fodderName:    item.fodderName,
        dailyQuantity: Number(item.dailyQuantity),
        unit:          item.unit,
        costPerUnit:   item.costPerUnit ? Number(item.costPerUnit) : undefined,
      }))

      // The API endpoint expects { items: [...] } — send full merged array
      await saveFeedingPlan({ items: [...existingPayload, ...newPayload] })
      setShowPlan(false)
      setPendingItems([])
      setPlanForm(EMPTY_PLAN_FORM)
      fetch()
    } catch { } finally { setSaving(false) }
  }

  const handleClosePlanModal = () => {
    setShowPlan(false)
    setPendingItems([])
    setPlanForm(EMPTY_PLAN_FORM)
  }

  // Derived daily stats
  const plan = feedingPlan as FeedingPlan[]

  const breakdown: DailyFeedBreakdown[] = (summary as any)?.dailyBreakdown ?? (() => {
    const map = new Map<string, DailyFeedBreakdown>()
    plan.forEach((p) => {
      const key      = p.fodderType
      const existing = map.get(key) || { fodderType: key, totalQuantity: 0, unit: p.unit || 'kg', dailyCost: 0 }
      existing.totalQuantity += p.dailyQuantity
      existing.dailyCost     += p.dailyQuantity * (p.costPerUnit ?? 0)
      map.set(key, existing)
    })
    return Array.from(map.values())
  })()

  const totalDailyKg   = plan.reduce((s, p) => s + (p.unit === 'g' ? p.dailyQuantity / 1000 : p.dailyQuantity), 0)
  const dailyFeedCost  = (summary as any)?.dailyFeedCost ?? breakdown.reduce((s, d) => s + d.dailyCost, 0)
  const monthlyFeedCost = summary?.monthlyFeedCost ?? 0
  const yearlyFeedCost  = summary?.yearlyFeedCost  ?? 0

  const pieData = breakdown.map((d) => ({
    name:  FODDER_TYPES.find(f => f.value === d.fodderType)?.label ?? d.fodderType,
    value: d.totalQuantity,
    color: FODDER_COLORS[d.fodderType] ?? '#94a3b8',
  }))

  return (
    <div style={{ maxWidth: 960 }}>

      {/* Cost summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Daily Feed Cost',   value: formatCurrency(dailyFeedCost),   color: accent    },
          { label: 'Monthly Feed Cost', value: formatCurrency(monthlyFeedCost), color: '#dc2626' },
          { label: 'Yearly Feed Cost',  value: formatCurrency(yearlyFeedCost),  color: '#b45309' },
        ].map((k) => (
          <div key={k.label} style={{
            background: '#fff', borderRadius: 10, padding: '14px 16px',
            border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, margin: '0 0 4px' }}>{k.label}</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: k.color, margin: 0 }}>{loading ? '…' : k.value}</p>
          </div>
        ))}
      </div>

      {/* Daily breakdown */}
      {breakdown.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 18px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 14px' }}>
            📊 Daily Feed Breakdown
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {breakdown.map((d, i) => {
              const color    = FODDER_COLORS[d.fodderType] ?? '#94a3b8'
              const label    = FODDER_TYPES.find(f => f.value === d.fodderType)?.label ?? d.fodderType
              const totalKg  = breakdown.reduce((s, x) => s + (x.unit === 'g' ? x.totalQuantity / 1000 : x.totalQuantity), 0)
              const thisKg   = d.unit === 'g' ? d.totalQuantity / 1000 : d.totalQuantity
              const pct      = totalKg > 0 ? (thisKg / totalKg) * 100 : 0
              return (
                <div key={d.fodderType} style={{
                  padding: '11px 0',
                  borderBottom: i < breakdown.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                        {d.totalQuantity} {d.unit}
                      </span>
                      <span style={{ fontSize: 12, color: '#64748b', minWidth: 70, textAlign: 'right' }}>
                        {formatCurrency(d.dailyCost)}/day
                      </span>
                      <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 36, textAlign: 'right' }}>
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: '#f1f5f9' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #e2e8f0', marginTop: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Daily</span>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{totalDailyKg.toFixed(1)} kg</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>{formatCurrency(dailyFeedCost)}/day</span>
            </div>
          </div>
        </div>
      )}

      {/* Feeding Plan + Pie */}
      <div style={{ display: 'grid', gridTemplateColumns: plan.length > 0 ? '1fr 280px' : '1fr', gap: 16, marginBottom: 20 }}>

        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>Daily Feeding Plan</p>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
                {plan.length} item{plan.length !== 1 ? 's' : ''} · <strong>{totalDailyKg.toFixed(1)} kg/day</strong>
              </p>
            </div>
            <button onClick={() => setShowPlan(true)} style={{
              background: accent + '12', border: `1px solid ${accent}30`, borderRadius: 8,
              padding: '6px 12px', fontSize: 12, fontWeight: 600, color: accent, cursor: 'pointer',
            }}>
              + Add Item
            </button>
          </div>

          {plan.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
              <p style={{ fontSize: 32, margin: '0 0 8px' }}>🌾</p>
              <p style={{ fontSize: 13, margin: '0 0 4px' }}>No feeding plan yet</p>
              <p style={{ fontSize: 12, margin: 0 }}>Add fodder items to build a daily plan</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {plan.map((p, i) => {
                const pct   = totalDailyKg > 0 ? ((p.unit === 'g' ? p.dailyQuantity / 1000 : p.dailyQuantity) / totalDailyKg) * 100 : 0
                const color = FODDER_COLORS[p.fodderType] ?? '#94a3b8'
                const typeLabel = FODDER_TYPES.find(f => f.value === p.fodderType)?.label ?? p.fodderType
                return (
                  <div key={p._id ?? i} style={{ padding: '11px 0', borderBottom: i < plan.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{p.fodderName}</span>
                          <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 6 }}>{typeLabel}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{p.dailyQuantity} {p.unit}</span>
                        {p.costPerUnit != null && (
                          <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
                            {formatCurrency(p.dailyQuantity * p.costPerUnit)}/day
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: '#f1f5f9' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {plan.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 10px' }}>
              Feed Composition
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} kg`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
              {pieData.map((d) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>{d.name}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{d.value} kg</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Log Feed button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button onClick={() => setShowLog(true)} style={{
          background: accent, color: '#fff', border: 'none', borderRadius: 8,
          padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>+ Log Daily Feed</button>
      </div>

      {/* Supplement notice */}
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>💊</span>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e', margin: '0 0 2px' }}>Supplements & Minerals</p>
          <p style={{ fontSize: 12, color: '#a16207', margin: 0 }}>
            Add mineral mixes, bypass fat, bypass protein, or vitamin supplements as <strong>SUPPLEMENT</strong> type items. They are tracked in grams (g) and show separately in the daily breakdown.
          </p>
        </div>
      </div>

      {/* Log Feed Modal */}
      <Modal open={showLog} onClose={() => setShowLog(false)} title="Log Feed Consumption"
        footer={<>
          <button onClick={() => setShowLog(false)} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button onClick={handleLogFeed} disabled={saving} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label="Date *" type="date" value={feedForm.date} onChange={(e) => setFeedForm({ ...feedForm, date: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select label="Fodder Type" options={fodderOpts} value={feedForm.fodderType} onChange={(e) => setFeedForm({ ...feedForm, fodderType: e.target.value })} />
            <Input label="Fodder Name"  value={feedForm.fodderName} onChange={(e) => setFeedForm({ ...feedForm, fodderName: e.target.value })} placeholder="e.g. Napier Grass" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Qty (kg) *"   type="number" step="0.1" value={feedForm.quantity}  onChange={(e) => setFeedForm({ ...feedForm, quantity: e.target.value })} />
            <Input label="Cost/kg (₹)"  type="number" step="0.01" value={feedForm.costPerKg} onChange={(e) => setFeedForm({ ...feedForm, costPerKg: e.target.value })} />
          </div>
          <Input label="Notes" value={feedForm.notes} onChange={(e) => setFeedForm({ ...feedForm, notes: e.target.value })} />
        </div>
      </Modal>

      {/* Plan Item Modal — FIX: allows adding multiple items before saving */}
      <Modal
        open={showPlan}
        onClose={handleClosePlanModal}
        title="Add to Feeding Plan"
        footer={<>
          <button onClick={handleClosePlanModal} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13 }}>
            Cancel
          </button>
          {/* FIX: "Add Another" keeps modal open and queues the item */}
          <button onClick={handleAddItemToQueue} disabled={!planForm.fodderName.trim() || !planForm.dailyQuantity} style={{
            padding: '7px 16px', borderRadius: 8, border: `1px solid ${accent}40`,
            background: accent + '12', color: accent, cursor: 'pointer', fontSize: 13, fontWeight: 600,
            opacity: (!planForm.fodderName.trim() || !planForm.dailyQuantity) ? 0.5 : 1,
          }}>
            + Add Another
          </button>
          {/* FIX: "Save Plan" commits all pending items at once */}
          <button onClick={handleSavePlan} disabled={saving || pendingItems.length === 0} style={{
            padding: '7px 16px', borderRadius: 8, border: 'none',
            background: saving || pendingItems.length === 0 ? '#94a3b8' : accent,
            color: '#fff', cursor: saving || pendingItems.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 600,
          }}>
            {saving ? 'Saving…' : pendingItems.length > 0 ? `Save ${pendingItems.length} Item${pendingItems.length > 1 ? 's' : ''}` : 'Save Plan'}
          </button>
        </>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* FIX: Show pending items queued in this session */}
          {pendingItems.length > 0 && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#166534', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {pendingItems.length} item{pendingItems.length > 1 ? 's' : ''} ready to save
              </p>
              {pendingItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#15803d', marginBottom: 2 }}>
                  <span>{item.fodderName} ({FODDER_TYPES.find(f => f.value === item.fodderType)?.label})</span>
                  <span>{item.dailyQuantity} {item.unit}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select label="Type" options={fodderOpts} value={planForm.fodderType} onChange={(e) => setPlanForm({ ...planForm, fodderType: e.target.value })} />
            <Input label="Name *" value={planForm.fodderName} onChange={(e) => setPlanForm({ ...planForm, fodderName: e.target.value })} placeholder="e.g. Wheat Straw" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Input label="Daily Qty *" type="number" step="0.1"  value={planForm.dailyQuantity} onChange={(e) => setPlanForm({ ...planForm, dailyQuantity: e.target.value })} />
            <Input label="Unit"        value={planForm.unit}     onChange={(e) => setPlanForm({ ...planForm, unit: e.target.value })} placeholder="kg or g" />
            <Input label="Cost/Unit ₹" type="number" step="0.01" value={planForm.costPerUnit}   onChange={(e) => setPlanForm({ ...planForm, costPerUnit: e.target.value })} />
          </div>
          <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>
            💡 Use <strong>g</strong> for supplements/minerals, <strong>kg</strong> for fodder.
            Click <strong>+ Add Another</strong> to queue multiple items before saving.
          </p>
        </div>
      </Modal>
    </div>
  )
}