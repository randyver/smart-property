from flask import Blueprint, jsonify, request
import json
import os
import pandas as pd
import numpy as np
import math
import random
import traceback

developer_bp = Blueprint('developer', __name__)

# Cache for GeoJSON data to avoid repeated file reads
geojson_cache = {}

@developer_bp.route('/api/climate/scores', methods=['GET'])
def get_climate_scores():
    """Get climate scores for a specific location"""
    try:
        # Get latitude and longitude from request parameters
        lat = float(request.args.get('lat', '0'))
        lng = float(request.args.get('lng', '0'))
        
        # Validate coordinates
        if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
            return jsonify({
                "status": "error",
                "message": "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180."
            }), 400
            
        # Calculate climate scores based on GeoJSON data or generate them
        try:
            # Try to calculate based on GeoJSON data first
            scores = calculate_climate_scores(lat, lng)
            print(f"Calculated climate scores: {scores}")
        except Exception as e:
            # If calculation fails, fall back to generated scores
            print(f"Error calculating climate scores from GeoJSON: {str(e)}")
            print("Falling back to generated scores")
            scores = generate_climate_scores(lat, lng)
        
        return jsonify({
            "status": "success",
            "data": scores
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "status": "error",
            "message": f"Failed to get climate scores: {str(e)}"
        }), 500

@developer_bp.route('/api/developer/predict-price', methods=['POST'])
def predict_property_price():
    """Predict property price based on location, climate data, and property details"""
    try:
        # Parse JSON data from request
        data = request.json
        
        # Validate required fields
        required_fields = ['location', 'bedrooms', 'landArea', 'certificate', 'propertyType', 'landPricePerMeter']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "status": "error",
                    "message": f"Missing required field: {field}"
                }), 400
        
        # Extract location data
        location = data['location']
        if 'latitude' not in location or 'longitude' not in location:
            return jsonify({
                "status": "error",
                "message": "Location must include latitude and longitude"
            }), 400
            
        # Extract property details
        bedrooms = int(data['bedrooms'])
        land_area = float(data['landArea'])
        certificate = data['certificate']
        property_type = data['propertyType']
        land_price_per_meter = float(data['landPricePerMeter'])
        
        # Get climate scores, either from request or calculate them
        climate_scores = data.get('climateScores')
        if not climate_scores:
            try:
                # Try to calculate based on GeoJSON data first
                climate_scores = calculate_climate_scores(
                    location['latitude'], 
                    location['longitude']
                )
            except Exception as e:
                # If calculation fails, fall back to generated scores
                print(f"Error calculating climate scores from GeoJSON: {str(e)}")
                print("Falling back to generated scores")
                climate_scores = generate_climate_scores(
                    location['latitude'], 
                    location['longitude']
                )
        
        # Calculate property price based on all factors
        predicted_price, factors = calculate_property_price(
            bedrooms=bedrooms,
            land_area=land_area,
            certificate=certificate,
            property_type=property_type,
            land_price_per_meter=land_price_per_meter,
            climate_scores=climate_scores
        )
        
        return jsonify({
            "status": "success",
            "predicted_price": predicted_price,
            "confidence": 0.85,  # Mock confidence level
            "factors": factors
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "status": "error",
            "message": f"Failed to predict price: {str(e)}"
        }), 500

def load_geojson(layer_name):
    """Load GeoJSON data from file, using cache if available"""
    if layer_name in geojson_cache:
        return geojson_cache[layer_name]
    
    try:
        # Check various possible paths
        file_paths = [
            os.path.join(os.path.dirname(__file__), f'../data/geojson/{layer_name}.geojson'),
            os.path.join(os.path.dirname(__file__), f'../data/{layer_name}.geojson'),
            os.path.join(os.path.dirname(__file__), f'../static/{layer_name}.geojson')
        ]
        
        for file_path in file_paths:
            if os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    print(f"Loading GeoJSON from {file_path}")
                    geojson_data = json.load(f)
                    geojson_cache[layer_name] = geojson_data
                    return geojson_data
        
        print(f"Warning: GeoJSON file not found for layer: {layer_name}")
        return None
            
    except Exception as e:
        print(f"Error loading GeoJSON data for {layer_name}: {str(e)}")
        return None

def find_gridcode_for_point(geojson_data, lat, lng):
    """Find the gridcode for a given point in GeoJSON data"""
    if not geojson_data or 'features' not in geojson_data:
        print("No valid GeoJSON data provided for gridcode lookup")
        return None
        
    # Shapely may not be available, so use a simpler approach
    try:
        from shapely.geometry import Point, shape
        point = Point(lng, lat)  # Note: GeoJSON is (longitude, latitude)
        
        for feature in geojson_data['features']:
            if feature is None or 'geometry' not in feature or feature['geometry'] is None:
                continue
                
            if feature['geometry']['type'] == 'Polygon':
                polygon = shape(feature['geometry'])
                if polygon.contains(point):
                    return feature['properties'].get('gridcode')
        
        # If no polygon contains the point, find the nearest one
        min_distance = float('inf')
        nearest_gridcode = None
        
        for feature in geojson_data['features']:
            if feature is None or 'geometry' not in feature or feature['geometry'] is None:
                continue
                
            if feature['geometry']['type'] == 'Polygon':
                polygon = shape(feature['geometry'])
                distance = polygon.exterior.distance(point)
                if distance < min_distance:
                    min_distance = distance
                    nearest_gridcode = feature['properties'].get('gridcode')
        
        return nearest_gridcode
    except ImportError:
        # If shapely is not available, use a simpler approach
        print("Shapely not available, using fallback method")
        return simple_grid_lookup(geojson_data, lat, lng)

