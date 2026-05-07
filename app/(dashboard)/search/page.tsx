"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Star, Phone, Sparkles } from "lucide-react";
import { SearchForm } from "@/components/leads/search-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BusinessLead, SearchParams } from "@/lib/types";
import { setLeads } from "@/lib/lead-store";
import { labelStyles } from "@/lib/lead-scoring";
import { formatKm, formatNumber } from "@/lib/utils";

export default function SearchPage() {
  const router = useRouter();
  const [results, setResults] = useState<BusinessLead[] | null>(null);
  const [params, setParams] = useState<SearchParams | null>(null);

  function handleComplete(leads: BusinessLead[], p: SearchParams) {
    setResults(leads);
    setParams(p);
    setLeads(leads);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="text-xs uppercase tracking-widest text-brand-300 mb-1">Search</p>
        <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">Find leads in any radius</h1>
        <p className="text-text-secondary mt-2 max-w-2xl">
          Enter a location, pick a category, set your filters. We'll fetch from Google Places, score the results, and only spend Place Details credits on leads worth chasing.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SearchForm onComplete={handleComplete} />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="glass p-6">
            <h3 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-300" /> How scoring works
            </h3>
            <div className="space-y-3 text-sm">
              <div className="rounded-lg bg-bg-surface/60 border border-border p-3 font-mono text-xs">
                <span className="text-text-muted">score = </span>
                <span className="text-brand-300">rating × 20</span>
                <span className="text-text-muted"> + </span>
                <span className="text-accent-cyan">log(reviews + 1) × 10</span>
              </div>
              <p className="text-text-muted text-xs leading-relaxed">
                Rating contributes up to 100 points. Reviews give a logarithmic
                boost — diminishing returns after a few hundred. The result
                buckets into <strong className="text-text-secondary">Premium</strong>,{" "}
                <strong className="text-text-secondary">High Potential</strong>,{" "}
                <strong className="text-text-secondary">Medium</strong> and{" "}
                <strong className="text-text-secondary">Low Priority</strong>.
              </p>
            </div>
          </div>

          <div className="glass p-6">
            <h3 className="text-sm font-medium text-text-secondary mb-4">Cost optimization</h3>
            <p className="text-xs text-text-muted leading-relaxed mb-3">
              Place Details (the costly endpoint) is only called when{" "}
              <span className="text-brand-300 font-mono">rating ≥ 4.2</span> and{" "}
              <span className="text-brand-300 font-mono">reviews ≥ 80</span>.
              Typical savings: 60-80% of API cost.
            </p>
            <div className="text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Nearby Search</span>
                <span className="text-accent-emerald font-mono">~₹2.50 / call</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Place Details</span>
                <span className="text-accent-amber font-mono">~₹14 / call</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {results && params && (
        <ResultsPreview leads={results} params={params} onView={() => router.push("/leads")} />
      )}
    </div>
  );
}

function ResultsPreview({
  leads,
  params,
  onView,
}: {
  leads: BusinessLead[];
  params: SearchParams;
  onView: () => void;
}) {
  const top = leads.slice(0, 6);
  const premium = leads.filter((l) => l.label === "Premium Lead").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass p-6 lg:p-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div>
          <Badge className="border-accent-emerald/30 bg-accent-emerald/10 text-accent-emerald mb-2">
            Search complete
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight">
            <span className="gradient-text">{leads.length}</span> leads near {params.location}
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            {premium} premium · within {params.radiusKm} km · category: {params.category}
          </p>
        </div>
        <Button onClick={onView}>
          View all leads <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {top.map((l, i) => (
          <motion.div
            key={l.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-xl border border-border bg-bg-surface/40 p-4 hover:border-brand-500/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <p className="font-medium text-text-primary truncate">{l.name}</p>
                <p className="text-xs text-text-muted truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" /> {l.city} · {formatKm(l.distanceKm)}
                </p>
              </div>
              <span className={`shrink-0 inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${labelStyles(l.label)}`}>
                {l.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-text-secondary">
              <span className="inline-flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-300 text-amber-300" /> {l.rating}
              </span>
              <span>{formatNumber(l.totalReviews)} reviews</span>
              {l.phone && (
                <span className="inline-flex items-center gap-1 text-accent-emerald ml-auto">
                  <Phone className="h-3 w-3" />
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
