import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { leadService } from "../services/lead.service";
import { ok, created } from "../utils/response";

export const leadController = {
  search: asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized();
    const result = await leadService.search({ userId: req.user.sub, ...req.body });
    return created(res, result, "Search complete");
  }),

  list: asyncHandler(async (req, res) => {
    const q = req.query as Record<string, unknown>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const filters = {
      category: q.category as string | undefined,
      city: q.city as string | undefined,
      minRating: q.minRating !== undefined ? Number(q.minRating) : undefined,
      minReviews: q.minReviews !== undefined ? Number(q.minReviews) : undefined,
      hasPhone: q.hasPhone as boolean | undefined,
      leadLabel: q.leadLabel as string | undefined,
      search: q.search as string | undefined,
    };
    const options = {
      page,
      limit,
      sortBy: q.sortBy as "rating" | "totalReviews" | "score" | "distanceKm" | "createdAt" | undefined,
      sortOrder: q.sortOrder as "asc" | "desc" | undefined,
    };
    const [items, total] = await leadService.list(filters, options);
    return ok(res, items, "Leads", {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  }),

  getById: asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const lead = await leadService.getById(id);
    return ok(res, lead, "Lead");
  }),

  remove: asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    await leadService.remove(id);
    return ok(res, null, "Lead deleted");
  }),
};
