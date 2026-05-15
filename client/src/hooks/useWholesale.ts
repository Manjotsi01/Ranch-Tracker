// client/src/hooks/useWholesale.ts
import { useState, useCallback } from 'react'
import { shopApi } from '../lib/api'

export function useWholesale() {
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSales = useCallback(async (params?: Record<string, string>) => {
    setLoading(true)
    setError(null)
    try {
      const data = await shopApi.getWholesaleSales(params)  
      setSales(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load wholesale sales')
    } finally {
      setLoading(false)
    }
  }, [])

  const createSale = useCallback(async (data: unknown) => {
    setLoading(true)
    setError(null)
    try {
      const sale = await shopApi.createWholesaleSale(data)  // ✅ fixed name
      setSales(prev => [sale, ...prev])
      return sale
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create sale'
      setError(msg)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const markReceived = useCallback(async (id: string) => {
    try {
      const updated = await shopApi.markWholesaleReceived(id)  
      setSales(prev => prev.map(s => s.id === id ? updated : s))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to mark received'
      setError(msg)
      throw e
    }
  }, [])

  return { sales, loading, error, fetchSales, createSale, markReceived }
}