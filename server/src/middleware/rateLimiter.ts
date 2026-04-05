import rateLimit from 'express-rate-limit';

// Render (and most cloud platforms) place the app behind a reverse proxy.
// trust proxy must be set on the Express app for req.ip to reflect the
// real client IP. Add `app.set('trust proxy', 1)` in server.ts.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      300,
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator: (req) => req.ip ?? 'unknown',
  message: { success: false, message: 'Too many requests — try again in 15 minutes.' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message: { success: false, message: 'Too many login attempts — try again in 15 minutes.' },
  skipSuccessfulRequests: true,
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      30,
  message: { success: false, message: 'Rate limit exceeded.' },
});