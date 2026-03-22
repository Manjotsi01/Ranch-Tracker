"use strict";
// Path: ranch-tracker/server/src/routes/agriculture.routes.ts
//
// ✅ FIXES to Zod createSeasonSchema:
//  1. Added endDate, areaUnit, budget, notes, status — all were missing, causing
//     Zod to strip them silently (or reject with 500 if strict mode is on)
//  2. areaSown now accepts string OR number — HTML inputs always send strings,
//     so coerce to number to avoid "Expected number, received string" errors
//  3. Added cropName as optional (service uses it for aggregation display)
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const validate_1 = require("../middleware/validate");
const agriculture_controller_1 = require("../controllers/agriculture.controller");
const router = (0, express_1.Router)();
// ─── Validation schema ────────────────────────────────────────────────────────
const createSeasonSchema = zod_1.z.object({
    body: zod_1.z.object({
        cropId: zod_1.z.string({ required_error: 'cropId is required' }),
        cropName: zod_1.z.string().optional(),
        label: zod_1.z.string({ required_error: 'label is required' }),
        startDate: zod_1.z.string({ required_error: 'startDate is required' })
            .transform((s) => new Date(s)),
        endDate: zod_1.z.string().optional().transform((s) => s ? new Date(s) : undefined),
        // coerce handles HTML form strings like "5.5" → 5.5
        areaSown: zod_1.z.coerce.number({ required_error: 'areaSown is required' }),
        areaUnit: zod_1.z.string().optional().default('acres'),
        variety: zod_1.z.string().optional(),
        budget: zod_1.z.coerce.number().optional().default(0),
        notes: zod_1.z.string().optional(),
        status: zod_1.z.enum(['PLANNED', 'ACTIVE', 'HARVESTED', 'COMPLETED', 'ABANDONED'])
            .optional()
            .default('PLANNED'),
    }),
});
// ─── Crop routes ──────────────────────────────────────────────────────────────
router.get('/crops', agriculture_controller_1.getAllCropsHandler);
router.get('/crops/:cropId', agriculture_controller_1.getCropHandler);
router.get('/crops/:cropId/seasons', agriculture_controller_1.getCropSeasonsHandler);
// ─── Season routes ────────────────────────────────────────────────────────────
router.get('/seasons', agriculture_controller_1.getSeasonsHandler);
router.post('/seasons', (0, validate_1.validate)(createSeasonSchema), agriculture_controller_1.createSeasonHandler);
router.get('/seasons/:id', agriculture_controller_1.getSeasonHandler);
router.put('/seasons/:id', agriculture_controller_1.updateSeasonHandler);
router.delete('/seasons/:id', agriculture_controller_1.deleteSeasonHandler);
// ─── Expense routes ───────────────────────────────────────────────────────────
router.get('/seasons/:id/expenses', agriculture_controller_1.getExpensesHandler);
router.post('/seasons/:id/expenses', agriculture_controller_1.addExpenseHandler);
router.delete('/seasons/:id/expenses/:expenseId', agriculture_controller_1.deleteExpenseHandler);
// ─── Resource routes ──────────────────────────────────────────────────────────
router.get('/seasons/:id/resources', agriculture_controller_1.getResourcesHandler);
router.post('/seasons/:id/resources', agriculture_controller_1.addResourceHandler);
router.delete('/seasons/:id/resources/:resourceId', agriculture_controller_1.deleteResourceHandler);
// ─── Yield routes ─────────────────────────────────────────────────────────────
router.get('/seasons/:id/yields', agriculture_controller_1.getYieldsHandler);
router.post('/seasons/:id/yields', agriculture_controller_1.addYieldHandler);
router.delete('/seasons/:id/yields/:yieldId', agriculture_controller_1.deleteYieldHandler);
exports.default = router;
