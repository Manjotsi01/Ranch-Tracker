// Path: ranch-tracker/client/src/pages/agriculture/SeasonDetail.tsx

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2,
  BarChart3, IndianRupee, Package, Leaf,
  Calendar, TrendingUp, TrendingDown, Target,
  FlaskConical, Droplets, Users, Bug, Tractor,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../../lib/api';
import type { CropSeason, SeasonExpense, SeasonResource, YieldEntry } from '../../types/index';
import { useSeasons } from '../../hooks/Useseasons';
import { formatCurrency, formatDate, formatDateRange } from '../../lib/utils';
import { EXPENSE_CATEGORIES, YIELD_UNITS } from '../../lib/constant';
import AlertPanel from '../../components/shared/AlertPanel';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  green:    '#1a5c1a',
  greenMid: '#237a23',
  gold:     '#f5a623',
  goldDark: '#e8960e',
  cream:    '#f5f0e8',
  cardBg:   '#ffffff',
  border:   '#e0d5c0',
  text:     '#1a3a0a',
  sub:      '#6b7c50',
  muted:    '#8a7a50',
  red:      '#c0392b',
};

const TAB_DEFS = [
  { key: 'overview',  label: 'Overview',       icon: <BarChart3 size={13} /> },
  { key: 'expenses',  label: 'Expenses',       icon: <IndianRupee size={13} /> },
  { key: 'resources', label: 'Resources',      icon: <Package size={13} /> },
  { key: 'yield',     label: 'Yield & Profit', icon: <TrendingUp size={13} /> },
  { key: 'manage',    label: 'Lifecycle',      icon: <Calendar size={13} /> },
];

const PIE_COLORS = ['#1a5c1a','#f5a623','#3b82f6','#a855f7','#f97316','#ef4444','#06b6d4','#84cc16'];

const STATUS_CFG: Record<string, { bg: string; color: string; border: string }> = {
  PLANNED:   { bg: '#f0ece0', color: '#6b5a2a', border: '#c8b060' },
  ACTIVE:    { bg: '#eaf4ea', color: '#1a5c1a', border: '#237a23' },
  HARVESTED: { bg: '#fff4d6', color: '#8a5a00', border: '#f5a623' },
  COMPLETED: { bg: '#e8f0e8', color: '#2a5a2a', border: '#3a7a3a' },
  ABANDONED: { bg: '#fdecea', color: '#8a2a2a', border: '#c0392b' },
};

