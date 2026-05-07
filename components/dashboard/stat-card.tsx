"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number; // percent change vs previous period
  hint?: string;
  icon?: LucideIcon;
  accent?: "brand" | "cyan" | "emerald" | "amber" | "rose";
  delay?: number;
}

const accents = {
  brand: "from-brand-500/20 to-brand-500/0 text-brand-300",
  cyan: "from-accent-cyan/20 to-accent-cyan/0 text-accent-cyan",
  emerald: "from-accent-emerald/20 to-accent-emerald/0 text-accent-emerald",
  amber: "from-accent-amber/20 to-accent-amber/0 text-accent-amber",
  rose: "from-accent-rose/20 to-accent-rose/0 text-accent-rose",
};

export function StatCard({
  label,
  value,
  delta,
  hint,
  icon: Icon,
  accent = "brand",
  delay = 0,
}: StatCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="relative overflow-hidden glass p-5"
    >
      <div className={cn("absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl bg-gradient-to-br pointer-events-none", accents[accent])} />
      <div className="relative flex items-start justify-between">
        <div className="space-y-2 min-w-0">
          <p className="text-xs uppercase tracking-wider text-text-muted">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-text-primary">{value}</p>
          {(delta !== undefined || hint) && (
            <div className="flex items-center gap-2 text-xs">
              {delta !== undefined && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 font-medium",
                    positive ? "text-accent-emerald" : "text-accent-rose"
                  )}
                >
                  {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(delta).toFixed(1)}%
                </span>
              )}
              {hint && <span className="text-text-muted truncate">{hint}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center bg-bg-elevated border border-border", accents[accent].split(" ").pop())}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
