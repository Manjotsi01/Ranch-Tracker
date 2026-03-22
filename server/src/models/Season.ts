// Path: ranch-tracker/server/src/models/Season.ts

import mongoose from 'mongoose';

const seasonSchema = new mongoose.Schema(
  {
    // ─── Core identifiers ──────────────────────────────────────────────────────
    cropId:   { type: String, required: true, index: true },
    cropName: { type: String },              
    // ─── Season info ───────────────────────────────────────────────────────────
    label:     { type: String, required: true },   
    startDate: { type: Date,   required: true },
    endDate:   { type: Date },

    // ─── Area ──────────────────────────────────────────────────────────────────
    areaSown: { type: Number, required: true },   
    areaUnit: { type: String, default: 'acres' }, 

    // ─── Optional details ──────────────────────────────────────────────────────
    variety: { type: String },
    budget:  { type: Number, default: 0 },
    notes:   { type: String },

    // ─── Status ────────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['PLANNED', 'ACTIVE', 'HARVESTED', 'COMPLETED', 'ABANDONED'],
      default: 'PLANNED',
    },

    // ─── Aggregated financials (updated via $inc on expense/yield write) ───────
    totalExpense: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },   
    // ─── Aggregated yield ──────────────────────────────────────────────────────
    totalYield: { type: Number, default: 0 },
    yieldUnit:  { type: String },
  },
  {
    timestamps: true,
    toJSON:    { virtuals: true },
    toObject:  { virtuals: true },
  }
);

// ─── Virtual: expose _id as seasonId ─────────────────────────────────────────
seasonSchema.virtual('seasonId').get(function () {
  return this._id.toString();
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
seasonSchema.index({ cropId: 1, startDate: -1 });

export default mongoose.model('Season', seasonSchema);