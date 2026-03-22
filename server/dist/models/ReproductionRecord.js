"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/models/ReproductionRecord.ts
const mongoose_1 = __importDefault(require("mongoose"));
const reproductionRecordSchema = new mongoose_1.default.Schema({
    animalId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Animal', required: true },
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['AI', 'Natural', 'Calving', 'Heat'] },
    // AI fields
    semenBullName: { type: String },
    semenCode: { type: String },
    technicianName: { type: String },
    status: { type: String, enum: ['DONE', 'PREGNANT', 'NOT_PREGNANT', 'UNKNOWN'], default: 'DONE' },
    pregnancyCheckDate: { type: Date },
    // Calving fields
    calfGender: { type: String, enum: ['FEMALE', 'MALE'] },
    calfTagNo: { type: String },
    calfWeight: { type: Number },
    complications: { type: String },
    cost: { type: Number, default: 0 },
    notes: { type: String },
}, { timestamps: true });
reproductionRecordSchema.index({ animalId: 1, date: -1 });
exports.default = mongoose_1.default.model('ReproductionRecord', reproductionRecordSchema);
