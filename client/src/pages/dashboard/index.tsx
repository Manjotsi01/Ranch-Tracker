// src/pages/dashboard/index.tsx
import { useOutletContext } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Milk, Activity, AlertTriangle,
  IndianRupee, Sprout, Scale, Wallet, CalendarDays, Leaf,
  ShoppingCart, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import AlertPanel from '../../components/shared/AlertPanel';
import StatCard from '../../components/ui/StatCard';
import { useDashboard } from '../../hooks/useDashboard';
import { formatCurrency, formatRelativeTime, getModuleColor } from '../../lib/utils';
import type { ModuleKPI, ActivityItem } from '../../types';

/* ─── Helpers ─────────────────────────────────────────────── */
const fc = (n: number) => formatCurrency(n, true);

/* ─── Chart tooltip ───────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p style={{ color: '#4b5e76', fontSize: 11, marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, flexShrink: 0, display: 'inline-block' }} />
          <span style={{ color: '#64748b', fontSize: 11, textTransform: 'capitalize' }}>{p.name}:</span>
          <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 11, marginLeft: 'auto' }}>{fc(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Section heading ─────────────────────────────────────── */
function SectionHead({ label }: { label: string }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '.14em',
      textTransform: 'uppercase', color: '#4b5e76',
      fontFamily: "'Syne', sans-serif", marginBottom: 14,
    }}>
      {label}
    </p>
  );
}