def simple_grid_lookup(geojson_data, lat, lng):
    """A simpler method to find gridcode when shapely is not available"""
    # Determine a gridcode based on the coordinate's position in Bandung
    # For demonstration, we'll use a deterministic approach based on quadrants
    
    # Bandung approximately spans from -6.8 to -7.0 lat and 107.5 to 107.7 lng
    # Divide into a grid and assign gridcodes
    lat_normalized = (lat + 6.9) * 10  # Center around Bandung
    lng_normalized = (lng - 107.6) * 10
    
    # Create a simple grid
    grid_x = min(max(int(lng_normalized * 2) + 2, 0), 4)
    grid_y = min(max(int(lat_normalized * 2) + 2, 0), 4)
    
    # Deterministic gridcode based on position
    gridcode = ((grid_x + grid_y) % 5) + 1
    
    return gridcode

def convert_gridcode_to_score(gridcode, layer_type):
    """Convert a gridcode to a climate score (0-100)"""
    if gridcode is None:
        return None
    
    # For most layers, lower gridcode is better (1 is best, 5 is worst)
    # For NDVI, higher gridcode is better (5 is best, 1 is worst)
    max_gridcode = 5  # Assuming 5 gridcode levels
    
    if layer_type == 'ndvi':
        # For NDVI, higher gridcode is better
        score = (gridcode / max_gridcode) * 100
    else:
        # For other layers, lower gridcode is better
        score = ((max_gridcode - gridcode + 1) / max_gridcode) * 100
    
    return score

def calculate_climate_scores(lat, lng):
    """Calculate climate scores based on gridcodes from GeoJSON data"""
    # Load all layer data
    layers = ['lst', 'ndvi', 'uhi', 'utfvi']
    gridcodes = {}
    
    for layer in layers:
        geojson_data = load_geojson(layer)
        if geojson_data:
            gridcodes[layer] = find_gridcode_for_point(geojson_data, lat, lng)
        else:
            print(f"No GeoJSON data found for layer: {layer}")
    
    # Check if we have any gridcodes
    if not any(gridcodes.values()):
        print("No gridcodes found, falling back to generated scores")
        return generate_climate_scores(lat, lng)
    
    # Convert gridcodes to climate scores
    lst_score = convert_gridcode_to_score(gridcodes.get('lst'), 'lst')
    ndvi_score = convert_gridcode_to_score(gridcodes.get('ndvi'), 'ndvi')
    utfvi_score = convert_gridcode_to_score(gridcodes.get('utfvi'), 'utfvi')
    uhi_score = convert_gridcode_to_score(gridcodes.get('uhi'), 'uhi')
    
    # For any missing scores, generate based on location
    temp_scores = generate_climate_scores(lat, lng)
    if lst_score is None:
        print("Land Surface Temperature score not found, using generated score")
        lst_score = temp_scores["lst_score"]
    if ndvi_score is None:
        print("NDVI score not found, using generated score")
        ndvi_score = temp_scores["ndvi_score"]
    if utfvi_score is None:
        print("Urban Thermal Field Variance Index score not found, using generated score")
        utfvi_score = temp_scores["utfvi_score"]
    if uhi_score is None:
        print("Urban Heat Island score not found, using generated score")
        uhi_score = temp_scores["uhi_score"]
    
    # Calculate overall score (weighted average)
    # You can adjust weights based on importance of each factor
    weights = {'lst': 0.25, 'ndvi': 0.25, 'utfvi': 0.25, 'uhi': 0.25}
    overall_score = (
        lst_score * weights['lst'] +
        ndvi_score * weights['ndvi'] +
        utfvi_score * weights['utfvi'] +
        uhi_score * weights['uhi']
    )
    
    return {
        "lst_score": round(lst_score),
        "ndvi_score": round(ndvi_score),
        "utfvi_score": round(utfvi_score),
        "uhi_score": round(uhi_score),
        "overall_score": round(overall_score)
    }

