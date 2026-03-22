// client/src/hooks/useDairyData.ts
import { useState, useCallback } from 'react'
import { dairyApi } from '../lib/api'
import type {
  MilkRecord, DailyMilkSummary, Lactation,
  ReproductionSummary, AIRecord, CalvingRecord,
  HealthSummary, VaccinationRecord, TreatmentRecord,
  FeedingSummary, FeedRecord, FeedingPlan,
  AnimalProfitability,
  FodderCrop, FodderStock,
} from '../types'

// ─── Milk Hook ─────────────────────────────────────────────────────────────────

export function useMilk(animalId: string) {
  const [records, setRecords] = useState<MilkRecord[]>([])
  const [summary, setSummary] = useState<DailyMilkSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = useCallback(async (params?: Record<string, unknown>) => {
    setLoading(true); setError(null)
    try {
      const res = await dairyApi.getMilkRecords(animalId, params)
      const data: MilkRecord[] = res.data?.data ?? res.data ?? []
      setRecords(data)
      return data
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load milk records')
      return []
    } finally { setLoading(false) }
  }, [animalId])

  const fetchSummary = useCallback(async (params?: Record<string, unknown>) => {
    try {
      const res = await dairyApi.getMilkSummary(animalId, params)
      const data: DailyMilkSummary[] = res.data?.data ?? res.data ?? []
      setSummary(data)
      return data
    } catch { return [] }
  }, [animalId])

  const addRecord = useCallback(async (data: unknown) => {
    setLoading(true); setError(null)
    try {
      const res = await dairyApi.createMilkRecord(animalId, data)
      return res.data?.data ?? res.data
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to add milk record')
      throw e
    } finally { setLoading(false) }
  }, [animalId])

  const deleteRecord = useCallback(async (recordId: string) => {
    try {
      await dairyApi.deleteMilkRecord(animalId, recordId)
      setRecords((prev) => prev.filter((r) => r._id !== recordId))
    } catch (e: unknown) {
      throw e
    }
  }, [animalId])

  return { records, summary, loading, error, fetchRecords, fetchSummary, addRecord, deleteRecord }
}

// ─── Lactation Hook ────────────────────────────────────────────────────────────

export function useLactation(animalId: string) {
  const [lactations, setLactations] = useState<Lactation[]>([])
  const [loading, setLoading] = useState(false)

  const fetchLactations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await dairyApi.getLactations(animalId)
      const data: Lactation[] = res.data?.data ?? res.data ?? []
      setLactations(data)
      return data
    } catch { return [] }
    finally { setLoading(false) }
  }, [animalId])

  const addLactation = useCallback(async (data: unknown) => {
    const res = await dairyApi.createLactation(animalId, data)
    return res.data?.data ?? res.data
  }, [animalId])

  const updateLactation = useCallback(async (id: string, data: unknown) => {
    const res = await dairyApi.updateLactation(animalId, id, data)
    return res.data?.data ?? res.data
  }, [animalId])

  return { lactations, loading, fetchLactations, addLactation, updateLactation }
}

// ─── Reproduction Hook ─────────────────────────────────────────────────────────

export function useReproduction(animalId: string) {
  const [data, setData] = useState<ReproductionSummary | null>(null)
  const [aiRecords, setAiRecords] = useState<AIRecord[]>([])
  const [calvingRecords, setCalvingRecords] = useState<CalvingRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await dairyApi.getReproduction(animalId)
      const d: ReproductionSummary = res.data?.data ?? res.data
      setData(d)
      setAiRecords(d.aiRecords ?? [])
      setCalvingRecords(d.calvingRecords ?? [])
      return d
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load reproduction data')
      return null
    } finally { setLoading(false) }
  }, [animalId])

  const addAI = useCallback(async (formData: unknown) => {
    const res = await dairyApi.createAIRecord(animalId, formData)
    return res.data?.data ?? res.data
  }, [animalId])

  const updateAI = useCallback(async (id: string, formData: unknown) => {
    const res = await dairyApi.updateAIRecord(animalId, id, formData)
    return res.data?.data ?? res.data
  }, [animalId])

  const addCalving = useCallback(async (formData: unknown) => {
    const res = await dairyApi.createCalving(animalId, formData)
    return res.data?.data ?? res.data
  }, [animalId])

  return { data, aiRecords, calvingRecords, loading, error, fetch, addAI, updateAI, addCalving }
}

// ─── Health Hook ───────────────────────────────────────────────────────────────

