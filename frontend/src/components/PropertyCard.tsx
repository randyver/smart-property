"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RiskIndicator from "@/components/RiskIndicator";
import { Property } from "@/types";

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
  imageUrl = "/house-image.jpg",
}: PropertyCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();

  // Format price to IDR
  const formatPrice = (price: number | null | undefined): string => {
    if (price == null) {
      return "Harga tidak tersedia";
    }

    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} M`;
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
      moderate: "Moderat",
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

  // Handle card click - navigate to property detail
  const handleCardClick = () => {
    router.push(`/properties/${property.id}`);
  };

  // Handle details click
  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onViewDetails) {
      onViewDetails(property);
    } else {
      router.push(`/properties/${property.id}`);
    }
  };

  // Handle toggling details
  const toggleDetails = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setShowDetails(!showDetails);
  };

  // Handle compare click
  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onCompare) {
      onCompare(property);
    }
  };

  // Climate scores explanation
  const climateScoreExplanations = {
    lst_score:
      "Land Surface Temperature - Suhu permukaan tanah di area properti",
    ndvi_score:
      "Vegetation Index - Ketersediaan ruang hijau di sekitar properti",
    utfvi_score: "Urban Thermal Field Variance Index - Variasi suhu perkotaan",
    uhi_score: "Urban Heat Island - Efek pulau panas perkotaan",
    overall_score: "Overall Climate Score - Skor keseluruhan keamanan iklim",
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition duration-300 relative mb-2 sm:mb-3 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Score badge - responsive sizing */}
      <div
        className={`absolute top-1.5 sm:top-2 right-1.5 sm:right-2 ${getScoreColor(
          property.climate_risk_score
        )} text-white font-bold p-1.5 sm:p-2 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center z-10 text-xs sm:text-sm`}
      >
        {property.climate_risk_score || "?"}
      </div>

      {/* Property Image - responsive height */}
      <div
        className="h-24 sm:h-32 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      ></div>

      {/* Property Details - responsive padding */}
      <div className="p-2 sm:p-3">
        <h3 className="font-bold text-sm sm:text-base mb-0.5 sm:mb-1 pr-6 sm:pr-8 text-gray-800 truncate">
          {property.title}
        </h3>
        <p className="text-blue-700 font-bold text-base sm:text-lg mb-0.5 sm:mb-1">
          Rp {formatPrice(property.price)}
        </p>

        {/* Property features - responsive grid/flex layout */}
        <div className="grid grid-cols-3 text-xs text-gray-700 mb-1.5 sm:mb-2 gap-1">
          <span>{property.bedrooms ?? "-"} Kamar</span>
          <span>{property.building_area ?? "-"} m²</span>
          <span>{property.land_area ?? "-"} m² Lahan</span>
        </div>

        {showDetails && (
          <div className="mt-1.5 sm:mt-2 border-t pt-1.5 sm:pt-2">
            <h4 className="font-bold mb-1 text-xs sm:text-sm text-gray-800">
              Penilaian Risiko Iklim
            </h4>
            
            {/* Risk assessment grid - responsive sizing */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-1 sm:gap-2 text-xs">
              <div className="flex items-center">
                <span
                  className={`inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getRiskColor(
                    property.risks.surface_temperature
                  )} mr-1`}
                ></span>
                <span className="text-gray-700 text-xs">
                  Suhu Permukaan: {formatRiskLevel(property.risks.surface_temperature)}
                </span>
              </div>
              <div className="flex items-center">
                <span
                  className={`inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getRiskColor(
                    property.risks.heat_stress
                  )} mr-1`}
                ></span>
                <span className="text-gray-700 text-xs">
                  Tekanan Panas: {formatRiskLevel(property.risks.heat_stress)}
                </span>
              </div>
              <div className="flex items-center">
                <span
                  className={`inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getRiskColor(
                    property.risks.green_cover
                  )} mr-1`}
                ></span>
                <span className="text-gray-700 text-xs">
                  Tutupan Hijau: {formatRiskLevel(property.risks.green_cover)}
                </span>
              </div>
              <div className="flex items-center">
                <span
                  className={`inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getRiskColor(
                    property.risks.heat_zone
                  )} mr-1`}
                ></span>
                <span className="text-gray-700 text-xs">
                  Zona Panas: {formatRiskLevel(property.risks.heat_zone)}
                </span>
              </div>
            </div>

            {/* Detailed Climate Scores - more compact for mobile */}
            {property.climate_scores && (
              <div className="mt-2 sm:mt-3">
                <h4 className="font-bold mb-0.5 sm:mb-1 text-xs text-gray-800">
                  Skor Iklim Terperinci
                </h4>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-0.5 sm:mt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">UHI:</span>
                    <div className="flex items-center text-black">
                      <span
                        className={`inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getScoreColor(
                          property.climate_scores.uhi_score
                        )} mr-1`}
                      ></span>
                      <span className="text-xs">
                        {property.climate_scores.uhi_score || "?"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">UTFVI:</span>
                    <div className="flex items-center text-black">
                      <span
                        className={`inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getScoreColor(
                          property.climate_scores.utfvi_score
                        )} mr-1`}
                      ></span>
                      <span className="text-xs">
                        {property.climate_scores.utfvi_score || "?"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">LST:</span>
                    <div className="flex items-center text-black">
                      <span
                        className={`inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getScoreColor(
                          property.climate_scores.lst_score
                        )} mr-1`}
                      ></span>
                      <span className="text-xs">
                        {property.climate_scores.lst_score || "?"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">NDVI:</span>
                    <div className="flex items-center text-black">
                      <span
                        className={`inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getScoreColor(
                          property.climate_scores.ndvi_score
                        )} mr-1`}
                      ></span>
                      <span className="text-xs">
                        {property.climate_scores.ndvi_score || "?"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Address - responsive text */}
            <p className="mt-1.5 sm:mt-2 text-xs text-gray-600 truncate">
              {property.address}
            </p>
            <p className="text-xs text-gray-600">
              {property.district}, {property.city}
            </p>
          </div>
        )}

        {/* Action buttons - more compact for mobile */}
        <div className="mt-1.5 sm:mt-2 flex justify-between items-center">
          <button
            onClick={toggleDetails}
            className="text-blue-700 text-xs hover:underline"
          >
            {showDetails ? "Sembunyikan" : "Lihat Detail"}
          </button>

          <div className="flex space-x-1">
            {onCompare && (
              <button
                onClick={handleCompareClick}
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded ${
                  isComparing
                    ? "bg-gray-300 text-gray-700"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
                disabled={isComparing}
              >
                {isComparing ? "Ditambahkan" : "Bandingkan"}
              </button>
            )}

            <button
              onClick={handleDetailsClick}
              className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-blue-700 text-white rounded hover:bg-blue-800"
            >
              Temukan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}