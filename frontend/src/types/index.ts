// src/types/index.ts
export interface Property {
    id: number;
    title: string;
    location: {
      latitude: number;
      longitude: number;
    };
    price: number;
    bedrooms: number;
    type: string;
    bathrooms?: number;
    land_area: number;
    certificate: string;
    building_area: number;
    climate_risk_score: number;
    address?: string;
    district?: string;
    city?: string;
    climate_scores?: {
      lst_score: number | null;
      ndvi_score: number | null;
      utfvi_score: number | null;
      uhi_score: number | null;
      overall_score: number | null;
    };
    risks: {
      surface_temperature: string;
      heat_stress: string;
      green_cover: string;
      heat_zone: string;
    };
  }
  
  // Climate layer types for map display
  export type ClimateLayerType = 'lst' | 'ndvi' | 'uhi' | 'utfvi' | undefined;