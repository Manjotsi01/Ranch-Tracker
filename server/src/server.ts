// Path: ranch-tracker/server/src/server.ts

import dotenv from 'dotenv';

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import agricultureRoutes from './routes/agriculture.routes';
import dashboardRoutes   from './routes/dashboard.routes';
import dairyRoutes       from './routes/dairy.routes';
import shopRoutes        from './routes/shop.routes';
import { errorHandler }  from './middleware/errorHandler';
import logger from './utils/logger';

const app  = express();

// ─── Config from .env ─────────────────────────────────────────────────────────
const PORT     = process.env.PORT     || 5000;
const BASE_API = process.env.BASE_API || '/api';

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes — all under BASE_API ─────────────────────────────────────────────
app.use(`${BASE_API}/dashboard`,   dashboardRoutes);
app.use(`${BASE_API}/agriculture`, agricultureRoutes);
app.use(`${BASE_API}/dairy`,       dairyRoutes);
app.use(`${BASE_API}/shop`,        shopRoutes);

// Health check — useful for uptime monitoring / Docker health checks
app.get(`${BASE_API}/health`, (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─── Global error handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`✅ Server running on http://localhost:${PORT}`);
    logger.info(`✅ API base: http://localhost:${PORT}${BASE_API}`);
    logger.info(`✅ MongoDB: ${process.env.MONGO_URI}`);
  });
};

startServer();

export default app;