import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  area: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

export default mongoose.model('Field', fieldSchema);
