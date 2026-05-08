import winston from "winston";
import { env } from "./env";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const devFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const extras = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `${ts} ${level} ${stack ?? message}${extras}`;
});

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(timestamp(), errors({ stack: true }), env.NODE_ENV === "production" ? json() : combine(colorize(), devFormat)),
  transports: [new winston.transports.Console()],
  defaultMeta: { service: "leadradius-api" },
});

/** A morgan-compatible writable stream for HTTP request logging. */
export const httpLogStream = {
  write: (line: string) => logger.http?.(line.trim()) ?? logger.info(line.trim()),
};
