import { z } from "zod";

export const searchSchema = {
  body: z.object({
    location: z.string().trim().min(2, "Location is required").max(255),
    radiusKm: z.coerce.number().int().min(1).max(100).default(50),
    category: z.string().trim().min(1).max(255),
    minRating: z.coerce.number().min(0).max(5).default(4.0),
    minReviews: z.coerce.number().int().min(0).default(50),
    requirePhone: z.coerce.boolean().default(false),
  }),
};

export const listLeadsSchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(200).default(20),
    sortBy: z.enum(["rating", "totalReviews", "score", "distanceKm", "createdAt"]).default("score"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    category: z.string().trim().min(1).max(255).optional(),
    city: z.string().trim().min(1).max(255).optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    minReviews: z.coerce.number().int().min(0).optional(),
    hasPhone: z.coerce.boolean().optional(),
    leadLabel: z.enum(["Premium Lead", "High Potential", "Medium Quality", "Low Priority"]).optional(),
    search: z.string().trim().min(1).max(255).optional(),
  }),
};

export const idParamSchema = {
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
};
