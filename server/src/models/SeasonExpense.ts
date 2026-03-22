// Path: ranch-tracker/server/src/models/SeasonExpense.ts

import mongoose from 'mongoose';

const seasonExpenseSchema = new mongoose.Schema(
  {
    seasonId: { type: String, required: true, index: true },

    date:        { type: Date,   required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'LAND_PREP', 'SEEDS', 'FERTILIZER', 'IRRIGATION',
        'LABOR', 'PEST_CONTROL', 'HARVESTING', 'TRANSPORT', 'OTHER',
        'Machinery', 'Seed', 'Fertilizer', 'Irrigation', 'Labour',
        'Pest Control', 'Other',
      ],
      default: 'OTHER',
    },
    description: { type: String, required: true },
    amount:      { type: Number, required: true },

    // Optional fields
    quantity: { type: Number },
    unit:     { type: String },
    vendor:   { type: String },
  },
  {
    timestamps: true,
    toJSON:    { virtuals: true },
    toObject:  { virtuals: true },
  }
);
seasonExpenseSchema.virtual('expenseId').get(function () {
  return this._id.toString();
});

export default mongoose.model('SeasonExpense', seasonExpenseSchema);