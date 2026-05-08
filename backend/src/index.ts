import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./database/prisma";

async function main() {
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`HTTP server listening on :${env.PORT}`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down…`);
    server.close(() => logger.info("HTTP server closed"));
    await prisma.$disconnect();
    setTimeout(() => process.exit(0), 1000);
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  process.on("uncaughtException", (err) => logger.error("uncaughtException", { err: err.stack ?? err }));
  process.on("unhandledRejection", (reason) => logger.error("unhandledRejection", { reason }));
}

void main();
