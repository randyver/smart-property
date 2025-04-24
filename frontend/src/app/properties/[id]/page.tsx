"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Property } from "@/types";
import RiskIndicator from "@/components/RiskIndicator";
import ClimateScores from "@/components/ClimateScores";
import ClimateScoreInfo from "@/components/ClimateScoreInfo";
import { propertyAPI } from "@/services/api";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "climate" | "location"
  >("overview");
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);

  // Format price to IDR
  const formatPrice = (price: number | null | undefined): string => {
    if (price == null) return "Price not available";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get color based on risk level
  const getRiskColor = (level: string): string => {
    const colors: { [key: string]: string } = {
      very_low: "bg-green-600",
      low: "bg-green-500",
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

  // Format risk level for display
  const formatRiskLevel = (level: string | undefined | null): string => {
    if (!level) return "Not Available";
    return level.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const mapidApiKey =
    process.env.NEXT_PUBLIC_MAPID_API_KEY || "your_mapid_api_key";
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Initialize map when location tab is selected
  useEffect(() => {
    if (
      selectedTab === "location" &&
      property &&
      mapContainer.current &&
      !mapInstance.current
    ) {
      // Initialize map
      mapInstance.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `${API_BASE_URL}/api/map/style?style=basic`,
        center: [property.location.longitude, property.location.latitude], // Center on property
        zoom: 14, // Zoom closer than default
        transformRequest: (url, resourceType) => {
          if (url.startsWith("https://basemap.mapid.io/")) {
            const resourcePath = url
              .replace(/^https:\/\/basemap\.mapid\.io\//, "")
              .split("?")[0];
            return {
              url: `${API_BASE_URL}/api/map/resources/${resourcePath}`,
            };
          }
          return { url };
        },
      });

      // Create custom marker element
      const el = document.createElement("div");
      el.className = "property-marker";
      el.innerHTML = `
        <div class="relative">
          <svg xmlns="http://www.w3.org/2000/svg" 
               viewBox="0 0 24 24" 
               fill="currentColor" 
               class="w-8 h-8 text-red-600 drop-shadow-lg">
            <path fill-rule="evenodd" 
                  d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" 
                  clip-rule="evenodd" />
          </svg>
          <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-600 rounded-full"></div>
        </div>
      `;

      // Add marker to map
      new maplibregl.Marker({
        element: el,
        anchor: "bottom", // Anchor point at bottom of icon
      })
        .setLngLat([property.location.longitude, property.location.latitude])
        .addTo(mapInstance.current);

      // Add navigation controls
      mapInstance.current.addControl(
        new maplibregl.NavigationControl(),
        "top-right"
      );

      // Cleanup function
      return () => {
        if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
        }
      };
    }
  }, [selectedTab, property, API_BASE_URL]);

  // Fetch property data
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);

        // Try to get the specific property by ID first
        try {
          const response = await propertyAPI.getPropertyById(Number(params.id));

          if (response.status === "success" && response.data) {
            setProperty(response.data);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.log(
            "Individual property endpoint not available, falling back to all properties"
          );
        }

        // Fallback to getting all properties and filtering
        const response = await propertyAPI.getProperties();
        const allProperties = response.data || [];

        // Find the property with the matching ID
        const foundProperty = allProperties.find(
          (p: { id: number }) => p.id === Number(params.id)
        );

        if (foundProperty) {
          setProperty(foundProperty);
        } else {
          setError("Property not found");
        }
      } catch (err) {
        console.error("Failed to load property details", err);
        setError("Failed to load property details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPropertyDetails();
    }
  }, [params.id]);

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </main>
    );
  }

  if (error || !property) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-6">{error || "Property not found"}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      {/* Property Images */}
      <div className="py-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-4 gap-4 h-80">
            <div className="col-span-3 h-full">
              <div
                className="h-full w-full bg-cover bg-center rounded-lg"
                style={{
                  backgroundImage: `url(https://savasa.id/upload/202306/article/Harga-Perumahan-di-Bekasi-Big-Header_1686363768.jpg)`,
                  backgroundPosition: "center 40%",
                }}
              ></div>
            </div>
            <div className="col-span-1 grid grid-rows-2 gap-4 h-full">
              <div
                className="w-full bg-cover bg-center rounded-lg"
                style={{
                  backgroundImage: `url(https://savasa.id/upload/202306/article/Harga-Perumahan-di-Bekasi-Big-Header_1686363768.jpg)`,
                }}
              ></div>
              <div
                className="w-full bg-cover bg-center rounded-lg"
                style={{
                  backgroundImage: `url(https://savasa.id/upload/202306/article/Harga-Perumahan-di-Bekasi-Big-Header_1686363768.jpg)`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="flex text-sm text-gray-500 mb-4">
          <a href="/" className="hover:text-blue-600">
            Home
          </a>
          <span className="mx-2">›</span>
          <a href="/" className="hover:text-blue-600">
            Properties
          </a>
          <span className="mx-2">›</span>
          <span className="text-gray-700">{property.title}</span>
        </div>

        {/* Single Column Layout */}
        <div className="grid grid-cols-1 gap-6">
          {/* Property Basic Info */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {property.title}
                </h1>
                <p className="text-gray-600 mb-2">
                  {property.address}, {property.district}, {property.city}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-700">
                  {formatPrice(property.price)}
                </p>
                <p className="text-gray-600 text-sm">
                  {formatPrice(
                    property.price
                      ? property.price / (property.building_area || 1)
                      : 0
                  )}
                  /m²
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 text-sm">Bedrooms</span>
                <span className="text-lg font-bold text-gray-800">
                  {property.bedrooms}
                </span>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 text-sm">Bathrooms</span>
                <span className="text-lg font-bold text-gray-800">
                  {property.bathrooms || "N/A"}
                </span>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 text-sm">Building</span>
                <span className="text-lg font-bold text-gray-800">
                  {property.building_area} m²
                </span>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 text-sm">Land</span>
                <span className="text-lg font-bold text-gray-800">
                  {property.land_area} m²
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <div className="flex items-center">
                <RiskIndicator score={property.climate_risk_score} />
                <span className="ml-2 text-gray-600">Climate Safety Score</span>
              </div>
              <ClimateScoreInfo />
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex border-b">
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  selectedTab === "overview"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setSelectedTab("overview")}
              >
                Overview
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  selectedTab === "climate"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setSelectedTab("climate")}
              >
                Climate Analysis
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  selectedTab === "location"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setSelectedTab("location")}
              >
                Location
              </button>
            </div>

            <div className="p-6 text-black">
              {selectedTab === "overview" && (
                <div>
                  <h2 className="text-lg font-bold mb-4">
                    Property Description
                  </h2>
                  <p className="text-gray-700 mb-4">
                    {property.title} is a strategically located residence in{" "}
                    {property.district}, {property.city}. This modern designed
                    house has {property.bedrooms} bedrooms and is equipped with
                    various facilities that will provide comfort for its
                    occupants.
                  </p>
                  <p className="text-gray-700 mb-4">
                    With a building area of {property.building_area} m² and a
                    land area of {property.land_area} m², this property offers
                    ample space for various needs. The property ownership status
                    is {property.certificate}, providing strong legal
                    guarantees.
                  </p>
                  <p className="text-gray-700">
                    This property has a climate safety score of{" "}
                    {property.climate_risk_score}/100, indicating its level of
                    safety from various climate change risks such as flooding,
                    landslides, and the urban heat island effect.
                  </p>

                  <div className="mt-6">
                    <h3 className="font-bold text-gray-800 mb-2">Facilities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <div className="flex items-center p-2 bg-gray-50 rounded">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-600 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm">Electricity</span>
                      </div>
                      <div className="flex items-center p-2 bg-gray-50 rounded">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-600 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 13a1 1 0 100-2h-1V9a1 1 0 10-2 0v2H8a1 1 0 100 2h1v2a1 1 0 102 0v-2h1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm">Water Supply</span>
                      </div>
                      <div className="flex items-center p-2 bg-gray-50 rounded">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-600 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm">Garden</span>
                      </div>
                      <div className="flex items-center p-2 bg-gray-50 rounded">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-600 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        <span className="text-sm">Carport</span>
                      </div>
                      <div className="flex items-center p-2 bg-gray-50 rounded">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-600 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm">Security</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === "climate" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Climate Risk Analysis</h2>
                    <div className="flex items-center">
                      <RiskIndicator
                        score={property.climate_risk_score}
                        size="sm"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Overall Score
                      </span>
                    </div>
                  </div>

                  {property.climate_scores && (
                    <div className="mb-6">
                      <ClimateScores scores={property.climate_scores} />
                    </div>
                  )}

                  <div className="mt-6">
                    <h3 className="font-bold text-gray-800 mb-3">
                      Detailed Risk Assessment
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Surface Temperature */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <span
                            className={`inline-block w-3 h-3 rounded-full ${getRiskColor(
                              property.risks.surface_temperature
                            )} mr-2`}
                          ></span>
                          <h4 className="font-medium">
                            Surface Temperature:{" "}
                            {formatRiskLevel(
                              property.risks.surface_temperature
                            )}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          {property.risks?.surface_temperature?.includes("low")
                            ? "The area maintains relatively cool surface temperatures, reducing urban heat island effects."
                            : "This area experiences higher surface temperatures, which may contribute to heat discomfort and increased cooling needs."}
                        </p>
                      </div>

                      {/* Heat Stress */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <span
                            className={`inline-block w-3 h-3 rounded-full ${getRiskColor(
                              property.risks.heat_stress
                            )} mr-2`}
                          ></span>
                          <h4 className="font-medium">
                            Heat Stress:{" "}
                            {formatRiskLevel(property.risks.heat_stress)}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          {property.risks?.heat_stress?.includes("low")
                            ? "Low risk of heat-related health impacts with comfortable thermal conditions."
                            : "Higher potential for heat-related health risks during extreme heat events."}
                        </p>
                      </div>

                      {/* Green Cover */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <span
                            className={`inline-block w-3 h-3 rounded-full ${getRiskColor(
                              property.risks.green_cover
                            )} mr-2`}
                          ></span>
                          <h4 className="font-medium">
                            Green Cover:{" "}
                            {formatRiskLevel(property.risks.green_cover)}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          {property.risks.green_cover === "excellent" ||
                          property.risks.green_cover === "good"
                            ? "Abundant vegetation provides shade, cooling, and improved air quality."
                            : "Limited green space may reduce natural cooling and air purification benefits."}
                        </p>
                      </div>

                      {/* Heat Zone */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <span
                            className={`inline-block w-3 h-3 rounded-full ${getRiskColor(
                              property.risks.heat_zone
                            )} mr-2`}
                          ></span>
                          <h4 className="font-medium">
                            Heat Zone:{" "}
                            {formatRiskLevel(property.risks.heat_zone)}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          {property.risks?.heat_zone?.includes("low")
                            ? "Located in a cooler microclimate with minimal heat accumulation."
                            : "Located in an urban heat island zone with higher temperature retention."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="font-bold text-gray-800 mb-2">
                      Climate Resilience Tips
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                      <li>
                        Consider adding trees around the house to reduce heat
                        effects
                      </li>
                      <li>
                        Install a rainwater harvesting system to save water and
                        reduce drainage load
                      </li>
                      <li>
                        Use building materials that are resistant to extreme
                        weather changes
                      </li>
                      <li>
                        Check the drainage system regularly, especially before
                        the rainy season
                      </li>
                      <li>
                        Invest in a good ventilation system to maintain indoor
                        air quality
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedTab === "location" && (
                <div>
                  <h2 className="text-lg font-bold mb-4">
                    Location Information
                  </h2>

                  {/* Map using MAPID */}
                  <div className="bg-gray-200 h-64 rounded-lg mb-6">
                    <div
                      ref={mapContainer}
                      className="w-full h-full rounded-lg"
                    />
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="font-bold text-gray-800 mb-2">
                      Neighborhood Climate Features
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                      <li>
                        City park within a 1 km radius to maintain air quality
                        and reduce heat effects
                      </li>
                      <li>
                        Well-maintained city drainage system to prevent flooding
                      </li>
                      <li>
                        Bicycle and pedestrian paths that encourage low-emission
                        transportation
                      </li>
                      <li>
                        Environmental greening program by the local community
                      </li>
                      <li>
                        Access to local markets that provide fresh products with
                        a low carbon footprint
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom map marker styles */}
      <style jsx global>{`
        .property-marker {
          cursor: pointer;
          z-index: 10;
        }

        .maplibregl-popup {
          z-index: 20;
        }
      `}</style>
    </main>
  );
}
