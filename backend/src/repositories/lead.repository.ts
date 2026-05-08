import { Prisma, type BusinessLead } from "@prisma/client";
import { prisma } from "../database/prisma";

export type LeadCreateInput = Prisma.BusinessLeadCreateInput;

export interface ListFilters {
  category?: string;
  city?: string;
  minRating?: number;
  minReviews?: number;
  hasPhone?: boolean;
  leadLabel?: string;
  search?: string;
}

export interface ListOptions {
  page: number;
  limit: number;
  sortBy?: "rating" | "totalReviews" | "score" | "distanceKm" | "createdAt";
  sortOrder?: "asc" | "desc";
}

function buildWhere(filters: ListFilters): Prisma.BusinessLeadWhereInput {
  const w: Prisma.BusinessLeadWhereInput = {};
  if (filters.category) w.category = { contains: filters.category };
  if (filters.city) w.city = { contains: filters.city };
  if (filters.minRating !== undefined) w.rating = { gte: filters.minRating };
  if (filters.minReviews !== undefined) w.totalReviews = { gte: filters.minReviews };
  if (filters.leadLabel) w.leadLabel = filters.leadLabel;
  if (filters.hasPhone) w.phone = { not: null };
  if (filters.search) {
    w.OR = [
      { name: { contains: filters.search } },
      { address: { contains: filters.search } },
      { city: { contains: filters.search } },
    ];
  }
  return w;
}

export const leadRepository = {
  /** Upsert by placeId so repeated searches don't duplicate rows. */
  upsert(data: LeadCreateInput): Promise<BusinessLead> {
    const { placeId, ...rest } = data;
    return prisma.businessLead.upsert({
      where: { placeId: placeId as string },
      update: rest,
      create: data,
    });
  },

  async upsertMany(items: LeadCreateInput[]): Promise<number> {
    let count = 0;
    for (const item of items) {
      await this.upsert(item);
      count++;
    }
    return count;
  },

  findById: (id: number) => prisma.businessLead.findUnique({ where: { id } }),

  delete: (id: number) => prisma.businessLead.delete({ where: { id } }),

  count: (filters: ListFilters) => prisma.businessLead.count({ where: buildWhere(filters) }),

  list(filters: ListFilters, options: ListOptions) {
    const where = buildWhere(filters);
    const orderBy: Prisma.BusinessLeadOrderByWithRelationInput = {
      [options.sortBy ?? "score"]: options.sortOrder ?? "desc",
    };
    return prisma.businessLead.findMany({
      where,
      orderBy,
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    });
  },

  /** Used by the duplicate-cleanup job. */
  findDuplicatesByName: (name: string, city: string) =>
    prisma.businessLead.findMany({ where: { name, city } }),
};
