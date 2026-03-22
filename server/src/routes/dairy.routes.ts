// server/src/routes/dairy.routes.ts

import { Router } from 'express';
import * as dairy from '../controllers/dairy.controller';

const router = Router();
router.get('/herd/summary', dairy.getHerdSummary);

// ── Animals CRUD ──────────────────────────────────────────────────────────────
router.get('/animals',     dairy.getAnimals);
router.post('/animals',    dairy.createAnimal);
router.get('/animals/:id', dairy.getAnimal);
router.put('/animals/:id', dairy.updateAnimal);
router.delete('/animals/:id', dairy.deleteAnimal);

// ── Milk ──────────────────────────────────────────────────────────────────────
router.get('/animals/:id/milk/summary',        dairy.getMilkSummary);
router.get('/animals/:id/milk',                dairy.getMilkRecords);
router.post('/animals/:id/milk',               dairy.createMilkRecord);
router.delete('/animals/:id/milk/:recordId',   dairy.deleteMilkRecord);

// ── Lactations ────────────────────────────────────────────────────────────────
router.get('/animals/:id/lactations',          dairy.getLactations);
router.post('/animals/:id/lactations',         dairy.createLactation);
router.put('/animals/:id/lactations/:lacId',   dairy.updateLactation);

// ── Reproduction ──────────────────────────────────────────────────────────────
router.get('/animals/:id/reproduction',            dairy.getReproduction);
router.post('/animals/:id/reproduction/ai',        dairy.createAIRecord);
router.put('/animals/:id/reproduction/ai/:aiId',   dairy.updateAIRecord);
router.post('/animals/:id/reproduction/calving',   dairy.createCalving);

// ── Health ────────────────────────────────────────────────────────────────────
router.get('/animals/:id/health',                        dairy.getHealth);
router.post('/animals/:id/health/vaccinations',          dairy.createVaccination);
router.put('/animals/:id/health/vaccinations/:vId',      dairy.updateVaccination);
router.post('/animals/:id/health/treatments',            dairy.createTreatment);
router.put('/animals/:id/health/treatments/:tId',        dairy.updateTreatment);

// ── Feeding ───────────────────────────────────────────────────────────────────
router.get('/animals/:id/feeding',           dairy.getFeeding);
router.post('/animals/:id/feeding/records',  dairy.createFeedRecord);
router.put('/animals/:id/feeding/plan',      dairy.upsertFeedingPlan);

// ── Profitability ─────────────────────────────────────────────────────────────
router.get('/animals/:id/profitability', dairy.getProfitability);

// ── Fodder ────────────────────────────────────────────────────────────────────
router.get('/fodder/crops',      dairy.getFodderCrops);
router.post('/fodder/crops',     dairy.createFodderCrop);
router.put('/fodder/crops/:id',  dairy.updateFodderCrop);

router.get('/fodder/stock',      dairy.getFodderStock);
router.post('/fodder/stock',     dairy.createFodderStock);
router.put('/fodder/stock/:id',  dairy.updateFodderStock);

export default router;