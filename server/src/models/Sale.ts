import mongoose, { Schema, Document } from 'mongoose'

export interface ISaleItem {
  productId: mongoose.Types.ObjectId
  productName: string
  unit: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface ISale extends Document {
  dateTime: Date
  items: ISaleItem[]
  paymentMode: 'CASH' | 'UPI'
  totalAmount: number
  customerName?: string
}

const saleItemSchema = new Schema<ISaleItem>({
  productId:   { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  unit:        { type: String, required: true },
  quantity:    { type: Number, required: true, min: 0.01 },
  unitPrice:   { type: Number, required: true, min: 0 },
  lineTotal:   { type: Number, required: true, min: 0 },
}, { _id: false })

const schema = new Schema<ISale>({
  dateTime:     { type: Date, default: Date.now },
  items:        { type: [saleItemSchema], required: true },
  paymentMode:  { type: String, enum: ['CASH', 'UPI'], default: 'CASH' },
  totalAmount:  { type: Number, required: true, min: 0 },
  customerName: { type: String, maxlength: 80 },
}, { timestamps: true })

schema.index({ dateTime: -1 })
export default mongoose.model<ISale>('Sale', schema)