"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyReportHandler = exports.getProductBreakdownHandler = exports.getRevenueChartHandler = exports.posSaleHandler = exports.getSaleByIdHandler = exports.getSalesHandler = exports.deleteBatchHandler = exports.updateBatchHandler = exports.createBatchHandler = exports.getBatchByIdHandler = exports.getBatchesHandler = exports.getStatsHandler = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const response_1 = require("../utils/response");
const shopService = __importStar(require("../services/shop.service"));
// ── Stats ─────────────────────────────────────────────────────────────────────
exports.getStatsHandler = (0, express_async_handler_1.default)(async (_req, res) => {
    const data = await shopService.getStats();
    (0, response_1.sendSuccess)(res, data);
});
// ── Batches ───────────────────────────────────────────────────────────────────
exports.getBatchesHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const { status, productType } = req.query;
    const data = await shopService.getBatches({ status, productType });
    (0, response_1.sendSuccess)(res, data);
});
exports.getBatchByIdHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await shopService.getBatchById(req.params.id);
    if (!data) {
        res.status(404).json({ success: false, message: 'Batch not found' });
        return;
    }
    (0, response_1.sendSuccess)(res, data);
});
exports.createBatchHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await shopService.createBatch(req.body);
    (0, response_1.sendSuccess)(res, data, 201);
});
exports.updateBatchHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await shopService.updateBatch(req.params.id, req.body);
    (0, response_1.sendSuccess)(res, data);
});
exports.deleteBatchHandler = (0, express_async_handler_1.default)(async (req, res) => {
    await shopService.deleteBatch(req.params.id);
    (0, response_1.sendSuccess)(res, { deleted: true });
});
// ── Sales ─────────────────────────────────────────────────────────────────────
exports.getSalesHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const { page, limit, from, to, paymentMode } = req.query;
    const data = await shopService.getSales({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        from, to, paymentMode,
    });
    (0, response_1.sendSuccess)(res, data);
});
exports.getSaleByIdHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const data = await shopService.getSaleById(req.params.id);
    if (!data) {
        res.status(404).json({ success: false, message: 'Sale not found' });
        return;
    }
    (0, response_1.sendSuccess)(res, data);
});
exports.posSaleHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const { items, paymentMode, customerName, customerId } = req.body;
    const result = await shopService.createPosSale(items, paymentMode, customerName, customerId);
    (0, response_1.sendSuccess)(res, result, 201);
});
// ── Reports ───────────────────────────────────────────────────────────────────
exports.getRevenueChartHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const { period } = req.query;
    const data = await shopService.getRevenueChart(period);
    (0, response_1.sendSuccess)(res, data);
});
exports.getProductBreakdownHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const { from, to } = req.query;
    const data = await shopService.getProductBreakdown(from, to);
    (0, response_1.sendSuccess)(res, data);
});
exports.getDailyReportHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const { date } = req.query;
    const data = await shopService.getDailyReport(date);
    (0, response_1.sendSuccess)(res, data);
});
