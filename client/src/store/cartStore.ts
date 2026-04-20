import { create } from 'zustand'
import type { CartItem, PaymentMode, Product } from '../types'

interface CartStore {
  items:        CartItem[]
  paymentMode:  PaymentMode
  customerName: string

  addItem:     (product: Product, qty: number) => void
  updateQty:   (id: string, qty: number) => void
  removeItem:  (id: string) => void
  clearCart:   () => void
  setPayment:  (mode: PaymentMode) => void
  setCustomer: (name: string) => void
  total:       () => number
  itemCount:   () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items:        [],
  paymentMode:  'CASH',
  customerName: '',

  addItem: (product, qty) => set(s => {
    const exists = s.items.find(i => i.productId === product._id)
    if (exists) {
      return {
        items: s.items.map(i =>
          i.productId === product._id
            ? { ...i, quantity: +(i.quantity + qty).toFixed(2), lineTotal: +((i.quantity + qty) * i.unitPrice).toFixed(2) }
            : i
        ),
      }
    }
    return {
      items: [...s.items, {
        id:          crypto.randomUUID(),
        productId:   product._id,
        productName: product.name,
        unit:        product.unit,
        unitPrice:   product.mrp,
        quantity:    qty,
        lineTotal:   +(qty * product.mrp).toFixed(2),
      }],
    }
  }),

  updateQty: (id, qty) => set(s => ({
    items: qty <= 0
      ? s.items.filter(i => i.id !== id)
      : s.items.map(i => i.id === id ? { ...i, quantity: qty, lineTotal: +(qty * i.unitPrice).toFixed(2) } : i),
  })),

  removeItem:  id   => set(s => ({ items: s.items.filter(i => i.id !== id) })),
  clearCart:   ()   => set({ items: [], customerName: '', paymentMode: 'CASH' }),
  setPayment:  mode => set({ paymentMode: mode }),
  setCustomer: name => set({ customerName: name }),
  total:       ()   => +get().items.reduce((s, i) => s + i.lineTotal, 0).toFixed(2),
  itemCount:   ()   => get().items.reduce((s, i) => s + i.quantity, 0),
}))