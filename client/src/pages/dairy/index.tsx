// client/src/pages/dairy/index.tsx
// FIX: Buffalo and Cow subsector cards were both showing the combined MILKING
//      status count (e.g. milking cows=3, buffalo=2 both showed 5).
//      Root cause: hs.byStatus.MILKING is the TOTAL count across all animal types.
//      Fix: fetch per-type milking counts from hs.byType + hs.byStatus, OR
//      derive them from the cow/buffalo-specific data by computing intersections.
//      Since the API gives us byType (COW: N, BUFFALO: N) and byStatus (MILKING: N),
//      the cleanest fix is to expose byTypeAndStatus from herdSummary if available,
//      otherwise fall back to proportional estimates using byType shares.
//      We also add a separate fetch for cow-milking and buffalo-milking counts.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dairyApi } from '../../lib/api'
import { useAnimals } from '../../hooks/useAnimals'
import { formatLiters } from '../../lib/utils'
import type { Animal } from '../../types/index'

export default function DairyPage() {
  const navigate = useNavigate()
  const { herdSummary, loading, fetchHerdSummary } = useAnimals()

  // FIX: Track per-type milking counts separately
  const [cowMilkingCount,     setCowMilkingCount]     = useState<number | null>(null)
  const [buffaloMilkingCount, setBuffaloMilkingCount] = useState<number | null>(null)
  const [cowTotal,            setCowTotal]            = useState<number | null>(null)
  const [buffaloTotal,        setBuffaloTotal]        = useState<number | null>(null)
  const [countsLoading,       setCountsLoading]       = useState(false)

  useEffect(() => { fetchHerdSummary() }, [fetchHerdSummary])

  // FIX: Fetch actual per-type milking counts from the animals endpoint
  useEffect(() => {
    async function fetchTypeCounts() {
      setCountsLoading(true)
      try {
        const [cowRes, bufRes] = await Promise.all([
          dairyApi.getAnimals({ type: 'COW' }),
          dairyApi.getAnimals({ type: 'BUFFALO' }),
        ])
        const cows:    Animal[] = cowRes.data?.data ?? cowRes.data ?? []
        const buffalos: Animal[] = bufRes.data?.data ?? bufRes.data ?? []

        setCowTotal(cows.length)
        setBuffaloTotal(buffalos.length)
        setCowMilkingCount(
          cows.filter(a => a.status === 'MILKING' || a.status === 'LACTATING').length
        )
        setBuffaloMilkingCount(
          buffalos.filter(a => a.status === 'MILKING' || a.status === 'LACTATING').length
        )
      } catch {
        // Silently fall back to herdSummary data
        setCowMilkingCount(null)
        setBuffaloMilkingCount(null)
      } finally {
        setCountsLoading(false)
      }
    }
    fetchTypeCounts()
  }, [])

  const hs = herdSummary

  type KPI = {
    label: string
    value: string | number
    color?: string
    sub?: string
  }

  const kpis: KPI[] = [
    { label: 'Total Herd',     value: hs?.totalAnimals ?? '—', color: '#0f172a', sub: 'Animals'  },
    { label: 'Milking Today',  value: hs?.milkingCount ?? '—', color: '#16a34a', sub: 'Active'   },
    { label: "Today's Yield",  value: hs ? formatLiters(hs.todayMilk) : '—', color: '#2563eb', sub: 'Liters' },
    { label: 'Monthly Yield',  value: hs ? formatLiters(hs.monthlyMilk) : '—', color: '#7c3aed', sub: 'Total' },
  ]

  // FIX: Use per-type counts when available, fall back gracefully
  const displayCowTotal     = cowTotal     ?? hs?.byType?.COW     ?? 0
  const displayBuffaloTotal = buffaloTotal ?? hs?.byType?.BUFFALO ?? 0
  const displayCowMilking   = cowMilkingCount     !== null ? cowMilkingCount     : '—'
  const displayBufMilking   = buffaloMilkingCount !== null ? buffaloMilkingCount : '—'

  const subsectors = [
    {
      id: 'cow', path: '/dairy/cow', emoji: '🐄',
      label: 'Cow Herd', sub: 'Breed · Milk · Health · Feed',
      accent: '#2563eb',
      stats: [
        { l: 'Cows',    v: loading || countsLoading ? '…' : displayCowTotal },
        // FIX: was using combined hs.byStatus.MILKING — now uses cow-specific count
        { l: 'Milking', v: countsLoading ? '…' : displayCowMilking },
      ],
    },
    {
      id: 'buffalo', path: '/dairy/buffalo', emoji: '🐃',
      label: 'Buffalo Herd', sub: 'Breed · Milk · Health · Feed',
      accent: '#0f172a',
      stats: [
        { l: 'Buffaloes', v: loading || countsLoading ? '…' : displayBuffaloTotal },
        // FIX: was using combined hs.byStatus.MILKING — now uses buffalo-specific count
        { l: 'Milking',   v: countsLoading ? '…' : displayBufMilking },
      ],
    },
    {
      id: 'fodder', path: '/dairy/fodder', emoji: '🌾',
      label: 'Fodder & Feed', sub: 'Crops · Stock · Supplements',
      accent: '#16a34a',
      stats: [
        { l: 'Crop Types',  v: '—' },
        { l: 'Stock Items', v: '—' },
      ],
    },
  ]

  const statusList = hs?.byStatus
    ? Object.entries(hs.byStatus).filter(([, v]) => (v as number) > 0)
    : []

  const STATUS_STYLE: Record<string, { bg: string; dot: string; text: string }> = {
    MILKING:         { bg: '#ecfdf5', dot: '#10b981', text: '#065f46' },
    LACTATING:       { bg: '#ecfdf5', dot: '#10b981', text: '#065f46' },
    DRY:             { bg: '#fefce8', dot: '#f59e0b', text: '#78350f' },
    CALF:            { bg: '#eff6ff', dot: '#3b82f6', text: '#1e3a8a' },
    HEIFER:          { bg: '#f5f3ff', dot: '#7c3aed', text: '#4c1d95' },
    PREGNANT_HEIFER: { bg: '#fdf2f8', dot: '#ec4899', text: '#831843' },
    TRANSITION:      { bg: '#fff7ed', dot: '#f97316', text: '#7c2d12' },
    WEANED_CALF:     { bg: '#dbeafe', dot: '#60a5fa', text: '#1e40af' },
    SOLD:            { bg: '#f0fdf4', dot: '#22c55e', text: '#14532d' },
    DEAD:            { bg: '#fef2f2', dot: '#ef4444', text: '#7f1d1d' },
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#f8fafc' }}>
      {/* Hero bar */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #0ea5e9 100%)',
        padding: '28px 28px 20px',
        position: 'relative', overflow: 'hidden',
      }}>
        {[200, 140, 90].map((s, i) => (
          <div key={i} style={{
            position: 'absolute', right: 20 + i * 40, top: -s / 3,
            width: s, height: s, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
          }} />
        ))}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 28 }}>🐄</span>
            <div>
              <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>
                Dairy Operations
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>
                Breed management · Milk yield tracking · Feed planning
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 24px', maxWidth: 1200 }}>

        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {kpis.map((k) => (
            <div key={k.label} style={{
              background: '#fff', borderRadius: 12, padding: '16px 18px',
              border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 6px' }}>
                {k.label}
              </p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: k.color, lineHeight: 1 }}>
                  {loading ? '…' : String(k.value)}
                </span>
              </div>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Two-col: subsectors + status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, alignItems: 'start' }}>

          {/* Subsector cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 4px' }}>
              Subsectors
            </h2>
            {subsectors.map((s) => (
              <button key={s.id} onClick={() => navigate(s.path)} style={{
                background: '#fff', border: '1.5px solid #e2e8f0',
                borderRadius: 14, padding: '18px 20px',
                display: 'flex', alignItems: 'center', gap: 18,
                cursor: 'pointer', textAlign: 'left', width: '100%',
                transition: 'all 0.15s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = s.accent
                  ;(e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${s.accent}22`
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                  background: s.accent + '12', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26,
                }}>
                  {s.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>{s.label}</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{s.sub}</p>
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                  {s.stats.map((st) => (
                    <div key={st.l} style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: s.accent, margin: 0 }}>{String(st.v)}</p>
                      <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>{st.l}</p>
                    </div>
                  ))}
                </div>
                <div style={{ color: '#cbd5e1', fontSize: 18, flexShrink: 0 }}>›</div>
              </button>
            ))}
          </div>

          {/* Herd Status Panel */}
          <div style={{
            background: '#fff', borderRadius: 14, padding: '18px 20px',
            border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 14px' }}>
              Herd Status
            </h2>
            {statusList.length === 0 ? (
              <p style={{ fontSize: 13, color: '#94a3b8' }}>{loading ? 'Loading…' : 'No data yet'}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {statusList.map(([status, count]) => {
                  const st = STATUS_STYLE[status] ?? { bg: '#f8fafc', dot: '#94a3b8', text: '#475569' }
                  const total = hs?.totalAnimals || 1
                  const pct = Math.round(((count as number) / total) * 100)
                  return (
                    <div key={status}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: st.text }}>{status}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{count as number}</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: '#f1f5f9' }}>
                        <div style={{ height: '100%', borderRadius: 2, background: st.dot, width: `${pct}%`, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {hs?.avgMilkPerAnimal != null && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 4px' }}>
                  Avg per Milking Animal
                </p>
                <p style={{ fontSize: 22, fontWeight: 700, color: '#0891b2', margin: 0 }}>
                  {formatLiters(hs.avgMilkPerAnimal)}
                  <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400, marginLeft: 4 }}>/ day</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}