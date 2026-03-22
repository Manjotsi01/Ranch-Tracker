// Path: ranch-tracker/server/src/services/agriculture.service.ts

import Season from '../models/Season';
import SeasonExpense from '../models/SeasonExpense';
import YieldRecord from '../models/YieldRecord';
import Field from '../models/Field';

export const getAllCrops = async () => {
  const crops = await Season.aggregate([
    {
      $group: {
        _id: '$cropId',
        name:               { $first: '$cropName' },
        localName:          { $first: '$localName' },
        activeSeasonsCount: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } },
        totalArea:          { $sum: '$areaSown' },
        totalExpense:       { $sum: '$totalExpense' },
        totalRevenue:       { $sum: '$totalRevenue' },
        totalProfit:        { $sum: { $subtract: ['$totalRevenue', '$totalExpense'] } },
        latestSeason:       { $last: { label: '$label', status: '$status' } },
      },
    },
    {
      $project: {
        cropId:       '$_id',
        name:         1,
        localName:    1,
        latestSeason: 1,
        stats: {
          activeSeasonsCount: '$activeSeasonsCount',
          totalArea:          '$totalArea',
          totalExpense:       '$totalExpense',
          totalRevenue:       '$totalRevenue',
          totalProfit:        '$totalProfit',
        },
      },
    },
  ]);
  return crops;
};

export const getCropById = async (cropId: string) => {
  const [crop] = await Season.aggregate([
    { $match: { cropId } },
    {
      $group: {
        _id:          '$cropId',
        name:         { $first: '$cropName' },
        localName:    { $first: '$localName' },
        totalExpense: { $sum: '$totalExpense' },
        totalRevenue: { $sum: '$totalRevenue' },
      },
    },
    { $project: { cropId: '$_id', name: 1, localName: 1, totalExpense: 1, totalRevenue: 1 } },
  ]);
  return crop ?? null;
};

// ─── Seasons ──────────────────────────────────────────────────────────────────

export const createSeason = async (data: any) => {
  const season = await Season.create(data);
  return season;
};

export const getSeasons = async () => {
  return Season.find().sort({ createdAt: -1 });
};

export const getCropSeasons = async (cropId: string) => {
  return Season.find({ cropId }).sort({ startDate: -1 });
};

export const getSeasonById = async (id: string) => {
  return Season.findById(id);
};
export const updateSeason = async (id: string, data: any) => {
  return Season.findByIdAndUpdate(id, data, { new: true });
};

export const deleteSeason = async (id: string) => {
  await SeasonExpense.deleteMany({ seasonId: id });
  await YieldRecord.deleteMany({ seasonId: id });
  await Season.findByIdAndDelete(id);
};

// ─── Expenses ─────────────────────────────────────────────────────────────────

export const getExpenses = async (seasonId: string) => {
  return SeasonExpense.find({ seasonId }).sort({ date: -1 });
};

export const addExpenseToSeason = async (seasonId: string, data: any) => {
  const expense = await SeasonExpense.create({ ...data, seasonId });
  await Season.findByIdAndUpdate(seasonId, { $inc: { totalExpense: data.amount } });
  return expense;
};

export const deleteExpense = async (seasonId: string, expenseId: string) => {
  const expense = await SeasonExpense.findByIdAndDelete(expenseId);
  if (expense) {
    await Season.findByIdAndUpdate(seasonId, { $inc: { totalExpense: -expense.amount } });
  }
};

// ─── Resources ────────────────────────────────────────────────────────────────

export const getResources = async (seasonId: string) => {
  return [];
};

export const addResource = async (seasonId: string, data: any) => {
  return { ...data, seasonId, resourceId: `res_${Date.now()}` };
};

export const deleteResource = async (seasonId: string, resourceId: string) => {
   
};

// ─── Yields ───────────────────────────────────────────────────────────────────

export const getYields = async (seasonId: string) => {
  return YieldRecord.find({ seasonId }).sort({ date: -1 });
};

export const addYieldToSeason = async (seasonId: string, data: any) => {
  const revenueValue = data.revenue ?? data.revenueRealized ?? 0;
  const yieldRecord = await YieldRecord.create({ ...data, revenueRealized: revenueValue, seasonId });
  await Season.findByIdAndUpdate(seasonId, { $inc: { totalRevenue: revenueValue } });
  return yieldRecord;
};

export const deleteYield = async (seasonId: string, yieldId: string) => {
  const record = await YieldRecord.findByIdAndDelete(yieldId);
  if (record) {
    const amount = (record as any).revenueRealized ?? (record as any).revenue ?? 0;
    await Season.findByIdAndUpdate(seasonId, { $inc: { totalRevenue: -amount } });
  }
};