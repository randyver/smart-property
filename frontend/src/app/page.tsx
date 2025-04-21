'use client';

import { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import MapComponent from '@/components/MapComponent';
import PropertyCard from '@/components/PropertyCard';
import RiskIndicator from '@/components/RiskIndicator';
import { propertyAPI, climateAPI } from '@/services/api';

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
  address: string;
  district: string;
  city: string;
}

interface SearchParams {
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  min_score?: number;
  priority?: string;
}

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<string | undefined>(undefined);
  const [availableLayers, setAvailableLayers] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [compareProperties, setCompareProperties] = useState<Property[]>([]);
  
  // Infinite scroll states
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [displayedProperties, setDisplayedProperties] = useState<Property[]>([]);

  // Format price to IDR
  const formatPrice = (price: number | null | undefined): string => {
    if (price == null) {
      return "Harga tidak tersedia";
    }
    
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} B`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} Jt`;
    }
    
    return price.toLocaleString("id-ID");
  };

  // Get color based on risk level
  const getRiskColor = (level: string): string => {
    const colors: {[key: string]: string} = {
      'very_low': 'bg-green-600',
      'low': 'bg-green-500',
      'medium': 'bg-yellow-600',
      'high': 'bg-red-600',
      'very_high': 'bg-red-800',
      'excellent': 'bg-green-600',
      'good': 'bg-green-500',
      'moderate': 'bg-yellow-600',
      'poor': 'bg-red-600',
      'very_poor': 'bg-red-800'
    };
    return colors[level] || 'bg-gray-500';
  };

  // Format risk level for display
  const formatRiskLevel = (level: string): string => {
    return level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  // Fetch properties on initial load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch properties
        const propertiesResponse = await propertyAPI.getProperties();
        setProperties(propertiesResponse.data || []);
        
        // Fetch available map layers
        const layersResponse = await climateAPI.getRiskLayers();
        setAvailableLayers(layersResponse.data || []);
        
      } catch (err) {
        setError('Failed to load initial data. Please refresh the page.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  // Update displayed properties when main property list changes
  useEffect(() => {
    // When properties change, reset pagination
    setDisplayedProperties(properties.slice(0, 10));
    setPage(1);
    setHasMore(properties.length > 10);
  }, [properties]);
  
  // Handle property search
  const handleSearch = async (params: SearchParams) => {
    try {
      setLoading(true);
      const response = await propertyAPI.getProperties(params);
      setProperties(response.data || []);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Load more properties for infinite scroll
  const loadMoreProperties = () => {
    if (properties.length <= page * 10) {
      setHasMore(false);
      return;
    }
    
    setTimeout(() => {
      const nextBatch = properties.slice(0, (page + 1) * 10);
      setDisplayedProperties(nextBatch);
      setPage(page + 1);
    }, 500);
  };
  
  // Handle layer change
  const handleLayerChange = (layerId: string) => {
    setActiveLayer(activeLayer === layerId ? undefined : layerId);
  };
  
  // Handle marker click on map
  const handleMarkerClick = (propertyId: number) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      setSelectedProperty(property);
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
    setSelectedProperty(property);
  };
  
  return (
    <main className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-4 py-2 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-700">SmartProperty</h1>
          <nav className="flex space-x-4">
            <a href="/" className="px-3 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">Map</a>
            <a href="/analytics" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Analytics</a>
            <a href="/recommendation" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Recommendations</a>
          </nav>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <div className="w-1/3 border-r bg-white flex flex-col overflow-hidden">
          {/* Fixed search filters section */}
          <div className="p-4 border-b bg-white">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Find Climate-Safe Properties</h3>
            
            <div className="space-y-4">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  <button className="px-3 py-2 text-sm border rounded-md border-blue-500 bg-blue-50 text-blue-700">Any</button>
                  <button className="px-3 py-2 text-sm border rounded-md border-gray-300 hover:border-gray-400">&#60; 1B</button>
                  <button className="px-3 py-2 text-sm border rounded-md border-gray-300 hover:border-gray-400">1B - 2B</button>
                  <button className="px-3 py-2 text-sm border rounded-md border-gray-300 hover:border-gray-400">2B - 5B</button>
                  <button className="px-3 py-2 text-sm border rounded-md border-gray-300 hover:border-gray-400">5B - 10B</button>
                  <button className="px-3 py-2 text-sm border rounded-md border-gray-300 hover:border-gray-400">&#62; 10B</button>
                </div>
              </div>
              
              {/* Other filters */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md text-gray-800">
                    <option value="">Any</option>
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num}+</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md text-gray-800">
                    <option value="">Any</option>
                    {[1, 2, 3, 4].map(num => (
                      <option key={num} value={num}>{num}+</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min. Climate Score</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md text-gray-800">
                    <option value="">Any</option>
                    <option value="50">50+</option>
                    <option value="60">60+</option>
                    <option value="70">70+</option>
                    <option value="80">80+</option>
                  </select>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700">
                  Reset
                </button>
                <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Search
                </button>
              </div>
              
              <button className="text-blue-600 text-sm">
                Advanced Search
              </button>
            </div>
          </div>
          
          {/* Scrollable property list with infinite scroll */}
          <div id="propertyScrollContainer" className="flex-1 overflow-y-auto">
            <div className="p-4">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading properties...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 p-4 rounded-md text-red-700">
                  <p>{error}</p>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <p>No properties found matching your criteria.</p>
                </div>
              ) : (
                <InfiniteScroll
                  dataLength={displayedProperties.length}
                  next={loadMoreProperties}
                  hasMore={hasMore}
                  loader={<div className="text-center py-4"><p className="text-gray-500">Loading more properties...</p></div>}
                  scrollableTarget="propertyScrollContainer"
                >
                  <div className="space-y-4">
                    {displayedProperties.map(property => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        onViewDetails={handleViewDetails}
                        onCompare={handleCompareProperty}
                        isComparing={compareProperties.some(p => p.id === property.id)}
                      />
                    ))}
                  </div>
                </InfiniteScroll>
              )}
            </div>
          </div>
        </div>
        
        {/* Right content - Map */}
        <div className="w-2/3 relative overflow-hidden">
          <MapComponent
            properties={properties}
            activeLayer={activeLayer}
            onMarkerClick={handleMarkerClick}
          />
          
          {/* Fixed position layer control */}
          <div className="absolute top-4 right-4 bg-white rounded-md shadow-md p-2 z-10">
            <h3 className="text-sm font-bold mb-2 px-2 text-gray-800">Map Layers</h3>
            <div className="space-y-1">
              {availableLayers.map(layer => (
                <button
                  key={layer.id}
                  onClick={() => handleLayerChange(layer.id)}
                  className={`w-full text-left px-2 py-1 text-sm rounded-md ${
                    activeLayer === layer.id
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {layer.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Fixed position legend at bottom-right */}
          {activeLayer && (
            <div className="absolute bottom-4 right-4 bg-white p-3 rounded-md shadow-md z-10 max-w-xs">
              <h4 className="text-sm font-bold mb-2 text-gray-800">
                {availableLayers.find(l => l.id === activeLayer)?.name || 'Legend'}
              </h4>
              {activeLayer === 'temperature' && (
                <div className="space-y-1">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-[#313695] mr-2"></div>
                    <span className="text-xs text-gray-700">Below Average</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-[#4575b4] mr-2"></div>
                    <span className="text-xs text-gray-700">Slightly Below Average</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-[#74add1] mr-2"></div>
                    <span className="text-xs text-gray-700">Average</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-[#abd9e9] mr-2"></div>
                    <span className="text-xs text-gray-700">Slightly Above Average</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-[#e0f3f8] mr-2"></div>
                    <span className="text-xs text-gray-700">Above Average</span>
                  </div>
                </div>
              )}
              {activeLayer === 'flood_risk' && (
                <div className="space-y-1">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-[#a6cee3] mr-2"></div>
                    <span className="text-xs text-gray-700">Very Low Risk</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-[#1f78b4] mr-2"></div>
                    <span className="text-xs text-gray-700">Low Risk</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-[#b2df8a] mr-2"></div>
                    <span className="text-xs text-gray-700">Medium Risk</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-[#33a02c] mr-2"></div>
                    <span className="text-xs text-gray-700">High Risk</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-[#fb9a99] mr-2"></div>
                    <span className="text-xs text-gray-700">Very High Risk</span>
                  </div>
                </div>
              )}
              {activeLayer === 'air_quality' && (
                <div className="space-y-1">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-[#00ccbc] mr-2"></div>
                    <span className="text-xs text-gray-700">Excellent</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-[#99cc33] mr-2"></div>
                    <span className="text-xs text-gray-700">Good</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-[#ffde33] mr-2"></div>
                    <span className="text-xs text-gray-700">Moderate</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-[#ff9933] mr-2"></div>
                    <span className="text-xs text-gray-700">Poor</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-[#cc0033] mr-2"></div>
                    <span className="text-xs text-gray-700">Very Poor</span>
                  </div>
                </div>
              )}
              {activeLayer === 'green_space' && (
                <div className="space-y-1">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-[#276419] mr-2"></div>
                    <span className="text-xs text-gray-700">Dense Vegetation</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-[#4d9221] mr-2"></div>
                    <span className="text-xs text-gray-700">Moderate Vegetation</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-[#7fbc41] mr-2"></div>
                    <span className="text-xs text-gray-700">Light Vegetation</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-[#b8e186] mr-2"></div>
                    <span className="text-xs text-gray-700">Sparse Vegetation</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-[#e6f5d0] mr-2"></div>
                    <span className="text-xs text-gray-700">Very Sparse Vegetation</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Selected property popup */}
          {selectedProperty && (
            <div className="absolute bottom-4 left-4 right-4 max-w-md mx-auto bg-white rounded-md shadow-lg p-4 z-10">
              <button 
                onClick={() => setSelectedProperty(null)}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-xl"
                aria-label="Close"
              >
                ×
              </button>
              
              <h3 className="font-bold text-lg mb-2 text-gray-800 pr-6">{selectedProperty.title}</h3>
              <p className="text-blue-700 font-bold text-xl mb-2">
                Rp {formatPrice(selectedProperty.price)}
              </p>
              
              <div className="flex flex-wrap justify-between items-center mb-4">
                <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                  <span>{selectedProperty.bedrooms} Beds</span>
                  <span>{selectedProperty.building_area} m²</span>
                  <span>{selectedProperty.land_area} m² land</span>
                </div>
                
                <div className="mt-2 sm:mt-0">
                  <RiskIndicator score={selectedProperty.climate_risk_score} />
                </div>
              </div>
              
              <h4 className="font-bold text-sm mb-2 text-gray-800">Climate Risk Assessment</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
                <div className="flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full ${
                    getRiskColor(selectedProperty.risks?.flood || 'medium')
                  } mr-2`}></span>
                  <span className="text-gray-700">Flood: {formatRiskLevel(selectedProperty.risks?.flood || 'medium')}</span>
                </div>
                <div className="flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full ${
                    getRiskColor(selectedProperty.risks?.temperature || 'medium')
                  } mr-2`}></span>
                  <span className="text-gray-700">Temperature: {formatRiskLevel(selectedProperty.risks?.temperature || 'medium')}</span>
                </div>
                <div className="flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full ${
                    getRiskColor(selectedProperty.risks?.air_quality || 'medium')
                  } mr-2`}></span>
                  <span className="text-gray-700">Air Quality: {formatRiskLevel(selectedProperty.risks?.air_quality || 'medium')}</span>
                </div>
                <div className="flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full ${
                    getRiskColor(selectedProperty.risks?.landslide || 'medium')
                  } mr-2`}></span>
                  <span className="text-gray-700">Landslide: {formatRiskLevel(selectedProperty.risks?.landslide || 'medium')}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-end gap-2 mt-4">
                <button
                  onClick={() => handleCompareProperty(selectedProperty)}
                  className={`px-4 py-2 text-sm rounded-md ${
                    compareProperties.some(p => p.id === selectedProperty.id) 
                      ? 'bg-gray-200 text-gray-600' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                  disabled={compareProperties.some(p => p.id === selectedProperty.id)}
                >
                  {compareProperties.some(p => p.id === selectedProperty.id) ? 'Added to Compare' : 'Add to Compare'}
                </button>
                
                <a
                  href={`/properties/${selectedProperty.id}`}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Details
                </a>
              </div>
            </div>
          )}
          
          {/* Comparison bar */}
          {compareProperties.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md p-4 z-20">
              <div className="max-w-7xl mx-auto">
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
                      <p className="font-bold truncate text-gray-800">{property.title}</p>
                      <div className="flex justify-between mt-2">
                        <RiskIndicator score={property.climate_risk_score} size="sm" />
                        <p className="font-bold text-gray-800">Rp {formatPrice(property.price)}</p>
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