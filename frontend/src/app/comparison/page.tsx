"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import RiskIndicator from "@/components/RiskIndicator";
import { propertyAPI } from "@/services/api";
import { Property } from "@/types";
import Link from "next/link";
import Footer from "@/components/Footer";

function ComparisonContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format risk level for display
  const getRiskColor = (level: string): string => {
    const colors: { [key: string]: string } = {
      very_low: "bg-red-800",
      low: "bg-red-600",
      medium: "bg-yellow-600",
      high: "bg-red-600",
      very_high: "bg-red-800",
      excellent: "bg-green-600",
      good: "bg-green-500",
      moderate: "bg-yellow-600",
      poor: "bg-red-600",
      very_poor: "bg-red-800",
    };
    return colors[level] || "bg-gray-500";
  };

  // Format risk level for display with Indonesian translations
  const formatRiskLevel = (level: string | undefined | null): string => {
    if (!level) return "Tidak Ada Data";

    const translations: { [key: string]: string } = {
      excellent: "Sangat Baik",
      good: "Baik",
      moderate: "Sedang",
      poor: "Buruk",
      very_poor: "Sangat Buruk",
      very_low: "Sangat Rendah",
      low: "Rendah",
      medium: "Sedang",
      high: "Tinggi",
      very_high: "Sangat Tinggi",
    };

    return (
      translations[level] ||
      level.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  // Format price to IDR
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getScoreColor = (score: number | null | undefined): string => {
    if (score == null) return "bg-gray-400";
    if (score >= 85) return "bg-green-600";
    if (score >= 75) return "bg-green-500";
    if (score >= 65) return "bg-yellow-500";
    if (score >= 55) return "bg-orange-500";
    return "bg-red-600";
  };

  useEffect(() => {
    const fetchProperties = async () => {
      const ids = searchParams.get("ids");

      if (!ids) {
        setError("No properties selected for comparison");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await propertyAPI.compareProperties(
          ids.split(",").map(Number)
        );
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
      {/* Main content */}
      <div className="flex-1 bg-gray-50 p-6 text-black pt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Perbandingan Properti</h2>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p>Loading data properti...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-700 mb-6">
              <p>{error}</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-gray-500">
                No properties selected for comparison.
              </p>
              <Link
                href="/"
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Return to Map
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Comparison table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left font-medium text-gray-500 w-1/4">
                        Fitur
                      </th>
                      {properties.map((property) => (
                        <th
                          key={property.id}
                          className="py-3 px-4 text-left font-medium text-gray-500"
                        >
                          {property.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* Basic Details */}
                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">
                        Suhu Permukaan Tanah (LST)
                      </td>
                      {properties.map((property) => (
                        <td key={property.id} className="py-3 px-4">
                          {property.climate_scores?.lst_score ? (
                            <div className="flex items-center">
                              <span
                                className={`inline-block w-3 h-3 rounded-full ${getScoreColor(
                                  property.climate_scores.lst_score
                                )} mr-2`}
                              ></span>
                              <span>{property.climate_scores.lst_score}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">No data</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">
                        Indeks Vegetasi (NDVI)
                      </td>
                      {properties.map((property) => (
                        <td key={property.id} className="py-3 px-4">
                          {property.climate_scores?.ndvi_score ? (
                            <div className="flex items-center">
                              <span
                                className={`inline-block w-3 h-3 rounded-full ${getScoreColor(
                                  property.climate_scores.ndvi_score
                                )} mr-2`}
                              ></span>
                              <span>{property.climate_scores.ndvi_score}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">No data</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">
                        Indeks Variansi Termal Perkotaan (UTFVI)
                      </td>
                      {properties.map((property) => (
                        <td key={property.id} className="py-3 px-4">
                          {property.climate_scores?.utfvi_score ? (
                            <div className="flex items-center">
                              <span
                                className={`inline-block w-3 h-3 rounded-full ${getScoreColor(
                                  property.climate_scores.utfvi_score
                                )} mr-2`}
                              ></span>
                              <span>{property.climate_scores.utfvi_score}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">No data</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">
                        Pulau Panas Perkotaan (UHI)
                      </td>
                      {properties.map((property) => (
                        <td key={property.id} className="py-3 px-4">
                          {property.climate_scores?.uhi_score ? (
                            <div className="flex items-center">
                              <span
                                className={`inline-block w-3 h-3 rounded-full ${getScoreColor(
                                  property.climate_scores.uhi_score
                                )} mr-2`}
                              ></span>
                              <span>{property.climate_scores.uhi_score}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">No data</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Climate Scores */}
                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">
                        Skor Iklim
                      </td>
                      {properties.map((property) => (
                        <td key={property.id} className="py-3 px-4">
                          <div className="flex items-center">
                            <RiskIndicator
                              score={property.climate_risk_score}
                              size="sm"
                            />
                            <span className="ml-2">
                              {property.climate_risk_score}/100
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Risk Factors */}
                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">
                        Suhu Permukaan Tanah
                      </td>
                      {properties.map((property) => (
                        <td key={property.id} className="py-3 px-4">
                          <div className="flex items-center">
                            <span
                              className={`inline-block w-3 h-3 rounded-full ${getRiskColor(
                                property.risks.surface_temperature
                              )} mr-2`}
                            ></span>
                            <span>
                              {formatRiskLevel(
                                property.risks.surface_temperature
                              )}
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">
                        Tekanan Panas
                      </td>
                      {properties.map((property) => (
                        <td key={property.id} className="py-3 px-4">
                          <div className="flex items-center">
                            <span
                              className={`inline-block w-3 h-3 rounded-full ${getRiskColor(
                                property.risks.heat_stress
                              )} mr-2`}
                            ></span>
                            <span>
                              {formatRiskLevel(property.risks.heat_stress)}
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">
                        Tutupan Hijau
                      </td>
                      {properties.map((property) => (
                        <td key={property.id} className="py-3 px-4">
                          <div className="flex items-center">
                            <span
                              className={`inline-block w-3 h-3 rounded-full ${getRiskColor(
                                property.risks.green_cover
                              )} mr-2`}
                            ></span>
                            <span>
                              {formatRiskLevel(property.risks.green_cover)}
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">
                        Zona Panas
                      </td>
                      {properties.map((property) => (
                        <td key={property.id} className="py-3 px-4">
                          <div className="flex items-center">
                            <span
                              className={`inline-block w-3 h-3 rounded-full ${getRiskColor(
                                property.risks.heat_zone
                              )} mr-2`}
                            ></span>
                            <span>
                              {formatRiskLevel(property.risks.heat_zone)}
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Price property */}
                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">
                        Harga Properti
                      </td>
                      {properties.map((property) => (
                        <td key={property.id} className="py-3 px-4">
                          {formatPrice(property.price ?? 0)}
                        </td>
                      ))}
                    </tr>

                    {/* price per meter */}
                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">
                        Harga Tanah
                      </td>
                      {properties.map((property) => (
                        <td key={property.id} className="py-3 px-4">
                          {formatPrice(property.price_per_meter ?? 0)}/m²
                        </td>
                      ))}
                    </tr>

                    {/* land area */}
                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">
                        Luas Tanah
                      </td>
                      {properties.map((property) => (
                        <td key={property.id} className="py-3 px-4">
                          {property.land_area} m²
                        </td>
                      ))}
                    </tr>

                    {/* badroom */}
                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">
                        Kamar Tidur
                      </td>
                      {properties.map((property) => (
                        <td key={property.id} className="py-3 px-4">
                          {property.bedrooms}
                        </td>
                      ))}
                    </tr>

                    {/* certificate */}
                    <tr>
                      <td className="py-3 px-4 font-medium bg-gray-50">
                        Sertifikat
                      </td>
                      {properties.map((property) => (
                        <td key={property.id} className="py-3 px-4">
                          {property.certificate}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action buttons */}
              <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-3">
                <Link
                  href="/maps"
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Kembali ke Peta
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function ComparisonPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading comparison data...</p>
          </div>
        </main>
      }
    >
      <ComparisonContent />
    </Suspense>
  );
}
