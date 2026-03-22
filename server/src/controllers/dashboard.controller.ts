import asyncHandler from 'express-async-handler';
import dashboardService from '../services/dashboard.service';

export const getStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getStats();
  res.json({
    success: true,
    data: stats
  });
});

export const getKPIs = asyncHandler(async (req, res) => {
  const kpis = await dashboardService.getKPIs();
  res.json({
    success: true,
    data: kpis
  });
});

export const getAlerts = asyncHandler(async (req, res) => {
  const alerts = await dashboardService.getAlerts();
  res.json({
    success: true,
    data: alerts
  });
});

export const getProfitChart = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query as { period: 'week' | 'month' | 'year' };
  const chart = await dashboardService.getProfitChart(period as any);
  res.json({
    success: true,
    data: chart
  });
});

export const getRecentActivity = asyncHandler(async (req, res) => {
  const activity = await dashboardService.getRecentActivity();
  res.json({
    success: true,
    data: activity
  });
});

