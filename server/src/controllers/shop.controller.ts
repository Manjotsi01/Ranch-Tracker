import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { sendSuccess } from '../utils/response';
import * as shopService from '../services/shop.service';

// ── SALES ─────────────────────────────────────────────────────────────────────
export const getSalesHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, from, to, paymentMode } = req.query as {
    page?: string;
    limit?: string;
    from?: string;
    to?: string;
    paymentMode?: string;
  };

  const data = await shopService.getSales({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    from,
    to,
    paymentMode,
  });

  sendSuccess(res, data);
});



export const posSaleHandler = asyncHandler(async (req: Request, res: Response) => {
  
  const data = await shopService.createSale(req.body);
  sendSuccess(res, data, 201);
});

// ── REPORTS (ONLY EXISTING ONE) ────────────────────────────────────────────────
export const getDailyReportHandler = asyncHandler(async (req: Request, res: Response) => {
  const { date } = req.query as { date?: string };
  const data = await shopService.getDailyReport(date);
  sendSuccess(res, data);
});