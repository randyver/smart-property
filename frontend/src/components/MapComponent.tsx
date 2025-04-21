'use client';

import { useEffect, useRef, useState, memo } from 'react';
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
  bedrooms: number;
  bathrooms: number;
  land_area: number;
  building_area: number;
  climate_risk_score: number;
  risks: {
    flood: string;
    temperature: string;
    air_quality: string;
    landslide: string;
  };
  address: string;
  district: string;
  city: string;
}


interface MapComponentProps {
  properties?: Property[];
  activeLayer?: string;
  onMarkerClick?: (propertyId: number) => void;
  center?: [number, number];
  zoom?: number;
  mapRef?: React.MutableRefObject<any>;
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

// The component is wrapped with React.memo to prevent unnecessary re-renders
const MapComponent = memo(({
  properties = [],
  activeLayer,
  onMarkerClick,
  center = [107.6096, -6.9147], // Default to Bandung
  zoom = 12,
  mapRef
}: MapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<{ [key: number]: maplibregl.Marker }>({});
  const propertiesRef = useRef(properties);
  
  const mapidApiKey = process.env.NEXT_PUBLIC_MAPID_API_KEY || 'your_mapid_api_key';

  // Initialize map only once
  useEffect(() => {
    if (mapInstance.current) return; // Map already initialized
    
    if (mapContainer.current) {
      mapInstance.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://basemap.mapid.io/styles/basic/style.json?key=${mapidApiKey}`,
        center: center,
        zoom: zoom
      });
      
      mapInstance.current.on('load', () => {
        setMapLoaded(true);
      });
      
      // Expose map to parent through ref
      if (mapRef) {
        mapRef.current = mapInstance.current;
      }
      
      // Add navigation controls
      mapInstance.current.addControl(new maplibregl.NavigationControl(), 'top-right');
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

  // Update markers only when properties change (by reference)
  useEffect(() => {
    // Update the ref to latest properties
    propertiesRef.current = properties;
    
    if (!mapLoaded || !mapInstance.current) return;
    
    const addMarkers = () => {
      if (!mapInstance.current) return;
      
      // We'll store a set of property IDs to track removed properties
      const currentPropertyIds = new Set(properties.map(p => p.id));
      
      // First pass: Update existing markers or add new ones
      properties.forEach(property => {
        if (!mapInstance.current) return;
        
        const existingMarker = markersRef.current[property.id];
        
        // If marker already exists, just update its position
        if (existingMarker) {
          existingMarker.setLngLat([property.location.longitude, property.location.latitude]);
          return;
        }
        
        // Create marker element for new property
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
          .addTo(mapInstance.current);
        
        // Add click handler
        el.addEventListener('click', () => {
          if (onMarkerClick) onMarkerClick(property.id);
        });
        
        // Store marker reference
        markersRef.current[property.id] = marker;
      });
      
      // Second pass: Remove markers for properties that no longer exist
      Object.keys(markersRef.current).forEach(id => {
        const numId = parseInt(id);
        if (!currentPropertyIds.has(numId)) {
          markersRef.current[numId].remove();
          delete markersRef.current[numId];
        }
      });
    };
    
    // Check if style is loaded before adding markers
    if (mapInstance.current.isStyleLoaded()) {
      addMarkers();
    } else {
      mapInstance.current.once('style.load', addMarkers);
    }
  }, [properties, mapLoaded, onMarkerClick]);
  
  // Handle active layer changes separately
  useEffect(() => {
    if (!mapLoaded || !mapInstance.current || !activeLayer) return;
    
    // Function to ensure the style is loaded before adding layers
    const initializeLayers = async () => {
      if (!mapInstance.current) return;
      
      // Make sure style is loaded
      if (!mapInstance.current.isStyleLoaded()) {
        await new Promise<void>((resolve) => {
          mapInstance.current?.once('style.load', () => resolve());
        });
      }
      
      // Now it's safe to add layers
      addAllLayers();
    };
    
    // Add all map layers
    const addAllLayers = async () => {
      if (!mapInstance.current) return;
      
      // Add layers if they don't exist yet
      if (!mapInstance.current.getSource('flood-risk-source')) {
        addFloodRiskLayer();
      }
      
      // Update visibility of layers
      updateLayerVisibility();
    };
    
    // Mock GIS layers implementation
    const addFloodRiskLayer = () => {
      if (!mapInstance.current || mapInstance.current.getSource('flood-risk-source')) return;
      
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
        mapInstance.current.addSource('flood-risk-source', {
          type: 'geojson',
          data: mockGeoJson
        });
        
        mapInstance.current.addLayer({
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
        mapInstance.current.addLayer({
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
    
    // Update layer visibility based on activeLayer
    const updateLayerVisibility = () => {
      if (!mapInstance.current) return;
      
      // Helper function to toggle layer visibility
      const toggleLayerVisibility = (layerId: string, outlineId: string, isVisible: boolean) => {
        if (!mapInstance.current) return;
        
        if (mapInstance.current.getLayer(layerId)) {
          mapInstance.current.setLayoutProperty(layerId, 'visibility', isVisible ? 'visible' : 'none');
        }
        if (mapInstance.current.getLayer(outlineId)) {
          mapInstance.current.setLayoutProperty(outlineId, 'visibility', isVisible ? 'visible' : 'none');
        }
      };
      
      // Hide all layers first
      toggleLayerVisibility('flood-risk-layer', 'flood-risk-outline', false);
      
      // Show only the active layer
      if (activeLayer === 'flood_risk') {
        toggleLayerVisibility('flood-risk-layer', 'flood-risk-outline', true);
      }
    };
    
    // Initialize all layers
    initializeLayers();
    
  }, [activeLayer, mapLoaded]);

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
});

// Display name for debugging purposes
MapComponent.displayName = 'MapComponent';

export default MapComponent;