'use client';

import { useState, useEffect } from 'react';
import MapComponent from '@/components/MapComponent';
import SearchBar from '@/components/SearchBar';
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
        console.log("Available layers:", layersResponse.data);
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
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-4 py-2">
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
      <div className="flex-1 flex">
        {/* Left sidebar - Property list and search */}
        <div className="w-1/3 border-r bg-gray-50 flex flex-col overflow-hidden">
          <div className="p-4">
            <SearchBar onSearch={handleSearch} />
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <p>Loading properties...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-md text-red-700">
                <p>{error}</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No properties found matching your criteria.</p>
              </div>
            ) : (
              properties.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onViewDetails={handleViewDetails}
                  onCompare={handleCompareProperty}
                  isComparing={compareProperties.some(p => p.id === property.id)}
                />
              ))
            )}
          </div>
          
          {/* Comparison bar */}
          {compareProperties.length > 0 && (
            <div className="bg-white border-t p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Comparing {compareProperties.length} properties</h3>
                <button 
                  onClick={() => setCompareProperties([])}
                  className="text-sm text-red-600 hover:underline"
                >
                  Clear all
                </button>
              </div>
              <div className="flex space-x-2">
                {compareProperties.map(property => (
                  <div key={property.id} className="flex-1 bg-blue-50 p-2 rounded-md text-xs">
                    <p className="font-bold truncate">{property.title}</p>
                    <div className="flex justify-between mt-1">
                      <RiskIndicator score={property.climate_risk_score} size="sm" />
                      <p className="font-bold">Rp {(property.price / 1000000000).toFixed(1)}B</p>
                    </div>
                  </div>
                ))}
                <a 
                  href={`/comparison?ids=${compareProperties.map(p => p.id).join(',')}`}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center justify-center"
                >
                  Compare
                </a>
              </div>
            </div>
          )}
        </div>
        
        {/* Right content - Map and layers */}
        <div className="w-2/3 flex flex-col">
          {/* Map container */}
          <div className="flex-1 relative">
            <MapComponent
              properties={properties}
              activeLayer={activeLayer}
              onMarkerClick={handleMarkerClick}
            />
            
            {/* Layer controls */}
            <div className="absolute top-4 right-4 bg-white rounded-md shadow-md p-2 z-10">
              <h3 className="text-sm font-bold mb-2 px-2">Map Layers</h3>
              <div className="space-y-1">
                {availableLayers.map(layer => (
                  <button
                    key={layer.id}
                    onClick={() => handleLayerChange(layer.id)}
                    className={`w-full text-left px-2 py-1 text-sm rounded-md ${
                      activeLayer === layer.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {layer.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Selected property popup */}
            {selectedProperty && (
              <div className="absolute bottom-4 left-4 right-4 bg-white rounded-md shadow-lg p-4 z-10 max-w-md">
                <button 
                  onClick={() => setSelectedProperty(null)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
                
                <h3 className="font-bold text-lg mb-2">{selectedProperty.title}</h3>
                <p className="text-blue-600 font-bold text-xl mb-2">
                  Rp {(selectedProperty.price / 1000000000).toFixed(1)} B
                </p>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="flex space-x-4 text-sm text-gray-600">
                    <span>{selectedProperty.bedrooms} Beds</span>
                    <span>{selectedProperty.bathrooms} Baths</span>
                    <span>{selectedProperty.building_area} m²</span>
                  </div>
                  
                  <RiskIndicator score={selectedProperty.climate_risk_score} />
                </div>
                
                <h4 className="font-bold text-sm mb-2">Climate Risk Assessment</h4>
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div className="flex items-center">
                    <span className={`inline-block w-3 h-3 rounded-full ${
                      selectedProperty.risks.flood === 'very_low' ? 'bg-green-500' :
                      selectedProperty.risks.flood === 'low' ? 'bg-green-300' :
                      selectedProperty.risks.flood === 'medium' ? 'bg-yellow-500' :
                      selectedProperty.risks.flood === 'high' ? 'bg-red-500' :
                      'bg-red-700'
                    } mr-2`}></span>
                    <span>Flood: {selectedProperty.risks.flood.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-block w-3 h-3 rounded-full ${
                      selectedProperty.risks.temperature === 'very_low' ? 'bg-green-500' :
                      selectedProperty.risks.temperature === 'low' ? 'bg-green-300' :
                      selectedProperty.risks.temperature === 'medium' ? 'bg-yellow-500' :
                      selectedProperty.risks.temperature === 'high' ? 'bg-red-500' :
                      'bg-red-700'
                    } mr-2`}></span>
                    <span>Temp: {selectedProperty.risks.temperature.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-block w-3 h-3 rounded-full ${
                      selectedProperty.risks.air_quality === 'excellent' || selectedProperty.risks.air_quality === 'very_good' ? 'bg-green-500' :
                      selectedProperty.risks.air_quality === 'good' ? 'bg-green-300' :
                      selectedProperty.risks.air_quality === 'moderate' ? 'bg-yellow-500' :
                      selectedProperty.risks.air_quality === 'poor' ? 'bg-red-500' :
                      'bg-red-700'
                    } mr-2`}></span>
                    <span>Air: {selectedProperty.risks.air_quality.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-block w-3 h-3 rounded-full ${
                      selectedProperty.risks.landslide === 'very_low' ? 'bg-green-500' :
                      selectedProperty.risks.landslide === 'low' ? 'bg-green-300' :
                      selectedProperty.risks.landslide === 'medium' ? 'bg-yellow-500' :
                      selectedProperty.risks.landslide === 'high' ? 'bg-red-500' :
                      'bg-red-700'
                    } mr-2`}></span>
                    <span>Landslide: {selectedProperty.risks.landslide.replace('_', ' ')}</span>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleCompareProperty(selectedProperty)}
                    className={`px-3 py-1 text-sm rounded ${
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
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View Full Details
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}