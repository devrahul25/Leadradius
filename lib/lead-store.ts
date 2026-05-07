"use client";

/**
 * Tiny client-side lead store backed by localStorage. Keeps last search results
 * available between /search and /leads. In production this would be replaced by
 * fetches against the real backend (e.g. /api/leads with TanStack Query).
 */

import type { BusinessLead } from "./types";
import { SEED_LEADS } from "./mock-data";

const KEY = "leadradius.leads";

export function getLeads(): BusinessLead[] {
  if (typeof window === "undefined") return SEED_LEADS;
  const raw = localStorage.getItem(KEY);
  if (!raw) return SEED_LEADS;
  try {
    return JSON.parse(raw) as BusinessLead[];
  } catch {
    return SEED_LEADS;
  }
}

export function setLeads(leads: BusinessLead[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(leads));
}

export function clearLeads() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
