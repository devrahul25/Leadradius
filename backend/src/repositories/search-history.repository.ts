import { prisma } from "../database/prisma";

export const searchHistoryRepository = {
  create: (data: { userId: number; keyword: string; location: string; radius: number; totalLeads: number; apiCalls: number }) =>
    prisma.searchHistory.create({ data }),

  list: (skip: number, take: number) =>
    prisma.searchHistory.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),

  count: () => prisma.searchHistory.count(),
};
