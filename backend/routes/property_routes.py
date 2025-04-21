from flask import Blueprint, jsonify, request
import json
import os
import pandas as pd
from app.config import DEFAULT_BBOX, CLIMATE_PARAMETERS, PRICE_FACTORS

property_bp = Blueprint('property', __name__)

# backend/routes/property_routes.py (add this function)

import pandas as pd
import os

@property_bp.route('/api/properties/bandung', methods=['GET'])
def get_bandung_properties():
    """Get properties from Bandung CSV file"""
    try:
        # Load CSV file
        csv_path = os.path.join(os.path.dirname(__file__), '../data/properti_bandung_rumah.csv')
        df = pd.read_csv(csv_path)
        
        # Convert to list of dictionaries
        properties = []
        for idx, row in df.iterrows():
            # Use safe conversion functions for numeric values
            def safe_int(val):
                try:
                    if pd.isna(val):
                        return None
                    return int(float(val))
                except (ValueError, TypeError):
                    return None
                    
            def safe_float(val):
                try:
                    if pd.isna(val):
                        return None
                    return float(val)
                except (ValueError, TypeError):
                    return None
            
            # Calculate climate risk score
            climate_risk_score = calculate_mock_climate_risk(row)
            
            properties.append({
                "id": idx + 1,
                "title": str(row.get("NAMA PROPERTI", "Unnamed Property")),
                "type": str(row.get("TIPE", "Unknown")),
                "address": str(row.get("ALAMAT", "")),
                "location": {
                    "latitude": safe_float(row.get("LATITUDE")),
                    "longitude": safe_float(row.get("LONGITUDE"))
                },
                "price": safe_int(row.get("HARGA PROPERTI NET (RP)")),
                "price_per_meter": safe_int(row.get("HARGA TANAH NET (RP/M²)")),
                "bedrooms": safe_int(row.get("JUMLAH KAMAR TIDUR")),
                "certificate": str(row.get("SERTIFIKAT", "")),
                "land_area": safe_float(row.get("LUAS TANAH (M²)")),
                "building_area": safe_float(row.get("LUAS BANGUNAN (M²)")),
                "province": str(row.get("PROVINSI", "")),
                "city": str(row.get("KABKOT", "")),
                "district": str(row.get("KECAMATAN", "")),
                "village": str(row.get("DESA", "")),
                "climate_risk_score": climate_risk_score,
                "risks": {
                    "flood": get_mock_risk_level(climate_risk_score, "flood"),
                    "temperature": get_mock_risk_level(climate_risk_score, "temperature"),
                    "air_quality": get_mock_risk_level(climate_risk_score, "air_quality"),
                    "landslide": get_mock_risk_level(climate_risk_score, "landslide")
                }
            })
        
        return jsonify({
            "status": "success",
            "count": len(properties),
            "data": properties
        })
    except Exception as e:
        import traceback
        traceback.print_exc()  # Print full traceback for debugging
        
        return jsonify({
            "status": "error",
            "message": f"Failed to load properties: {str(e)}"
        }), 500

def calculate_mock_climate_risk(row):
    """Calculate a mock climate risk score based on location"""
    # In a real application, this would use actual climate data analysis
    # For demo purposes, generate scores between 50-95
    import random
    import hashlib
    
    # Use location to generate a consistent score
    location_str = f"{row['LATITUDE']},{row['LONGITUDE']}"
    hash_val = int(hashlib.md5(location_str.encode()).hexdigest(), 16)
    
    # Generate score between 50-95
    return 50 + (hash_val % 46)

def get_mock_risk_level(score, risk_type):
    """Get mock risk level based on score and type"""
    if risk_type == "flood":
        if score >= 85: return "very_low"
        if score >= 70: return "low"
        if score >= 55: return "medium"
        if score >= 40: return "high"
        return "very_high"
    elif risk_type == "temperature":
        if score >= 85: return "very_low"
        if score >= 70: return "low"
        if score >= 55: return "medium"
        if score >= 40: return "high"
        return "very_high"
    elif risk_type == "air_quality":
        if score >= 85: return "excellent"
        if score >= 70: return "good"
        if score >= 55: return "moderate"
        if score >= 40: return "poor"
        return "very_poor"
    elif risk_type == "landslide":
        if score >= 85: return "very_low"
        if score >= 70: return "low"
        if score >= 55: return "medium"
        if score >= 40: return "high"
        return "very_high"
    return "medium"

# backend/routes/property_routes.py
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
        # Other layers...
    ]
    
    return jsonify({
        "status": "success",
        "count": len(layers),
        "data": layers
    })