import axios, { AxiosError } from "axios";
import { env } from "../config/env";
import { ApiError } from "../utils/api-error";
import { cached } from "../utils/cache";
import { logger } from "../config/logger";

/**
 * Thin Google Places client. All three endpoints are cached in Redis for 12h
 * (configurable via CACHE_TTL_SECONDS) to avoid repeating expensive calls for
 * the same input.
 */

const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const NEARBY_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
const DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";

export interface GeocodeResult {
  lat: number;
  lng: number;
  formatted: string;
}

export interface NearbyPlace {
  place_id: string;
  name: string;
  types?: string[];
  rating?: number;
  user_ratings_total?: number;
  vicinity?: string;
  geometry?: { location: { lat: number; lng: number } };
  business_status?: string;
}

export interface PlaceDetails {
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  formatted_address?: string;
  opening_hours?: { weekday_text?: string[] };
}

import { settingsService } from "./settings.service";

const isLive = () => {
  const settings = settingsService.getSettings();
  return settings.useLivePlaces && !!settings.googleApiKey;
};

const getApiKey = () => {
  return settingsService.getSettings().googleApiKey;
};

function ensureLive() {
  if (!isLive()) {
    throw ApiError.badRequest(
      "Live Google Places integration is disabled. Update Settings to enable."
    );
  }
}

function handleAxios(err: unknown, op: string): never {
  if (err instanceof AxiosError) {
    logger.error(`Google ${op} failed`, {
      status: err.response?.status,
      data: err.response?.data,
    });
    throw ApiError.internal(`Google ${op} request failed`, {
      status: err.response?.status,
    });
  }
  throw err;
}

export const googlePlacesService = {
  isLive,

  async geocode(location: string): Promise<GeocodeResult> {
    ensureLive();
    return cached(`geocode:${location.toLowerCase()}`, async () => {
      try {
        const res = await axios.get(GEOCODE_URL, {
          params: { address: location, key: getApiKey() },
          timeout: 8000,
        });
        const r = res.data?.results?.[0];
        if (!r) throw ApiError.badRequest(`Could not geocode "${location}"`);
        return {
          lat: r.geometry.location.lat,
          lng: r.geometry.location.lng,
          formatted: r.formatted_address,
        };
      } catch (err) {
        return handleAxios(err, "Geocode");
      }
    });
  },

  async nearbySearch(
    center: { lat: number; lng: number },
    radiusMeters: number,
    keyword: string
  ): Promise<NearbyPlace[]> {
    ensureLive();
    const cacheKey = `nearby:${center.lat.toFixed(4)},${center.lng.toFixed(4)}:${radiusMeters}:${keyword.toLowerCase()}`;
    return cached(cacheKey, async () => {
      try {
        const res = await axios.get(NEARBY_URL, {
          params: {
            location: `${center.lat},${center.lng}`,
            radius: radiusMeters,
            keyword,
            key: getApiKey(),
          },
          timeout: 8000,
        });
        return (res.data?.results ?? []) as NearbyPlace[];
      } catch (err) {
        return handleAxios(err, "Nearby Search");
      }
    });
  },

  async placeDetails(placeId: string): Promise<PlaceDetails> {
    ensureLive();
    return cached(`details:${placeId}`, async () => {
      try {
        const fields = [
          "formatted_phone_number",
          "international_phone_number",
          "website",
          "opening_hours",
          "formatted_address",
        ].join(",");
        const res = await axios.get(DETAILS_URL, {
          params: { place_id: placeId, fields, key: getApiKey() },
          timeout: 8000,
        });
        return (res.data?.result ?? {}) as PlaceDetails;
      } catch (err) {
        return handleAxios(err, "Place Details");
      }
    });
  },
};
