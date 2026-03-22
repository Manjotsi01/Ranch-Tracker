"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyReport = exports.getProductBreakdown = exports.getRevenueChart = exports.createPosSale = exports.getSaleById = exports.getSales = exports.deleteBatch = exports.updateBatch = exports.createBatch = exports.getBatchById = exports.getBatches = exports.getStats = void 0;
// server/src/services/shop.service.ts
//
// FIX: Rewrote entirely.
//   - Added getStats(), getBatches(), getBatchById(), updateBatch(), deleteBatch()
//   - Added getSales(), getSaleById()
//   - Added getRevenueChart(), getProductBreakdown(), getDailyReport()
//   - createPosSale now uses CASH/UPI/CARD/CREDIT and productType string (not ObjectId)
//   - All status values use PROCESSING/READY/EXPIRED
// ─────────────────────────────────────────────────────────────────────────────
const mongoose_1 = __importDefault(require("mongoose"));
const Batch_1 = __importDefault(require("../models/Batch"));
const Sale_1 = require("../models/Sale");
// ── Helper ────────────────────────────────────────────────────────────────────
const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const startOfWeek = () => { const d = startOfDay(); d.setDate(d.getDate() - 6); return d; };
const startOfMonth = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); };
// ── Stats ─────────────────────────────────────────────────────────────────────
const getStats = async () => {
    const [todayAgg, weekAgg, activeBatches, lowStock] = await Promise.all([
        Sale_1.SaleModel.aggregate([
            { $match: { dateTime: { $gte: startOfDay() } } },
            { $group: { _id: null, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
        ]),
        Sale_1.SaleModel.aggregate([
            { $match: { dateTime: { $gte: startOfWeek() } } },
            { $group: { _id: null, revenue: { $sum: '$totalAmount' } } },
        ]),
        Batch_1.default.countDocuments({ status: { $in: ['PROCESSING', 'READY'] } }),
        Batch_1.default.countDocuments({ status: 'READY', stockRemaining: { $lte: 5 } }),
    ]);
    const todayTop = await Sale_1.SaleModel.aggregate([
        { $match: { dateTime: { $gte: startOfDay() } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.productId', rev: { $sum: '$items.total' } } },
        { $sort: { rev: -1 } },
        { $limit: 1 },
    ]);
    return {
        todaySales: todayAgg[0]?.count ?? 0,
        todayRevenue: todayAgg[0]?.revenue ?? 0,
        weekRevenue: weekAgg[0]?.revenue ?? 0,
        activeBatches,
        lowStockAlerts: lowStock,
        topProduct: todayTop[0]?._id ?? '',
        avgOrderValue: todayAgg[0]?.count
            ? (todayAgg[0].revenue / todayAgg[0].count)
            : 0,
    };
};
exports.getStats = getStats;
// ── Batches ───────────────────────────────────────────────────────────────────
const getBatches = async (filters) => {
    const query = {};
    if (filters.status)
        query.status = filters.status;
    if (filters.productType)
        query.productType = filters.productType;
    return Batch_1.default.find(query).sort({ createdAt: -1 });
};
exports.getBatches = getBatches;
const getBatchById = async (id) => Batch_1.default.findById(id);
exports.getBatchById = getBatchById;
const createBatch = async (data) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const costs = data.costs ?? {};
        const totalCost = (data.input?.milkCost ?? 0) +
            (costs.labor ?? 0) +
            (costs.fuel ?? 0) +
            (costs.ingredients ?? 0) +
            (costs.packaging ?? 0) +
            (costs.utilities ?? 0);
        const qty = data.output?.quantityProduced ?? 0;
        const costPerUnit = qty > 0 ? totalCost / qty : 0;
        const batch = new Batch_1.default({
            ...data,
            pricing: { ...data.pricing, costPerUnit },
            stockRemaining: qty,
            status: data.status ?? 'PROCESSING',
        });
        await batch.save({ session });
        await session.commitTransaction();
        return batch;
    }
    catch (err) {
        await session.abortTransaction();
        throw err;
    }
    finally {
        session.endSession();
    }
};
exports.createBatch = createBatch;
const updateBatch = async (id, data) => {
    const batch = await Batch_1.default.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    if (!batch)
        throw new Error('Batch not found');
    return batch;
};
exports.updateBatch = updateBatch;
const deleteBatch = async (id) => {
    const batch = await Batch_1.default.findByIdAndDelete(id);
    if (!batch)
        throw new Error('Batch not found');
    return batch;
};
exports.deleteBatch = deleteBatch;
// ── Sales ─────────────────────────────────────────────────────────────────────
const getSales = async (params) => {
    const { page = 1, limit = 20, from, to, paymentMode } = params;
    const query = {};
    if (from || to) {
        query.dateTime = {
            ...(from ? { $gte: new Date(from) } : {}),
            ...(to ? { $lte: new Date(to + 'T23:59:59') } : {}),
        };
    }
    if (paymentMode)
        query.paymentMode = paymentMode;
    const [data, total] = await Promise.all([
        Sale_1.SaleModel.find(query).sort({ dateTime: -1 }).skip((page - 1) * limit).limit(limit),
        Sale_1.SaleModel.countDocuments(query),
    ]);
    return { data, total, page, limit };
};
exports.getSales = getSales;
const getSaleById = async (id) => Sale_1.SaleModel.findById(id);
exports.getSaleById = getSaleById;
const createPosSale = async (items, paymentMode, customerName, customerId) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const saleItems = [];
        let totalAmount = 0;
        for (const item of items) {
            const batch = await Batch_1.default.findById(item.batchId).session(session);
            if (!batch)
                throw new Error(`Batch ${item.batchId} not found`);
            if (batch.status === 'EXPIRED')
                throw new Error(`Batch ${batch.batchId} is expired`);
            if (batch.stockRemaining < item.quantity)
                throw new Error(`Insufficient stock in batch ${batch.batchId}`);
            batch.stockRemaining -= item.quantity;
            if (batch.stockRemaining === 0)
                batch.status = 'EXPIRED';
            await batch.save({ session });
            const lineTotal = item.unitPrice * item.quantity * (1 - (item.discount ?? 0) / 100);
            totalAmount += lineTotal;
            saleItems.push({
                productId: item.productId,
                batchId: batch._id,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: item.discount ?? 0,
                total: lineTotal,
            });
        }
        const sale = new Sale_1.SaleModel({
            items: saleItems,
            paymentMode,
            totalAmount,
            customerName,
            customerId,
        });
        await sale.save({ session });
        await session.commitTransaction();
        return sale;
    }
    catch (err) {
        await session.abortTransaction();
        throw err;
    }
    finally {
        session.endSession();
    }
};
exports.createPosSale = createPosSale;
// ── Reports ───────────────────────────────────────────────────────────────────
const getRevenueChart = async (period = 'week') => {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
    const from = new Date(Date.now() - days * 86400000);
    const raw = await Sale_1.SaleModel.aggregate([
        { $match: { dateTime: { $gte: from } } },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$dateTime', timezone: '+05:30' }
                },
                revenue: { $sum: '$totalAmount' },
                orders: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);
    // Fill missing days with zero
    const map = new Map(raw.map((r) => [r._id, r]));
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const key = d.toISOString().slice(0, 10);
        const entry = map.get(key);
        result.push({ date: key, revenue: entry?.revenue ?? 0, orders: entry?.orders ?? 0 });
    }
    return result;
};
exports.getRevenueChart = getRevenueChart;
const getProductBreakdown = async (from, to) => {
    const match = {};
    if (from || to) {
        match.dateTime = {
            ...(from ? { $gte: new Date(from) } : {}),
            ...(to ? { $lte: new Date(to + 'T23:59:59') } : {}),
        };
    }
    return Sale_1.SaleModel.aggregate([
        ...(Object.keys(match).length ? [{ $match: match }] : []),
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.productId',
                totalSold: { $sum: '$items.quantity' },
                totalRevenue: { $sum: '$items.total' },
            },
        },
        { $project: { _id: 0, productType: '$_id', totalSold: 1, totalRevenue: 1 } },
        { $sort: { totalRevenue: -1 } },
    ]);
};
exports.getProductBreakdown = getProductBreakdown;
const getDailyReport = async (dateStr) => {
    const day = dateStr ? new Date(dateStr) : new Date();
    const start = startOfDay(day);
    const end = new Date(start.getTime() + 86400000);
    const [sales, revenue] = await Promise.all([
        Sale_1.SaleModel.find({ dateTime: { $gte: start, $lt: end } }).sort({ dateTime: -1 }),
        Sale_1.SaleModel.aggregate([
            { $match: { dateTime: { $gte: start, $lt: end } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
        ]),
    ]);
    return {
        date: start.toISOString().slice(0, 10),
        sales,
        summary: { total: revenue[0]?.total ?? 0, count: revenue[0]?.count ?? 0 },
    };
};
exports.getDailyReport = getDailyReport;
