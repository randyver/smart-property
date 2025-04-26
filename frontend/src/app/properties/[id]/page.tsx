"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Property } from "@/types";
import RiskIndicator from "@/components/RiskIndicator";
import ClimateScores from "@/components/ClimateScores";
import ClimateScoreInfo from "@/components/ClimateScoreInfo";
import AIRecommendation from "@/components/AIRecommendation";
import { propertyAPI } from "@/services/api";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Image from "next/image";

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
  
  // AI Recommendation states
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [aiRecommendationLoading, setAiRecommendationLoading] = useState(false);
  const [aiRecommendationError, setAiRecommendationError] = useState<string | null>(null);
  
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
  
  // Function to get AI recommendation
  const getAIRecommendation = async () => {
    if (!property) return;
    
    setAiRecommendationLoading(true);
    setAiRecommendationError(null);

    try {
      // Configuration for OpenRouter API
      const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
      const OPENROUTER_API_KEY = "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";

      // Create a detailed prompt based on the property data
      const propertyDetails = `
        Property Name: ${property.title}
        Location: ${property.address || "N/A"}, ${property.district || "N/A"}, ${property.city || "N/A"}
        Price: ${property.price ? `Rp ${property.price.toLocaleString("id-ID")}` : "N/A"}
        Building Area: ${property.building_area || "N/A"} m²
        Land Area: ${property.land_area || "N/A"} m²
        Bedrooms: ${property.bedrooms || "N/A"}
        Property Type: ${property.type || "N/A"}
        Climate Risk Score: ${property.climate_risk_score || "N/A"}/100
        
        Climate Scores:
        - Land Surface Temperature (LST)(Measures ground surface temperature around the property. Higher scores indicate cooler surface temperatures, contributing to a more comfortable microclimate.): ${property.climate_scores?.lst_score || "N/A"}
        - Vegetation Index (NDVI)(Quantifies vegetation density in the surrounding area. Higher scores reflect greater green coverage, which aids heat absorption and improves air quality.): ${property.climate_scores?.ndvi_score || "N/A"}
        - Urban Thermal Field (UTFVI)(Assesses urban temperature fluctuations. Higher scores demonstrate more stable thermal conditions, indicating better environmental consistency.): ${property.climate_scores?.utfvi_score || "N/A"}
        - Urban Heat Island (UHI)(Measures urban heat accumulation compared to surrounding rural areas. Higher scores signify reduced heat island effect, creating a more thermally comfortable zone.): ${property.climate_scores?.uhi_score || "N/A"}
        
        Risk Assessment:
        - Surface Temperature Risk: ${property.risks?.surface_temperature || "N/A"}
        - Heat Stress Risk: ${property.risks?.heat_stress || "N/A"}
        - Green Cover Risk: ${property.risks?.green_cover || "N/A"}
        - Heat Zone Risk: ${property.risks?.heat_zone || "N/A"}
      `;
      console.log("PROPERTY DETAILS",propertyDetails)
      // Prepare the system message
      const systemMessage = {
        role: "system",
        content: `You are an AI advisor for SmartProperty, a platform that helps people find climate-safe properties. 
        You analyze property data and provide balanced recommendations about whether to buy a property based on climate factors, price, location, and other relevant considerations.
        
        FORMAT YOUR RESPONSE LIKE THIS:
        **Aspek Iklim:** Your analysis of climate aspects here.
        
        **Aspek Harga dan Lokasi:** Your analysis of price and location here.
        
        **Faktor Lainnya:** Analysis of other factors here.
        
        **Rekomendasi:** Your final recommendation here.
        
        Keep your recommendations concise, well-structured, and focused on practical advice.
        Be honest about both positive and negative aspects, and provide a clear recommendation at the end.
        Write your response in Bahasa Indonesia.`
      };

      // Prepare the user message
      const userMessage = {
        role: "user",
        content: `Sebagai assistant SmartProperty, bisakah kamu memberi rekomendasi yang lengkap untuk rumah berikut, apakah harus dibeli atau jangan, apa yang sebaiknya dilakukan jika membeli, dan pertimbangannya? Analisis dari aspek iklim, harga, lokasi, dan faktor lainnya.\n\n${propertyDetails}`
      };

      // Prepare the request payload
      const payload = {
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [systemMessage, userMessage],
        temperature: 0.2,
        max_tokens: 1000
      };

      // Make the API request
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://smartproperty.app",
          "X-Title": "SmartProperty AI Recommendation"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Extract the AI's recommendation
      if (data.choices && data.choices.length > 0) {
        setAiRecommendation(data.choices[0].message.content);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error("Error generating AI recommendation:", error);
      setAiRecommendationError("Gagal mendapatkan rekomendasi AI. Silakan coba lagi nanti.");
    } finally {
      setAiRecommendationLoading(false);
    }
  };

  // Get MAPID API key from environment
  const MAPID_API_KEY = "68045407ce3f3583122422c9";
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
        style: `https://basemap.mapid.io/styles/basic/style.json?key=${MAPID_API_KEY}`,
        center: [property.location.longitude, property.location.latitude], // Center on property
        zoom: 14, // Zoom closer than default
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
  }, [selectedTab, property, MAPID_API_KEY]);

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
            {/* Large image */}
            <div className="col-span-3 h-full relative rounded-lg overflow-hidden">
              <Image
                src="/house-image.jpg"
                alt="Main property"
                fill
                className="object-cover object-[center_40%] rounded-lg"
                priority
              />
            </div>

            {/* Two small images */}
            <div className="col-span-1 grid grid-rows-2 gap-4 h-full">
              <div className="relative w-full h-full rounded-lg overflow-hidden">
                <Image
                  src="/house-image.jpg"
                  alt="Side property 1"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="relative w-full h-full rounded-lg overflow-hidden">
                <Image
                  src="/house-image.jpg"
                  alt="Side property 2"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
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
            Detail Properti
          </a>
          <span className="mx-2">›</span>
          <span className="text-gray-700">{property.title}</span>
        </div>

        {/* Single Column Layout */}
        <div className="grid grid-cols-1 gap-6">
          {/* Property Basic Info */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-start mb-4">
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
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 text-sm">Kamar Tidur</span>
                <span className="text-lg font-bold text-gray-800">
                  {property.bedrooms}
                </span>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 text-sm">Kamar Mandi</span>
                <span className="text-lg font-bold text-gray-800">
                  {property.bathrooms || "N/A"}
                </span>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-500 text-sm">Luas Bangunan</span>
                <span className="text-lg font-bold text-gray-800">
                  {property.building_area} m²
                </span>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 text-sm">Luas Tanah</span>
                <span className="text-lg font-bold text-gray-800">
                  {property.land_area} m²
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <div className="flex items-center">
                <RiskIndicator score={property.climate_risk_score} />
                <span className="ml-2 text-gray-600">Skor Iklim</span>
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
                Analisis Iklim
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  selectedTab === "location"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setSelectedTab("location")}
              >
                Lokasi
              </button>
            </div>

            <div className="p-6 text-black">
              {selectedTab === "overview" && (
                <div>
                  <h2 className="text-lg font-bold mb-4">Deskripsi Properti</h2>
                  <p className="text-gray-700 mb-4">
                    {property.title} adalah hunian yang terletak strategis di{" "}
                    {property.district}, {property.city}. Rumah dengan desain
                    modern ini memiliki {property.bedrooms} kamar tidur dan
                    dilengkapi dengan berbagai fasilitas yang akan memberikan
                    kenyamanan bagi penghuninya.
                  </p>
                  <p className="text-gray-700 mb-4">
                    Dengan luas bangunan {property.building_area} m² dan luas
                    tanah {property.land_area} m², properti ini menawarkan ruang
                    yang luas untuk berbagai kebutuhan. Status kepemilikan
                    properti ini adalah {property.certificate}, memberikan
                    jaminan hukum yang kuat.
                  </p>
                  <p className="text-gray-700">
                    Properti ini memiliki skor keamanan iklim sebesar{" "}
                    {property.climate_risk_score}/100, yang menunjukkan tingkat
                    keamanannya dari berbagai risiko perubahan iklim seperti
                    banjir, tanah longsor, dan efek pulau panas perkotaan.
                  </p>

                  <div className="mt-6">
                    <h3 className="font-bold text-gray-800 mb-2">Fasilitas</h3>
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
                        <span className="text-sm">Listrik</span>
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
                        <span className="text-sm">Air Bersih</span>
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
                        <span className="text-sm">Taman</span>
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
                        <span className="text-sm">Keamanan</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Recommendation - show only in overview tab */}
                  <AIRecommendation 
                    property={property}
                    recommendation={aiRecommendation}
                    isLoading={aiRecommendationLoading}
                    error={aiRecommendationError}
                    onGetRecommendation={getAIRecommendation}
                  />
                </div>
              )}

              {selectedTab === "climate" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Analisis Risiko Iklim</h2>
                    <div className="flex items-center">
                      <RiskIndicator
                        score={property.climate_risk_score}
                        size="sm"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Skor Keseluruhan
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
                      Penilaian Risiko Secara Rinci
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Suhu Permukaan */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <span
                            className={`inline-block w-3 h-3 rounded-full ${getRiskColor(
                              property.risks.surface_temperature
                            )} mr-2`}
                          ></span>
                          <h4 className="font-medium">
                            Suhu Permukaan:{" "}
                            {formatRiskLevel(
                              property.risks.surface_temperature
                            )}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          {property.risks?.surface_temperature?.includes("low")
                            ? "Wilayah ini memiliki suhu permukaan yang relatif sejuk, mengurangi efek pulau panas perkotaan."
                            : "Wilayah ini mengalami suhu permukaan yang tinggi, yang dapat menyebabkan ketidaknyamanan panas dan kebutuhan pendinginan yang lebih besar."}
                        </p>
                      </div>

                      {/* Stres Panas */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <span
                            className={`inline-block w-3 h-3 rounded-full ${getRiskColor(
                              property.risks.heat_stress
                            )} mr-2`}
                          ></span>
                          <h4 className="font-medium">
                            Stres Panas:{" "}
                            {formatRiskLevel(property.risks.heat_stress)}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          {property.risks?.heat_stress?.includes("low")
                            ? "Risiko rendah terhadap dampak kesehatan terkait panas dengan kondisi termal yang nyaman."
                            : "Potensi tinggi terhadap risiko kesehatan akibat panas selama cuaca ekstrem."}
                        </p>
                      </div>

                      {/* Tutupan Hijau */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <span
                            className={`inline-block w-3 h-3 rounded-full ${getRiskColor(
                              property.risks.green_cover
                            )} mr-2`}
                          ></span>
                          <h4 className="font-medium">
                            Tutupan Hijau:{" "}
                            {formatRiskLevel(property.risks.green_cover)}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          {property.risks.green_cover === "excellent" ||
                          property.risks.green_cover === "good"
                            ? "Vegetasi yang melimpah memberikan keteduhan, pendinginan alami, dan kualitas udara yang lebih baik."
                            : "Ruang hijau yang terbatas dapat mengurangi efek pendinginan alami dan penyaringan udara."}
                        </p>
                      </div>

                      {/* Zona Panas */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <span
                            className={`inline-block w-3 h-3 rounded-full ${getRiskColor(
                              property.risks.heat_zone
                            )} mr-2`}
                          ></span>
                          <h4 className="font-medium">
                            Zona Panas:{" "}
                            {formatRiskLevel(property.risks.heat_zone)}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          {property.risks?.heat_zone?.includes("low")
                            ? "Terletak di mikroklimat yang lebih sejuk dengan akumulasi panas yang minimal."
                            : "Terletak di zona pulau panas perkotaan dengan retensi suhu yang lebih tinggi."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="font-bold text-gray-800 mb-2">
                      Tips Ketahanan terhadap Iklim
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                      <li>
                        Pertimbangkan untuk menanam pohon di sekitar rumah guna
                        mengurangi efek panas
                      </li>
                      <li>
                        Pasang sistem penampungan air hujan untuk menghemat air
                        dan mengurangi beban drainase
                      </li>
                      <li>
                        Gunakan bahan bangunan yang tahan terhadap perubahan
                        cuaca ekstrem
                      </li>
                      <li>
                        Periksa sistem drainase secara berkala, terutama sebelum
                        musim hujan
                      </li>
                      <li>
                        Investasi pada sistem ventilasi yang baik untuk menjaga
                        kualitas udara dalam ruangan
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedTab === "location" && (
                <div>
                  <h2 className="text-lg font-bold mb-4">Informasi Lokasi</h2>

                  {/* Peta menggunakan MAPID */}
                  <div className="bg-gray-200 h-64 rounded-lg mb-6">
                    <div
                      ref={mapContainer}
                      className="w-full h-full rounded-lg"
                    />
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="font-bold text-gray-800 mb-2">
                      Fitur Iklim di Sekitar Lingkungan
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                      <li>
                        Taman kota dalam radius 1 km untuk menjaga kualitas
                        udara dan mengurangi efek panas
                      </li>
                      <li>
                        Sistem drainase kota yang terawat baik untuk mencegah
                        banjir
                      </li>
                      <li>
                        Jalur sepeda dan pejalan kaki yang mendukung
                        transportasi rendah emisi
                      </li>
                      <li>
                        Program penghijauan lingkungan oleh komunitas setempat
                      </li>
                      <li>
                        Akses ke pasar lokal yang menyediakan produk segar
                        dengan jejak karbon rendah
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
             