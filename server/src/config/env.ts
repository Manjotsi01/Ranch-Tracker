import dotenv from 'dotenv';
dotenv.config();

// CLIENT_ORIGIN added to required — previously it had a fallback but was
// never validated, so a missing production env var would silently use localhost
// and block all Vercel requests.
const required = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_ORIGIN'] as const;

for (const key of required) {
  if (!process.env[key]) {
    console.error(`[FATAL] Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

export const env = {
  NODE_ENV:    process.env.NODE_ENV ?? 'development',
  PORT:        Number(process.env.PORT ?? 5000),
  MONGO_URI:   process.env.MONGO_URI!,
  JWT_SECRET:  process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  BASE_API:    process.env.BASE_API ?? '/api',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN!,
  MILK_PRICE_PER_LITRE: Number(process.env.MILK_PRICE_PER_LITRE ?? 40),
  CACHE_TTL_MS: Number(process.env.CACHE_TTL_MS ?? 60_000),
  isProd: () => process.env.NODE_ENV === 'production',
} as const;