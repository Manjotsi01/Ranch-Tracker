import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { sendSuccess } from '../utils/response';
import * as shopService from '../services/shop.service';

// ── Stats ──────────────────────────────────────────────────────────────────────
export const getStatsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const data = await shopService.getStats();
  sendSuccess(res, data);
});

// ── Batches ────────────────────────────────────────────────────────────────────
export const getBatchesHandler = asyncHandler(async (req: Request, res: Response) => {
  const { status, productType } = req.query as { status?: string; productType?: string };
  const data = await shopService.getBatches({ status, productType });
  sendSuccess(res, data);
});

export const getBatchByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await shopService.getBatchById(req.params.id);
  sendSuccess(res, data);
});

export const createBatchHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await shopService.createBatch(req.body);
  sendSuccess(res, data, 201);
});

export const updateBatchHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await shopService.updateBatch(req.params.id, req.body);
  sendSuccess(res, data);
});

export const deleteBatchHandler = asyncHandler(async (req: Request, res: Response) => {
  await shopService.deleteBatch(req.params.id);
  sendSuccess(res, { deleted: true });
});

// ── Sales ──────────────────────────────────────────────────────────────────────
export const getSalesHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, from, to, paymentMode } = req.query as {
    page?: string; limit?: string; from?: string; to?: string; paymentMode?: string;
  };
  const data = await shopService.getSales({
    page:        page  ? Number(page)  : undefined,
    limit:       limit ? Number(limit) : undefined,
    from,
    to,
    paymentMode,
  });
  sendSuccess(res, data);
});

export const getSaleByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await shopService.getSaleById(req.params.id);
  sendSuccess(res, data);
});

export const posSaleHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await shopService.createPosSale(req.body);
  sendSuccess(res, data, 201);
});

// ── Reports ────────────────────────────────────────────────────────────────────
export const getRevenueChartHandler = asyncHandler(async (req: Request, res: Response) => {
  const { period } = req.query as { period?: 'week' | 'month' | 'year' };
  const data = await shopService.getRevenueChart({ period });
  sendSuccess(res, data);
});

export const getProductBreakdownHandler = asyncHandler(async (req: Request, res: Response) => {
  const { from, to } = req.query as { from?: string; to?: string };
  const data = await shopService.getProductBreakdown({ from, to });
  sendSuccess(res, data);
});

export const getDailyReportHandler = asyncHandler(async (req: Request, res: Response) => {
  const { date } = req.query as { date?: string };
  const data = await shopService.getDailyReport(date);
  sendSuccess(res, data);
});