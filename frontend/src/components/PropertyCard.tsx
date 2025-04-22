"use client";

import { useState } from "react";
import RiskIndicator from "@/components/RiskIndicator";
import { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
  onViewDetails?: (property: Property) => void;
  onCompare?: (property: Property) => void;
  isComparing?: boolean;
  imageUrl?: string;
}

export default function PropertyCard({
  property,
  onViewDetails,
  onCompare,
  isComparing = false,
  imageUrl = "https://savasa.id/upload/202306/article/Harga-Perumahan-di-Bekasi-Big-Header_1686363768.jpg",
}: PropertyCardProps) {
  const [showDetails, setShowDetails] = useState(false);

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

  // Get color based on risk score
  const getScoreColor = (score: number | null | undefined): string => {
    if (score == null) return "bg-gray-500";
    if (score >= 85) return "bg-green-600"; // Darker green for better contrast
    if (score >= 75) return "bg-green-500"; // Medium green
    if (score >= 65) return "bg-yellow-500"; // Yellow
    if (score >= 55) return "bg-orange-500"; // Orange
    return "bg-red-600"; // Red for poor scores
  };

  // Get color based on risk level
  const getRiskColor = (level: string): string => {
    const colors: { [key: string]: string } = {
      very_low: "bg-green-600",
      low: "bg-green-500",
      medium: "bg-yellow-500",
      high: "bg-orange-500",
      very_high: "bg-red-600",
      excellent: "bg-green-600",
      good: "bg-green-500",
      moderate: "bg-yellow-500",
      poor: "bg-orange-500",
      very_poor: "bg-red-600",
    };
    return colors[level] || "bg-gray-500";
  };

  // Format risk level to readable string
  const formatRiskLevel = (level: string): string => {
    const levels: { [key: string]: string } = {
      very_low: "Sangat Rendah",
      low: "Rendah",
      medium: "Sedang",
      high: "Tinggi",
      very_high: "Sangat Tinggi",
      excellent: "Sangat Baik",
      good: "Baik",
      moderate: "Sedang",
      poor: "Buruk",
      very_poor: "Sangat Buruk",
    };
    return levels[level] || level;
  };

  // Get score label based on numeric value
  const getScoreLabel = (score: number | null | undefined): string => {
    if (score == null) return "Tidak Ada Data";
    if (score >= 80) return "Sangat Baik";
    if (score >= 60) return "Baik";
    if (score >= 40) return "Sedang";
    if (score >= 20) return "Buruk";
    return "Sangat Buruk";
  };

  // Handle details click
  const handleDetailsClick = () => {
    if (onViewDetails) {
      onViewDetails(property);
    }
  };

  // Climate scores explanation
  const climateScoreExplanations = {
    lst_score: "Land Surface Temperature - Suhu permukaan tanah di area properti",
    ndvi_score: "Vegetation Index - Ketersediaan ruang hijau di sekitar properti",
    utfvi_score: "Urban Thermal Field Variance Index - Variasi suhu perkotaan",
    uhi_score: "Urban Heat Island - Efek pulau panas perkotaan",
    overall_score: "Overall Climate Score - Skor keseluruhan keamanan iklim"
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition duration-300 relative mb-3">
      {/* Score badge */}
      <div
        className={`absolute top-2 right-2 ${getScoreColor(
          property.climate_risk_score
        )} text-white font-bold p-2 rounded-full w-8 h-8 flex items-center justify-center z-10`}
      >
        {property.climate_risk_score || "?"}
      </div>

      {/* Property Image */}
      <div 
        className="h-32 bg-cover bg-center" 
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
      </div>

      {/* Property Details */}
      <div className="p-3">
        <h3 className="font-bold text-base mb-1 pr-8 text-gray-800 truncate">
          {property.title}
        </h3>
        <p className="text-blue-700 font-bold text-lg mb-1">
          Rp {formatPrice(property.price)}
        </p>

        <div className="flex justify-between text-xs text-gray-700 mb-2">
          <span>{property.bedrooms} Beds</span>
          <span>{property.building_area} m²</span>
          <span>{property.land_area} m² land</span>
        </div>

        {showDetails && (
          <div className="mt-2 border-t pt-2">
            <h4 className="font-bold mb-1 text-sm text-gray-800">
              Climate Risk Assessment
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${getRiskColor(
                    property.risks.flood
                  )} mr-1`}
                ></span>
                <span className="text-gray-700">
                  Flood: {formatRiskLevel(property.risks.flood)}
                </span>
              </div>
              <div className="flex items-center">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${getRiskColor(
                    property.risks.temperature
                  )} mr-1`}
                ></span>
                <span className="text-gray-700">
                  Temp: {formatRiskLevel(property.risks.temperature)}
                </span>
              </div>
              <div className="flex items-center">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${getRiskColor(
                    property.risks.air_quality
                  )} mr-1`}
                ></span>
                <span className="text-gray-700">
                  Air: {formatRiskLevel(property.risks.air_quality)}
                </span>
              </div>
              <div className="flex items-center">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${getRiskColor(
                    property.risks.landslide
                  )} mr-1`}
                ></span>
                <span className="text-gray-700">
                  Landslide: {formatRiskLevel(property.risks.landslide)}
                </span>
              </div>
            </div>

            {/* Detailed Climate Scores */}
            {property.climate_scores && (
              <div className="mt-3">
                <h4 className="font-bold mb-1 text-xs text-gray-800">
                  Detailed Climate Scores
                </h4>
                <div className="space-y-2 mt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">LST Score:</span>
                    <div className="flex items-center text-black">
                      <span className={`inline-block w-2 h-2 rounded-full ${getScoreColor(property.climate_scores.lst_score)} mr-1`}></span>
                      <span className="text-xs">{property.climate_scores.lst_score || '?'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">NDVI Score:</span>
                    <div className="flex items-center text-black">
                      <span className={`inline-block w-2 h-2 rounded-full ${getScoreColor(property.climate_scores.ndvi_score)} mr-1`}></span>
                      <span className="text-xs">{property.climate_scores.ndvi_score || '?'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">UTFVI Score:</span>
                    <div className="flex items-center text-black">
                      <span className={`inline-block w-2 h-2 rounded-full ${getScoreColor(property.climate_scores.utfvi_score)} mr-1`}></span>
                      <span className="text-xs">{property.climate_scores.utfvi_score || '?'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">UHI Score:</span>
                    <div className="flex items-center text-black">
                      <span className={`inline-block w-2 h-2 rounded-full ${getScoreColor(property.climate_scores.uhi_score)} mr-1`}></span>
                      <span className="text-xs">{property.climate_scores.uhi_score || '?'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <p className="mt-2 text-xs text-gray-600 truncate">{property.address}</p>
            <p className="text-xs text-gray-600">
              {property.district}, {property.city}
            </p>
          </div>
        )}

        <div className="mt-2 flex justify-between">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-700 text-xs hover:underline"
          >
            {showDetails ? "Hide Details" : "Show Details"}
          </button>

          <div className="flex space-x-1">
            {onCompare && (
              <button
                onClick={() => onCompare(property)}
                className={`px-2 py-1 text-xs rounded ${
                  isComparing
                    ? "bg-gray-300 text-gray-700"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
                disabled={isComparing}
              >
                {isComparing ? "Added" : "Compare"}
              </button>
            )}

            <button
              onClick={handleDetailsClick}
              className="px-2 py-1 text-xs bg-blue-700 text-white rounded hover:bg-blue-800"
            >
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}