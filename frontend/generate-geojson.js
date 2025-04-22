// generate-geojson.js
// Run with: node generate-geojson.js

const fs = require('fs');
const path = require('path');

// Create data directory if it doesn't exist
const dataDir = path.join('public', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`Created directory: ${dataDir}`);
}

// Bandung center coordinates
const centerLat = -6.9147;
const centerLon = 107.6096;

// Generate random polygon features
function generateFeatures(count, center, radius) {
    const features = [];
    
    for (let i = 1; i <= count; i++) {
        // Create a random polygon around the center
        const randomLat = center.lat + (Math.random() - 0.5) * radius;
        const randomLon = center.lon + (Math.random() - 0.5) * radius;
        
        // Random size for the polygon
        const size = 0.01 + Math.random() * 0.02;
        
        // Create polygon coordinates
        const coordinates = [
            [
                [randomLon, randomLat],
                [randomLon + size, randomLat],
                [randomLon + size, randomLat + size],
                [randomLon, randomLat + size],
                [randomLon, randomLat]
            ]
        ];
        
        // Determine gridcode (1-5) randomly with some bias to create patterns
        let gridcode;
        // Different distributions for different layer types to create varied patterns
        if (i % 25 === 0) {
            gridcode = 5; // Rare extreme values
        } else if (i % 10 === 0) {
            gridcode = 4; // Uncommon high values
        } else {
            // More common values with decreasing frequency
            const rand = Math.random();
            if (rand < 0.5) gridcode = 1;
            else if (rand < 0.75) gridcode = 2;
            else gridcode = 3;
        }
        
        // Create the feature
        features.push({
            type: "Feature",
            properties: {
                OBJECTID: i,
                Id: i - 1,
                gridcode: gridcode,
                Shape_Length: parseFloat((size * 4).toFixed(6)),
                Shape_Area: parseFloat((size * size).toFixed(8))
            },
            geometry: {
                type: "Polygon",
                coordinates: coordinates
            },
            id: i - 1
        });
    }
    
    return features;
}

// Create GeoJSON object
function createGeoJSON(features) {
    return {
        type: "FeatureCollection",
        features: features
    };
}

// Generate and save GeoJSON files
function generateGeoJSONFiles() {
    const layerTypes = ['LST', 'NDVI', 'UHI', 'UTFVI'];
    const featureCounts = [200, 200, 200, 200]; // Number of features in each layer
    
    layerTypes.forEach((type, index) => {
        // Generate features with different distributions for variety
        const features = generateFeatures(
            featureCounts[index], 
            { lat: centerLat, lon: centerLon }, 
            0.2 // Radius in degrees
        );
        
        // Create GeoJSON
        const geojson = createGeoJSON(features);
        
        // Save to file
        const filePath = path.join(dataDir, `${type}.geojson`);
        fs.writeFileSync(filePath, JSON.stringify(geojson, null, 2));
        
        console.log(`Created ${filePath} with ${features.length} features`);
    });
}

// Run the generator
generateGeoJSONFiles();
console.log('GeoJSON generation complete!');