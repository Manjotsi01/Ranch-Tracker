"use strict";
// Path: ranch-tracker/server/src/services/dashboard.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MilkRecord_1 = __importDefault(require("../models/MilkRecord"));
const Animal_1 = __importDefault(require("../models/Animal"));
const Sale_1 = __importDefault(require("../models/Sale"));
const Batch_1 = __importDefault(require("../models/Batch"));
const FeedRecord_1 = __importDefault(require("../models/FeedRecord"));
const HealthRecord_1 = __importDefault(require("../models/HealthRecord"));
// ─── Helpers ──────────────────────────────────────────────────────────────────
function getPeriodRange(period) {
    const end = new Date();
    const start = new Date();
    if (period === 'week')
        start.setDate(end.getDate() - 7);
    if (period === 'month')
        start.setMonth(end.getMonth() - 1);
    if (period === 'year')
        start.setFullYear(end.getFullYear() - 1);
    start.setHours(0, 0, 0, 0);
    return { start, end };
}
function todayRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
}
function thisMonthStart() {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}
const BUFFALO_KEYWORDS = [
    'murrah', 'surti', 'mehsana', 'nili-ravi', 'jaffarabadi',
    'pandharpuri', 'banni', 'nagpuri', 'graded murrah',
];
function isBuffalo(breed) {
    const lower = (breed ?? '').toLowerCase();
    return BUFFALO_KEYWORDS.some(b => lower.includes(b));
}
// ─── Agriculture helpers — query by collection name directly ──────────────────
// We use mongoose.connection.collection() so we don't depend on model
// registration order. This always works regardless of which routes loaded first.
async function getAgriStats() {
    try {
        const db = mongoose_1.default.connection.db;
        if (!db)
            return { activeSeasons: 0, allSeasons: 0, activeCrops: 0, totalExpenses: 0, totalRevenue: 0 };
        const seasonsCol = db.collection('seasons');
        // allSeasons = every season ever created
        const allSeasons = await seasonsCol.countDocuments({});
        // activeSeasons = ACTIVE or PLANNED (show real data, not just 0)
        const activeSeasons = await seasonsCol.countDocuments({
            status: { $in: ['ACTIVE', 'PLANNED'] },
        });
        // activeCrops = distinct cropIds among active/planned seasons
        const activeCropIds = await seasonsCol.distinct('cropId', {
            status: { $in: ['ACTIVE', 'PLANNED'] },
        });
        // totalExpenses from agriculture = sum of totalExpense field on all seasons
        // (your season document stores totalExpense directly)
        const expenseAgg = await seasonsCol.aggregate([
            { $group: { _id: null, total: { $sum: '$totalExpense' } } },
        ]).toArray();
        const revenueAgg = await seasonsCol.aggregate([
            { $group: { _id: null, total: { $sum: '$totalRevenue' } } },
        ]).toArray();
        return {
            activeSeasons,
            allSeasons,
            activeCrops: activeCropIds.length,
            totalExpenses: expenseAgg[0]?.total ?? 0,
            totalRevenue: revenueAgg[0]?.total ?? 0,
        };
    }
    catch {
        return { activeSeasons: 0, allSeasons: 0, activeCrops: 0, totalExpenses: 0, totalRevenue: 0 };
    }
}
async function getAgriKPI(monthStart, lastMonthStart) {
    try {
        const db = mongoose_1.default.connection.db;
        if (!db)
            return null;
        const seasonsCol = db.collection('seasons');
        const expensesCol = db.collection('seasonexpenses');
        // Revenue = sum of totalRevenue on seasons created/updated this month
        const [revenueAgg, prevRevenueAgg, expenseAgg] = await Promise.all([
            seasonsCol.aggregate([
                { $match: { updatedAt: { $gte: monthStart } } },
                { $group: { _id: null, total: { $sum: '$totalRevenue' } } },
            ]).toArray(),
            seasonsCol.aggregate([
                { $match: { updatedAt: { $gte: lastMonthStart, $lt: monthStart } } },
                { $group: { _id: null, total: { $sum: '$totalRevenue' } } },
            ]).toArray(),
            expensesCol.aggregate([
                { $match: { date: { $gte: monthStart } } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]).toArray(),
        ]);
        const revenue = revenueAgg[0]?.total ?? 0;
        const expenses = expenseAgg[0]?.total ?? 0;
        const prevRev = prevRevenueAgg[0]?.total ?? 0;
        const trend = prevRev > 0
            ? parseFloat((((revenue - prevRev) / prevRev) * 100).toFixed(1)) : 0;
        return {
            module: 'agriculture',
            revenue,
            expenses,
            profit: revenue - expenses,
            trend,
        };
    }
    catch {
        return null;
    }
}
// ─── Service ──────────────────────────────────────────────────────────────────
class DashboardService {
    async getStats() {
        const monthStart = thisMonthStart();
        const { start: todayStart, end: todayEnd } = todayRange();
        const [revenueAgg, feedAgg, healthAgg, batchCostAgg, milkAgg, allAnimals, agri] = await Promise.all([
            // Shop revenue
            Sale_1.default.aggregate([
                { $match: { dateTime: { $gte: monthStart } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ]),
            // Dairy feed expenses
            FeedRecord_1.default.aggregate([
                { $match: { date: { $gte: monthStart } } },
                { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$costPerKg'] } } } },
            ]),
            // Dairy health expenses
            HealthRecord_1.default.aggregate([
                { $match: { date: { $gte: monthStart } } },
                { $group: { _id: null, total: { $sum: '$cost' } } },
            ]),
            // Shop batch production costs
            Batch_1.default.aggregate([
                { $match: { productionDate: { $gte: monthStart } } },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: { $add: ['$costs.labor', '$costs.fuel', '$costs.ingredients', '$costs.packaging', '$costs.utilities'] },
                        },
                    },
                },
            ]),
            // Today's milk
            MilkRecord_1.default.aggregate([
                { $match: { date: { $gte: todayStart, $lte: todayEnd } } },
                { $group: { _id: null, liters: { $sum: '$total' } } },
            ]),
            // Herd
            Animal_1.default.find({ status: { $nin: ['Sold', 'Dead'] } }, { breed: 1 }).lean(),
            // Agriculture stats from seasons collection
            getAgriStats(),
        ]);
        const shopRevenue = revenueAgg[0]?.total ?? 0;
        const dairyExpenses = (feedAgg[0]?.total ?? 0) + (healthAgg[0]?.total ?? 0);
        const shopExpenses = batchCostAgg[0]?.total ?? 0;
        // ✅ Total expenses = dairy + shop + agriculture (from season.totalExpense)
        const totalExpenses = dairyExpenses + shopExpenses + agri.totalExpenses;
        // ✅ Total revenue = shop sales + agriculture yield revenue
        const totalRevenue = shopRevenue + agri.totalRevenue;
        const netProfit = totalRevenue - totalExpenses;
        const profitMargin = totalRevenue > 0
            ? parseFloat(((netProfit / totalRevenue) * 100).toFixed(1)) : 0;
        const todayMilkLiters = parseFloat((milkAgg[0]?.liters ?? 0).toFixed(1));
        const herdSize = allAnimals.length;
        const buffaloCount = allAnimals.filter((a) => isBuffalo(a.breed)).length;
        const cowCount = herdSize - buffaloCount;
        return {
            totalRevenue,
            totalExpenses,
            netProfit,
            profitMargin,
            todayMilkLiters,
            activeCrops: agri.activeCrops,
            activeAnimals: herdSize,
            activeSeasons: agri.activeSeasons, // ✅ now counts ACTIVE + PLANNED
            herdSize,
            cowCount,
            buffaloCount,
            pendingWages: 0,
            surplusThisMonth: netProfit,
            allSeasons: agri.allSeasons, // ✅ now counts all seasons
        };
    }
    async getKPIs() {
        const monthStart = thisMonthStart();
        const lastMonthStart = new Date(monthStart);
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
        const [dairySalesAgg, prevDairySalesAgg, dairyFeedAgg, dairyHealthAgg, batchAgg, prevBatchAgg, agriKPI,] = await Promise.all([
            Sale_1.default.aggregate([
                { $match: { dateTime: { $gte: monthStart } } },
                { $group: { _id: null, revenue: { $sum: '$totalAmount' } } },
            ]),
            Sale_1.default.aggregate([
                { $match: { dateTime: { $gte: lastMonthStart, $lt: monthStart } } },
                { $group: { _id: null, revenue: { $sum: '$totalAmount' } } },
            ]),
            FeedRecord_1.default.aggregate([
                { $match: { date: { $gte: monthStart } } },
                { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$costPerKg'] } } } },
            ]),
            HealthRecord_1.default.aggregate([
                { $match: { date: { $gte: monthStart } } },
                { $group: { _id: null, total: { $sum: '$cost' } } },
            ]),
            Batch_1.default.aggregate([
                { $match: { productionDate: { $gte: monthStart } } },
                {
                    $group: {
                        _id: null,
                        totalCost: { $sum: { $add: ['$costs.labor', '$costs.fuel', '$costs.ingredients', '$costs.packaging', '$costs.utilities'] } },
                        totalRevenue: { $sum: { $multiply: ['$output.quantityProduced', '$pricing.sellingPricePerUnit'] } },
                    },
                },
            ]),
            Batch_1.default.aggregate([
                { $match: { productionDate: { $gte: lastMonthStart, $lt: monthStart } } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: { $multiply: ['$output.quantityProduced', '$pricing.sellingPricePerUnit'] } },
                    },
                },
            ]),
            getAgriKPI(monthStart, lastMonthStart),
        ]);
        const dairyRevenue = dairySalesAgg[0]?.revenue ?? 0;
        const prevDairyRev = prevDairySalesAgg[0]?.revenue ?? 0;
        const dairyExpenses = (dairyFeedAgg[0]?.total ?? 0) + (dairyHealthAgg[0]?.total ?? 0);
        const dairyTrend = prevDairyRev > 0
            ? parseFloat((((dairyRevenue - prevDairyRev) / prevDairyRev) * 100).toFixed(1)) : 0;
        const shopRevenue = batchAgg[0]?.totalRevenue ?? 0;
        const shopExpenses = batchAgg[0]?.totalCost ?? 0;
        const prevShopRev = prevBatchAgg[0]?.totalRevenue ?? 0;
        const shopTrend = prevShopRev > 0
            ? parseFloat((((shopRevenue - prevShopRev) / prevShopRev) * 100).toFixed(1)) : 0;
        const kpis = [
            {
                module: 'dairy',
                revenue: dairyRevenue,
                expenses: dairyExpenses,
                profit: dairyRevenue - dairyExpenses,
                trend: dairyTrend,
            },
            {
                module: 'shop',
                revenue: shopRevenue,
                expenses: shopExpenses,
                profit: shopRevenue - shopExpenses,
                trend: shopTrend,
            },
        ];
        if (agriKPI)
            kpis.push(agriKPI);
        return kpis;
    }
    async getAlerts() {
        const alerts = [];
        const now = new Date();
        const soonExpiry = new Date();
        soonExpiry.setDate(now.getDate() + 3);
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(now.getDate() - 2);
        const { start: todayStart } = todayRange();
        const [expiringBatches, expiredBatches, todayMilkCount, fedAnimalIds, activeAnimals] = await Promise.all([
            Batch_1.default.find({
                expiryDate: { $gte: now, $lte: soonExpiry },
                status: { $ne: 'Depleted' },
            }).lean(),
            Batch_1.default.find({
                expiryDate: { $lt: now },
                stockRemaining: { $gt: 0 },
            }).lean(),
            MilkRecord_1.default.countDocuments({ date: { $gte: todayStart } }),
            FeedRecord_1.default.distinct('animalId', { date: { $gte: twoDaysAgo } }),
            Animal_1.default.find({ status: { $nin: ['Sold', 'Dead'] } }, { _id: 1 }).lean(),
        ]);
        if (expiringBatches.length > 0)
            alerts.push({
                id: 'batch-expiry', type: 'warning', module: 'shop',
                message: `${expiringBatches.length} batch(es) expiring within 3 days`,
                createdAt: now.toISOString(),
            });
        if (expiredBatches.length > 0)
            alerts.push({
                id: 'batch-expired', type: 'danger', module: 'shop',
                message: `${expiredBatches.length} expired batch(es) still have remaining stock`,
                createdAt: now.toISOString(),
            });
        if (todayMilkCount === 0)
            alerts.push({
                id: 'no-milk-today', type: 'info', module: 'dairy',
                message: 'No milk records entered for today yet',
                createdAt: now.toISOString(),
            });
        // Agriculture: seasons with budget nearly exceeded
        try {
            const db = mongoose_1.default.connection.db;
            if (db) {
                const overBudgetSeasons = await db.collection('seasons').find({
                    status: { $in: ['ACTIVE', 'PLANNED'] },
                    $expr: { $gte: ['$totalExpense', '$budget'] },
                }).toArray();
                if (overBudgetSeasons.length > 0)
                    alerts.push({
                        id: 'agri-over-budget', type: 'warning', module: 'agriculture',
                        message: `${overBudgetSeasons.length} season(s) have exceeded their budget`,
                        createdAt: now.toISOString(),
                    });
            }
        }
        catch { /* skip if collection unavailable */ }
        const fedSet = new Set(fedAnimalIds.map((id) => id.toString()));
        const unfedCount = activeAnimals.filter((a) => !fedSet.has(a._id.toString())).length;
        if (unfedCount > 0)
            alerts.push({
                id: 'unfed-animals', type: 'warning', module: 'dairy',
                message: `${unfedCount} animal(s) have no feed records in the last 2 days`,
                createdAt: now.toISOString(),
            });
        return alerts;
    }
    async getProfitChart(period) {
        const { start, end } = getPeriodRange(period);
        const fmt = period === 'year' ? '%Y-%m' : '%Y-%m-%d';
        const map = {};
        // Shop sales
        const salesByDate = await Sale_1.default.aggregate([
            { $match: { dateTime: { $gte: start, $lte: end } } },
            { $group: { _id: { $dateToString: { format: fmt, date: '$dateTime' } }, revenue: { $sum: '$totalAmount' } } },
            { $sort: { _id: 1 } },
        ]);
        // Dairy feed expenses
        const feedByDate = await FeedRecord_1.default.aggregate([
            { $match: { date: { $gte: start, $lte: end } } },
            { $group: { _id: { $dateToString: { format: fmt, date: '$date' } }, expenses: { $sum: { $multiply: ['$quantity', '$costPerKg'] } } } },
        ]);
        // Dairy health expenses
        const healthByDate = await HealthRecord_1.default.aggregate([
            { $match: { date: { $gte: start, $lte: end } } },
            { $group: { _id: { $dateToString: { format: fmt, date: '$date' } }, expenses: { $sum: '$cost' } } },
        ]);
        for (const s of salesByDate) {
            if (!map[s._id])
                map[s._id] = { revenue: 0, expenses: 0 };
            map[s._id].revenue += s.revenue;
        }
        for (const f of feedByDate) {
            if (!map[f._id])
                map[f._id] = { revenue: 0, expenses: 0 };
            map[f._id].expenses += f.expenses;
        }
        for (const h of healthByDate) {
            if (!map[h._id])
                map[h._id] = { revenue: 0, expenses: 0 };
            map[h._id].expenses += h.expenses;
        }
        // Agriculture expenses from seasonexpenses collection
        try {
            const db = mongoose_1.default.connection.db;
            if (db) {
                const agriExpenses = await db.collection('seasonexpenses').aggregate([
                    { $match: { date: { $gte: start, $lte: end } } },
                    { $group: { _id: { $dateToString: { format: fmt, date: '$date' } }, expenses: { $sum: '$amount' } } },
                ]).toArray();
                for (const a of agriExpenses) {
                    if (!map[a._id])
                        map[a._id] = { revenue: 0, expenses: 0 };
                    map[a._id].expenses += a.expenses;
                }
                // Agriculture yield revenue from yieldrecords
                const agriRevenue = await db.collection('yieldrecords').aggregate([
                    { $match: { date: { $gte: start, $lte: end } } },
                    { $group: { _id: { $dateToString: { format: fmt, date: '$date' } }, revenue: { $sum: '$revenue' } } },
                ]).toArray();
                for (const a of agriRevenue) {
                    if (!map[a._id])
                        map[a._id] = { revenue: 0, expenses: 0 };
                    map[a._id].revenue += a.revenue;
                }
            }
        }
        catch { /* skip */ }
        return Object.entries(map)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, { revenue, expenses }]) => ({
            date,
            revenue: parseFloat(revenue.toFixed(2)),
            expenses: parseFloat(expenses.toFixed(2)),
            profit: parseFloat((revenue - expenses).toFixed(2)),
        }));
    }
    async getRecentActivity() {
        const activity = [];
        const [recentSales, recentMilk, recentHealth] = await Promise.all([
            Sale_1.default.find().sort({ dateTime: -1 }).limit(5).lean(),
            MilkRecord_1.default.find().sort({ date: -1 }).limit(5)
                .populate('animalId', 'tagNumber').lean(),
            HealthRecord_1.default.find().sort({ date: -1 }).limit(5)
                .populate('animalId', 'tagNumber').lean(),
        ]);
        for (const sale of recentSales) {
            activity.push({
                id: sale._id.toString(),
                description: `Sale recorded — ${sale.paymentMode}`,
                module: 'shop',
                amount: sale.totalAmount,
                createdAt: sale.dateTime?.toISOString() ?? new Date().toISOString(),
            });
        }
        for (const milk of recentMilk) {
            const tag = milk.animalId?.tagNumber ?? 'Animal';
            activity.push({
                id: milk._id.toString(),
                description: `Milk recorded for ${tag} — ${milk.total}L (M:${milk.morning}L / E:${milk.evening}L)`,
                module: 'dairy',
                createdAt: milk.date?.toISOString() ?? new Date().toISOString(),
            });
        }
        for (const h of recentHealth) {
            const tag = h.animalId?.tagNumber ?? 'Animal';
            activity.push({
                id: h._id.toString(),
                description: `Health: ${tag} — ${h.condition ?? 'Treatment logged'}`,
                module: 'dairy',
                amount: h.cost ? -h.cost : undefined,
                createdAt: h.date?.toISOString() ?? new Date().toISOString(),
            });
        }
        // Recent agriculture expenses
        try {
            const db = mongoose_1.default.connection.db;
            if (db) {
                const recentAgriExp = await db.collection('seasonexpenses')
                    .find({})
                    .sort({ createdAt: -1 })
                    .limit(3)
                    .toArray();
                for (const e of recentAgriExp) {
                    activity.push({
                        id: e._id.toString(),
                        description: `Agriculture expense — ${e.category ?? 'General'}: ${e.description ?? ''}`,
                        module: 'agriculture',
                        amount: e.amount ? -e.amount : undefined,
                        createdAt: e.createdAt?.toISOString() ?? new Date().toISOString(),
                    });
                }
            }
        }
        catch { /* skip */ }
        return activity
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 15);
    }
}
exports.default = new DashboardService();
