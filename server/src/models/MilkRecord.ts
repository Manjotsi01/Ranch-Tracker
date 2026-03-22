// server/src/models/MilkRecord.ts
import mongoose from 'mongoose';

const milkRecordSchema = new mongoose.Schema({
  animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  date:     { type: Date, required: true, default: Date.now },

  // Legacy split fields
  morning: { type: Number, default: 0 },
  evening: { type: Number, default: 0 },
  total:   { type: Number, default: 0 },

  // Frontend-native fields
  session:  { type: String, enum: ['MORNING', 'EVENING'] },
  quantity: { type: Number },
  fat:      { type: Number },
  snf:      { type: Number },
  notes:    { type: String },
}, { timestamps: true });

milkRecordSchema.index({ animalId: 1, date: -1 });

export default mongoose.model('MilkRecord', milkRecordSchema);