'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  min_score?: number;
  search_term?: string;
}

export default function Home() {
  // All available properties (from API)
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  
  // Properties filtered by search term for the list display
  const [listDisplayProperties, setListDisplayProperties] = useState<Property[]>([]);
  
  // Properties filtered for the map (only updated when Search is clicked)
  const [mapDisplayProperties, setMapDisplayProperties] = useState<Property[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<string | undefined>(undefined);
  const [availableLayers, setAvailableLayers] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [compareProperties, setCompareProperties] = useState<Property[]>([]);
  const mapRef = useRef<any>(null);
  
  // Search filters
  const [priceRange, setPriceRange] = useState<[number | undefined, number | undefined]>([undefined, undefined]);
  const [bedrooms, setBedrooms] = useState<number | undefined>(undefined);
  const [minScore, setMinScore] = useState<number | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
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

  // Get color based on risk level - memoized to prevent recreating on each render
  const getRiskColor = useCallback((level: string): string => {
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
  }, []);

  // Format risk level for display - memoized
  const formatRiskLevel = useCallback((level: string): string => {
    return level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }, []);
  
  // Fetch properties on initial load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch properties
        const propertiesResponse = await propertyAPI.getProperties();
        const propertiesData = propertiesResponse.data || [];
        setAllProperties(propertiesData);
        setListDisplayProperties(propertiesData);
        setMapDisplayProperties(propertiesData);
        
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

  // Update displayed properties for infinite scroll when list display properties change
  useEffect(() => {
    // When list display properties change, reset pagination
    setDisplayedProperties(listDisplayProperties.slice(0, 10));
    setPage(1);
    setHasMore(listDisplayProperties.length > 10);
  }, [listDisplayProperties]);
  
  // Update list display properties when search term changes (real-time search)
  useEffect(() => {
    // Filter properties based on search term for the list display
    if (searchTerm.trim() === '') {
      // If search term is empty, apply other filters
      applyFiltersToList(false);
    } else {
      // Filter by search term
      const term = searchTerm.toLowerCase().trim();
      const filtered = allProperties.filter(p => 
        p.title.toLowerCase().includes(term) || 
        p.address?.toLowerCase().includes(term) ||
        p.district?.toLowerCase().includes(term) ||
        p.city?.toLowerCase().includes(term)
      );
      setListDisplayProperties(filtered);
    }
  }, [searchTerm, allProperties]);
  
  // Apply all filters to list display
  const applyFiltersToList = useCallback((includeSearchTerm = true) => {
    let results = [...allProperties];
    
    // Filter by price range
    if (priceRange[0] !== undefined) {
      results = results.filter(p => p.price >= (priceRange[0] || 0));
    }
    if (priceRange[1] !== undefined) {
      results = results.filter(p => p.price <= (priceRange[1] || Infinity));
    }
    
    // Filter by bedrooms
    if (bedrooms !== undefined) {
      if (bedrooms === 4) {
        // For >3 bedrooms option
        results = results.filter(p => p.bedrooms > 3);
      } else {
        results = results.filter(p => p.bedrooms === bedrooms);
      }
    }
    
    // Filter by climate score
    if (minScore !== undefined) {
      results = results.filter(p => p.climate_risk_score >= minScore);
    }
    
    // Filter by search term if needed
    if (includeSearchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      results = results.filter(p => 
        p.title.toLowerCase().includes(term) || 
        p.address?.toLowerCase().includes(term) ||
        p.district?.toLowerCase().includes(term) ||
        p.city?.toLowerCase().includes(term)
      );
    }
    
    setListDisplayProperties(results);
    return results;
  }, [allProperties, priceRange, bedrooms, minScore, searchTerm]);
  
  // When Search button is clicked - update map properties
  const handleSearch = useCallback(() => {
    setLoading(true);
    
    // Apply all filters and update map
    const filteredResults = applyFiltersToList(true);
    setMapDisplayProperties(filteredResults);
    
    setLoading(false);
  }, [applyFiltersToList]);
  
  // Handle reset filters
  const handleResetFilters = useCallback(() => {
    setPriceRange([undefined, undefined]);
    setBedrooms(undefined);
    setMinScore(undefined);
    setSearchTerm('');
    
    // Reset to all properties
    setListDisplayProperties(allProperties);
    setMapDisplayProperties(allProperties);
  }, [allProperties]);
  
  // Load more properties for infinite scroll
  const loadMoreProperties = useCallback(() => {
    if (listDisplayProperties.length <= page * 10) {
      setHasMore(false);
      return;
    }
    
    setTimeout(() => {
      const nextBatch = listDisplayProperties.slice(0, (page + 1) * 10);
      setDisplayedProperties(nextBatch);
      setPage(page + 1);
    }, 300);
  }, [listDisplayProperties, page]);
  
  // Handle layer change
  const handleLayerChange = useCallback((layerId: string) => {
    setActiveLayer(activeLayer === layerId ? undefined : layerId);
  }, [activeLayer]);
  
  // Handle marker click on map
  const handleMarkerClick = useCallback((propertyId: number) => {
    const property = allProperties.find(p => p.id === propertyId);
    if (property) {
      setSelectedProperty(property);
    }
  }, [allProperties]);
  
  // Handle property selection for comparison
  const handleCompareProperty = useCallback((property: Property) => {
    if (compareProperties.some(p => p.id === property.id)) {
      // Remove from comparison if already added
      setCompareProperties(compareProperties.filter(p => p.id !== property.id));
    } else {
      // Add to comparison (max 3)
      if (compareProperties.length < 3) {
        setCompareProperties([...compareProperties, property]);
      }
    }
  }, [compareProperties]);
  
  // Handle view property details
  const handleViewDetails = useCallback((property: Property) => {
    setSelectedProperty(property);
    
    // Fly to the property location on the map
    if (mapRef.current && property.location) {
      mapRef.current.flyTo({
        center: [property.location.longitude, property.location.latitude],
        zoom: 15,
        duration: 1500
      });
    }
  }, []);
  
  // Handle price range selection
  const handlePriceRangeSelect = useCallback((min?: number, max?: number) => {
    setPriceRange([min, max]);
    
    // Update list display with the new price range
    setTimeout(() => {
      applyFiltersToList(true);
    }, 0);
  }, [applyFiltersToList]);
  
  // Handle bedroom selection
  const handleBedroomsChange = useCallback((value: string) => {
    setBedrooms(value ? Number(value) : undefined);
    
    // Update list display with the new bedrooms filter
    setTimeout(() => {
      applyFiltersToList(true);
    }, 0);
  }, [applyFiltersToList]);
  
  // Handle climate score selection
  const handleMinScoreChange = useCallback((value: string) => {
    setMinScore(value ? Number(value) : undefined);
    
    // Update list display with the new climate score filter
    setTimeout(() => {
      applyFiltersToList(true);
    }, 0);
  }, [applyFiltersToList]);
  
  // Price range options
  const priceOptions = [
    { label: 'Any', min: undefined, max: undefined },
    { label: '< 100Jt', min: 0, max: 100000000 },
    { label: '100Jt - 1B', min: 100000000, max: 1000000000 },
    { label: '1B - 5B', min: 1000000000, max: 5000000000 },
    { label: '5B - 10B', min: 5000000000, max: 10000000000 },
    { label: '> 10B', min: 10000000000, max: undefined }
  ];
  
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
        {/* Left sidebar - reduced width from 1/3 to 1/4 */}
        <div className="w-1/4 border-r bg-white flex flex-col overflow-hidden">
          {/* Fixed search filters section */}
          <div className="p-3 border-b bg-white">
            <h3 className="font-bold text-lg mb-3 text-gray-800">Find Climate-Safe Properties</h3>
            
            {/* Search input */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search properties..."
                className="w-full p-2 border border-gray-300 rounded-md text-black" // Text color changed to black
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-3">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Price Range</label>
                <div className="grid grid-cols-3 gap-1">
                  {priceOptions.map((option, index) => (
                    <button
                      key={index}
                      className={`px-2 py-1 text-xs border rounded-md transition ${
                        priceRange[0] === option.min && priceRange[1] === option.max
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400 text-black'
                      }`}
                      onClick={() => handlePriceRangeSelect(option.min, option.max)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Other filters */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Bedrooms</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md text-black text-sm"
                    value={bedrooms || ''}
                    onChange={(e) => handleBedroomsChange(e.target.value)}
                  >
                    <option value="">Any</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">&gt;3</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Min. Climate Score</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md text-black text-sm"
                    value={minScore || ''}
                    onChange={(e) => handleMinScoreChange(e.target.value)}
                  >
                    <option value="">Any</option>
                    <option value="50">50+</option>
                    <option value="60">60+</option>
                    <option value="70">70+</option>
                    <option value="80">80+</option>
                  </select>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 text-gray-800"
                >
                  Reset
                </button>
                <button
                  onClick={handleSearch}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
          
          {/* Scrollable property list with infinite scroll */}
          <div id="propertyScrollContainer" className="flex-1 overflow-y-auto">
            <div className="p-3">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-800">Loading properties...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 p-3 rounded-md text-red-700">
                  <p>{error}</p>
                </div>
              ) : listDisplayProperties.length === 0 ? (
                <div className="text-center py-8 text-gray-800">
                  <p>No properties found matching your criteria.</p>
                </div>
              ) : (
                <InfiniteScroll
                  dataLength={displayedProperties.length}
                  next={loadMoreProperties}
                  hasMore={hasMore}
                  loader={<div className="text-center py-3"><p className="text-gray-700 text-sm">Loading more properties...</p></div>}
                  scrollableTarget="propertyScrollContainer"
                >
                  <div className="space-y-3">
                    {displayedProperties.map(property => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        onViewDetails={handleViewDetails}
                        onCompare={handleCompareProperty}
                        isComparing={compareProperties.some(p => p.id === property.id)}
                        imageUrl="https://savasa.id/upload/202306/article/Harga-Perumahan-di-Bekasi-Big-Header_1686363768.jpg"
                      />
                    ))}
                  </div>
                </InfiniteScroll>
              )}
            </div>
          </div>
        </div>
        
        {/* Right content - Map */}
        <div className="w-3/4 relative overflow-hidden">
          {/* Using our optimized MapComponent */}
          <MapComponent
            properties={mapDisplayProperties}
            activeLayer={activeLayer}
            onMarkerClick={handleMarkerClick}
            mapRef={mapRef}
          />
          
          {/* Fixed position layer control */}
          <div className="absolute top-4 right-4 bg-white rounded-md shadow-md p-2 z-10">
            <h3 className="text-sm font-bold mb-2 px-2 text-gray-800">Map Layers</h3>
            <div className="space-y-1">
              <button
                onClick={() => handleLayerChange('flood_risk')}
                className={`w-full text-left px-2 py-1 text-sm rounded-md ${
                  activeLayer === 'flood_risk'
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                Flood Risk
              </button>
            </div>
          </div>
          
          {/* Fixed position legend at bottom-right */}
          {activeLayer === 'flood_risk' && (
            <div className="absolute bottom-4 right-4 bg-white p-3 rounded-md shadow-md z-10 max-w-xs">
              <h4 className="text-sm font-bold mb-2 text-gray-800">
                Flood Risk
              </h4>
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