"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/shop.routes.ts
//
// FIX: Rewrote entirely. Old file only had POST /batch and POST /sale.
//
// Frontend calls these endpoints (from shopApi in lib/api.ts):
//   GET  /api/shop/stats                    ← getStats
//   GET  /api/shop/batches                  ← getBatches (with ?status=READY etc.)
//   GET  /api/shop/batches/:id              ← getBatchById
//   POST /api/shop/batches                  ← createBatch
//   PATCH/api/shop/batches/:id              ← updateBatch
//   DELETE/api/shop/batches/:id             ← deleteBatch
//   GET  /api/shop/sales                    ← getSales
//   GET  /api/shop/sales/:id                ← getSaleById
//   POST /api/shop/sales                    ← createSale (POS)
//   GET  /api/shop/reports/revenue          ← getRevenueChart
//   GET  /api/shop/reports/products         ← getProductBreakdown
//   GET  /api/shop/reports/daily            ← getDailyReport
// ─────────────────────────────────────────────────────────────────────────────
const express_1 = require("express");
const shop_controller_1 = require("../controllers/shop.controller");
const router = (0, express_1.Router)();
// ── Stats ──────────────────────────────────────────────────────────────────
router.get('/stats', shop_controller_1.getStatsHandler);
// ── Batches ────────────────────────────────────────────────────────────────
router.get('/batches', shop_controller_1.getBatchesHandler);
router.post('/batches', shop_controller_1.createBatchHandler);
router.get('/batches/:id', shop_controller_1.getBatchByIdHandler);
router.patch('/batches/:id', shop_controller_1.updateBatchHandler);
router.delete('/batches/:id', shop_controller_1.deleteBatchHandler);
// ── Sales ──────────────────────────────────────────────────────────────────
router.get('/sales', shop_controller_1.getSalesHandler);
router.post('/sales', shop_controller_1.posSaleHandler);
router.get('/sales/:id', shop_controller_1.getSaleByIdHandler);
// ── Reports ────────────────────────────────────────────────────────────────
router.get('/reports/revenue', shop_controller_1.getRevenueChartHandler);
router.get('/reports/products', shop_controller_1.getProductBreakdownHandler);
router.get('/reports/daily', shop_controller_1.getDailyReportHandler);
exports.default = router;
