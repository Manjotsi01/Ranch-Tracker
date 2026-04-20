import MilkEntry   from '../models/MilkEntry'
import Product, { SUGGESTIONS } from '../models/Product'
import Sale        from '../models/Sale'
import WholesaleSale from '../models/WholesaleSale'
import Expense     from '../models/Expense'
import { startOfDay, endOfDay, startOfMonth, endOfMonth, parseISO } from 'date-fns'

const toDate = (s: string) => parseISO(s)
const todayStr = () => new Date().toISOString().slice(0, 10)

// ─── MILK ────────────────────────────────────────────────────────────────────

export async function getMilkEntries(params: { from?: string; to?: string; month?: string }) {
  const q: Record<string, unknown> = {}
  if (params.month) {
    const d = parseISO(`${params.month}-01`)
    q.date = { $gte: startOfMonth(d), $lte: endOfMonth(d) }
  } else if (params.from || params.to) {
    q.date = {}
    if (params.from) (q.date as Record<string, Date>).$gte = startOfDay(toDate(params.from))
    if (params.to)   (q.date as Record<string, Date>).$lte = endOfDay(toDate(params.to))
  }
  return MilkEntry.find(q).sort({ date: -1, shift: 1 }).lean()
}

export async function getMilkStock(dateStr?: string) {
  const d = dateStr ? toDate(dateStr) : new Date()
  const [collected, wholesaled] = await Promise.all([
    MilkEntry.aggregate([
      { $match: { date: { $gte: startOfDay(d), $lte: endOfDay(d) } } },
      { $group: { _id: null, total: { $sum: '$quantityLiters' } } },
    ]),
    WholesaleSale.aggregate([
      { $match: { date: { $gte: startOfDay(d), $lte: endOfDay(d) } } },
      { $group: { _id: null, total: { $sum: '$quantityLiters' } } },
    ]),
  ])
  const c = collected[0]?.total ?? 0
  const w = wholesaled[0]?.total ?? 0
  return { date: d.toISOString().slice(0, 10), collected: c, wholesaled: w, available: Math.max(0, c - w) }
}

export async function addMilkEntry(data: {
  date: string; shift: 'MORNING' | 'EVENING'
  quantityLiters: number; fat?: number; snf?: number
  source: 'OWN' | 'PURCHASED'; notes?: string
}) {
  return MilkEntry.create({ ...data, date: toDate(data.date) })
}

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

export async function getProducts(activeOnly = true) {
  const q = activeOnly ? { isActive: true } : {}
  const products = await Product.find(q).sort({ name: 1 }).lean()

  // Attach suggestions for out-of-stock products
  return products.map(p => {
    const outOfStock = p.stockQty <= 0
    if (!outOfStock) return { ...p, suggestions: [] }
    const suggCategories = SUGGESTIONS[p.category] ?? []
    const alternatives = products
      .filter(x => suggCategories.includes(x.category) && x.stockQty > 0 && x._id.toString() !== p._id.toString())
      .map(x => ({ _id: x._id, name: x.name }))
    return { ...p, suggestions: alternatives }
  })
}

export async function createProduct(data: {
  name: string; category: string; unit: string; mrp: number
  costPrice?: number; stockQty?: number; quickButtons?: number[]
  lowStockThreshold?: number
}) {
  return Product.create(data)
}

export async function updateProduct(id: string, data: Partial<{
  name: string; category: string; unit: string; mrp: number
  costPrice: number; isActive: boolean; quickButtons: number[]
  lowStockThreshold: number
}>) {
  return Product.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean()
}

export async function adjustStock(id: string, delta: number) {
  const p = await Product.findById(id)
  if (!p) throw new Error('Product not found')
  const newQty = p.stockQty + delta
  if (newQty < 0) throw new Error(`Insufficient stock. Available: ${p.stockQty} ${p.unit}`)
  p.stockQty = newQty
  return p.save()
}

export async function setStock(id: string, qty: number) {
  return Product.findByIdAndUpdate(id, { stockQty: qty }, { new: true }).lean()
}

export async function deleteProduct(id: string) {
  return Product.findByIdAndDelete(id)
}

// ─── SALES (POS) ─────────────────────────────────────────────────────────────

