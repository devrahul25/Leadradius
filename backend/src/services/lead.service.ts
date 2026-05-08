import { googlePlacesService, type NearbyPlace } from "./google-places.service";
import { leadRepository, type ListFilters, type ListOptions } from "../repositories/lead.repository";
import { searchHistoryRepository } from "../repositories/search-history.repository";
import {
  computeScore,
  labelFromScore,
  shouldFetchPlaceDetails,
} from "../utils/lead-scoring";
import { haversineKm } from "../utils/haversine";
import { ApiError } from "../utils/api-error";
import { logger } from "../config/logger";
import { generateMockLeads } from "./mock-leads.service";

export interface SearchInput {
  userId: number;
  location: string;
  radiusKm: number;
  category: string;
  minRating: number;
  minReviews: number;
  requirePhone: boolean;
}

export interface SearchResult {
  saved: number;
  apiCalls: number;
  geocodedTo: { lat: number; lng: number; formatted: string };
}

export const leadService = {
  /**
   * The whole search flow:
   *   1. Geocode location → lat/lng
   *   2. Nearby Search at the given radius
   *   3. Cheap-filter (rating, reviews, status, phone)
   *   4. For high-quality leads only, hit Place Details (cost optimisation)
   *   5. Score, label, persist (upsert by placeId, dedupes for free)
   *   6. Log to SearchHistory
   */
  async search(input: SearchInput): Promise<SearchResult> {
    const { userId, location, radiusKm, category, minRating, minReviews, requirePhone } = input;

    // Mock fallback: when no Google API key is configured we still want the
    // full app to work end-to-end. Generate believable seeded data, persist
    // it, and log it as a normal search.
    if (!googlePlacesService.isLive()) {
      const mocks = generateMockLeads({
        location,
        category,
        radiusKm,
        minRating,
        minReviews,
        requirePhone,
      });
      let saved = 0;
      for (const m of mocks) {
        await leadRepository.upsert({
          placeId: m.placeId,
          name: m.name,
          category: m.category,
          rating: m.rating,
          totalReviews: m.totalReviews,
          phone: m.phone,
          website: m.website,
          address: m.address,
          city: m.city,
          latitude: m.latitude,
          longitude: m.longitude,
          distanceKm: m.distanceKm,
          score: m.score,
          leadLabel: m.leadLabel,
          status: "active",
          source: "mock",
        });
        saved += 1;
      }
      await searchHistoryRepository.create({
        userId,
        keyword: category,
        location,
        radius: radiusKm,
        totalLeads: saved,
        apiCalls: 0,
      });
      logger.info("Mock search complete", { saved, location, category });
      return { saved, apiCalls: 0, geocodedTo: { lat: 0, lng: 0, formatted: location } };
    }

    const center = await googlePlacesService.geocode(location);
    let apiCalls = 1; // geocode

    const places = await googlePlacesService.nearbySearch(center, radiusKm * 1000, category);
    apiCalls += 1; // nearby

    const accepted: Array<NearbyPlace & { phone?: string; website?: string; address?: string }> = [];
    for (const p of places) {
      const rating = p.rating ?? 0;
      const reviews = p.user_ratings_total ?? 0;
      if (rating < minRating || reviews < minReviews) continue;
      if (p.business_status && p.business_status !== "OPERATIONAL") continue;

      let phone: string | undefined;
      let website: string | undefined;
      let address = p.vicinity;

      if (shouldFetchPlaceDetails(rating, reviews)) {
        try {
          const d = await googlePlacesService.placeDetails(p.place_id);
          apiCalls += 1;
          phone = d.formatted_phone_number ?? d.international_phone_number;
          website = d.website;
          address = d.formatted_address ?? address;
        } catch (err) {
          logger.warn("Place Details fetch failed", { placeId: p.place_id, err: (err as Error).message });
        }
      }

      if (requirePhone && !phone) continue;
      accepted.push({ ...p, phone, website, address });
    }

    let saved = 0;
    for (const p of accepted) {
      const rating = p.rating ?? 0;
      const reviews = p.user_ratings_total ?? 0;
      const score = computeScore(rating, reviews);
      const label = labelFromScore(score, rating, reviews);
      const lat = p.geometry?.location.lat ?? center.lat;
      const lng = p.geometry?.location.lng ?? center.lng;
      const distance = haversineKm(center, { lat, lng });

      await leadRepository.upsert({
        placeId: p.place_id,
        name: p.name,
        category: p.types?.[0] ?? category,
        rating,
        totalReviews: reviews,
        phone: p.phone,
        website: p.website,
        address: p.address ?? null,
        city: (p.address ?? "").split(",").slice(-2, -1)[0]?.trim() ?? null,
        latitude: lat,
        longitude: lng,
        distanceKm: distance,
        score,
        leadLabel: label,
        status: "active",
        source: "google",
      });
      saved += 1;
    }

    await searchHistoryRepository.create({
      userId,
      keyword: category,
      location,
      radius: radiusKm,
      totalLeads: saved,
      apiCalls,
    });

    return { saved, apiCalls, geocodedTo: center };
  },

  list(filters: ListFilters, options: ListOptions) {
    return Promise.all([leadRepository.list(filters, options), leadRepository.count(filters)]);
  },

  async getById(id: number) {
    const lead = await leadRepository.findById(id);
    if (!lead) throw ApiError.notFound("Lead not found");
    return lead;
  },

  async remove(id: number): Promise<void> {
    await leadRepository.delete(id);
  },
};
