import Animal from '../models/Animal';
import MilkRecord from '../models/MilkRecord';
import HealthRecord from '../models/HealthRecord';
import FeedRecord from '../models/FeedRecord';
import FodderStock from '../models/FodderStock';
import ReproductionRecord from '../models/ReproductionRecord';
import { createError } from '../middleware/errorHandler';
import { env } from '../config/env';

// ── Herd ──────────────────────────────────────────────────────────────────────

export const getHerdSummary = async () => {
  const [total, byStatus, byType] = await Promise.all([
    Animal.countDocuments(),
    Animal.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Animal.aggregate([{ $group: { _id: '$type',   count: { $sum: 1 } } }]),
  ]);
  return { total, byStatus, byType };
};

// ── Animals ───────────────────────────────────────────────────────────────────

export const getAnimals = async (query: Record<string, string> = {}) => {
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.type)   filter.type   = query.type;
  if (query.gender) filter.gender = query.gender;
  return Animal.find(filter).sort({ createdAt: -1 });
};

export const getAnimalById = async (id: string) => {
  return Animal.findById(id);
};

export const createAnimal = async (data: unknown) => {
  return Animal.create(data);
};

export const updateAnimal = async (id: string, data: unknown) => {
  return Animal.findByIdAndUpdate(id, data as object, { new: true, runValidators: true });
};

export const deleteAnimal = async (id: string) => {
  return Animal.findByIdAndDelete(id);
};

// ── Milk ──────────────────────────────────────────────────────────────────────

export const getMilkRecords = async (
  animalId: string,
  query: Record<string, string> = {},
) => {
  const filter: Record<string, unknown> = { animalId };
  if (query.from || query.to) {
    filter.date = {
      ...(query.from ? { $gte: new Date(query.from) } : {}),
      ...(query.to   ? { $lte: new Date(query.to)   } : {}),
    };
  }
  return MilkRecord.find(filter).sort({ date: -1 });
};

export const getMilkSummary = async (
  animalId: string,
  query: Record<string, string> = {},
) => {
  const from = query.from ? new Date(query.from) : new Date(Date.now() - 30 * 86_400_000);
  const to   = query.to   ? new Date(query.to)   : new Date();

  const records = await MilkRecord.find({
    animalId,
    date: { $gte: from, $lte: to },
  });

  const totalLitres  = records.reduce((s, r) => s + (r.quantity ?? r.total ?? 0), 0);
  const totalRevenue = totalLitres * env.MILK_PRICE_PER_LITRE;
  return { totalLitres, totalRevenue, recordCount: records.length, from, to };
};

export const createMilkRecord = async (animalId: string, data: unknown) => {
  return MilkRecord.create({ ...(data as object), animalId });
};

export const deleteMilkRecord = async (animalId: string, recordId: string) => {
  return MilkRecord.findOneAndDelete({ _id: recordId, animalId });
};

// ── Lactations ────────────────────────────────────────────────────────────────

export const getLactations = async (animalId: string) => {
  const animal = await Animal.findById(animalId).select('lactations');
  if (!animal) throw createError('Animal not found', 404, 'NOT_FOUND');
  return animal.lactations ?? [];
};

export const createLactation = async (animalId: string, data: unknown) => {
  const animal = await Animal.findByIdAndUpdate(
    animalId,
    { $push: { lactations: data } },
    { new: true, runValidators: true },
  );
  if (!animal) throw createError('Animal not found', 404, 'NOT_FOUND');
  return animal.lactations?.at(-1);
};

export const updateLactation = async (
  animalId: string,
  lacId: string,
  data: unknown,
) => {
  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data as object)) {
    update[`lactations.$.${k}`] = v;
  }
  const animal = await Animal.findOneAndUpdate(
    { _id: animalId, 'lactations._id': lacId },
    { $set: update },
    { new: true },
  );
  if (!animal) throw createError('Lactation record not found', 404, 'NOT_FOUND');
  return animal.lactations?.find((l) => String(l._id) === lacId);
};

// ── Reproduction ──────────────────────────────────────────────────────────────

export const getReproduction = async (animalId: string) => {
  return ReproductionRecord.find({ animalId }).sort({ date: -1 });
};

export const createAIRecord = async (animalId: string, data: unknown) => {
  return ReproductionRecord.create({ ...(data as object), animalId, type: 'AI' });
};

export const updateAIRecord = async (
  animalId: string,
  aiId: string,
  data: unknown,
) => {
  const record = await ReproductionRecord.findOneAndUpdate(
    { _id: aiId, animalId, type: 'AI' },
    data as object,
    { new: true, runValidators: true },
  );
  if (!record) throw createError('AI record not found', 404, 'NOT_FOUND');
  return record;
};

export const createCalving = async (animalId: string, data: unknown) => {
  return ReproductionRecord.create({ ...(data as object), animalId, type: 'Calving' });
};

