"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface Property {
  id: number;
  title: string;
  location: {
    latitude: number;
    longitude: number;
  };
  price: number;
  climate_risk_score: number;
  // Other property fields...
}

interface MapComponentProps {
  properties?: Property[];
  activeLayer?: string;
  onMarkerClick?: (propertyId: number) => void;
  center?: [number, number];
  zoom?: number;
}

export default function MapComponent({
  properties = [],
  activeLayer,
  onMarkerClick,
  center = [106.82, -6.21], // Default to Jakarta
  zoom = 12,
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<{ [key: number]: maplibregl.Marker }>({});

  const mapidApiKey =
    process.env.NEXT_PUBLIC_MAPID_API_KEY || "your_mapid_api_key";

  // Initialize map
  // frontend/src/components/MapComponent.tsx

  // In your initialization useEffect
  useEffect(() => {
    if (map.current) return; // Map already initialized

    if (mapContainer.current) {
      // Use the appropriate MAPID style URL format
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        // Use one of the styles shown in the example - GL Style is the most common
        style: `https://basemap.mapid.io/styles/basic/style.json?key=${mapidApiKey}`,
        center: center,
        zoom: zoom,
      });

      map.current.on("load", () => {
        setMapLoaded(true);
      });

      // Add navigation controls
      map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    }

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add property markers to map
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Add markers for each property
    properties.forEach((property) => {
      if (!map.current) return; // Safety check for TypeScript

      // Create marker element
      const el = document.createElement("div");
      el.className = "property-marker";

      // Get color based on climate risk score
      const getScoreColor = (score: number): string => {
        if (score >= 80) return "#10b981"; // green-500
        if (score >= 60) return "#f59e0b"; // yellow-500
        return "#ef4444"; // red-500
      };

      el.innerHTML = `
        <div class="w-10 h-10 rounded-full flex items-center justify-center text-white relative" 
             style="background-color: ${getScoreColor(
               property.climate_risk_score
             )}; box-shadow: 0 0 10px rgba(0,0,0,0.3);">
          <span class="text-xs font-bold">${property.climate_risk_score}</span>
          <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 rotate-45 w-3 h-3"
               style="background-color: ${getScoreColor(
                 property.climate_risk_score
               )}"></div>
        </div>
      `;

      // Add marker to map
      const marker = new maplibregl.Marker(el)
        .setLngLat([property.location.longitude, property.location.latitude])
        .addTo(map.current);

      // Add click handler
      el.addEventListener("click", () => {
        if (onMarkerClick) onMarkerClick(property.id);
      });

      // Store marker reference
      markersRef.current[property.id] = marker;
    });
  }, [properties, mapLoaded, onMarkerClick]);

  // Handle active layer changes
  useEffect(() => {
    if (!mapLoaded || !map.current || !activeLayer) return;

    // Mock GIS layers implementation
    const addFloodRiskLayer = () => {
      if (!map.current || map.current.getSource("flood-risk-source")) return;

      // This would be replaced with actual GeoJSON data in a real implementation
      const mockGeoJson = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { risk_level: 4 },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [106.8, -6.19],
                  [106.81, -6.19],
                  [106.81, -6.2],
                  [106.8, -6.2],
                  [106.8, -6.19],
                ],
              ],
            },
          },
          {
            type: "Feature",
            properties: { risk_level: 2 },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [106.81, -6.2],
                  [106.83, -6.2],
                  [106.83, -6.22],
                  [106.81, -6.22],
                  [106.81, -6.2],
                ],
              ],
            },
          },
          {
            type: "Feature",
            properties: { risk_level: 3 },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [106.83, -6.22],
                  [106.85, -6.22],
                  [106.85, -6.24],
                  [106.83, -6.24],
                  [106.83, -6.22],
                ],
              ],
            },
          },
        ],
      };

      // Add source and layer
      map.current.addSource("flood-risk-source", {
        type: "geojson",
        data: mockGeoJson,
      });

      map.current.addLayer({
        id: "flood-risk-layer",
        type: "fill",
        source: "flood-risk-source",
        layout: { visibility: "visible" },
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "risk_level"],
            0,
            "#a6cee3",
            1,
            "#1f78b4",
            2,
            "#b2df8a",
            3,
            "#33a02c",
            4,
            "#fb9a99",
          ],
          "fill-opacity": 0.7,
        },
      });

      // Add outline
      map.current.addLayer({
        id: "flood-risk-outline",
        type: "line",
        source: "flood-risk-source",
        layout: { visibility: "visible" },
        paint: {
          "line-color": "#000",
          "line-width": 1,
        },
      });
    };

    const addTemperatureLayer = () => {
      if (!map.current || map.current.getSource("temperature-source")) return;

      // This would be replaced with actual GeoJSON data
      const mockGeoJson = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { temp_level: 8 },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [106.79, -6.18],
                  [106.84, -6.18],
                  [106.84, -6.23],
                  [106.79, -6.23],
                  [106.79, -6.18],
                ],
              ],
            },
          },
          {
            type: "Feature",
            properties: { temp_level: 5 },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [106.84, -6.18],
                  [106.89, -6.18],
                  [106.89, -6.23],
                  [106.84, -6.23],
                  [106.84, -6.18],
                ],
              ],
            },
          },
          {
            type: "Feature",
            properties: { temp_level: 3 },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [106.84, -6.23],
                  [106.89, -6.23],
                  [106.89, -6.26],
                  [106.84, -6.26],
                  [106.84, -6.23],
                ],
              ],
            },
          },
        ],
      };

      // Add source and layer
      map.current.addSource("temperature-source", {
        type: "geojson",
        data: mockGeoJson,
      });

      map.current.addLayer({
        id: "temperature-layer",
        type: "fill",
        source: "temperature-source",
        layout: { visibility: "none" },
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "temp_level"],
            0,
            "#313695",
            2,
            "#4575b4",
            4,
            "#74add1",
            6,
            "#abd9e9",
            8,
            "#e0f3f8",
            10,
            "#ffffbf",
          ],
          "fill-opacity": 0.7,
        },
      });

      // Add outline
      map.current.addLayer({
        id: "temperature-outline",
        type: "line",
        source: "temperature-source",
        layout: { visibility: "none" },
        paint: {
          "line-color": "#000",
          "line-width": 1,
        },
      });
    };

    const addAirQualityLayer = () => {
      if (!map.current || map.current.getSource("air-quality-source")) return;

      // This would be replaced with actual GeoJSON data
      const mockGeoJson = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { quality_level: 1 },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [106.79, -6.18],
                  [106.85, -6.18],
                  [106.85, -6.24],
                  [106.79, -6.24],
                  [106.79, -6.18],
                ],
              ],
            },
          },
          {
            type: "Feature",
            properties: { quality_level: 3 },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [106.85, -6.18],
                  [106.9, -6.18],
                  [106.9, -6.24],
                  [106.85, -6.24],
                  [106.85, -6.18],
                ],
              ],
            },
          },
          {
            type: "Feature",
            properties: { quality_level: 5 },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [106.82, -6.24],
                  [106.88, -6.24],
                  [106.88, -6.28],
                  [106.82, -6.28],
                  [106.82, -6.24],
                ],
              ],
            },
          },
        ],
      };

      // Add source and layer
      map.current.addSource("air-quality-source", {
        type: "geojson",
        data: mockGeoJson,
      });

      map.current.addLayer({
        id: "air-quality-layer",
        type: "fill",
        source: "air-quality-source",
        layout: { visibility: "none" },
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "quality_level"],
            0,
            "#cc0033",
            1,
            "#ff9933",
            2,
            "#ffde33",
            3,
            "#99cc33",
            4,
            "#00ccbc",
            5,
            "#66ffff",
          ],
          "fill-opacity": 0.7,
        },
      });

      // Add outline
      map.current.addLayer({
        id: "air-quality-outline",
        type: "line",
        source: "air-quality-source",
        layout: { visibility: "none" },
        paint: {
          "line-color": "#000",
          "line-width": 1,
        },
      });
    };

    const addGreenSpaceLayer = () => {
      if (!map.current || map.current.getSource("green-space-source")) return;

      // This would be replaced with actual GeoJSON data
      const mockGeoJson = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { vegetation_level: 0 },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [106.79, -6.18],
                  [106.84, -6.18],
                  [106.84, -6.22],
                  [106.79, -6.22],
                  [106.79, -6.18],
                ],
              ],
            },
          },
          {
            type: "Feature",
            properties: { vegetation_level: 3 },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [106.84, -6.18],
                  [106.88, -6.18],
                  [106.88, -6.22],
                  [106.84, -6.22],
                  [106.84, -6.18],
                ],
              ],
            },
          },
          {
            type: "Feature",
            properties: { vegetation_level: 5 },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [106.84, -6.22],
                  [106.88, -6.22],
                  [106.88, -6.26],
                  [106.84, -6.26],
                  [106.84, -6.22],
                ],
              ],
            },
          },
        ],
      };

      // Add source and layer
      map.current.addSource("green-space-source", {
        type: "geojson",
        data: mockGeoJson,
      });

      map.current.addLayer({
        id: "green-space-layer",
        type: "fill",
        source: "green-space-source",
        layout: { visibility: "none" },
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "vegetation_level"],
            0,
            "#f7f7f7",
            1,
            "#e6f5d0",
            2,
            "#b8e186",
            3,
            "#7fbc41",
            4,
            "#4d9221",
            5,
            "#276419",
          ],
          "fill-opacity": 0.7,
        },
      });

      // Add outline
      map.current.addLayer({
        id: "green-space-outline",
        type: "line",
        source: "green-space-source",
        layout: { visibility: "none" },
        paint: {
          "line-color": "#000",
          "line-width": 1,
        },
      });
    };

    // Add all layers if they don't exist
    addFloodRiskLayer();
    addTemperatureLayer();
    addAirQualityLayer();
    addGreenSpaceLayer();

    // Toggle layer visibility based on activeLayer
    const showLayer = (
      layerId: string,
      outlineId: string,
      visibility: boolean
    ) => {
      if (!map.current) return;

      if (map.current.getLayer(layerId)) {
        map.current.setLayoutProperty(
          layerId,
          "visibility",
          visibility ? "visible" : "none"
        );
      }
      if (map.current.getLayer(outlineId)) {
        map.current.setLayoutProperty(
          outlineId,
          "visibility",
          visibility ? "visible" : "none"
        );
      }
    };

    // Hide all layers first
    showLayer("flood-risk-layer", "flood-risk-outline", false);
    showLayer("temperature-layer", "temperature-outline", false);
    showLayer("air-quality-layer", "air-quality-outline", false);
    showLayer("green-space-layer", "green-space-outline", false);

    // Show the active layer
    switch (activeLayer) {
      case "flood_risk":
        showLayer("flood-risk-layer", "flood-risk-outline", true);
        break;
      case "temperature":
        showLayer("temperature-layer", "temperature-outline", true);
        break;
      case "air_quality":
        showLayer("air-quality-layer", "air-quality-outline", true);
        break;
      case "green_space":
        showLayer("green-space-layer", "green-space-outline", true);
        break;
    }
  }, [activeLayer, mapLoaded, center, zoom]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg border border-gray-200">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Custom map styles for property markers */}
      <style jsx global>{`
        .property-marker {
          cursor: pointer;
          width: 40px;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .maplibregl-popup {
          z-index: 1;
        }
      `}</style>
    </div>
  );
}
