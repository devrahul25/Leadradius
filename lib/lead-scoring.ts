import type { BusinessLead, LeadLabel } from "./types";

/**
 * Lead score formula from spec:
 *   score = (rating * 20) + log(total_reviews + 1) * 10
 * Rating contributes up to 100, reviews contribute log-scaled boost.
 * Typical scores land in [60, 140].
 */
export function computeScore(rating: number, totalReviews: number): number {
  const r = Math.max(0, Math.min(5, rating || 0));
  const n = Math.max(0, totalReviews || 0);
  return Number((r * 20 + Math.log(n + 1) * 10).toFixed(1));
}

/** Bucket a lead into a quality label based on score + signals. */
export function labelFromScore(
  score: number,
  rating: number,
  reviews: number
): LeadLabel {
  if (score >= 110 && rating >= 4.4 && reviews >= 100) return "Premium Lead";
  if (score >= 95 && rating >= 4.2 && reviews >= 50) return "High Potential";
  if (score >= 75 && rating >= 4.0) return "Medium Quality";
  return "Low Priority";
}

/**
 * Cost-optimization gate from spec:
 *   if (rating >= 4.2 && total_reviews >= 80) fetchPhoneNumber();
 * Only call Place Details (the expensive endpoint) for promising leads.
 */
export function shouldFetchPlaceDetails(lead: Pick<BusinessLead, "rating" | "totalReviews">): boolean {
  return lead.rating >= 4.2 && lead.totalReviews >= 80;
}

/** Tailwind classes for label badges. Keep colors consistent across the app. */
export function labelStyles(label: LeadLabel): string {
  switch (label) {
    case "Premium Lead":
      return "bg-brand-600/15 text-brand-300 border-brand-500/30";
    case "High Potential":
      return "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30";
    case "Medium Quality":
      return "bg-accent-amber/10 text-accent-amber border-accent-amber/30";
    case "Low Priority":
      return "bg-text-muted/10 text-text-secondary border-border";
  }
}
