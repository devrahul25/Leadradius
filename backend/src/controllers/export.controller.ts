import fs from "node:fs";
import path from "node:path";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { exportService } from "../services/export.service";
import { ok, created } from "../utils/response";

export const exportController = {
  csv: asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized();
    const result = await exportService.enqueue({ userId: req.user.sub, format: "csv", filters: req.query as Record<string, unknown> });
    return created(res, result, "CSV export queued");
  }),

  excel: asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized();
    const result = await exportService.enqueue({ userId: req.user.sub, format: "xlsx", filters: req.query as Record<string, unknown> });
    return created(res, result, "Excel export queued");
  }),

  status: asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const job = await exportService.status(id);
    if (!job) throw ApiError.notFound("Export job not found");
    return ok(res, job, "Export status");
  }),

  list: asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized();
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
    const items = await exportService.list(req.user.sub, (page - 1) * limit, limit);
    return ok(res, items, "Exports");
  }),

  /** Streams the generated file to the client once the job is done. */
  download: asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const job = await exportService.status(id);
    if (!job) throw ApiError.notFound("Export not found");
    if (job.status !== "done" || !job.filePath) {
      throw ApiError.badRequest(`Export not ready (status: ${job.status})`);
    }
    const filename = path.basename(job.filePath);
    if (!fs.existsSync(job.filePath)) throw ApiError.notFound("Export file missing on disk");
    res.download(job.filePath, filename);
  }),
};
