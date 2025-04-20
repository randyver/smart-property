'use client';

import { useState } from 'react';

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

interface PropertyCardProps {
  property: Property;
  onViewDetails?: (property: Property) => void;
  onCompare?: (property: Property) => void;
  isComparing?: boolean;
}

export default function PropertyCard({
  property,
  onViewDetails,
  onCompare,
  isComparing = false,
}: PropertyCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Format price to IDR
  const formatPrice = (price: number): string => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} B`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} Jt`;
    }
    return price.toLocaleString('id-ID');
  };
  
  // Get color based on risk score
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
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
  
  // Format risk level for display
  const formatRiskLevel = (level: string): string => {
    return level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition duration-300 relative">
      {/* Score badge */}
      <div className={`absolute top-2 right-2 ${getScoreColor(property.climate_risk_score)} text-white font-bold p-2 rounded-full w-10 h-10 flex items-center justify-center`}>
        {property.climate_risk_score}
      </div>
      
      {/* Property Image (placeholder) */}
      <div className="h-40 bg-gray-300 flex items-center justify-center">
        <span className="text-gray-500">Property Image</span>
      </div>
      
      {/* Property Details */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 pr-12">{property.title}</h3>
        <p className="text-blue-600 font-bold text-xl mb-2">
          Rp {formatPrice(property.price)}
        </p>
        
        <div className="flex justify-between text-sm text-gray-600 mb-4">
          <span>{property.bedrooms} Beds</span>
          <span>{property.bathrooms} Baths</span>
          <span>{property.building_area} m²</span>
        </div>
        
        {showDetails && (
          <div className="mt-4 border-t pt-4">
            <h4 className="font-bold mb-2">Climate Risk Assessment</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full ${getRiskColor(property.risks.flood)} mr-2`}></span>
                <span>Flood: {formatRiskLevel(property.risks.flood)}</span>
              </div>
              <div className="flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full ${getRiskColor(property.risks.temperature)} mr-2`}></span>
                <span>Temp: {formatRiskLevel(property.risks.temperature)}</span>
              </div>
              <div className="flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full ${getRiskColor(property.risks.air_quality)} mr-2`}></span>
                <span>Air: {formatRiskLevel(property.risks.air_quality)}</span>
              </div>
              <div className="flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full ${getRiskColor(property.risks.landslide)} mr-2`}></span>
                <span>Landslide: {formatRiskLevel(property.risks.landslide)}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-4 flex justify-between">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 text-sm hover:underline"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          
          <div className="flex space-x-2">
            {onCompare && (
              <button 
                onClick={() => onCompare(property)}
                className={`px-3 py-1 text-sm rounded ${
                  isComparing 
                    ? 'bg-gray-200 text-gray-600' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
                disabled={isComparing}
              >
                {isComparing ? 'Added' : 'Compare'}
              </button>
            )}
            
            {onViewDetails && (
              <button 
                onClick={() => onViewDetails(property)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}