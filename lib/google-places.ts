/**
 * Google Places integration.
 *
 * IMPORTANT: For a real production app, NEVER call Google Places directly from
 * the browser — your API key would be exposed. The functions below model the
 * shape of the integration so you can drop them into a Next.js route handler
 * (e.g. /api/leads/search) where the key stays server-side.
 *
 * In the prototype, when NEXT_PUBLIC_USE_LIVE_PLACES !== "true" we fall back
 * to mock data so the app runs immediately.
 *
 * Endpoints used:
 *   - Geocoding:    https://maps.googleapis.com/maps/api/geocode/json
 *   - Nearby:       https://maps.googleapis.com/maps/api/place/nearbysearch/json
 *   - Details:      https://maps.googleapis.com/maps/api/place/details/json
 */

import { computeScore, labelFromScore, shouldFetchPlaceDetails } from "./lead-scoring";
import { generateMockLeads } from "./mock-data";
import type { BusinessLead, SearchParams } from "./types";
import { haversineKm } from "./utils";

const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const NEARBY_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
const DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";

const apiKey = () => process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? "";
const useLive = () => process.env.NEXT_PUBLIC_USE_LIVE_PLACES === "true" && !!apiKey();

interface GeocodeResult {
  lat: number;
  lng: number;
  formatted: string;
}

export async function geocode(location: string): Promise<GeocodeResult> {
  if (!useLive()) {
    // Stub: pretend everything resolves to Nathdwara as a default.
    return { lat: 24.9302, lng: 73.8224, formatted: location };
  }
  const url = `${GEOCODE_URL}?address=${encodeURIComponent(location)}&key=${apiKey()}`;
  const res = await fetch(url);
  const json = await res.json();
  const r = json.results?.[0];
  if (!r) throw new Error(`Geocode failed for "${location}"`);
  return {
    lat: r.geometry.location.lat,
    lng: r.geometry.location.lng,
    formatted: r.formatted_address,
  };
}

interface NearbyPlace {
  place_id: string;
  name: string;
  types?: string[];
  rating?: number;
  user_ratings_total?: number;
  vicinity?: string;
  geometry?: { location: { lat: number; lng: number } };
  business_status?: string;
}

async function nearbySearch(
  center: { lat: number; lng: number },
  radiusM: number,
  keyword: string
): Promise<NearbyPlace[]> {
  const url =
    `${NEARBY_URL}?location=${center.lat},${center.lng}` +
    `&radius=${radiusM}&keyword=${encodeURIComponent(keyword)}&key=${apiKey()}`;
  const res = await fetch(url);
  const json = await res.json();
  return (json.results ?? []) as NearbyPlace[];
}

async function placeDetails(placeId: string) {
  const fields = [
    "formatted_phone_number",
    "international_phone_number",
    "website",
    "opening_hours",
    "formatted_address",
  ].join(",");
  const url = `${DETAILS_URL}?place_id=${placeId}&fields=${fields}&key=${apiKey()}`;
  const res = await fetch(url);
  const json = await res.json();
  return json.result ?? {};
}

/**
 * High-level search used by the UI. Returns scored, labelled leads.
 * Falls back to mock data when no API key is configured.
 */
export async function searchLeads(params: SearchParams): Promise<BusinessLead[]> {
  if (!useLive()) {
    return generateMockLeads(params);
  }

  const center = await geocode(params.location);
  const places = await nearbySearch(
    center,
    params.radiusKm * 1000,
    params.category
  );

  const leads: BusinessLead[] = [];
  for (const p of places) {
    const rating = p.rating ?? 0;
    const reviews = p.user_ratings_total ?? 0;

    // Apply the cheap filters BEFORE we hit the expensive Details endpoint.
    if (rating < params.minRating) continue;
    if (reviews < params.minReviews) continue;
    if (p.business_status && p.business_status !== "OPERATIONAL") continue;

    const lat = p.geometry?.location.lat ?? center.lat;
    const lng = p.geometry?.location.lng ?? center.lng;
    const distanceKm = haversineKm(center, { lat, lng });
    const score = computeScore(rating, reviews);
    const label = labelFromScore(score, rating, reviews);

    let phone: string | undefined;
    let website: string | undefined;
    let hours: string | undefined;
    let address = p.vicinity ?? "";

    // Cost optimization: only fetch details for promising leads.
    if (shouldFetchPlaceDetails({ rating, totalReviews: reviews })) {
      const details = await placeDetails(p.place_id);
      phone = details.formatted_phone_number;
      website = details.website;
      hours = details.opening_hours?.weekday_text?.join("; ");
      address = details.formatted_address ?? address;
    }

    if (params.requirePhone && !phone) continue;

    leads.push({
      id: p.place_id,
      placeId: p.place_id,
      name: p.name,
      category: p.types?.[0] ?? params.category,
      rating,
      totalReviews: reviews,
      phone,
      address,
      city: address.split(",").slice(-2, -1)[0]?.trim() ?? "",
      latitude: lat,
      longitude: lng,
      distanceKm,
      score,
      label,
      status: "new",
      source: "google_places",
      createdAt: new Date().toISOString(),
      website,
      hours,
    });
  }

  return leads.sort((a, b) => b.score - a.score);
}
