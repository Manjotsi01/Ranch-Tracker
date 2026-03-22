// Path: ranch-tracker/server/src/models/YieldRecord.ts

import mongoose from 'mongoose';

const yieldRecordSchema = new mongoose.Schema(
  {
    seasonId: { type: String, required: true, index: true },

    date:        { type: Date,   required: true },
    quantity:    { type: Number, required: true },
    unit:        { type: String, default: 'kg' },
    grade:       { type: String },
    marketPrice: { type: Number, required: true },
    revenueRealized: { type: Number, default: 0 },

    notes: { type: String },
  },
  {
    timestamps: true,
    toJSON:    { virtuals: true },
    toObject:  { virtuals: true },
  }
);

yieldRecordSchema.virtual('yieldId').get(function () {
  return this._id.toString();
});

yieldRecordSchema.virtual('revenue').get(function () {
  return this.revenueRealized;
});

export default mongoose.model('YieldRecord', yieldRecordSchema);