// server/src/services/dairy.service.ts
import mongoose from 'mongoose'
import Animal from '../models/Animal'
import MilkRecord from '../models/MilkRecord'
import HealthRecord from '../models/HealthRecord'
import FeedRecord from '../models/FeedRecord'
import FodderStock from '../models/FodderStock'
import ReproductionRecord from '../models/ReproductionRecord'

type Params = Record<string, string>

// ── Herd Summary ──────────────────────────────────────────────────────────────
export const getHerdSummary = async () => {
  const animals = await Animal.find()

  const byType:   Record<string, number> = {}
  const byStatus: Record<string, number> = {}

  animals.forEach((a) => {
    const t = (a as any).type   || 'COW'
    const s = (a as any).status || 'CALF'
    byType[t]   = (byType[t]   || 0) + 1
    byStatus[s] = (byStatus[s] || 0) + 1
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayRecords = await MilkRecord.find({ date: { $gte: today } })
  const todayMilk = todayRecords.reduce((s, r: any) => {
    // Support both storage patterns
    const qty = r.quantity ?? ((r.morning || 0) + (r.evening || 0))
    return s + qty
  }, 0)

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthRecords = await MilkRecord.find({ date: { $gte: monthStart } })
  const monthlyMilk = monthRecords.reduce((s, r: any) => {
    const qty = r.quantity ?? ((r.morning || 0) + (r.evening || 0))
    return s + qty
  }, 0)

  const milkingCount       = byStatus['MILKING'] || 0
  const avgMilkPerAnimal   = milkingCount > 0 ? todayMilk / milkingCount : 0

  return { totalAnimals: animals.length, byType, byStatus, todayMilk, monthlyMilk, milkingCount, avgMilkPerAnimal }
}

// ── Animals ──────────────────────────────────────────────────────
const LEGACY_STATUS: Record<string, string> = {
  'Milking':  'LACTATING',
  'milking':  'LACTATING',
  'MILKING':  'LACTATING',  
  'Dry':      'DRY',
  'Calf':     'CALF',
  'Heifer':   'HEIFER',
  'Sold':     'SOLD',
  'Dead':     'DEAD',
}

const normaliseAnimal = (a: any) => {
  if (!a) return a
  const obj = a.toObject ? a.toObject() : { ...a }

  if (!obj.type) obj.type = 'COW'
  else obj.type = String(obj.type).toUpperCase()

  if (!obj.tagNo) obj.tagNo = obj.tagNumber || obj.animalId || ''

  if (obj.status) {
    obj.status = LEGACY_STATUS[obj.status] ?? String(obj.status).toUpperCase()
  } else {
    obj.status = 'CALF'
  }

  if (obj.gender === 'Female') obj.gender = 'FEMALE'
  if (obj.gender === 'Male')   obj.gender = 'MALE'
  if (!obj.gender) obj.gender = 'FEMALE'

  if (!obj.bloodline) obj.bloodline = {}

  return obj
}

export const getAnimals = async (params: Params) => {
  const filter: Record<string, unknown> = {}
  if (params.type)   filter.type   = params.type
  if (params.status) filter.status = params.status
  const docs = await Animal.find(filter).sort({ createdAt: -1 })
  return docs.map(normaliseAnimal)
}

export const getAnimalById = async (id: string) => {
  const doc = await Animal.findById(id)
  return normaliseAnimal(doc)
}

export const createAnimal = async (body: Record<string, unknown>) => {
  let gender = String(body.gender || 'FEMALE')
  if (gender === 'Female') gender = 'FEMALE'
  if (gender === 'Male')   gender = 'MALE'
  let status = String(body.status || 'CALF').toUpperCase()

  const doc = {
    ...body,
    gender,
    status,
    tagNo:     body.tagNo     || body.tagNumber,
    tagNumber: body.tagNumber || body.tagNo,
    type:      body.type      || 'COW',
    purchaseCost:  body.purchaseCost  ?? body.purchasePrice,
    purchasePrice: body.purchasePrice ?? body.purchaseCost,
    currentWeight: body.currentWeight ?? body.weight,
    weight:        body.weight        ?? body.currentWeight,
  }
  return Animal.create(doc)
}

export const updateAnimal = async (id: string, body: Record<string, unknown>) => {
  return Animal.findByIdAndUpdate(id, body, { new: true, runValidators: true })
}

export const deleteAnimal = async (id: string) => Animal.findByIdAndDelete(id)

// ── Milk ──────────────────────────────────────────────────────────────────────
export const getMilkRecords = async (animalId: string, params: Params) => {
  const filter: Record<string, unknown> = { animalId }
  if (params.from) filter.date = { $gte: new Date(params.from) }
  if (params.to)   filter.date = { ...(filter.date as object), $lte: new Date(params.to) }

  const records = await MilkRecord.find(filter).sort({ date: -1 })
  return records.map((r: any) => ({
    _id:      r._id,
    date:     r.date,
    session:  r.session  || (r.morning > 0 ? 'MORNING' : 'EVENING'),
    quantity: r.quantity ?? ((r.morning || 0) + (r.evening || 0)),
    fat:      r.fat,
    snf:      r.snf,
    notes:    r.notes,
  }))
}

export const getMilkSummary = async (animalId: string, _params: Params) => {
  const records = await MilkRecord.find({ animalId }).sort({ date: 1 })
  const map = new Map<string, { date: string; morning: number; evening: number; total: number }>()

  records.forEach((r: any) => {
    const key = new Date(r.date).toISOString().split('T')[0]
    const existing = map.get(key) || { date: key, morning: 0, evening: 0, total: 0 }

    if (r.session === 'MORNING') {
      existing.morning += r.quantity || 0
    } else if (r.session === 'EVENING') {
      existing.evening += r.quantity || 0
    } else {
      // Legacy shape
      existing.morning += r.morning || 0
      existing.evening += r.evening || 0
    }
    existing.total = existing.morning + existing.evening
    map.set(key, existing)
  })

  return Array.from(map.values())
}

export const createMilkRecord = async (animalId: string, body: Record<string, unknown>) => {
  const morning = body.session === 'MORNING' ? Number(body.quantity) : 0
  const evening = body.session === 'EVENING' ? Number(body.quantity) : 0

  return MilkRecord.create({
    animalId,
    date:     body.date || new Date(),
    morning,
    evening,
    total:    morning + evening,
    session:  body.session,
    quantity: body.quantity,
    fat:      body.fat,
    snf:      body.snf,
    notes:    body.notes,
  })
}

export const deleteMilkRecord = async (_animalId: string, recordId: string) => {
  return MilkRecord.findByIdAndDelete(recordId)
}

// ── Lactations ────────────────────────────────────────────────────────────────
export const getLactations = async (animalId: string) => {
  const animal = await Animal.findById(animalId).select('lactations')
  return (animal as any)?.lactations ?? []
}

export const createLactation = async (animalId: string, body: Record<string, unknown>) => {
  const animal = await Animal.findByIdAndUpdate(
    animalId,
    { $push: { lactations: { ...body, status: 'ACTIVE', _id: new mongoose.Types.ObjectId() } } },
    { new: true }
  )
  return (animal as any)?.lactations?.slice(-1)[0]
}

export const updateLactation = async (animalId: string, lacId: string, body: Record<string, unknown>) => {
  const animal = await Animal.findOneAndUpdate(
    { _id: animalId, 'lactations._id': lacId },
    { $set: { 'lactations.$': { ...body, _id: lacId } } },
    { new: true }
  )
  return (animal as any)?.lactations?.find((l: any) => String(l._id) === lacId)
}

// ── Reproduction ──────────────────────────────────────────────────────────────
export const getReproduction = async (animalId: string) => {
  const records = await ReproductionRecord.find({ animalId }).sort({ date: -1 })

  const aiRecords      = records.filter((r: any) => r.type === 'AI')
  const calvingRecords = records.filter((r: any) => r.type === 'Calving')
  const lastCalving    = calvingRecords[0]

  return {
    currentPregnancyStatus: 'OPEN',
    totalCalvings:          calvingRecords.length,
    totalAIAttempts:        aiRecords.length,
    lastCalvingDate:        lastCalving ? (lastCalving as any).date : null,
    expectedDueDate:        null,
    aiRecords:              aiRecords.map(normaliseReproRecord),
    calvingRecords:         calvingRecords.map(normaliseReproRecord),
  }
}

const normaliseReproRecord = (r: any) => ({
  _id:                r._id,
  date:               r.date,
  semenBullName:      r.semenBullName || r.notes,
  semenCode:          r.semenCode,
  technicianName:     r.technicianName,
  status:             r.status || 'DONE',
  pregnancyCheckDate: r.pregnancyCheckDate,
  calfGender:         r.calfGender,
  calfTagNo:          r.calfTagNo,
  calfWeight:         r.calfWeight,
  complications:      r.complications,
  notes:              r.notes,
})

export const createAIRecord = async (animalId: string, body: Record<string, unknown>) => {
  return ReproductionRecord.create({ animalId, type: 'AI', ...body })
}

export const updateAIRecord = async (_animalId: string, aiId: string, body: Record<string, unknown>) => {
  return ReproductionRecord.findByIdAndUpdate(aiId, body, { new: true })
}

export const createCalving = async (animalId: string, body: Record<string, unknown>) => {
  return ReproductionRecord.create({ animalId, type: 'Calving', ...body })
}

// ── Health ────────────────────────────────────────────────────────────────────
export const getHealth = async (animalId: string) => {
  const records = await HealthRecord.find({ animalId }).sort({ date: -1 })

  const vaccinations = records
    .filter((r: any) => r.recordType === 'VACCINATION')
    .map((r: any) => ({
      _id:              r._id,
      vaccineName:      r.condition,
      date:             r.date,
      nextDueDate:      r.nextDueDate,
      dosage:           r.dosage,
      veterinarianName: r.veterinarianName,
      cost:             r.cost,
      status:           r.vaccineStatus || 'GIVEN',
      notes:            r.notes,
    }))

  const treatments = records
    .filter((r: any) => r.recordType !== 'VACCINATION')
    .map((r: any) => ({
      _id:              r._id,
      date:             r.date,
      diagnosis:        r.condition,
      medicines:        r.medicines || [],
      veterinarianName: r.veterinarianName,
      cost:             r.cost,
      followUpDate:     r.followUpDate,
      notes:            r.notes,
    }))

  const totalVaccinationCost = vaccinations.reduce((s: number, v: any) => s + (v.cost || 0), 0)
  const totalTreatmentCost   = treatments.reduce((s: number, t: any) => s + (t.cost || 0), 0)

  return { vaccinations, treatments, totalVaccinationCost, totalTreatmentCost }
}

export const createVaccination = async (animalId: string, body: Record<string, unknown>) => {
  return HealthRecord.create({
    animalId,
    recordType:       'VACCINATION',
    condition:        body.vaccineName,
    date:             body.date,
    nextDueDate:      body.nextDueDate,
    dosage:           body.dosage,
    veterinarianName: body.veterinarianName,
    cost:             body.cost,
    vaccineStatus:    body.status,
    notes:            body.notes,
  })
}

export const updateVaccination = async (_animalId: string, vId: string, body: Record<string, unknown>) => {
  return HealthRecord.findByIdAndUpdate(vId, body, { new: true })
}

export const createTreatment = async (animalId: string, body: Record<string, unknown>) => {
  return HealthRecord.create({
    animalId,
    recordType:       'TREATMENT',
    condition:        body.diagnosis,
    date:             body.date,
    medicines:        body.medicines,
    veterinarianName: body.veterinarianName,
    cost:             body.cost,
    followUpDate:     body.followUpDate,
    notes:            body.notes,
  })
}

export const updateTreatment = async (_animalId: string, tId: string, body: Record<string, unknown>) => {
  return HealthRecord.findByIdAndUpdate(tId, body, { new: true })
}

// ── Feeding ───────────────────────────────────────────────────────────────────
export const getFeeding = async (animalId: string) => {
  const records = await FeedRecord.find({ animalId }).sort({ date: -1 })

  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const yearStart  = new Date(now.getFullYear(), 0, 1)

  const monthlyFeedCost = records
    .filter((r: any) => new Date(r.date) >= monthStart)
    .reduce((s: number, r: any) => s + (r.quantity * (r.costPerKg || 0)), 0)

  const yearlyFeedCost = records
    .filter((r: any) => new Date(r.date) >= yearStart)
    .reduce((s: number, r: any) => s + (r.quantity * (r.costPerKg || 0)), 0)

  const animal      = await Animal.findById(animalId).select('feedingPlan')
  const currentPlan = (animal as any)?.feedingPlan ?? []

  // ── Daily breakdown from feeding plan ───────────────────────────
  const breakdownMap = new Map<string, { totalQuantity: number; unit: string; dailyCost: number }>()

  for (const item of currentPlan) {
    const key      = item.fodderType || 'GREEN'
    const existing = breakdownMap.get(key) || { totalQuantity: 0, unit: item.unit || 'kg', dailyCost: 0 }
    existing.totalQuantity += item.dailyQuantity || 0
    existing.dailyCost     += (item.dailyQuantity || 0) * (item.costPerUnit || 0)
    breakdownMap.set(key, existing)
  }

  const dailyBreakdown = Array.from(breakdownMap.entries()).map(([fodderType, v]) => ({
    fodderType,
    totalQuantity: Number(v.totalQuantity.toFixed(2)),
    unit:          v.unit,
    dailyCost:     Number(v.dailyCost.toFixed(2)),
  }))

  const dailyFeedCost = dailyBreakdown.reduce((s, d) => s + d.dailyCost, 0)

  return {
    monthlyFeedCost,
    yearlyFeedCost,
    dailyFeedCost:  Number(dailyFeedCost.toFixed(2)),
    dailyBreakdown,
    currentPlan,
    records,
  }
}

export const createFeedRecord = async (animalId: string, body: Record<string, unknown>) => {
  return FeedRecord.create({ animalId, ...body })
}

export const upsertFeedingPlan = async (animalId: string, body: Record<string, unknown>) => {
  const animal = await Animal.findByIdAndUpdate(
    animalId,
    { $push: { feedingPlan: { ...body, _id: new mongoose.Types.ObjectId() } } },
    { new: true }
  )
  return (animal as any)?.feedingPlan
}

// ── Profitability ─────────────────────────────────────────────────────────────
export const getProfitability = async (animalId: string, params: Params) => {
  const now = new Date()
  let start: Date
  let end: Date = now

  switch (params.period) {
    case 'last_month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      end   = new Date(now.getFullYear(), now.getMonth(), 0)
      break
    case 'current_year':
      start = new Date(now.getFullYear(), 0, 1)
      break
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const milkRecords   = await MilkRecord.find({ animalId, date: { $gte: start, $lte: end } })
  const feedRecords   = await FeedRecord.find({ animalId, date: { $gte: start, $lte: end } })
  const healthRecords = await HealthRecord.find({ animalId, date: { $gte: start, $lte: end } })

  const MILK_PRICE  = 40
  // FIX: totalLitres supports both storage shapes
  const totalLitres = milkRecords.reduce((s: number, r: any) => {
    return s + (r.quantity ?? ((r.morning || 0) + (r.evening || 0)))
  }, 0)
  const milkIncome  = totalLitres * MILK_PRICE
  const feedCost    = feedRecords.reduce((s: number, r: any) => s + ((r.quantity || 0) * (r.costPerKg || 0)), 0)
  const medicalCost = healthRecords.reduce((s: number, r: any) => s + (r.cost || 0), 0)
  const netProfit   = milkIncome - feedCost - medicalCost
  const roi         = (feedCost + medicalCost) > 0 ? (netProfit / (feedCost + medicalCost)) * 100 : 0

  return { milkIncome, feedCost, medicalCost, otherCost: 0, netProfit, roi, totalLitres }
}

// ── Fodder Crops ──────────────────────────────────────────────────────────────
export const getFodderCrops   = async () => FodderStock.find({ isCrop: true })
export const createFodderCrop = async (body: Record<string, unknown>) => FodderStock.create({ ...body, isCrop: true })
export const updateFodderCrop = async (id: string, body: Record<string, unknown>) =>
  FodderStock.findByIdAndUpdate(id, body, { new: true })

// ── Fodder Stock ──────────────────────────────────────────────────────────────
export const getFodderStock   = async () => FodderStock.find({ isCrop: { $ne: true } })
export const createFodderStock = async (body: Record<string, unknown>) => FodderStock.create(body)
export const updateFodderStock = async (id: string, body: Record<string, unknown>) =>
  FodderStock.findByIdAndUpdate(id, body, { new: true })