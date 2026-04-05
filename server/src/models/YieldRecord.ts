import mongoose from 'mongoose';

const yieldRecordSchema = new mongoose.Schema({
  seasonId: {
    type:     String,
    required: true,
    index:    true,
    validate: {
      validator: (v: string) => /^[a-f\d]{24}$/i.test(v),
      message:  'seasonId must be a valid 24-char ObjectId string',
    },
  },
  date:            { type: Date,   required: true },
  quantity:        { type: Number, required: true, min: 0 },
  unit:            { type: String, default: 'kg' },
  grade:           String,
  marketPrice:     { type: Number, required: true, min: 0 },
  revenueRealized: { type: Number, default: 0, min: 0 },
  notes:           String,
}, {
  timestamps: true,
  toJSON:  { virtuals: true },
  toObject:{ virtuals: true },
});

yieldRecordSchema.virtual('yieldId').get(function () {
  return this._id.toString();
});

yieldRecordSchema.index({ date: -1 });

export default mongoose.model('YieldRecord', yieldRecordSchema);
