// src/pages/shop/POS.tsx
import React, { useEffect, useState, useCallback } from 'react'
import {
  ShoppingCart, Search, Trash2, Plus, Minus, CheckCircle,
  Banknote, Smartphone, CreditCard, AlertTriangle, X, User,
} from 'lucide-react'
import { shopApi } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import Modal  from '../../components/ui/Modal'
import { formatCurrency, getProductLabel, uid } from '../../lib/utils'
import { useCartStore } from '../../store'
import { PRODUCT_TYPES, PRODUCT_UNITS } from '../../lib/constant'
import type { Batch, PaymentMode } from '../../types'

const PAYMENT_ICONS: Record<PaymentMode, React.ReactNode> = {
  CASH:   <Banknote size={16} />,
  UPI:    <Smartphone size={16} />,
  CARD:   <CreditCard size={16} />,
  CREDIT: <User size={16} />,
}

const PAYMENT_LABELS: Record<PaymentMode, string> = {
  CASH: 'Cash', UPI: 'UPI', CARD: 'Card', CREDIT: 'Credit',
}

const POS: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loadingBatches, setLoadingBatches] = useState(true)
  const [search, setSearch] = useState('')
  const [activeProduct, setActiveProduct] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successSale, setSuccessSale] = useState<{ saleId: string; total: number } | null>(null)
  const [saleError, setSaleError] = useState<string | null>(null)

  const {
    items, paymentMode, customerName,
    addItem, updateItem, removeItem, clearCart,
    setPaymentMode, setCustomer,
    getTotal, getItemCount,
  } = useCartStore()

  const loadBatches = useCallback(async () => {
    setLoadingBatches(true)
    try {
      const res = await shopApi.getBatches({ status: 'READY' })
      setBatches(res.data.data ?? res.data)
    } catch {
      // handled gracefully
    } finally {
      setLoadingBatches(false)
    }
  }, [])

  useEffect(() => { loadBatches() }, [loadBatches])

  // Group READY batches by product type (FIFO by expiry)
  const productGroups = PRODUCT_TYPES.reduce<Record<string, Batch[]>>((acc, type) => {
    const group = batches
      .filter((b) => b.productType === type && b.stockRemaining > 0)
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
    if (group.length > 0) acc[type] = group
    return acc
  }, {})

  const filteredProductTypes = Object.keys(productGroups).filter((type) =>
    !search || getProductLabel(type).toLowerCase().includes(search.toLowerCase())
  )

  const addToCart = (batch: Batch) => {
    addItem({
      id: uid(),
      productType: batch.productType,
      productName: getProductLabel(batch.productType),
      batchId: batch._id,
      batchCode: batch.batchId,
      unitPrice: batch.pricing.sellingPricePerUnit,
      quantity: 1,
      discount: 0,
      unit: PRODUCT_UNITS[batch.productType] ?? 'unit',
    })
  }

  const confirmSale = async () => {
    if (items.length === 0) return
    setSubmitting(true)
    setSaleError(null)
    try {
      const payload = {
        customerName: customerName || undefined,
        items: items.map((i) => ({
          productId: i.productType,
          batchId: i.batchId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          discount: i.discount,
        })),
        paymentMode,
      }
      const res = await shopApi.createSale(payload)
      const sale = res.data.data ?? res.data
      setSuccessSale({ saleId: sale.saleId, total: getTotal() })
      clearCart()
      // refresh batches to update stock
      loadBatches()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sale failed. Try again.'
      setSaleError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const total = getTotal()
  const itemCount = getItemCount()

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* ── Left: Product Grid ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-100">
        {/* Search */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full h-10 pl-9 pr-4 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Product Type Tabs */}
        <div className="flex gap-2 px-4 py-3 border-b border-slate-100 bg-white overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveProduct('')}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${activeProduct === '' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
          >
            All
          </button>
          {filteredProductTypes.map((type) => (
            <button
              key={type}
              onClick={() => setActiveProduct(type)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${activeProduct === type ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
            >
              {getProductLabel(type)}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          {loadingBatches ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : filteredProductTypes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <ShoppingCart size={36} className="mb-3 opacity-40" />
              <p className="text-sm font-medium">No products in stock</p>
              <p className="text-xs mt-1">Create batches in Processing module</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {(activeProduct ? [activeProduct] : filteredProductTypes).flatMap((type) =>
                (productGroups[type] ?? []).map((batch) => (
                  <ProductCard
                    key={batch._id}
                    batch={batch}
                    onAdd={() => addToCart(batch)}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Cart & Checkout ─────────────────────────────────────────── */}
      <div className="w-96 shrink-0 flex flex-col bg-white">
        {/* Cart Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-slate-700" />
            <span className="font-bold text-slate-900">Cart</span>
            {itemCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                {itemCount}
              </span>
            )}
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* Customer Name */}
        <div className="px-5 py-3 border-b border-slate-100">
          <div className="relative">
            <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={customerName}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Customer name (optional)"
              className="w-full h-9 pl-8 pr-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-300">
              <ShoppingCart size={30} className="mb-2" />
              <p className="text-sm">Cart is empty</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {items.map((item) => (
                <CartLineItem key={item.id} item={item} onUpdate={updateItem} onRemove={removeItem} />
              ))}
            </div>
          )}
        </div>

        {/* Payment Mode */}
        <div className="px-5 py-3 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Payment</p>
          <div className="grid grid-cols-4 gap-2">
            {(['CASH', 'UPI', 'CARD', 'CREDIT'] as PaymentMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setPaymentMode(mode)}
                className={[
                  'flex flex-col items-center gap-1 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                  paymentMode === mode
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300',
                ].join(' ')}
              >
                {PAYMENT_ICONS[mode]}
                {PAYMENT_LABELS[mode]}
              </button>
            ))}
          </div>
        </div>

        {/* Order Total */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-500">Subtotal</span>
            <span className="text-slate-700">{formatCurrency(total)}</span>
          </div>
          {items.some((i) => i.discount > 0) && (
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-emerald-600">Discount</span>
              <span className="text-emerald-600">
                -{formatCurrency(items.reduce((s, i) => s + (i.unitPrice * i.quantity * i.discount / 100), 0))}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-lg font-bold mt-2 pt-2 border-t border-slate-200">
            <span className="text-slate-900">Total</span>
            <span className="text-blue-600">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="px-5 pb-5">
          {saleError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-3 text-sm text-red-700">
              <AlertTriangle size={14} className="shrink-0" />
              {saleError}
            </div>
          )}
          <Button
            size="lg"
            loading={submitting}
            disabled={items.length === 0}
            onClick={confirmSale}
            className="!text-base !font-bold"
          >
            Confirm Sale · {formatCurrency(total)}
          </Button>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        open={!!successSale}
        onClose={() => setSuccessSale(null)}
        title="Sale Confirmed!"
        size="sm"
        footer={<Button onClick={() => setSuccessSale(null)} >New Sale</Button>}
      >
        {successSale && (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1">{formatCurrency(successSale.total)}</p>
            <p className="text-sm text-slate-500 mb-3">Payment received via {PAYMENT_LABELS[paymentMode]}</p>
            <Badge variant="green" dot>Sale ID: {successSale.saleId}</Badge>
            <p className="text-xs text-slate-400 mt-3">Inventory updated automatically</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

// ─── Product Card ─────────────────────────────────────────────────────────────
const PRODUCT_EMOJI: Record<string, string> = {
  PANEER: '🧀', GHEE: '🫙', DAHI: '🥛', BUTTER: '🧈', MAKKAN: '🧈',
  KHOYA: '🍮', CREAM: '🥛', LASSI: '🥤', KULFI: '🍦', KHEER: '🍚',
  ICE_CREAM: '🍨', HOT_MILK: '☕', BAKERY: '🥐', CHAAT: '🥙', RESTAURANT: '🍽️',
}

interface ProductCardProps {
  batch: Batch
  onAdd: () => void
}

const ProductCard: React.FC<ProductCardProps> = ({ batch, onAdd }) => {
  const unit = PRODUCT_UNITS[batch.productType] ?? 'unit'
  const days = Math.ceil((new Date(batch.expiryDate).getTime() - Date.now()) / 86400000)
  const isLow = batch.stockRemaining <= 5
  const isExpiringSoon = days <= 3

  return (
    <button
      onClick={onAdd}
      className="bg-white border border-slate-100 rounded-2xl p-4 text-left hover:border-blue-300 hover:shadow-md transition-all duration-200 active:scale-95 cursor-pointer group"
    >
      <div className="text-2xl mb-2">{PRODUCT_EMOJI[batch.productType] ?? '📦'}</div>
      <p className="font-bold text-slate-900 text-sm leading-tight">{getProductLabel(batch.productType)}</p>
      <p className="text-[10px] font-mono text-slate-400 mt-0.5">{batch.batchId}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-base font-bold text-blue-600">
          {formatCurrency(batch.pricing.sellingPricePerUnit)}
          <span className="text-xs font-normal text-slate-400">/{unit}</span>
        </span>
      </div>
      <div className="flex items-center gap-1 mt-2 flex-wrap">
        <span className={`text-xs font-semibold ${isLow ? 'text-red-600' : 'text-emerald-600'}`}>
          {batch.stockRemaining} {unit}
        </span>
        {isExpiringSoon && <Badge variant="red">{days}d</Badge>}
        {isLow && <Badge variant="amber">Low</Badge>}
      </div>
      <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full group-hover:from-blue-600 group-hover:to-blue-700 transition-colors"
          style={{
            width: `${Math.min(100, (batch.stockRemaining / batch.output.quantityProduced) * 100)}%`,
          }}
        />
      </div>
    </button>
  )
}

// ─── Cart Line Item ───────────────────────────────────────────────────────────
import type { CartItem } from '../../store'

interface CartLineItemProps {
  item: CartItem
  onUpdate: (id: string, patch: Partial<CartItem>) => void
  onRemove: (id: string) => void
}

const CartLineItem: React.FC<CartLineItemProps> = ({ item, onUpdate, onRemove }) => {
  const lineTotal = item.unitPrice * item.quantity
  const discounted = lineTotal - (lineTotal * item.discount) / 100

  return (
    <div className="px-5 py-3.5 hover:bg-slate-50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{item.productName}</p>
          <p className="text-[10px] font-mono text-slate-400">{item.batchCode}</p>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer mt-0.5"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="flex items-center gap-3 mt-2">
        {/* Qty controls */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => item.quantity > 1 && onUpdate(item.id, { quantity: item.quantity - 1 })}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white text-slate-600 cursor-pointer transition-colors"
          >
            <Minus size={11} />
          </button>
          <span className="text-sm font-bold text-slate-900 w-7 text-center">{item.quantity}</span>
          <button
            onClick={() => onUpdate(item.id, { quantity: item.quantity + 1 })}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white text-slate-600 cursor-pointer transition-colors"
          >
            <Plus size={11} />
          </button>
        </div>

        {/* Discount */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={item.discount}
            onChange={(e) => onUpdate(item.id, { discount: Math.min(100, Math.max(0, Number(e.target.value))) })}
            className="w-12 h-7 text-xs text-center border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
            placeholder="0"
          />
          <span className="text-xs text-slate-400">%</span>
        </div>

        {/* Line total */}
        <div className="flex-1 text-right">
          <p className="text-sm font-bold text-slate-900">{formatCurrency(discounted)}</p>
          {item.discount > 0 && (
            <p className="text-[10px] text-slate-400 line-through">{formatCurrency(lineTotal)}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default POS
