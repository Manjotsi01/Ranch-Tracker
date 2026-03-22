"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ─────────────────────────────────────────────────────────────────────────────
// server/src/models/Batch.ts
//
// FIX: Complete rewrite to match frontend Batch type.
//   - Removed `productId` ObjectId ref (frontend uses `productType` string enum)
//   - Added `batchId` (auto-generated human-readable ID, e.g. "BCH-20240315-A3F2")
//   - `input` fields renamed: fat→avgFat, SNF→avgSNF (match frontend BatchInput type)
//   - `status` enum changed: Active/Depleted/Expired → PROCESSING/READY/EXPIRED
//   - Added `qualityScore` field
// ─────────────────────────────────────────────────────────────────────────────
const mongoose_1 = __importDefault(require("mongoose"));
const nanoid_1 = require("nanoid");
const PRODUCT_TYPES = [
    'PANEER', 'GHEE', 'DAHI', 'BUTTER', 'MAKKAN', 'KHOYA',
    'CREAM', 'LASSI', 'KULFI', 'KHEER', 'ICE_CREAM',
    'HOT_MILK', 'BAKERY', 'CHAAT', 'RESTAURANT',
];
const batchSchema = new mongoose_1.default.Schema({
    batchId: {
        type: String,
        unique: true,
        default: () => `BCH-${Date.now().toString(36).toUpperCase()}-${(0, nanoid_1.nanoid)(4).toUpperCase()}`,
    },
    productType: {
        type: String,
        enum: PRODUCT_TYPES,
        required: true,
    },
    productionDate: { type: Date, required: true, default: Date.now },
    expiryDate: { type: Date, required: true },
    input: {
        milkLiters: { type: Number, default: 0 },
        milkSource: { type: String, enum: ['INTERNAL', 'EXTERNAL'], default: 'INTERNAL' },
        avgFat: { type: Number, default: 0 },
        avgSNF: { type: Number, default: 0 },
        milkCost: { type: Number, default: 0 },
    },
    costs: {
        labor: { type: Number, default: 0 },
        fuel: { type: Number, default: 0 },
        ingredients: { type: Number, default: 0 },
        packaging: { type: Number, default: 0 },
        utilities: { type: Number, default: 0 },
    },
    output: {
        quantityProduced: { type: Number, required: true, min: 1 },
        wastage: { type: Number, default: 0 },
    },
    pricing: {
        costPerUnit: { type: Number, default: 0 },
        sellingPricePerUnit: { type: Number, required: true, min: 0 },
    },
    stockRemaining: { type: Number, required: true },
    qualityScore: { type: Number, default: 100, min: 0, max: 100 },
    status: {
        type: String,
        enum: ['PROCESSING', 'READY', 'EXPIRED'],
        default: 'PROCESSING',
    },
}, { timestamps: true });
batchSchema.index({ productType: 1, status: 1, expiryDate: 1 });
exports.default = mongoose_1.default.model('Batch', batchSchema);
