"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const saleItemSchema = new mongoose_1.default.Schema({
    saleId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Sale', required: true },
    productId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Product', required: true },
    batchId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Batch', required: true },
    quantity: { type: Number, required: true },
    pricePerUnit: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    subtotal: { type: Number, required: true }
}, { timestamps: true });
exports.default = mongoose_1.default.model('SaleItem', saleItemSchema);
