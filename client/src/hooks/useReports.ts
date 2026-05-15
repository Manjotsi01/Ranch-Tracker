// client/src/hooks/useReports.ts

import { useState, useCallback } from 'react'
import { shopApi } from '../lib/api'

export function useReports() {
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDailyReport = useCallback(async (date?: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await shopApi.getDailyReport(date)
      console.log('REPORT:', data) // debug
      setReport(data)
    } catch (e: any) {
      console.error(e)
      setError('Could not load today\'s report')
    } finally {
      setLoading(false)
    }
  }, [])

  return { report, loading, error, fetchDailyReport }
}