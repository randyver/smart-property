'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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

export default function ComparisonPage() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Format risk level for display
  const formatRiskLevel = (level: string): string => {
    return level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  // Get color based on risk level
  const getRiskColor = (level: string): string => {
    const colors: {[key: string]: string} = {
      'very_low': 'bg-green-500',
      'low': 'bg-green-300',
      'medium': 'bg-yellow-500',
      'high': 'bg-red-500',
      'very_high': 'bg-red-700',
      'excellent': 'bg-green-500',
      'good': 'bg-green-300',
      'moderate': 'bg-yellow-500',
      'poor': 'bg-red-500',
      'very_poor': 'bg-red-700'
    };
    return colors[level] || 'bg-gray-400';
  };
  
  // Format price to IDR
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  useEffect(() => {
    const fetchProperties = async () => {
      const ids = searchParams.get('ids');
      
      if (!ids) {
        setError("No properties selected for comparison");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await propertyAPI.compareProperties(ids.split(',').map(Number));
        setProperties(response.data || []);
      } catch (err) {
        setError("Failed to load property data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, [searchParams]);
  
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-4 py-2">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-700">SmartProperty</h1>
          <nav className="flex space-x-4">
            <a href="/" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Map</a>
            <a href="/analytics" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Analytics</a>
            <a href="/recommendation" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Recommendations</a>
          </nav>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Property Comparison</h2>
            <a href="/" className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100">
              Back to Map
            </a>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <p>Loading property data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-700 mb-6">
              <p>{error}</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-gray-500">No properties selected for comparison.</p>
              <a href="/" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Return to Map
              </a>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Comparison table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left font-medium text-gray-500 w-1/4">Feature</th>
                      {properties.map(property => (
                        <th key={property.id} className="py-3 px-4 text-left font-medium text-gray-500">
                          {property.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* Basic Details */}
                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">Price</td>
                      {properties.map(property => (
                        <td key={property.id} className="py-3 px-4 text-blue-700 font-bold">
                          {formatPrice(property.price)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">Bedrooms</td>
                      {properties.map(property => (
                        <td key={property.id} className="py-3 px-4">
                          {property.bedrooms}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">Bathrooms</td>
                      {properties.map(property => (
                        <td key={property.id} className="py-3 px-4">
                          {property.bathrooms}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">Building Area</td>
                      {properties.map(property => (
                        <td key={property.id} className="py-3 px-4">
                          {property.building_area} m²
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">Land Area</td>
                      {properties.map(property => (
                        <td key={property.id} className="py-3 px-4">
                          {property.land_area} m²
                        </td>
                      ))}
                    </tr>
                    
                    {/* Climate Scores */}
                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">Climate Safety Score</td>
                      {properties.map(property => (
                        <td key={property.id} className="py-3 px-4">
                          <div className="flex items-center">
                            <RiskIndicator score={property.climate_risk_score} size="sm" />
                            <span className="ml-2">{property.climate_risk_score}/100</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    
                    {/* Risk Factors */}
                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">Flood Risk</td>
                      {properties.map(property => (
                        <td key={property.id} className="py-3 px-4">
                          <div className="flex items-center">
                            <span className={`inline-block w-3 h-3 rounded-full ${getRiskColor(property.risks.flood)} mr-2`}></span>
                            <span>{formatRiskLevel(property.risks.flood)}</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">Temperature</td>
                      {properties.map(property => (
                        <td key={property.id} className="py-3 px-4">
                          <div className="flex items-center">
                            <span className={`inline-block w-3 h-3 rounded-full ${getRiskColor(property.risks.temperature)} mr-2`}></span>
                            <span>{formatRiskLevel(property.risks.temperature)}</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">Air Quality</td>
                      {properties.map(property => (
                        <td key={property.id} className="py-3 px-4">
                          <div className="flex items-center">
                            <span className={`inline-block w-3 h-3 rounded-full ${getRiskColor(property.risks.air_quality)} mr-2`}></span>
                            <span>{formatRiskLevel(property.risks.air_quality)}</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">Landslide Risk</td>
                      {properties.map(property => (
                        <td key={property.id} className="py-3 px-4">
                          <div className="flex items-center">
                            <span className={`inline-block w-3 h-3 rounded-full ${getRiskColor(property.risks.landslide)} mr-2`}></span>
                            <span>{formatRiskLevel(property.risks.landslide)}</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    
                    {/* Price per Square Meter */}
                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">Price per m²</td>
                      {properties.map(property => (
                        <td key={property.id} className="py-3 px-4">
                          {formatPrice(property.building_area > 0 ? property.price / property.building_area : 0)}/m²
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Action buttons */}
              <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-3">
                <a href="/" className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100">
                  Return to Map
                </a>
                <a href="/recommendation" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  More Recommendations
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}