// ─── Small reusable pieces ────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon, accent }: {
  label: string; value: string; sub?: string; icon: React.ReactNode; accent: string;
}) {
  return (
    <div style={{
      background: C.cardBg, borderRadius: 13, padding: '16px',
      border: `2px solid ${accent}22`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          {label}
        </span>
        <span style={{
          width: 28, height: 28, borderRadius: 7, background: `${accent}18`,
          color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{icon}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: C.text, fontFamily: "'Syne',sans-serif" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function SectionBox({ title, icon, children, action }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div style={{ background: C.cardBg, borderRadius: 16, border: `2px solid ${C.border}`, padding: '20px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: C.greenMid }}>{icon}</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.text, fontFamily: "'Syne',sans-serif" }}>{title}</span>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: C.green, color: '#fff', border: 'none',
        borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
      }}>
      <Plus size={13} />{label}
    </button>
  );
}

function SlimModal({ open, onClose, title, children, onSave, saving }: {
  open: boolean; onClose: () => void; title: string;
  children: React.ReactNode; onSave: () => void; saving: boolean;
}) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
        onClick={onClose} />
      <div style={{
        position: 'relative', background: '#fff', borderRadius: 16,
        width: '100%', maxWidth: 480, maxHeight: '85vh',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column',
        border: `2px solid ${C.border}`,
      }}>
        <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: C.text, fontFamily: "'Syne',sans-serif" }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: C.muted, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '18px 20px', overflowY: 'auto', flex: 1 }}>{children}</div>
        <div style={{ padding: '14px 20px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ background: '#f7f3eb', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: C.muted }}>
            Cancel
          </button>
          <button onClick={onSave} disabled={saving}
            style={{ background: saving ? '#8ab88a' : C.green, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  border: `1.5px solid ${C.border}`, borderRadius: 8,
  padding: '8px 12px', fontSize: 13, color: C.text,
  background: '#faf8f3', outline: 'none', width: '100%',
};

const selectStyle: React.CSSProperties = { ...inputStyle };

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SeasonDetail() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const navigate = useNavigate();
  const {
    fetchExpenses, addExpense, deleteExpense,
    fetchResources, addResource, deleteResource,
    fetchYields, addYield, deleteYield,
    updateSeason, deleteSeason,
  } = useSeasons();

  const [season, setSeason]       = useState<CropSeason | null>(null);
  const [expenses, setExpenses]   = useState<SeasonExpense[]>([]);
  const [resources, setResources] = useState<SeasonResource[]>([]);
  const [yields, setYields]       = useState<YieldEntry[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const loadAll = useCallback(async () => {
    if (!seasonId) return;
    setLoading(true); setError(null);
    try {
      const [sr, ed, rd, yd] = await Promise.all([
        api.get<{ data: CropSeason }>(`/agriculture/seasons/${seasonId}`),
        fetchExpenses(seasonId),
        fetchResources(seasonId),
        fetchYields(seasonId),
      ]);
      setSeason(sr.data.data);
      setExpenses(ed);
      setResources(rd);
      setYields(yd);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load season');
    } finally {
      setLoading(false);
    }
  }, [seasonId, fetchExpenses, fetchResources, fetchYields]);

  useEffect(() => { loadAll(); }, [loadAll]);

  if (loading) return <PageSkeleton />;
  if (!season)  return <div style={{ padding: 32, color: C.muted }}>Season not found.</div>;

  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const totalRevenue = yields.reduce((s, y) => s + y.revenue, 0);
  const netProfit    = totalRevenue - totalExpense;
  const roi          = totalExpense > 0 ? (netProfit / totalExpense) * 100 : 0;
  const totalYield   = yields.reduce((s, y) => s + y.quantity, 0);
  const statusCfg    = STATUS_CFG[season.status] ?? STATUS_CFG.PLANNED;

  const expByCategory = EXPENSE_CATEGORIES.map((cat) => ({
    name: cat.label,
    value: expenses.filter((e) => e.category === cat.value).reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.value > 0);

  const monthlyData = buildMonthlyData(expenses, yields);

  return (
    <div style={{ background: C.cream, minHeight: '100%' }}>

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenMid} 55%, ${C.goldDark} 100%)`,
        borderRadius: 16, padding: '20px 24px', marginBottom: 20,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <button onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 8, padding: '5px 12px', color: '#fff', fontSize: 12,
              fontWeight: 600, cursor: 'pointer', marginBottom: 14,
            }}>
            <ArrowLeft size={13} /> Back
          </button>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: "'Syne',sans-serif" }}>
                  {season.label}
                </h1>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                  background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}`,
                }}>
                  {season.status}
                </span>
              </div>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.72)' }}>
                {season.variety && `${season.variety} · `}
                {formatDateRange(season.startDate, season.endDate)} · {season.areaSown} {season.areaUnit}
              </p>
            </div>
            <button onClick={async () => {
              if (window.confirm('Are you sure you want to delete this season and all its records?')) {
                const ok = await deleteSeason(season.seasonId);
                if (ok) navigate('/agriculture');
              }
            }} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,50,50,0.2)', border: '1px solid rgba(255,50,50,0.4)',
              borderRadius: 8, padding: '7px 14px', color: '#ffb3b3', fontSize: 13,
              fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <Trash2 size={15} /> Delete Season
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 16 }}>
          <AlertPanel
            alerts={[{ id: '1', type: 'danger', message: error, module: 'System', createdAt: new Date().toISOString() }]}
            onDismiss={() => setError(null)}
          />
        </div>
      )}

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(165px,1fr))', gap: 12, marginBottom: 20 }}>
        <KpiCard label="Total Expense"  value={formatCurrency(totalExpense, true)} icon={<IndianRupee size={15} />} accent={C.goldDark} />
        <KpiCard label="Total Yield"    value={`${totalYield.toFixed(1)} kg`}       icon={<Leaf size={15} />}        accent={C.greenMid} />
        <KpiCard label="Total Revenue"  value={formatCurrency(totalRevenue, true)}  icon={<TrendingUp size={15} />}  accent={C.greenMid} />
        <KpiCard label="Net Profit"     value={formatCurrency(netProfit, true)}
          sub={`ROI: ${roi.toFixed(1)}%`}
          icon={netProfit >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
          accent={netProfit >= 0 ? C.greenMid : C.red}
        />
      </div>

      {/* Tab bar */}
      <div style={{
        background: '#fff', borderRadius: 12, border: `2px solid ${C.border}`,
        padding: '6px', display: 'flex', gap: 4, marginBottom: 20,
        overflowX: 'auto',
      }}>
        {TAB_DEFS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700,
              border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              background: activeTab === tab.key ? C.green : 'transparent',
              color:       activeTab === tab.key ? '#fff'   : C.muted,
              transition: 'all 0.15s',
            }}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview'  && (
        <OverviewTab
          season={season} expenses={expenses} yields={yields}
          totalExpense={totalExpense} totalRevenue={totalRevenue}
          netProfit={netProfit} roi={roi}
          expByCategory={expByCategory} monthlyData={monthlyData}
        />
      )}
      {activeTab === 'expenses'  && (
        <ExpensesTab
          seasonId={seasonId!} expenses={expenses} setExpenses={setExpenses}
          addExpense={addExpense} deleteExpense={deleteExpense}
        />
      )}
      {activeTab === 'resources' && (
        <ResourcesTab
          seasonId={seasonId!} resources={resources} setResources={setResources}
          addResource={addResource} deleteResource={deleteResource}
        />
      )}
      {activeTab === 'yield' && (
        <YieldTab
          seasonId={seasonId!} yields={yields} setYields={setYields}
          addYield={addYield} deleteYield={deleteYield}
          totalYield={totalYield} totalRevenue={totalRevenue}
          totalExpense={totalExpense} netProfit={netProfit} roi={roi}
        />
      )}
      {activeTab === 'manage' && (
        <ManageTab
          season={season}
          onStatusChange={async (s) => {
            const u = await updateSeason(season.seasonId, { status: s as CropSeason['status'] });
            if (u) setSeason(u);
          }}
        />
      )}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ season, expenses, yields, totalExpense, totalRevenue, netProfit, roi, expByCategory, monthlyData }: {
  season: CropSeason; expenses: SeasonExpense[]; yields: YieldEntry[];
  totalExpense: number; totalRevenue: number; netProfit: number; roi: number;
  expByCategory: { name: string; value: number }[];
  monthlyData: { month: string; expense: number; revenue: number }[];
}) {
  return (
    <div>
      <SectionBox title="Season Details" icon={<Calendar size={15} />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: '12px 20px' }}>
          {[
            { label: 'Crop',          value: season.cropName ?? '—' },
            { label: 'Variety',       value: season.variety  ?? '—' },
            { label: 'Area Sown',     value: `${season.areaSown} ${season.areaUnit}` },
            { label: 'Budget',        value: formatCurrency(season.budget ?? 0) },
            { label: 'Start Date',    value: formatDate(season.startDate) },
            { label: 'End Date',      value: formatDate(season.endDate) },
            { label: 'Expense Logs',  value: String(expenses.length) },
            { label: 'Yield Entries', value: String(yields.length) },
          ].map((r) => (
            <div key={r.label}>
              <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{r.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{r.value}</div>
            </div>
          ))}
        </div>
      </SectionBox>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16, marginBottom: 16 }}>
        <div style={{ background: C.cardBg, borderRadius: 16, border: `2px solid ${C.border}`, padding: '20px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "'Syne',sans-serif", marginBottom: 16 }}>
            Expense vs Revenue
          </div>
          {monthlyData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: C.muted, fontSize: 13 }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8dfc8" />
                <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 11 }} />
                <YAxis tick={{ fill: C.muted, fontSize: 11 }} tickFormatter={(v: number) => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Bar dataKey="expense" fill={C.gold}     radius={[4,4,0,0]} name="Expense" />
                <Bar dataKey="revenue" fill={C.greenMid} radius={[4,4,0,0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ background: C.cardBg, borderRadius: 16, border: `2px solid ${C.border}`, padding: '20px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "'Syne',sans-serif", marginBottom: 16 }}>
            Expense Breakdown
          </div>
          {expByCategory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: C.muted, fontSize: 13 }}>No expenses logged</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={expByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72} innerRadius={36}>
                  {expByCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11 }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Legend wrapperStyle={{ fontSize: 10, color: C.muted }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <SectionBox title="Profitability Summary" icon={<Target size={15} />}>
        {[
          { label: 'Total Expense',     value: totalExpense, color: C.goldDark },
          { label: 'Total Revenue',     value: totalRevenue, color: C.greenMid },
          { label: 'Net Profit / Loss', value: netProfit,    color: netProfit >= 0 ? C.green : C.red },
        ].map((r, i) => (
          <div key={r.label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 0',
            borderBottom: i < 2 ? `1px solid ${C.border}` : 'none',
          }}>
            <span style={{ fontSize: 13, color: C.sub }}>{r.label}</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: r.color, fontFamily: "'Syne',sans-serif" }}>
              {formatCurrency(r.value)}
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 }}>
          <span style={{ fontSize: 13, color: C.sub }}>ROI</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: roi >= 0 ? C.green : C.red, fontFamily: "'Syne',sans-serif" }}>
            {roi.toFixed(1)}%
          </span>
        </div>
      </SectionBox>
    </div>
  );
}

