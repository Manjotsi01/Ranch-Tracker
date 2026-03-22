"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/models/FeedRecord.ts
const mongoose_1 = __importDefault(require("mongoose"));
const feedRecordSchema = new mongoose_1.default.Schema({
    animalId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Animal', required: true },
    date: { type: Date, default: Date.now },
    fodderType: { type: String, enum: ['GREEN', 'DRY', 'SILAGE', 'CONCENTRATE', 'SUPPLEMENT',
            'green', 'dry', 'silage', 'supplements'] },
    fodderName: { type: String },
    quantity: { type: Number, required: true },
    costPerKg: { type: Number, default: 0 },
    notes: { type: String },
}, { timestamps: true });
feedRecordSchema.index({ animalId: 1, date: -1 });
exports.default = mongoose_1.default.model('FeedRecord', feedRecordSchema);
