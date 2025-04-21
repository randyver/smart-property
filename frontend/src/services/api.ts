// API service for interacting with the backend

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

    const data = await response.json();
    return data;
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
  
  // Get property recommendations
  getRecommendations: async (params: Record<string, any> = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchFromAPI<any>(`/api/properties/recommend${query}`);
  },
  
  // Predict property price
  predictPrice: async (propertyData: Record<string, any>) => {
    return fetchFromAPI<any>('/api/price/predict', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  }
};

// Climate data API
export const climateAPI = {
  // Get available risk layers for map
  getRiskLayers: async () => {
    return fetchFromAPI<any>('/api/climate/risk-layers');
  }
};

// Analytics API
export const analyticsAPI = {
  // Get price trends
  getPriceTrends: async (region?: string) => {
    const query = region ? `?region=${region}` : '';
    return fetchFromAPI<any>(`/api/analytics/price-trends${query}`);
  },
  
  // Get climate risk analysis
  getClimateRisks: async () => {
    return fetchFromAPI<any>('/api/analytics/climate-risks');
  },
  
  // Get property distribution statistics
  getPropertyDistribution: async () => {
    return fetchFromAPI<any>('/api/analytics/property-distribution');
  },
  
  // Get climate impact analysis
  getClimateImpact: async () => {
    return fetchFromAPI<any>('/api/analytics/climate-impact');
  },
  
  // Get dashboard summary
  getDashboardSummary: async () => {
    return fetchFromAPI<any>('/api/analytics/dashboard-summary');
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
  test: testAPI
};