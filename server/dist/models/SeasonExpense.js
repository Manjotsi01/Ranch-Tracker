"use strict";
// Path: ranch-tracker/server/src/models/SeasonExpense.ts
//
// ✅ FIXES — aligned with frontend SeasonExpense type:
//  1. seasonId is now String (not ObjectId ref) — frontend sends Mongo _id as string
//  2. Renamed `operation` → `category` to match frontend SeasonExpense.category
//  3. Fixed category enum to match frontend: LAND_PREP, SEEDS, FERTILIZER, etc.
//  4. Added `description` as required (frontend always sends it)
//  5. Added `quantity`, `unit`, `vendor` optional fields
//  6. Added `expenseId` virtual → exposes _id as expenseId to match frontend type
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const seasonExpenseSchema = new mongoose_1.default.Schema({
    seasonId: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    // Frontend SeasonExpense.category enum:
    category: {
        type: String,
        required: true,
        enum: [
            'LAND_PREP', 'SEEDS', 'FERTILIZER', 'IRRIGATION',
            'LABOR', 'PEST_CONTROL', 'HARVESTING', 'TRANSPORT', 'OTHER',
            // Also accept the display-label values from constants.ts for flexibility
            'Machinery', 'Seed', 'Fertilizer', 'Irrigation', 'Labour',
            'Pest Control', 'Other',
        ],
        default: 'OTHER',
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    // Optional fields
    quantity: { type: Number },
    unit: { type: String },
    vendor: { type: String },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Virtual: expose _id as expenseId
seasonExpenseSchema.virtual('expenseId').get(function () {
    return this._id.toString();
});
exports.default = mongoose_1.default.model('SeasonExpense', seasonExpenseSchema);
