import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { IndianRupee, Leaf, Target, TrendingUp, Trash2, Plus } from 'lucide-react';
import type { YieldEntry } from '../../types/index';
import { formatCurrency, formatDate } from '../../lib/utils';
import { YIELD_UNITS } from '../../lib/constant';
import api from '../../lib/api';

// Local design tokens
const C = {
  green: '#1a5c1a', greenMid: '#237a23', gold: '#f5a623',
  goldDark: '#e8960e', cream: '#f5f0e8', cardBg: '#ffffff',
  border: '#e0d5c0', text: '#1a3a0a', sub: '#6b7c50',
  muted: '#8a7a50', red: '#c0392b',
}

function KpiCard({ label, value, sub, icon, accent }: {
  label: string; value: string; sub?: string; icon: React.ReactNode; accent: string
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
        <span style={{ width: 28, height: 28, borderRadius: 7, background: `${accent}18`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: C.text, fontFamily: "'Syne',sans-serif" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

function SlimModal({ open, onClose, title, children, onSave, saving }: {
  open: boolean; onClose: () => void; title: string;
  children: React.ReactNode; onSave: () => void; saving: boolean;
}) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }} onClick={onClose} />
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
          <button onClick={onSave} disabled={saving} style={{ background: saving ? '#8ab88a' : C.green, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  border: `1.5px solid ${C.border}`, borderRadius: 8,
  padding: '8px 12px', fontSize: 13, color: C.text,
  background: '#faf8f3', outline: 'none', width: '100%',
}
const selectStyle: React.CSSProperties = { ...inputStyle }

function YieldTab({ seasonId, yields, setYields, addYield, deleteYield, totalYield, totalRevenue, totalExpense, netProfit, roi }: {
  seasonId: string; yields: YieldEntry[];
  setYields: React.Dispatch<React.SetStateAction<YieldEntry[]>>;
  addYield: (id: string, data: Partial<YieldEntry>) => Promise<YieldEntry | null>;
  deleteYield: (sid: string, yid: string) => Promise<boolean>;
  totalYield: number; totalRevenue: number; totalExpense: number; netProfit: number; roi: number;
}) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ date: '', quantity: '', unit: 'kg', grade: '', marketPrice: '', notes: '' })
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.date || !form.quantity || !form.marketPrice) return
    setSaving(true)
    const qty = parseFloat(form.quantity), price = parseFloat(form.marketPrice)
    const added = await addYield(seasonId, {
      date: form.date, quantity: qty, unit: form.unit,
      grade: form.grade || undefined, marketPrice: price, revenue: qty * price,
      notes: form.notes || undefined,
    })
    setSaving(false)
    if (added) {
      setYields((p) => [...p, added])
      setOpen(false)
      setForm({ date: '', quantity: '', unit: 'kg', grade: '', marketPrice: '', notes: '' })
    }
  }

  const handleDelete = async (y: YieldEntry) => {
    const deleteId = (y as any)._id ?? y.yieldId
    if (!deleteId) return

    const ok = await deleteYield(seasonId, deleteId)
    if (ok) {
      setYields((p) => p.filter((x) => {
        const xId = (x as any)._id ?? x.yieldId
        return xId !== deleteId
      }))
    }
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12, marginBottom: 16 }}>
        <KpiCard label="Total Yield" value={`${totalYield.toFixed(1)} kg`} icon={<Leaf size={14} />} accent={C.greenMid} />
        <KpiCard label="Revenue" value={formatCurrency(totalRevenue, true)} icon={<TrendingUp size={14} />} accent={C.greenMid} />
        <KpiCard label="Expense" value={formatCurrency(totalExpense, true)} icon={<IndianRupee size={14} />} accent={C.goldDark} />
        <KpiCard label="ROI" value={`${roi.toFixed(1)}%`} sub={`Net: ${formatCurrency(netProfit, true)}`}
          icon={<Target size={14} />} accent={roi >= 0 ? C.greenMid : C.red}
        />
      </div>

      <div style={{ background: C.cardBg, borderRadius: 16, border: `2px solid ${C.border}`, padding: '20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: C.greenMid }}><Leaf size={15} /></span>
            <span style={{ fontSize: 14, fontWeight: 800, color: C.text, fontFamily: "'Syne',sans-serif" }}>Yield Entries</span>
          </div>
          <button onClick={() => setOpen(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: C.green, color: '#fff', border: 'none',
            borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>
            <Plus size={13} /> Log Yield
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                {['Date', 'Quantity', 'Grade', 'Price/Unit', 'Revenue', 'Notes', ''].map((h) => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {yields.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: C.muted }}>No yield entries yet</td></tr>
              ) : yields.map((y) => {
                const rowKey = (y as any)._id ?? y.yieldId ?? Math.random().toString()
                return (
                  <tr key={rowKey} style={{ borderBottom: `1px solid ${C.border}` }}>
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
                        onClick={() => handleDelete(y)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d4c9a8' }}
                        title="Delete yield entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

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
  )
}

// MAIN COMPONENT - Default export
export default function SeasonDetail() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [loading, setLoading] = useState(true);
  const [yields, setYields] = useState<YieldEntry[]>([]);
  const [totalYield, setTotalYield] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [roi, setRoi] = useState(0);

  useEffect(() => {
    if (seasonId) {
      fetchSeasonData();
    }
  }, [seasonId]);

  const fetchSeasonData = async () => {
    try {
      const response = await api.get(`/agriculture/seasons/${seasonId}`);
      const data = response.data?.data || response.data;
      setYields(data.yields || []);
      // Calculate totals
      const yieldTotal = data.yields?.reduce((sum: number, y: YieldEntry) => sum + y.quantity, 0) || 0;
      const revenueTotal = data.yields?.reduce((sum: number, y: YieldEntry) => sum + (y.revenue || 0), 0) || 0;
      setTotalYield(yieldTotal);
      setTotalRevenue(revenueTotal);
      // You'll need to get expense data from your API
      setTotalExpense(data.totalExpense || 0);
      const profit = revenueTotal - (data.totalExpense || 0);
      setNetProfit(profit);
      setRoi(data.totalExpense ? (profit / data.totalExpense) * 100 : 0);
    } catch (error) {
      console.error('Failed to fetch season data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addYield = async (id: string, data: Partial<YieldEntry>) => {
    try {
      const response = await api.post(`/agriculture/seasons/${id}/yields`, data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Failed to add yield:', error);
      return null;
    }
  };

  const deleteYield = async (seasonId: string, yieldId: string) => {
    try {
      await api.delete(`/agriculture/seasons/${seasonId}/yields/${yieldId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete yield:', error);
      return false;
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading season data...</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1>Season Details</h1>
      <YieldTab
        seasonId={seasonId!}
        yields={yields}
        setYields={setYields}
        addYield={addYield}
        deleteYield={deleteYield}
        totalYield={totalYield}
        totalRevenue={totalRevenue}
        totalExpense={totalExpense}
        netProfit={netProfit}
        roi={roi}
      />
    </div>
  );
}