// ─── Expenses Tab ─────────────────────────────────────────────────────────────
function ExpensesTab({ seasonId, expenses, setExpenses, addExpense, deleteExpense }: {
  seasonId: string; expenses: SeasonExpense[];
  setExpenses: React.Dispatch<React.SetStateAction<SeasonExpense[]>>;
  addExpense: (id: string, data: Partial<SeasonExpense>) => Promise<SeasonExpense | null>;
  deleteExpense: (sid: string, eid: string) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ date: '', category: 'SEEDS', description: '', amount: '', quantity: '', unit: '', vendor: '' });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const reset = () => setForm({ date: '', category: 'SEEDS', description: '', amount: '', quantity: '', unit: '', vendor: '' });

  const expIcons: Record<string, React.ReactNode> = {
    LAND_PREP:   <Tractor size={12} />, SEEDS:      <Leaf size={12} />,
    FERTILIZER:  <FlaskConical size={12} />, IRRIGATION: <Droplets size={12} />,
    LABOR:       <Users size={12} />, PEST_CONTROL: <Bug size={12} />,
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const handleSave = async () => {
    if (!form.date || !form.description || !form.amount) return;
    setSaving(true);
    const added = await addExpense(seasonId, {
      date: form.date, category: form.category as SeasonExpense['category'],
      description: form.description, amount: parseFloat(form.amount),
      quantity: form.quantity ? parseFloat(form.quantity) : undefined,
      unit: form.unit || undefined, vendor: form.vendor || undefined,
    });
    setSaving(false);
    if (added) { setExpenses((p) => [...p, added]); setOpen(false); reset(); }
  };

  return (
    <SectionBox title="Expenses" icon={<IndianRupee size={15} />}
      action={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: C.muted }}>
            Total: <strong style={{ color: C.goldDark }}>{formatCurrency(total)}</strong>
          </span>
          <AddBtn label="Log Expense" onClick={() => setOpen(true)} />
        </div>
      }>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.border}` }}>
              {['Date','Category','Description','Qty','Vendor','Amount',''].map((h) => (
                <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: C.muted, fontSize: 13 }}>No expenses logged yet</td></tr>
            ) : expenses.map((e) => (
              <tr key={e.expenseId} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: '10px', color: C.muted }}>{formatDate(e.date)}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.goldDark, fontWeight: 600 }}>
                    {expIcons[e.category]}
                    {EXPENSE_CATEGORIES.find((c) => c.value === e.category)?.label ?? e.category}
                  </span>
                </td>
                <td style={{ padding: '10px', color: C.text }}>{e.description}</td>
                <td style={{ padding: '10px', color: C.muted }}>{e.quantity ? `${e.quantity} ${e.unit ?? ''}` : '—'}</td>
                <td style={{ padding: '10px', color: C.muted }}>{e.vendor ?? '—'}</td>
                <td style={{ padding: '10px', fontWeight: 700, color: C.goldDark }}>{formatCurrency(e.amount)}</td>
                <td style={{ padding: '10px' }}>
                  <button
                    onClick={async () => {
                      const ok = await deleteExpense(seasonId, e.expenseId);
                      if (ok) setExpenses((p) => p.filter((x) => x.expenseId !== e.expenseId));
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d4c9a8' }}>
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SlimModal open={open} onClose={() => { setOpen(false); reset(); }} title="Log Expense" onSave={handleSave} saving={saving}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Date *">
              <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Category">
              <select value={form.category} onChange={(e) => set('category', e.target.value)} style={selectStyle}>
                {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Description *">
            <input value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="e.g. DAP Fertilizer" style={inputStyle} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <Field label="Amount (₹) *">
              <input type="number" value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="0" style={inputStyle} />
            </Field>
            <Field label="Quantity">
              <input type="number" value={form.quantity} onChange={(e) => set('quantity', e.target.value)} placeholder="0" style={inputStyle} />
            </Field>
            <Field label="Unit">
              <input value={form.unit} onChange={(e) => set('unit', e.target.value)} placeholder="kg, bag..." style={inputStyle} />
            </Field>
          </div>
          <Field label="Vendor">
            <input value={form.vendor} onChange={(e) => set('vendor', e.target.value)} placeholder="Supplier name" style={inputStyle} />
          </Field>
        </div>
      </SlimModal>
    </SectionBox>
  );
}

// ─── Resources Tab ────────────────────────────────────────────────────────────
const RESOURCE_TYPES = [
  { value: 'SEED', label: 'Seed' }, { value: 'FERTILIZER', label: 'Fertilizer' },
  { value: 'PESTICIDE', label: 'Pesticide' }, { value: 'WATER', label: 'Water' },
  { value: 'LABOR', label: 'Labour' }, { value: 'EQUIPMENT', label: 'Equipment' },
];

function ResourcesTab({ seasonId, resources, setResources, addResource, deleteResource }: {
  seasonId: string; resources: SeasonResource[];
  setResources: React.Dispatch<React.SetStateAction<SeasonResource[]>>;
  addResource: (id: string, data: Partial<SeasonResource>) => Promise<SeasonResource | null>;
  deleteResource: (sid: string, rid: string) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ date: '', type: 'SEED', name: '', quantity: '', unit: '', cost: '' });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.date || !form.name || !form.quantity) return;
    setSaving(true);
    const added = await addResource(seasonId, {
      date: form.date, type: form.type as SeasonResource['type'],
      name: form.name, quantity: parseFloat(form.quantity),
      unit: form.unit, cost: form.cost ? parseFloat(form.cost) : 0,
    });
    setSaving(false);
    if (added) { setResources((p) => [...p, added]); setOpen(false); }
  };

  return (
    <SectionBox title="Resources Used" icon={<Package size={15} />} action={<AddBtn label="Add Resource" onClick={() => setOpen(true)} />}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.border}` }}>
              {['Date','Type','Resource','Quantity','Cost',''].map((h) => (
                <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resources.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: C.muted }}>No resources logged</td></tr>
            ) : resources.map((r) => (
              <tr key={r.resourceId} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: '10px', color: C.muted }}>{formatDate(r.date)}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#eaf4ea', color: C.greenMid }}>
                    {RESOURCE_TYPES.find((t) => t.value === r.type)?.label ?? r.type}
                  </span>
                </td>
                <td style={{ padding: '10px', color: C.text, fontWeight: 600 }}>{r.name}</td>
                <td style={{ padding: '10px', color: C.muted }}>{r.quantity} {r.unit}</td>
                <td style={{ padding: '10px', fontWeight: 700, color: C.goldDark }}>{formatCurrency(r.cost)}</td>
                <td style={{ padding: '10px' }}>
                  <button
                    onClick={async () => {
                      const ok = await deleteResource(seasonId, r.resourceId);
                      if (ok) setResources((p) => p.filter((x) => x.resourceId !== r.resourceId));
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d4c9a8' }}>
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SlimModal open={open} onClose={() => setOpen(false)} title="Add Resource" onSave={handleSave} saving={saving}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Date *"><input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} style={inputStyle} /></Field>
            <Field label="Type">
              <select value={form.type} onChange={(e) => set('type', e.target.value)} style={selectStyle}>
                {RESOURCE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Resource Name *"><input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Urea, Neem oil" style={inputStyle} /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <Field label="Quantity *"><input type="number" value={form.quantity} onChange={(e) => set('quantity', e.target.value)} style={inputStyle} /></Field>
            <Field label="Unit"><input value={form.unit} onChange={(e) => set('unit', e.target.value)} placeholder="kg, L..." style={inputStyle} /></Field>
            <Field label="Cost (₹)"><input type="number" value={form.cost} onChange={(e) => set('cost', e.target.value)} style={inputStyle} /></Field>
          </div>
        </div>
      </SlimModal>
    </SectionBox>
  );
}

// ─── Yield Tab ────────────────────────────────────────────────────────────────
function YieldTab({ seasonId, yields, setYields, addYield, deleteYield, totalYield, totalRevenue, totalExpense, netProfit, roi }: {
  seasonId: string; yields: YieldEntry[];
  setYields: React.Dispatch<React.SetStateAction<YieldEntry[]>>;
  addYield: (id: string, data: Partial<YieldEntry>) => Promise<YieldEntry | null>;
  deleteYield: (sid: string, yid: string) => Promise<boolean>;
  totalYield: number; totalRevenue: number; totalExpense: number; netProfit: number; roi: number;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ date: '', quantity: '', unit: 'kg', grade: '', marketPrice: '', notes: '' });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.date || !form.quantity || !form.marketPrice) return;
    setSaving(true);
    const qty = parseFloat(form.quantity), price = parseFloat(form.marketPrice);
    const added = await addYield(seasonId, {
      date: form.date, quantity: qty, unit: form.unit,
      grade: form.grade || undefined, marketPrice: price, revenue: qty * price,
      notes: form.notes || undefined,
    });
    setSaving(false);
    if (added) { setYields((p) => [...p, added]); setOpen(false); }
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12, marginBottom: 16 }}>
        <KpiCard label="Total Yield"  value={`${totalYield.toFixed(1)} kg`}       icon={<Leaf size={14} />}        accent={C.greenMid} />
        <KpiCard label="Revenue"      value={formatCurrency(totalRevenue, true)}   icon={<TrendingUp size={14} />}  accent={C.greenMid} />
        <KpiCard label="Expense"      value={formatCurrency(totalExpense, true)}   icon={<IndianRupee size={14} />} accent={C.goldDark} />
        <KpiCard label="ROI"          value={`${roi.toFixed(1)}%`} sub={`Net: ${formatCurrency(netProfit, true)}`}
          icon={<Target size={14} />} accent={roi >= 0 ? C.greenMid : C.red}
        />
      </div>
      <SectionBox title="Yield Entries" icon={<Leaf size={15} />} action={<AddBtn label="Log Yield" onClick={() => setOpen(true)} />}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                {['Date','Quantity','Grade','Price/Unit','Revenue','Notes',''].map((h) => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {yields.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: C.muted }}>No yield entries yet</td></tr>
              ) : yields.map((y) => (
                <tr key={y.yieldId} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '10px', color: C.muted }}>{formatDate(y.date)}</td>
                  <td style={{ padding: '10px', fontWeight: 700, color: C.text }}>{y.quantity} {y.unit}</td>
                  <td style={{ padding: '10px' }}>
                    {y.grade
                      ? <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#fff4d6', color: '#8a5a00' }}>{y.grade}</span>
                      : <span style={{ color: C.muted }}>—</span>}
                  </td>
                  <td style={{ padding: '10px', color: C.muted }}>₹{y.marketPrice}</td>
                  <td style={{ padding: '10px', fontWeight: 700, color: C.greenMid }}>{formatCurrency(y.revenue)}</td>
                  <td style={{ padding: '10px', color: C.muted }}>{y.notes ?? '—'}</td>
                  <td style={{ padding: '10px' }}>
                    <button
                      onClick={async () => {
                        const ok = await deleteYield(seasonId, y.yieldId);
                        if (ok) setYields((p) => p.filter((x) => x.yieldId !== y.yieldId));
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d4c9a8' }}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionBox>

      <SlimModal open={open} onClose={() => setOpen(false)} title="Log Yield Entry" onSave={handleSave} saving={saving}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Harvest Date *"><input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} style={inputStyle} /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Quantity *"><input type="number" value={form.quantity} onChange={(e) => set('quantity', e.target.value)} style={inputStyle} /></Field>
            <Field label="Unit">
              <select value={form.unit} onChange={(e) => set('unit', e.target.value)} style={selectStyle}>
                {YIELD_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Market Price (₹/unit) *"><input type="number" value={form.marketPrice} onChange={(e) => set('marketPrice', e.target.value)} style={inputStyle} /></Field>
            <Field label="Grade"><input value={form.grade} onChange={(e) => set('grade', e.target.value)} placeholder="A, Premium..." style={inputStyle} /></Field>
          </div>
          {form.quantity && form.marketPrice && (
            <div style={{ background: '#eaf4ea', borderRadius: 8, padding: '10px 14px', border: '1px solid #b8d8b8' }}>
              <div style={{ fontSize: 10, color: C.sub }}>Estimated Revenue</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.green, fontFamily: "'Syne',sans-serif" }}>
                {formatCurrency(parseFloat(form.quantity) * parseFloat(form.marketPrice))}
              </div>
            </div>
          )}
          <Field label="Notes"><input value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Optional notes" style={inputStyle} /></Field>
        </div>
      </SlimModal>
    </div>
  );
}

