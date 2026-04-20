import { useState, useCallback } from 'react'
import { shopApi } from '../lib/api'
import type { MilkEntry, MilkStock } from '../types'

export function useMilk() {
  const [entries, setEntries] = useState<MilkEntry[]>([])
  const [stock, setStock] = useState<MilkStock | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEntries = useCallback(async (params?: Record<string, string>) => {
    setLoading(true)
    setError(null)
    try {

      const data = await shopApi.getMilkEntries(params)
      setEntries(data) 
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load milk entries')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchStock = useCallback(async (date?: string) => {
    try {
      const data = await shopApi.getMilkStock(date)
      setStock(data)  
    } catch {
      // ignore
    }
  }, [])

  const addEntry = useCallback(async (data: {
    date: string
    shift: 'MORNING' | 'EVENING'
    quantityLiters: number
    fat?: number
    snf?: number
    source: 'OWN' | 'PURCHASED'
    notes?: string
  }) => {
    setLoading(true)
    setError(null)
    try {
      const entry = await shopApi.addMilkEntry(data)  
      setEntries(prev => [
        entry,
        ...prev.filter(
          e => !(e.date.slice(0, 10) === data.date && e.shift === data.shift)
        )
      ])
      return entry
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to add entry'
      setError(msg)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { entries, stock, loading, error, fetchEntries, fetchStock, addEntry }
}