export async function createSale(data: {
  items: { productId: string; quantity: number; unitPrice: number }[]
  paymentMode: 'CASH' | 'UPI'
  customerName?: string
}) {
  // Validate stock for all items first
  const products = await Product.find({
    _id: { $in: data.items.map(i => i.productId) }
  })

  const productMap = new Map(products.map(p => [p._id.toString(), p]))

  for (const item of data.items) {
    const p = productMap.get(item.productId)
    if (!p) throw new Error(`Product not found: ${item.productId}`)
    if (p.stockQty < item.quantity) {
      throw new Error(`Insufficient stock for ${p.name}. Available: ${p.stockQty} ${p.unit}`)
    }
  }

  // Build sale items with snapshots
  const saleItems = data.items.map(item => {
    const p = productMap.get(item.productId)!
    return {
      productId:   p._id,
      productName: p.name,
      unit:        p.unit,
      quantity:    item.quantity,
      unitPrice:   item.unitPrice,
      lineTotal:   +(item.quantity * item.unitPrice).toFixed(2),
    }
  })

  const totalAmount = +saleItems.reduce((s, i) => s + i.lineTotal, 0).toFixed(2)

  // Deduct stock
  await Promise.all(data.items.map(item =>
    Product.findByIdAndUpdate(item.productId, { $inc: { stockQty: -item.quantity } })
  ))

  return Sale.create({ items: saleItems, paymentMode: data.paymentMode, totalAmount, customerName: data.customerName })
}

