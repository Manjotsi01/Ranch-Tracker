import mongoose, { Schema, Document } from 'mongoose'

export const PRODUCT_CATEGORIES = [
  'MILK', 'CURD', 'PANEER', 'GHEE', 'BUTTER',
  'LASSI', 'KHOYA', 'CREAM', 'OTHER'
] as const

export type ProductCategory = typeof PRODUCT_CATEGORIES[number]

// Suggestion map: if X is out of stock, suggest these
export const SUGGESTIONS: Record<ProductCategory, ProductCategory[]> = {
  MILK:   ['LASSI', 'CURD'],
  CURD:   ['MILK', 'LASSI'],
  PANEER: ['KHOYA'],
  GHEE:   ['BUTTER', 'CREAM'],
  BUTTER: ['GHEE', 'CREAM'],
  LASSI:  ['MILK', 'CURD'],
  KHOYA:  ['PANEER'],
  CREAM:  ['BUTTER', 'GHEE'],
  OTHER:  [],
}

export interface IProduct extends Document {
  name: string
  category: ProductCategory
  unit: string
  mrp: number
  costPrice: number
  stockQty: number
  isActive: boolean
  quickButtons: number[]
  lowStockThreshold: number
}

const schema = new Schema<IProduct>({
  name:              { type: String, required: true, trim: true, maxlength: 60 },
  category:          { type: String, enum: PRODUCT_CATEGORIES, default: 'OTHER' },
  unit:              { type: String, required: true, trim: true, maxlength: 20 },
  mrp:               { type: Number, required: true, min: 0 },
  costPrice:         { type: Number, default: 0, min: 0 },
  stockQty:          { type: Number, default: 0, min: 0 },
  isActive:          { type: Boolean, default: true },
  quickButtons:      { type: [Number], default: [1] },
  lowStockThreshold: { type: Number, default: 5 },
}, { timestamps: true })

schema.index({ isActive: 1, category: 1 })
export default mongoose.model<IProduct>('Product', schema)