"use client";

import Link from "next/link";
import { Activity, Database, Phone, Sparkles, Star, TrendingUp, Search } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  DailySearchesChart,
  LeadsByCategoryChart,
  LeadsByCityChart,
  QualityDistributionChart,
} from "@/components/dashboard/charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEED_LEADS } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";
import { labelStyles } from "@/lib/lead-scoring";

export default function DashboardPage() {
  const total = SEED_LEADS.length;
  const premium = SEED_LEADS.filter((l) => l.label === "Premium Lead").length;
  const avgRating = SEED_LEADS.reduce((s, l) => s + l.rating, 0) / total;
  const withPhone = SEED_LEADS.filter((l) => l.phone).length;

  // Charts data
  const byCategory = aggregate(SEED_LEADS, (l) => l.category).slice(0, 6);
  const byCity = aggregate(SEED_LEADS, (l) => l.city).slice(0, 6);
  const quality = (
    ["Premium Lead", "High Potential", "Medium Quality", "Low Priority"] as const
  ).map((label) => ({
    label,
    value: SEED_LEADS.filter((l) => l.label === label).length,
  }));
  const dailySearches = generateDailySeries();
  const topLeads = [...SEED_LEADS].sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      {/* Hero / page header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-300 mb-1">Overview</p>
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">
            Hello, Jaiveeru. <span className="gradient-text">Today looks promising.</span>
          </h1>
          <p className="text-text-secondary mt-2">
            Pipeline insights from your last 30 days of radius searches across India.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/leads"><Button variant="secondary"><Database className="h-4 w-4" /> View leads</Button></Link>
          <Link href="/search"><Button><Search className="h-4 w-4" /> New search</Button></Link>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total leads" value={formatNumber(total)} delta={12.4} hint="vs last 30 days" icon={Database} accent="brand" delay={0} />
        <StatCard label="Premium leads" value={formatNumber(premium)} delta={28.1} hint={`${Math.round((premium / total) * 100)}% of pool`} icon={Sparkles} accent="cyan" delay={0.05} />
        <StatCard label="Avg. rating" value={avgRating.toFixed(2)} delta={1.8} hint="across all leads" icon={Star} accent="amber" delay={0.1} />
        <StatCard label="With phone" value={`${Math.round((withPhone / total) * 100)}%`} delta={-2.3} hint={`${withPhone} leads contactable`} icon={Phone} accent="emerald" delay={0.15} />
      </div>

      {/* Chart row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <div className="glass p-6 lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-text-secondary">Daily searches</h3>
              <p className="text-2xl font-semibold mt-1">3,284 <span className="text-xs text-accent-emerald font-medium ml-1">+18.2%</span></p>
            </div>
            <Badge className="border-brand-500/30 bg-brand-500/10 text-brand-300">
              <TrendingUp className="h-3 w-3" /> 7d trend
            </Badge>
          </div>
          <DailySearchesChart data={dailySearches} />
        </div>

        <div className="glass p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-text-secondary">Lead quality split</h3>
              <p className="text-2xl font-semibold mt-1">{premium}<span className="text-text-muted text-base font-normal ml-1">premium</span></p>
            </div>
          </div>
          <QualityDistributionChart data={quality} />
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-4 text-xs">
            {quality.map((q, i) => (
              <div key={q.label} className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: ["#A855F7", "#22D3EE", "#FBBF24", "#475569"][i] }} />
                <span className="text-text-secondary truncate">{q.label}</span>
                <span className="text-text-primary ml-auto">{q.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <div className="glass p-6">
          <h3 className="text-sm font-medium text-text-secondary mb-4">Leads by category</h3>
          <LeadsByCategoryChart data={byCategory} />
        </div>
        <div className="glass p-6">
          <h3 className="text-sm font-medium text-text-secondary mb-4">Leads by city</h3>
          <LeadsByCityChart data={byCity} />
        </div>

        {/* API usage */}
        <div className="glass p-6 flex flex-col">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-text-secondary">API usage</h3>
              <p className="text-2xl font-semibold mt-1">8,420 <span className="text-text-muted text-sm font-normal">/ 13,500</span></p>
            </div>
            <Badge className="border-accent-emerald/30 bg-accent-emerald/10 text-accent-emerald">
              <Activity className="h-3 w-3" /> Healthy
            </Badge>
          </div>
          <div className="mt-6 space-y-4 flex-1">
            <UsageBar label="Nearby Search" used={6120} total={9000} color="from-brand-500 to-brand-700" />
            <UsageBar label="Place Details" used={1980} total={3500} color="from-accent-cyan to-brand-500" />
            <UsageBar label="Geocoding" used={320} total={1000} color="from-accent-amber to-accent-rose" />
          </div>
          <p className="text-xs text-text-muted mt-4 pt-4 border-t border-border">
            Cost-aware fetching saved <span className="text-accent-emerald font-medium">₹3,240</span> this month.
          </p>
        </div>
      </div>

      {/* Top leads strip */}
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-text-secondary">Top scored leads</h3>
            <p className="text-xs text-text-muted">Premium opportunities ranked by AI score</p>
          </div>
          <Link href="/leads" className="text-xs text-brand-300 hover:text-brand-200">View all →</Link>
        </div>
        <div className="grid gap-3 lg:grid-cols-5">
          {topLeads.map((l) => (
            <div key={l.id} className="rounded-xl border border-border bg-bg-surface/40 p-4 hover:border-brand-500/30 transition-colors">
              <p className="text-sm font-medium text-text-primary truncate">{l.name}</p>
              <p className="text-xs text-text-muted truncate">{l.city}</p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 text-amber-200">
                  <Star className="h-3 w-3 fill-current" /> {l.rating}
                </span>
                <span className="text-text-muted">{formatNumber(l.totalReviews)} rev.</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${labelStyles(l.label)}`}>
                  {l.label}
                </span>
                <span className="text-xs font-mono text-text-secondary">{l.score.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UsageBar({ label, used, total, color }: { label: string; used: number; total: number; color: string }) {
  const pct = (used / total) * 100;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-text-secondary">{label}</span>
        <span className="text-text-muted">{formatNumber(used)} / {formatNumber(total)}</span>
      </div>
      <div className="h-2 rounded-full bg-bg-elevated overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function aggregate<T>(items: T[], fn: (item: T) => string) {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = fn(item);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function generateDailySeries() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((d, i) => ({
    label: d,
    value: 280 + Math.round(Math.sin(i * 0.9) * 80) + i * 35,
  }));
}
