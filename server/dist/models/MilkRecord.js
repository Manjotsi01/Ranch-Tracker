"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/models/MilkRecord.ts
const mongoose_1 = __importDefault(require("mongoose"));
const milkRecordSchema = new mongoose_1.default.Schema({
    animalId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Animal', required: true },
    date: { type: Date, required: true, default: Date.now },
    // Legacy split fields
    morning: { type: Number, default: 0 },
    evening: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    // Frontend-native fields
    session: { type: String, enum: ['MORNING', 'EVENING'] },
    quantity: { type: Number },
    fat: { type: Number },
    snf: { type: Number },
    notes: { type: String },
}, { timestamps: true });
milkRecordSchema.index({ animalId: 1, date: -1 });
exports.default = mongoose_1.default.model('MilkRecord', milkRecordSchema);
