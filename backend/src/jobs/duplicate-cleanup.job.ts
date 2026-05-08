/**
 * Cleans up business_leads rows that look like duplicates. The placeId unique
 * constraint already prevents the easy case — this catches scrubbed duplicates
 * that came from imports or older rows missing a placeId.
 */
import type { Job } from "bullmq";
import { prisma } from "../database/prisma";
import { logger } from "../config/logger";

export async function processDuplicateCleanup(_job: Job): Promise<{ removed: number }> {
  const groups = await prisma.businessLead.groupBy({
    by: ["name", "city"],
    _count: { _all: true },
    having: { name: { _count: { gt: 1 } } },
  });

  let removed = 0;
  for (const g of groups) {
    if (!g.name || !g.city) continue;
    const dupes = await prisma.businessLead.findMany({
      where: { name: g.name, city: g.city },
      orderBy: [{ score: "desc" }, { totalReviews: "desc" }, { id: "asc" }],
    });
    // Keep the highest-scoring row, delete the rest.
    for (const row of dupes.slice(1)) {
      await prisma.businessLead.delete({ where: { id: row.id } });
      removed += 1;
    }
  }
  logger.info("Duplicate cleanup complete", { removed });
  return { removed };
}
