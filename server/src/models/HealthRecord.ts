// server/src/models/HealthRecord.ts
import mongoose from 'mongoose';

const healthRecordSchema = new mongoose.Schema({
  animalId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  recordType: { type: String, enum: ['VACCINATION', 'TREATMENT'], default: 'TREATMENT' },
  date:       { type: Date, default: Date.now },

  // Shared
  condition:        { type: String },  
  cost:             { type: Number, default: 0 },
  veterinarianName: { type: String },
  notes:            { type: String },

  // Vaccination-specific
  vaccineStatus: { type: String, enum: ['GIVEN', 'DUE', 'OVERDUE', 'SCHEDULED'] },
  nextDueDate:   { type: Date },
  dosage:        { type: String },

  // Treatment-specific
  medicines:    { type: [String], default: [] },
  followUpDate: { type: Date },
  treatment:    { type: String }, 
}, { timestamps: true });

healthRecordSchema.index({ animalId: 1, date: -1 });

export default mongoose.model('HealthRecord', healthRecordSchema);