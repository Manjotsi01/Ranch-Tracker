"use strict";
// Path: ranch-tracker/server/src/models/YieldRecord.ts
//
// ✅ FIXES — aligned with frontend YieldEntry type:
//  1. seasonId is now String (not ObjectId ref) — frontend sends Mongo _id as string
//  2. Added `unit`, `grade`, `marketPrice`, `notes` fields (all missing before)
//  3. Added `revenue` field alias alongside `revenueRealized` for compatibility
//  4. Added `yieldId` virtual → exposes _id as yieldId to match frontend type
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const yieldRecordSchema = new mongoose_1.default.Schema({
    seasonId: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'kg' },
    grade: { type: String },
    marketPrice: { type: Number, required: true },
    // Stored as revenueRealized in DB; service writes it as revenueRealized
    // Frontend reads it as `revenue` via the virtual below
    revenueRealized: { type: Number, default: 0 },
    notes: { type: String },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Virtual: expose _id as yieldId (matches frontend YieldEntry.yieldId)
yieldRecordSchema.virtual('yieldId').get(function () {
    return this._id.toString();
});
// Virtual: expose revenueRealized as revenue (matches frontend YieldEntry.revenue)
yieldRecordSchema.virtual('revenue').get(function () {
    return this.revenueRealized;
});
exports.default = mongoose_1.default.model('YieldRecord', yieldRecordSchema);
