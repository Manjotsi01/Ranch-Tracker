import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const PRODUCT_TYPES = [
  'PANEER','GHEE','DAHI','BUTTER','MAKKAN','KHOYA',
  'CREAM','LASSI','KULFI','KHEER','ICE_CREAM',
  'HOT_MILK','BAKERY','CHAAT','RESTAURANT',
] as const;

const batchSchema = new mongoose.Schema({
  batchId: {
    type:    String,
    unique:  true,
    default: () => `BCH-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`,
  },
  productType:    { type: String, enum: PRODUCT_TYPES, required: true },
  productionDate: { type: Date, required: true, default: Date.now },
  expiryDate:     { type: Date, required: true },
  input: {
    milkLiters: { type: Number, default: 0 },
    milkSource: { type: String, enum: ['INTERNAL', 'EXTERNAL'], default: 'INTERNAL' },
    avgFat:     { type: Number, default: 0 },
    avgSNF:     { type: Number, default: 0 },
    milkCost:   { type: Number, default: 0 },
  },
  costs: {
    labor:       { type: Number, default: 0 },
    fuel:        { type: Number, default: 0 },
    ingredients: { type: Number, default: 0 },
    packaging:   { type: Number, default: 0 },
    utilities:   { type: Number, default: 0 },
  },
  output: {
    quantityProduced: { type: Number, required: true, min: 1 },
    wastage:          { type: Number, default: 0 },
  },
  pricing: {
    costPerUnit:         { type: Number, default: 0 },
    sellingPricePerUnit: { type: Number, required: true, min: 0 },
  },
  stockRemaining: { type: Number, required: true },
  qualityScore:   { type: Number, default: 100, min: 0, max: 100 },
  status: {
    type:    String,
    enum:    ['PROCESSING', 'READY', 'EXPIRED', 'DEPLETED'],
    default: 'PROCESSING',
  },
}, { timestamps: true });

batchSchema.index({ productType: 1, status: 1, expiryDate: 1 });
batchSchema.index({ expiryDate: 1, stockRemaining: 1 });

export default mongoose.model('Batch', batchSchema);