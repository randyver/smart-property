"use client";

import { useState, useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import RiskIndicator from "@/components/RiskIndicator";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { propertyAPI, developerAPI, climateAPI } from "@/services/api";
import { AlertTriangle, Building, Ruler, CheckCircle2 } from "lucide-react";

// Certificate options
const CERTIFICATE_TYPES = [
  "SHM - Sertifikat Hak Milik",
  "HGB - Hak Guna Bangunan",
];

// Property types
const PROPERTY_TYPES = [
  "RUMAH SEKEN",
  "RUMAH BARU",
];

export default function DeveloperPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Selected location
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);

  // Climate scores
  const [climateScores, setClimateScores] = useState<{
    lst_score: number | null;
    ndvi_score: number | null;
    utfvi_score: number | null;
    uhi_score: number | null;
    overall_score: number | null;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    bedrooms: "",
    landArea: "",
    certificate: "",
    propertyType: "",
    landPricePerMeter: ""
  });

  // Price prediction result
  const [prediction, setPrediction] = useState<number | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  // State for storing prediction factors
  const [predictionFactors, setPredictionFactors] = useState<{
    basePrice: number;
    certificateImpact: number;
    propertyTypeImpact: number;
    bedroomsImpact: number;
    climateImpact: number;
  } | null>(null);

  // Get MAPID API key from environment
  const MAPID_API_KEY = "68045407ce3f3583122422c9";
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Get color based on score
  const getScoreColor = (score: number | null | undefined): string => {
    if (score == null) return "bg-gray-400";
    if (score >= 85) return "bg-green-600";
    if (score >= 75) return "bg-green-500";
    if (score >= 65) return "bg-yellow-500";
    if (score >= 55) return "bg-orange-500";
    return "bg-red-600";
  };

  // Format price for display
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Initialize map
  useEffect(() => {
    if (mapInstance.current || !mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://basemap.mapid.io/styles/basic/style.json?key=${MAPID_API_KEY}`,
      center: [107.6096, -6.9147], // Default center on Bandung
      zoom: 12,
    });

    map.on("load", () => {
      setMapLoaded(true);
      console.log("Map style fully loaded");
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    
    // Add click handler to map
    map.on("click", async (e) => {
      const { lng, lat } = e.lngLat;
      console.log(`Clicked at: ${lng}, ${lat}`);

      // Remove existing marker if any
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Create a new marker at the clicked location
      const marker = new maplibregl.Marker({ color: "#3B82F6" })
        .setLngLat([lng, lat])
        .addTo(map);
      
      markerRef.current = marker;

      // Set the selected location
      setSelectedLocation({
        latitude: lat,
        longitude: lng,
      });

      // Get climate scores for the selected location
      await getClimateScores(lat, lng);

      // Reset form and prediction
      setFormData({
        bedrooms: "",
        landArea: "",
        certificate: "",
        propertyType: "",
        landPricePerMeter: ""
      });
      setPrediction(null);
      setPredictionError(null);
    });

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [MAPID_API_KEY]);

  // Get climate scores for a location from the backend API
  const getClimateScores = async (lat: number, lng: number) => {
    try {
      // Call the actual API to get real climate scores
      const response = await climateAPI.getLocationScores(lat, lng);
      console.log("Climate scores response:", response);
      
      // Check if we got a valid response
      if (response.status === "success" && response.data) {
        setClimateScores(response.data);
      } else {
        throw new Error("Invalid response from climate API");
      }
    } catch (error) {
      console.error("Error fetching climate scores:", error);
      
      // Set default scores if API fails
      setClimateScores({
        lst_score: 70,
        ndvi_score: 65,
        utfvi_score: 75,
        uhi_score: 68,
        overall_score: 70
      });
      
      // Show an error message to the user
      setPredictionError("Unable to fetch climate data for this location. Using default values instead.");
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLocation) {
      setPredictionError("Please select a location on the map first");
      return;
    }

    // Validate form
    if (!formData.bedrooms || !formData.landArea || !formData.certificate || 
        !formData.propertyType || !formData.landPricePerMeter) {
      setPredictionError("Please fill in all fields");
      return;
    }

    setIsPredicting(true);
    setPredictionError(null);

    try {
      // Convert climateScores from possibly null object to Record type
      const climateScoresRecord = climateScores ? 
        {...climateScores} as Record<string, number | null> : 
        undefined;

      // Call the real API for price prediction
      const response = await developerAPI.predictPrice({
        location: selectedLocation,
        bedrooms: parseInt(formData.bedrooms),
        landArea: parseFloat(formData.landArea),
        certificate: formData.certificate,
        propertyType: formData.propertyType,
        landPricePerMeter: parseFloat(formData.landPricePerMeter),
        climateScores: climateScoresRecord
      });
      
      if (response.status === "success") {
        // Set the predicted price
        setPrediction(response.predicted_price);
        
        // Store the prediction factors for display
        setPredictionFactors({
          basePrice: response.factors.basePrice || 0,
          certificateImpact: response.factors.certificateImpact || 0,
          propertyTypeImpact: response.factors.propertyTypeImpact || 0,
          bedroomsImpact: response.factors.bedroomsImpact || 0,
          climateImpact: response.factors.climateImpact || 0
        });
      } else {
        throw new Error("Failed to predict price: " + (response.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error predicting price:", error);
      setPredictionError("Failed to predict price. Please try again.");
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <main className="pt-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Property Developer Tool</h1>
        <p className="text-gray-600 mb-8">
          This tool helps developers and property investors estimate property prices based on location data and climate scores.
          Click on the map to select a building location, enter property details, and get a price prediction.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Container */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
            <div ref={mapContainer} className="h-[500px]" />
          </div>

          {/* Input Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {selectedLocation ? (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Location Details</h2>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Coordinates:</p>
                  <p className="font-medium">
                    Lat: {selectedLocation.latitude.toFixed(6)}, Lng: {selectedLocation.longitude.toFixed(6)}
                  </p>
                </div>

                {/* Climate Scores */}
                {climateScores && (
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-800 mb-2">Climate Analysis</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="border rounded-lg p-3 bg-gradient-to-br from-red-50 to-white">
                        <p className="text-xs text-gray-500 mb-1">Land Surface Temperature</p>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${getScoreColor(climateScores.lst_score)} mr-2`}></div>
                          <span className="text-lg font-bold">{climateScores.lst_score}</span>
                          <span className="text-xs text-gray-500 ml-1">/100</span>
                        </div>
                        <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getScoreColor(climateScores.lst_score)}`}
                            style={{ width: `${climateScores.lst_score}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-3 bg-gradient-to-br from-green-50 to-white">
                        <p className="text-xs text-gray-500 mb-1">Vegetation Index (NDVI)</p>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${getScoreColor(climateScores.ndvi_score)} mr-2`}></div>
                          <span className="text-lg font-bold">{climateScores.ndvi_score}</span>
                          <span className="text-xs text-gray-500 ml-1">/100</span>
                        </div>
                        <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getScoreColor(climateScores.ndvi_score)}`}
                            style={{ width: `${climateScores.ndvi_score}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-3 bg-gradient-to-br from-purple-50 to-white">
                        <p className="text-xs text-gray-500 mb-1">Urban Heat Island (UHI)</p>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${getScoreColor(climateScores.uhi_score)} mr-2`}></div>
                          <span className="text-lg font-bold">{climateScores.uhi_score}</span>
                          <span className="text-xs text-gray-500 ml-1">/100</span>
                        </div>
                        <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getScoreColor(climateScores.uhi_score)}`}
                            style={{ width: `${climateScores.uhi_score}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-3 bg-gradient-to-br from-yellow-50 to-white">
                        <p className="text-xs text-gray-500 mb-1">Thermal Field Variance</p>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${getScoreColor(climateScores.utfvi_score)} mr-2`}></div>
                          <span className="text-lg font-bold">{climateScores.utfvi_score}</span>
                          <span className="text-xs text-gray-500 ml-1">/100</span>
                        </div>
                        <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getScoreColor(climateScores.utfvi_score)}`}
                            style={{ width: `${climateScores.utfvi_score}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 border rounded-lg p-3 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50">
                      <p className="text-xs text-gray-500 mb-1">Overall Climate Safety Score</p>
                      <div className="flex items-center">
                        <RiskIndicator score={climateScores.overall_score || 0} size="sm" showLabel={false} />
                        <div className="ml-3">
                          <span className="text-xl font-bold text-blue-700">{climateScores.overall_score}</span>
                          <span className="text-xs text-gray-500 ml-1">/100</span>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {climateScores.overall_score && climateScores.overall_score >= 80 
                              ? "Excellent climate conditions" 
                              : climateScores.overall_score && climateScores.overall_score >= 60
                              ? "Good climate conditions"
                              : climateScores.overall_score && climateScores.overall_score >= 40
                              ? "Moderate climate conditions"
                              : "Challenging climate conditions"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Property Form */}
                <form onSubmit={handleSubmit} className="mt-2">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                    <h3 className="text-lg font-bold text-blue-800 mb-2">Property Details</h3>
                    <p className="text-sm text-blue-700">
                      Fill in the details of your planned property to get an estimated price based on location climate data and property characteristics.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Bedrooms <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="bedrooms"
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                        min="1"
                        max="10"
                        className="w-full p-2 border border-gray-300 rounded-md text-black text-sm"
                        placeholder="e.g. 3"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter a number between 1 and 10</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Land Area (m²) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="landArea"
                        value={formData.landArea}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full p-2 border border-gray-300 rounded-md text-black text-sm"
                        placeholder="e.g. 200"
                      />
                      <p className="text-xs text-gray-500 mt-1">Total area of the land in square meters</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Certificate Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="certificate"
                        value={formData.certificate}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md text-black text-sm"
                      >
                        <option value="">Select certificate type</option>
                        {CERTIFICATE_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Certificate type affects property value and security</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Property Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="propertyType"
                        value={formData.propertyType}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md text-black text-sm"
                      >
                        <option value="">Select property type</option>
                        {PROPERTY_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Different property types have different market values</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Land Price per m² (Rp) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="landPricePerMeter"
                        value={formData.landPricePerMeter}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full p-2 border border-gray-300 rounded-md text-black text-sm"
                        placeholder="e.g. 5000000"
                      />
                      <p className="text-xs text-gray-500 mt-1">Based on local land prices in the area</p>
                    </div>
                  </div>
                  
                  {predictionError && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-md my-4">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                        <p>{predictionError}</p>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3"
                    disabled={isPredicting}
                  >
                    {isPredicting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Calculating Price...
                      </span>
                    ) : "Predict Property Price"}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <div className="bg-blue-50 p-6 rounded-full mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Select a Building Location</h3>
                <p className="text-gray-600 text-center mb-3">
                  Click anywhere on the map to select the location for your proposed property.
                </p>
                <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                  <p className="text-sm text-yellow-700">
                    The system will automatically analyze climate data for your selected location, including Land Surface Temperature, Vegetation Index, Urban Heat Island effect, and more.
                  </p>
                </div>
              </div>
            )}

            {/* Price Prediction Result */}
            {prediction !== null && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">Estimated Property Price</h3>
                <p className="text-2xl font-bold text-green-700">
                  {formatPrice(prediction)}
                </p>
                
                {predictionFactors && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-800 mb-2">Price Factors</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Ruler className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-gray-700">Base land value: {formatPrice(predictionFactors.basePrice)}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-gray-700">Certificate impact: +{predictionFactors.certificateImpact.toFixed(1)}%</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-purple-600 mr-2" />
                        <span className="text-gray-700">Property type impact: +{predictionFactors.propertyTypeImpact.toFixed(1)}%</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-gray-600 mr-2" />
                        <span className="text-gray-700">Bedrooms impact: +{predictionFactors.bedroomsImpact.toFixed(1)}%</span>
                      </div>
                      
                      <div className="flex items-center">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                        <span className="text-gray-700">Climate score impact: {predictionFactors.climateImpact > 0 ? "+" : ""}{predictionFactors.climateImpact.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <p className="text-sm text-gray-600 mt-4">
                  This is an estimated price based on the provided details and location climate scores.
                  Actual property values may vary based on market conditions and other factors not included in this model.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}