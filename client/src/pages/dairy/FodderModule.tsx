// client/src/pages/dairy/FodderModule.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFodder } from '../../hooks/useDairyData'
import { Input, Select } from '../../components/ui/Input'
import { TextArea } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { formatDate, formatCurrency } from '../../lib/utils'
import { FODDER_TYPES } from '../../lib/constant'
import type { FodderCrop, FodderStock } from '../../types/index'

const FODDER_COLORS: Record<string, string> = {
  GREEN: '#10b981', DRY: '#f59e0b', SILAGE: '#0891b2',
  CONCENTRATE: '#8b5cf6', SUPPLEMENT: '#f43f5e',
}
const CROP_STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  PLANNED:  { bg: '#f1f5f9', text: '#475569' },
  GROWING:  { bg: '#ecfdf5', text: '#065f46' },
  HARVESTED:{ bg: '#eff6ff', text: '#1e3a8a' },
}

const tabs = ['Cultivation', 'Stock'] as const
const fodderOpts = FODDER_TYPES.map((f) => ({ value: f.value, label: f.label }))
const cropStatusOpts = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'GROWING', label: 'Growing' },
  { value: 'HARVESTED', label: 'Harvested' },
]

export default function FodderModule() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<typeof tabs[number]>('Cultivation')
  const [showAddCrop, setShowAddCrop]   = useState(false)
  const [showAddStock, setShowAddStock] = useState(false)
  const [saving, setSaving] = useState(false)

  const { crops, stock, loading, error, fetchCrops, fetchStock, addCrop, addStock } = useFodder()

  const [cropForm, setCropForm] = useState({
    cropName: '', variety: '', area: '', plantingDate: '',
    expectedHarvestDate: '', status: 'PLANNED', expectedYield: '', cost: '', notes: '',
  })
  const [stockForm, setStockForm] = useState({
    fodderType: 'GREEN', fodderName: '', quantity: '',
    unit: 'kg', costPerUnit: '', purchaseDate: '', expiryDate: '', supplier: '', notes: '',
  })

  useEffect(() => { fetchCrops(); fetchStock() }, [fetchCrops, fetchStock])

  const handleAddCrop = async () => {
    setSaving(true)
    try {
      await addCrop({
        ...cropForm,
        area: cropForm.area ? Number(cropForm.area) : undefined,
        expectedYield: cropForm.expectedYield ? Number(cropForm.expectedYield) : undefined,
        cost: cropForm.cost ? Number(cropForm.cost) : undefined,
      })
      setShowAddCrop(false); fetchCrops()
    } catch { } finally { setSaving(false) }
  }

  const handleAddStock = async () => {
    setSaving(true)
    try {
      await addStock({
        ...stockForm,
        quantity: Number(stockForm.quantity),
        costPerUnit: stockForm.costPerUnit ? Number(stockForm.costPerUnit) : undefined,
      })
      setShowAddStock(false); fetchStock()
    } catch { } finally { setSaving(false) }
  }

  const totalStockValue = stock.reduce((s, r) => s + r.quantity * (r.costPerUnit ?? 0), 0)
  const activeCrops     = crops.filter((c) => c.status === 'GROWING').length
  const lowStock        = stock.filter((s) => s.quantity < 50).length

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#f8fafc' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button onClick={() => navigate('/dairy')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18 }}>←</button>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>🌾 Fodder & Feed Management</h1>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Track crops, stock & feed expenses</p>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
          {[
            { label: 'Total Crops',  value: crops.length,  color: '#16a34a' },
            { label: 'Growing Now',  value: activeCrops,    color: '#10b981' },
            { label: 'Stock Items',  value: stock.length,   color: '#2563eb' },
            { label: 'Stock Value',  value: formatCurrency(totalStockValue), color: '#7c3aed' },
          ].map((k) => (
            <div key={k.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, margin: '0 0 3px' }}>{k.label}</p>
              <p style={{ fontSize: 17, fontWeight: 800, color: k.color, margin: 0 }}>{loading ? '…' : String(k.value)}</p>
            </div>
          ))}
        </div>

        {/* Low stock alert */}
        {lowStock > 0 && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#dc2626', marginBottom: 10 }}>
            ⚠ {lowStock} stock item{lowStock > 1 ? 's' : ''} below 50 kg — consider restocking
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0 }}>
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 18px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
              color: tab === t ? '#16a34a' : '#64748b',
              borderBottom: tab === t ? '2.5px solid #16a34a' : '2.5px solid transparent',
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 24px' }}>
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{error}</div>}

        {/* Cultivation tab */}
        {tab === 'Cultivation' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <button onClick={() => setShowAddCrop(true)} style={{
                background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8,
                padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>+ Add Fodder Crop</button>
            </div>

            {crops.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                <p style={{ fontSize: 40, margin: '0 0 10px' }}>🌱</p>
                <p style={{ fontSize: 14, margin: 0 }}>No fodder crops recorded yet</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                {(crops as FodderCrop[]).map((crop) => {
                  const st = CROP_STATUS_STYLE[crop.status] ?? CROP_STATUS_STYLE.PLANNED
                  return (
                    <div key={crop._id} style={{
                      background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
                      padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>{crop.cropName}</p>
                          {crop.variety && <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{crop.variety}</p>}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: st.bg, color: st.text }}>
                          {crop.status}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 10px', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                        <CropRow label="Area" value={crop.area ? `${crop.area} acres` : '—'} />
                        <CropRow label="Planted" value={formatDate(crop.plantingDate ?? '')} />
                        <CropRow label="Harvest" value={formatDate(crop.expectedHarvestDate ?? '')} />
                        <CropRow label="Exp. Yield" value={crop.expectedYield != null ? `${crop.expectedYield} kg` : '—'} />
                        {crop.cost != null && <CropRow label="Cost" value={formatCurrency(crop.cost)} />}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Stock tab */}
        {tab === 'Stock' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <button onClick={() => setShowAddStock(true)} style={{
                background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8,
                padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>+ Add Stock</button>
            </div>

            {stock.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                <p style={{ fontSize: 40, margin: '0 0 10px' }}>📦</p>
                <p style={{ fontSize: 14, margin: 0 }}>No fodder stock recorded</p>
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      {['Fodder', 'Type', 'Qty', 'Rate', 'Value', 'Purchased', 'Expiry', 'Supplier'].map((h) => (
                        <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(stock as FodderStock[]).map((s, i) => {
                      const color = FODDER_COLORS[s.fodderType] ?? '#94a3b8'
                      const value = s.quantity * (s.costPerUnit ?? 0)
                      const isLow = s.quantity < 50
                      return (
                        <tr key={s._id} style={{ borderBottom: i < stock.length - 1 ? '1px solid #f1f5f9' : 'none', background: isLow ? '#fef2f210' : '#fff' }}>
                          <td style={{ padding: '9px 14px', fontWeight: 600, color: '#0f172a' }}>
                            {isLow && <span style={{ marginRight: 4, color: '#ef4444' }}>⚠</span>}
                            {s.fodderName}
                          </td>
                          <td style={{ padding: '9px 14px' }}>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: color + '18', color }}>
                              {s.fodderType}
                            </span>
                          </td>
                          <td style={{ padding: '9px 14px', fontWeight: 700, color: isLow ? '#dc2626' : '#0f172a' }}>
                            {s.quantity} {s.unit}
                          </td>
                          <td style={{ padding: '9px 14px', color: '#64748b' }}>{s.costPerUnit != null ? `₹${s.costPerUnit}/${s.unit}` : '—'}</td>
                          <td style={{ padding: '9px 14px', fontWeight: 600, color: '#334155' }}>{value > 0 ? formatCurrency(value) : '—'}</td>
                          <td style={{ padding: '9px 14px', color: '#64748b' }}>{formatDate(s.purchaseDate ?? '')}</td>
                          <td style={{ padding: '9px 14px', color: '#64748b' }}>{formatDate(s.expiryDate ?? '')}</td>
                          <td style={{ padding: '9px 14px', color: '#64748b' }}>{s.supplier ?? '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Crop Modal */}
      <Modal open={showAddCrop} onClose={() => setShowAddCrop(false)} title="Add Fodder Crop" size="lg"
        footer={<>
          <button onClick={() => setShowAddCrop(false)} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button onClick={handleAddCrop} disabled={saving} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            {saving ? 'Saving…' : 'Save Crop'}
          </button>
        </>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Crop Name *" value={cropForm.cropName} onChange={(e) => setCropForm({ ...cropForm, cropName: e.target.value })} placeholder="e.g. Napier Grass" />
            <Input label="Variety"    value={cropForm.variety}  onChange={(e) => setCropForm({ ...cropForm, variety: e.target.value })} placeholder="Variety" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Area (acres)" type="number" value={cropForm.area} onChange={(e) => setCropForm({ ...cropForm, area: e.target.value })} />
            <Select label="Status" options={cropStatusOpts} value={cropForm.status} onChange={(e) => setCropForm({ ...cropForm, status: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Planting Date"    type="date" value={cropForm.plantingDate}        onChange={(e) => setCropForm({ ...cropForm, plantingDate: e.target.value })} />
            <Input label="Expected Harvest" type="date" value={cropForm.expectedHarvestDate} onChange={(e) => setCropForm({ ...cropForm, expectedHarvestDate: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Expected Yield (kg)" type="number" value={cropForm.expectedYield} onChange={(e) => setCropForm({ ...cropForm, expectedYield: e.target.value })} />
            <Input label="Cost (₹)"            type="number" value={cropForm.cost}          onChange={(e) => setCropForm({ ...cropForm, cost: e.target.value })} />
          </div>
          <TextArea label="Notes" value={cropForm.notes} onChange={(e) => setCropForm({ ...cropForm, notes: e.target.value })} />
        </div>
      </Modal>

      {/* Add Stock Modal */}
      <Modal open={showAddStock} onClose={() => setShowAddStock(false)} title="Add Fodder Stock" size="lg"
        footer={<>
          <button onClick={() => setShowAddStock(false)} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button onClick={handleAddStock} disabled={saving} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            {saving ? 'Saving…' : 'Save Stock'}
          </button>
        </>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select label="Type *"       options={fodderOpts} value={stockForm.fodderType} onChange={(e) => setStockForm({ ...stockForm, fodderType: e.target.value })} />
            <Input  label="Fodder Name *" value={stockForm.fodderName} onChange={(e) => setStockForm({ ...stockForm, fodderName: e.target.value })} placeholder="e.g. Wheat Straw" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Input label="Quantity *" type="number" value={stockForm.quantity}    onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })} />
            <Input label="Unit"       value={stockForm.unit}                      onChange={(e) => setStockForm({ ...stockForm, unit: e.target.value })} placeholder="kg" />
            <Input label="Cost/Unit"  type="number" value={stockForm.costPerUnit} onChange={(e) => setStockForm({ ...stockForm, costPerUnit: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Purchase Date" type="date" value={stockForm.purchaseDate} onChange={(e) => setStockForm({ ...stockForm, purchaseDate: e.target.value })} />
            <Input label="Expiry Date"   type="date" value={stockForm.expiryDate}   onChange={(e) => setStockForm({ ...stockForm, expiryDate: e.target.value })} />
          </div>
          <Input label="Supplier" value={stockForm.supplier} onChange={(e) => setStockForm({ ...stockForm, supplier: e.target.value })} />
          <TextArea label="Notes" value={stockForm.notes} onChange={(e) => setStockForm({ ...stockForm, notes: e.target.value })} />
        </div>
      </Modal>
    </div>
  )
}

function CropRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 1px' }}>{label}</p>
      <p style={{ fontSize: 12, fontWeight: 500, color: '#334155', margin: 0 }}>{value}</p>
    </div>
  )
}