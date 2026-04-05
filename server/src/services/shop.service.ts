import mongoose from 'mongoose';
import Batch from '../models/Batch';
import { SaleModel as Sale } from '../models/Sale';

// ── Helper ────────────────────────────────────────────────────────────────────

const startOfDay = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const endOfDay = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

// ── Stats ─────────────────────────────────────────────────────────────────────

export const getStats = async () => {
  const today = startOfDay();

  const [totalBatches, activeBatches, todaySales, totalRevenue] = await Promise.all([
    Batch.countDocuments(),
    Batch.countDocuments({ status: { $in: ['PROCESSING', 'READY'] } }),
    Sale.countDocuments({ dateTime: { $gte: today } }),
    Sale.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
  ]);

  return {
    totalBatches,
    activeBatches,
    todaySales,
    totalRevenue: totalRevenue[0]?.total ?? 0,
  };
};

// ── Batches ───────────────────────────────────────────────────────────────────

export const getBatches = async (
  query: { status?: string; productType?: string } = {},
) => {
  const filter: Record<string, unknown> = {};
  if (query.status)      filter.status      = query.status;
  if (query.productType) filter.productType = query.productType;
  return Batch.find(filter).sort({ productionDate: -1 });
};

export const getBatchById = async (id: string) => {
  return Batch.findById(id);
};

export const createBatch = async (data: unknown) => {
  const batch = await Batch.create(data);
  // Initialise stockRemaining from output if not supplied
  if (!batch.stockRemaining) {
   batch.stockRemaining = (batch.output?.quantityProduced ?? 0) - (batch.output?.wastage ?? 0);
    await batch.save();
  }
  return batch;
};

export const updateBatch = async (id: string, data: unknown) => {
  return Batch.findByIdAndUpdate(id, data as object, {
    new: true,
    runValidators: true,
  });
};

export const deleteBatch = async (id: string) => {
  return Batch.findByIdAndDelete(id);
};

// ── Sales ─────────────────────────────────────────────────────────────────────

export const getSales = async (
  query: {
    page?: number;
    limit?: number;
    from?: string;
    to?: string;
    paymentMode?: string;
  } = {},
) => {
  const page  = Number(query.page  ?? 1);
  const limit = Number(query.limit ?? 20);
  const skip  = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (query.paymentMode) filter.paymentMode = query.paymentMode;
  if (query.from || query.to) {
    filter.dateTime = {
      ...(query.from ? { $gte: new Date(query.from) } : {}),
      ...(query.to   ? { $lte: new Date(query.to)   } : {}),
    };
  }
  const [sales, total] = await Promise.all([
    Sale.find(filter).sort({ dateTime: -1 }).skip(skip).limit(limit),
    Sale.countDocuments(filter),
  ]);

  return { sales, total, page, pages: Math.ceil(total / limit) };
};

export const getSaleById = async (id: string) => {
  return Sale.findById(id);
};

export const createPosSale = async (data: {
  items: { batchId: string; quantity: number; unitPrice: number; discount?: number }[];
  paymentMode: string;
  customerName?: string;
  customerId?: string;
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let totalAmount = 0;
    const saleItems = [];

    for (const item of data.items) {
      const batch = await Batch.findById(item.batchId).session(session);
      if (!batch) throw new Error(`Batch ${item.batchId} not found`);
      if (batch.stockRemaining < item.quantity) {
        throw new Error(
          `Insufficient stock for batch ${batch.batchId}: ` +
          `requested ${item.quantity}, available ${batch.stockRemaining}`,
        );
      }

      const discount = item.discount ?? 0;
      const lineTotal = item.quantity * item.unitPrice * (1 - discount / 100);
      totalAmount += lineTotal;

      saleItems.push({
        productId: batch.productType,
        batchId:   batch._id,
        quantity:  item.quantity,
        unitPrice: item.unitPrice,
        discount,
        total:     lineTotal,
      });

      await Batch.findByIdAndUpdate(
        item.batchId,
        { $inc: { stockRemaining: -item.quantity } },
        { session },
      );
    }

    const [sale] = await Sale.create(
      [
        {
          items:        saleItems,
          totalAmount,
          paymentMode:  data.paymentMode,
          customerName: data.customerName,
          customerId:   data.customerId,
          dateTime:     new Date(),
        },
      ],
      { session },
    );

    await session.commitTransaction();
    return sale;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

// ── Reports ───────────────────────────────────────────────────────────────────

export const getRevenueChart = async (
  query: { period?: 'week' | 'month' | 'year' } = {},
) => {
  const period = query.period ?? 'month';
  const now    = new Date();

  const from =
    period === 'week'  ? new Date(now.getTime() - 7  * 86_400_000) :
    period === 'year'  ? new Date(now.getTime() - 365 * 86_400_000) :
    new Date(now.getTime() - 30 * 86_400_000);

  const fmt =
    period === 'year' ? '%Y-%m' : '%Y-%m-%d';

  return Sale.aggregate([
    { $match: { dateTime: { $gte: from } } },
    {
      $group: {
        _id:     { $dateToString: { format: fmt, date: '$dateTime' } },
        revenue: { $sum: '$totalAmount' },
        count:   { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { date: '$_id', revenue: 1, count: 1, _id: 0 } },
  ]);
};

export const getProductBreakdown = async (
  query: { from?: string; to?: string } = {},
) => {
  const filter: Record<string, unknown> = {};
  if (query.from || query.to) {
    filter.dateTime = {
      ...(query.from ? { $gte: new Date(query.from) } : {}),
      ...(query.to   ? { $lte: new Date(query.to)   } : {}),
    };
  }

  return Sale.aggregate([
    { $match: filter },
    { $unwind: '$items' },
    {
      $group: {
        _id:      '$items.productId',
        revenue:  { $sum: '$items.total' },
        quantity: { $sum: '$items.quantity' },
        orders:   { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
    { $project: { product: '$_id', revenue: 1, quantity: 1, orders: 1, _id: 0 } },
  ]);
};

export const getDailyReport = async (dateStr?: string) => {
  const date = dateStr ? new Date(dateStr) : new Date();
  const from = startOfDay(date);
  const to   = endOfDay(date);

  const [sales, batchesMade] = await Promise.all([
    Sale.find({ dateTime: { $gte: from, $lte: to } }),
    Batch.find({ productionDate: { $gte: from, $lte: to } }),
  ]);

  const totalRevenue    = sales.reduce((s, r) => s + r.totalAmount, 0);
  const totalTransactions = sales.length;
  const byPaymentMode   = sales.reduce<Record<string, number>>((acc, s) => {
    acc[s.paymentMode] = (acc[s.paymentMode] ?? 0) + s.totalAmount;
    return acc;
  }, {});

  return {
    date: from,
    totalRevenue,
    totalTransactions,
    byPaymentMode,
    batchesProduced: batchesMade.length,
    sales,
  };
};