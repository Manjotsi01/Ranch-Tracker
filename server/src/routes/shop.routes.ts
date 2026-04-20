import { Router, Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import { z } from 'zod'
import * as svc from '../services/shop.service'

const router = Router()

const ok  = (res: Response, data: unknown, status = 200) => res.status(status).json({ success: true, data })
const dateRx = /^\d{4}-\d{2}-\d{2}$/
const id24   = z.string().length(24)

// ─── MILK ─────────────────────────────────────────────────────────────────────
router.get('/milk', asyncHandler(async (req, res) => {
  ok(res, await svc.getMilkEntries(req.query as Record<string, string>))
}))

router.get('/milk/stock', asyncHandler(async (req, res) => {
  ok(res, await svc.getMilkStock(req.query.date as string | undefined))
}))

router.post('/milk', asyncHandler(async (req, res) => {
  const body = z.object({
    date:           z.string().regex(dateRx),
    shift:          z.enum(['MORNING', 'EVENING']),
    quantityLiters: z.number().positive(),
    fat:            z.number().min(0).max(10).optional(),
    snf:            z.number().min(0).max(15).optional(),
    source:         z.enum(['OWN', 'PURCHASED']).default('OWN'),
    notes:          z.string().max(200).optional(),
  }).parse(req.body)
  ok(res, await svc.addMilkEntry(body), 201)
}))

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
router.get('/products', asyncHandler(async (req, res) => {
  ok(res, await svc.getProducts(req.query.all !== 'true'))
}))

router.post('/products', asyncHandler(async (req, res) => {
  const body = z.object({
    name:              z.string().min(1).max(60).trim(),
    category:          z.string().default('OTHER'),
    unit:              z.string().min(1).max(20),
    mrp:               z.number().positive(),
    costPrice:         z.number().min(0).optional(),
    stockQty:          z.number().min(0).optional(),
    quickButtons:      z.array(z.number().positive()).max(6).optional(),
    lowStockThreshold: z.number().min(0).optional(),
  }).parse(req.body)
  ok(res, await svc.createProduct(body), 201)
}))

router.patch('/products/:id', asyncHandler(async (req, res) => {
  id24.parse(req.params.id)
  ok(res, await svc.updateProduct(req.params.id, req.body))
}))

router.patch('/products/:id/stock/adjust', asyncHandler(async (req, res) => {
  id24.parse(req.params.id)
  const { delta } = z.object({ delta: z.number().min(1) }).parse(req.body)
  ok(res, await svc.adjustStock(req.params.id, delta))
}))

router.patch('/products/:id/stock/set', asyncHandler(async (req, res) => {
  id24.parse(req.params.id)
  const { qty } = z.object({ qty: z.number().min(0) }).parse(req.body)
  ok(res, await svc.setStock(req.params.id, qty))
}))

router.delete('/products/:id', asyncHandler(async (req, res) => {
  id24.parse(req.params.id)
  ok(res, await svc.deleteProduct(req.params.id))
}))

// ─── SALES ────────────────────────────────────────────────────────────────────
router.get('/sales', asyncHandler(async (req, res) => {
  const p = req.query as Record<string, string>
  ok(res, await svc.getSales({ ...p, page: +p.page || 1, limit: +p.limit || 50 }))
}))

router.post('/sales', asyncHandler(async (req, res) => {
  const body = z.object({
    items: z.array(z.object({
      productId: id24,
      quantity:  z.number().positive(),
      unitPrice: z.number().positive(),
    })).min(1),
    paymentMode:  z.enum(['CASH', 'UPI']),
    customerName: z.string().max(80).optional(),
  }).parse(req.body)
  ok(res, await svc.createSale(body), 201)
}))

// ─── WHOLESALE ────────────────────────────────────────────────────────────────
router.get('/wholesale', asyncHandler(async (req, res) => {
  ok(res, await svc.getWholesaleSales(req.query as Record<string, string>))
}))

router.post('/wholesale', asyncHandler(async (req, res) => {
  const body = z.object({
    date:           z.string().regex(dateRx),
    buyerName:      z.string().min(1).max(80).trim(),
    quantityLiters: z.number().positive(),
    ratePerLiter:   z.number().positive(),
    fat:            z.number().min(0).max(10).optional(),
    snf:            z.number().min(0).max(15).optional(),
    notes:          z.string().max(200).optional(),
  }).parse(req.body)
  ok(res, await svc.createWholesaleSale(body), 201)
}))

router.patch('/wholesale/:id/payment', asyncHandler(async (req, res) => {
  id24.parse(req.params.id)
  ok(res, await svc.markWholesalePaymentReceived(req.params.id))
}))

// ─── EXPENSES ─────────────────────────────────────────────────────────────────
router.get('/expenses', asyncHandler(async (req, res) => {
  ok(res, await svc.getExpenses(req.query as Record<string, string>))
}))

router.post('/expenses', asyncHandler(async (req, res) => {
  const body = z.object({
    date:      z.string().regex(dateRx),
    feed:      z.number().min(0).default(0),
    labor:     z.number().min(0).default(0),
    transport: z.number().min(0).default(0),
    medical:   z.number().min(0).default(0),
    misc:      z.number().min(0).default(0),
  }).parse(req.body)
  ok(res, await svc.upsertExpense(body))
}))

// ─── REPORTS ──────────────────────────────────────────────────────────────────
router.get('/reports/monthly', asyncHandler(async (req, res) => {
  const { month } = req.query as { month?: string }

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    res.status(400).json({ success: false, message: 'month required (YYYY-MM)' })
    return
  }

  ok(res, await svc.getMonthlyReport(month))
}))

// ─── Error handler ────────────────────────────────────────────────────────────
router.use((err: Error, _req: Request, res: Response) => {
  const isZod = err.name === 'ZodError'
  res.status(isZod ? 400 : 500).json({
    success: false,
    message: isZod ? 'Validation error' : err.message,
  })
})

export default router