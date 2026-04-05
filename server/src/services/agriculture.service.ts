import Season from '../models/Season';
import SeasonExpense from '../models/SeasonExpense';
import YieldRecord from '../models/YieldRecord';
import { createError } from '../middleware/errorHandler';

// ─── Crops ────────────────────────────────────────────────────────────────────

export const getAllCrops = async () => {
  return Season.aggregate([
    {
      $group: {
        _id:                '$cropId',
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
    { $sort: { 'stats.totalRevenue': -1 } },
  ]);
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
        totalProfit:  { $sum: { $subtract: ['$totalRevenue', '$totalExpense'] } },
      },
    },
    {
      $project: {
        cropId: '$_id', name: 1, localName: 1,
        totalExpense: 1, totalRevenue: 1, totalProfit: 1,
      },
    },
  ]);
  if (!crop) throw createError(`Crop '${cropId}' not found`, 404, 'CROP_NOT_FOUND');
  return crop;
};

// ─── Seasons ──────────────────────────────────────────────────────────────────

export const createSeason = async (data: unknown) => Season.create(data);

export const getSeasons = async () => Season.find().sort({ createdAt: -1 });

export const getCropSeasons = async (cropId: string) =>
  Season.find({ cropId }).sort({ startDate: -1 });

export const getSeasonById = async (id: string) => {
  const season = await Season.findById(id);
  if (!season) throw createError('Season not found', 404, 'SEASON_NOT_FOUND');
  return season;
};

export const updateSeason = async (id: string, data: unknown) => {
const season = await Season.findByIdAndUpdate(id, data as object, { new: true, runValidators: true });
  if (!season) throw createError('Season not found', 404, 'SEASON_NOT_FOUND');
  return season;
};

export const deleteSeason = async (id: string) => {
  const season = await Season.findById(id);
  if (!season) throw createError('Season not found', 404, 'SEASON_NOT_FOUND');
  await Promise.all([
    SeasonExpense.deleteMany({ seasonId: id }),
    YieldRecord.deleteMany({ seasonId: id }),
    Season.findByIdAndDelete(id),
  ]);
};

// ─── Expenses ─────────────────────────────────────────────────────────────────

export const getExpenses = async (seasonId: string) =>
  SeasonExpense.find({ seasonId }).sort({ date: -1 });

export const addExpenseToSeason = async (seasonId: string, data: Record<string, unknown>) => {
  await getSeasonById(seasonId);
  const expense = await SeasonExpense.create({ ...data, seasonId });
  await Season.findByIdAndUpdate(seasonId, { $inc: { totalExpense: data.amount as number } });
  return expense;
};

export const deleteExpense = async (seasonId: string, expenseId: string) => {
  const expense = await SeasonExpense.findByIdAndDelete(expenseId);
  if (expense) {
    await Season.findByIdAndUpdate(seasonId, { $inc: { totalExpense: -expense.amount } });
  }
};

// ─── Resources — not yet implemented ─────────────────────────────────────────

export const getResources = async (_seasonId: string): Promise<never[]> => [];

export const addResource = async (_seasonId: string, _data: unknown): Promise<never> => {
  throw createError('Resource management is not yet implemented', 501, 'NOT_IMPLEMENTED');
};

export const deleteResource = async (_seasonId: string, _resourceId: string): Promise<never> => {
  throw createError('Resource management is not yet implemented', 501, 'NOT_IMPLEMENTED');
};

// ─── Yields ───────────────────────────────────────────────────────────────────

export const getYields = async (seasonId: string) =>
  YieldRecord.find({ seasonId }).sort({ date: -1 });

export const addYieldToSeason = async (seasonId: string, data: Record<string, unknown>) => {
  await getSeasonById(seasonId);
  const revenue = Number(data.revenueRealized ?? data.revenue ?? 0);
  const record  = await YieldRecord.create({ ...data, revenueRealized: revenue, seasonId });
  await Season.findByIdAndUpdate(seasonId, {
    $inc: { totalRevenue: revenue, totalYield: Number(data.quantity ?? 0) },
  });
  return record;
};

export const deleteYield = async (seasonId: string, yieldId: string) => {
  const record = await YieldRecord.findByIdAndDelete(yieldId);
  if (record) {
    await Season.findByIdAndUpdate(seasonId, {
      $inc: {
        totalRevenue: -record.revenueRealized,
        totalYield:   -(record.quantity ?? 0),
      },
    });
  }
};