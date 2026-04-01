// Path: ranch-tracker/client/src/pages/dashboard/index.tsx

import { useOutletContext } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Milk,
  Activity, AlertTriangle, IndianRupee, Sprout,
  Scale, Wallet, CalendarDays, RefreshCw,
} from 'lucide-react';
import AlertPanel from '../../components/shared/AlertPanel';
import { useDashboard } from '../../hooks/useDashboard';
import { formatCurrency, getModuleColor, formatRelativeTime } from '../../lib/utils';
import type { ModuleKPI, ActivityItem } from '../../types';

// ─────────────────────────────────────────────
// Win2000 design tokens
// ─────────────────────────────────────────────
const W = {
  bg: '#d4d0c8',
  surface: '#d4d0c8',
  white: '#ffffff',
  titleBar: 'linear-gradient(to right, #0a246a, #a6caf0)',
  titleText: '#ffffff',
  border3D: {
    raised: 'inset 1px 1px 0 #ffffff, inset -1px -1px 0 #808080, inset 2px 2px 0 #dfdfdf, inset -2px -2px 0 #404040',
    sunken: 'inset 1px 1px 0 #808080, inset -1px -1px 0 #ffffff, inset 2px 2px 0 #404040, inset -2px -2px 0 #dfdfdf',
    outset: '1px 1px 0 #ffffff, -1px -1px 0 #808080',
    field: 'inset 1px 1px 0 #808080, inset -1px -1px 0 #dfdfdf',
  },
  text: '#000000',
  textGray: '#444444',
  btnBg: '#d4d0c8',
  activeBg: '#000080',
  activeText: '#ffffff',
  font: '"Tahoma", "Arial", sans-serif',
  fontMono: '"Courier New", monospace',
};

function fc(n: number) { return formatCurrency(n, true); }

