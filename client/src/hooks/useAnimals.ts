// client/src/hooks/useAnimals.ts

import { useState, useCallback } from 'react'
import { dairyApi } from '../lib/api'
import { useAnimalStore } from '../store'
import type { Animal, AnimalType, HerdSummary } from '../types'

export function useAnimals() {
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const {
    cowAnimals, buffaloAnimals, animals,
    setCowAnimals, setBuffaloAnimals, setAnimals,
    herdSummary, setHerdSummary,
    filters, setFilter,
  } = useAnimalStore()

  const fetchAnimals = useCallback(async (params?: Record<string, unknown>) => {
    setLoading(true)
    setError(null)

    // FIX: clear the correct list immediately so stale data never shows
    const fetchType = String(params?.type ?? '').toUpperCase()
    if (fetchType === 'COW')     setCowAnimals([])
    if (fetchType === 'BUFFALO') setBuffaloAnimals([])

    try {
      const res  = await dairyApi.getAnimals(params)
      const data: Animal[] = res.data?.data ?? res.data ?? []

      // FIX: write into the type-specific array
      if (fetchType === 'COW')     setCowAnimals(data)
      else if (fetchType === 'BUFFALO') setBuffaloAnimals(data)
      else setAnimals(data)

      return data
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load animals'
      setError(msg)
      return []
    } finally {
      setLoading(false)
    }
  }, [setCowAnimals, setBuffaloAnimals, setAnimals])

  // Helper — returns the right array for the current type
  const getAnimalsForType = useCallback((type: AnimalType) => {
    return type === 'COW' ? cowAnimals : buffaloAnimals
  }, [cowAnimals, buffaloAnimals])

  const fetchHerdSummary = useCallback(async () => {
    try {
      const res  = await dairyApi.getHerdSummary()
      const data: HerdSummary = res.data?.data ?? res.data
      setHerdSummary(data)
      return data
    } catch { return null }
  }, [setHerdSummary])

  const createAnimal = useCallback(async (data: unknown) => {
    setLoading(true)
    setError(null)
    try {
      const res = await dairyApi.createAnimal(data)
      return res.data?.data ?? res.data
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create animal'
      setError(msg)
      throw e
    } finally { setLoading(false) }
  }, [])

  const updateAnimal = useCallback(async (id: string, data: unknown) => {
    setLoading(true)
    setError(null)
    try {
      const res = await dairyApi.updateAnimal(id, data)
      return res.data?.data ?? res.data
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to update animal'
      setError(msg)
      throw e
    } finally { setLoading(false) }
  }, [])

  return {
    animals,          // generic — for legacy code
    cowAnimals,
    buffaloAnimals,
    getAnimalsForType,
    herdSummary,
    loading,
    error,
    filters,
    setFilter,
    fetchAnimals,
    fetchHerdSummary,
    createAnimal,
    updateAnimal,
  }
}

export function useAnimalDetail(animalId: string) {
  const [animal, setAnimal]   = useState<Animal | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!animalId) return
    setLoading(true)
    setError(null)
    try {
      const res = await dairyApi.getAnimal(animalId)
      // Handle both { data: animal } and { data: { data: animal } }
      const raw = res.data?.data ?? res.data
      setAnimal(raw)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load animal')
    } finally { setLoading(false) }
  }, [animalId])

  return { animal, loading, error, fetch, setAnimal }
}