"use client";

import { useEffect, useState } from "react";

import { Download, FileDown, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { api, API_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function ExportsPage() {
  const [exports, setExports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExports() {
      try {
        const { data } = await api.get<any[]>("/export");
        setExports(data);
      } catch (err) {
        console.error("Failed to fetch exports", err);
      } finally {
        setLoading(false);
      }
    }
    fetchExports();
    
    // Poll for status updates
    const interval = setInterval(fetchExports, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div>
        <p className="text-xs uppercase tracking-widest text-brand-300 mb-1">Downloads</p>
        <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">Export History</h1>
        <p className="text-text-secondary mt-2">
          View and download your previously generated CSV and Excel files.
        </p>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-bg-surface/50 text-text-secondary text-xs uppercase border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Format</th>
                <th className="px-6 py-4 font-medium">Records</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && exports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Loading exports...
                  </td>
                </tr>
              ) : exports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                    <FileDown className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No exports generated yet. Go to Search to export leads.
                  </td>
                </tr>
              ) : (
                exports.map((job) => (
                  <tr key={job.id} className="hover:bg-bg-surface/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-text-secondary">
                      {new Date(job.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-bg-surface border border-border rounded-md text-xs font-medium uppercase">
                        {job.format}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-secondary">
                      {job.rowCount > 0 ? job.rowCount.toLocaleString() : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {job.status === "done" ? (
                          <><CheckCircle2 className="h-4 w-4 text-accent-emerald" /><span className="text-accent-emerald font-medium text-xs">Ready</span></>
                        ) : job.status === "failed" ? (
                          <><XCircle className="h-4 w-4 text-accent-rose" /><span className="text-accent-rose font-medium text-xs">Failed</span></>
                        ) : (
                          <><Loader2 className="h-4 w-4 text-brand-300 animate-spin" /><span className="text-brand-300 font-medium text-xs">Processing</span></>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={job.status !== "done"}
                        onClick={() => {
                          window.location.href = `${API_URL}/export/download/${job.id}`;
                        }}
                      >
                        <Download className="h-4 w-4 mr-1.5" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
