from flask import Blueprint, jsonify, request
import json
import os
import pandas as pd
from app.config import DEFAULT_BBOX, CLIMATE_PARAMETERS, PRICE_FACTORS

property_bp = Blueprint('property', __name__)

# Mock data for demo purposes - in production this would come from a database
SAMPLE_PROPERTIES = [
    {
        "id": 1,
        "title": "Modern House in Central Jakarta",
        "location": {
            "latitude": -6.21,
            "longitude": 106.82
        },
        "price": 2500000000,
        "bedrooms": 3,
        "bathrooms": 2,
        "land_area": 150,
        "building_area": 120,
        "climate_risk_score": 75,  # 0-100, higher is better (safer)
        "risks": {
            "flood": "low",
            "temperature": "medium",
            "air_quality": "good",
            "landslide": "very_low"
        }
    },
    {
        "id": 2,
        "title": "Spacious Family Home in Kemang",
        "location": {
            "latitude": -6.26,
            "longitude": 106.81
        },
        "price": 4800000000,
        "bedrooms": 4,
        "bathrooms": 3,
        "land_area": 300,
        "building_area": 250,
        "climate_risk_score": 85,
        "risks": {
            "flood": "very_low",
            "temperature": "low",
            "air_quality": "very_good",
            "landslide": "very_low"
        }
    },
    {
        "id": 3,
        "title": "Cozy Apartment in West Jakarta",
        "location": {
            "latitude": -6.17,
            "longitude": 106.77
        },
        "price": 1200000000,
        "bedrooms": 2,
        "bathrooms": 1,
        "land_area": 0,
        "building_area": 65,
        "climate_risk_score": 60,
        "risks": {
            "flood": "medium",
            "temperature": "high",
            "air_quality": "moderate",
            "landslide": "very_low"
        }
    },
    {
        "id": 4,
        "title": "Luxury Villa in South Jakarta",
        "location": {
            "latitude": -6.28,
            "longitude": 106.80
        },
        "price": 8500000000,
        "bedrooms": 5,
        "bathrooms": 4,
        "land_area": 500,
        "building_area": 400,
        "climate_risk_score": 90,
        "risks": {
            "flood": "very_low",
            "temperature": "low",
            "air_quality": "excellent",
            "landslide": "very_low"
        }
    },
    {
        "id": 5,
        "title": "Strategic Property in East Jakarta",
        "location": {
            "latitude": -6.22,
            "longitude": 106.90
        },
        "price": 1800000000,
        "bedrooms": 3,
        "bathrooms": 2,
        "land_area": 120,
        "building_area": 100,
        "climate_risk_score": 55,
        "risks": {
            "flood": "high",
            "temperature": "medium",
            "air_quality": "moderate",
            "landslide": "low"
        }
    }
]

@property_bp.route('/api/properties', methods=['GET'])
def get_properties():
    """
    Get properties with optional filtering
    Query parameters:
    - min_price: Minimum price
    - max_price: Maximum price
    - min_score: Minimum climate risk score
    - bedrooms: Minimum number of bedrooms
    - bathrooms: Minimum number of bathrooms
    """
    min_price = request.args.get('min_price', type=int, default=0)
    max_price = request.args.get('max_price', type=int, default=999999999999)
    min_score = request.args.get('min_score', type=int, default=0)
    bedrooms = request.args.get('bedrooms', type=int, default=0)
    bathrooms = request.args.get('bathrooms', type=int, default=0)
    
    filtered_properties = [
        p for p in SAMPLE_PROPERTIES
        if p['price'] >= min_price
        and p['price'] <= max_price
        and p['climate_risk_score'] >= min_score
        and p['bedrooms'] >= bedrooms
        and p['bathrooms'] >= bathrooms
    ]
    
    return jsonify({
        "status": "success",
        "count": len(filtered_properties),
        "data": filtered_properties
    })

@property_bp.route('/api/properties/<int:property_id>', methods=['GET'])
def get_property(property_id):
    """Get details for a specific property"""
    property_data = next((p for p in SAMPLE_PROPERTIES if p['id'] == property_id), None)
    
    if not property_data:
        return jsonify({
            "status": "error",
            "message": "Property not found"
        }), 404
    
    return jsonify({
        "status": "success",
        "data": property_data
    })

@property_bp.route('/api/properties/compare', methods=['GET'])
def compare_properties():
    """
    Compare multiple properties
    Query parameters:
    - ids: Comma-separated list of property IDs to compare
    """
    property_ids = request.args.get('ids', '')
    if not property_ids:
        return jsonify({
            "status": "error",
            "message": "No property IDs provided"
        }), 400
    
    try:
        id_list = [int(id) for id in property_ids.split(',')]
    except ValueError:
        return jsonify({
            "status": "error",
            "message": "Invalid property IDs format"
        }), 400
    
    properties = [p for p in SAMPLE_PROPERTIES if p['id'] in id_list]
    
    if not properties:
        return jsonify({
            "status": "error",
            "message": "No matching properties found"
        }), 404
    
    return jsonify({
        "status": "success",
        "count": len(properties),
        "data": properties
    })

