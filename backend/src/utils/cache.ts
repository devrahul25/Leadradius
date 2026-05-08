import { getRedis } from "../config/redis";
import { env } from "../config/env";
import { logger } from "../config/logger";

/**
 * Thin Redis cache wrapper. Failures are logged but never fatal — we'd rather
 * miss a cache hit than 500 the user.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await getRedis().get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (err) {
    logger.warn("Cache GET failed", { key, err: (err as Error).message });
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds = env.CACHE_TTL_SECONDS): Promise<void> {
  try {
    await getRedis().set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    logger.warn("Cache SET failed", { key, err: (err as Error).message });
  }
}

/** Returns the cached value, or runs the loader, caches, and returns it. */
export async function cached<T>(key: string, loader: () => Promise<T>, ttl = env.CACHE_TTL_SECONDS): Promise<T> {
  const hit = await cacheGet<T>(key);
  if (hit !== null) return hit;
  const fresh = await loader();
  await cacheSet(key, fresh, ttl);
  return fresh;
}
