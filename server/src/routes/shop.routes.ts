// server/src/routes/shop.routes.ts
import { Router } from 'express';
import {
  getStatsHandler,
  getBatchesHandler, getBatchByIdHandler, createBatchHandler,
  updateBatchHandler, deleteBatchHandler,
  getSalesHandler, getSaleByIdHandler, posSaleHandler,
  getRevenueChartHandler, getProductBreakdownHandler, getDailyReportHandler,
} from '../controllers/shop.controller';

const router = Router();

// ── Stats ──────────────────────────────────────────────────────────────────
router.get('/stats', getStatsHandler);

// ── Batches ────────────────────────────────────────────────────────────────
router.get   ('/batches',     getBatchesHandler);
router.post  ('/batches',     createBatchHandler);
router.get   ('/batches/:id', getBatchByIdHandler);
router.patch ('/batches/:id', updateBatchHandler);
router.delete('/batches/:id', deleteBatchHandler);

// ── Sales ──────────────────────────────────────────────────────────────────
router.get ('/sales',     getSalesHandler);
router.post('/sales',     posSaleHandler);
router.get ('/sales/:id', getSaleByIdHandler);

// ── Reports ────────────────────────────────────────────────────────────────
router.get('/reports/revenue',  getRevenueChartHandler);
router.get('/reports/products', getProductBreakdownHandler);
router.get('/reports/daily',    getDailyReportHandler);

export default router;