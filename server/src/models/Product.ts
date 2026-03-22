import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: String
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