@property_bp.route('/api/climate/risk-layers', methods=['GET'])
def get_risk_layers():
    """Get available climate risk map layers"""
    layers = [
        {
            "id": "flood_risk",
            "name": "Flood Risk",
            "description": "Areas with risk of flooding during heavy rainfall",
            "legend": [
                {"color": "#a6cee3", "label": "Very Low Risk"},
                {"color": "#1f78b4", "label": "Low Risk"},
                {"color": "#b2df8a", "label": "Medium Risk"},
                {"color": "#33a02c", "label": "High Risk"},
                {"color": "#fb9a99", "label": "Very High Risk"}
            ]
        },
        {
            "id": "temperature",
            "name": "Surface Temperature",
            "description": "Land surface temperature analysis",
            "legend": [
                {"color": "#313695", "label": "Below Average"},
                {"color": "#4575b4", "label": "Slightly Below Average"},
                {"color": "#74add1", "label": "Average"},
                {"color": "#abd9e9", "label": "Slightly Above Average"},
                {"color": "#e0f3f8", "label": "Above Average"},
                {"color": "#ffffbf", "label": "Moderate High"},
                {"color": "#fee090", "label": "High"},
                {"color": "#fdae61", "label": "Very High"},
                {"color": "#f46d43", "label": "Extremely High"},
                {"color": "#d73027", "label": "Dangerously High"}
            ]
        },
        {
            "id": "air_quality",
            "name": "Air Quality",
            "description": "Air quality index across the region",
            "legend": [
                {"color": "#00ccbc", "label": "Excellent"},
                {"color": "#99cc33", "label": "Good"},
                {"color": "#ffde33", "label": "Moderate"},
                {"color": "#ff9933", "label": "Poor"},
                {"color": "#cc0033", "label": "Very Poor"},
                {"color": "#660099", "label": "Hazardous"}
            ]
        },
        {
            "id": "green_space",
            "name": "Green Space",
            "description": "Distribution of green spaces and vegetation",
            "legend": [
                {"color": "#276419", "label": "Dense Vegetation"},
                {"color": "#4d9221", "label": "Moderate Vegetation"},
                {"color": "#7fbc41", "label": "Light Vegetation"},
                {"color": "#b8e186", "label": "Sparse Vegetation"},
                {"color": "#e6f5d0", "label": "Very Sparse Vegetation"},
                {"color": "#f7f7f7", "label": "No Vegetation"}
            ]
        }
    ]
    
    return jsonify({
        "status": "success",
        "count": len(layers),
        "data": layers
    })

@property_bp.route('/api/properties/recommend', methods=['GET'])
def recommend_properties():
    """
    Get property recommendations based on climate safety
    Query parameters:
    - min_price: Minimum price
    - max_price: Maximum price
    - bedrooms: Minimum number of bedrooms
    - priority: Climate factor to prioritize (flood, temperature, air_quality)
    """
    min_price = request.args.get('min_price', type=int, default=0)
    max_price = request.args.get('max_price', type=int, default=999999999999)
    bedrooms = request.args.get('bedrooms', type=int, default=0)
    priority = request.args.get('priority', default='overall')
    
    # Filter properties by basic criteria
    filtered_properties = [
        p for p in SAMPLE_PROPERTIES
        if p['price'] >= min_price
        and p['price'] <= max_price
        and p['bedrooms'] >= bedrooms
    ]
    
    # Sort based on priority
    if priority == 'overall':
        filtered_properties.sort(key=lambda p: p['climate_risk_score'], reverse=True)
    elif priority in ['flood', 'temperature', 'air_quality', 'landslide']:
        # Convert risk levels to numeric scores for sorting
        risk_scores = {
            'very_low': 5,
            'low': 4,
            'medium': 3,
            'high': 2,
            'very_high': 1
        }
        
        # Sort by the specific risk factor
        filtered_properties.sort(
            key=lambda p: risk_scores.get(p['risks'].get(priority, 'medium'), 3),
            reverse=True
        )
    
    # Return top 3 recommendations
    top_recommendations = filtered_properties[:3]
    
    return jsonify({
        "status": "success",
        "count": len(top_recommendations),
        "data": top_recommendations
    })

@property_bp.route('/api/price/predict', methods=['POST'])
def predict_price():
    """
    Predict property price based on provided parameters
    Expected JSON payload:
    {
        "location": {"latitude": -6.2, "longitude": 106.8},
        "land_area": 200,
        "building_area": 150,
        "bedrooms": 3,
        "bathrooms": 2,
        "facilities": ["pool", "garden", "security"]
    }
    """
    if not request.is_json:
        return jsonify({
            "status": "error",
            "message": "Request must be JSON"
        }), 400
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['location', 'land_area', 'building_area']
    for field in required_fields:
        if field not in data:
            return jsonify({
                "status": "error",
                "message": f"Missing required field: {field}"
            }), 400
    
    # In a real application, this would use a trained ML model
    # Here we'll use a simple formula for demonstration
    base_price = 15000000  # Base price per square meter (IDR)
    location_factor = 1.2  # Premium location factor
    
    # Calculate predicted price
    land_price = data['land_area'] * base_price
    building_price = data['building_area'] * base_price * 0.8
    
    # Add location premium
    total_price = (land_price + building_price) * location_factor
    
    # Add bedroom and bathroom premiums
    bedrooms = data.get('bedrooms', 0)
    bathrooms = data.get('bathrooms', 0)
    total_price += bedrooms * 100000000  # 100M IDR per bedroom
    total_price += bathrooms * 50000000  # 50M IDR per bathroom
    
    # Add facilities premium
    facilities = data.get('facilities', [])
    facilities_premium = len(facilities) * 50000000  # 50M IDR per facility
    total_price += facilities_premium
    
    # Calculate confidence based on data completeness
    confidence = min(85, 50 + 5 * len(data.keys()))
    
    return jsonify({
        "status": "success",
        "data": {
            "predicted_price": round(total_price),
            "confidence": confidence,
            "factors": {
                "location": "Premium" if location_factor > 1 else "Standard",
                "land_contribution": round(land_price),
                "building_contribution": round(building_price),
                "facilities_premium": round(facilities_premium)
            }
        }
    })