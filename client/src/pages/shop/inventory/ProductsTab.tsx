import React, { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Package, ToggleLeft, ToggleRight } from 'lucide-react'
import { useProducts } from '../../../hooks/useProducts'
import type { Product, ProductCategory } from '../../../types'

const EMPTY = {
  name: '', category: 'OTHER' as ProductCategory,
  unit: 'kg', mrp: '', costPrice: '', stockQty: '',
  quickButtons: '1', lowStockThreshold: '5', isActive: true,
}

const CATEGORIES: ProductCategory[] = ['MILK','CURD','PANEER','GHEE','BUTTER','LASSI','KHOYA','CREAM','OTHER']
const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

const ProductsTab: React.FC = () => {
  const { products, loading, fetchProducts, createProduct, updateProduct, deleteProduct } = useProducts()
  const [showForm, setShowForm]   = useState(false)
  const [editing,  setEditing]    = useState<Product | null>(null)
  const [saving,   setSaving]     = useState(false)
  const [form,     setForm]       = useState(EMPTY)
  const [errors,   setErrors]     = useState<Record<string, string>>({})

  useEffect(() => { fetchProducts(true) }, [fetchProducts])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
  const openEdit   = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name, category: p.category,
      unit: p.unit, mrp: String(p.mrp), costPrice: String(p.costPrice),
      stockQty: String(p.stockQty), quickButtons: p.quickButtons.join(','),
      lowStockThreshold: String(p.lowStockThreshold), isActive: p.isActive,
    })
    setShowForm(true)
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim())         e.name = 'Required'
    if (!form.mrp || +form.mrp <= 0) e.mrp = 'Must be > 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(), category: form.category, unit: form.unit,
        mrp: +form.mrp, costPrice: +form.costPrice || 0,
        stockQty: +form.stockQty || 0,
        quickButtons: form.quickButtons.split(',').map(Number).filter(Boolean),
        lowStockThreshold: +form.lowStockThreshold || 5,
        isActive: form.isActive,
      }
      if (editing) await updateProduct(editing._id, payload)
      else         await createProduct(payload as Parameters<typeof createProduct>[0])
      setShowForm(false); setEditing(null)
    } finally { setSaving(false) }
  }

  const toggleActive = (p: Product) => updateProduct(p._id, { isActive: !p.isActive })

  const set = (k: string, v: string | boolean) => {
    setForm(prev => ({ ...prev, [k]: v }))
    setErrors(prev => ({ ...prev, [k]: '' }))
  }

  const margin = (cost: number, mrp: number) =>
    mrp > 0 ? `${Math.round(((mrp - cost) / mrp) * 100)}%` : '—'

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm font-semibold text-slate-700">{products.length} product{products.length !== 1 ? 's' : ''}</p>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus size={14} /> Add Product
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-blue-100 rounded-2xl p-5 space-y-4 shadow-sm">
          <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Package size={15} className="text-blue-500" />
            {editing ? `Edit — ${editing.name}` : 'New Product'}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. Paneer" className={`field-input ${errors.name ? 'border-red-400' : ''}`} />
              {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
            </div>
            <div>
              <label className="field-label">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="field-input">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="field-label">Unit</label>
              <input value={form.unit} onChange={e => set('unit', e.target.value)}
                placeholder="kg / L / pcs" className="field-input" />
            </div>
            <div>
              <label className="field-label">MRP (₹)</label>
              <input type="number" value={form.mrp} onChange={e => set('mrp', e.target.value)}
                placeholder="0" className={`field-input ${errors.mrp ? 'border-red-400' : ''}`} />
              {errors.mrp && <p className="text-xs text-red-500 mt-0.5">{errors.mrp}</p>}
            </div>
            <div>
              <label className="field-label">Cost (₹)</label>
              <input type="number" value={form.costPrice} onChange={e => set('costPrice', e.target.value)}
                placeholder="0" className="field-input" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="field-label">Opening stock</label>
              <input type="number" value={form.stockQty} onChange={e => set('stockQty', e.target.value)}
                placeholder="0" className="field-input" />
            </div>
            <div>
              <label className="field-label">Low stock alert</label>
              <input type="number" value={form.lowStockThreshold} onChange={e => set('lowStockThreshold', e.target.value)}
                placeholder="5" className="field-input" />
            </div>
            <div>
              <label className="field-label">Quick buttons</label>
              <input value={form.quickButtons} onChange={e => set('quickButtons', e.target.value)}
                placeholder="0.5,1,2" className="field-input" />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={() => { setShowForm(false); setEditing(null) }}
              className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 h-10 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save Product'}
            </button>
          </div>
        </div>
      )}

      {/* Products list */}
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {products.map(p => {
            const stockColor = p.stockQty <= 0 ? 'text-red-600' : p.stockQty <= p.lowStockThreshold ? 'text-amber-600' : 'text-emerald-600'
            return (
              <div key={p._id} className={`bg-white border rounded-xl px-4 py-3 flex items-center justify-between ${!p.isActive ? 'opacity-50 border-slate-100' : 'border-slate-100'}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{p.category}</span>
                    {!p.isActive && <span className="text-xs text-slate-400">(inactive)</span>}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {fmt(p.mrp)}/{p.unit} · Cost {fmt(p.costPrice)} · Margin {margin(p.costPrice, p.mrp)}
                    {' · '}Stock: <span className={`font-semibold ${stockColor}`}>{p.stockQty} {p.unit}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-2 shrink-0">
                  <button onClick={() => toggleActive(p)} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    {p.isActive ? <ToggleRight size={16} className="text-emerald-500" /> : <ToggleLeft size={16} />}
                  </button>
                  <button onClick={() => openEdit(p)} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => deleteProduct(p._id)} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ProductsTab