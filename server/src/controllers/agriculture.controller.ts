// Path: ranch-tracker/server/src/controllers/agriculture.controller.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { sendSuccess } from '../utils/response';
import * as agricultureService from '../services/agriculture.service';

// ─── Crops ────────────────────────────────────────────────────────────────────

export const getAllCropsHandler = asyncHandler(async (req: Request, res: Response) => {
  const crops = await agricultureService.getAllCrops();
  sendSuccess(res, crops);
});

// GET /agriculture/crops/:cropId → single crop details
export const getCropHandler = asyncHandler(async (req: Request, res: Response) => {
  const crop = await agricultureService.getCropById(req.params.cropId);
  sendSuccess(res, crop);
});

// GET /agriculture/crops/:cropId/seasons → seasons for a crop
export const getCropSeasonsHandler = asyncHandler(async (req: Request, res: Response) => {
  const seasons = await agricultureService.getCropSeasons(req.params.cropId);
  sendSuccess(res, seasons);
});

// ─── Seasons ──────────────────────────────────────────────────────────────────

// POST /agriculture/seasons
export const createSeasonHandler = asyncHandler(async (req: Request, res: Response) => {
  const season = await agricultureService.createSeason(req.body);
  sendSuccess(res, season, 201);
});

// GET /agriculture/seasons
export const getSeasonsHandler = asyncHandler(async (req: Request, res: Response) => {
  const seasons = await agricultureService.getSeasons();
  sendSuccess(res, seasons);
});

export const getSeasonHandler = asyncHandler(async (req: Request, res: Response) => {
  const season = await agricultureService.getSeasonById(req.params.id);
  sendSuccess(res, season);
});

export const updateSeasonHandler = asyncHandler(async (req: Request, res: Response) => {
  const season = await agricultureService.updateSeason(req.params.id, req.body);
  sendSuccess(res, season);
});

export const deleteSeasonHandler = asyncHandler(async (req: Request, res: Response) => {
  await agricultureService.deleteSeason(req.params.id);
  sendSuccess(res, { deleted: true });
});

// ─── Expenses ─────────────────────────────────────────────────────────────────

// ✅ GET /agriculture/seasons/:id/expenses
export const getExpensesHandler = asyncHandler(async (req: Request, res: Response) => {
  const expenses = await agricultureService.getExpenses(req.params.id);
  sendSuccess(res, expenses);
});

// ✅ POST /agriculture/seasons/:id/expenses
export const addExpenseHandler = asyncHandler(async (req: Request, res: Response) => {
  const expense = await agricultureService.addExpenseToSeason(req.params.id, req.body);
  sendSuccess(res, expense, 201);
});

// ✅ DELETE /agriculture/seasons/:id/expenses/:expenseId
export const deleteExpenseHandler = asyncHandler(async (req: Request, res: Response) => {
  await agricultureService.deleteExpense(req.params.id, req.params.expenseId);
  sendSuccess(res, { deleted: true });
});

// ─── Resources ────────────────────────────────────────────────────────────────

// ✅ GET /agriculture/seasons/:id/resources
export const getResourcesHandler = asyncHandler(async (req: Request, res: Response) => {
  const resources = await agricultureService.getResources(req.params.id);
  sendSuccess(res, resources);
});

// ✅ POST /agriculture/seasons/:id/resources
export const addResourceHandler = asyncHandler(async (req: Request, res: Response) => {
  const resource = await agricultureService.addResource(req.params.id, req.body);
  sendSuccess(res, resource, 201);
});

// ✅ DELETE /agriculture/seasons/:id/resources/:resourceId
export const deleteResourceHandler = asyncHandler(async (req: Request, res: Response) => {
  await agricultureService.deleteResource(req.params.id, req.params.resourceId);
  sendSuccess(res, { deleted: true });
});

// ─── Yields ───────────────────────────────────────────────────────────────────

// ✅ GET /agriculture/seasons/:id/yields
export const getYieldsHandler = asyncHandler(async (req: Request, res: Response) => {
  const yields = await agricultureService.getYields(req.params.id);
  sendSuccess(res, yields);
});

// ✅ POST /agriculture/seasons/:id/yields
export const addYieldHandler = asyncHandler(async (req: Request, res: Response) => {
  const yieldRecord = await agricultureService.addYieldToSeason(req.params.id, req.body);
  sendSuccess(res, yieldRecord, 201);
});

// ✅ DELETE /agriculture/seasons/:id/yields/:yieldId
export const deleteYieldHandler = asyncHandler(async (req: Request, res: Response) => {
  await agricultureService.deleteYield(req.params.id, req.params.yieldId);
  sendSuccess(res, { deleted: true });
});