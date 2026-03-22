// Path: ranch-tracker/client/src/pages/dashboard/index.tsx

import { useOutletContext } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Milk,
  Activity, AlertTriangle, IndianRupee, Sprout,
  Scale, Wallet, CalendarDays,
} from 'lucide-react';
import AlertPanel from '../../components/shared/AlertPanel';
import { useDashboard } from '../../hooks/useDashboard';
import { formatCurrency, getModuleColor, formatRelativeTime } from '../../lib/utils';
import type { ModuleKPI, ActivityItem } from '../../types';

// ─────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────
function fc(n: number) { return formatCurrency(n, true); }

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0d1117', border: '1px solid #1e2d40', borderRadius: 8, padding: '7px 11px', fontSize: 11 }}>
      <p style={{ color: '#4a5a6a', marginBottom: 4 }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', gap: 7, alignItems: 'center', color: '#8a9aaa', marginBottom: 2 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, flexShrink: 0, display: 'inline-block' }} />
          <span style={{ textTransform: 'capitalize' }}>{p.name}:</span>
          <span style={{ color: '#c8d8e8', fontWeight: 600 }}>{fc(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// KPI Card — matches Image 1 style exactly
// ─────────────────────────────────────────────
interface KPIProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

function KPICard({ label, value, sub, icon, color, loading }: KPIProps) {
  if (loading) return (
    <div className="skeleton" style={{ borderRadius: 10, height: 88 }} />
  );
  return (
    <div style={{
      background: '#0d1117',
      border: '1px solid #1a2535',
      borderRadius: 10,
      padding: '12px 14px',
      display: 'flex', flexDirection: 'column', gap: 6,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* subtle glow */}
      <div style={{
        position: 'absolute', top: -16, right: -16, width: 60, height: 60,
        borderRadius: '50%', background: color, opacity: 0.07, filter: 'blur(16px)'
      }} />

      {/* top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p style={{
          fontSize: 9, fontWeight: 700, color: '#3a4a5a',
          textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Syne,sans-serif'
        }}>
          {label}
        </p>
        <div style={{
          width: 24, height: 24, borderRadius: 7, background: `${color}1a`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0
        }}>
          {icon}
        </div>
      </div>

      {/* value */}
      <p style={{
        fontSize: 20, fontWeight: 800, color, fontFamily: 'Syne,sans-serif',
        lineHeight: 1, letterSpacing: '-0.5px'
      }}>
        {value}
      </p>

      {/* sub */}
      {sub && <p style={{ fontSize: 10, color: '#3a4a5a' }}>{sub}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Section label
// ─────────────────────────────────────────────
function SLabel({ text }: { text: string }) {
  return (
    <p style={{
      fontSize: 9, fontWeight: 700, color: '#2a3545',
      textTransform: 'uppercase', letterSpacing: '0.12em',
      fontFamily: 'Syne,sans-serif', marginBottom: 8
    }}>
      {text}
    </p>
  );
}

// ─────────────────────────────────────────────
// Card wrapper
// ─────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: '#0d1117', border: '1px solid #1a2535',
      borderRadius: 10, padding: '14px 16px', ...style
    }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// Card header
// ─────────────────────────────────────────────
function CardHead({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#6a7a8a', fontFamily: 'Syne,sans-serif' }}>{title}</p>
      {right && <div style={{ fontSize: 9, color: '#2a3545' }}>{right}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Period toggle
// ─────────────────────────────────────────────
function PToggle({ period, set }: { period: string; set: (p: 'week' | 'month' | 'year') => void }) {
  return (
    <div style={{ display: 'flex', background: '#121820', borderRadius: 8, padding: 3, gap: 2 }}>
      {(['Week', 'Month', 'Year'] as const).map(p => {
        const v = p.toLowerCase() as 'week' | 'month' | 'year';
        const on = period === v;
        return (
          <button key={p} onClick={() => set(v)} style={{
            padding: '3px 9px', border: 'none', borderRadius: 6, cursor: 'pointer',
            fontSize: 9, fontWeight: 700, fontFamily: 'Syne,sans-serif',
            background: on ? '#1e2d40' : 'transparent',
            color: on ? '#c8d8e8' : '#3a4a5a',
          }}>{p}</button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────
function Empty({ msg }: { msg: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0', gap: 8 }}>
      <Activity size={14} style={{ color: '#1e2d40' }} />
      <span style={{ fontSize: 11, color: '#2a3545' }}>{msg}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Module performance bar row
// ─────────────────────────────────────────────
function ModBar({ kpi }: { kpi: ModuleKPI }) {
  const c = getModuleColor(kpi.module);
  const pos = kpi.profit >= 0;
  const pct = Math.min(Math.abs(kpi.profit) / Math.max(kpi.revenue, 1) * 100, 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: c, display: 'inline-block' }} />
          <span style={{ fontSize: 11, color: '#6a7a8a', textTransform: 'capitalize', fontFamily: 'DM Sans,sans-serif' }}>{kpi.module}</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: pos ? '#4ade80' : '#f87171', fontFamily: 'Syne,sans-serif' }}>{fc(kpi.profit)}</span>
      </div>
      <div style={{ height: 3, background: '#1a2535', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: pos ? c : '#f87171', borderRadius: 3, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Activity item
// ─────────────────────────────────────────────
function ActRow({ item }: { item: ActivityItem }) {
  const c = getModuleColor(item.module);
  return (
    <div style={{ display: 'flex', gap: 9, paddingBottom: 10, borderBottom: '1px solid #111820', alignItems: 'flex-start' }}>
      <div style={{
        width: 24, height: 24, borderRadius: 7, background: `${c}18`, color: c,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1
      }}>
        <Activity size={11} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 11, color: '#6a7a8a', lineHeight: 1.45 }}>{item.description}</p>
        <p style={{ fontSize: 9, color: '#2a3545', marginTop: 2 }}>{formatRelativeTime(item.createdAt)}</p>
      </div>
      {item.amount !== undefined && (
        <span style={{
          fontSize: 11, fontWeight: 700, color: item.amount >= 0 ? '#4ade80' : '#f87171',
          fontFamily: 'Syne,sans-serif', flexShrink: 0
        }}>
          {item.amount >= 0 ? '+' : ''}{fc(item.amount)}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
export default function Dashboard() {
  useOutletContext<{ setMobileOpen: (v: boolean) => void }>();
  const { stats, kpis, alerts, profitChart, recentActivity, period, loading, error, setPeriod, dismissAlert, refetch } = useDashboard();
  const L = loading && !stats;
  const warnCount = alerts.filter(a => a.type === 'danger' || a.type === 'warning').length;

  const pieData = kpis.filter(k => k.revenue > 0).slice(0, 5).map(k => ({
    name: k.module, value: k.expenses, color: getModuleColor(k.module),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>



      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Error */}
        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={13} style={{ color: '#f87171', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#fca5a5', flex: 1 }}>{error}</span>
            <button onClick={refetch} style={{ fontSize: 10, color: '#f87171', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '3px 9px', cursor: 'pointer' }}>Retry</button>
          </div>
        )}

        {/* Farm header bar */}
        <div style={{
          padding: '30px 14px',
          background: 'linear-gradient(90deg, #0a1a0f 0%, #0a1220 100%)',
          borderRadius: 10, border: '1px solid #1a3020',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8,
        }}>
          <div>
            <p style={{ fontSize: 25, fontWeight: 800, color: '#d4f0e0', fontFamily: 'Syne,sans-serif' }}>🌾 Nandha Farm</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#d4f0e0', fontFamily: 'Syne,sans-serif' }}>ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਸਰਦਾਰ ਜੀ</p>
            <p style={{ fontSize: 14, color: '#2a5040', marginTop: 1 }}>Fatehpur · Samana · Patiala</p>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { label: '● Active', color: '#4ade80' },

              { label: `${stats?.todayMilkLiters ?? 0}L today`, color: '#38bdf8' },
              { label: `${stats?.activeCrops ?? 0} crops`, color: '#fbbf24' },
            ].map(c => (
              <span key={c.label} style={{
                fontSize: 9, fontWeight: 600, color: c.color,
                padding: '3px 8px', background: `${c.color}14`, border: `1px solid ${c.color}28`,
                borderRadius: 20
              }}>
                {c.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Row 1: Financial KPIs ───────────────────── */}
        <div>
          <SLabel text="Financial Overview" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            <KPICard label="Total Revenue" value={fc(stats?.totalRevenue ?? 0)} sub="All modules" icon={<IndianRupee size={15} />} color="#38bdf8" loading={L} />
            <KPICard label="Total Expenses" value={fc(stats?.totalExpenses ?? 0)} sub="All modules" icon={<TrendingDown size={15} />} color="#f87171" loading={L} />
            <KPICard label="Net Profit" value={fc(stats?.netProfit ?? 0)} sub="Surplus this month" icon={<TrendingUp size={15} />} color="#4ade80" loading={L} />
            <KPICard label="Today's Milk" value={`${stats?.todayMilkLiters ?? 0} L`} sub="This morning + evening" icon={<Milk size={15} />} color="#38bdf8" loading={L} />
          </div>
        </div>

        {/* ── Row 2: Operations KPIs ──────────────────── */}
        <div>
          <SLabel text="Operations" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            <KPICard label="Active Seasons" value={String(stats?.activeSeasons ?? 0)} sub="Crops in field" icon={<Sprout size={12} />} color="#86efac" loading={L} />
            <KPICard label="Herd Size" value={String(stats?.herdSize ?? 0)} sub={`${stats?.cowCount ?? 0} cows · ${stats?.buffaloCount ?? 0} buffalo`} icon={<Scale size={12} />} color="#38bdf8" loading={L} />
            <KPICard label="Pending Labour" value={fc(stats?.pendingWages ?? 0)} sub="Awaiting payment" icon={<Wallet size={12} />} color="#a78bfa" loading={L} />
            <KPICard label="All Seasons" value={String(stats?.allSeasons ?? 0)} sub="All seasons" icon={<CalendarDays size={12} />} color="#fb923c" loading={L} />
          </div>
        </div>

        {/* ── Row 3: Charts ───────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 10 }}>

          {/* Revenue vs Expenses */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#6a7a8a', fontFamily: 'Syne,sans-serif' }}>Revenue vs Expenses</p>
                <p style={{ fontSize: 9, color: '#2a3545', marginTop: 2 }}>Last 30 days</p>
              </div>
              <PToggle period={period} set={setPeriod} />
            </div>
            {L ? <div className="skeleton" style={{ height: 160, borderRadius: 8 }} /> :
              !profitChart.length ? <Empty msg="No data for this period" /> : (
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={profitChart} margin={{ top: 3, right: 3, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gR2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gE2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f87171" stopOpacity={0.22} />
                        <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="#111820" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#2a3545', fontSize: 8 }} axisLine={false} tickLine={false} dy={4} />
                    <YAxis tick={{ fill: '#2a3545', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => fc(v)} width={44} />
                    <Tooltip content={<ChartTip />} />
                    <Area type="monotone" dataKey="revenue" stroke="#38bdf8" strokeWidth={1.5} fill="url(#gR2)" dot={false} activeDot={{ r: 3 }} />
                    <Area type="monotone" dataKey="expenses" stroke="#f87171" strokeWidth={1.5} fill="url(#gE2)" dot={false} activeDot={{ r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
              {[['Revenue', '#38bdf8'], ['Expenses', '#f87171']].map(([l, c]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 16, height: 2, background: c, borderRadius: 2, display: 'inline-block' }} />
                  <span style={{ fontSize: 9, color: '#3a4a5a' }}>{l}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Expense Breakdown */}
          <Card>
            <CardHead title="Expense Breakdown" right="This week" />
            {L ? <div className="skeleton" style={{ height: 160, borderRadius: 8 }} /> :
              !pieData.length ? <Empty msg="No expense data this week" /> : (
                <>
                  <ResponsiveContainer width="100%" height={110}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={48} paddingAngle={2} dataKey="value" stroke="none">
                        {pieData.map((e, i) => <Cell key={i} fill={e.color} opacity={0.85} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => fc(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 6 }}>
                    {pieData.map(d => (
                      <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
                          <span style={{ fontSize: 10, color: '#6a7a8a', textTransform: 'capitalize' }}>{d.name}</span>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#c8d8e8', fontFamily: 'Syne,sans-serif' }}>{fc(d.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
          </Card>
        </div>

        {/* ── Row 4: Milk + Module Perf + Alerts ─────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 240px', gap: 10 }}>

          {/* Milk Production */}
          <Card>
            <CardHead title={`🥛 Milk Production`} right={`${stats?.todayMilkLiters ?? 0}L this week`} />
            {L ? <div className="skeleton" style={{ height: 120, borderRadius: 8 }} /> :
              !profitChart.length ? <Empty msg="No milk records" /> : (
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={profitChart} margin={{ top: 3, right: 3, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gM2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="#111820" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#2a3545', fontSize: 7 }} axisLine={false} tickLine={false} dy={3} />
                    <YAxis hide />
                    <Tooltip content={<ChartTip />} />
                    <Area type="monotone" dataKey="revenue" stroke="#38bdf8" strokeWidth={1.5} fill="url(#gM2)" dot={false} name="Milk (L)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
          </Card>

          {/* Module Performance */}
          <Card>
            <CardHead title="Module Performance" />
            {L ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 28, borderRadius: 6 }} />)}
              </div>
            ) : !kpis.length ? <Empty msg="No module data" /> : (
              kpis.map(k => <ModBar key={k.module} kpi={k} />)
            )}
          </Card>

          {/* Alerts */}
          <Card style={{ padding: '14px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#6a7a8a', fontFamily: 'Syne,sans-serif' }}>Alerts</p>
              {warnCount > 0 && (
                <span style={{
                  fontSize: 9, padding: '2px 6px', background: 'rgba(239,68,68,0.12)',
                  color: '#fca5a5', borderRadius: 20, border: '1px solid rgba(239,68,68,0.2)'
                }}>
                  {warnCount}
                </span>
              )}
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 200 }}>
              <AlertPanel
                alerts={alerts}
                onDismiss={dismissAlert}
                loading={loading}
              />
            </div>
          </Card>
        </div>

        {/* ── Row 5: Recent Activity ───────────────────── */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#6a7a8a', fontFamily: 'Syne,sans-serif' }}>Recent Activity</p>
            <span style={{ fontSize: 9, color: '#2a3545' }}>{recentActivity.length} events</span>
          </div>
          {L ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 48, borderRadius: 8 }} />)}
            </div>
          ) : !recentActivity.length ? <Empty msg="No recent activity" /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0 16px' }}>
              {recentActivity.slice(0, 9).map(item => <ActRow key={item.id} item={item} />)}
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}