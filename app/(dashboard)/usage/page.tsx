"use client";

import { useEffect, useState } from "react";

import { Activity, Search, ShieldAlert, Zap, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function UsagePage() {
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const [statsRes, logsRes] = await Promise.all([
          api.get<any>("/admin/system-stats"),
          api.get<any>("/admin/search-logs?limit=50"),
        ]);
        setStats(statsRes.data);
        setLogs(logsRes.data?.items || []);
      } catch (err: any) {
        if (err.status === 403) {
          setError("API Usage statistics are only available for administrators.");
        } else {
          setError("Failed to fetch API usage statistics.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchUsage();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-text-muted">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading usage statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-text-secondary glass rounded-2xl p-8 max-w-xl mx-auto text-center">
        <ShieldAlert className="h-12 w-12 text-accent-rose mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      <div>
        <p className="text-xs uppercase tracking-widest text-brand-300 mb-1">Analytics</p>
        <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">API Usage</h1>
        <p className="text-text-secondary mt-2">
          Monitor your Google Places API consumption and system metrics.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <div className="glass p-5 space-y-2">
          <div className="flex items-center gap-2 text-text-secondary text-sm font-medium">
            <Zap className="h-4 w-4 text-brand-300" />
            Total API Calls
          </div>
          <p className="text-3xl font-semibold">{stats?.apiCalls?.toLocaleString() || 0}</p>
        </div>
        <div className="glass p-5 space-y-2">
          <div className="flex items-center gap-2 text-text-secondary text-sm font-medium">
            <Search className="h-4 w-4 text-accent-cyan" />
            Total Searches
          </div>
          <p className="text-3xl font-semibold">{stats?.searches?.toLocaleString() || 0}</p>
        </div>
        <div className="glass p-5 space-y-2">
          <div className="flex items-center gap-2 text-text-secondary text-sm font-medium">
            <Activity className="h-4 w-4 text-accent-emerald" />
            Total Leads Scraped
          </div>
          <p className="text-3xl font-semibold">{stats?.leads?.toLocaleString() || 0}</p>
        </div>
        <div className="glass p-5 space-y-2">
          <div className="flex items-center gap-2 text-text-secondary text-sm font-medium">
            <Activity className="h-4 w-4 text-accent-rose" />
            Premium Leads
          </div>
          <p className="text-3xl font-semibold">{stats?.premiumLeads?.toLocaleString() || 0}</p>
        </div>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <h3 className="font-medium">Recent Search Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-bg-surface/50 text-text-secondary text-xs uppercase border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Time</th>
                <th className="px-6 py-4 font-medium">User ID</th>
                <th className="px-6 py-4 font-medium">Keyword & Location</th>
                <th className="px-6 py-4 text-right font-medium text-brand-300">API Calls</th>
                <th className="px-6 py-4 text-right font-medium">Leads Found</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                    No search activity recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-bg-surface/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-text-secondary">
                      {new Date(log.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "numeric" })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-secondary">
                      #{log.userId}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-text-primary">{log.keyword}</span>
                      <span className="text-text-muted"> in {log.location}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-brand-300">
                      {log.apiCalls}
                    </td>
                    <td className="px-6 py-4 text-right text-text-secondary">
                      {log.totalLeads}
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