export async function getSales(params: {
  from?: string; to?: string; paymentMode?: string; page?: number; limit?: number
}) {
  const q: Record<string, unknown> = {}
  if (params.from || params.to) {
    q.dateTime = {}
    if (params.from) (q.dateTime as Record<string, Date>).$gte = startOfDay(toDate(params.from))
    if (params.to)   (q.dateTime as Record<string, Date>).$lte = endOfDay(toDate(params.to))
  }
  if (params.paymentMode) q.paymentMode = params.paymentMode

  const page = params.page ?? 1
  const limit = params.limit ?? 50
  const [sales, total] = await Promise.all([
    Sale.find(q).sort({ dateTime: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Sale.countDocuments(q),
  ])
  return { sales, total, page, pages: Math.ceil(total / limit) }
}

// ─── WHOLESALE ───────────────────────────────────────────────────────────────

export async function getWholesaleSales(params: { status?: string; from?: string; to?: string }) {
  const q: Record<string, unknown> = {}
  if (params.status && params.status !== 'ALL') q.paymentStatus = params.status
  if (params.from || params.to) {
    q.date = {}
    if (params.from) (q.date as Record<string, Date>).$gte = startOfDay(toDate(params.from))
    if (params.to)   (q.date as Record<string, Date>).$lte = endOfDay(toDate(params.to))
  }
  return WholesaleSale.find(q).sort({ date: -1 }).lean()
}

export async function createWholesaleSale(data: {
  date: string; buyerName: string; quantityLiters: number
  ratePerLiter: number; fat?: number; snf?: number; notes?: string
}) {
  const totalAmount = +(data.quantityLiters * data.ratePerLiter).toFixed(2)
  return WholesaleSale.create({ ...data, date: toDate(data.date), totalAmount })
}

export async function markWholesalePaymentReceived(id: string) {
  return WholesaleSale.findByIdAndUpdate(
    id,
    { paymentStatus: 'RECEIVED', paymentDate: new Date() },
    { new: true }
  ).lean()
}

// ─── EXPENSES ────────────────────────────────────────────────────────────────

export async function getExpenses(params: { from?: string; to?: string; month?: string }) {
  const q: Record<string, unknown> = {}
  if (params.month) {
    const d = parseISO(`${params.month}-01`)
    q.date = { $gte: startOfMonth(d), $lte: endOfMonth(d) }
  } else if (params.from || params.to) {
    q.date = {}
    if (params.from) (q.date as Record<string, Date>).$gte = startOfDay(toDate(params.from))
    if (params.to)   (q.date as Record<string, Date>).$lte = endOfDay(toDate(params.to))
  }
  return Expense.find(q).sort({ date: -1 }).lean()
}

export async function upsertExpense(data: {
  date: string; feed: number; labor: number
  transport: number; medical: number; misc: number
}) {
  const dateObj = startOfDay(toDate(data.date))
  const total = data.feed + data.labor + data.transport + data.medical + data.misc
  return Expense.findOneAndUpdate(
    { date: dateObj },
    { ...data, date: dateObj, total },
    { upsert: true, new: true, runValidators: true }
  ).lean()
}

// ─── REPORTS ────────────────────────────────────────────────────────────────

export async function getDailyReport(dateStr?: string) {
  const d = dateStr ? toDate(dateStr) : new Date()
  const dayStart = startOfDay(d)
  const dayEnd   = endOfDay(d)

  const [milkEntries, expense, retailSales, wholesaleSales, pendingWS] = await Promise.all([
    MilkEntry.find({ date: { $gte: dayStart, $lte: dayEnd } }).lean(),
    Expense.findOne({ date: { $gte: dayStart, $lte: dayEnd } }).lean(),
    Sale.find({ dateTime: { $gte: dayStart, $lte: dayEnd } }).lean(),
    WholesaleSale.find({ date: { $gte: dayStart, $lte: dayEnd } }).lean(),
    WholesaleSale.find({ paymentStatus: 'PENDING' }).lean(),
  ])

  const milkCollected  = milkEntries.reduce((s, e) => s + e.quantityLiters, 0)
  const milkWholesaled = wholesaleSales.reduce((s, e) => s + e.quantityLiters, 0)
  const retailRevenue  = retailSales.reduce((s, e) => s + e.totalAmount, 0)
  const wsRevenue      = wholesaleSales.reduce((s, e) => s + e.totalAmount, 0)
  const expenseTotal   = expense?.total ?? 0

  const byMode: Record<string, { total: number; count: number }> = {}
  retailSales.forEach(s => {
    if (!byMode[s.paymentMode]) byMode[s.paymentMode] = { total: 0, count: 0 }
    byMode[s.paymentMode].total += s.totalAmount
    byMode[s.paymentMode].count++
  })

  return {
    date: d.toISOString().slice(0, 10),
    milk: {
      collected: milkCollected,
      entries:   milkEntries.length,
      wholesaled: milkWholesaled,
      available: Math.max(0, milkCollected - milkWholesaled),
    },
    expenses: {
      feed:      expense?.feed      ?? 0,
      labor:     expense?.labor     ?? 0,
      transport: expense?.transport ?? 0,
      medical:   expense?.medical   ?? 0,
      misc:      expense?.misc      ?? 0,
      total:     expenseTotal,
    },
    makingPrice: milkCollected > 0 ? +(expenseTotal / milkCollected).toFixed(2) : 0,
    retail: { revenue: retailRevenue, transactions: retailSales.length, byMode },
    wholesale: { revenue: wsRevenue, liters: milkWholesaled },
    totalRevenue: +(retailRevenue + wsRevenue).toFixed(2),
    pendingPayments: {
      total: pendingWS.reduce((s, x) => s + x.totalAmount, 0),
      count: pendingWS.length,
    },
  }
}

export async function getMonthlyReport(monthStr: string) {
  const d = parseISO(`${monthStr}-01`)
  const start = startOfMonth(d)
  const end   = endOfMonth(d)

  const [milkEntries, expenses, retailSales, wholesaleSales] = await Promise.all([
    MilkEntry.find({ date: { $gte: start, $lte: end } }).lean(),
    Expense.find({ date: { $gte: start, $lte: end } }).lean(),
    Sale.find({ dateTime: { $gte: start, $lte: end } }).lean(),
    WholesaleSale.find({ date: { $gte: start, $lte: end } }).lean(),
  ])

  const milkTotal  = milkEntries.reduce((s, e) => s + e.quantityLiters, 0)
  const expObj = { feed: 0, labor: 0, transport: 0, medical: 0, misc: 0, total: 0 }
  expenses.forEach(e => {
    expObj.feed      += e.feed
    expObj.labor     += e.labor
    expObj.transport += e.transport
    expObj.medical   += e.medical
    expObj.misc      += e.misc
    expObj.total     += e.total
  })

  const retailRevenue = retailSales.reduce((s, x) => s + x.totalAmount, 0)
  const wsRevenue     = wholesaleSales.reduce((s, x) => s + x.totalAmount, 0)
  const wsLiters      = wholesaleSales.reduce((s, x) => s + x.quantityLiters, 0)

  return {
    month: monthStr,
    milk: { total: milkTotal },
    expenses: expObj,
    makingPrice: milkTotal > 0 ? +(expObj.total / milkTotal).toFixed(2) : 0,
    retail:    { revenue: retailRevenue, transactions: retailSales.length },
    wholesale: { revenue: wsRevenue, liters: wsLiters },
    totalRevenue: +(retailRevenue + wsRevenue).toFixed(2),
  }
}