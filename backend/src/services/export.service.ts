import { csvExportQueue } from "../queues";
import { prisma } from "../database/prisma";

interface EnqueueInput {
  userId: number;
  format: "csv" | "xlsx";
  filters?: Record<string, unknown> | null;
}

export const exportService = {
  /**
   * Persist an ExportJob row (so we can show status in the admin/exports UI),
   * then enqueue a BullMQ job to actually generate the file.
   */
  async enqueue({ userId, format, filters = null }: EnqueueInput) {
    const job = await prisma.exportJob.create({
      data: { userId, format, filters: (filters ?? null) as never, status: "pending" },
    });
    await csvExportQueue.add("export", { exportJobId: job.id, format, filters }, { removeOnComplete: 100, removeOnFail: 50 });
    return { exportJobId: job.id, status: "pending" as const };
  },

  status: (id: number) => prisma.exportJob.findUnique({ where: { id } }),

  list: (userId: number, skip: number, take: number) =>
    prisma.exportJob.findMany({ where: { userId }, skip, take, orderBy: { createdAt: "desc" } }),
};
