// src/pages/shop/Processing.tsx
import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Filter, ChevronDown, ChevronUp, Trash2, Edit2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import  Modal  from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/Input'
import { Table } from '../../components/ui/Table'
import { formatCurrency, formatDate, daysUntil, getProductLabel, marginPct } from '../../lib/utils'
import { PRODUCT_TYPES, BATCH_STATUSES, MILK_SOURCES, PRODUCT_UNITS } from '../../lib/constant'
import type { Batch, CreateBatchPayload, ProductType } from '../../types'
import { shopApi } from '../../lib/api'

const STATUS_BADGE: Record<string, 'amber' | 'green' | 'red'> = {
  PROCESSING: 'amber',
  READY:      'green',
  EXPIRED:    'red',
}

const Processing: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterProduct, setFilterProduct] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [detailBatch, setDetailBatch] = useState<Batch | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await shopApi.getBatches({
        ...(filterStatus ? { status: filterStatus } : {}),
        ...(filterProduct ? { productType: filterProduct } : {}),
      })
      setBatches(res.data.data ?? res.data)
    } catch {
      setError('Could not load batches from API.')
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterProduct])

  useEffect(() => { load() }, [load])

  const filtered = batches.filter((b) =>
    !search ||
    getProductLabel(b.productType).toLowerCase().includes(search.toLowerCase()) ||
    b.batchId.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this batch?')) return
    try {
      await shopApi.deleteBatch(id)
      setBatches((prev) => prev.filter((b) => b._id !== id))
    } catch {
      alert('Failed to delete batch.')
    }
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Batch Processing</h2>
          <p className="text-sm text-slate-400 mt-0.5">Milk → Product lifecycle management</p>
        </div>
        <Button
          icon={<Plus size={15} />}
          onClick={() => { setDetailBatch(null); setShowModal(true) }}
        >
          New Batch
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search batch or product…"
            className="w-full h-10 pl-9 pr-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-slate-400" />
          {(['', ...BATCH_STATUSES] as const).map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setFilterStatus(s)}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer',
                filterStatus === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
              ].join(' ')}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
        <select
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
          className="h-10 px-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Products</option>
          {PRODUCT_TYPES.map((p) => (
            <option key={p} value={p}>{getProductLabel(p)}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Table */}
      
      <Table<Batch & Record<string, unknown>>
        data={filtered as (Batch & Record<string, unknown>)[]}
        loading={loading}
        emptyMessage="No batches found. Create your first batch."
        
        onRowClick={(row) => { setDetailBatch(row as Batch); setShowModal(true) }}
        columns={[
          {
            key: 'batchId',
            header: 'Batch ID',
            render: (row) => (
              <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                {(row as Batch).batchId}
              </span>
            ),
          },
          {
            key: 'productType',
            header: 'Product',
            render: (row) => (
              <span className="font-semibold text-slate-800">{getProductLabel((row as Batch).productType)}</span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (row) => {
              const b = row as Batch
              return <Badge variant={STATUS_BADGE[b.status]} dot>{b.status}</Badge>
            },
          },
          {
            key: 'productionDate',
            header: 'Produced',
            render: (row) => formatDate((row as Batch).productionDate),
          },
          {
            key: 'expiryDate',
            header: 'Expires',
            render: (row) => {
              const b = row as Batch
              const days = daysUntil(b.expiryDate)
              return (
                <span className={days <= 2 ? 'text-red-600 font-semibold' : days <= 5 ? 'text-amber-600' : 'text-slate-600'}>
                  {formatDate(b.expiryDate)}
                  {days >= 0 && days <= 5 && <span className="ml-1 text-xs">({days}d)</span>}
                </span>
              )
            },
          },
          {
            key: 'stockRemaining',
            header: 'Stock',
            render: (row) => {
              const b = row as Batch
              const unit = PRODUCT_UNITS[b.productType] ?? 'units'
              const pct = b.output.quantityProduced > 0
                ? Math.round((b.stockRemaining / b.output.quantityProduced) * 100)
                : 0
              return (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{b.stockRemaining} {unit}</span>
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct > 50 ? 'bg-emerald-500' : pct > 20 ? 'bg-amber-400' : 'bg-red-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            },
          },
          {
            key: 'pricing',
            header: 'Price / Cost',
            render: (row) => {
              const b = row as Batch
              const margin = marginPct(b.pricing.costPerUnit, b.pricing.sellingPricePerUnit)
              return (
                <div>
                  <span className="font-semibold text-slate-800">{formatCurrency(b.pricing.sellingPricePerUnit)}</span>
                  <span className="text-slate-400 mx-1">/</span>
                  <span className="text-slate-500 text-xs">{formatCurrency(b.pricing.costPerUnit)}</span>
                  <span className="ml-2 text-xs font-semibold text-emerald-600">{margin}% margin</span>
                </div>
              )
            },
          },
          {
            key: 'qualityScore',
            header: 'Quality',
            render: (row) => {
              const score = (row as Batch).qualityScore
              return (
                <div className="flex items-center gap-1">
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${score}%` }} />
                  </div>
                  <span className="text-xs text-slate-500">{score}%</span>
                </div>
              )
            },
          },
          {
            key: 'actions',
            header: '',
            render: (row) => (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => { setDetailBatch(row as Batch); setShowModal(true) }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDelete((row as Batch)._id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ),
          },
        ]}
      />

      {/* Create / Edit Modal */}
      <BatchModal
        open={showModal}
        batch={detailBatch}
        saving={saving}
        formError={formError}
        onClose={() => { setShowModal(false); setDetailBatch(null); setFormError(null) }}
        onSave={async (payload) => {
          setSaving(true)
          setFormError(null)
          try {
            if (detailBatch) {
              const res = await shopApi.updateBatch(detailBatch._id, payload)
              const updated = res.data.data ?? res.data
              setBatches((prev) => prev.map((b) => b._id === updated._id ? updated : b))
            } else {
              const res = await shopApi.createBatch(payload)
              const created = res.data.data ?? res.data
              setBatches((prev) => [created, ...prev])
            }
            setShowModal(false)
            setDetailBatch(null)
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Save failed'
            setFormError(msg)
          } finally {
            setSaving(false)
          }
        }}
      />
    </div>
  )
}

// ─── Batch Modal ─────────────────────────────────────────────────────────────
interface BatchModalProps {
  open: boolean
  batch: Batch | null
  saving: boolean
  formError: string | null
  onClose: () => void
  onSave: (payload: CreateBatchPayload) => Promise<void>
}

const defaultForm = (): CreateBatchPayload => ({
  productType: 'PANEER',
  productionDate: new Date().toISOString().slice(0, 10),
  expiryDate: '',
  input: { milkLiters: 0, milkSource: 'INTERNAL', avgFat: 0, avgSNF: 0, milkCost: 0 },
  costs: { labor: 0, fuel: 0, ingredients: 0, packaging: 0, utilities: 0 },
  output: { quantityProduced: 0, wastage: 0 },
  pricing: { costPerUnit: 0, sellingPricePerUnit: 0 },
  qualityScore: 100,
})

const SECTIONS = [
  { key: 'input',   label: 'Milk Input' },
  { key: 'costs',   label: 'Processing Costs' },
  { key: 'output',  label: 'Output' },
  { key: 'pricing', label: 'Pricing' },
]

const BatchModal: React.FC<BatchModalProps> = ({
  open, batch, saving, formError, onClose, onSave
}) => {
  const [form, setForm] = useState<CreateBatchPayload>(defaultForm)
  const [openSection, setOpenSection] = useState<string>('input')

  useEffect(() => {
    if (batch) {
      setForm({
        productType: batch.productType,
        productionDate: batch.productionDate.slice(0, 10),
        expiryDate: batch.expiryDate.slice(0, 10),
        input: { ...batch.input },
        costs: { ...batch.costs },
        output: { ...batch.output },
        pricing: { ...batch.pricing },
        qualityScore: batch.qualityScore,
      })
    } else {
      setForm(defaultForm())
    }
  }, [batch, open])

  const setNested = <K extends keyof CreateBatchPayload>(
    section: K,
    field: string,
    value: string | number
  ) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...(prev[section] as unknown as Record<string, unknown>), [field]: value },
    }))
  }

  const totalCost = Object.values(form.costs).reduce((s, v) => s + Number(v), 0)
    + Number(form.input.milkCost)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={batch ? `Edit Batch — ${batch.batchId}` : 'Create New Batch'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button loading={saving} onClick={() => onSave(form)}>
            {batch ? 'Update Batch' : 'Create Batch'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Top fields */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Product Type"
            value={form.productType}
            onChange={(e) => setForm((p) => ({ ...p, productType: e.target.value as ProductType }))}
            options={PRODUCT_TYPES.map((t) => ({ value: t, label: getProductLabel(t) }))}
          />
          <Select
            label="Status"
            value="PROCESSING"
            onChange={() => {}}
            options={BATCH_STATUSES.map((s) => ({ value: s, label: s }))}
            disabled={!batch}
          />
          <Input
            label="Production Date"
            type="date"
            value={form.productionDate}
            onChange={(e) => setForm((p) => ({ ...p, productionDate: e.target.value }))}
          />
          <Input
            label="Expiry Date"
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm((p) => ({ ...p, expiryDate: e.target.value }))}
          />
          <Input
            label="Quality Score %"
            type="number" min={0} max={100}
            value={form.qualityScore ?? 100}
            onChange={(e) => setForm((p) => ({ ...p, qualityScore: Number(e.target.value) }))}
          />
        </div>

        {/* Accordion sections */}
        {SECTIONS.map((sec) => (
          <div key={sec.key} className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenSection((v) => v === sec.key ? '' : sec.key)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
            >
              {sec.label}
              {openSection === sec.key ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {openSection === sec.key && (
              <div className="p-4 grid grid-cols-2 gap-3 bg-white">
                {sec.key === 'input' && (
                  <>
                    <Input label="Milk (Liters)" type="number" value={form.input.milkLiters}
                      onChange={(e) => setNested('input', 'milkLiters', Number(e.target.value))} />
                    <Select label="Milk Source" value={form.input.milkSource}
                      onChange={(e) => setNested('input', 'milkSource', e.target.value)}
                      options={MILK_SOURCES.map((s) => ({ value: s, label: s }))} />
                    <Input label="Avg Fat %" type="number" step="0.1" value={form.input.avgFat}
                      onChange={(e) => setNested('input', 'avgFat', Number(e.target.value))} />
                    <Input label="Avg SNF %" type="number" step="0.1" value={form.input.avgSNF}
                      onChange={(e) => setNested('input', 'avgSNF', Number(e.target.value))} />
                    <Input label="Milk Cost (₹)" type="number" value={form.input.milkCost}
                      onChange={(e) => setNested('input', 'milkCost', Number(e.target.value))} />
                  </>
                )}
                {sec.key === 'costs' && (
                  <>
                    {(['labor', 'fuel', 'ingredients', 'packaging', 'utilities'] as const).map((f) => (
                      <Input key={f} label={`${f.charAt(0).toUpperCase() + f.slice(1)} (₹)`} type="number"
                        value={form.costs[f]}
                        onChange={(e) => setNested('costs', f, Number(e.target.value))} />
                    ))}
                    <div className="col-span-2 bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between">
                      <span className="text-sm text-slate-500 font-medium">Total Cost</span>
                      <span className="font-bold text-slate-900">{formatCurrency(totalCost)}</span>
                    </div>
                  </>
                )}
                {sec.key === 'output' && (
                  <>
                    <Input label={`Quantity Produced (${PRODUCT_UNITS[form.productType] ?? 'units'})`}
                      type="number" value={form.output.quantityProduced}
                      onChange={(e) => setNested('output', 'quantityProduced', Number(e.target.value))} />
                    <Input label="Wastage" type="number" value={form.output.wastage}
                      onChange={(e) => setNested('output', 'wastage', Number(e.target.value))} />
                  </>
                )}
                {sec.key === 'pricing' && (
                  <>
                    <Input label="Cost Per Unit (₹)" type="number" value={form.pricing.costPerUnit}
                      onChange={(e) => setNested('pricing', 'costPerUnit', Number(e.target.value))} />
                    <Input label="Selling Price Per Unit (₹)" type="number" value={form.pricing.sellingPricePerUnit}
                      onChange={(e) => setNested('pricing', 'sellingPricePerUnit', Number(e.target.value))} />
                    {form.pricing.sellingPricePerUnit > 0 && (
                      <div className="col-span-2 bg-emerald-50 rounded-xl px-4 py-3">
                        <span className="text-sm text-emerald-700 font-semibold">
                          Margin: {marginPct(form.pricing.costPerUnit, form.pricing.sellingPricePerUnit)}%
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        {formError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{formError}</div>
        )}
      </div>
    </Modal>
  )
}

export default Processing
