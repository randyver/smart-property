'use client';

import { useState, useEffect } from 'react';
import PropertyCard from '@/components/PropertyCard';
import SearchBar from '@/components/SearchBar';
import RiskIndicator from '@/components/RiskIndicator';
import { propertyAPI } from '@/services/api';

interface Property {
  id: number;
  title: string;
  location: {
    latitude: number;
    longitude: number;
  };
  price: number;
  bedrooms: number;
  bathrooms: number;
  land_area: number;
  building_area: number;
  climate_risk_score: number;
  risks: {
    flood: string;
    temperature: string;
    air_quality: string;
    landslide: string;
  };
}

interface SearchParams {
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  min_score?: number;
  priority?: string;
}

export default function RecommendationPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Property[]>([]);
  const [compareProperties, setCompareProperties] = useState<Property[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string>("overall");
  
  // Risk priority options
  const priorityOptions = [
    { value: 'overall', label: 'Overall Safety' },
    { value: 'flood', label: 'Flood Risk' },
    { value: 'temperature', label: 'Temperature' },
    { value: 'air_quality', label: 'Air Quality' },
    { value: 'landslide', label: 'Landslide Risk' }
  ];
  
  // Fetch initial recommendations
  useEffect(() => {
    fetchRecommendations({});
  }, []);
  
  // Handle property search
  const handleSearch = async (params: SearchParams) => {
    fetchRecommendations(params);
  };
  
  // Fetch property recommendations
  const fetchRecommendations = async (params: SearchParams) => {
    try {
      setLoading(true);
      const response = await propertyAPI.getRecommendations({
        ...params,
        priority: params.priority || selectedPriority
      });
      setRecommendations(response.data || []);
      setSelectedPriority(params.priority || selectedPriority);
    } catch (err) {
      setError('Failed to load recommendations. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle property selection for comparison
  const handleCompareProperty = (property: Property) => {
    if (compareProperties.some(p => p.id === property.id)) {
      // Remove from comparison if already added
      setCompareProperties(compareProperties.filter(p => p.id !== property.id));
    } else {
      // Add to comparison (max 3)
      if (compareProperties.length < 3) {
        setCompareProperties([...compareProperties, property]);
      }
    }
  };
  
  // Handle view property details
  const handleViewDetails = (property: Property) => {
    // In a real app, this would navigate to a property details page
    window.location.href = `/properties/${property.id}`;
  };
  
  // Handle priority change
  const handlePriorityChange = (priority: string) => {
    setSelectedPriority(priority);
    fetchRecommendations({ priority });
  };
  
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-4 py-2">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-700">SmartProperty</h1>
          <nav className="flex space-x-4">
            <a href="/" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Map</a>
            <a href="/analytics" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Analytics</a>
            <a href="/recommendation" className="px-3 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">Recommendations</a>
          </nav>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Climate-Safe Property Recommendations</h2>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="font-bold text-lg mb-4">Find Your Ideal Climate-Safe Property</h3>
            <p className="text-gray-600 mb-6">
              Our recommendation engine analyzes climate data and property characteristics 
              to suggest the safest and most sustainable homes for you and your family.
            </p>
            
            <SearchBar onSearch={handleSearch} className="mb-6" />
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Prioritize Safety Factors</h4>
              <div className="flex flex-wrap gap-2">
                {priorityOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handlePriorityChange(option.value)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      selectedPriority === option.value 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Recommendations */}
          <h3 className="font-bold text-lg mb-4">Top Recommendations for You</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <p>Finding the best properties for you...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-700 mb-6">
              <p>{error}</p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-gray-500">No properties found matching your criteria.</p>
              <p className="text-gray-500 mt-2">Try adjusting your search parameters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onViewDetails={handleViewDetails}
                  onCompare={handleCompareProperty}
                  isComparing={compareProperties.some(p => p.id === property.id)}
                />
              ))}
            </div>
          )}
          
          {/* Comparison bar */}
          {compareProperties.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md p-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold">Comparing {compareProperties.length} properties</h3>
                  <button 
                    onClick={() => setCompareProperties([])}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex space-x-4">
                  {compareProperties.map(property => (
                    <div key={property.id} className="flex-1 bg-blue-50 p-3 rounded-md">
                      <p className="font-bold truncate">{property.title}</p>
                      <div className="flex justify-between mt-2">
                        <RiskIndicator score={property.climate_risk_score} size="sm" />
                        <p className="font-bold">Rp {(property.price / 1000000000).toFixed(1)}B</p>
                      </div>
                    </div>
                  ))}
                  <a 
                    href={`/comparison?ids=${compareProperties.map(p => p.id).join(',')}`}
                    className="px-6 py-3 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center justify-center"
                  >
                    Compare
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}