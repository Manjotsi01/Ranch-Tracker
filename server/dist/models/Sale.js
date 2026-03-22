"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaleModel = void 0;
// server/src/models/Sale.ts
//
// FIX: Complete rewrite to match frontend Sale type.
//   - Added `saleId` (human-readable, e.g. "SALE-20240315-XY12")
//   - Added `customerName`, `customerId`, `createdBy`
//   - `paymentMode` enum aligned: Cash/UPI/Card/Credit → CASH/UPI/CARD/CREDIT
//   - Embedded `items` array directly in Sale (eliminates SaleItem join for reads)
// ─────────────────────────────────────────────────────────────────────────────
const mongoose_1 = __importDefault(require("mongoose"));
const nanoid_1 = require("nanoid");
const saleItemEmbedSchema = new mongoose_1.default.Schema({
    productId: { type: String, required: true }, // productType string, e.g. "PANEER"
    batchId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Batch', required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
}, { _id: false });
const saleSchema = new mongoose_1.default.Schema({
    saleId: {
        type: String,
        unique: true,
        default: () => `SALE-${Date.now().toString(36).toUpperCase()}-${(0, nanoid_1.nanoid)(4).toUpperCase()}`,
    },
    dateTime: { type: Date, default: Date.now, required: true },
    customerId: { type: String },
    customerName: { type: String },
    items: { type: [saleItemEmbedSchema], required: true },
    paymentMode: { type: String, enum: ['CASH', 'UPI', 'CARD', 'CREDIT'], required: true },
    totalAmount: { type: Number, required: true },
    createdBy: { type: String, default: 'system' },
}, { timestamps: true });
saleSchema.index({ dateTime: -1 });
saleSchema.index({ paymentMode: 1 });
exports.SaleModel = mongoose_1.default.model('Sale', saleSchema);
