// Path: ranch-tracker/server/src/models/Sale.ts

import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const saleItemEmbedSchema = new mongoose.Schema(
  {
    productId:  { type: String, required: true },
    batchId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    quantity:   { type: Number, required: true, min: 1 },
    unitPrice:  { type: Number, required: true },
    discount:   { type: Number, default: 0 },
    total:      { type: Number, required: true },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    saleId: {
      type: String,
      unique: true,
      default: () => `SALE-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`,
    },
    dateTime:     { type: Date, default: Date.now, required: true },
    customerId:   { type: String },
    customerName: { type: String },
    items:        { type: [saleItemEmbedSchema], required: true },
    paymentMode:  { type: String, enum: ['CASH', 'UPI', 'CARD', 'CREDIT'], required: true },
    totalAmount:  { type: Number, required: true },
    createdBy:    { type: String, default: 'system' },
  },
  { timestamps: true }
);

saleSchema.index({ dateTime: -1 });
saleSchema.index({ paymentMode: 1 });

export const SaleModel = mongoose.model('Sale', saleSchema);
export default SaleModel;