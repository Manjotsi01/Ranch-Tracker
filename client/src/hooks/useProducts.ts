import { useState, useCallback } from 'react'
import { shopApi } from '../lib/api'
import type { Product } from '../types'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const fetchProducts = useCallback(async (all?: boolean) => {
    setLoading(true); setError(null)
    try   { setProducts(await shopApi.getProducts(all)) }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed to load products') }
    finally { setLoading(false) }
  }, [])

  const createProduct = useCallback(async (data: Omit<Product, '_id' | 'createdAt' | 'suggestions'>) => {
    const p = await shopApi.createProduct(data)
    setProducts(prev => [...prev, p])
    return p
  }, [])

  const updateProduct = useCallback(async (id: string, data: Partial<Product>) => {
    const p = await shopApi.updateProduct(id, data)
    setProducts(prev => prev.map(x => x._id === id ? p : x))
    return p
  }, [])

  const setStock = useCallback(async (id: string, qty: number) => {
    const p = await shopApi.setStock(id, qty)
    setProducts(prev => prev.map(x => x._id === id ? p : x))
    return p
  }, [])

  const deleteProduct = useCallback(async (id: string) => {
    await shopApi.deleteProduct(id)
    setProducts(prev => prev.filter(x => x._id !== id))
  }, [])

  return { products, loading, error, fetchProducts, createProduct, updateProduct, setStock, deleteProduct }
}