// src/hooks/useSales.ts
import { useCallback } from 'react'
import { shopApi } from '../lib/api'
import { useShopStore } from '../store/index'
import type { CreateSalePayload } from '../types'

export function useSales() {
  const {
    sales, loading, error,
    setSales, setLoading, setError, addSale,
  } = useShopStore()

  const fetchSales = useCallback(
    async (params?: { page?: number; limit?: number; from?: string; to?: string; paymentMode?: string }) => {
      setLoading(true)
      setError(null)
      try {
        const res = await shopApi.getSales(params)
        setSales(res.data.data ?? res.data)
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to load sales'
        setError(msg)
      } finally {
        setLoading(false)
      }
    },
    [setSales, setLoading, setError]
  )

  const createSale = useCallback(
    async (payload: CreateSalePayload) => {
      setLoading(true)
      setError(null)
      try {
        const res = await shopApi.createSale(payload)
        const sale = res.data.data ?? res.data
        addSale(sale)
        return sale
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to create sale'
        setError(msg)
        throw e
      } finally {
        setLoading(false)
      }
    },
    [addSale, setLoading, setError]
  )

  return { sales, loading, error, fetchSales, createSale }
}