// ─── Manage Tab ───────────────────────────────────────────────────────────────
function ManageTab({ season, onStatusChange }: { season: CropSeason; onStatusChange: (s: string) => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const steps = [
    { key: 'PLANNED',   num: '1', label: 'Planned',   desc: 'Season created, not yet started.' },
    { key: 'ACTIVE',    num: '2', label: 'Active',    desc: 'Farming operations underway.' },
    { key: 'HARVESTED', num: '3', label: 'Harvested', desc: 'Crop harvested, yield recorded.' },
    { key: 'COMPLETED', num: '4', label: 'Completed', desc: 'Season closed, P&L finalised.' },
    { key: 'ABANDONED', num: '!', label: 'Abandoned', desc: 'Season abandoned before completion.' },
  ];

  return (
    <SectionBox title="Season Lifecycle" icon={<Calendar size={15} />}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {steps.map((step) => {
          const isCurrent = season.status === step.key;
          const cfg = STATUS_CFG[step.key];
          return (
            <div key={step.key} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', borderRadius: 12,
              background: isCurrent ? cfg.bg : '#faf8f3',
              border: `2px solid ${isCurrent ? cfg.border : C.border}`,
              transition: 'all 0.15s',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: isCurrent ? cfg.border : '#e8dfc8',
                color: isCurrent ? '#fff' : C.muted,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800,
              }}>{step.num}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: isCurrent ? cfg.color : C.text }}>{step.label}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{step.desc}</div>
              </div>
              {isCurrent ? (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: cfg.border, color: '#fff' }}>
                  Current
                </span>
              ) : (
                <button disabled={saving}
                  onClick={async () => { setSaving(true); await onStatusChange(step.key); setSaving(false); }}
                  style={{
                    background: '#fff', border: `1.5px solid ${C.border}`, borderRadius: 8,
                    padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    color: C.sub, transition: 'all 0.15s',
                  }}>
                  Set Status
                </button>
              )}
            </div>
          );
        })}
      </div>
      {season.notes && (
        <div style={{ marginTop: 16, padding: '14px', background: '#f7f3eb', borderRadius: 10, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Notes</div>
          <p style={{ margin: 0, fontSize: 13, color: C.sub, lineHeight: 1.6 }}>{season.notes}</p>
        </div>
      )}
    </SectionBox>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildMonthlyData(expenses: SeasonExpense[], yields: YieldEntry[]) {
  const months: Record<string, { expense: number; revenue: number }> = {};
  expenses.forEach((e) => {
    const m = e.date.slice(0, 7);
    months[m] = months[m] ?? { expense: 0, revenue: 0 };
    months[m].expense += e.amount;
  });
  yields.forEach((y) => {
    const m = y.date.slice(0, 7);
    months[m] = months[m] ?? { expense: 0, revenue: 0 };
    months[m].revenue += y.revenue;
  });
  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      ...data,
    }));
}

function PageSkeleton() {
  return (
    <div style={{ background: C.cream, minHeight: '100%' }}>
      <div style={{ height: 140, borderRadius: 16, background: 'linear-gradient(135deg,#d0e8d0,#e8e0c8)', marginBottom: 20 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[1,2,3,4].map((i) => <div key={i} style={{ height: 90, borderRadius: 13, background: '#e8dfc8' }} />)}
      </div>
      <div style={{ height: 48, borderRadius: 12, background: '#e8dfc8', marginBottom: 20 }} />
      <div style={{ height: 300, borderRadius: 16, background: '#e8dfc8' }} />
    </div>
  );
}