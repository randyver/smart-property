"use client";
import { useEffect, useRef, useState, memo, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Property } from "@/types";
import { Layers } from "lucide-react";
import { MapPin, Eye, EyeOff, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import { rt } from "framer-motion/client";

export type ClimateLayerType =
  | "lst"
  | "ndvi"
  | "uhi"
  | "utfvi"
  | "landuse"
  | "ndbi"
  | "jaringan_jalan"
  | "kemiringan_lereng"
  | "rtrw"
  | undefined;

interface MapComponentProps {
  properties?: Property[];
  activeLayer?: ClimateLayerType;
  onMarkerClick?: (propertyId: number) => void;
  center?: [number, number];
  zoom?: number;
  mapRef?: React.MutableRefObject<any>;
}

const FEATURES_PER_PAGE = 1000;
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
    const [pendingLayer, setPendingLayer] =
      useState<ClimateLayerType>(undefined);
    const wasLoadingRef = useRef(false);
    // New state for showing/hiding the layer panel
    const [showLayerPanel, setShowLayerPanel] = useState(true);

    // Track loaded features for each layer
    const loadedFeaturesRef = useRef<{ [key: string]: any[] }>({
      lst: [],
      ndvi: [],
      uhi: [],
      utfvi: [],
      landuse: [],
      ndbi: [],
      jaringan_jalan: [],
      kemiringan_lereng: [],
      rtrw: [],
    });

    // Track pagination state for each layer
    const currentPageRef = useRef<{ [key: string]: number }>({
      lst: 1,
      ndvi: 1,
      uhi: 1,
      utfvi: 1,
      landuse: 1,
      ndbi: 1,
      jaringan_jalan: 1,
      kemiringan_lereng: 1,
      rtrw: 1,
    });

    const totalPagesRef = useRef<{ [key: string]: number }>({
      lst: 1,
      ndvi: 1,
      uhi: 1,
      utfvi: 1,
      landuse: 1,
      ndbi: 1,
      jaringan_jalan: 1,
      kemiringan_lereng: 1,
      rtrw: 1,
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
        colors: ["#F5F500", "#F5CA00", "#FA9600", "#EE5D00", "#C70000"],
        gridcodeCount: 5,
        legendLabels: [
          "Sangat Lemah (<0)",
          "Lemah (0-0.005)",
          "Sedang (0.005-0.01)",
          "Kuat (0.01-0.015)",
          "Sangat Kuat (>0.015)",
        ],
        image: "/peta-uhi.jpg",
      },
      utfvi: {
        name: "Urban Thermal Field Variance Index",
        colors: ["#5C09FC", "#4EC9FD", "#B4FEA3", "#FBD513", "#FE230A"],
        gridcodeCount: 5,
        legendLabels: [
          "Non (<0)",
          "Lemah (0-0.005)",
          "Sedang (0.005-0.01)",
          "Kuat (0.01-0.015)",
          "Sangat Kuat (>0.015)",
        ],
        image: "/peta-utfvi.jpg",
      },
      lst: {
        name: "Land Surface Temperature",
        colors: ["#F5F500", "#F5B800", "#F57A00", "#F53D00", "#F50000"],
        gridcodeCount: 5,
        legendLabels: [
          "Sangat Dingin (<24°C)",
          "Dingin (24-28°C)",
          "Sedang (28-32°C)",
          "Panas (32-36°C)",
          "Sangat Panas (>36°C)",
        ],
        image: "/peta-lst.jpg",
      },
      ndvi: {
        name: "Vegetation Index",
        colors: ["#A50026", "#FF0000", "#FFFF00", "#86CB66", "#4C7300"],
        gridcodeCount: 5,
        legendLabels: [
          "Non-vegetasi (<0.2)",
          "Sangat Jarang (0.2-0.4)",
          "Jarang (0.4-0.6)",
          "Sedang (0.6-0.8)",
          "Lebat (>0.8)",
        ],
        image: "/peta-ndvi.jpg",
      },
      landuse: {
        name: "Penggunaan Lahan",
        colors: [
          "#007206",
          "#FFAA00",
          "#FFFF4C",
          "#FFC9B9",
          "#FC3B09",
          "#B4B4B4",
          "#5C09FC",
        ],
        gridcodeCount: 7,
        legendLabels: [
          "Tutupan Pohon",
          "Semak Belukar",
          "Padang Rumput",
          "Lahan Pertanian",
          "Area Terbangun",
          "Lahan Kosong",
          "Badan Air",
        ],
        image: "/peta-landuse.jpg",
      },
      ndbi: {
        name: "Normalized Difference Built-up Index",
        colors: ["#FFFFE5", "#FEE391", "#FE9929", "#CC4C02", "#662506"],
        gridcodeCount: 5,
        legendLabels: [
          "Vegetasi Sangat Lebat",
          "Vegetasi Lebat",
          "Lahan Terbuka",
          "Permukiman Rendah",
          "Area Terbangun Padat",
        ],
        image: "/peta-ndbi.jpg",
      },
      jaringan_jalan: {
        name: "Jaringan Jalan",
        colors: [
          "#FF0000", // Red for major roads
          "#00FF00", // Green for minor roads
          "#0000FF", // Blue for water bodies
          "#FFFF00", // Yellow for agricultural land
          "#FFA500", // Orange for barren land
        ],
        gridcodeCount: 5,
        legendLabels: [
          "Jalan Utama",
          "Jalan Sekunder",
          "Badan Air",
          "Lahan Pertanian",
          "Tanah Kosong",
        ],
        image: "/peta-jaringan-jalan.jpg",
      },
      kemiringan_lereng: {
        name: "Kemiringan Lereng",
        colors: ["#007206", "#7DB810", "#F2FE1E", "#FFAC12", "#FC3B09"],
        gridcodeCount: 5,
        legendLabels: [
          "Datar (0-8°)",
          "Landai (8-15°)",
          "Agak Curam (15-25°)",
          "Curam (25-45°)",
          "Sangat Curam (>45°)",
        ],
        image: "/peta-kemiringan-lereng.jpg",
      },
      rtrw: {
        name: "Ruang Tata Ruang Wilayah",
        colors: {
          Bandara: "#F4B183", // Orange for Bandara
          "Hutan Lindung": "#007A33", // Dark green for Hutan Lindung
          "Industri dan Pergudangan": "#7F7F7F", // Gray for Industri dan Pergudangan
          Kesehatan: "#FFFFFF", // White for Kesehatan
          Pendidikan: "#000066", // Dark blue for Pendidikan
          Perdagangan: "#FF0000", // Red for Perdagangan
          Perkantoran: "#F4B6E6", // Light pink for Perkantoran
          "Pertahanan dan Keamanan": "#7F5A3D", // Brown for Pertahanan dan Keamanan
          Pertanian: "#A6D785", // Light green for Pertanian
          "Perumahan Kepadatan Rendah": "#FFD1DC", // Pale pink for Perumahan
          "Ruang Terbuka Hijau": "#00FF01", // Bright green for RTH
          "Ruang Terbuka Non Hijau": "#B7E97C", // Light green for RTnH
        },
        legendLabels: [
          "Bandara",
          "Hutan Lindung",
          "Industri dan Pergudangan",
          "Kesehatan",
          "Pendidikan",
          "Perdagangan",
          "Perkantoran",
          "Pertahanan dan Keamanan",
          "Pertanian",
          "Perumahan Kepadatan Rendah",
          "Ruang Terbuka Hijau",
          "Ruang Terbuka Non Hijau",
        ],
        image: "/foto-rtrw.jpg", // You'll need to create this image
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
        console.log("Loading completed, checking if there is a pending layer");
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
    const applyLayer = useCallback(
      (layerType: ClimateLayerType) => {
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
          } else if (layerType === "landuse") {
            onMarkerClick(5);
          } else if (layerType === "ndbi") {
            onMarkerClick(6);
          } else if (layerType === "jaringan_jalan") {
            onMarkerClick(7);
          } else if (layerType === "kemiringan_lereng") {
            onMarkerClick(8);
          } else if (layerType === "rtrw") {
            onMarkerClick(9);
          }
        }
      },
      [onMarkerClick]
    );

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

                // Add fill layer based on layer type
                if (layerType === "rtrw") {
                  // For RTRW layer, use NAMA property
                  map.addLayer({
                    id: layerId,
                    type: "fill",
                    source: sourceId,
                    layout: { visibility: "visible" },
                    paint: {
                      "fill-color": [
                        "match",
                        ["get", "NAMA"],
                        "Bandara",
                        layerConfig.rtrw.colors["Bandara"],
                        "Hutan Lindung",
                        layerConfig.rtrw.colors["Hutan Lindung"],
                        "Industri dan Pergudangan",
                        layerConfig.rtrw.colors["Industri dan Pergudangan"],
                        "Kesehatan",
                        layerConfig.rtrw.colors["Kesehatan"],
                        "Pendidikan",
                        layerConfig.rtrw.colors["Pendidikan"],
                        "Perdagangan",
                        layerConfig.rtrw.colors["Perdagangan"],
                        "Perkantoran",
                        layerConfig.rtrw.colors["Perkantoran"],
                        "Pertahanan dan Keamanan",
                        layerConfig.rtrw.colors["Pertahanan dan Keamanan"],
                        "Pertanian",
                        layerConfig.rtrw.colors["Pertanian"],
                        "Perumahan Kepadatan Rendah",
                        layerConfig.rtrw.colors["Perumahan Kepadatan Rendah"],
                        "Ruang Terbuka Hijau",
                        layerConfig.rtrw.colors["Ruang Terbuka Hijau"],
                        "Ruang Terbuka Non Hijau",
                        layerConfig.rtrw.colors["Ruang Terbuka Non Hijau"],
                        "#CCCCCC", // default color for unknown values
                      ],
                      "fill-opacity": 0.7,
                    },
                  });
                } else if (layerType === "landuse") {
                  // Original code for landuse layer
                  map.addLayer({
                    id: layerId,
                    type: "fill",
                    source: sourceId,
                    layout: { visibility: "visible" },
                    paint: {
                      "fill-color": [
                        "match",
                        ["get", "gridcode"],
                        10,
                        "#007206", // Tutupan Pohon
                        20,
                        "#FFAA00", // Semak Belukar
                        30,
                        "#FFFF4C", // Padang Rumput
                        40,
                        "#FFC9B9", // Lahan Pertanian
                        50,
                        "#FC3B09", // Area Terbangun
                        60,
                        "#B4B4B4", // Lahan Kosong
                        80,
                        "#5C09FC", // Badan Air
                        "#000000", // default color for unknown values
                      ],
                      "fill-opacity": 0.7,
                    },
                  });
                } else {
                  // Original code for other layers
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
                }

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

    // Toggle layer panel visibility
    const toggleLayerPanel = () => {
      setShowLayerPanel((prev) => !prev);
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
        console.log(
          `Loading in progress, setting ${layerType} as pending layer`
        );
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
        <div ref={mapContainer} className="mt-16 w-full h-full" />

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

        {/* Layer panel toggle button - Only show when panel is hidden */}
        {!showLayerPanel && (
          <div className="absolute top-20 right-4 z-20">
            <button
              onClick={toggleLayerPanel}
              className="bg-white p-2 mt-12 rounded-full shadow-md hover:bg-gray-100 transition-colors"
              title="Show layer panel"
            >
              <Layers className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        )}

        {/* Layer panel with integrated close button */}
        {showLayerPanel && (
          <div className="absolute top-32 right-4 bg-white rounded-xl shadow-md z-10 w-80 max-h-[400px] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2 pt-2 px-3 sticky top-0 bg-white">
              <h3 className="text-sm font-bold text-gray-800">Map Layers</h3>
              <button
                onClick={toggleLayerPanel}
                className="text-gray-500 hover:text-gray-700"
                title="Close panel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-3 px-2 py-2 bg-yellow-50 text-amber-700 text-xs rounded border border-amber-200 mx-3 mt-2">
              <p>
                Untuk mengganti lapisan iklim, klik ikon tempat sampah untuk
                menghapus lapisan saat ini terlebih dahulu, kemudian pilih yang
                baru.
              </p>
            </div>

            {/* Property location layer - always enabled */}
            <div className="mb-3 border-b pb-2 px-2">
              <div className="flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors hover:bg-gray-50">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-600" />
                  <span className="truncate text-xs">Lokasi Properti</span>
                </div>
                <button
                  onClick={togglePropertyVisibility}
                  className="p-1 text-gray-600 hover:text-blue-600"
                  title={showProperties ? "Hide properties" : "Show properties"}
                >
                  {showProperties ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Climate (Iklim) Layers */}
            <h4 className="text-xs font-medium text-gray-600 mb-1 px-2 top-[68px] bg-white pt-2">
              Layer Iklim
            </h4>
            <div className="space-y-1 px-2 pb-4">
              {Object.entries(layerConfig)
                .filter(([key]) =>
                  ["lst", "ndvi", "utfvi", "uhi", "ndbi"].includes(key)
                )
                .map(([key, layer]) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                      activeLayer === key ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <Image
                        width={60}
                        height={60}
                        src={layer.image}
                        alt={layer.name}
                        className="mr-2 rounded-md object-cover"
                      />
                      <span className="truncate text-xs">{layer.name}</span>
                    </div>

                    <div className="flex space-x-1">
                      {/* Delete button - only shown for active layer */}
                      {activeLayer === key && (
                        <button
                          onClick={clearLayer}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Remove layer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}

                      {/* Add button - only shown when no layer is active */}
                      {!activeLayer && (
                        <button
                          onClick={() =>
                            handleLayerSelect(key as ClimateLayerType)
                          }
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title={`Add ${layer.name} layer`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )}

                      {/* Disabled buttons when another layer is active */}
                      {activeLayer && activeLayer !== key && (
                        <div className="flex space-x-1">
                          <button
                            className="p-1 text-gray-400 cursor-not-allowed"
                            disabled
                            title="Clear active layer first"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 text-gray-400 cursor-not-allowed"
                            disabled
                            title="Clear active layer first"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* Tata Kota Layers */}
            <h4 className="text-xs font-medium text-gray-600 mb-1 px-2 bg-white pt-2">
              Layer Tata Kota
            </h4>
            <div className="space-y-1 px-2 pb-4">
              {Object.entries(layerConfig)
                .filter(([key]) =>
                  [
                    "jaringan_jalan",
                    "landuse",
                    "kemiringan_lereng",
                    "rtrw",
                  ].includes(key)
                )
                .map(([key, layer]) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                      activeLayer === key ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <Image
                        width={60}
                        height={60}
                        src={layer.image}
                        alt={layer.name}
                        className="mr-2 rounded-md object-cover"
                      />
                      <span className="truncate text-xs">{layer.name}</span>
                    </div>

                    <div className="flex space-x-1">
                      {/* Delete button - only shown for active layer */}
                      {activeLayer === key && (
                        <button
                          onClick={clearLayer}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Remove layer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}

                      {/* Add button - only shown when no layer is active */}
                      {!activeLayer && (
                        <button
                          onClick={() =>
                            handleLayerSelect(key as ClimateLayerType)
                          }
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title={`Add ${layer.name} layer`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )}

                      {/* Disabled buttons when another layer is active */}
                      {activeLayer && activeLayer !== key && (
                        <div className="flex space-x-1">
                          <button
                            className="p-1 text-gray-400 cursor-not-allowed"
                            disabled
                            title="Clear active layer first"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 text-gray-400 cursor-not-allowed"
                            disabled
                            title="Clear active layer first"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
        {/* Legend - Updated with accurate classification labels */}
        {/* jika layer nya jaringan jalan ga perlu tampilin legenda */}
        {activeLayer && (
          <div className="absolute bottom-20 left-4 bg-white p-3 rounded-md shadow-md z-10 max-w-xs">
            <h4 className="text-sm font-bold mb-2 text-gray-800">
              Legenda {layerConfig[activeLayer].name}
            </h4>
            <div className="space-y-1">
              {activeLayer === "rtrw"
                ? // Special handling for RTRW layer which uses NAMA
                  layerConfig[activeLayer].legendLabels.map((label, i) => {
                    const color =
                      layerConfig[activeLayer].colors[
                        label as keyof typeof layerConfig.rtrw.colors
                      ] || "#CCCCCC";
                    return (
                      <div key={i} className="flex items-center">
                        <div
                          className="w-4 h-4 mr-2"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="text-xs text-gray-700">{label}</span>
                      </div>
                    );
                  })
                : activeLayer !== "jaringan_jalan"
                ? // Original handler for gridcode-based layers
                  layerConfig[activeLayer].colors
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
                    ))
                : null}
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
