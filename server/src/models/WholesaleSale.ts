import mongoose, { Schema, Document } from 'mongoose'

export interface IWholesaleSale extends Document {
  date: Date
  buyerName: string
  quantityLiters: number
  ratePerLiter: number
  fat?: number
  snf?: number
  totalAmount: number
  paymentStatus: 'PENDING' | 'RECEIVED'
  paymentDate?: Date
  notes?: string
}

const schema = new Schema<IWholesaleSale>({
  date:           { type: Date, required: true },
  buyerName:      { type: String, required: true, trim: true, maxlength: 80 },
  quantityLiters: { type: Number, required: true, min: 0.1 },
  ratePerLiter:   { type: Number, required: true, min: 0 },
  fat:            { type: Number, min: 0, max: 10 },
  snf:            { type: Number, min: 0, max: 15 },
  totalAmount:    { type: Number, required: true },
  paymentStatus:  { type: String, enum: ['PENDING', 'RECEIVED'], default: 'PENDING' },
  paymentDate:    { type: Date },
  notes:          { type: String, maxlength: 200 },
}, { timestamps: true })

schema.index({ date: -1 })
schema.index({ paymentStatus: 1 })
export default mongoose.model<IWholesaleSale>('WholesaleSale', schema)