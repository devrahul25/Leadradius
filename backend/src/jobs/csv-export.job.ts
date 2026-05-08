/**
 * Job processor for CSV/Excel exports. Long exports (10k+ rows) should run
 * here so the HTTP request can return immediately with a job id, and the
 * client can poll or be notified when the file is ready.
 */
import fs from "node:fs/promises";
import path from "node:path";
import ExcelJS from "exceljs";
import type { Job } from "bullmq";
import { prisma } from "../database/prisma";
import { logger } from "../config/logger";

export interface ExportJobData {
  exportJobId: number;
  format: "csv" | "xlsx";
  filters: Record<string, unknown> | null;
}

const EXPORT_DIR = path.resolve(process.cwd(), "exports");

const COLUMNS = [
  { header: "Business", key: "name", width: 32 },
  { header: "Category", key: "category", width: 18 },
  { header: "Rating", key: "rating", width: 8 },
  { header: "Reviews", key: "totalReviews", width: 10 },
  { header: "Phone", key: "phone", width: 18 },
  { header: "Address", key: "address", width: 40 },
  { header: "City", key: "city", width: 14 },
  { header: "Distance (km)", key: "distanceKm", width: 12 },
  { header: "Score", key: "score", width: 8 },
  { header: "Quality", key: "leadLabel", width: 16 },
  { header: "Status", key: "status", width: 10 },
  { header: "Website", key: "website", width: 28 },
];

export async function processCsvExport(job: Job<ExportJobData>): Promise<{ filePath: string; rowCount: number }> {
  const { exportJobId, format } = job.data;
  await fs.mkdir(EXPORT_DIR, { recursive: true });
  await prisma.exportJob.update({ where: { id: exportJobId }, data: { status: "running" } });

  const leads = await prisma.businessLead.findMany({ orderBy: { score: "desc" } });
  await job.updateProgress(20);

  const filename = `leadradius-${exportJobId}-${Date.now()}.${format}`;
  const filePath = path.join(EXPORT_DIR, filename);

  if (format === "csv") {
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const head = COLUMNS.map((c) => escape(c.header)).join(",");
    const body = leads.map((l) => COLUMNS.map((c) => escape((l as Record<string, unknown>)[c.key])).join(",")).join("\n");
    await fs.writeFile(filePath, head + "\n" + body, "utf8");
  } else {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Leads");
    ws.columns = COLUMNS;
    ws.addRows(leads);
    ws.getRow(1).font = { bold: true };
    await wb.xlsx.writeFile(filePath);
  }

  await job.updateProgress(95);
  await prisma.exportJob.update({
    where: { id: exportJobId },
    data: { status: "done", filePath, rowCount: leads.length, completedAt: new Date() },
  });
  await job.updateProgress(100);

  logger.info("Export complete", { exportJobId, format, rows: leads.length, filePath });
  return { filePath, rowCount: leads.length };
}
