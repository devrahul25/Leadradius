export type LeadLabel =
  | "Premium Lead"
  | "High Potential"
  | "Medium Quality"
  | "Low Priority";

export type LeadStatus = "new" | "contacted" | "qualified" | "rejected";

export interface BusinessLead {
  id: string;
  placeId: string;
  name: string;
  category: string;
  rating: number;
  totalReviews: number;
  phone?: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  score: number;
  label: LeadLabel;
  status: LeadStatus;
  source: "google_places" | "mock" | "import";
  createdAt: string;
  website?: string;
  hours?: string;
}

export interface SearchParams {
  location: string;
  radiusKm: number;
  category: string;
  minRating: number;
  minReviews: number;
  requirePhone: boolean;
}

export interface SearchSummary {
  total: number;
  premium: number;
  highPotential: number;
  medium: number;
  low: number;
  avgRating: number;
  apiCalls: number;
  apiCost: number; // in INR
}
