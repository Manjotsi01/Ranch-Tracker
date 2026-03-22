"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const fieldSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    area: { type: Number, required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });
exports.default = mongoose_1.default.model('Field', fieldSchema);
