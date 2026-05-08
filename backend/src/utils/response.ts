import type { Response } from "express";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Centralised success response. Keeps every endpoint consistent so the
 * frontend can rely on `success` / `data` / `pagination`.
 */
export function ok<T>(
  res: Response,
  data: T,
  message = "OK",
  pagination?: Pagination,
  status = 200
) {
  return res.status(status).json({ success: true, message, data, ...(pagination ? { pagination } : {}) });
}

/** Shorthand for 201 Created responses. */
export function created<T>(res: Response, data: T, message = "Created") {
  return ok(res, data, message, undefined, 201);
}

/** No-content style response that still uses our envelope. */
export function noContent(res: Response, message = "OK") {
  return res.status(200).json({ success: true, message, data: null });
}
