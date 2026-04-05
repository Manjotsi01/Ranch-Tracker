import './config/env';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import { env } from './config/env';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import logger from './utils/logger';

import authRoutes       from './routes/auth.routes';
import dashboardRoutes  from './routes/dashboard.routes';
import dairyRoutes      from './routes/dairy.routes';
import shopRoutes       from './routes/shop.routes';
import agricultureRoutes from './routes/agriculture.routes';

const app = express();

// ── 1. CORS — must be FIRST, before everything else ──────────────────────────
// This is why your requests were blocked: CORS was either missing or
// registered after other middleware, so OPTIONS preflight never got a response.
const allowedOrigins = [
  env.CLIENT_ORIGIN,                    // https://ranch-tracker.vercel.app
  'http://localhost:5173',              // Vite dev
  'http://localhost:3000',              // CRA dev fallback
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, server-to-server, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    logger.warn(`CORS blocked request from origin: ${origin}`);
    callback(new Error(`CORS: origin ${origin} is not allowed`));
  },
  methods:            ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders:     ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders:     ['X-Total-Count'],
  credentials:        true,   // allow cookies / Authorization header
  optionsSuccessStatus: 200,  // some legacy browsers choke on 204
  maxAge:             86_400, // cache preflight for 24 h
}));

// Explicitly handle OPTIONS for all routes (required for credentials:true)
app.options('*', cors());

// ── 2. Security headers ───────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ── 3. Body parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ── 4. Sanitize & compress ────────────────────────────────────────────────────
app.use(mongoSanitize());
app.use(compression());

// ── 5. Rate limiting ──────────────────────────────────────────────────────────
app.use(env.BASE_API, apiLimiter);

// ── 6. Health check (no auth required) ───────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', env: env.NODE_ENV, ts: new Date().toISOString() });
});

// ── 7. API routes ─────────────────────────────────────────────────────────────
const api = env.BASE_API; // '/api'
app.use(`${api}/auth`,        authRoutes);
app.use(`${api}/dashboard`,   dashboardRoutes);
app.use(`${api}/dairy`,       dairyRoutes);
app.use(`${api}/shop`,        shopRoutes);
app.use(`${api}/agriculture`, agricultureRoutes);

// ── 8. 404 handler ────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── 9. Global error handler — must be last ────────────────────────────────────
app.use(errorHandler);

// ── 10. Start ─────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
  });
};

start().catch((err) => {
  logger.error('Fatal startup error:', err);
  process.exit(1);
});

export default app;