def generate_climate_scores(lat, lng):
    """
    Generate deterministic climate scores based on coordinates.
    This is a fallback method if GeoJSON data is unavailable.
    
    Args:
        lat (float): Latitude
        lng (float): Longitude
        
    Returns:
        dict: Dictionary of climate scores
    """
    # Create a deterministic seed from the coordinates
    # This ensures the same location always gets the same scores
    seed_value = int(abs(lat * 1000) + abs(lng * 1000))
    np.random.seed(seed_value)
    
    # For Bandung area, we'll use more realistic score ranges
    # Bandung general coordinates: -6.9147 latitude, 107.6098 longitude
    
    # Check if coordinates are within Bandung area (approximately)
    is_bandung_area = (-7.0 <= lat <= -6.8) and (107.5 <= lng <= 107.7)
    
    if is_bandung_area:
        # Generate scores for Bandung areas - generally better climate conditions
        lst_base = 65  # Land Surface Temperature
        ndvi_base = 70  # Normalized Difference Vegetation Index
        utfvi_base = 60  # Urban Thermal Field Variance Index
        uhi_base = 65  # Urban Heat Island
        
        # Add variations based on specific areas
        # North Bandung (higher elevation) typically has better climate scores
        if lat > -6.88:  # North Bandung
            lst_base += 15
            ndvi_base += 10
            utfvi_base += 5
            uhi_base += 10
        # Central Bandung (urban center) has worse climate scores
        elif -6.92 <= lat <= -6.89 and 107.58 <= lng <= 107.63:
            lst_base -= 10
            ndvi_base -= 15
            utfvi_base -= 5
            uhi_base -= 10
    else:
        # Default score bases for areas outside Bandung
        lst_base = 60
        ndvi_base = 55
        utfvi_base = 50
        uhi_base = 55
    
    # Add some randomness, but keep it deterministic based on the coordinates
    variation = 10
    lst_score = min(100, max(0, lst_base + (np.random.rand() * variation - variation/2)))
    ndvi_score = min(100, max(0, ndvi_base + (np.random.rand() * variation - variation/2)))
    utfvi_score = min(100, max(0, utfvi_base + (np.random.rand() * variation - variation/2)))
    uhi_score = min(100, max(0, uhi_base + (np.random.rand() * variation - variation/2)))
    
    # Calculate overall score as weighted average
    overall_score = (lst_score * 0.3 + ndvi_score * 0.3 + utfvi_score * 0.2 + uhi_score * 0.2)
    
    # Return the scores as rounded integers
    return {
        "lst_score": round(lst_score),
        "ndvi_score": round(ndvi_score),
        "utfvi_score": round(utfvi_score),
        "uhi_score": round(uhi_score),
        "overall_score": round(overall_score)
    }

def calculate_property_price(bedrooms, land_area, certificate, property_type, land_price_per_meter, climate_scores):
    """
    Calculate property price based on input parameters.
    
    Args:
        bedrooms (int): Number of bedrooms
        land_area (float): Land area in m²
        certificate (str): Certificate type
        property_type (str): Property type
        land_price_per_meter (float): Land price per m²
        climate_scores (dict): Climate scores
        
    Returns:
        tuple: (predicted_price, factors)
    """
    # Basic land value
    land_value = land_area * land_price_per_meter
    
    # Certificate multiplier
    certificate_multiplier = 1.0
    if certificate == "SHM - Sertifikat Hak Milik":
        certificate_multiplier = 1.2
    elif certificate == "HGB - Hak Guna Bangunan":
        certificate_multiplier = 1.1
    elif "SHM" in certificate:
        certificate_multiplier = 1.15
    elif "HGB" in certificate:
        certificate_multiplier = 1.05
    
    # Property type multiplier
    type_multiplier = 1.0
    if "MEWAH" in property_type.upper() or "LUXURY" in property_type.upper():
        type_multiplier = 1.5
    elif "VILLA" in property_type.upper():
        type_multiplier = 1.4
    elif "TOWN" in property_type.upper():
        type_multiplier = 1.3
    elif "BARU" in property_type.upper() or "NEW" in property_type.upper():
        type_multiplier = 1.2
    
    # Bedroom multiplier
    bedroom_multiplier = 1 + (bedrooms * 0.1)
    
    # Climate score multiplier
    # Higher climate scores increase property value
    overall_score = climate_scores.get("overall_score", 50)
    climate_multiplier = 1 + ((overall_score - 50) / 100)
    
    # Calculate final price
    predicted_price = (
        land_value * 
        certificate_multiplier * 
        type_multiplier * 
        bedroom_multiplier * 
        climate_multiplier
    )
    
    # Add some random variation (±5%)
    random.seed(int(land_area) + bedrooms + int(land_price_per_meter))
    random_factor = 1 + ((random.random() * 10) - 5) / 100
    predicted_price *= random_factor
    
    # Round to nearest 10 million
    predicted_price = round(predicted_price / 10000000) * 10000000
    
    # Create factors dictionary to explain the prediction
    factors = {
        "basePrice": land_value,
        "certificateImpact": (certificate_multiplier - 1) * 100,
        "propertyTypeImpact": (type_multiplier - 1) * 100,
        "bedroomsImpact": (bedroom_multiplier - 1) * 100,
        "climateImpact": (climate_multiplier - 1) * 100
    }
    
    return predicted_price, factors