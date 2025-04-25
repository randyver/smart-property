"use client";
import { useEffect, useRef, useState, memo, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Property } from "@/types";

export type ClimateLayerType = "lst" | "ndvi" | "uhi" | "utfvi" | undefined;

interface MapComponentProps {
  properties?: Property[];
  activeLayer?: ClimateLayerType;
  onMarkerClick?: (propertyId: number) => void;
  center?: [number, number];
  zoom?: number;
  mapRef?: React.MutableRefObject<any>;
}

const FEATURES_PER_PAGE = 100;
const DEFAULT_CENTER: [number, number] = [107.6096, -6.9147];
const DEFAULT_ZOOM = 12;

const MapComponent = memo(
  ({
    properties = [],
    activeLayer,
    onMarkerClick,
    center = DEFAULT_CENTER,
    zoom = DEFAULT_ZOOM,
    mapRef,
  }: MapComponentProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<maplibregl.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const markersRef = useRef<{ [key: number]: maplibregl.Marker }>({});
    const [showProperties, setShowProperties] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [pendingLayer, setPendingLayer] = useState<ClimateLayerType>(undefined);
    const wasLoadingRef = useRef(false);

    // Track loaded features for each layer
    const loadedFeaturesRef = useRef<{ [key: string]: any[] }>({
      lst: [],
      ndvi: [],
      uhi: [],
      utfvi: [],
    });

    // Track pagination state for each layer
    const currentPageRef = useRef<{ [key: string]: number }>({
      lst: 1,
      ndvi: 1,
      uhi: 1,
      utfvi: 1,
    });

    const totalPagesRef = useRef<{ [key: string]: number }>({
      lst: 1,
      ndvi: 1,
      uhi: 1,
      utfvi: 1,
    });

    // For handling cancellation of ongoing requests
    const abortControllerRef = useRef<AbortController | null>(null);

    // To track the previous active layer
    const prevActiveLayerRef = useRef<ClimateLayerType>(undefined);

    const MAPID_API_KEY = "68045407ce3f3583122422c9";
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    // Updated layer config with accurate classifications
    const layerConfig = {
      uhi: {
        name: "Urban Heat Island",
        colors: [
          "#313695", // Non-UHI
          "#74add1", // Very Weak UHI
          "#fed976", // Weak UHI
          "#feb24c", // Fairly Weak UHI
          "#fd8d3c", // Moderate UHI
          "#fc4e2a", // Fairly Strong UHI
          "#e31a1c", // Strong UHI
          "#b10026", // Very Strong UHI
        ],
        gridcodeCount: 8,
        legendLabels: [
          "Non (<0)",
          "Very Weak (0-0.0025)",
          "Weak (0.0025-0.005)",
          "Fairly Weak (0.005-0.0075)",
          "Moderate (0.0075-0.01)",
          "Fairly Strong (0.01-0.0125)",
          "Strong (0.0125-0.015)",
          "Very Strong (>0.015)",
        ],
      },
      utfvi: {
        name: "Urban Thermal Field Variance Index",
        colors: [
          "#5C09FC", // Non-UHI
          "#4EC9FD", // Weak UHI
          "#B4FEA3", // Moderate UHI
          "#FBD513", // Strong UHI
          "#FE230A", // Very Strong UHI
        ],
        gridcodeCount: 5,
        legendLabels: [
          "Non (<0)",
          "Weak (0-0.005)",
          "Moderate (0.005-0.01)",
          "Strong (0.01-0.015)",
          "Very Strong (>0.015)",
        ],
      },
      lst: {
        name: "Land Surface Temperature",
        colors: [
          "#F5F500", // Very Cool
          "#F5B800", // Cool
          "#F57A00", // Moderate
          "#F53D00", // Hot
          "#F50000", // Very Hot
        ],
        gridcodeCount: 5,
        legendLabels: [
          "Very Cool (<24°C)",
          "Cool (24-28°C)",
          "Moderate (28-32°C)",
          "Hot (32-36°C)",
          "Very Hot (>36°C)",
        ],
      },
      ndvi: {
        name: "Vegetation Index",
        colors: [
          "#A50026", // Non-vegetation/Water/Built-up Land
          "#FF0000", // Very Sparse Vegetation
          "#FFFF00", // Sparse Vegetation
          "#86CB66", // Moderate Vegetation
          "#4C7300", // Dense Vegetation
        ],
        gridcodeCount: 5,
        legendLabels: [
          "Non-vegetation (<0.2)",
          "Very Sparse (0.2-0.4)",
          "Sparse (0.4-0.6)",
          "Moderate (0.6-0.8)",
          "Dense (>0.8)",
        ],
      },
    };

    // Initialize map
    useEffect(() => {
      if (mapInstance.current || !mapContainer.current) return;

      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://basemap.mapid.io/styles/basic/style.json?key=${MAPID_API_KEY}`,
        center,
        zoom,
      });

      map.on("load", () => {
        setMapLoaded(true);
        console.log("Map style fully loaded");
      });

      map.addControl(new maplibregl.NavigationControl(), "top-right");
      mapInstance.current = map;

      if (mapRef) mapRef.current = map;

      return () => {
        if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
        }
        abortControllerRef.current?.abort();
      };
    }, [MAPID_API_KEY, center, zoom, mapRef]);

    // Track loading state changes
    useEffect(() => {
      // When loading completes
      if (wasLoadingRef.current && !isLoading) {
        console.log('Loading completed, checking if there is a pending layer');
        // If we have a pending layer, apply it now
        if (pendingLayer) {
          console.log(`Applying pending layer: ${pendingLayer}`);
          applyLayer(pendingLayer);
          setPendingLayer(undefined);
        }
      }
      
      // Update the wasLoading ref for next check
      wasLoadingRef.current = isLoading;
    }, [isLoading]);

    // Apply the layer (directly communicate with parent)
    const applyLayer = useCallback((layerType: ClimateLayerType) => {
      if (!onMarkerClick) return;
      
      if (layerType === undefined) {
        // Clear layer
        onMarkerClick(0);
      } else {
        // Set the appropriate layer
        if (layerType === "lst") {
          onMarkerClick(1);
        } else if (layerType === "ndvi") {
          onMarkerClick(2);
        } else if (layerType === "uhi") {
          onMarkerClick(3);
        } else if (layerType === "utfvi") {
          onMarkerClick(4);
        }
      }
    }, [onMarkerClick]);

    // Load climate data function
    const loadClimateData = useCallback(
      async (layerType: ClimateLayerType) => {
        if (!layerType || !mapInstance.current) return;

        console.log(`Starting to load climate data for ${layerType}`);

        // IMPORTANT: Always set these at the beginning
        setIsLoading(true);
        setLoadingProgress(0);

        // Make sure we reset the current page if we're starting fresh
        if (loadedFeaturesRef.current[layerType].length === 0) {
          currentPageRef.current[layerType] = 1;
        }

        // Abort any ongoing requests
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        const map = mapInstance.current;
        const sourceId = `${layerType}-source`;
        const layerId = `${layerType}-layer`;
        const outlineId = `${layerType}-outline`;

        try {
          // Wait for style if not loaded
          if (!map.isStyleLoaded()) {
            await new Promise<void>((resolve) => {
              map.once("style.load", () => resolve());
            });
          }

          // Reset pagination and loaded features for this layer if needed
          if (loadedFeaturesRef.current[layerType].length === 0) {
            currentPageRef.current[layerType] = 1;
            setLoadingProgress(0);
          }

          // Function to load a specific page of data
          const loadPage = async (page: number) => {
            console.log(`Loading ${layerType} page ${page}`);

            try {
              const response = await fetch(
                `${API_BASE_URL}/api/data/geojson/${layerType}?page=${page}&per_page=${FEATURES_PER_PAGE}`,
                { signal: abortControllerRef.current?.signal }
              );

              if (!response.ok) {
                throw new Error(
                  `Failed to load ${layerType} data: ${response.statusText}`
                );
              }

              const data = await response.json();

              // Check for API format - some APIs return nested data
              const features = data.features || data.data?.features || [];
              const total_features =
                data.total_features ||
                data.data?.total_features ||
                features.length;
              const total_pages =
                data.total_pages || data.pagination?.total_pages || 1;

              console.log(
                `Loaded ${features.length} features for ${layerType}, page ${page}/${total_pages}`
              );

              // Update total pages
              totalPagesRef.current[layerType] = total_pages;

              // Append to loaded features
              loadedFeaturesRef.current[layerType] = [
                ...loadedFeaturesRef.current[layerType],
                ...features,
              ];

              // Update loading progress
              setLoadingProgress(
                Math.min(
                  100,
                  Math.round(
                    (loadedFeaturesRef.current[layerType].length /
                      total_features) *
                      100
                  )
                )
              );

              // Create or update the source
              if (!map.getSource(sourceId)) {
                console.log(`Creating new source for ${layerType}`);

                // Add source
                map.addSource(sourceId, {
                  type: "geojson",
                  data: {
                    type: "FeatureCollection",
                    features: loadedFeaturesRef.current[layerType],
                  },
                });

                // Add fill layer
                map.addLayer({
                  id: layerId,
                  type: "fill",
                  source: sourceId,
                  layout: { visibility: "visible" },
                  paint: {
                    "fill-color": [
                      "match",
                      ["get", "gridcode"],
                      1,
                      layerConfig[layerType].colors[0],
                      2,
                      layerConfig[layerType].colors[1],
                      3,
                      layerConfig[layerType].colors[2],
                      4,
                      layerConfig[layerType].colors[3],
                      5,
                      layerConfig[layerType].colors[4],
                      ...(layerConfig[layerType].gridcodeCount > 5
                        ? [
                            6,
                            layerConfig[layerType].colors[5],
                            7,
                            layerConfig[layerType].colors[6],
                            8,
                            layerConfig[layerType].colors[7],
                          ]
                        : []),
                      layerConfig[layerType].colors[0], // default color
                    ],
                    "fill-opacity": 0.7,
                  },
                });

                // Add outline layer
                map.addLayer({
                  id: outlineId,
                  type: "line",
                  source: sourceId,
                  layout: { visibility: "visible" },
                  paint: {
                    "line-color": "#000",
                    "line-width": 0,
                    "line-opacity": 0.3,
                  },
                });
              } else {
                // Update existing source with new data
                (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData({
                  type: "FeatureCollection",
                  features: loadedFeaturesRef.current[layerType],
                });

                // Ensure layer is visible
                map.setLayoutProperty(layerId, "visibility", "visible");
                map.setLayoutProperty(outlineId, "visibility", "visible");
              }

              // Load next page if available
              if (page < total_pages) {
                currentPageRef.current[layerType] = page + 1;
                await loadPage(currentPageRef.current[layerType]);
              } else {
                // All pages loaded
                setIsLoading(false);
              }
            } catch (error) {
              if (error instanceof Error) {
                if (error.name !== "AbortError") {
                  console.error(
                    `Error loading ${layerType} page ${page}:`,
                    error
                  );
                  setIsLoading(false);
                } else {
                  console.log(`Loading ${layerType} aborted`);
                }
              }
            }
          };

          // Start loading with current page
          await loadPage(currentPageRef.current[layerType]);
        } catch (error) {
          console.error("Error in loadClimateData:", error);
          setIsLoading(false);
        }
      },
      [API_BASE_URL]
    );

    // Key fix: Handle layer visibility separately from data loading
    const setLayerVisibility = useCallback(
      (layerType: ClimateLayerType, visible: boolean) => {
        if (!mapInstance.current) return;

        const map = mapInstance.current;
        const layerId = `${layerType}-layer`;
        const outlineId = `${layerType}-outline`;

        if (map.getLayer(layerId)) {
          map.setLayoutProperty(
            layerId,
            "visibility",
            visible ? "visible" : "none"
          );
        }

        if (map.getLayer(outlineId)) {
          map.setLayoutProperty(
            outlineId,
            "visibility",
            visible ? "visible" : "none"
          );
        }
      },
      []
    );

    // Handle activeLayer changes
    useEffect(() => {
      if (!mapLoaded || !mapInstance.current) return;

      // Hide all layers first
      Object.keys(layerConfig).forEach((layer) => {
        setLayerVisibility(layer as ClimateLayerType, false);
      });

      // Show and load active layer if set
      if (activeLayer) {
        console.log(`Setting active layer to ${activeLayer}`);

        // Check if we already have data for this layer
        if (loadedFeaturesRef.current[activeLayer].length === 0) {
          // Load new data
          loadClimateData(activeLayer);
        } else {
          // Just make the layer visible
          setLayerVisibility(activeLayer, true);
        }
      }

      // Update previous layer ref
      prevActiveLayerRef.current = activeLayer;
    }, [activeLayer, mapLoaded, loadClimateData, setLayerVisibility]);

    // Update property markers
    useEffect(() => {
      if (!mapLoaded || !mapInstance.current) return;

      const map = mapInstance.current;

      const addMarkers = () => {
        // Clear existing markers
        Object.values(markersRef.current).forEach((marker) => marker.remove());
        markersRef.current = {};

        // Only add markers if they should be visible
        if (!showProperties) return;

        // Add property markers
        properties.forEach((property) => {
          if (!property.location?.latitude || !property.location?.longitude)
            return;

          const el = document.createElement("div");
          el.className = "property-marker";

          const score =
            property.climate_scores?.overall_score ||
            property.climate_risk_score;
          const color = getScoreColor(score);

          el.innerHTML = `
          <div class="marker-container" style="background-color: ${color}">
            <span>${score ?? "?"}</span>
          </div>
        `;

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([
              property.location.longitude,
              property.location.latitude,
            ])
            .addTo(map);

          el.onclick = (e) => {
            e.stopPropagation();
            onMarkerClick?.(property.id);
          };

          markersRef.current[property.id] = marker;
        });
      };

      if (map.isStyleLoaded()) {
        addMarkers();
      } else {
        map.once("style.load", addMarkers);
      }
    }, [properties, mapLoaded, showProperties, onMarkerClick]);

    // Helper function to get color based on score
    const getScoreColor = (score?: number | null) => {
      if (score == null) return "#9ca3af";
      if (score >= 85) return "#059669";
      if (score >= 75) return "#10b981";
      if (score >= 65) return "#eab308";
      if (score >= 55) return "#f97316";
      return "#dc2626";
    };

    // Toggle property visibility
    const togglePropertyVisibility = () => {
      setShowProperties((prev) => !prev);
    };

    // Clear selected layer
    const clearLayer = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent the button click from bubbling to the parent
      
      // If we're currently loading, set a pending state to null
      if (isLoading) {
        console.log("Currently loading, setting pending layer to null");
        setPendingLayer(undefined);
        
        // Abort current loading
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      }
      
      // Clear the layer immediately
      applyLayer(undefined);
      
      // Reset loading state
      setIsLoading(false);
    };

    // Handle layer selection
    const handleLayerSelect = (layerType: ClimateLayerType) => {
      console.log(`Layer selected: ${layerType}`);

      // We're selecting the layer that's already active, do nothing
      if (layerType === activeLayer) {
        return;
      }

      // If there's an active layer, don't do anything (user must clear first)
      if (activeLayer) {
        console.log("There's already an active layer, please clear it first");
        return;
      }
      
      // If we're currently loading (though active layer is null), store this as pending
      if (isLoading) {
        console.log(`Loading in progress, setting ${layerType} as pending layer`);
        setPendingLayer(layerType);
        return;
      }

      // Otherwise, select the new layer
      setShowProperties(false);

      // IMPORTANT: Reset loaded features for the new layer
      if (layerType) {
        loadedFeaturesRef.current[layerType] = [];
        currentPageRef.current[layerType] = 1;
      }

      // Apply the new layer
      applyLayer(layerType);
    };

    return (
      <div className="w-full h-full relative">
        <div ref={mapContainer} className="w-full h-full" />

        {/* Loading progress bar */}
        {isLoading && (
          <div className="absolute top-8 left-4 right-4 bg-white bg-opacity-90 rounded-md p-2 z-10 shadow-md">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-lg text-center py-2 text-gray-600">
              Loading {activeLayer} data... {loadingProgress}%
              {pendingLayer && (
                <span className="text-xs text-blue-600 ml-2">
                  ({layerConfig[pendingLayer].name} queued)
                </span>
              )}
            </p>
          </div>
        )}

        {/* Layer controls */}
        <div className="absolute top-4 right-4 bg-white rounded-md shadow-md p-3 z-10 w-72">
          <h3 className="text-sm font-bold mb-2 px-2 text-gray-800">
            Map Layers
          </h3>

          {/* Instructions alert */}
          <div className="mb-3 px-2 py-2 bg-yellow-50 text-amber-700 text-xs rounded border border-amber-200">
            <p>To change climate layer, click the trash icon to clear the current layer first, then select a new one.</p>
          </div>

          <div className="mb-3 border-b pb-2">
            <button
              onClick={togglePropertyVisibility}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                showProperties
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <div
                className={`w-4 h-4 min-w-[16px] min-h-[16px] rounded-full flex-shrink-0 mr-2 ${
                  showProperties ? "bg-white" : "bg-blue-600"
                }`}
              ></div>
              <span className="truncate text-xs">Property Locations</span>
            </button>
          </div>

          <h4 className="text-xs font-medium text-gray-600 mb-1 px-2">
            Climate Layers
          </h4>
          <div className="space-y-1">
            {Object.entries(layerConfig).map(([key, layer]) => (
              <div key={key} className="relative group">
                <button
                  onClick={() => handleLayerSelect(key as ClimateLayerType)}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                    activeLayer === key
                      ? "bg-blue-600 text-white"
                      : activeLayer || isLoading
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed" // Disabled when another layer is active or loading
                        : "hover:bg-gray-100 text-gray-700"
                  }`}
                  disabled={!!(activeLayer || isLoading)}
                >
                  <div
                    className={`w-4 h-4 min-w-[16px] min-h-[16px] rounded-full flex-shrink-0 mr-2 ${
                      activeLayer === key ? "bg-white" : "bg-blue-600"
                    }`}
                  ></div>
                  <span className="truncate text-xs">{layer.name}</span>
                  
                  {/* Show "pending" indicator for the pending layer */}
                  {pendingLayer === key && (
                    <span className="ml-2 text-xs text-blue-600 animate-pulse">
                      (queued)
                    </span>
                  )}
                </button>
                
                {/* Delete button - only show for active layer or when loading */}
                {(activeLayer === key || isLoading) && (
                  <button
                    onClick={clearLayer}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
                      activeLayer ? 'text-white' : 'text-gray-400'
                    } hover:text-red-500 p-1`}
                    title="Clear layer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Legend - Updated with accurate classification labels */}
        {activeLayer && (
          <div className="absolute bottom-4 right-4 bg-white p-3 rounded-md shadow-md z-10 max-w-xs">
            <h4 className="text-sm font-bold mb-2 text-gray-800">
              {layerConfig[activeLayer].name}
            </h4>
            <div className="space-y-1">
              {layerConfig[activeLayer].colors
                .slice(0, layerConfig[activeLayer].gridcodeCount)
                .map((color, i) => (
                  <div key={i} className="flex items-center">
                    <div
                      className="w-4 h-4 mr-2"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-xs text-gray-700">
                      {layerConfig[activeLayer].legendLabels[i]}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <style jsx global>{`
          .property-marker {
            cursor: pointer;
            width: 40px;
            height: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10;
          }
          .marker-container {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            font-weight: bold;
            font-size: 0.75rem;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
            transition: transform 0.2s ease;
          }
          .property-marker:hover .marker-container {
            transform: scale(1.15);
          }
          .maplibregl-popup {
            z-index: 20;
          }
        `}</style>
      </div>
    );
  }
);

MapComponent.displayName = "MapComponent";
export default MapComponent;