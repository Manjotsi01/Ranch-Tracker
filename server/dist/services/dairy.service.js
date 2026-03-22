"use strict";
// server/src/services/dairy.service.ts
// FIX 1: getMilkSummary — records store session+quantity (from frontend) but the
//         old grouping code read r.morning/r.evening which are only set for legacy records.
//         Now reads BOTH patterns so old and new records all appear in the chart.
// FIX 2: getMilkRecords — return records with a normalised shape so the frontend
//         hook (which reads r.quantity) always gets a value.
// FIX 3: createAnimal — normalise gender to uppercase so Animal schema enum passes.
// FIX 4: Remove require('mongoose') inside function bodies — use top-level import.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFodderStock = exports.createFodderStock = exports.getFodderStock = exports.updateFodderCrop = exports.createFodderCrop = exports.getFodderCrops = exports.getProfitability = exports.upsertFeedingPlan = exports.createFeedRecord = exports.getFeeding = exports.updateTreatment = exports.createTreatment = exports.updateVaccination = exports.createVaccination = exports.getHealth = exports.createCalving = exports.updateAIRecord = exports.createAIRecord = exports.getReproduction = exports.updateLactation = exports.createLactation = exports.getLactations = exports.deleteMilkRecord = exports.createMilkRecord = exports.getMilkSummary = exports.getMilkRecords = exports.deleteAnimal = exports.updateAnimal = exports.createAnimal = exports.getAnimalById = exports.getAnimals = exports.getHerdSummary = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Animal_1 = __importDefault(require("../models/Animal"));
const MilkRecord_1 = __importDefault(require("../models/MilkRecord"));
const HealthRecord_1 = __importDefault(require("../models/HealthRecord"));
const FeedRecord_1 = __importDefault(require("../models/FeedRecord"));
const FodderStock_1 = __importDefault(require("../models/FodderStock"));
const ReproductionRecord_1 = __importDefault(require("../models/ReproductionRecord"));
// ── Herd Summary ──────────────────────────────────────────────────────────────
const getHerdSummary = async () => {
    const animals = await Animal_1.default.find();
    const byType = {};
    const byStatus = {};
    animals.forEach((a) => {
        const t = a.type || 'COW';
        const s = a.status || 'CALF';
        byType[t] = (byType[t] || 0) + 1;
        byStatus[s] = (byStatus[s] || 0) + 1;
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRecords = await MilkRecord_1.default.find({ date: { $gte: today } });
    const todayMilk = todayRecords.reduce((s, r) => {
        // Support both storage patterns
        const qty = r.quantity ?? ((r.morning || 0) + (r.evening || 0));
        return s + qty;
    }, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthRecords = await MilkRecord_1.default.find({ date: { $gte: monthStart } });
    const monthlyMilk = monthRecords.reduce((s, r) => {
        const qty = r.quantity ?? ((r.morning || 0) + (r.evening || 0));
        return s + qty;
    }, 0);
    const milkingCount = byStatus['MILKING'] || 0;
    const avgMilkPerAnimal = milkingCount > 0 ? todayMilk / milkingCount : 0;
    return { totalAnimals: animals.length, byType, byStatus, todayMilk, monthlyMilk, milkingCount, avgMilkPerAnimal };
};
exports.getHerdSummary = getHerdSummary;
// ── Animals ───────────────────────────────────────────────────────────────────
// Maps legacy title-case/old status values to current uppercase enum
const LEGACY_STATUS = {
    'Milking': 'LACTATING',
    'milking': 'LACTATING',
    'MILKING': 'LACTATING', // old value → new preferred value
    'Dry': 'DRY',
    'Calf': 'CALF',
    'Heifer': 'HEIFER',
    'Sold': 'SOLD',
    'Dead': 'DEAD',
};
const normaliseAnimal = (a) => {
    if (!a)
        return a;
    const obj = a.toObject ? a.toObject() : { ...a };
    // FIX: type is never undefined
    if (!obj.type)
        obj.type = 'COW';
    else
        obj.type = String(obj.type).toUpperCase();
    // FIX: tagNo always populated
    if (!obj.tagNo)
        obj.tagNo = obj.tagNumber || obj.animalId || '';
    // FIX: normalise status — map legacy values, uppercase everything
    if (obj.status) {
        obj.status = LEGACY_STATUS[obj.status] ?? String(obj.status).toUpperCase();
    }
    else {
        obj.status = 'CALF';
    }
    // FIX: normalise gender
    if (obj.gender === 'Female')
        obj.gender = 'FEMALE';
    if (obj.gender === 'Male')
        obj.gender = 'MALE';
    if (!obj.gender)
        obj.gender = 'FEMALE';
    // FIX: ensure bloodline is always an object
    if (!obj.bloodline)
        obj.bloodline = {};
    return obj;
};
const getAnimals = async (params) => {
    const filter = {};
    if (params.type)
        filter.type = params.type;
    if (params.status)
        filter.status = params.status;
    const docs = await Animal_1.default.find(filter).sort({ createdAt: -1 });
    return docs.map(normaliseAnimal);
};
exports.getAnimals = getAnimals;
const getAnimalById = async (id) => {
    const doc = await Animal_1.default.findById(id);
    return normaliseAnimal(doc);
};
exports.getAnimalById = getAnimalById;
const createAnimal = async (body) => {
    // FIX: normalise gender to UPPERCASE so the schema enum always passes
    let gender = String(body.gender || 'FEMALE');
    if (gender === 'Female')
        gender = 'FEMALE';
    if (gender === 'Male')
        gender = 'MALE';
    // Normalise status to UPPERCASE
    let status = String(body.status || 'CALF').toUpperCase();
    const doc = {
        ...body,
        gender,
        status,
        tagNo: body.tagNo || body.tagNumber,
        tagNumber: body.tagNumber || body.tagNo,
        type: body.type || 'COW',
        // Map both cost field names
        purchaseCost: body.purchaseCost ?? body.purchasePrice,
        purchasePrice: body.purchasePrice ?? body.purchaseCost,
        currentWeight: body.currentWeight ?? body.weight,
        weight: body.weight ?? body.currentWeight,
    };
    return Animal_1.default.create(doc);
};
exports.createAnimal = createAnimal;
const updateAnimal = async (id, body) => {
    return Animal_1.default.findByIdAndUpdate(id, body, { new: true, runValidators: true });
};
exports.updateAnimal = updateAnimal;
const deleteAnimal = async (id) => Animal_1.default.findByIdAndDelete(id);
exports.deleteAnimal = deleteAnimal;
// ── Milk ──────────────────────────────────────────────────────────────────────
const getMilkRecords = async (animalId, params) => {
    const filter = { animalId };
    if (params.from)
        filter.date = { $gte: new Date(params.from) };
    if (params.to)
        filter.date = { ...filter.date, $lte: new Date(params.to) };
    const records = await MilkRecord_1.default.find(filter).sort({ date: -1 });
    // FIX: normalise each record so frontend hook always gets r.quantity
    return records.map((r) => ({
        _id: r._id,
        date: r.date,
        session: r.session || (r.morning > 0 ? 'MORNING' : 'EVENING'),
        quantity: r.quantity ?? ((r.morning || 0) + (r.evening || 0)),
        fat: r.fat,
        snf: r.snf,
        notes: r.notes,
    }));
};
exports.getMilkRecords = getMilkRecords;
const getMilkSummary = async (animalId, _params) => {
    const records = await MilkRecord_1.default.find({ animalId }).sort({ date: 1 });
    // FIX: group by date and support BOTH storage shapes:
    //   - New records: { session: 'MORNING'|'EVENING', quantity: N }
    //   - Legacy records: { morning: N, evening: N }
    const map = new Map();
    records.forEach((r) => {
        const key = new Date(r.date).toISOString().split('T')[0];
        const existing = map.get(key) || { date: key, morning: 0, evening: 0, total: 0 };
        if (r.session === 'MORNING') {
            existing.morning += r.quantity || 0;
        }
        else if (r.session === 'EVENING') {
            existing.evening += r.quantity || 0;
        }
        else {
            // Legacy shape
            existing.morning += r.morning || 0;
            existing.evening += r.evening || 0;
        }
        existing.total = existing.morning + existing.evening;
        map.set(key, existing);
    });
    return Array.from(map.values());
};
exports.getMilkSummary = getMilkSummary;
const createMilkRecord = async (animalId, body) => {
    // Store both the new frontend shape AND the legacy morning/evening fields
    const morning = body.session === 'MORNING' ? Number(body.quantity) : 0;
    const evening = body.session === 'EVENING' ? Number(body.quantity) : 0;
    return MilkRecord_1.default.create({
        animalId,
        date: body.date || new Date(),
        morning,
        evening,
        total: morning + evening,
        session: body.session,
        quantity: body.quantity,
        fat: body.fat,
        snf: body.snf,
        notes: body.notes,
    });
};
exports.createMilkRecord = createMilkRecord;
const deleteMilkRecord = async (_animalId, recordId) => {
    return MilkRecord_1.default.findByIdAndDelete(recordId);
};
exports.deleteMilkRecord = deleteMilkRecord;
// ── Lactations ────────────────────────────────────────────────────────────────
const getLactations = async (animalId) => {
    const animal = await Animal_1.default.findById(animalId).select('lactations');
    return animal?.lactations ?? [];
};
exports.getLactations = getLactations;
const createLactation = async (animalId, body) => {
    const animal = await Animal_1.default.findByIdAndUpdate(animalId, { $push: { lactations: { ...body, status: 'ACTIVE', _id: new mongoose_1.default.Types.ObjectId() } } }, { new: true });
    return animal?.lactations?.slice(-1)[0];
};
exports.createLactation = createLactation;
const updateLactation = async (animalId, lacId, body) => {
    const animal = await Animal_1.default.findOneAndUpdate({ _id: animalId, 'lactations._id': lacId }, { $set: { 'lactations.$': { ...body, _id: lacId } } }, { new: true });
    return animal?.lactations?.find((l) => String(l._id) === lacId);
};
exports.updateLactation = updateLactation;
// ── Reproduction ──────────────────────────────────────────────────────────────
const getReproduction = async (animalId) => {
    const records = await ReproductionRecord_1.default.find({ animalId }).sort({ date: -1 });
    const aiRecords = records.filter((r) => r.type === 'AI');
    const calvingRecords = records.filter((r) => r.type === 'Calving');
    const lastCalving = calvingRecords[0];
    return {
        currentPregnancyStatus: 'OPEN',
        totalCalvings: calvingRecords.length,
        totalAIAttempts: aiRecords.length,
        lastCalvingDate: lastCalving ? lastCalving.date : null,
        expectedDueDate: null,
        aiRecords: aiRecords.map(normaliseReproRecord),
        calvingRecords: calvingRecords.map(normaliseReproRecord),
    };
};
exports.getReproduction = getReproduction;
const normaliseReproRecord = (r) => ({
    _id: r._id,
    date: r.date,
    semenBullName: r.semenBullName || r.notes,
    semenCode: r.semenCode,
    technicianName: r.technicianName,
    status: r.status || 'DONE',
    pregnancyCheckDate: r.pregnancyCheckDate,
    calfGender: r.calfGender,
    calfTagNo: r.calfTagNo,
    calfWeight: r.calfWeight,
    complications: r.complications,
    notes: r.notes,
});
const createAIRecord = async (animalId, body) => {
    return ReproductionRecord_1.default.create({ animalId, type: 'AI', ...body });
};
exports.createAIRecord = createAIRecord;
const updateAIRecord = async (_animalId, aiId, body) => {
    return ReproductionRecord_1.default.findByIdAndUpdate(aiId, body, { new: true });
};
exports.updateAIRecord = updateAIRecord;
const createCalving = async (animalId, body) => {
    return ReproductionRecord_1.default.create({ animalId, type: 'Calving', ...body });
};
exports.createCalving = createCalving;
// ── Health ────────────────────────────────────────────────────────────────────
const getHealth = async (animalId) => {
    const records = await HealthRecord_1.default.find({ animalId }).sort({ date: -1 });
    const vaccinations = records
        .filter((r) => r.recordType === 'VACCINATION')
        .map((r) => ({
        _id: r._id,
        vaccineName: r.condition,
        date: r.date,
        nextDueDate: r.nextDueDate,
        dosage: r.dosage,
        veterinarianName: r.veterinarianName,
        cost: r.cost,
        status: r.vaccineStatus || 'GIVEN',
        notes: r.notes,
    }));
    const treatments = records
        .filter((r) => r.recordType !== 'VACCINATION')
        .map((r) => ({
        _id: r._id,
        date: r.date,
        diagnosis: r.condition,
        medicines: r.medicines || [],
        veterinarianName: r.veterinarianName,
        cost: r.cost,
        followUpDate: r.followUpDate,
        notes: r.notes,
    }));
    const totalVaccinationCost = vaccinations.reduce((s, v) => s + (v.cost || 0), 0);
    const totalTreatmentCost = treatments.reduce((s, t) => s + (t.cost || 0), 0);
    return { vaccinations, treatments, totalVaccinationCost, totalTreatmentCost };
};
exports.getHealth = getHealth;
const createVaccination = async (animalId, body) => {
    return HealthRecord_1.default.create({
        animalId,
        recordType: 'VACCINATION',
        condition: body.vaccineName,
        date: body.date,
        nextDueDate: body.nextDueDate,
        dosage: body.dosage,
        veterinarianName: body.veterinarianName,
        cost: body.cost,
        vaccineStatus: body.status,
        notes: body.notes,
    });
};
exports.createVaccination = createVaccination;
const updateVaccination = async (_animalId, vId, body) => {
    return HealthRecord_1.default.findByIdAndUpdate(vId, body, { new: true });
};
exports.updateVaccination = updateVaccination;
const createTreatment = async (animalId, body) => {
    return HealthRecord_1.default.create({
        animalId,
        recordType: 'TREATMENT',
        condition: body.diagnosis,
        date: body.date,
        medicines: body.medicines,
        veterinarianName: body.veterinarianName,
        cost: body.cost,
        followUpDate: body.followUpDate,
        notes: body.notes,
    });
};
exports.createTreatment = createTreatment;
const updateTreatment = async (_animalId, tId, body) => {
    return HealthRecord_1.default.findByIdAndUpdate(tId, body, { new: true });
};
exports.updateTreatment = updateTreatment;
// ── Feeding ───────────────────────────────────────────────────────────────────
const getFeeding = async (animalId) => {
    const records = await FeedRecord_1.default.find({ animalId }).sort({ date: -1 });
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const monthlyFeedCost = records
        .filter((r) => new Date(r.date) >= monthStart)
        .reduce((s, r) => s + (r.quantity * (r.costPerKg || 0)), 0);
    const yearlyFeedCost = records
        .filter((r) => new Date(r.date) >= yearStart)
        .reduce((s, r) => s + (r.quantity * (r.costPerKg || 0)), 0);
    const animal = await Animal_1.default.findById(animalId).select('feedingPlan');
    const currentPlan = animal?.feedingPlan ?? [];
    // ── Daily breakdown from feeding plan ──────────────────────────────────────
    // Group plan items by fodderType and sum dailyQuantity + cost
    const breakdownMap = new Map();
    for (const item of currentPlan) {
        const key = item.fodderType || 'GREEN';
        const existing = breakdownMap.get(key) || { totalQuantity: 0, unit: item.unit || 'kg', dailyCost: 0 };
        existing.totalQuantity += item.dailyQuantity || 0;
        existing.dailyCost += (item.dailyQuantity || 0) * (item.costPerUnit || 0);
        breakdownMap.set(key, existing);
    }
    const dailyBreakdown = Array.from(breakdownMap.entries()).map(([fodderType, v]) => ({
        fodderType,
        totalQuantity: Number(v.totalQuantity.toFixed(2)),
        unit: v.unit,
        dailyCost: Number(v.dailyCost.toFixed(2)),
    }));
    const dailyFeedCost = dailyBreakdown.reduce((s, d) => s + d.dailyCost, 0);
    return {
        monthlyFeedCost,
        yearlyFeedCost,
        dailyFeedCost: Number(dailyFeedCost.toFixed(2)),
        dailyBreakdown,
        currentPlan,
        records,
    };
};
exports.getFeeding = getFeeding;
const createFeedRecord = async (animalId, body) => {
    return FeedRecord_1.default.create({ animalId, ...body });
};
exports.createFeedRecord = createFeedRecord;
const upsertFeedingPlan = async (animalId, body) => {
    const animal = await Animal_1.default.findByIdAndUpdate(animalId, { $push: { feedingPlan: { ...body, _id: new mongoose_1.default.Types.ObjectId() } } }, { new: true });
    return animal?.feedingPlan;
};
exports.upsertFeedingPlan = upsertFeedingPlan;
// ── Profitability ─────────────────────────────────────────────────────────────
const getProfitability = async (animalId, params) => {
    const now = new Date();
    let start;
    let end = now;
    switch (params.period) {
        case 'last_month':
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            end = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
        case 'current_year':
            start = new Date(now.getFullYear(), 0, 1);
            break;
        default:
            start = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    const milkRecords = await MilkRecord_1.default.find({ animalId, date: { $gte: start, $lte: end } });
    const feedRecords = await FeedRecord_1.default.find({ animalId, date: { $gte: start, $lte: end } });
    const healthRecords = await HealthRecord_1.default.find({ animalId, date: { $gte: start, $lte: end } });
    const MILK_PRICE = 40;
    // FIX: totalLitres supports both storage shapes
    const totalLitres = milkRecords.reduce((s, r) => {
        return s + (r.quantity ?? ((r.morning || 0) + (r.evening || 0)));
    }, 0);
    const milkIncome = totalLitres * MILK_PRICE;
    const feedCost = feedRecords.reduce((s, r) => s + ((r.quantity || 0) * (r.costPerKg || 0)), 0);
    const medicalCost = healthRecords.reduce((s, r) => s + (r.cost || 0), 0);
    const netProfit = milkIncome - feedCost - medicalCost;
    const roi = (feedCost + medicalCost) > 0 ? (netProfit / (feedCost + medicalCost)) * 100 : 0;
    return { milkIncome, feedCost, medicalCost, otherCost: 0, netProfit, roi, totalLitres };
};
exports.getProfitability = getProfitability;
// ── Fodder Crops ──────────────────────────────────────────────────────────────
const getFodderCrops = async () => FodderStock_1.default.find({ isCrop: true });
exports.getFodderCrops = getFodderCrops;
const createFodderCrop = async (body) => FodderStock_1.default.create({ ...body, isCrop: true });
exports.createFodderCrop = createFodderCrop;
const updateFodderCrop = async (id, body) => FodderStock_1.default.findByIdAndUpdate(id, body, { new: true });
exports.updateFodderCrop = updateFodderCrop;
// ── Fodder Stock ──────────────────────────────────────────────────────────────
const getFodderStock = async () => FodderStock_1.default.find({ isCrop: { $ne: true } });
exports.getFodderStock = getFodderStock;
const createFodderStock = async (body) => FodderStock_1.default.create(body);
exports.createFodderStock = createFodderStock;
const updateFodderStock = async (id, body) => FodderStock_1.default.findByIdAndUpdate(id, body, { new: true });
exports.updateFodderStock = updateFodderStock;
