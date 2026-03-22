// server/src/models/FeedRecord.ts
import mongoose from 'mongoose';

const feedRecordSchema = new mongoose.Schema({
  animalId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  date:       { type: Date, default: Date.now },
  fodderType: { type: String, enum: ['GREEN', 'DRY', 'SILAGE', 'CONCENTRATE', 'SUPPLEMENT', 'green', 'dry', 'silage', 'supplements'] },
  fodderName: { type: String },
  quantity:   { type: Number, required: true },
  costPerKg:  { type: Number, default: 0 },
  notes:      { type: String },
}, { timestamps: true });

feedRecordSchema.index({ animalId: 1, date: -1 });

export default mongoose.model('FeedRecord', feedRecordSchema);