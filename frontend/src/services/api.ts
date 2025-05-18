
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Generic fetch handler with error handling
async function fetchFromAPI<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return data;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      console.error('Raw response:', text);
      throw new Error('Failed to parse API response');
    }
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Property API
export const propertyAPI = {
  // Get all properties with optional filtering
  getProperties: async (params: Record<string, any> = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add each parameter to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchFromAPI<any>(`/api/properties${query}`);
  },
  
  // Get a single property by ID
  getProperty: async (id: number) => {
    return fetchFromAPI<any>(`/api/properties/${id}`);
  },

  // Get Bandung properties
  getBandungProperties: async () => {
    return fetchFromAPI<any>('/api/properties/bandung');
  },
  
  // Compare multiple properties
  compareProperties: async (ids: number[]) => {
    const idString = ids.join(',');
    return fetchFromAPI<any>(`/api/properties/compare?ids=${idString}`);
  },

  getPropertyById: async (id: number) => {
    return fetchFromAPI<any>(`/api/properties/${id}`);
  },
  
  // Predict property price
  predictPrice: async (propertyData: Record<string, any>) => {
    return fetchFromAPI<any>('/api/price/predict', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  }
};

export const climateAPI = {
  // Get available risk layers for map
  getRiskLayers: async () => {
    return fetchFromAPI<any>('/api/climate/risk-layers');
  },
  
  // Get climate scores for a specific location
  getLocationScores: async (latitude: number, longitude: number) => {
    return fetchFromAPI<{
      status: string;
      data: {
        lst_score: number;
        ndvi_score: number;
        utfvi_score: number;
        uhi_score: number;
        overall_score: number;
      }
    }>(`/api/climate/scores?lat=${latitude}&lng=${longitude}`);
  }
};

// Analytics API - Updated with real data endpoints
export const analyticsAPI = {
  // Get price by district
  getPriceByDistrict: async () => {
    return fetchFromAPI<any>('/api/analytics/price-by-district');
  },
  
  // Get climate scores by district
  getClimateByDistrict: async () => {
    return fetchFromAPI<any>('/api/analytics/climate-by-district');
  },
  
  // Get price distribution and property types
  getPropertyDistribution: async () => {
    return fetchFromAPI<any>('/api/analytics/price-distribution');
  },
  
  // Get bedroom distribution
  getBedroomDistribution: async () => {
    return fetchFromAPI<any>('/api/analytics/bedroom-distribution');
  },
  
  // Get climate impact on property prices
  getClimateImpact: async () => {
    return fetchFromAPI<any>('/api/analytics/climate-impact');
  },
  
  // Get dashboard summary statistics
  getDashboardSummary: async () => {
    return fetchFromAPI<any>('/api/analytics/dashboard-summary');
  }
};

export const developerAPI = {
  // Predict property price
  predictPrice: async (data: {
  location: { latitude: number; longitude: number };
  bedrooms: number;
  landArea: number;
  certificate: string;
  propertyType: string;
  landPricePerMeter: number;
  climateScores?: Record<string, number | null>;
  city: string;
  district: string;
}) => {
  return fetchFromAPI<{
    message: string;
    status: string;
    predicted_price: number;
    factors: Record<string, number>;
  }>('/api/developer/predict-price', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
};

// Test connection API
export const testAPI = {
  testConnection: async () => {
    return fetchFromAPI<any>('/api/test');
  }
};

export default {
  property: propertyAPI,
  climate: climateAPI,
  analytics: analyticsAPI,
  developer: developerAPI,
  test: testAPI
};