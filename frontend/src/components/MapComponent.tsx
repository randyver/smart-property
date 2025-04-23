// MapComponent.tsx with fixed hook usage
"use client";

import { useEffect, useRef, useState, memo, useMemo } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Property } from "@/types";

// Define the climate layer types
export type ClimateLayerType = "lst" | "ndvi" | "uhi" | "utfvi" | undefined;

interface MapComponentProps {
  properties?: Property[];
  activeLayer?: ClimateLayerType;
  onMarkerClick?: (propertyId: number) => void;
  center?: [number, number];
  zoom?: number;
  mapRef?: React.MutableRefObject<any>;
}

// The component is wrapped with React.memo to prevent unnecessary re-renders
const MapComponent = memo(
  ({
    properties = [],
    activeLayer,
    onMarkerClick,
    center = [107.6096, -6.9147], // Default to Bandung
    zoom = 12,
    mapRef,
  }: MapComponentProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<maplibregl.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const markersRef = useRef<{ [key: number]: maplibregl.Marker }>({});
    const [showProperties, setShowProperties] = useState(true); // State untuk visibilitas properti

    // Layer information with colors and descriptions (updated with correct gridcode counts)
    const layerConfig = useMemo(
      () => ({
        lst: {
          name: "Land Surface Temperature",
          description: "Temperature measured from the land surface",
          colors: [
            "#91cf60", // gridcode 1 - Very Low (Better)
            "#d9ef8b", // gridcode 2 - Low
            "#fee08b", // gridcode 3 - Medium
            "#fc8d59", // gridcode 4 - High
            "#d73027", // gridcode 5 - Very High (Worse)
          ],
          legend: [
            { color: "#91cf60", label: "Very Low" },
            { color: "#d9ef8b", label: "Low" },
            { color: "#fee08b", label: "Medium" },
            { color: "#fc8d59", label: "High" },
            { color: "#d73027", label: "Very High" },
          ],
          gridcodeCount: 5,
        },
        ndvi: {
          name: "Vegetation Index",
          description: "Normalized Difference Vegetation Index",
          colors: [
            "#1a9850", // gridcode 1 - High Vegetation (Better)
            "#66bd63", // gridcode 2
            "#a6d96a", // gridcode 3
            "#d9ef8b", // gridcode 4
            "#fee08b", // gridcode 5 - Low Vegetation (Worse)
          ],
          legend: [
            { color: "#1a9850", label: "High Vegetation" },
            { color: "#66bd63", label: "Good Vegetation" },
            { color: "#a6d96a", label: "Moderate Vegetation" },
            { color: "#d9ef8b", label: "Low Vegetation" },
            { color: "#fee08b", label: "Very Low Vegetation" },
          ],
          gridcodeCount: 5,
        },
        uhi: {
          name: "Urban Heat Island",
          description: "Urban Heat Island effect measurements",
          colors: [
            "#91cf60", // gridcode 1 - Minimal (Better)
            "#a8db74", // gridcode 2
            "#bfe789", // gridcode 3
            "#d5f39e", // gridcode 4
            "#eaf8b3", // gridcode 5
            "#fee08b", // gridcode 6
            "#fdae61", // gridcode 7
            "#f46d43", // gridcode 8 - Severe (Worse)
          ],
          legend: [
            { color: "#91cf60", label: "Minimal" },
            { color: "#a8db74", label: "Very Low" },
            { color: "#bfe789", label: "Low" },
            { color: "#d5f39e", label: "Low-Medium" },
            { color: "#eaf8b3", label: "Medium" },
            { color: "#fee08b", label: "Medium-High" },
            { color: "#fdae61", label: "High" },
            { color: "#f46d43", label: "Severe" },
          ],
          gridcodeCount: 8,
        },
        utfvi: {
          name: "Urban Thermal Field Variance Index",
          description: "Urban thermal variation measurements",
          colors: [
            "#91cf60", // gridcode 1 - Very Low (Better)
            "#d9ef8b", // gridcode 2 - Low
            "#fee08b", // gridcode 3 - Medium
            "#fc8d59", // gridcode 4 - High
            "#d73027", // gridcode 5 - Very High (Worse)
          ],
          legend: [
            { color: "#91cf60", label: "Very Low" },
            { color: "#d9ef8b", label: "Low" },
            { color: "#fee08b", label: "Medium" },
            { color: "#fc8d59", label: "High" },
            { color: "#d73027", label: "Very High" },
          ],
          gridcodeCount: 5,
        },
      }),
      []
    );

    const mapidApiKey =
      process.env.NEXT_PUBLIC_MAPID_API_KEY || "your_mapid_api_key";

    // Initialize map only once
    useEffect(() => {
      if (mapInstance.current) return; // Map already initialized

      if (mapContainer.current) {
        mapInstance.current = new maplibregl.Map({
          container: mapContainer.current,
          style: `https://basemap.mapid.io/styles/basic/style.json?key=${mapidApiKey}`,
          center: center,
          zoom: zoom,
        });

        mapInstance.current.on("load", () => {
          setMapLoaded(true);
        });

        // Expose map to parent through ref
        if (mapRef) {
          mapRef.current = mapInstance.current;
        }

        // Add navigation controls
        mapInstance.current.addControl(
          new maplibregl.NavigationControl(),
          "top-right"
        );
      }

      // Cleanup on unmount
      return () => {
        if (mapInstance.current) {
          if (mapRef) {
            mapRef.current = null;
          }
          mapInstance.current.remove();
          mapInstance.current = null;
        }
      };
    }, [mapidApiKey, center, zoom, mapRef]);

    // Custom click handler function
    const handleMarkerClick = (propertyId: number) => {
      // Find the property by ID
      const property = properties.find((p) => p.id === propertyId);
      if (!property || !mapInstance.current) return;

      console.log(`Marker clicked: Property ID ${propertyId}`);

      // Fly to property location
      mapInstance.current.flyTo({
        center: [property.location.longitude, property.location.latitude],
        zoom: 16,
        duration: 1000,
      });

      // Call the parent's onClick handler after a small delay
      setTimeout(() => {
        if (onMarkerClick) {
          console.log(`Triggering onMarkerClick for property ID ${propertyId}`);
          onMarkerClick(propertyId);
        }
      }, 300);
    };

    // Function to toggle property marker visibility
    const togglePropertyVisibility = () => {
      if (showProperties) {
        // Jika sudah aktif, matikan saja
        setShowProperties(false);
      } else {
        // Jika belum aktif, aktifkan dan pastikan layer lainnya mati
        setShowProperties(true);
        // Reset layer lain
        if (onMarkerClick) {
          onMarkerClick(0); // Signal to clear climate layers
        }
      }
    };

    // Update markers only when properties change or showProperties changes
    useEffect(() => {
      if (!mapLoaded || !mapInstance.current) return;

      console.log(
        `Updating markers for ${properties.length} properties, visibility: ${showProperties}`
      );

      const addMarkers = () => {
        if (!mapInstance.current) return;

        // First remove all existing markers
        Object.keys(markersRef.current).forEach((id) => {
          markersRef.current[parseInt(id)].remove();
        });
        markersRef.current = {};

        // Only add markers if they should be visible
        if (showProperties) {
          // Add all markers fresh
          properties.forEach((property) => {
            if (!mapInstance.current) return;

            // Create marker element
            const el = document.createElement("div");
            el.className = "property-marker";
            el.setAttribute("data-property-id", property.id.toString());

            // Get color based on climate risk score
            const getScoreColor = (
              score: number | null | undefined
            ): string => {
              if (score == null) return "#9ca3af"; // gray-500
              if (score >= 85) return "#059669"; // green-600
              if (score >= 75) return "#10b981"; // green-500
              if (score >= 65) return "#eab308"; // yellow-500
              if (score >= 55) return "#f97316"; // orange-500
              return "#dc2626"; // red-600
            };

            // Get climate score from the new property format
            let scoreToUse = property.climate_risk_score;
            if (
              property.climate_scores &&
              property.climate_scores.overall_score
            ) {
              scoreToUse = property.climate_scores.overall_score;
            }

            const colorHex = getScoreColor(scoreToUse);

            el.innerHTML = `
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-white relative" 
                 style="background-color: ${colorHex}; box-shadow: 0 0 10px rgba(0,0,0,0.3);">
              <span class="text-xs font-bold">${scoreToUse || "?"}</span>
              <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 rotate-45 w-3 h-3"
                   style="background-color: ${colorHex}"></div>
            </div>
          `;

            // Add marker to map
            const marker = new maplibregl.Marker({
              element: el,
              anchor: "bottom",
            })
              .setLngLat([
                property.location.longitude,
                property.location.latitude,
              ])
              .addTo(mapInstance.current);

            // Add click handler
            el.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              handleMarkerClick(property.id);
            };

            // Store marker reference
            markersRef.current[property.id] = marker;
          });
        }
      };

      // Check if style is loaded before adding markers
      if (mapInstance.current.isStyleLoaded()) {
        addMarkers();
      } else {
        mapInstance.current.once("style.load", addMarkers);
      }
    }, [properties, mapLoaded, onMarkerClick, showProperties]);

    // Load and manage climate layers
    useEffect(() => {
      if (!mapLoaded || !mapInstance.current) return;

      const map = mapInstance.current;

      // Function to load a climate layer if it doesn't exist yet
      const loadClimateLayer = async (layerType: ClimateLayerType) => {
        if (!layerType || !map) return;

        const layerInfo = layerConfig[layerType];
        const sourceId = `${layerType}-source`;
        const layerId = `${layerType}-layer`;
        const outlineId = `${layerType}-outline`;

        // Skip if source already exists
        if (map.getSource(sourceId)) return;

        try {
          // Fetch GeoJSON data from backend API instead of local file
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
          const response = await fetch(`${API_BASE_URL}/api/data/geojson/${layerType}`);
          
          if (!response.ok) {
            throw new Error(
              `Failed to load ${layerType} data: ${response.statusText}`
            );
          }
          
          // Parse the response JSON
          const responseData = await response.json();
          
          // Extract the GeoJSON data from the response
          const geojsonData = responseData.data;

          // Add source
          map.addSource(sourceId, {
            type: "geojson",
            data: geojsonData,
          });

          // Add fill layer with dynamic colorization based on gridcode
          map.addLayer({
            id: layerId,
            type: "fill",
            source: sourceId,
            layout: { visibility: "none" }, // Hidden by default
            paint: {
              "fill-color": [
                "match",
                ["get", "gridcode"],
                1,
                layerInfo.colors[0],
                2,
                layerInfo.colors[1],
                3,
                layerInfo.colors[2],
                4,
                layerInfo.colors[3],
                5,
                layerInfo.colors[4],
                ...(layerInfo.gridcodeCount > 5
                  ? [
                      6,
                      layerInfo.colors[5],
                      7,
                      layerInfo.colors[6],
                      8,
                      layerInfo.colors[7],
                    ]
                  : []),
                layerInfo.colors[0], // default
              ],
              "fill-opacity": 0.7,
            },
          });

          // Add outline layer
          map.addLayer({
            id: outlineId,
            type: "line",
            source: sourceId,
            layout: { visibility: "none" }, // Hidden by default
            paint: {
              "line-color": "#000",
              "line-width": 0,
              "line-opacity": 0.3,
            },
          });

          console.log(`Loaded ${layerType} layer`);
        } catch (error) {
          console.error(`Error loading ${layerType} layer:`, error);
        }
      };

      // Update layer visibility
      const updateLayerVisibility = () => {
        if (!map) return;

        // Helper function to set layer visibility
        const setLayerVisibility = (
          layerType: ClimateLayerType,
          isVisible: boolean
        ) => {
          const layerId = `${layerType}-layer`;
          const outlineId = `${layerType}-outline`;

          if (map.getLayer(layerId)) {
            map.setLayoutProperty(
              layerId,
              "visibility",
              isVisible ? "visible" : "none"
            );
          }

          if (map.getLayer(outlineId)) {
            map.setLayoutProperty(
              outlineId,
              "visibility",
              isVisible ? "visible" : "none"
            );
          }
        };

        // Hide all layers
        Object.keys(layerConfig).forEach((layerName) => {
          setLayerVisibility(layerName as ClimateLayerType, false);
        });

        // Show active layer if set
        if (activeLayer) {
          setLayerVisibility(activeLayer, true);
        }
      };

      // Load all climate layers then update visibility
      const initializeLayers = async () => {
        // Ensure style is loaded
        if (!map.isStyleLoaded()) {
          await new Promise<void>((resolve) => {
            map.once("style.load", () => resolve());
          });
        }

        // Load all layer data first
        await Promise.all(
          Object.keys(layerConfig).map((layerType) =>
            loadClimateLayer(layerType as ClimateLayerType)
          )
        );

        // Then update visibility based on active layer
        updateLayerVisibility();
      };

      initializeLayers();
    }, [mapLoaded, activeLayer, layerConfig]);

    // Get the legend for the current active layer
    const activeLegend = activeLayer ? layerConfig[activeLayer]?.legend : null;
    const activeLayerName = activeLayer ? layerConfig[activeLayer]?.name : null;

    return (
      <div className="w-full h-full rounded-lg overflow-hidden shadow-lg border border-gray-200">
        <div ref={mapContainer} className="w-full h-full" />

        {/* Layer Controls */}
        <div className="absolute top-4 right-4 bg-white rounded-md shadow-md p-3 z-10 w-60">
          <h3 className="text-sm font-bold mb-2 px-2 text-gray-800">
            Map Layers
          </h3>

          {/* Property Layer Toggle */}
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
              <button
                key={key}
                onClick={() => {
                  if (activeLayer === key) {
                    // Toggle off current active layer
                    onMarkerClick?.(0); // Use 0 as signal to clear layers
                  } else {
                    // Toggle on this layer, matikan showProperties
                    setShowProperties(false); // Matikan layer properti

                    const layerTypeKey = key as ClimateLayerType;
                    if (onMarkerClick) {
                      // We're using handleLayerChange in parent component
                      // and that's connected to the onMarkerClick prop here
                      if (layerTypeKey === "lst")
                        onMarkerClick(1); // Signals LST layer
                      else if (layerTypeKey === "ndvi")
                        onMarkerClick(2); // Signals NDVI layer
                      else if (layerTypeKey === "uhi")
                        onMarkerClick(3); // Signals UHI layer
                      else if (layerTypeKey === "utfvi") onMarkerClick(4); // Signals UTFVI layer
                    }
                  }
                }}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                  activeLayer === key
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <div
                  className={`w-4 h-4 min-w-[16px] min-h-[16px] rounded-full flex-shrink-0 mr-2 ${
                    activeLayer === key ? "bg-white" : "bg-blue-600"
                  }`}
                ></div>
                <span className="truncate text-xs">{layer.name}</span>
              </button>
            ))}

            {activeLayer && (
              <button
                onClick={() => {
                  onMarkerClick?.(0); // Clear climate layers
                  setShowProperties(false); // Juga matikan property locations
                }}
                className="w-full text-center px-3 py-1 mt-2 text-xs text-gray-600 hover:text-gray-800"
              >
                Clear All Layers
              </button>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 px-2">
              Climate data for Bandung area.
            </p>
          </div>
        </div>

        {/* Layer legend */}
        {activeLayer && activeLegend && (
          <div className="absolute bottom-4 right-4 bg-white p-3 rounded-md shadow-md z-10 max-w-xs">
            <h4 className="text-sm font-bold mb-2 text-gray-800">
              {activeLayerName}
            </h4>
            <div className="space-y-1">
              {activeLegend.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-4 h-4 mr-2"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom map styles for property markers */}
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

          .maplibregl-popup {
            z-index: 20;
          }

          .property-marker:hover {
            transform: scale(1.1);
            transition: transform 0.2s ease;
          }
        `}</style>
      </div>
    );
  }
);

// Display name for debugging purposes
MapComponent.displayName = "MapComponent";

export default MapComponent;