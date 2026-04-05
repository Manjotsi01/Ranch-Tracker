import mongoose from 'mongoose';

const bloodlineSchema = new mongoose.Schema({
  damTag:       String,
  damId:        String,
  sireSemen:    String,
  bullName:     String,
  geneticNotes: String,
}, { _id: false });

const lactationSchema = new mongoose.Schema({
  lactationNumber: Number,
  startDate:       Date,
  endDate:         Date,
  status: {
    type:    String,
    enum:    ['ACTIVE', 'CLOSED', 'COMPLETED'],
    default: 'ACTIVE',
  },
  totalYield: { type: Number, default: 0 },
});

const feedingPlanSchema = new mongoose.Schema({
  fodderType: {
    type: String,
    enum: ['GREEN', 'DRY', 'SILAGE', 'CONCENTRATE', 'SUPPLEMENT'],
  },
  fodderName:    String,
  dailyQuantity: { type: Number, required: true },
  unit:          { type: String, default: 'kg' },
  costPerUnit:   Number,
});

const animalSchema = new mongoose.Schema({
  tagNo:    { type: String, unique: true, sparse: true, trim: true },
  tagNumber:{ type: String, trim: true },
  name:     { type: String, trim: true },
  type: {
    type:    String,
    enum:    ['COW', 'BUFFALO'],
    default: 'COW',
  },
  breed:  { type: String, required: true, trim: true },
  gender: {
    type:    String,
    enum:    ['FEMALE', 'MALE'],
    default: 'FEMALE',
  },
  color:  String,
  status: {
    type: String,
    enum: [
      'CALF', 'WEANED_CALF', 'HEIFER', 'PREGNANT_HEIFER',
      'LACTATING', 'DRY', 'TRANSITION', 'MILKING', 'SOLD', 'DEAD',
    ],
    default: 'CALF',
  },
  dateOfBirth:   Date,
  purchaseDate:  Date,
  purchaseCost:  Number,
  currentWeight: Number,
  bloodline:   bloodlineSchema,
  lactations:  { type: [lactationSchema],   default: [] },
  feedingPlan: { type: [feedingPlanSchema], default: [] },
  notes:       String,
  feedingCost: { type: Number, default: 0 },
  medicalCost: { type: Number, default: 0 },
}, { timestamps: true });

animalSchema.index({ status: 1 });
animalSchema.index({ type: 1 });

export default mongoose.model('Animal', animalSchema);