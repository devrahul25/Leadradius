/**
 * Queue registry. Each queue gets its own ioredis connection (BullMQ best
 * practice). Anything you `enqueue` here will be processed by a worker — see
 * `src/workers/index.ts`.
 */
import { Queue, type ConnectionOptions } from "bullmq";
import { redisOptions } from "../config/redis";

export const QUEUE_NAMES = {
  leadFetch: "lead-fetch",
  placeDetails: "place-details",
  csvExport: "csv-export",
  duplicateCleanup: "duplicate-cleanup",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

const connection: ConnectionOptions = redisOptions;

export const leadFetchQueue = new Queue(QUEUE_NAMES.leadFetch, { connection });
export const placeDetailsQueue = new Queue(QUEUE_NAMES.placeDetails, { connection });
export const csvExportQueue = new Queue(QUEUE_NAMES.csvExport, { connection });
export const duplicateCleanupQueue = new Queue(QUEUE_NAMES.duplicateCleanup, { connection });

export const allQueues = [leadFetchQueue, placeDetailsQueue, csvExportQueue, duplicateCleanupQueue];

/** Snapshot used by /admin/queues to show counts in the dashboard. */
export async function queueStats() {
  return Promise.all(
    allQueues.map(async (q) => ({
      name: q.name,
      counts: await q.getJobCounts("waiting", "active", "completed", "failed", "delayed"),
    }))
  );
}
