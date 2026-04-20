import React, { useEffect, useCallback, useState } from 'react'
import {
  ShoppingCart, Trash2, Plus, Minus, X, CheckCircle,
  Banknote, Smartphone, AlertTriangle, Search
} from 'lucide-react'
import { useProducts } from '../../../hooks/useProducts'
import { useSales }    from '../../../hooks/useSales'
import { useCartStore } from '../../../store/cartStore'
import type { Product } from '../../../types'

const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`

const stockStatus = (p: Product) => {
  if (p.stockQty <= 0) return 'OUT'
  if (p.stockQty <= p.lowStockThreshold) return 'LOW'
  return 'OK'
}

const POS: React.FC = () => {
  const { products, loading, fetchProducts } = useProducts()
  const { createSale }                       = useSales()
  const cart                                 = useCartStore()

  const [search,       setSearch]      = useState('')
  const [submitting,   setSubmitting]  = useState(false)
  const [saleError,    setSaleError]   = useState<string | null>(null)
  const [successTotal, setSuccessTotal] = useState<number | null>(null)

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleAdd = useCallback((p: Product, qty: number) => {
    if (p.stockQty <= 0) return
    const inCart = cart.items.find(i => i.productId === p._id)?.quantity ?? 0
    if (inCart + qty > p.stockQty) return
    cart.addItem(p, qty)
  }, [cart])

  const handleCheckout = async () => {
    if (!cart.items.length) return
    setSubmitting(true); setSaleError(null)
    try {
      const sale = await createSale({
        items: cart.items.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
        paymentMode:  cart.paymentMode,
        customerName: cart.customerName || undefined,
      })
      setSuccessTotal(sale.totalAmount)
      cart.clearCart()
      fetchProducts()
    } catch (e: unknown) {
      setSaleError(e instanceof Error ? e.message : 'Sale failed. Try again.')
    } finally { setSubmitting(false) }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const cartTotal = cart.total()
  const cartCount = cart.itemCount()

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50">

      {/* ── Products panel ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search bar */}
        <div className="p-3 border-b border-slate-200 bg-white">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full h-10 pl-9 pr-4 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-36 bg-white rounded-2xl animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <ShoppingCart size={36} className="mb-3 opacity-40" />
              <p className="text-sm font-medium">{search ? 'No products match your search' : 'No products yet'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map(p => (
                <ProductCard key={p._id} product={p} onAdd={handleAdd} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Cart panel ──────────────────────────────────────────────────── */}
      <div className="w-80 shrink-0 flex flex-col bg-white border-l border-slate-200 shadow-sm">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} className="text-slate-700" />
            <span className="font-bold text-slate-900 text-sm">Cart</span>
            {cartCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold leading-none">
                {cartCount}
              </span>
            )}
          </div>
          {cart.items.length > 0 && (
            <button
              onClick={cart.clearCart}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              <X size={11} /> Clear
            </button>
          )}
        </div>

        {/* Customer name */}
        <div className="px-4 py-2.5 border-b border-slate-100">
          <input
            value={cart.customerName}
            onChange={e => cart.setCustomer(e.target.value)}
            placeholder="Customer name (optional)"
            className="w-full h-9 px-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-36 text-slate-300">
              <ShoppingCart size={28} className="mb-2" />
              <p className="text-sm">Cart is empty</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {cart.items.map(item => (
                <div key={item.id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 leading-tight">{item.productName}</p>
                      <p className="text-xs text-slate-400">{fmt(item.unitPrice)}/{item.unit}</p>
                    </div>
                    <button onClick={() => cart.removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors ml-2 mt-0.5">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                      <button
                        onClick={() => cart.updateQty(item.id, +(item.quantity - 0.5).toFixed(1))}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white text-slate-600 transition-colors"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="text-sm font-bold text-slate-900 w-10 text-center">{item.quantity}</span>
                      <button
                        onClick={() => cart.updateQty(item.id, +(item.quantity + 0.5).toFixed(1))}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white text-slate-600 transition-colors"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{fmt(item.lineTotal)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment + checkout */}
        <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50">
          {/* Payment mode */}
          <div className="grid grid-cols-2 gap-2">
            {(['CASH', 'UPI'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => cart.setPayment(mode)}
                className={[
                  'flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all',
                  cart.paymentMode === mode
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
                ].join(' ')}
              >
                {mode === 'CASH' ? <Banknote size={14} /> : <Smartphone size={14} />}
                {mode}
              </button>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-slate-800">Total</span>
            <span className="text-xl font-bold text-blue-600">{fmt(cartTotal)}</span>
          </div>

          {/* Error */}
          {saleError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              <AlertTriangle size={13} className="shrink-0" />
              {saleError}
            </div>
          )}

          {/* Checkout button */}
          <button
            onClick={handleCheckout}
            disabled={cart.items.length === 0 || submitting}
            className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold text-base hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Confirm Sale · {fmt(cartTotal)}</>
            )}
          </button>
        </div>
      </div>

      {/* ── Success overlay ─────────────────────────────────────────────── */}
      {successTotal !== null && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSuccessTotal(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-xs w-full mx-4 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{fmt(successTotal)}</p>
            <p className="text-sm text-slate-500 mb-6">Paid via {cart.paymentMode} · Stock updated</p>
            <button
              onClick={() => setSuccessTotal(null)}
              className="w-full h-11 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
            >
              New Sale
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const ProductCard: React.FC<{ product: Product; onAdd: (p: Product, qty: number) => void }> = ({ product, onAdd }) => {
  const status = stockStatus(product)
  const oos    = status === 'OUT'
  const low    = status === 'LOW'

  return (
    <div className={[
      'bg-white border rounded-2xl p-4 flex flex-col transition-all duration-200',
      oos ? 'opacity-60 border-slate-100' : low ? 'border-amber-200 hover:border-amber-300 hover:shadow-md' : 'border-slate-100 hover:border-blue-300 hover:shadow-md',
    ].join(' ')}>
      <p className="font-bold text-slate-900 text-sm leading-tight mb-1">{product.name}</p>

      {/* Stock badge */}
      {oos ? (
        <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full w-fit mb-1">
          ✗ Out of stock
        </span>
      ) : low ? (
        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full w-fit mb-1">
          ⚠ {product.stockQty} {product.unit} left
        </span>
      ) : (
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit mb-1">
          ✓ {product.stockQty} {product.unit}
        </span>
      )}

      <p className="text-base font-bold text-blue-600 mt-1 mb-3">
        {fmt(product.mrp)}
        <span className="text-xs font-normal text-slate-400">/{product.unit}</span>
      </p>

      {/* Alternatives suggestion */}
      {oos && product.suggestions.length > 0 && (
        <p className="text-xs text-amber-600 mb-2">
          Try: {product.suggestions.map(s => s.name).join(', ')}
        </p>
      )}

      {/* Quick add buttons */}
      <div className="flex gap-1.5 mt-auto flex-wrap">
        {(product.quickButtons ?? [1]).map(qty => (
          <button
            key={qty}
            disabled={oos}
            onClick={() => onAdd(product, qty)}
            className="flex-1 min-w-0 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            +{qty}
          </button>
        ))}
      </div>
    </div>
  )
}

export default POS