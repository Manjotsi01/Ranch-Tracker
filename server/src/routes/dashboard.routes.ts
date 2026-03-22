import { Router } from 'express';
import {
  getStats,
  getKPIs,
  getAlerts,
  getProfitChart,
  getRecentActivity
} from '../controllers/dashboard.controller';
        
const router = Router();

router.get('/stats', getStats);
router.get('/kpis', getKPIs);
router.get('/alerts', getAlerts);
router.get('/profit-chart', getProfitChart);
router.get('/recent-activity', getRecentActivity);

export default router;

