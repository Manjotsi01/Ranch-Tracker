"use strict";
// Path: ranch-tracker/server/src/config/db.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("../utils/logger"));
dotenv_1.default.config();
const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ranchtracker';
        const conn = await mongoose_1.default.connect(uri);
        logger_1.default.info(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        logger_1.default.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
