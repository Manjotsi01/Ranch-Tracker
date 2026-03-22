// server/src/controllers/dairy.controller.ts
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { sendSuccess, sendError } from '../utils/response';
import * as svc from '../services/dairy.service';

// ── Herd ──────────────────────────────────────────────────────────────────────
export const getHerdSummary = asyncHandler(async (_req: Request, res: Response) => {
  const data = await svc.getHerdSummary();
  sendSuccess(res, data);
});

// ── Animals ───────────────────────────────────────────────────────────────────
export const getAnimals = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.getAnimals(req.query as Record<string, string>);
  sendSuccess(res, data);
});

export const getAnimal = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.getAnimalById(req.params.id);
  if (!data) return sendError(res, 'Animal not found', 404);
  sendSuccess(res, data);
});

export const createAnimal = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.createAnimal(req.body);
  sendSuccess(res, data, 201);
});

export const updateAnimal = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.updateAnimal(req.params.id, req.body);
  if (!data) return sendError(res, 'Animal not found', 404);
  sendSuccess(res, data);
});

export const deleteAnimal = asyncHandler(async (req: Request, res: Response) => {
  await svc.deleteAnimal(req.params.id);
  sendSuccess(res, { deleted: true });
});

// ── Milk ──────────────────────────────────────────────────────────────────────
export const getMilkRecords = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.getMilkRecords(req.params.id, req.query as Record<string, string>);
  sendSuccess(res, data);
});

export const getMilkSummary = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.getMilkSummary(req.params.id, req.query as Record<string, string>);
  sendSuccess(res, data);
});

export const createMilkRecord = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.createMilkRecord(req.params.id, req.body);
  sendSuccess(res, data, 201);
});

export const deleteMilkRecord = asyncHandler(async (req: Request, res: Response) => {
  await svc.deleteMilkRecord(req.params.id, req.params.recordId);
  sendSuccess(res, { deleted: true });
});

// ── Lactations ────────────────────────────────────────────────────────────────
export const getLactations = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.getLactations(req.params.id);
  sendSuccess(res, data);
});

export const createLactation = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.createLactation(req.params.id, req.body);
  sendSuccess(res, data, 201);
});

export const updateLactation = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.updateLactation(req.params.id, req.params.lacId, req.body);
  sendSuccess(res, data);
});

// ── Reproduction ──────────────────────────────────────────────────────────────
export const getReproduction = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.getReproduction(req.params.id);
  sendSuccess(res, data);
});

export const createAIRecord = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.createAIRecord(req.params.id, req.body);
  sendSuccess(res, data, 201);
});

export const updateAIRecord = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.updateAIRecord(req.params.id, req.params.aiId, req.body);
  sendSuccess(res, data);
});

export const createCalving = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.createCalving(req.params.id, req.body);
  sendSuccess(res, data, 201);
});

// ── Health ────────────────────────────────────────────────────────────────────
export const getHealth = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.getHealth(req.params.id);
  sendSuccess(res, data);
});

export const createVaccination = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.createVaccination(req.params.id, req.body);
  sendSuccess(res, data, 201);
});

export const updateVaccination = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.updateVaccination(req.params.id, req.params.vId, req.body);
  sendSuccess(res, data);
});

export const createTreatment = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.createTreatment(req.params.id, req.body);
  sendSuccess(res, data, 201);
});

export const updateTreatment = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.updateTreatment(req.params.id, req.params.tId, req.body);
  sendSuccess(res, data);
});

// ── Feeding ───────────────────────────────────────────────────────────────────
export const getFeeding = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.getFeeding(req.params.id);
  sendSuccess(res, data);
});

export const createFeedRecord = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.createFeedRecord(req.params.id, req.body);
  sendSuccess(res, data, 201);
});

export const upsertFeedingPlan = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.upsertFeedingPlan(req.params.id, req.body);
  sendSuccess(res, data);
});

// ── Profitability ─────────────────────────────────────────────────────────────
export const getProfitability = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.getProfitability(req.params.id, req.query as Record<string, string>);
  sendSuccess(res, data);
});

// ── Fodder ────────────────────────────────────────────────────────────────────
export const getFodderCrops = asyncHandler(async (_req: Request, res: Response) => {
  const data = await svc.getFodderCrops();
  sendSuccess(res, data);
});

export const createFodderCrop = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.createFodderCrop(req.body);
  sendSuccess(res, data, 201);
});

export const updateFodderCrop = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.updateFodderCrop(req.params.id, req.body);
  sendSuccess(res, data);
});

export const getFodderStock = asyncHandler(async (_req: Request, res: Response) => {
  const data = await svc.getFodderStock();
  sendSuccess(res, data);
});

export const createFodderStock = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.createFodderStock(req.body);
  sendSuccess(res, data, 201);
});

export const updateFodderStock = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.updateFodderStock(req.params.id, req.body);
  sendSuccess(res, data);
});