// ─────────────────────────────────────────────
// Win2000 Title Bar
// ─────────────────────────────────────────────
function TitleBar({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <div style={{
      background: W.titleBar,
      padding: '3px 6px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      userSelect: 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {icon && <span style={{ color: W.titleText, display: 'flex', alignItems: 'center' }}>{icon}</span>}
        <span style={{
          fontFamily: W.font, fontWeight: 700, fontSize: 11,
          color: W.titleText, letterSpacing: '0.02em',
        }}>{title}</span>
      </div>
      {/* Classic Win2K window buttons */}
      <div style={{ display: 'flex', gap: 2 }}>
        {['_', '□', '✕'].map((s, i) => (
          <div key={i} style={{
            width: 16, height: 14, background: W.btnBg,
            boxShadow: W.border3D.raised,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontFamily: W.font, cursor: 'default', color: W.text,
            fontWeight: 700,
          }}>{s}</div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Win2000 Window/Panel
// ─────────────────────────────────────────────
function Win2kPanel({
  title, icon, children, style, bodyStyle,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
}) {
  return (
    <div style={{
      background: W.surface,
      boxShadow: W.border3D.raised,
      border: '1px solid #808080',
      ...style,
    }}>
      <TitleBar title={title} icon={icon} />
      <div style={{ padding: 8, ...bodyStyle }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Win2000 Button
// ─────────────────────────────────────────────
function Win2kBtn({
  children, onClick, active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '2px 10px',
        fontFamily: W.font, fontSize: 11,
        background: active ? W.btnBg : W.btnBg,
        color: W.text,
        border: 'none', cursor: 'pointer',
        boxShadow: active ? W.border3D.sunken : W.border3D.raised,
        minWidth: 48, height: 23,
        outline: active ? `1px dotted ${W.text}` : 'none',
        outlineOffset: -3,
      }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────
// KPI Card — Win2000 Group Box style
// ─────────────────────────────────────────────
interface KPIProps {
  label: string; value: string; sub?: string;
  icon: React.ReactNode; color: string; loading?: boolean;
}

function KPICard({ label, value, sub, icon, color, loading }: KPIProps) {
  if (loading) return (
    <div style={{
      height: 78, background: W.surface,
      boxShadow: W.border3D.sunken, border: '1px solid #808080',
      animation: 'win2k-pulse 1.4s infinite',
    }} />
  );
  return (
    <div style={{
      background: W.white,
      boxShadow: W.border3D.sunken,
      border: '1px solid #808080',
      padding: '6px 8px',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      {/* top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontFamily: W.font, fontSize: 10, fontWeight: 700,
          color: W.textGray, textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>{label}</span>
        <span style={{ color, display: 'flex', alignItems: 'center' }}>{icon}</span>
      </div>
      {/* value */}
      <p style={{
        fontFamily: W.font, fontSize: 18, fontWeight: 700,
        color: W.text, lineHeight: 1,
      }}>{value}</p>
      {sub && <p style={{ fontFamily: W.font, fontSize: 9, color: W.textGray }}>{sub}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Section label — Win2000 group separator
// ─────────────────────────────────────────────
function SLabel({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
      <span style={{ fontFamily: W.font, fontSize: 11, fontWeight: 700, color: W.text }}>{text}</span>
      <div style={{ flex: 1, height: 1, borderTop: '1px solid #808080', borderBottom: '1px solid #fff' }} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Period toggle — classic tab buttons
// ─────────────────────────────────────────────
function PToggle({ period, set }: { period: string; set: (p: 'week' | 'month' | 'year') => void }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {(['Week', 'Month', 'Year'] as const).map(p => {
        const v = p.toLowerCase() as 'week' | 'month' | 'year';
        return (
          <Win2kBtn key={p} active={period === v} onClick={() => set(v)}>
            {p}
          </Win2kBtn>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// Chart tooltip
// ─────────────────────────────────────────────
function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: W.surface, boxShadow: W.border3D.raised,
      border: '1px solid #808080', padding: '4px 8px', fontFamily: W.font, fontSize: 10,
    }}>
      <p style={{ color: W.textGray, marginBottom: 2, fontWeight: 700 }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', gap: 6, alignItems: 'center', color: W.text, marginBottom: 1 }}>
          <span style={{ width: 8, height: 8, background: p.color, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ textTransform: 'capitalize' }}>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>{fc(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────
function Empty({ msg }: { msg: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px 0', gap: 6,
      boxShadow: W.border3D.sunken, background: W.white,
      border: '1px solid #808080',
    }}>
      <Activity size={13} style={{ color: W.textGray }} />
      <span style={{ fontFamily: W.font, fontSize: 11, color: W.textGray }}>{msg}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Module performance row
// ─────────────────────────────────────────────
function ModBar({ kpi }: { kpi: ModuleKPI }) {
  const c = getModuleColor(kpi.module);
  const pos = kpi.profit >= 0;
  const pct = Math.min(Math.abs(kpi.profit) / Math.max(kpi.revenue, 1) * 100, 100);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, background: c, display: 'inline-block' }} />
          <span style={{ fontFamily: W.font, fontSize: 11, color: W.text, textTransform: 'capitalize' }}>{kpi.module}</span>
        </div>
        <span style={{ fontFamily: W.font, fontSize: 11, fontWeight: 700, color: pos ? '#006400' : '#cc0000' }}>{fc(kpi.profit)}</span>
      </div>
      {/* Win2000 progress bar */}
      <div style={{ height: 12, boxShadow: W.border3D.sunken, background: W.white, border: '1px solid #808080', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: pos
            ? 'repeating-linear-gradient(to right, #000080 0px, #000080 2px, #4169e1 2px, #4169e1 4px)'
            : 'repeating-linear-gradient(to right, #cc0000 0px, #cc0000 2px, #ff4444 2px, #ff4444 4px)',
          transition: 'width 0.5s ease',
        }} />
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
    <div style={{
      display: 'flex', gap: 8, padding: '4px 0',
      borderBottom: `1px solid #c0c0c0`, alignItems: 'flex-start',
    }}>
      <span style={{ width: 8, height: 8, background: c, display: 'inline-block', flexShrink: 0, marginTop: 3 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: W.font, fontSize: 11, color: W.text, lineHeight: 1.4 }}>{item.description}</p>
        <p style={{ fontFamily: W.font, fontSize: 9, color: W.textGray, marginTop: 1 }}>{formatRelativeTime(item.createdAt)}</p>
      </div>
      {item.amount !== undefined && (
        <span style={{
          fontFamily: W.font, fontSize: 11, fontWeight: 700,
          color: item.amount >= 0 ? '#006400' : '#cc0000', flexShrink: 0,
        }}>
          {item.amount >= 0 ? '+' : ''}{fc(item.amount)}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Status bar item
// ─────────────────────────────────────────────
function StatusItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', boxShadow: W.border3D.sunken,
      border: '1px solid #808080',
    }}>
      {color && <span style={{ width: 8, height: 8, background: color, display: 'inline-block', borderRadius: '50%' }} />}
      <span style={{ fontFamily: W.font, fontSize: 11, color: W.text }}>{label}:</span>
      <span style={{ fontFamily: W.font, fontSize: 11, fontWeight: 700, color: W.text }}>{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────
export default function Dashboard() {
  useOutletContext<{ setMobileOpen: (v: boolean) => void }>();
  const { stats, kpis, alerts, profitChart, recentActivity, period, loading, error, setPeriod, dismissAlert, refetch } = useDashboard();
  const L = loading && !stats;
  const warnCount = alerts.filter(a => a.type === 'danger' || a.type === 'warning').length;

  const pieData = kpis.filter(k => k.revenue > 0).slice(0, 5).map(k => ({
    name: k.module, value: k.expenses, color: getModuleColor(k.module),
  }));

  // Win2K win2k-pulse keyframe injected inline
  const styleTag = `
    @keyframes win2k-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `;

  return (
    <div style={{ background: W.bg, minHeight: '100%', padding: 0, fontFamily: W.font }}>
      <style>{styleTag}</style>

      {/* ── Top application title bar ── */}
      <div style={{
        background: W.titleBar,
        padding: '4px 8px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>🌾</span>
          <span style={{ fontFamily: W.font, fontWeight: 700, fontSize: 12, color: '#fff' }}>
            Ranch Tracker — Nandha Farm Dashboard
          </span>
          <span style={{ fontFamily: W.font, fontSize: 10, color: '#a6caf0', marginLeft: 8 }}>
            Fatehpur · Samana · Patiala
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={refetch}
            style={{
              background: W.btnBg, border: 'none', cursor: 'pointer',
              boxShadow: W.border3D.raised, padding: '2px 8px',
              fontFamily: W.font, fontSize: 11, color: W.text,
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <RefreshCw size={10} /> Refresh
          </button>
          <span style={{ fontFamily: W.font, fontSize: 10, color: '#a6caf0' }}>
            ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਸਰਦਾਰ ਜੀ
          </span>
        </div>
      </div>

      {/* ── Menu bar ── */}
      <div style={{
        background: W.surface, borderBottom: '1px solid #808080',
        padding: '2px 4px', display: 'flex', gap: 2, marginBottom: 4,
      }}>
        {['File', 'Edit', 'View', 'Tools', 'Reports', 'Help'].map(m => (
          <button key={m} style={{
            fontFamily: W.font, fontSize: 11, color: W.text, background: 'transparent',
            border: 'none', padding: '2px 8px', cursor: 'default',
          }}>{m}</button>
        ))}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div style={{
          margin: '4px 8px',
          padding: '6px 10px', background: '#fff0f0',
          boxShadow: W.border3D.sunken, border: '1px solid #cc0000',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <AlertTriangle size={13} style={{ color: '#cc0000', flexShrink: 0 }} />
          <span style={{ fontFamily: W.font, fontSize: 11, color: '#cc0000', flex: 1 }}>{error}</span>
          <Win2kBtn onClick={refetch}>Retry</Win2kBtn>
        </div>
      )}

      {/* ── Main content area ── */}
      <div style={{ padding: '0 8px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>

        {/* Status bar at top */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <StatusItem label="Status" value="Active" color="#22c55e" />
          <StatusItem label="Milk Today" value={`${stats?.todayMilkLiters ?? 0} L`} color="#4169e1" />
          <StatusItem label="Active Crops" value={String(stats?.activeCrops ?? 0)} color="#d97706" />
          <StatusItem label="Herd Size" value={String(stats?.herdSize ?? 0)} color="#7c3aed" />
          {warnCount > 0 && (
            <StatusItem label="Alerts" value={String(warnCount)} color="#cc0000" />
          )}
        </div>

        {/* ── Row 1: Financial KPIs ── */}
        <Win2kPanel title="Financial Overview" icon={<IndianRupee size={12} />}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
            <KPICard label="Total Revenue" value={fc(stats?.totalRevenue ?? 0)} sub="All modules" icon={<IndianRupee size={14} />} color="#006400" loading={L} />
            <KPICard label="Total Expenses" value={fc(stats?.totalExpenses ?? 0)} sub="All modules" icon={<TrendingDown size={14} />} color="#cc0000" loading={L} />
            <KPICard label="Net Profit" value={fc(stats?.netProfit ?? 0)} sub="Surplus this month" icon={<TrendingUp size={14} />} color="#000080" loading={L} />
            <KPICard label="Today&apos;s Milk" value={`${stats?.todayMilkLiters ?? 0} L`} sub="Morning + evening" icon={<Milk size={14} />} color="#4169e1" loading={L} />
          </div>
        </Win2kPanel>

        {/* ── Row 2: Operations KPIs ── */}
        <Win2kPanel title="Operations Overview" icon={<Activity size={12} />}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
            <KPICard label="Active Seasons" value={String(stats?.activeSeasons ?? 0)} sub="Crops in field" icon={<Sprout size={12} />} color="#006400" loading={L} />
            <KPICard label="Herd Size" value={String(stats?.herdSize ?? 0)} sub={`${stats?.cowCount ?? 0} cows · ${stats?.buffaloCount ?? 0} buffalo`} icon={<Scale size={12} />} color="#4169e1" loading={L} />
            <KPICard label="Pending Labour" value={fc(stats?.pendingWages ?? 0)} sub="Awaiting payment" icon={<Wallet size={12} />} color="#7c3aed" loading={L} />
            <KPICard label="All Seasons" value={String(stats?.allSeasons ?? 0)} sub="All seasons" icon={<CalendarDays size={12} />} color="#b45309" loading={L} />
          </div>
        </Win2kPanel>

        {/* ── Row 3: Charts ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 8 }}>

          {/* Revenue vs Expenses chart */}
          <Win2kPanel
            title="Revenue vs Expenses"
            icon={<TrendingUp size={12} />}
            bodyStyle={{ paddingBottom: 6 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontFamily: W.font, fontSize: 10, color: W.textGray }}>Last 30 days</span>
              <PToggle period={period} set={setPeriod} />
            </div>
            {L ? (
              <div style={{ height: 150, boxShadow: W.border3D.sunken, background: W.white, border: '1px solid #808080', animation: 'win2k-pulse 1.4s infinite' }} />
            ) : !profitChart.length ? <Empty msg="No data for this period" /> : (
              <>
                <div style={{ boxShadow: W.border3D.sunken, border: '1px solid #808080', background: W.white, padding: '4px 0' }}>
                  <ResponsiveContainer width="100%" height={150}>
                    <AreaChart data={profitChart} margin={{ top: 3, right: 6, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gR_w2k" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4169e1" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#4169e1" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="gE_w2k" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#cc0000" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#cc0000" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 4" stroke="#d0d0d0" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: W.textGray, fontSize: 8, fontFamily: W.font }} axisLine={false} tickLine={false} dy={4} />
                      <YAxis tick={{ fill: W.textGray, fontSize: 8, fontFamily: W.font }} axisLine={false} tickLine={false} tickFormatter={(v: number) => fc(v)} width={48} />
                      <Tooltip content={<ChartTip />} />
                      <Area type="monotone" dataKey="revenue" stroke="#4169e1" strokeWidth={1.5} fill="url(#gR_w2k)" dot={false} activeDot={{ r: 3 }} />
                      <Area type="monotone" dataKey="expenses" stroke="#cc0000" strokeWidth={1.5} fill="url(#gE_w2k)" dot={false} activeDot={{ r: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 5 }}>
                  {[['Revenue', '#4169e1'], ['Expenses', '#cc0000']].map(([l, c]) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 14, height: 3, background: c, display: 'inline-block' }} />
                      <span style={{ fontFamily: W.font, fontSize: 10, color: W.textGray }}>{l}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Win2kPanel>

          {/* Expense Breakdown */}
          <Win2kPanel title="Expense Breakdown" icon={<Scale size={12} />}>
            <span style={{ fontFamily: W.font, fontSize: 9, color: W.textGray }}>This week</span>
            {L ? <div style={{ height: 150, marginTop: 4, animation: 'win2k-pulse 1.4s infinite', boxShadow: W.border3D.sunken, border: '1px solid #808080', background: W.white }} /> :
              !pieData.length ? <Empty msg="No expense data" /> : (
                <>
                  <div style={{ boxShadow: W.border3D.sunken, border: '1px solid #808080', background: W.white, marginTop: 4 }}>
                    <ResponsiveContainer width="100%" height={110}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={44} paddingAngle={2} dataKey="value" stroke="none">
                          {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => fc(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 5 }}>
                    {pieData.map(d => (
                      <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 8, height: 8, background: d.color, display: 'inline-block' }} />
                          <span style={{ fontFamily: W.font, fontSize: 10, color: W.text, textTransform: 'capitalize' }}>{d.name}</span>
                        </div>
                        <span style={{ fontFamily: W.font, fontSize: 10, fontWeight: 700, color: W.text }}>{fc(d.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
          </Win2kPanel>
        </div>

        {/* ── Row 4: Milk + Module Perf + Alerts ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 220px', gap: 8 }}>

          {/* Milk Production */}
          <Win2kPanel title="Milk Production" icon={<Milk size={12} />}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontFamily: W.font, fontSize: 10, color: W.textGray }}>Weekly output</span>
              <span style={{ fontFamily: W.font, fontSize: 10, fontWeight: 700, color: '#4169e1' }}>
                {stats?.todayMilkLiters ?? 0}L today
              </span>
            </div>
            {L ? <div style={{ height: 110, animation: 'win2k-pulse 1.4s infinite', boxShadow: W.border3D.sunken, border: '1px solid #808080', background: W.white }} /> :
              !profitChart.length ? <Empty msg="No milk records" /> : (
                <div style={{ boxShadow: W.border3D.sunken, border: '1px solid #808080', background: W.white, padding: '3px 0' }}>
                  <ResponsiveContainer width="100%" height={110}>
                    <AreaChart data={profitChart} margin={{ top: 3, right: 3, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gM_w2k" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4169e1" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#4169e1" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 4" stroke="#d0d0d0" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: W.textGray, fontSize: 7, fontFamily: W.font }} axisLine={false} tickLine={false} dy={3} />
                      <YAxis hide />
                      <Tooltip content={<ChartTip />} />
                      <Area type="monotone" dataKey="revenue" stroke="#4169e1" strokeWidth={1.5} fill="url(#gM_w2k)" dot={false} name="Milk (L)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
          </Win2kPanel>

          {/* Module Performance */}
          <Win2kPanel title="Module Performance" icon={<TrendingUp size={12} />}>
            {L ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ height: 26, animation: 'win2k-pulse 1.4s infinite', boxShadow: W.border3D.sunken, border: '1px solid #808080', background: W.white }} />
                ))}
              </div>
            ) : !kpis.length ? <Empty msg="No module data" /> : (
              kpis.map(k => <ModBar key={k.module} kpi={k} />)
            )}
          </Win2kPanel>

          {/* Alerts */}
          <Win2kPanel title={`Alerts${warnCount > 0 ? ` (${warnCount})` : ''}`} icon={<AlertTriangle size={12} />}>
            <div style={{ overflowY: 'auto', maxHeight: 180 }}>
              <AlertPanel alerts={alerts} onDismiss={dismissAlert} loading={loading} />
            </div>
          </Win2kPanel>
        </div>

        {/* ── Row 5: Recent Activity ── */}
        <Win2kPanel title={`Recent Activity — ${recentActivity.length} events`} icon={<Activity size={12} />}>
          {L ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: 44, animation: 'win2k-pulse 1.4s infinite', boxShadow: W.border3D.sunken, border: '1px solid #808080', background: W.white }} />
              ))}
            </div>
          ) : !recentActivity.length ? <Empty msg="No recent activity" /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0 16px' }}>
              {recentActivity.slice(0, 9).map(item => <ActRow key={item.id} item={item} />)}
            </div>
          )}
        </Win2kPanel>

      </div>

      {/* ── Windows 2000 Status Bar ── */}
      <div style={{
        background: W.surface,
        borderTop: `1px solid #808080`,
        padding: '3px 8px',
        display: 'flex', alignItems: 'center', gap: 4,
        fontSize: 11, fontFamily: W.font, color: W.text,
      }}>
        <div style={{ flex: 1, display: 'flex', gap: 4 }}>
          <div style={{ boxShadow: W.border3D.sunken, border: '1px solid #808080', padding: '1px 8px' }}>
            Ready
          </div>
          <div style={{ boxShadow: W.border3D.sunken, border: '1px solid #808080', padding: '1px 8px' }}>
            {kpis.length} modules loaded
          </div>
          <div style={{ boxShadow: W.border3D.sunken, border: '1px solid #808080', padding: '1px 8px' }}>
            {alerts.length} alert(s)
          </div>
        </div>
        <div style={{ boxShadow: W.border3D.sunken, border: '1px solid #808080', padding: '1px 8px' }}>
          🕐 Ranch Tracker v2.0
        </div>
      </div>
    </div>
  );
}
