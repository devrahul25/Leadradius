"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Database,
  Download,
  Filter,
  Phone,
  Plus,
  Search as SearchIcon,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LeadTable } from "@/components/leads/lead-table";
import { getLeads } from "@/lib/lead-store";
import type { BusinessLead, LeadLabel } from "@/lib/types";
import { downloadFile, formatNumber, toCsv } from "@/lib/utils";

const LABEL_FILTERS: (LeadLabel | "All")[] = [
  "All",
  "Premium Lead",
  "High Potential",
  "Medium Quality",
  "Low Priority",
];

export default function LeadsPage() {
  const [data, setData] = useState<BusinessLead[]>([]);
  const [filter, setFilter] = useState<LeadLabel | "All">("All");
  const [selected, setSelected] = useState<BusinessLead[]>([]);

  useEffect(() => {
    setData(getLeads());
  }, []);

  const filtered = useMemo(() => {
    if (filter === "All") return data;
    return data.filter((l) => l.label === filter);
  }, [data, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: data.length };
    for (const l of data) c[l.label] = (c[l.label] ?? 0) + 1;
    return c;
  }, [data]);

  const summary = useMemo(() => {
    const withPhone = filtered.filter((l) => l.phone).length;
    const avgRating = filtered.length
      ? filtered.reduce((s, l) => s + l.rating, 0) / filtered.length
      : 0;
    const premium = filtered.filter((l) => l.label === "Premium Lead").length;
    return { total: filtered.length, withPhone, avgRating, premium };
  }, [filtered]);

  function exportCSV() {
    const rows = (selected.length ? selected : filtered);
    const csv = toCsv(rows as unknown as Record<string, unknown>[], [
      { key: "name", header: "Business" },
      { key: "category", header: "Category" },
      { key: "rating", header: "Rating" },
      { key: "totalReviews", header: "Reviews" },
      { key: "phone", header: "Phone" },
      { key: "address", header: "Address" },
      { key: "city", header: "City" },
      { key: "distanceKm", header: "Distance (km)" },
      { key: "score", header: "Score" },
      { key: "label", header: "Quality" },
      { key: "status", header: "Status" },
      { key: "website", header: "Website" },
    ]);
    downloadFile(`leadradius-${Date.now()}.csv`, csv);
  }

  function copyAllPhones() {
    const phones = (selected.length ? selected : filtered)
      .map((l) => l.phone)
      .filter(Boolean)
      .join("\n");
    if (phones) navigator.clipboard?.writeText(phones);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-300 mb-1">Saved leads</p>
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">
            Your lead pipeline
          </h1>
          <p className="text-text-secondary mt-2">
            Sort, filter, and export. Click any phone to copy it.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={copyAllPhones} disabled={!filtered.length}>
            <Phone className="h-4 w-4" /> Copy phones
          </Button>
          <Button variant="secondary" onClick={exportCSV} disabled={!filtered.length}>
            <Download className="h-4 w-4" />
            Export CSV {selected.length ? `(${selected.length})` : ""}
          </Button>
          <Link href="/search">
            <Button>
              <Plus className="h-4 w-4" /> New search
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Database className="h-4 w-4 text-brand-300" />} label="Total" value={formatNumber(summary.total)} />
        <Stat icon={<Sparkles className="h-4 w-4 text-accent-cyan" />} label="Premium" value={formatNumber(summary.premium)} />
        <Stat icon={<Star className="h-4 w-4 text-accent-amber" />} label="Avg. rating" value={summary.avgRating.toFixed(2)} />
        <Stat icon={<Phone className="h-4 w-4 text-accent-emerald" />} label="With phone" value={`${formatNumber(summary.withPhone)}`} />
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-text-muted" />
        {LABEL_FILTERS.map((l) => {
          const active = filter === l;
          return (
            <button
              key={l}
              onClick={() => setFilter(l)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                active
                  ? "bg-brand-600/15 border-brand-500/40 text-brand-200"
                  : "border-border text-text-secondary hover:border-brand-500/30 hover:text-text-primary"
              }`}
            >
              {l}{" "}
              <span className={`text-[10px] ml-1 ${active ? "text-brand-300" : "text-text-muted"}`}>
                {counts[l] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {data.length === 0 ? <EmptyState /> : <LeadTable data={filtered} onSelectionChange={setSelected} />}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass p-4 flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-bg-elevated border border-border flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-text-muted">{label}</p>
        <p className="text-lg font-semibold text-text-primary">{value}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass p-12 text-center">
      <div className="mx-auto h-12 w-12 rounded-xl bg-bg-elevated border border-border flex items-center justify-center mb-4">
        <SearchIcon className="h-5 w-5 text-text-muted" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">No leads yet</h3>
      <p className="text-sm text-text-muted mb-5">Run your first radius search to populate this table.</p>
      <Link href="/search">
        <Button>
          <Plus className="h-4 w-4" /> New search
        </Button>
      </Link>
    </div>
  );
}
