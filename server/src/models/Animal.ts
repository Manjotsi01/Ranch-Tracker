// server/src/models/Animal.ts
import mongoose from 'mongoose'

const bloodlineSchema = new mongoose.Schema({
  damTag:       { type: String },
  damId:        { type: String },
  sireSemen:    { type: String },
  bullName:     { type: String },
  geneticNotes: { type: String },
}, { _id: false })

const lactationSchema = new mongoose.Schema({
  lactationNumber: { type: Number },
  startDate:       { type: Date },
  endDate:         { type: Date },
  status:          { type: String, enum: ['ACTIVE', 'CLOSED', 'COMPLETED'], default: 'ACTIVE' },
  totalYield:      { type: Number, default: 0 },
})

const feedingPlanSchema = new mongoose.Schema({
  fodderType:    { type: String, enum: ['GREEN', 'DRY', 'SILAGE', 'CONCENTRATE', 'SUPPLEMENT'] },
  fodderName:    { type: String },
  dailyQuantity: { type: Number, required: true },
  unit:          { type: String, default: 'kg' },
  costPerUnit:   { type: Number },
})

const animalSchema = new mongoose.Schema({
  tagNo:     { type: String, unique: true, sparse: true },
  tagNumber: { type: String },
  name:      { type: String },
  type:      { type: String, enum: ['COW', 'BUFFALO'], default: 'COW' },
  breed:     { type: String, required: true },
  gender:    { type: String, enum: ['FEMALE', 'MALE', 'Female', 'Male'], default: 'FEMALE' },
  color:     { type: String },
  status: {
    type: String,
    enum: [
      'CALF', 'WEANED_CALF', 'HEIFER', 'PREGNANT_HEIFER',
      'LACTATING', 'DRY', 'TRANSITION', 'MILKING', 'SOLD', 'DEAD',
      'Calf', 'Heifer', 'Milking', 'Dry', 'Sold', 'Dead',
    ],
    default: 'CALF',
  },
  dateOfBirth:   { type: Date },
  purchaseDate:  { type: Date },
  purchaseCost:  { type: Number },
  purchasePrice: { type: Number },
  currentWeight: { type: Number },
  weight:        { type: Number },
  bloodline:     { type: bloodlineSchema },
  lactations:    { type: [lactationSchema],   default: [] },
  feedingPlan:   { type: [feedingPlanSchema], default: [] },
  notes:         { type: String },
  animalId:      { type: String, sparse: true },
  feedingCost:   { type: Number, default: 0 },
  medicalCost:   { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.model('Animal', animalSchema)