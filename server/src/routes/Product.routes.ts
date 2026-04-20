import { Router, Request, Response, NextFunction } from 'express'
import asyncHandler from 'express-async-handler'
import {
  createProductSchema, updateProductSchema,
  adjustStockSchema, setStockSchema,
} from '../validators/product.validator'
import * as productService from '../services/product.service'
import { validate } from '../middleware/validate'
import { sendSuccess } from '../utils/response'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const products = await productService.getProducts()
    res.json({ success: true, data: products })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products' })
  }
})

// GET /api/products/:id
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const data = await productService.getProductById(req.params.id)
  sendSuccess(res, data)
}))

// POST /api/products
router.post(
  '/',
  validate(createProductSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const data = await productService.createProduct(req.body)
    sendSuccess(res, data, 201)
  })
)

// PATCH /api/products/:id  → update name, price, unit, etc.
router.patch(
  '/:id',
  validate(updateProductSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const data = await productService.updateProduct(req.params.id, req.body)
    sendSuccess(res, data)
  })
)

// PATCH /api/products/:id/stock/adjust  → atomic +/- delta (used by POS)
router.patch(
  '/:id/stock/adjust',
  validate(adjustStockSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const data = await productService.adjustStock(req.params.id, req.body.delta)
    sendSuccess(res, data)
  })
)

// PATCH /api/products/:id/stock/set  → manual stock correction
router.patch(
  '/:id/stock/set',
  validate(setStockSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const data = await productService.setStock(req.params.id, req.body.qty)
    sendSuccess(res, data)
  })
)

// DELETE /api/products/:id  → soft delete
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id)
  sendSuccess(res, { deleted: true })
}))

export default router