export interface Medicine {
  id: number;
  name: string;
  generic_name: string;
  manufacturer?: string;
  category?: string;
  brief_use?: string | null;
  side_effects?: string | null;
  description?: string | null;
  lowest_price: number | null;
  highest_price?: number | null;
  available_pharmacies: number;
  total_pharmacies?: number;
  savings_percent?: number;
}

export interface Pharmacy {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  type?: string;
  price?: number;
  in_stock?: number;
  distance: number;
  rating?: number;
  open_hours?: string;
}

export interface OnlinePlatformLink {
  name: string;
  url: string;
}

export interface PrescriptionAnalysis {
  extractedText: string;
  matchedMedicines: Medicine[];
}

export interface ApiResults<T> {
  results?: T[];
}

export interface MedicinePriceComparisonResponse {
  medicine: Medicine;
  localPrices: Pharmacy[];
  onlinePlatforms: OnlinePlatformLink[];
}
