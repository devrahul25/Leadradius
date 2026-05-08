/**
 * Server-side lead scoring — mirrors the formula used in the frontend.
 *   score = (rating * 20) + log(reviews + 1) * 10
 * Buckets into Premium / High Potential / Medium / Low Priority.
 */

export type LeadLabel = "Premium Lead" | "High Potential" | "Medium Quality" | "Low Priority";

export function computeScore(rating: number | null | undefined, reviews: number | null | undefined): number {
  const r = Math.max(0, Math.min(5, Number(rating ?? 0)));
  const n = Math.max(0, Number(reviews ?? 0));
  return Number((r * 20 + Math.log(n + 1) * 10).toFixed(1));
}

export function labelFromScore(score: number, rating: number, reviews: number): LeadLabel {
  if (score >= 110 && rating >= 4.4 && reviews >= 100) return "Premium Lead";
  if (score >= 95 && rating >= 4.2 && reviews >= 50) return "High Potential";
  if (score >= 75 && rating >= 4.0) return "Medium Quality";
  return "Low Priority";
}

/**
 * Cost-optimisation gate from the spec:
 *   if (rating >= 4.2 && totalReviews >= 80) fetchPlaceDetails();
 * Place Details is the expensive endpoint — only spend the credits on
 * leads that are worth contacting anyway.
 */
export function shouldFetchPlaceDetails(rating: number, reviews: number): boolean {
  return rating >= 4.2 && reviews >= 80;
}
