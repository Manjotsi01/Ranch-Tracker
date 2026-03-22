"use strict";
// Path: ranch-tracker/server/src/services/agriculture.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteYield = exports.addYieldToSeason = exports.getYields = exports.deleteResource = exports.addResource = exports.getResources = exports.deleteExpense = exports.addExpenseToSeason = exports.getExpenses = exports.deleteSeason = exports.updateSeason = exports.getSeasonById = exports.getCropSeasons = exports.getSeasons = exports.createSeason = exports.getCropById = exports.getAllCrops = void 0;
const Season_1 = __importDefault(require("../models/Season"));
const SeasonExpense_1 = __importDefault(require("../models/SeasonExpense"));
const YieldRecord_1 = __importDefault(require("../models/YieldRecord"));
const getAllCrops = async () => {
    const crops = await Season_1.default.aggregate([
        {
            $group: {
                _id: '$cropId',
                name: { $first: '$cropName' },
                localName: { $first: '$localName' },
                activeSeasonsCount: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } },
                totalArea: { $sum: '$areaSown' },
                totalExpense: { $sum: '$totalExpense' },
                totalRevenue: { $sum: '$totalRevenue' },
                totalProfit: { $sum: { $subtract: ['$totalRevenue', '$totalExpense'] } },
                latestSeason: { $last: { label: '$label', status: '$status' } },
            },
        },
        {
            $project: {
                cropId: '$_id',
                name: 1,
                localName: 1,
                latestSeason: 1,
                stats: {
                    activeSeasonsCount: '$activeSeasonsCount',
                    totalArea: '$totalArea',
                    totalExpense: '$totalExpense',
                    totalRevenue: '$totalRevenue',
                    totalProfit: '$totalProfit',
                },
            },
        },
    ]);
    return crops;
};
exports.getAllCrops = getAllCrops;
const getCropById = async (cropId) => {
    const [crop] = await Season_1.default.aggregate([
        { $match: { cropId } },
        {
            $group: {
                _id: '$cropId',
                name: { $first: '$cropName' },
                localName: { $first: '$localName' },
                totalExpense: { $sum: '$totalExpense' },
                totalRevenue: { $sum: '$totalRevenue' },
            },
        },
        { $project: { cropId: '$_id', name: 1, localName: 1, totalExpense: 1, totalRevenue: 1 } },
    ]);
    return crop ?? null;
};
exports.getCropById = getCropById;
// ─── Seasons ──────────────────────────────────────────────────────────────────
const createSeason = async (data) => {
    const season = await Season_1.default.create(data);
    return season;
};
exports.createSeason = createSeason;
const getSeasons = async () => {
    return Season_1.default.find().sort({ createdAt: -1 });
};
exports.getSeasons = getSeasons;
const getCropSeasons = async (cropId) => {
    return Season_1.default.find({ cropId }).sort({ startDate: -1 });
};
exports.getCropSeasons = getCropSeasons;
const getSeasonById = async (id) => {
    return Season_1.default.findById(id);
};
exports.getSeasonById = getSeasonById;
const updateSeason = async (id, data) => {
    return Season_1.default.findByIdAndUpdate(id, data, { new: true });
};
exports.updateSeason = updateSeason;
const deleteSeason = async (id) => {
    await SeasonExpense_1.default.deleteMany({ seasonId: id });
    await YieldRecord_1.default.deleteMany({ seasonId: id });
    await Season_1.default.findByIdAndDelete(id);
};
exports.deleteSeason = deleteSeason;
// ─── Expenses ─────────────────────────────────────────────────────────────────
const getExpenses = async (seasonId) => {
    return SeasonExpense_1.default.find({ seasonId }).sort({ date: -1 });
};
exports.getExpenses = getExpenses;
const addExpenseToSeason = async (seasonId, data) => {
    const expense = await SeasonExpense_1.default.create({ ...data, seasonId });
    await Season_1.default.findByIdAndUpdate(seasonId, { $inc: { totalExpense: data.amount } });
    return expense;
};
exports.addExpenseToSeason = addExpenseToSeason;
const deleteExpense = async (seasonId, expenseId) => {
    const expense = await SeasonExpense_1.default.findByIdAndDelete(expenseId);
    if (expense) {
        await Season_1.default.findByIdAndUpdate(seasonId, { $inc: { totalExpense: -expense.amount } });
    }
};
exports.deleteExpense = deleteExpense;
// ─── Resources ────────────────────────────────────────────────────────────────
const getResources = async (seasonId) => {
    return [];
};
exports.getResources = getResources;
const addResource = async (seasonId, data) => {
    return { ...data, seasonId, resourceId: `res_${Date.now()}` };
};
exports.addResource = addResource;
const deleteResource = async (seasonId, resourceId) => {
};
exports.deleteResource = deleteResource;
// ─── Yields ───────────────────────────────────────────────────────────────────
const getYields = async (seasonId) => {
    return YieldRecord_1.default.find({ seasonId }).sort({ date: -1 });
};
exports.getYields = getYields;
const addYieldToSeason = async (seasonId, data) => {
    const revenueValue = data.revenue ?? data.revenueRealized ?? 0;
    const yieldRecord = await YieldRecord_1.default.create({ ...data, revenueRealized: revenueValue, seasonId });
    await Season_1.default.findByIdAndUpdate(seasonId, { $inc: { totalRevenue: revenueValue } });
    return yieldRecord;
};
exports.addYieldToSeason = addYieldToSeason;
const deleteYield = async (seasonId, yieldId) => {
    const record = await YieldRecord_1.default.findByIdAndDelete(yieldId);
    if (record) {
        const amount = record.revenueRealized ?? record.revenue ?? 0;
        await Season_1.default.findByIdAndUpdate(seasonId, { $inc: { totalRevenue: -amount } });
    }
};
exports.deleteYield = deleteYield;
