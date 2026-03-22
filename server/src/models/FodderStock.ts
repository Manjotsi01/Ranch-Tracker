// server/src/models/FodderStock.ts
import mongoose from 'mongoose';

const fodderStockSchema = new mongoose.Schema({
  // Differentiates crop records from stock records
  isCrop: { type: Boolean, default: false },

  // Stock fields
  fodderType: { type: String, enum: ['GREEN', 'DRY', 'SILAGE', 'CONCENTRATE', 'SUPPLEMENT','green', 'dry', 'silage', 'supplements'] },
  fodderName: { type: String },
  quantity:   { type: Number, default: 0 },
  unit:       { type: String, default: 'kg' },
  costPerUnit:  { type: Number, default: 0 },
  purchaseDate: { type: Date },
  expiryDate:   { type: Date },
  supplier:     { type: String },

  // Crop fields
  cropName:             { type: String },
  variety:              { type: String },
  area:                 { type: Number },
  plantingDate:         { type: Date },
  expectedHarvestDate:  { type: Date },
  status:               { type: String, enum: ['PLANNED', 'GROWING', 'HARVESTED'] },
  expectedYield:        { type: Number },
  cost:                 { type: Number },

  notes: { type: String },

  
  type:     { type: String },
  stockKg:  { type: Number, default: 0 },
  costPerKg:{ type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('FodderStock', fodderStockSchema);