import mongoose from 'mongoose';

const seasonSchema = new mongoose.Schema({
  cropId:   { type: String, required: true, index: true },
  cropName: { type: String, trim: true },
  localName:{ type: String, trim: true },

  label:     { type: String, required: true, trim: true },
  startDate: { type: Date,   required: true },
  endDate:   Date,

  areaSown: { type: Number, required: true },
  areaUnit: { type: String, default: 'acres' },

  variety: String,
  budget:  { type: Number, default: 0 },
  notes:   String,

  status: {
    type:    String,
    enum:    ['PLANNED', 'ACTIVE', 'HARVESTED', 'COMPLETED', 'ABANDONED'],
    default: 'PLANNED',
  },

  totalExpense: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  totalYield:   { type: Number, default: 0 },
  yieldUnit:    String,
}, {
  timestamps: true,
  toJSON:  { virtuals: true },
  toObject:{ virtuals: true },
});

seasonSchema.virtual('seasonId').get(function () {
  return this._id.toString();
});

seasonSchema.index({ cropId: 1, startDate: -1 });
seasonSchema.index({ status: 1 });

export default mongoose.model('Season', seasonSchema);
