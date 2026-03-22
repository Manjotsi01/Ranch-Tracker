const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src');

const dirs = [
  'config', 'controllers', 'services', 'models', 'routes', 'middleware', 'utils'
];

dirs.forEach(d => fs.mkdirSync(path.join(baseDir, d), { recursive: true }));

const files = {
  'config/db.ts': `import mongoose from 'mongoose';
import logger from '../utils/logger';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ranchtracker');
    logger.info(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error: any) {
    logger.error(\`Error: \${error.message}\`);
    process.exit(1);
  }
};
`,

  'utils/logger.ts': `export const logger = {
  info: (msg: string) => console.log(\`[INFO] \${new Date().toISOString()} - \${msg}\`),
  error: (msg: string) => console.error(\`[ERROR] \${new Date().toISOString()} - \${msg}\`),
  warn: (msg: string) => console.warn(\`[WARN] \${new Date().toISOString()} - \${msg}\`)
};
export default logger;
`,

  'utils/response.ts': `import { Response } from 'express';

export const sendSuccess = (res: Response, data: any, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data
  });
};

export const sendError = (res: Response, message: string, errorCode: string = 'SERVER_ERROR', statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    message,
    errorCode
  });
};
`,

  'middleware/errorHandler.ts': `import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack || err.message);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errorCode = err.errorCode || 'SERVER_ERROR';

  res.status(statusCode).json({
    success: false,
    message,
    errorCode
  });
};
`,

  'middleware/validate.ts': `import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendError } from '../utils/response';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(res, error.errors.map(e => e.message).join(', '), 'VALIDATION_ERROR', 400);
      }
      next(error);
    }
  };
};
`,

  'server.ts': `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
// Routes
import agricultureRoutes from './routes/agriculture.routes';
import dairyRoutes from './routes/dairy.routes';
import shopRoutes from './routes/shop.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connect
connectDB();

// API Routes
app.use('/api/agriculture', agricultureRoutes);
app.use('/api/dairy', dairyRoutes);
app.use('/api/shop', shopRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`,

  // AGRICULTURE
  'models/Field.ts': `import mongoose from 'mongoose';
const fieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  area: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });
export default mongoose.model('Field', fieldSchema);`,

  'models/Season.ts': `import mongoose from 'mongoose';
const seasonSchema = new mongoose.Schema({
  cropId: { type: String, required: true }, // Referencing crop provided
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  area: { type: Number, required: true },
  variety: { type: String },
  status: { type: String, enum: ['Active', 'Completed'], default: 'Active' },
  totalExpense: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  netProfit: { type: Number, default: 0 },
  ROI: { type: Number, default: 0 }
}, { timestamps: true });
export default mongoose.model('Season', seasonSchema);`,

  'models/SeasonExpense.ts': `import mongoose from 'mongoose';
const seasonExpenseSchema = new mongoose.Schema({
  seasonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
  operation: { type: String, required: true, enum: ['land preparation', 'seed purchase', 'fertilizer', 'irrigation', 'labour', 'pest control', 'other'] },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  description: String
}, { timestamps: true });
export default mongoose.model('SeasonExpense', seasonExpenseSchema);`,

  'models/YieldRecord.ts': `import mongoose from 'mongoose';
const yieldRecordSchema = new mongoose.Schema({
  seasonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
  quantity: { type: Number, required: true }, // kg or tons
  date: { type: Date, default: Date.now },
  revenueRealized: { type: Number, default: 0 }
}, { timestamps: true });
export default mongoose.model('YieldRecord', yieldRecordSchema);`,

  'services/agriculture.service.ts': `import Season from '../models/Season';
import SeasonExpense from '../models/SeasonExpense';
import YieldRecord from '../models/YieldRecord';
import Field from '../models/Field';

export const createSeason = async (data: any) => {
  const season = new Season(data);
  return await season.save();
};

export const addExpenseToSeason = async (seasonId: string, expenseData: any) => {
  const expense = new SeasonExpense({ seasonId, ...expenseData });
  await expense.save();

  // Auto update season stats
  const season = await Season.findById(seasonId);
  if (season) {
    season.totalExpense += expense.amount;
    season.netProfit = season.totalRevenue - season.totalExpense;
    if (season.totalExpense > 0) {
      season.ROI = (season.netProfit / season.totalExpense) * 100;
    }
    await season.save();
  }
  return expense;
};

export const addYieldToSeason = async (seasonId: string, yieldData: any) => {
  const yieldRecord = new YieldRecord({ seasonId, ...yieldData });
  await yieldRecord.save();

  const season = await Season.findById(seasonId);
  if (season) {
    season.totalRevenue += yieldData.revenueRealized || 0;
    season.netProfit = season.totalRevenue - season.totalExpense;
    if (season.totalExpense > 0) {
      season.ROI = (season.netProfit / season.totalExpense) * 100;
    }
    await season.save();
  }
  return yieldRecord;
};

export const getSeasonROIRealtime = async (seasonId: string) => {
  return await Season.findById(seasonId);
};
`,

  'controllers/agriculture.controller.ts': `import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { sendSuccess } from '../utils/response';
import * as agricultureService from '../services/agriculture.service';

export const createSeasonHandler = asyncHandler(async (req: Request, res: Response) => {
  const season = await agricultureService.createSeason(req.body);
  sendSuccess(res, season, 201);
});

export const addSeasonExpenseHandler = asyncHandler(async (req: Request, res: Response) => {
  const expense = await agricultureService.addExpenseToSeason(req.params.id, req.body);
  sendSuccess(res, expense, 201);
});

export const addYieldHandler = asyncHandler(async (req: Request, res: Response) => {
  const yieldRecord = await agricultureService.addYieldToSeason(req.params.id, req.body);
  sendSuccess(res, yieldRecord, 201);
});
`,

  'routes/agriculture.routes.ts': `import { Router } from 'express';
import { createSeasonHandler, addSeasonExpenseHandler, addYieldHandler } from '../controllers/agriculture.controller';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const createSeasonSchema = z.object({
  body: z.object({
    cropId: z.string({ required_error: 'cropId is required' }),
    startDate: z.string().transform(str => new Date(str)),
    area: z.number({ required_error: 'area is required' }),
    variety: z.string().optional()
  })
});

router.post('/season', validate(createSeasonSchema), createSeasonHandler);
router.post('/season/:id/expense', addSeasonExpenseHandler);
router.post('/season/:id/yield', addYieldHandler);

export default router;
`,


  // DAIRY
  'models/Animal.ts': `import mongoose from 'mongoose';
const animalSchema = new mongoose.Schema({
  animalId: { type: String, required: true, unique: true },
  tagNumber: { type: String, required: true },
  breed: { type: String, required: true },
  bloodline: {
    dam: { type: String },
    sire: { type: String },
    geneticNotes: { type: String }
  },
  status: { type: String, enum: ['Calf', 'Heifer', 'Milking', 'Dry', 'Sold', 'Dead'], default: 'Calf' },
  feedingCost: { type: Number, default: 0 },
  medicalCost: { type: Number, default: 0 }
}, { timestamps: true });
export default mongoose.model('Animal', animalSchema);`,

  'models/MilkRecord.ts': `import mongoose from 'mongoose';
const milkRecordSchema = new mongoose.Schema({
  animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  date: { type: Date, required: true, default: Date.now },
  morning: { type: Number, default: 0 },
  evening: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
}, { timestamps: true });
// Proper indexes for milk_records -> animalId + date
milkRecordSchema.index({ animalId: 1, date: 1 }, { unique: true });
export default mongoose.model('MilkRecord', milkRecordSchema);`,

  'models/HealthRecord.ts': `import mongoose from 'mongoose';
const healthRecordSchema = new mongoose.Schema({
  animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  date: { type: Date, default: Date.now },
  condition: String,
  treatment: String,
  cost: { type: Number, default: 0 }
}, { timestamps: true });
export default mongoose.model('HealthRecord', healthRecordSchema);`,

  'models/ReproductionRecord.ts': `import mongoose from 'mongoose';
const reproductionRecordSchema = new mongoose.Schema({
  animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['AI', 'Natural', 'Calving', 'Heat'] },
  notes: String,
  cost: { type: Number, default: 0 }
}, { timestamps: true });
export default mongoose.model('ReproductionRecord', reproductionRecordSchema);`,

  'models/FeedRecord.ts': `import mongoose from 'mongoose';
const feedRecordSchema = new mongoose.Schema({
  animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  date: { type: Date, default: Date.now },
  fodderType: { type: String, enum: ['green', 'dry', 'silage', 'supplements'] },
  quantity: { type: Number, required: true },
  costPerKg: { type: Number, required: true }
}, { timestamps: true });
export default mongoose.model('FeedRecord', feedRecordSchema);`,

  'models/FodderStock.ts': `import mongoose from 'mongoose';
const fodderStockSchema = new mongoose.Schema({
  type: { type: String, enum: ['green', 'dry', 'silage', 'supplements'], required: true, unique: true },
  stockKg: { type: Number, default: 0 },
  costPerKg: { type: Number, default: 0 }
}, { timestamps: true });
export default mongoose.model('FodderStock', fodderStockSchema);`,

  'services/dairy.service.ts': `import Animal from '../models/Animal';
import MilkRecord from '../models/MilkRecord';

export const createAnimal = async (data: any) => {
  const animal = new Animal(data);
  return await animal.save();
};

export const addMilkRecord = async (animalId: string, data: any) => {
  const total = (data.morning || 0) + (data.evening || 0);
  const record = new MilkRecord({ animalId, total, ...data });
  await record.save();
  return record;
};

export const getAnimalStats = async (animalId: string) => {
  const records = await MilkRecord.find({ animalId });
  const animal = await Animal.findById(animalId);
  // simplified aggregate
  const totalMilk = records.reduce((acc, r) => acc + r.total, 0);
  // you can return more computed properties...
  return { animal, totalMilk };
};
`,

  'controllers/dairy.controller.ts': `import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { sendSuccess } from '../utils/response';
import * as dairyService from '../services/dairy.service';

export const createAnimalHandler = asyncHandler(async (req: Request, res: Response) => {
  const animal = await dairyService.createAnimal(req.body);
  sendSuccess(res, animal, 201);
});

export const addMilkRecordHandler = asyncHandler(async (req: Request, res: Response) => {
  const record = await dairyService.addMilkRecord(req.params.id, req.body);
  sendSuccess(res, record, 201);
});
`,

  'routes/dairy.routes.ts': `import { Router } from 'express';
import { createAnimalHandler, addMilkRecordHandler } from '../controllers/dairy.controller';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const createAnimalSchema = z.object({
  body: z.object({
    animalId: z.string({ required_error: 'animalId is required' }),
    tagNumber: z.string({ required_error: 'tagNumber is required' }),
    breed: z.string({ required_error: 'breed is required' })
  })
});

router.post('/animal', validate(createAnimalSchema), createAnimalHandler);
router.post('/animal/:id/milk', addMilkRecordHandler);

export default router;
`,


  // SHOP & PROCESSING
  'models/Product.ts': `import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. Paneer, Milk
  type: { type: String, required: true }, // 'finished_goods', 'raw_materials'
  description: String
}, { timestamps: true });
export default mongoose.model('Product', productSchema);`,

  'models/Batch.ts': `import mongoose from 'mongoose';
const batchSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productionDate: { type: Date, required: true, default: Date.now },
  expiryDate: { type: Date, required: true },
  input: {
    milkLiters: Number,
    milkSource: String,
    fat: Number,
    SNF: Number,
    milkCost: Number
  },
  costs: {
    labor: { type: Number, default: 0 },
    fuel: { type: Number, default: 0 },
    ingredients: { type: Number, default: 0 },
    packaging: { type: Number, default: 0 },
    utilities: { type: Number, default: 0 }
  },
  output: {
    quantityProduced: { type: Number, required: true },
    wastage: { type: Number, default: 0 }
  },
  pricing: {
    costPerUnit: { type: Number, default: 0 },
    sellingPricePerUnit: { type: Number, required: true },
    profitMargin: { type: Number, default: 0 }
  },
  stockRemaining: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Depleted', 'Expired'], default: 'Active' }
}, { timestamps: true });
export default mongoose.model('Batch', batchSchema);`,

  'models/Sale.ts': `import mongoose from 'mongoose';
const saleSchema = new mongoose.Schema({
  dateTime: { type: Date, default: Date.now, required: true },
  paymentMode: { type: String, enum: ['Cash', 'UPI', 'Card', 'Credit'], required: true },
  totalAmount: { type: Number, required: true }
}, { timestamps: true });

saleSchema.index({ dateTime: -1 });
export default mongoose.model('Sale', saleSchema);`,

  'models/SaleItem.ts': `import mongoose from 'mongoose';
const saleItemSchema = new mongoose.Schema({
  saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  quantity: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  subtotal: { type: Number, required: true }
}, { timestamps: true });
export default mongoose.model('SaleItem', saleItemSchema);`,

  'services/shop.service.ts': `import mongoose from 'mongoose';
import Batch from '../models/Batch';
import Sale from '../models/Sale';
import SaleItem from '../models/SaleItem';

export const createBatch = async (data: any) => {
  // Use MongoDB transaction for batch creation
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Milk must exist before creating processing batch (simulated check here)
    if (data.input && data.input.milkLiters <= 0) {
      throw new Error('Milk must exist before creating processing batch.');
    }

    const costs = data.costs || {};
    const totalCost = (data.input?.milkCost || 0) + 
      (costs.labor || 0) + (costs.fuel || 0) + 
      (costs.ingredients || 0) + (costs.packaging || 0) + (costs.utilities || 0);
    
    let costPerUnit = 0;
    if (data.output?.quantityProduced > 0) {
      costPerUnit = totalCost / data.output.quantityProduced;
    }
    
    let profitMargin = 0;
    if (data.pricing?.sellingPricePerUnit > costPerUnit) {
      profitMargin = ((data.pricing.sellingPricePerUnit - costPerUnit) / costPerUnit) * 100;
    }

    const batchData = {
      ...data,
      pricing: {
        ...data.pricing,
        costPerUnit,
        profitMargin
      },
      stockRemaining: data.output?.quantityProduced
    };

    const batch = new Batch(batchData);
    await batch.save({ session });

    await session.commitTransaction();
    session.endSession();
    return batch;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const createPosSale = async (items: any[], paymentMode: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let totalAmount = 0;
    const saleItems = [];

    // Validations & Stock deduction
    for (const item of items) {
      let qtyNeeded = item.quantity;

      // Batch sale must use FIFO based on expiryDate
      // Expired batch must be flagged and blocked from sale.
      const batches = await Batch.find({
        productId: item.productId,
        stockRemaining: { $gt: 0 },
        expiryDate: { $gt: new Date() },
        status: 'Active'
      }).sort({ expiryDate: 1 }).session(session);

      if (batches.length === 0) {
        throw new Error(\`No active/unexpired batches found for product \${item.productId}\`);
      }

      let totalStock = batches.reduce((acc, b) => acc + b.stockRemaining, 0);
      if (totalStock < qtyNeeded) {
        throw new Error(\`Insufficient stock for product \${item.productId}\`);
      }

      for (const batch of batches) {
        if (qtyNeeded <= 0) break;

        let deductQty = Math.min(batch.stockRemaining, qtyNeeded);
        batch.stockRemaining -= deductQty;
        qtyNeeded -= deductQty;

        if (batch.stockRemaining === 0) {
          batch.status = 'Depleted';
        }

        await batch.save({ session });

        const subtotal = deductQty * batch.pricing.sellingPricePerUnit;
        totalAmount += subtotal;

        saleItems.push({
          productId: item.productId,
          batchId: batch._id,
          quantity: deductQty,
          pricePerUnit: batch.pricing.sellingPricePerUnit,
          subtotal
        });
      }
    }

    const sale = new Sale({
      paymentMode,
      totalAmount
    });
    
    await sale.save({ session });

    for (const sItem of saleItems) {
      const saleItemRec = new SaleItem({
        saleId: sale._id,
        ...sItem
      });
      await saleItemRec.save({ session });
    }

    await session.commitTransaction();
    session.endSession();
    return { sale, items: saleItems };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
`,

  'controllers/shop.controller.ts': `import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { sendSuccess } from '../utils/response';
import * as shopService from '../services/shop.service';

export const createBatchHandler = asyncHandler(async (req: Request, res: Response) => {
  const batch = await shopService.createBatch(req.body);
  sendSuccess(res, batch, 201);
});

export const posSaleHandler = asyncHandler(async (req: Request, res: Response) => {
  const { items, paymentMode } = req.body;
  const result = await shopService.createPosSale(items, paymentMode);
  sendSuccess(res, result, 201);
});
`,

  'routes/shop.routes.ts': `import { Router } from 'express';
import { createBatchHandler, posSaleHandler } from '../controllers/shop.controller';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const createBatchSchema = z.object({
  body: z.object({
    productId: z.string({ required_error: 'productId is required' }),
    expiryDate: z.string().transform(str => new Date(str)),
    output: z.object({
      quantityProduced: z.number({ required_error: 'quantityProduced is required' }).min(1)
    }),
    pricing: z.object({
      sellingPricePerUnit: z.number({ required_error: 'sellingPricePerUnit is required' }).min(0)
    })
  })
});

const posSaleSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      productId: z.string(),
      quantity: z.number().min(1)
    })).min(1),
    paymentMode: z.enum(['Cash', 'UPI', 'Card', 'Credit'])
  })
});

router.post('/batch', validate(createBatchSchema), createBatchHandler);
router.post('/sale', validate(posSaleSchema), posSaleHandler);

export default router;
`
};

for (const [filepath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(baseDir, filepath), content);
}

console.log('Project files generated successfully.');
