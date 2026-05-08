import IORedis, { type RedisOptions } from "ioredis";
import { env } from "./env";
import { logger } from "./logger";

export const redisOptions: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // BullMQ requirement
};

let client: IORedis | null = null;

/**
 * Lazily-constructed shared connection used for caching.
 * BullMQ uses a separate connection per queue/worker by design.
 */
export function getRedis(): IORedis {
  if (client) return client;
  client = new IORedis(redisOptions);
  client.on("error", (err) => logger.error("Redis error", { err: err.message }));
  client.on("connect", () => logger.info("Redis connected", { host: env.REDIS_HOST }));
  return client;
}
