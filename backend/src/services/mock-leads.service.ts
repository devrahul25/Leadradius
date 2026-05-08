/**
 * Server-side mock-lead generator. Used by `lead.service.search` when
 * USE_LIVE_PLACES is false, so the full app works end-to-end without a
 * Google API key. Mirrors the frontend's mock data shape.
 */
import { computeScore, labelFromScore, type LeadLabel } from "../utils/lead-scoring";
import { haversineKm } from "../utils/haversine";

const NAMES = [
  "Bansi Vihar Sweets", "Royal Mithai Bhandar", "Ghasitaram Halwai", "Mohanlal Sweets",
  "Pahalwan Mishtan Bhandar", "Kesar Restaurant", "Laxmi Misthan Bhandar", "Shree Nath Sweets",
  "Aapno Rajasthan", "Marwar Mithai", "Jaipur Sweet Mart", "Annapurna Bhog",
  "Govind Sweet House", "Madhuram Sweets", "Vrindavan Mithai", "Pink City Confectioners",
  "Heera Halwai", "Krishna Sweets", "Suraj Mithai", "Rajwadi Sweet Shop",
  "Bhagwati Mithai Bhandar", "Mevad Sweets", "Hotel Gokul", "Rang Mahal Mithai",
  "Banwari Lal Sweets", "Shanti Sweets", "Devi Mithai", "Chandni Confectionery",
  "Aravalli Sweets", "Maheshwari Mithai", "Udaipur Sweet Mart", "Dhanlaxmi Bhandar",
];

const CITIES = [
  { name: "Nathdwara", lat: 24.9302, lng: 73.8224 },
  { name: "Udaipur", lat: 24.5854, lng: 73.7125 },
  { name: "Rajsamand", lat: 25.0708, lng: 73.8806 },
  { name: "Chittorgarh", lat: 24.8887, lng: 74.6269 },
  { name: "Bhilwara", lat: 25.3463, lng: 74.6364 },
  { name: "Ajmer", lat: 26.4499, lng: 74.6399 },
];

const STREETS = ["Main Bazaar", "Old City Road", "Civil Lines", "Station Road", "Court Road", "Lake View Road"];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rand(seed: { v: number }) {
  let t = (seed.v += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function pick<T>(arr: T[], r: number): T {
  return arr[Math.floor(r * arr.length)];
}

function offsetLatLng(base: { lat: number; lng: number }, km: number, bearing: number) {
  const R = 6371;
  const ad = km / R;
  const lat1 = (base.lat * Math.PI) / 180;
  const lng1 = (base.lng * Math.PI) / 180;
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(ad) + Math.cos(lat1) * Math.sin(ad) * Math.cos(bearing));
  const lng2 = lng1 + Math.atan2(Math.sin(bearing) * Math.sin(ad) * Math.cos(lat1), Math.cos(ad) - Math.sin(lat1) * Math.sin(lat2));
  return { lat: (lat2 * 180) / Math.PI, lng: (lng2 * 180) / Math.PI };
}

export interface MockLead {
  placeId: string;
  name: string;
  category: string;
  rating: number;
  totalReviews: number;
  phone: string | null;
  website: string | null;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  score: number;
  leadLabel: LeadLabel;
}

interface Params {
  location: string;
  category: string;
  radiusKm: number;
  minRating: number;
  minReviews: number;
  requirePhone: boolean;
}

export function generateMockLeads(params: Params): MockLead[] {
  const seed = { v: hash(`${params.location}|${params.category}|${params.radiusKm}`) };
  const total = 60 + Math.floor(rand(seed) * 40);
  const center = CITIES[0];
  const out: MockLead[] = [];

  for (let i = 0; i < total; i++) {
    const distance = rand(seed) * params.radiusKm;
    const bearing = rand(seed) * Math.PI * 2;
    const point = offsetLatLng(center, distance, bearing);

    const rating = Math.min(5, Number((3.4 + rand(seed) * 1.6).toFixed(1)));
    const reviews = Math.floor(Math.pow(rand(seed), 1.6) * 1500) + 8;

    if (rating < params.minRating) continue;
    if (reviews < params.minReviews) continue;

    const score = computeScore(rating, reviews);
    const label = labelFromScore(score, rating, reviews);

    const hasPhone = rand(seed) > 0.18;
    if (params.requirePhone && !hasPhone) continue;

    const city = pick(CITIES, rand(seed));
    const name = pick(NAMES, rand(seed));
    const street = pick(STREETS, rand(seed));
    const placeId = `mock_${hash(name + i + city.name)}`;

    out.push({
      placeId,
      name,
      category: params.category,
      rating,
      totalReviews: reviews,
      phone: hasPhone
        ? `+91 ${Math.floor(70000 + rand(seed) * 29999)}-${Math.floor(10000 + rand(seed) * 89999)}`
        : null,
      website: rand(seed) > 0.55 ? `https://${name.toLowerCase().replace(/[^a-z]+/g, "")}.in` : null,
      address: `${name}, ${street}, ${city.name}, Rajasthan`,
      city: city.name,
      latitude: point.lat,
      longitude: point.lng,
      distanceKm: Number(haversineKm(center, point).toFixed(2)),
      score,
      leadLabel: label,
    });
  }

  return out.sort((a, b) => b.score - a.score);
}
