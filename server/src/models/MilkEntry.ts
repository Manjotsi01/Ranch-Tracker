import mongoose, { Schema, Document } from 'mongoose'

export interface IMilkEntry extends Document {
  date: Date
  shift: 'MORNING' | 'EVENING'
  quantityLiters: number
  fat?: number
  snf?: number
  source: 'OWN' | 'PURCHASED'
  notes?: string
}

const schema = new Schema<IMilkEntry>({
  date:           { type: Date, required: true },
  shift:          { type: String, enum: ['MORNING', 'EVENING'], required: true },
  quantityLiters: { type: Number, required: true, min: 0.1 },
  fat:            { type: Number, min: 0, max: 10 },
  snf:            { type: Number, min: 0, max: 15 },
  source:         { type: String, enum: ['OWN', 'PURCHASED'], default: 'OWN' },
  notes:          { type: String, maxlength: 200 },
}, { timestamps: true })

schema.index({ date: -1, shift: 1 }, { unique: true })
export default mongoose.model<IMilkEntry>('MilkEntry', schema)