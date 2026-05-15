// Path: ranch-tracker/client/src/hooks/useDashboard.ts

import { useCallback, useEffect } from 'react';
import { dashboardApi } from '../lib/api';
import { useDashboardStore } from '../store';

export function useDashboard() {
  const {
    stats, kpis, alerts, profitChart, recentActivity,
    period, loading, error,
    setStats, setKPIs, setAlerts, setProfitChart, setRecentActivity,
    setPeriod, setLoading, setError, dismissAlert,
  } = useDashboardStore();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, kpisRes, alertsRes, activityRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getKPIs(),
        dashboardApi.getAlerts(),
        dashboardApi.getRecentActivity(),
      ]);
      setStats(statsRes.data.data ?? statsRes.data);
      setKPIs(kpisRes.data.data ?? kpisRes.data);
      setAlerts(alertsRes.data.data ?? alertsRes.data);
      setRecentActivity(activityRes.data.data ?? activityRes.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setStats, setKPIs, setAlerts, setRecentActivity]);

  const fetchChart = useCallback(async () => {
    try {
      const res = await dashboardApi.getProfitChart(period);
      setProfitChart(res.data.data ?? res.data);
    } catch {
      // silently fail chart
    }
  }, [period, setProfitChart]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { fetchChart(); }, [fetchChart]);

  return {
    stats, kpis, alerts, profitChart, recentActivity,
    period, loading, error,
    setPeriod, dismissAlert,
    refetch: fetchAll,
  };
}