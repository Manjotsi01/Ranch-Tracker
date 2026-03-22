// server/src/models/ReproductionRecord.ts
import mongoose from 'mongoose';

const reproductionRecordSchema = new mongoose.Schema({
  animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  date:     { type: Date, default: Date.now },
  type:     { type: String, enum: ['AI', 'Natural', 'Calving', 'Heat'] },

  // AI fields
  semenBullName:      { type: String },
  semenCode:          { type: String },
  technicianName:     { type: String },
  status:             { type: String, enum: ['DONE', 'PREGNANT', 'NOT_PREGNANT', 'UNKNOWN'], default: 'DONE' },
  pregnancyCheckDate: { type: Date },

  // Calving fields
  calfGender:    { type: String, enum: ['FEMALE', 'MALE'] },
  calfTagNo:     { type: String },
  calfWeight:    { type: Number },
  complications: { type: String },

  cost:  { type: Number, default: 0 },
  notes: { type: String },
}, { timestamps: true });

reproductionRecordSchema.index({ animalId: 1, date: -1 });

export default mongoose.model('ReproductionRecord', reproductionRecordSchema);