import mongoose, { Schema, Document } from 'mongoose'

export interface IExpense extends Document {
  date: Date
  feed: number
  labor: number
  transport: number
  medical: number
  misc: number
  total: number
}

const schema = new Schema<IExpense>({
  date:      { type: Date, required: true, unique: true },
  feed:      { type: Number, default: 0, min: 0 },
  labor:     { type: Number, default: 0, min: 0 },
  transport: { type: Number, default: 0, min: 0 },
  medical:   { type: Number, default: 0, min: 0 },
  misc:      { type: Number, default: 0, min: 0 },
  total:     { type: Number, default: 0, min: 0 },
}, { timestamps: true })

schema.index({ date: -1 })

// Auto-compute total before save
schema.pre('save', function (next) {
  this.total = this.feed + this.labor + this.transport + this.medical + this.misc
  next()
})

export default mongoose.model<IExpense>('Expense', schema)