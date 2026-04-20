import { useState, useCallback } from 'react'
import { shopApi } from '../lib/api'
import type { Sale, CreateSalePayload } from '../types'

export function useSales() {
  const [sales,   setSales]   = useState<Sale[]>([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const createSale = useCallback(async (payload: CreateSalePayload) => {
    setLoading(true); setError(null)
    try {
      const sale = await shopApi.createSale(payload)
      setSales(prev => [sale, ...prev])
      return sale
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sale failed'
      setError(msg); throw e
    } finally { setLoading(false) }
  }, [])

  return { sales, loading, error, createSale }
}