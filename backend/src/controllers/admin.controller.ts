import { asyncHandler } from "../utils/async-handler";
import { adminService } from "../services/admin.service";
import { ok } from "../utils/response";

export const adminController = {
  users: asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(200, Math.max(1, Number(req.query.limit ?? 20)));
    const { items, total } = await adminService.listUsers(page, limit);
    return ok(res, items, "Users", {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  }),

  searchLogs: asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(200, Math.max(1, Number(req.query.limit ?? 50)));
    const { items, total } = await adminService.listSearchLogs(page, limit);
    return ok(res, items, "Search logs", {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  }),

  queues: asyncHandler(async (_req, res) => {
    return ok(res, await adminService.queueStats(), "Queue stats");
  }),

  systemStats: asyncHandler(async (_req, res) => {
    return ok(res, await adminService.systemStats(), "System stats");
  }),
};
