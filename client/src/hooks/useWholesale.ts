import { useState, useCallback } from 'react'
import { shopApi } from '../lib/api'
import type { WholesaleSale } from '../types'

export function useWholesale() {
  const [sales,   setSales]   = useState<WholesaleSale[]>([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const fetchSales = useCallback(async (params?: Record<string, string>) => {
    setLoading(true); setError(null)
    try   { setSales(await shopApi.getWholesale(params)) }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed to load wholesale') }
    finally { setLoading(false) }
  }, [])

  const createSale = useCallback(async (data: {
    date: string; buyerName: string; quantityLiters: number
    ratePerLiter: number; fat?: number; snf?: number; notes?: string
  }) => {
    const sale = await shopApi.createWholesale(data)
    setSales(prev => [sale, ...prev])
    return sale
  }, [])

  const markReceived = useCallback(async (id: string) => {
    const sale = await shopApi.markReceived(id)
    setSales(prev => prev.map(s => s._id === id ? sale : s))
    return sale
  }, [])

  return { sales, loading, error, fetchSales, createSale, markReceived }
}