// ── Health ────────────────────────────────────────────────────────────────────

export const getHealth = async (animalId: string) => {
  return HealthRecord.find({ animalId }).sort({ date: -1 });
};

export const createVaccination = async (animalId: string, data: unknown) => {
  return HealthRecord.create({
    ...(data as object),
    animalId,
    recordType: 'VACCINATION',
  });
};

export const updateVaccination = async (
  animalId: string,
  vId: string,
  data: unknown,
) => {
  const record = await HealthRecord.findOneAndUpdate(
    { _id: vId, animalId, recordType: 'VACCINATION' },
    data as object,
    { new: true, runValidators: true },
  );
  if (!record) throw createError('Vaccination record not found', 404, 'NOT_FOUND');
  return record;
};

export const createTreatment = async (animalId: string, data: unknown) => {
  return HealthRecord.create({
    ...(data as object),
    animalId,
    recordType: 'TREATMENT',
  });
};

export const updateTreatment = async (
  animalId: string,
  tId: string,
  data: unknown,
) => {
  const record = await HealthRecord.findOneAndUpdate(
    { _id: tId, animalId, recordType: 'TREATMENT' },
    data as object,
    { new: true, runValidators: true },
  );
  if (!record) throw createError('Treatment record not found', 404, 'NOT_FOUND');
  return record;
};

// ── Feeding ───────────────────────────────────────────────────────────────────

export const getFeeding = async (animalId: string) => {
  const [records, animal] = await Promise.all([
    FeedRecord.find({ animalId }).sort({ date: -1 }).limit(90),
    Animal.findById(animalId).select('feedingPlan'),
  ]);
  return { records, plan: animal?.feedingPlan ?? [] };
};

export const createFeedRecord = async (animalId: string, data: unknown) => {
  return FeedRecord.create({ ...(data as object), animalId });
};

export const upsertFeedingPlan = async (animalId: string, data: unknown) => {
  const animal = await Animal.findByIdAndUpdate(
    animalId,
    { $set: { feedingPlan: data } },
    { new: true, runValidators: true },
  );
  if (!animal) throw createError('Animal not found', 404, 'NOT_FOUND');
  return animal.feedingPlan;
};

// ── Profitability ─────────────────────────────────────────────────────────────

export const getProfitability = async (
  animalId: string,
  query: Record<string, string> = {},
) => {
  const from = query.from ? new Date(query.from) : new Date(Date.now() - 365 * 86_400_000);
  const to   = query.to   ? new Date(query.to)   : new Date();

  const [milkRecords, feedRecords, healthRecords, animal] = await Promise.all([
    MilkRecord.find({ animalId, date: { $gte: from, $lte: to } }),
    FeedRecord.find({ animalId, date: { $gte: from, $lte: to } }),
    HealthRecord.find({ animalId, date: { $gte: from, $lte: to } }),
    Animal.findById(animalId).select('purchaseCost name tagNo type breed'),
  ]);

  const totalMilk     = milkRecords.reduce((s, r) => s + (r.quantity ?? r.total ?? 0), 0);
  const milkRevenue   = totalMilk * env.MILK_PRICE_PER_LITRE;
  const feedCost      = feedRecords.reduce((s, r) => s + (r.quantity * (r.costPerKg ?? 0)), 0);
  const healthCost    = healthRecords.reduce((s, r) => s + (r.cost ?? 0), 0);
  const totalCost     = feedCost + healthCost;
  const netProfit     = milkRevenue - totalCost;

  return {
    animal,
    period: { from, to },
    revenue:  { milk: milkRevenue, total: milkRevenue },
    costs:    { feed: feedCost, health: healthCost, total: totalCost },
    milk:     { litres: totalMilk, records: milkRecords.length },
    netProfit,
    roi: totalCost > 0 ? ((netProfit / totalCost) * 100).toFixed(2) + '%' : 'N/A',
  };
};

// ── Fodder ────────────────────────────────────────────────────────────────────

export const getFodderCrops = async () => {
  return FodderStock.find({ isCrop: true }).sort({ plantingDate: -1 });
};

export const createFodderCrop = async (data: unknown) => {
  return FodderStock.create({ ...(data as object), isCrop: true });
};

export const updateFodderCrop = async (id: string, data: unknown) => {
  return FodderStock.findByIdAndUpdate(id, data as object, {
    new: true,
    runValidators: true,
  });
};

export const getFodderStock = async () => {
  return FodderStock.find({ isCrop: false }).sort({ createdAt: -1 });
};

export const createFodderStock = async (data: unknown) => {
  return FodderStock.create({ ...(data as object), isCrop: false });
};

export const updateFodderStock = async (id: string, data: unknown) => {
  return FodderStock.findByIdAndUpdate(id, data as object, {
    new: true,
    runValidators: true,
  });
};