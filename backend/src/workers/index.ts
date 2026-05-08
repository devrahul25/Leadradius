/**
 * Worker bootstrap. Run as a separate process (`npm run worker`) so heavy
 * background jobs don't compete with the HTTP server for CPU.
 */
import { Worker, type ConnectionOptions } from "bullmq";
import { redisOptions } from "../config/redis";
import { QUEUE_NAMES } from "../queues";
import { processCsvExport } from "../jobs/csv-export.job";
import { processDuplicateCleanup } from "../jobs/duplicate-cleanup.job";
import { logger } from "../config/logger";

const connection: ConnectionOptions = redisOptions;

function attachLogging(w: Worker) {
  w.on("completed", (job) => logger.info(`[${w.name}] job completed`, { id: job.id }));
  w.on("failed", (job, err) =>
    logger.error(`[${w.name}] job failed`, { id: job?.id, err: err?.message })
  );
}

const workers = [
  new Worker(QUEUE_NAMES.csvExport, processCsvExport, { connection }),
  new Worker(QUEUE_NAMES.duplicateCleanup, processDuplicateCleanup, { connection }),
  // The lead-fetch + place-details queues are scaffolded; wire processors up
  // when you move the synchronous /leads/search flow to fully async.
  new Worker(QUEUE_NAMES.leadFetch, async (job) => {
    logger.info("lead-fetch job received (no processor yet)", { id: job.id });
  }, { connection }),
  new Worker(QUEUE_NAMES.placeDetails, async (job) => {
    logger.info("place-details job received (no processor yet)", { id: job.id });
  }, { connection }),
];

workers.forEach(attachLogging);

logger.info("Workers running", { queues: workers.map((w) => w.name) });

async function shutdown() {
  logger.info("Workers shutting down…");
  await Promise.all(workers.map((w) => w.close()));
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
