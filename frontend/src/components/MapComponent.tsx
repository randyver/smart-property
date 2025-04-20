'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

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

// Helper function to load GeoJSON data
const loadGeoJSON = async (url: string) => {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Error loading GeoJSON:', error);
    return null;
  }
};

export default function MapComponent({
  properties = [],
  activeLayer,
  onMarkerClick,
  center = [107.6096, -6.9147], // Default to Bandung
  zoom = 12,
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<{ [key: number]: maplibregl.Marker }>({});
  
  const mapidApiKey = process.env.NEXT_PUBLIC_MAPID_API_KEY || 'your_mapid_api_key';

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Map already initialized
    
    if (mapContainer.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://basemap.mapid.io/styles/basic/style.json?key=${mapidApiKey}`,
        center: center,
        zoom: zoom
      });
      
      map.current.on('load', () => {
        setMapLoaded(true);
      });
      
      // Add navigation controls
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    }
    
    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapidApiKey, center, zoom]);

  // Add property markers to map
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    
    // Ensure style is fully loaded before adding markers
    const addMarkers = () => {
      if (!map.current) return;
      
      // Remove existing markers
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
      
      // Add markers for each property
      properties.forEach(property => {
        if (!map.current) return;
        
        // Create marker element
        const el = document.createElement('div');
        el.className = 'property-marker';
        
        // Get color based on climate risk score
        const getScoreColor = (score: number): string => {
          if (score >= 80) return '#10b981'; // green-500
          if (score >= 60) return '#f59e0b'; // yellow-500
          return '#ef4444'; // red-500
        };
        
        el.innerHTML = `
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-white relative" 
               style="background-color: ${getScoreColor(property.climate_risk_score)}; box-shadow: 0 0 10px rgba(0,0,0,0.3);">
            <span class="text-xs font-bold">${property.climate_risk_score}</span>
            <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 rotate-45 w-3 h-3"
                 style="background-color: ${getScoreColor(property.climate_risk_score)}"></div>
          </div>
        `;
        
        // Add marker to map
        const marker = new maplibregl.Marker(el)
          .setLngLat([property.location.longitude, property.location.latitude])
          .addTo(map.current);
        
        // Add click handler
        el.addEventListener('click', () => {
          if (onMarkerClick) onMarkerClick(property.id);
        });
        
        // Store marker reference
        markersRef.current[property.id] = marker;
      });
    };
    
    // Check if style is loaded before adding markers
    if (map.current.isStyleLoaded()) {
      addMarkers();
    } else {
      map.current.once('style.load', addMarkers);
    }
  }, [properties, mapLoaded, onMarkerClick]);
  
  // Handle active layer changes
  useEffect(() => {
    if (!mapLoaded || !map.current || !activeLayer) return;
    
    // Function to ensure the style is loaded before adding layers
    const initializeLayers = async () => {
      if (!map.current) return;
      
      // Make sure style is loaded
      if (!map.current.isStyleLoaded()) {
        await new Promise<void>((resolve) => {
          map.current?.once('style.load', () => resolve());
        });
      }
      
      // Now it's safe to add layers
      addAllLayers();
    };
    
    // Add all map layers
    const addAllLayers = async () => {
      if (!map.current) return;
      
      // Add layers if they don't exist yet
      if (!map.current.getSource('flood-risk-source')) {
        addFloodRiskLayer();
      }
      
      if (!map.current.getSource('temperature-source')) {
        await addTemperatureLayer();
      }
      
      if (!map.current.getSource('air-quality-source')) {
        addAirQualityLayer();
      }
      
      if (!map.current.getSource('green-space-source')) {
        addGreenSpaceLayer();
      }
      
      // Update visibility of layers
      updateLayerVisibility();
    };
    
    // Mock GIS layers implementation
    const addFloodRiskLayer = () => {
      if (!map.current || map.current.getSource('flood-risk-source')) return;
      
      // This would be replaced with actual GeoJSON data in a real implementation
      const mockGeoJson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { risk_level: 4 },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [107.59, -6.90],
                [107.60, -6.90],
                [107.60, -6.91],
                [107.59, -6.91],
                [107.59, -6.90]
              ]]
            }
          },
          {
            type: 'Feature',
            properties: { risk_level: 2 },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [107.60, -6.91],
                [107.62, -6.91],
                [107.62, -6.93],
                [107.60, -6.93],
                [107.60, -6.91]
              ]]
            }
          },
          {
            type: 'Feature',
            properties: { risk_level: 3 },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [107.62, -6.93],
                [107.64, -6.93],
                [107.64, -6.95],
                [107.62, -6.95],
                [107.62, -6.93]
              ]]
            }
          }
        ]
      };
      
      try {
        // Add source and layer
        map.current.addSource('flood-risk-source', {
          type: 'geojson',
          data: mockGeoJson
        });
        
        map.current.addLayer({
          id: 'flood-risk-layer',
          type: 'fill',
          source: 'flood-risk-source',
          layout: { visibility: 'visible' },
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'risk_level'],
              0, '#a6cee3',
              1, '#1f78b4',
              2, '#b2df8a',
              3, '#33a02c',
              4, '#fb9a99'
            ],
            'fill-opacity': 0.7
          }
        });
        
        // Add outline
        map.current.addLayer({
          id: 'flood-risk-outline',
          type: 'line',
          source: 'flood-risk-source',
          layout: { visibility: 'visible' },
          paint: {
            'line-color': '#000',
            'line-width': 1
          }
        });
      } catch (error) {
        console.error('Error adding flood risk layer:', error);
      }
    };
    
    const addTemperatureLayer = async () => {
      if (!map.current) return;
      if (map.current.getSource('temperature-source')) {
        // If source exists, just toggle visibility
        return;
      }
      
      try {
        // For demonstration, using mock data similar to Bandung area
        const mockLstData = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { temp_class: 1 },
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [107.58, -6.89],
                  [107.63, -6.89],
                  [107.63, -6.94],
                  [107.58, -6.94],
                  [107.58, -6.89]
                ]]
              }
            },
            {
              type: 'Feature',
              properties: { temp_class: 3 },
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [107.63, -6.89],
                  [107.68, -6.89],
                  [107.68, -6.94],
                  [107.63, -6.94],
                  [107.63, -6.89]
                ]]
              }
            },
            {
              type: 'Feature',
              properties: { temp_class: 5 },
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [107.63, -6.94],
                  [107.68, -6.94],
                  [107.68, -6.98],
                  [107.63, -6.98],
                  [107.63, -6.94]
                ]]
              }
            }
          ]
        };
        
        // Try to load actual GeoJSON if available, otherwise use mock data
        let lstData;
        try {
          lstData = await loadGeoJSON('/data/bdg_lst.geojson');
          if (!lstData) lstData = mockLstData;
        } catch (error) {
          console.warn('Using mock temperature data:', error);
          lstData = mockLstData;
        }
        
        if (!map.current) return;
        
        // Add source
        map.current.addSource('temperature-source', {
          type: 'geojson',
          data: lstData
        });
        
        // Add fill layer
        map.current.addLayer({
          id: 'temperature-layer',
          type: 'fill',
          source: 'temperature-source',
          layout: { visibility: 'none' },
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'temp_class'], // or 'mean' depending on your GeoJSON structure
              1, '#313695', // Below Average
              2, '#4575b4', // Slightly Below Average
              3, '#74add1', // Average
              4, '#abd9e9', // Slightly Above Average
              5, '#e0f3f8', // Above Average
              6, '#ffffbf', // Moderate High
              7, '#fee090', // High
              8, '#fdae61', // Very High
              9, '#f46d43', // Extremely High
              10, '#d73027'  // Dangerously High
            ],
            'fill-opacity': 0.7
          }
        });
        
        // Add outline
        map.current.addLayer({
          id: 'temperature-outline',
          type: 'line',
          source: 'temperature-source',
          layout: { visibility: 'none' },
          paint: {
            'line-color': '#000',
            'line-width': 1
          }
        });
      } catch (error) {
        console.error('Error adding temperature layer:', error);
      }
    };
    
    const addAirQualityLayer = () => {
      if (!map.current || map.current.getSource('air-quality-source')) return;
      
      // This would be replaced with actual GeoJSON data
      const mockGeoJson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { quality_level: 1 },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [107.58, -6.89],
                [107.64, -6.89],
                [107.64, -6.95],
                [107.58, -6.95],
                [107.58, -6.89]
              ]]
            }
          },
          {
            type: 'Feature',
            properties: { quality_level: 3 },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [107.64, -6.89],
                [107.69, -6.89],
                [107.69, -6.95],
                [107.64, -6.95],
                [107.64, -6.89]
              ]]
            }
          },
          {
            type: 'Feature',
            properties: { quality_level: 5 },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [107.61, -6.95],
                [107.67, -6.95],
                [107.67, -6.99],
                [107.61, -6.99],
                [107.61, -6.95]
              ]]
            }
          }
        ]
      };
      
      try {
        // Add source and layer
        map.current.addSource('air-quality-source', {
          type: 'geojson',
          data: mockGeoJson
        });
        
        map.current.addLayer({
          id: 'air-quality-layer',
          type: 'fill',
          source: 'air-quality-source',
          layout: { visibility: 'none' },
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'quality_level'],
              0, '#cc0033',
              1, '#ff9933',
              2, '#ffde33',
              3, '#99cc33',
              4, '#00ccbc',
              5, '#66ffff'
            ],
            'fill-opacity': 0.7
          }
        });
        
        // Add outline
        map.current.addLayer({
          id: 'air-quality-outline',
          type: 'line',
          source: 'air-quality-source',
          layout: { visibility: 'none' },
          paint: {
            'line-color': '#000',
            'line-width': 1
          }
        });
      } catch (error) {
        console.error('Error adding air quality layer:', error);
      }
    };
    
    const addGreenSpaceLayer = () => {
      if (!map.current || map.current.getSource('green-space-source')) return;
      
      // This would be replaced with actual GeoJSON data
      const mockGeoJson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { vegetation_level: 0 },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [107.58, -6.89],
                [107.63, -6.89],
                [107.63, -6.93],
                [107.58, -6.93],
                [107.58, -6.89]
              ]]
            }
          },
          {
            type: 'Feature',
            properties: { vegetation_level: 3 },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [107.63, -6.89],
                [107.67, -6.89],
                [107.67, -6.93],
                [107.63, -6.93],
                [107.63, -6.89]
              ]]
            }
          },
          {
            type: 'Feature',
            properties: { vegetation_level: 5 },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [107.63, -6.93],
                [107.67, -6.93],
                [107.67, -6.97],
                [107.63, -6.97],
                [107.63, -6.93]
              ]]
            }
          }
        ]
      };
      
      try {
        // Add source and layer
        map.current.addSource('green-space-source', {
          type: 'geojson',
          data: mockGeoJson
        });
        
        map.current.addLayer({
          id: 'green-space-layer',
          type: 'fill',
          source: 'green-space-source',
          layout: { visibility: 'none' },
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'vegetation_level'],
              0, '#f7f7f7',
              1, '#e6f5d0',
              2, '#b8e186',
              3, '#7fbc41',
              4, '#4d9221',
              5, '#276419'
            ],
            'fill-opacity': 0.7
          }
        });
        
        // Add outline
        map.current.addLayer({
          id: 'green-space-outline',
          type: 'line',
          source: 'green-space-source',
          layout: { visibility: 'none' },
          paint: {
            'line-color': '#000',
            'line-width': 1
          }
        });
      } catch (error) {
        console.error('Error adding green space layer:', error);
      }
    };
    
    // Update layer visibility based on activeLayer
    const updateLayerVisibility = () => {
      if (!map.current) return;
      
      // Helper function to toggle layer visibility
      const toggleLayerVisibility = (layerId: string, outlineId: string, isVisible: boolean) => {
        if (!map.current) return;
        
        if (map.current.getLayer(layerId)) {
          map.current.setLayoutProperty(layerId, 'visibility', isVisible ? 'visible' : 'none');
        }
        if (map.current.getLayer(outlineId)) {
          map.current.setLayoutProperty(outlineId, 'visibility', isVisible ? 'visible' : 'none');
        }
      };
      
      // Hide all layers first
      toggleLayerVisibility('flood-risk-layer', 'flood-risk-outline', false);
      toggleLayerVisibility('temperature-layer', 'temperature-outline', false);
      toggleLayerVisibility('air-quality-layer', 'air-quality-outline', false);
      toggleLayerVisibility('green-space-layer', 'green-space-outline', false);
      
      // Show only the active layer
      switch (activeLayer) {
        case 'flood_risk':
          toggleLayerVisibility('flood-risk-layer', 'flood-risk-outline', true);
          break;
        case 'temperature':
          toggleLayerVisibility('temperature-layer', 'temperature-outline', true);
          break;
        case 'air_quality':
          toggleLayerVisibility('air-quality-layer', 'air-quality-outline', true);
          break;
        case 'green_space':
          toggleLayerVisibility('green-space-layer', 'green-space-outline', true);
          break;
      }
    };
    
    // Initialize all layers
    initializeLayers();
    
  }, [activeLayer, mapLoaded]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg border border-gray-200">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Temperature Legend */}
      {activeLayer === 'temperature' && (
        <div className="absolute bottom-4 right-4 bg-white p-3 rounded-md shadow-md z-10 max-h-60 overflow-y-auto">
          <h4 className="text-sm font-bold mb-2">Land Surface Temperature</h4>
          <div className="flex items-center mb-1">
            <div className="w-4 h-4 bg-[#313695] mr-2"></div>
            <span className="text-xs">Below Average</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-4 h-4 bg-[#4575b4] mr-2"></div>
            <span className="text-xs">Slightly Below Average</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-4 h-4 bg-[#74add1] mr-2"></div>
            <span className="text-xs">Average</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-4 h-4 bg-[#abd9e9] mr-2"></div>
            <span className="text-xs">Slightly Above Average</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-4 h-4 bg-[#e0f3f8] mr-2"></div>
            <span className="text-xs">Above Average</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-4 h-4 bg-[#ffffbf] mr-2"></div>
            <span className="text-xs">Moderate High</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-4 h-4 bg-[#fee090] mr-2"></div>
            <span className="text-xs">High</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-4 h-4 bg-[#fdae61] mr-2"></div>
            <span className="text-xs">Very High</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-4 h-4 bg-[#f46d43] mr-2"></div>
            <span className="text-xs">Extremely High</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#d73027] mr-2"></div>
            <span className="text-xs">Dangerously High</span>
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
        }
        
        .maplibregl-popup {
          z-index: 1;
        }
      `}</style>
    </div>
  );
}