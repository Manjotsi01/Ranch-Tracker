// Path: ranch-tracker/server/src/routes/agriculture.routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import {
  getAllCropsHandler,
  getCropHandler,
  getCropSeasonsHandler,
  createSeasonHandler,
  getSeasonsHandler,
  getSeasonHandler,
  updateSeasonHandler,
  deleteSeasonHandler,
  getExpensesHandler,
  addExpenseHandler,
  deleteExpenseHandler,
  getResourcesHandler,
  addResourceHandler,
  deleteResourceHandler,
  getYieldsHandler,
  addYieldHandler,
  deleteYieldHandler,
} from '../controllers/agriculture.controller';

const router = Router();

// ─── Validation schema ────────────────────────────────────────────────────────
const createSeasonSchema = z.object({
  body: z.object({
    cropId:    z.string({ required_error: 'cropId is required' }),
    cropName:  z.string().optional(),
    label:     z.string({ required_error: 'label is required' }),

    startDate: z.string({ required_error: 'startDate is required' })
                .transform((s) => new Date(s)),
    endDate:   z.string().optional().transform((s) => s ? new Date(s) : undefined),

    areaSown:  z.coerce.number({ required_error: 'areaSown is required' }),
    areaUnit:  z.string().optional().default('acres'),

    variety:   z.string().optional(),
    budget:    z.coerce.number().optional().default(0),
    notes:     z.string().optional(),

    status: z.enum(['PLANNED','ACTIVE','HARVESTED','COMPLETED','ABANDONED'])
              .optional()
              .default('PLANNED'),
  }),
});

// ─── Crop routes ──────────────────────────────────────────────────────────────
router.get('/crops',                    getAllCropsHandler);
router.get('/crops/:cropId',            getCropHandler);
router.get('/crops/:cropId/seasons',    getCropSeasonsHandler);

// ─── Season routes ────────────────────────────────────────────────────────────
router.get('/seasons',                  getSeasonsHandler);
router.post('/seasons', validate(createSeasonSchema), createSeasonHandler);
router.get('/seasons/:id',              getSeasonHandler);
router.put('/seasons/:id',              updateSeasonHandler);
router.delete('/seasons/:id',           deleteSeasonHandler);

// ─── Expense routes ───────────────────────────────────────────────────────────
router.get('/seasons/:id/expenses',                       getExpensesHandler);
router.post('/seasons/:id/expenses',                      addExpenseHandler);
router.delete('/seasons/:id/expenses/:expenseId',         deleteExpenseHandler);

// ─── Resource routes ──────────────────────────────────────────────────────────
router.get('/seasons/:id/resources',                      getResourcesHandler);
router.post('/seasons/:id/resources',                     addResourceHandler);
router.delete('/seasons/:id/resources/:resourceId',       deleteResourceHandler);

// ─── Yield routes ─────────────────────────────────────────────────────────────
router.get('/seasons/:id/yields',                         getYieldsHandler);
router.post('/seasons/:id/yields',                        addYieldHandler);
router.delete('/seasons/:id/yields/:yieldId',             deleteYieldHandler);

export default router;