"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/models/HealthRecord.ts
const mongoose_1 = __importDefault(require("mongoose"));
const healthRecordSchema = new mongoose_1.default.Schema({
    animalId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Animal', required: true },
    recordType: { type: String, enum: ['VACCINATION', 'TREATMENT'], default: 'TREATMENT' },
    date: { type: Date, default: Date.now },
    // Shared
    condition: { type: String }, // vaccineName for vaccinations, diagnosis for treatments
    cost: { type: Number, default: 0 },
    veterinarianName: { type: String },
    notes: { type: String },
    // Vaccination-specific
    vaccineStatus: { type: String, enum: ['GIVEN', 'DUE', 'OVERDUE', 'SCHEDULED'] },
    nextDueDate: { type: Date },
    dosage: { type: String },
    // Treatment-specific
    medicines: { type: [String], default: [] },
    followUpDate: { type: Date },
    treatment: { type: String }, // legacy field
}, { timestamps: true });
healthRecordSchema.index({ animalId: 1, date: -1 });
exports.default = mongoose_1.default.model('HealthRecord', healthRecordSchema);
