"use strict";
// server/src/routes/dairy.routes.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dairy = __importStar(require("../controllers/dairy.controller"));
const router = (0, express_1.Router)();
// ── Herd summary ──────────────────────────────────────────────────────────────
router.get('/herd/summary', dairy.getHerdSummary);
// ── Animals CRUD ──────────────────────────────────────────────────────────────
router.get('/animals', dairy.getAnimals);
router.post('/animals', dairy.createAnimal);
router.get('/animals/:id', dairy.getAnimal);
router.put('/animals/:id', dairy.updateAnimal);
router.delete('/animals/:id', dairy.deleteAnimal);
// ── Milk ──────────────────────────────────────────────────────────────────────
// NOTE: /milk/summary must be registered BEFORE /milk/:recordId
// otherwise Express matches "summary" as a recordId param
router.get('/animals/:id/milk/summary', dairy.getMilkSummary);
router.get('/animals/:id/milk', dairy.getMilkRecords);
router.post('/animals/:id/milk', dairy.createMilkRecord);
router.delete('/animals/:id/milk/:recordId', dairy.deleteMilkRecord);
// ── Lactations ────────────────────────────────────────────────────────────────
router.get('/animals/:id/lactations', dairy.getLactations);
router.post('/animals/:id/lactations', dairy.createLactation);
router.put('/animals/:id/lactations/:lacId', dairy.updateLactation);
// ── Reproduction ──────────────────────────────────────────────────────────────
router.get('/animals/:id/reproduction', dairy.getReproduction);
router.post('/animals/:id/reproduction/ai', dairy.createAIRecord);
router.put('/animals/:id/reproduction/ai/:aiId', dairy.updateAIRecord);
router.post('/animals/:id/reproduction/calving', dairy.createCalving);
// ── Health ────────────────────────────────────────────────────────────────────
router.get('/animals/:id/health', dairy.getHealth);
router.post('/animals/:id/health/vaccinations', dairy.createVaccination);
router.put('/animals/:id/health/vaccinations/:vId', dairy.updateVaccination);
router.post('/animals/:id/health/treatments', dairy.createTreatment);
router.put('/animals/:id/health/treatments/:tId', dairy.updateTreatment);
// ── Feeding ───────────────────────────────────────────────────────────────────
router.get('/animals/:id/feeding', dairy.getFeeding);
router.post('/animals/:id/feeding/records', dairy.createFeedRecord);
router.put('/animals/:id/feeding/plan', dairy.upsertFeedingPlan);
// ── Profitability ─────────────────────────────────────────────────────────────
router.get('/animals/:id/profitability', dairy.getProfitability);
// ── Fodder ────────────────────────────────────────────────────────────────────
router.get('/fodder/crops', dairy.getFodderCrops);
router.post('/fodder/crops', dairy.createFodderCrop);
router.put('/fodder/crops/:id', dairy.updateFodderCrop);
router.get('/fodder/stock', dairy.getFodderStock);
router.post('/fodder/stock', dairy.createFodderStock);
router.put('/fodder/stock/:id', dairy.updateFodderStock);
exports.default = router;