export function useHealth(animalId: string) {
  const [data, setData] = useState<HealthSummary | null>(null)
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([])
  const [treatments, setTreatments] = useState<TreatmentRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await dairyApi.getHealth(animalId)
      const d: HealthSummary = res.data?.data ?? res.data
      setData(d)
      setVaccinations(d.vaccinations ?? [])
      setTreatments(d.treatments ?? [])
      return d
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load health data')
      return null
    } finally { setLoading(false) }
  }, [animalId])

  const addVaccination = useCallback(async (formData: unknown) => {
    const res = await dairyApi.createVaccination(animalId, formData)
    return res.data?.data ?? res.data
  }, [animalId])

  const updateVaccination = useCallback(async (id: string, formData: unknown) => {
    const res = await dairyApi.updateVaccination(animalId, id, formData)
    return res.data?.data ?? res.data
  }, [animalId])

  const addTreatment = useCallback(async (formData: unknown) => {
    const res = await dairyApi.createTreatment(animalId, formData)
    return res.data?.data ?? res.data
  }, [animalId])

  const updateTreatment = useCallback(async (id: string, formData: unknown) => {
    const res = await dairyApi.updateTreatment(animalId, id, formData)
    return res.data?.data ?? res.data
  }, [animalId])

  return {
    data, vaccinations, treatments, loading, error,
    fetch, addVaccination, updateVaccination, addTreatment, updateTreatment,
  }
}

// ─── Feeding Hook ──────────────────────────────────────────────────────────────

export function useFeeding(animalId: string) {
  const [summary, setSummary] = useState<FeedingSummary | null>(null)
  const [feedRecords, setFeedRecords] = useState<FeedRecord[]>([])
  const [feedingPlan, setFeedingPlan] = useState<FeedingPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await dairyApi.getFeeding(animalId)
      const d: FeedingSummary = res.data?.data ?? res.data
      setSummary(d)
      setFeedingPlan(d.currentPlan ?? [])
      return d
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load feeding data')
      return null
    } finally { setLoading(false) }
  }, [animalId])

  const addFeedRecord = useCallback(async (formData: unknown) => {
    const res = await dairyApi.createFeedRecord(animalId, formData)
    return res.data?.data ?? res.data
  }, [animalId])

  const saveFeedingPlan = useCallback(async (formData: unknown) => {
    const res = await dairyApi.upsertFeedingPlan(animalId, formData)
    return res.data?.data ?? res.data
  }, [animalId])

  return {
    summary, feedRecords, feedingPlan, loading, error,
    fetch, addFeedRecord, saveFeedingPlan, setFeedRecords,
  }
}

// ─── Profitability Hook ────────────────────────────────────────────────────────

export function useProfitability(animalId: string) {
  const [data, setData] = useState<AnimalProfitability | null>(null)
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async (params?: Record<string, unknown>) => {
    setLoading(true)
    try {
      const res = await dairyApi.getProfitability(animalId, params)
      const d: AnimalProfitability = res.data?.data ?? res.data
      setData(d)
      return d
    } catch { return null }
    finally { setLoading(false) }
  }, [animalId])

  return { data, loading, fetch }
}

// ─── Fodder Hook ───────────────────────────────────────────────────────────────

export function useFodder() {
  const [crops, setCrops] = useState<FodderCrop[]>([])
  const [stock, setStock] = useState<FodderStock[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCrops = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await dairyApi.getFodderCrops()
      const data: FodderCrop[] = res.data?.data ?? res.data ?? []
      setCrops(data)
      return data
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load fodder crops')
      return []
    } finally { setLoading(false) }
  }, [])

  const fetchStock = useCallback(async () => {
    try {
      const res = await dairyApi.getFodderStock()
      const data: FodderStock[] = res.data?.data ?? res.data ?? []
      setStock(data)
      return data
    } catch { return [] }
  }, [])

  const addCrop = useCallback(async (data: unknown) => {
    const res = await dairyApi.createFodderCrop(data)
    return res.data?.data ?? res.data
  }, [])

  const updateCrop = useCallback(async (id: string, data: unknown) => {
    const res = await dairyApi.updateFodderCrop(id, data)
    return res.data?.data ?? res.data
  }, [])

  const addStock = useCallback(async (data: unknown) => {
    const res = await dairyApi.createFodderStock(data)
    return res.data?.data ?? res.data
  }, [])

  const updateStock = useCallback(async (id: string, data: unknown) => {
    const res = await dairyApi.updateFodderStock(id, data)
    return res.data?.data ?? res.data
  }, [])

  return {
    crops, stock, loading, error,
    fetchCrops, fetchStock, addCrop, updateCrop, addStock, updateStock,
    setCrops, setStock,
  }
}