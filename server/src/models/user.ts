import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, maxlength: 60 },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false, minlength: 8 },
  role: {
    type:    String,
    enum:    ['OWNER', 'WORKER', 'VIEWER'],
    default: 'VIEWER',
  },
  isActive:  { type: Boolean, default: true },
  lastLogin: { type: Date },
}, { timestamps: true });

export default mongoose.model('User', userSchema);