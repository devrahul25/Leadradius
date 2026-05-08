import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ApiError } from "../utils/api-error";
import { logger } from "../config/logger";
import { env } from "../config/env";

/**
 * Centralised error handler. Translates the various error shapes we see in
 * the wild (Prisma, JWT, Zod-via-ApiError, raw Errors) into our standard
 * envelope.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  let status = 500;
  let message = "Internal server error";
  let details: unknown;
  let code: string | undefined;

  if (err instanceof ApiError) {
    status = err.status;
    message = err.message;
    details = err.details;
    code = err.code;
  } else if (err instanceof TokenExpiredError) {
    status = 401;
    message = "Token expired";
    code = "TOKEN_EXPIRED";
  } else if (err instanceof JsonWebTokenError) {
    status = 401;
    message = "Invalid token";
    code = "INVALID_TOKEN";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      status = 409;
      message = "Duplicate value";
      details = { target: err.meta?.target };
      code = "DUPLICATE";
    } else if (err.code === "P2025") {
      status = 404;
      message = "Record not found";
      code = "NOT_FOUND";
    } else {
      status = 400;
      message = "Database error";
      details = { code: err.code };
      code = "DB_ERROR";
    }
  } else if (err instanceof Error) {
    message = err.message;
  }

  // Log everything that's a 500 with stack traces, but quiet 4xx noise.
  if (status >= 500) {
    logger.error("Request failed", { path: req.path, status, err: err instanceof Error ? err.stack : err });
  } else {
    logger.warn("Request rejected", { path: req.path, status, message });
  }

  res.status(status).json({
    success: false,
    message,
    error: {
      code,
      ...(details ? { details } : {}),
      ...(env.NODE_ENV !== "production" && err instanceof Error ? { stack: err.stack } : {}),
    },
  });
}