/* ─── Card wrapper ────────────────────────────────────────── */
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'linear-gradient(145deg, #1a2234 0%, #1e2a3a 100%)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14,
      padding: '18px 20px',
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── Card header row ─────────────────────────────────────── */
function CardHead({
  title, sub, right,
}: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', fontFamily: "'Syne', sans-serif", letterSpacing: '-.1px' }}>
          {title}
        </p>
        {sub && <p style={{ fontSize: 11, color: '#4b5e76', marginTop: 3 }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

/* ─── Period toggle ───────────────────────────────────────── */
function PeriodToggle({ value, onChange }: { value: string; onChange: (v: 'week' | 'month' | 'year') => void }) {
  return (
    <div style={{
      display: 'flex', background: '#111827',
      borderRadius: 20, padding: 3, gap: 2,
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      {(['Week', 'Month', 'Year'] as const).map(p => {
        const v = p.toLowerCase() as 'week' | 'month' | 'year';
        const on = value === v;
        return (
          <button
            key={p}
            onClick={() => onChange(v)}
            style={{
              padding: '4px 11px', border: 'none', borderRadius: 20, cursor: 'pointer',
              fontSize: 10, fontWeight: 700, fontFamily: "'Syne', sans-serif",
              background: on ? 'rgba(20,184,166,0.18)' : 'transparent',
              color: on ? '#14b8a6' : '#4b5e76',
              transition: 'all .15s',
            }}
          >
            {p}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Progress bar ────────────────────────────────────────── */
function ProgressRow({
  label, sub, value, max, color,
}: { label: string; sub?: string; value: number; max?: number; color: string }) {
  const pct = Math.min(Math.round((value / (max || Math.max(value, 1))) * 100), 100);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "'Syne', sans-serif" }}>
          {sub || `${pct}%`}
        </span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

/* ─── Module KPI bar ──────────────────────────────────────── */
function ModuleBar({ kpi }: { kpi: ModuleKPI }) {
  const color   = getModuleColor(kpi.module);
  const pos     = kpi.profit >= 0;
  const revPct  = Math.min((kpi.revenue / Math.max(kpi.revenue, 1)) * 100, 100);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: color, display: 'inline-block', flexShrink: 0,
            boxShadow: `0 0 6px ${color}66`,
          }} />
          <span style={{ fontSize: 12, color: '#94a3b8', textTransform: 'capitalize', fontFamily: "'DM Sans', sans-serif" }}>
            {kpi.module}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: '#4b5e76' }}>Rev: {fc(kpi.revenue)}</span>
          <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 700, color: pos ? '#34d399' : '#f87171', fontFamily: "'Syne', sans-serif" }}>
            {pos ? '+' : ''}{fc(kpi.profit)}
          </span>
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${revPct}%`, background: color, opacity: 0.8 }} />
      </div>
    </div>
  );
}

/* ─── Activity item ───────────────────────────────────────── */
function ActivityRow({ item }: { item: ActivityItem }) {
  const color = getModuleColor(item.module);
  const pos   = (item.amount ?? 0) >= 0;

  return (
    <div style={{
      display: 'flex', gap: 10, paddingBottom: 12,
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      alignItems: 'flex-start', marginBottom: 2,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: `${color}14`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: 1,
      }}>
        <Activity size={12} style={{ color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{item.description}</p>
        <p style={{ fontSize: 10, color: '#4b5e76', marginTop: 3 }}>{formatRelativeTime(item.createdAt)}</p>
      </div>
      {item.amount !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          {pos
            ? <ArrowUpRight size={12} style={{ color: '#34d399' }} />
            : <ArrowDownRight size={12} style={{ color: '#f87171' }} />
          }
          <span style={{
            fontSize: 12, fontWeight: 700, fontFamily: "'Syne', sans-serif",
            color: pos ? '#34d399' : '#f87171',
          }}>
            {fc(Math.abs(item.amount))}
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Empty state ─────────────────────────────────────────── */
function Empty({ msg }: { msg: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0', gap: 8 }}>
      <Activity size={15} style={{ color: '#2a3548' }} />
      <span style={{ fontSize: 12, color: '#4b5e76' }}>{msg}</span>
    </div>
  );
}

/* ─── Stat mini-pill ──────────────────────────────────────── */
function MiniStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{
      background: `${color}0d`,
      border: `1px solid ${color}20`,
      borderRadius: 10, padding: '10px 14px',
    }}>
      <p style={{ fontSize: 10, color: '#4b5e76', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 16, fontWeight: 800, color, fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{value}</p>
    </div>
  );
}

/* ─── Sparkline array for KPI cards (derived from profitChart) ── */
function useSparklines(profitChart: any[]) {
  if (!profitChart.length) return { revSpark: [], expSpark: [], profSpark: [] };
  return {
    revSpark:  profitChart.slice(-8).map(d => d.revenue  || 0),
    expSpark:  profitChart.slice(-8).map(d => d.expenses || 0),
    profSpark: profitChart.slice(-8).map(d => d.profit   || 0),
  };
}

/* ═══════════════════════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  useOutletContext<{ setMobileOpen: (v: boolean) => void }>();

  const {
    stats, kpis, alerts, profitChart, recentActivity,
    period, loading, error, setPeriod, dismissAlert, refetch,
  } = useDashboard();

  const L = loading && !stats;
  const { revSpark, expSpark, profSpark } = useSparklines(profitChart);
  const warnCount = alerts.filter(a => a.type === 'danger' || a.type === 'warning').length;

  /* Pie data from KPIs */
  const PIE_COLORS = ['#34d399', '#38bdf8', '#fbbf24', '#a78bfa', '#f87171'];
  const pieData = kpis.filter(k => k.revenue > 0).map((k, i) => ({
    name: k.module, value: k.revenue, color: PIE_COLORS[i % PIE_COLORS.length],
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingBottom: 32 }}>

      {/* ── Error banner ─────────────────────────────── */}
      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(248,113,113,0.08)',
          border: '1px solid rgba(248,113,113,0.2)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <AlertTriangle size={14} style={{ color: '#f87171', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#fca5a5', flex: 1 }}>{error}</span>
          <button
            onClick={refetch}
            style={{
              fontSize: 11, color: '#f87171',
              background: 'rgba(248,113,113,0.12)',
              border: '1px solid rgba(248,113,113,0.25)',
              borderRadius: 7, padding: '4px 12px', cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Farm Hero ─────────────────────────────────── */}
      <div style={{
        padding: '24px 26px',
        background: 'linear-gradient(110deg, #0d1f16 0%, #0c1a2e 100%)',
        borderRadius: 16,
        border: '1px solid rgba(20,184,166,0.12)',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 14,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative glow */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(16,185,129,0.3)',
              fontSize: 18,
            }}>🌾</div>
            <div>
              <h1 style={{
                fontSize: 22, fontWeight: 800, color: '#f1f5f9',
                fontFamily: "'Syne', sans-serif",
                letterSpacing: '-.4px', lineHeight: 1,
              }}>
                Nandha Farm
              </h1>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(20,184,166,.75)', fontFamily: "'Syne', sans-serif", marginTop: 1 }}>
                ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਸਰਦਾਰ ਜੀ
              </p>
            </div>
          </div>
          <p style={{ fontSize: 12, color: '#4b5e76', marginTop: 6 }}>
            Fatehpur · Samana · Patiala, Punjab, India
          </p>
        </div>

        {/* Status tags */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: '● Live', color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
            { label: `${stats?.todayMilkLiters ?? '—'}L today`, color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.2)' },
            { label: `${stats?.activeCrops ?? '—'} crops`, color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.15)' },
            { label: `${stats?.herdSize ?? '—'} animals`, color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.18)' },
          ].map(tag => (
            <span key={tag.label} style={{
              fontSize: 11, fontWeight: 600, color: tag.color,
              padding: '5px 12px',
              background: tag.bg,
              border: `1px solid ${tag.border}`,
              borderRadius: 20,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {tag.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── KPI cards ─────────────────────────────────── */}
      <section aria-label="Financial KPIs">
        <SectionHead label="Financial Overview" />
        <div className="kpi-grid stagger">
          <StatCard
            label="Total Revenue"
            value={stats?.totalRevenue ?? 0}
            format="currency"
            compact
            icon={<TrendingUp size={15} />}
            accentColor="#38bdf8"
            trend={8.4}
            trendLabel="vs last month"
            sparkData={revSpark}
            loading={L}
            animIndex={0}
          />
          <StatCard
            label="Total Expenses"
            value={stats?.totalExpenses ?? 0}
            format="currency"
            compact
            icon={<TrendingDown size={15} />}
            accentColor="#f87171"
            trend={-3.1}
            trendLabel="vs last month"
            sparkData={expSpark}
            loading={L}
            animIndex={1}
          />
          <StatCard
            label="Net Profit"
            value={stats?.netProfit ?? 0}
            format="currency"
            compact
            icon={<IndianRupee size={15} />}
            accentColor="#34d399"
            trend={12.6}
            trendLabel="vs last month"
            sparkData={profSpark}
            loading={L}
            animIndex={2}
          />
          <StatCard
            label="Today's Milk"
            value={stats?.todayMilkLiters ?? 0}
            suffix=" L"
            icon={<Milk size={15} />}
            accentColor="#14b8a6"
            trend={4.2}
            trendLabel="vs yesterday"
            loading={L}
            animIndex={3}
          />
          <StatCard
            label="Active Seasons"
            value={stats?.activeSeasons ?? 0}
            icon={<Sprout size={15} />}
            accentColor="#6ee7b7"
            trend={0}
            trendLabel="no change"
            loading={L}
            animIndex={4}
          />
        </div>
      </section>

      {/* ── Operations KPIs ───────────────────────────── */}
      <section aria-label="Operations KPIs">
        <SectionHead label="Operations" />
        <div className="kpi-grid stagger">
          <StatCard
            label="Herd Size"
            value={stats?.herdSize ?? 0}
            suffix={` animals`}
            icon={<Scale size={15} />}
            accentColor="#38bdf8"
            loading={L}
            animIndex={0}
          />
          <StatCard
            label="Cows"
            value={stats?.cowCount ?? 0}
            icon={<Leaf size={15} />}
            accentColor="#6ee7b7"
            loading={L}
            animIndex={1}
          />
          <StatCard
            label="Buffalo"
            value={stats?.buffaloCount ?? 0}
            icon={<Activity size={15} />}
            accentColor="#14b8a6"
            loading={L}
            animIndex={2}
          />
          <StatCard
            label="Pending Wages"
            value={stats?.pendingWages ?? 0}
            format="currency"
            compact
            icon={<Wallet size={15} />}
            accentColor="#a78bfa"
            loading={L}
            animIndex={3}
          />
          <StatCard
            label="All Seasons"
            value={stats?.allSeasons ?? 0}
            icon={<CalendarDays size={15} />}
            accentColor="#fbbf24"
            loading={L}
            animIndex={4}
          />
        </div>
      </section>

      {/* ── Charts row ────────────────────────────────── */}
      <section aria-label="Analytics charts">
        <SectionHead label="Analytics" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14 }}>

          {/* Revenue vs Expenses area chart */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', fontFamily: "'Syne', sans-serif" }}>
                  Revenue vs Expenses
                </p>
                <p style={{ fontSize: 11, color: '#4b5e76', marginTop: 3 }}>Financial trend over time</p>
              </div>
              <PeriodToggle value={period} onChange={setPeriod} />
            </div>

            {L ? (
              <div className="skeleton" style={{ height: 170, borderRadius: 10 }} />
            ) : !profitChart.length ? (
              <Empty msg="No chart data for this period" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={170}>
                  <AreaChart data={profitChart} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#38bdf8" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0}    />
                      </linearGradient>
                      <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#f87171" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#f87171" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#4b5e76', fontSize: 10, fontFamily: "'DM Sans', sans-serif" }}
                      axisLine={false} tickLine={false} dy={5}
                    />
                    <YAxis
                      tick={{ fill: '#4b5e76', fontSize: 10, fontFamily: "'DM Sans', sans-serif" }}
                      axisLine={false} tickLine={false}
                      tickFormatter={fc} width={48}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="revenue"  stroke="#38bdf8" strokeWidth={2}   fill="url(#gradRev)" dot={false} activeDot={{ r: 4, fill: '#38bdf8' }} />
                    <Area type="monotone" dataKey="expenses" stroke="#f87171" strokeWidth={1.5} fill="url(#gradExp)" dot={false} activeDot={{ r: 4, fill: '#f87171' }} />
                  </AreaChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div style={{ display: 'flex', gap: 18, marginTop: 12 }}>
                  {[['Revenue', '#38bdf8'], ['Expenses', '#f87171']].map(([l, c]) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 20, height: 2, background: c, borderRadius: 2, display: 'inline-block' }} />
                      <span style={{ fontSize: 11, color: '#4b5e76' }}>{l}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>

          {/* Revenue distribution donut */}
          <Card>
            <CardHead title="Revenue Share" sub="By module" />
            {L ? (
              <div className="skeleton" style={{ height: 170, borderRadius: 10 }} />
            ) : !pieData.length ? (
              <Empty msg="No revenue data" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      innerRadius={36} outerRadius={56}
                      paddingAngle={3} dataKey="value" stroke="none"
                    >
                      {pieData.map((d, i) => <Cell key={i} fill={d.color} opacity={0.88} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => fc(v)} />
                  </PieChart>
                </ResponsiveContainer>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  {pieData.map(d => (
                    <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
                        <span style={{ fontSize: 12, color: '#94a3b8', textTransform: 'capitalize' }}>{d.name}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: d.color, fontFamily: "'Syne', sans-serif" }}>
                        {fc(d.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>
      </section>

      {/* ── Module overview cards ──────────────────────── */}
      <section aria-label="Module overviews">
        <SectionHead label="Module Overview" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>

          {/* Agriculture */}
          <Card>
            <CardHead
              title="Agriculture"
              sub="Crops & seasons"
              right={
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                  <Leaf size={11} style={{ color: '#34d399' }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#34d399' }}>
                    {stats?.activeCrops ?? '—'} active
                  </span>
                </div>
              }
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <MiniStat label="Active Seasons" value={stats?.activeSeasons ?? '—'} color="#34d399" />
              <MiniStat label="All Seasons"    value={stats?.allSeasons ?? '—'}    color="#6ee7b7" />
            </div>
            <ProgressRow label="Kanak (Wheat)"  sub="Planned → Active"   value={72} color="#34d399" />
            <ProgressRow label="Jhona (Rice)"   sub="Active"             value={55} color="#6ee7b7" />
            <ProgressRow label="Makki (Maize)"  sub="Harvested"          value={90} color="#fbbf24" />
          </Card>

          {/* Dairy */}
          <Card>
            <CardHead
              title="Dairy"
              sub="Herd & milk"
              right={
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}>
                  <Milk size={11} style={{ color: '#38bdf8' }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#38bdf8' }}>
                    {stats?.herdSize ?? '—'} head
                  </span>
                </div>
              }
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <MiniStat label="Cows"       value={stats?.cowCount     ?? '—'} color="#38bdf8" />
              <MiniStat label="Buffalo"    value={stats?.buffaloCount ?? '—'} color="#14b8a6" />
              <MiniStat label="Today Milk" value={`${stats?.todayMilkLiters ?? '—'}L`} color="#34d399" />
              <MiniStat label="Herd Size"  value={stats?.herdSize     ?? '—'} color="#6ee7b7" />
            </div>
            <p style={{ fontSize: 10, color: '#4b5e76', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>
              Milk output trend
            </p>
            {L
              ? <div className="skeleton" style={{ height: 36 }} />
              : profitChart.length > 0 && (
                <ResponsiveContainer width="100%" height={40}>
                  <AreaChart data={profitChart} margin={{ top: 2, right: 2, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradMilk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#38bdf8" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="revenue" stroke="#38bdf8" strokeWidth={1.5} fill="url(#gradMilk)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )
            }
          </Card>

          {/* Shop */}
          <Card>
            <CardHead
              title="Shop & POS"
              sub="Sales & processing"
              right={
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                  <ShoppingCart size={11} style={{ color: '#fbbf24' }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#fbbf24' }}>Today</span>
                </div>
              }
            />
            {kpis.filter(k => k.module === 'shop').map(k => (
              <div key={k.module} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                <MiniStat label="Revenue"  value={fc(k.revenue)}  color="#fbbf24" />
                <MiniStat label="Expenses" value={fc(k.expenses)} color="#f87171" />
                <MiniStat label="Profit"   value={fc(k.profit)}   color={k.profit >= 0 ? '#34d399' : '#f87171'} />
              </div>
            ))}
            {!kpis.find(k => k.module === 'shop') && !L && (
              <Empty msg="No shop data available" />
            )}
            {L && <div className="skeleton" style={{ height: 90, borderRadius: 10 }} />}
            <ProgressRow label="Sales Target" value={68} color="#fbbf24" />
            <ProgressRow label="Processing Efficiency" value={82} color="#34d399" />
          </Card>
        </div>
      </section>

      {/* ── Module performance + Activity + Alerts ──── */}
      <section aria-label="Performance and alerts">
        <SectionHead label="Performance & Activity" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 280px', gap: 14 }}>

          {/* Module performance */}
          <Card>
            <CardHead title="Module Performance" sub="Revenue & profit by module" />
            {L
              ? Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 40, marginBottom: 14, borderRadius: 8 }} />)
              : !kpis.length
              ? <Empty msg="No module data" />
              : kpis.map(k => <ModuleBar key={k.module} kpi={k} />)
            }
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHead
              title="Recent Activity"
              sub={`${recentActivity.length} recent events`}
            />
            {L
              ? Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 50, marginBottom: 10, borderRadius: 8 }} />)
              : !recentActivity.length
              ? <Empty msg="No recent activity" />
              : recentActivity.slice(0, 6).map(item => <ActivityRow key={item.id} item={item} />)
            }
          </Card>

          {/* Alerts panel */}
          <Card style={{ padding: '18px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', fontFamily: "'Syne', sans-serif" }}>Smart Alerts</p>
                <p style={{ fontSize: 11, color: '#4b5e76', marginTop: 2 }}>Farm-wide notifications</p>
              </div>
              {warnCount > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  padding: '3px 8px', borderRadius: 20,
                  background: 'rgba(248,113,113,0.1)',
                  color: '#f87171',
                  border: '1px solid rgba(248,113,113,0.2)',
                }}>
                  {warnCount} active
                </span>
              )}
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 320, scrollbarWidth: 'none' }}>
              <AlertPanel
                alerts={alerts}
                onDismiss={dismissAlert}
                loading={loading}
                compact
              />
            </div>
          </Card>
        </div>
      </section>

    </div>
  );
}