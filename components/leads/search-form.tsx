"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Tag,
  Star,
  MessageSquare,
  Phone,
  Sparkles,
  Search as SearchIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import type { SearchParams, BusinessLead } from "@/lib/types";
import { searchLeads } from "@/lib/google-places";

interface Props {
  onComplete: (leads: BusinessLead[], params: SearchParams) => void;
}

const CATEGORIES = [
  "Sweet Shop",
  "Restaurant",
  "Salon",
  "Hotel",
  "Wedding Venue",
  "Real Estate Office",
  "Gym",
  "Cafe",
  "Boutique",
  "Pharmacy",
];

const QUICK_LOCATIONS = ["Nathdwara", "Udaipur", "Jaipur", "Jodhpur", "Mumbai", "Pune"];

export function SearchForm({ onComplete }: Props) {
  const [params, setParams] = useState<SearchParams>({
    location: "Nathdwara",
    radiusKm: 80,
    category: "Sweet Shop",
    minRating: 4.0,
    minReviews: 50,
    requirePhone: false,
  });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setProgress(0);

    // Simulated progress narration so the UI feels alive even on mock data.
    const steps: [number, string][] = [
      [15, "Geocoding location…"],
      [35, "Fetching nearby businesses…"],
      [55, "Scoring lead quality…"],
      [75, "Enriching premium leads with phone numbers…"],
      [92, "Filtering and ranking…"],
    ];
    for (const [pct, msg] of steps) {
      setProgress(pct);
      setStep(msg);
      await new Promise((r) => setTimeout(r, 350));
    }

    try {
      const leads = await searchLeads(params);
      setProgress(100);
      setStep(`Found ${leads.length} qualified leads`);
      await new Promise((r) => setTimeout(r, 250));
      onComplete(leads, params);
    } catch (err: any) {
      setProgress(100);
      if (err?.status === 401 || err?.message?.toLowerCase().includes("token")) {
        setStep("Authentication required. Redirecting to login...");
        await new Promise((r) => setTimeout(r, 1500));
        window.location.href = "/login";
        return; // Skip setting loading to false
      } else {
        setStep(err?.message || "An error occurred during search.");
        await new Promise((r) => setTimeout(r, 3000));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass p-6 lg:p-8 space-y-6 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

      <div>
        <Label htmlFor="location" hint="city, pincode or area">Location</Label>
        <Input
          id="location"
          value={params.location}
          onChange={(e) => setParams({ ...params, location: e.target.value })}
          leftIcon={<MapPin className="h-4 w-4" />}
          placeholder="e.g. Nathdwara, 313301"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {QUICK_LOCATIONS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setParams({ ...params, location: l })}
              className="text-xs px-2 py-1 rounded-md border border-border text-text-secondary hover:border-brand-500/40 hover:text-text-primary transition-colors"
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="category">Business category</Label>
          <Select
            id="category"
            value={params.category}
            onChange={(e) => setParams({ ...params, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="radius" hint={`${params.radiusKm} km`}>Radius</Label>
          <div className="h-10 flex items-center">
            <Slider
              id="radius"
              min={5}
              max={100}
              step={1}
              value={params.radiusKm}
              onChange={(e) => setParams({ ...params, radiusKm: Number(e.target.value) })}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-text-muted">
            <span>5 km</span>
            <span>50 km</span>
            <span>100 km</span>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="rating" hint={`${params.minRating.toFixed(1)} ★`}>Minimum rating</Label>
          <div className="h-10 flex items-center gap-3">
            <Star className="h-4 w-4 text-amber-300 fill-amber-300 shrink-0" />
            <Slider
              id="rating"
              min={3}
              max={5}
              step={0.1}
              value={params.minRating}
              onChange={(e) => setParams({ ...params, minRating: Number(e.target.value) })}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="reviews">Minimum reviews</Label>
          <Input
            id="reviews"
            type="number"
            min={0}
            value={params.minReviews}
            onChange={(e) => setParams({ ...params, minReviews: Number(e.target.value) || 0 })}
            leftIcon={<MessageSquare className="h-4 w-4" />}
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-bg-surface/40 p-4">
        <Switch
          checked={params.requirePhone}
          onChange={(v) => setParams({ ...params, requirePhone: v })}
          label="Phone number required"
          description="Only return leads with a contact number on record"
        />
        <Phone className="h-4 w-4 text-text-muted" />
      </div>

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
        <p className="text-xs text-text-muted">
          <Sparkles className="h-3 w-3 inline mr-1 text-brand-300" />
          AI scoring + Place Details fetched only for promising leads
        </p>
        <Button type="submit" loading={loading} size="lg">
          <SearchIcon className="h-4 w-4" />
          Find leads
        </Button>
      </div>

      {/* Search progress overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-bg-card/85 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-8"
          >
            <div className="relative h-14 w-14 mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-brand-500/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-500 animate-spin" />
              <SearchIcon className="absolute inset-0 m-auto h-5 w-5 text-brand-300" />
            </div>
            <p className="text-sm text-text-primary font-medium">{step}</p>
            <div className="mt-4 w-full max-w-xs h-1 rounded-full bg-bg-elevated overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-500 to-accent-cyan"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.35 }}
              />
            </div>
            <p className="text-xs text-text-muted mt-3">{progress}%</p>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
