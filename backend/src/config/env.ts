/**
 * Centralised, validated environment loader.
 * Throws fast on boot if anything required is missing.
 */
import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().default("/api/v1"),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((s) => s.split(",").map((v) => v.trim()).filter(Boolean)),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET must be at least 16 chars"),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("7d"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),

  GOOGLE_API_KEY: z.string().default(""),
  USE_LIVE_PLACES: z
    .string()
    .default("false")
    .transform((v) => v.toLowerCase() === "true"),

  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(43200),
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "verbose", "debug"]).default("info"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // Print every missing var so you can fix them in one pass instead of one at a time.
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
  // eslint-disable-next-line no-console
  console.error("\nInvalid environment configuration:\n" + issues + "\n");
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
