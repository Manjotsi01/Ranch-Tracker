import { useCallback, useEffect } from 'react';
import { dashboardApi } from '../lib/api';
import { useDashboardStore } from '../store';

// Remove the entire unwrap function (lines 7-15)

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
      // Use allSettled so a single failing endpoint doesn't block the rest
      const [statsResult, kpisResult, alertsResult, activityResult] = await Promise.allSettled([
        dashboardApi.getStats(),
        dashboardApi.getKPIs(),
        dashboardApi.getAlerts(),
        dashboardApi.getRecentActivity(),
      ]);

      // Stats — try data.data, data.stats, data directly
      if (statsResult.status === 'fulfilled') {
        const raw = statsResult.value;
        const statsData = raw.data?.data ?? raw.data?.stats ?? raw.data ?? null;
        if (statsData) setStats(statsData);
      }

      // KPIs — try data.data, data.kpis, data directly (array)
      if (kpisResult.status === 'fulfilled') {
        const raw = kpisResult.value;
        const kpiData = raw.data?.data ?? raw.data?.kpis ?? raw.data ?? [];
        setKPIs(Array.isArray(kpiData) ? kpiData : []);
      }

      // Alerts — try data.data, data.alerts, data directly
      if (alertsResult.status === 'fulfilled') {
        const raw = alertsResult.value;
        const alertData = raw.data?.data ?? raw.data?.alerts ?? raw.data ?? [];
        setAlerts(Array.isArray(alertData) ? alertData : []);
      }

      // Activity — try data.data, data.activity, data directly
      if (activityResult.status === 'fulfilled') {
        const raw = activityResult.value;
        const actData = raw.data?.data ?? raw.data?.activity ?? raw.data ?? [];
        setRecentActivity(Array.isArray(actData) ? actData : []);
      }

      // If ALL requests failed, surface a top-level error
      const allFailed = [statsResult, kpisResult, alertsResult, activityResult]
        .every(r => r.status === 'rejected');
      if (allFailed) {
        setError('Failed to load dashboard. Check your connection.');
      }

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
      // try data.data, data.chart, data directly
      const chartData = res.data?.data ?? res.data?.chart ?? res.data ?? [];
      setProfitChart(Array.isArray(chartData) ? chartData : []);
    } catch {
      // Silently fail chart — non-critical
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