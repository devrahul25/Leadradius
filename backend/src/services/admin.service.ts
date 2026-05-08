import { prisma } from "../database/prisma";
import { userRepository } from "../repositories/user.repository";
import { searchHistoryRepository } from "../repositories/search-history.repository";
import { queueStats } from "../queues";

export const adminService = {
  async listUsers(page: number, limit: number) {
    const [items, total] = await Promise.all([
      userRepository.list((page - 1) * limit, limit),
      userRepository.count(),
    ]);
    return { items, total };
  },

  async listSearchLogs(page: number, limit: number) {
    const [items, total] = await Promise.all([
      searchHistoryRepository.list((page - 1) * limit, limit),
      searchHistoryRepository.count(),
    ]);
    return { items, total };
  },

  queueStats() {
    return queueStats();
  },

  async systemStats() {
    const [users, leads, searches, exports, premiumLeads] = await Promise.all([
      prisma.user.count(),
      prisma.businessLead.count(),
      prisma.searchHistory.count(),
      prisma.exportJob.count(),
      prisma.businessLead.count({ where: { leadLabel: "Premium Lead" } }),
    ]);
    const apiCallsAgg = await prisma.searchHistory.aggregate({ _sum: { apiCalls: true } });
    return {
      users,
      leads,
      premiumLeads,
      searches,
      exports,
      apiCalls: apiCallsAgg._sum.apiCalls ?? 0,
    };
  },
};
