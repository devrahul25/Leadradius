import { asyncHandler } from "../utils/async-handler";
import { prisma } from "../database/prisma";
import { getRedis } from "../config/redis";

export const healthController = {
  /** Lightweight liveness check — never touches DB/Redis. */
  liveness: (_req: import("express").Request, res: import("express").Response) => {
    res.status(200).json({ status: "ok", uptime: process.uptime(), ts: new Date().toISOString() });
  },

  /** Deeper readiness check used by orchestrators. */
  readiness: asyncHandler(async (_req, res) => {
    const checks = { db: false, redis: false };
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.db = true;
    } catch {
      /* leave as false */
    }
    try {
      const pong = await getRedis().ping();
      checks.redis = pong === "PONG";
    } catch {
      /* leave as false */
    }
    const ready = checks.db && checks.redis;
    res.status(ready ? 200 : 503).json({ status: ready ? "ready" : "degraded", checks });
  }),
};
