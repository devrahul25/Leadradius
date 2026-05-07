import { computeScore, labelFromScore } from "./lead-scoring";
import type { BusinessLead, SearchParams } from "./types";

/**
 * Realistic-feeling mock business data. Centered on Rajasthan to match the
 * spec's "Sweet Shops near Nathdwara" example, but the generator produces
 * results within any radius the user picks.
 */

const NAMES = [
  "Bansi Vihar Sweets", "Royal Mithai Bhandar", "Ghasitaram Halwai", "Mohanlal Sweets",
  "Pahalwan Mishtan Bhandar", "Kesar Restaurant", "Laxmi Misthan Bhandar", "Shree Nath Sweets",
  "Aapno Rajasthan", "Marwar Mithai", "Jaipur Sweet Mart", "Annapurna Bhog",
  "Govind Sweet House", "Madhuram Sweets", "Vrindavan Mithai", "Pink City Confectioners",
  "Heera Halwai", "Krishna Sweets", "Suraj Mithai", "Rajwadi Sweet Shop",
  "Bhagwati Mithai Bhandar", "Mevad Sweets", "Hotel Gokul", "Rang Mahal Mithai",
  "Banwari Lal Sweets", "Shanti Sweets", "Devi Mithai", "Chandni Confectionery",
  "Aravalli Sweets", "Maheshwari Mithai", "Udaipur Sweet Mart", "Dhanlaxmi Bhandar",
  "Rasili Mithai", "Govind Mishthan", "Shri Ram Sweets", "Lassiwala Bhandar",
  "Mishti Junction", "Sweet Cravings", "The Halwai Co", "Mithai Magic",
];

const CITIES = [
  { name: "Nathdwara", lat: 24.9302, lng: 73.8224 },
  { name: "Udaipur", lat: 24.5854, lng: 73.7125 },
  { name: "Rajsamand", lat: 25.0708, lng: 73.8806 },
  { name: "Chittorgarh", lat: 24.8887, lng: 74.6269 },
  { name: "Bhilwara", lat: 25.3463, lng: 74.6364 },
  { name: "Ajmer", lat: 26.4499, lng: 74.6399 },
  { name: "Jodhpur", lat: 26.2389, lng: 73.0243 },
  { name: "Pali", lat: 25.7711, lng: 73.3234 },
];

const STREET_HINTS = [
  "Main Bazaar", "Old City Road", "Civil Lines", "Station Road", "Court Road",
  "Mandir Marg", "Lake View Road", "Bus Stand Circle", "Hospital Road", "School Lane",
];

function rand(seed: { v: number }) {
  // Mulberry32 — deterministic for stable mock results across renders.
  let t = (seed.v += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function pick<T>(arr: T[], r: number): T {
  return arr[Math.floor(r * arr.length)];
}

function offsetLatLng(
  base: { lat: number; lng: number },
  km: number,
  bearingRad: number
) {
  const earthR = 6371;
  const angDist = km / earthR;
  const lat1 = (base.lat * Math.PI) / 180;
  const lng1 = (base.lng * Math.PI) / 180;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angDist) +
      Math.cos(lat1) * Math.sin(angDist) * Math.cos(bearingRad)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(angDist) * Math.cos(lat1),
      Math.cos(angDist) - Math.sin(lat1) * Math.sin(lat2)
    );
  return { lat: (lat2 * 180) / Math.PI, lng: (lng2 * 180) / Math.PI };
}

export function generateMockLeads(params: SearchParams): BusinessLead[] {
  const seed = { v: hash(`${params.location}|${params.category}|${params.radiusKm}`) };
  const count = 60 + Math.floor(rand(seed) * 40); // 60–100 results
  const center = CITIES[0];
  const leads: BusinessLead[] = [];

  for (let i = 0; i < count; i++) {
    const distance = rand(seed) * params.radiusKm;
    const bearing = rand(seed) * Math.PI * 2;
    const point = offsetLatLng(center, distance, bearing);

    const ratingBase = 3.4 + rand(seed) * 1.6;
    const rating = Math.min(5, Number(ratingBase.toFixed(1)));
    const reviews = Math.floor(Math.pow(rand(seed), 1.6) * 1500) + 8;
    const score = computeScore(rating, reviews);
    const label = labelFromScore(score, rating, reviews);

    if (rating < params.minRating) continue;
    if (reviews < params.minReviews) continue;

    const hasPhone = rand(seed) > 0.18;
    if (params.requirePhone && !hasPhone) continue;

    const city = pick(CITIES, rand(seed));
    const street = pick(STREET_HINTS, rand(seed));
    const name = pick(NAMES, rand(seed));
    const id = `mock_${i}_${Math.floor(rand(seed) * 1e9)}`;

    leads.push({
      id,
      placeId: id,
      name,
      category: params.category || "Sweet Shop",
      rating,
      totalReviews: reviews,
      phone: hasPhone
        ? `+91 ${Math.floor(70000 + rand(seed) * 29999)}-${Math.floor(10000 + rand(seed) * 89999)}`
        : undefined,
      address: `${name}, ${street}, ${city.name}, Rajasthan`,
      city: city.name,
      latitude: point.lat,
      longitude: point.lng,
      distanceKm: Number(distance.toFixed(2)),
      score,
      label,
      status: "new",
      source: "mock",
      createdAt: new Date(Date.now() - i * 1000 * 60 * 7).toISOString(),
      website: rand(seed) > 0.55 ? `https://${name.toLowerCase().replace(/[^a-z]+/g, "")}.in` : undefined,
      hours: rand(seed) > 0.5 ? "Mon–Sun · 8 AM – 10 PM" : undefined,
    });
  }

  return leads.sort((a, b) => b.score - a.score);
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A small static set used to seed the dashboard before any search runs. */
export const SEED_LEADS = generateMockLeads({
  location: "Nathdwara",
  radiusKm: 80,
  category: "Sweet Shop",
  minRating: 3.5,
  minReviews: 10,
  requirePhone: false,
});
