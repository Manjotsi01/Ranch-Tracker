import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema({
  saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  quantity: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  subtotal: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('SaleItem', saleItemSchema);
