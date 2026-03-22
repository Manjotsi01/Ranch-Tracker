// Path: ranch-tracker/server/src/config/db.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ranchtracker';
    const conn = await mongoose.connect(uri);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};