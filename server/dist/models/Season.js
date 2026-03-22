"use strict";
// Path: ranch-tracker/server/src/models/Season.ts
//
// ✅ FIXES — aligned with frontend CropSeason type and CreateSeasonModal payload:
//  1. Added `label`       (was missing — frontend always sends it, required)
//  2. Renamed `area`      → `areaSown`  (frontend sends areaSown)
//  3. Added `areaUnit`    (was missing)
//  4. Added `budget`      (was missing)
//  5. Added `cropName`    (was missing — needed for getAllCrops aggregate)
//  6. Added `variety`     as optional (was required before, breaking creation)
//  7. Fixed `status` enum → ['PLANNED','ACTIVE','HARVESTED','COMPLETED','ABANDONED']
//  8. Renamed `totalrevenueRealized` → `totalRevenue` (matches service + frontend)
//  9. Added `seasonId` virtual → exposes _id as seasonId to match frontend type
// 10. Added `notes`, `yieldUnit`, `totalYield` fields
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const seasonSchema = new mongoose_1.default.Schema({
    // ─── Core identifiers ──────────────────────────────────────────────────────
    cropId: { type: String, required: true, index: true },
    cropName: { type: String }, // denormalised for display + aggregation
    // ─── Season info ───────────────────────────────────────────────────────────
    label: { type: String, required: true }, // e.g. "Rabi 2025-26"
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    // ─── Area ──────────────────────────────────────────────────────────────────
    areaSown: { type: Number, required: true }, // was `area`
    areaUnit: { type: String, default: 'acres' }, // acres / bigha / hectare / kanal
    // ─── Optional details ──────────────────────────────────────────────────────
    variety: { type: String },
    budget: { type: Number, default: 0 },
    notes: { type: String },
    // ─── Status ────────────────────────────────────────────────────────────────
    // Frontend sends 'PLANNED' on creation; old model only had 'Active'/'Completed'
    status: {
        type: String,
        enum: ['PLANNED', 'ACTIVE', 'HARVESTED', 'COMPLETED', 'ABANDONED'],
        default: 'PLANNED',
    },
    // ─── Aggregated financials (updated via $inc on expense/yield write) ───────
    totalExpense: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 }, // was `totalrevenueRealized`
    // ─── Aggregated yield ──────────────────────────────────────────────────────
    totalYield: { type: Number, default: 0 },
    yieldUnit: { type: String },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// ─── Virtual: expose _id as seasonId ─────────────────────────────────────────
// Frontend CropSeason type uses `seasonId` everywhere.
// This virtual means res.data.seasonId works without renaming in every service call.
seasonSchema.virtual('seasonId').get(function () {
    return this._id.toString();
});
// ─── Indexes ──────────────────────────────────────────────────────────────────
seasonSchema.index({ cropId: 1, startDate: -1 });
exports.default = mongoose_1.default.model('Season', seasonSchema);
