from flask import Blueprint, jsonify, request
import json
import os
import pandas as pd
from app.config import DEFAULT_BBOX, CLIMATE_PARAMETERS, PRICE_FACTORS

property_bp = Blueprint('property', __name__)

# backend/routes/property_routes.py (add this function)

import pandas as pd
import os

@property_bp.route('/api/properties', methods=['GET'])
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
            
            # Get climate scores directly from CSV
            climate_scores = {
                "lst_score": safe_float(row.get("score_LST")),
                "ndvi_score": safe_float(row.get("score_NDVI")),
                "utfvi_score": safe_float(row.get("score_UTFVI")),
                "uhi_score": safe_float(row.get("score_UHI")),
                "overall_score": safe_float(row.get("Overall_Score"))
            }
            
            # Use overall score from CSV if available, otherwise calculate it
            climate_risk_score = climate_scores["overall_score"]
            if climate_risk_score is None:
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
                "climate_risk_score": int(climate_risk_score) if climate_risk_score is not None else None,
                "climate_scores": climate_scores,
                "risks": {
                    "surface_temperature": get_risk_level_from_score(climate_scores.get("lst_score", 50), "surface_temperature"),
                    "heat_stress": get_risk_level_from_score(climate_scores.get("utfvi_score", 50), "heat_stress"),
                    "green_cover": get_risk_level_from_score(climate_scores.get("ndvi_score", 50), "green_cover"),
                    "heat_zone": get_risk_level_from_score(climate_scores.get("uhi_score", 50), "heat_zone"),
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

def get_risk_level_from_score(score, risk_type):
    """Get risk level based on score value"""
    if score is None:
        return "medium"
        
    # Generic risk level determination
    if score >= 80:
        return "very_low" if risk_type != "air_quality" else "excellent" 
    if score >= 60:
        return "low" if risk_type != "air_quality" else "good"
    if score >= 40:
        return "medium" if risk_type != "air_quality" else "moderate"
    if score >= 20:
        return "high" if risk_type != "air_quality" else "poor"
    return "very_high" if risk_type != "air_quality" else "very_poor"

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
        {
            "id": "lst",
            "name": "Land Surface Temperature",
            "description": "Land surface temperature (LST) measurements",
            "legend": [
                {"color": "#91cf60", "label": "Very Low"},
                {"color": "#d9ef8b", "label": "Low"},
                {"color": "#fee08b", "label": "Medium"},
                {"color": "#fc8d59", "label": "High"},
                {"color": "#d73027", "label": "Very High"}
            ]
        },
        {
            "id": "ndvi",
            "name": "Vegetation Index",
            "description": "Normalized Difference Vegetation Index (NDVI)",
            "legend": [
                {"color": "#1a9850", "label": "High Vegetation"},
                {"color": "#91cf60", "label": "Moderate Vegetation"},
                {"color": "#fee08b", "label": "Low Vegetation"},
                {"color": "#fc8d59", "label": "Very Low Vegetation"},
                {"color": "#d73027", "label": "No Vegetation"}
            ]
        },
        {
            "id": "uhi",
            "name": "Urban Heat Island",
            "description": "Urban Heat Island (UHI) effect measurements",
            "legend": [
                {"color": "#91cf60", "label": "Minimal"},
                {"color": "#fee08b", "label": "Moderate"},
                {"color": "#fc8d59", "label": "Significant"},
                {"color": "#d73027", "label": "Severe"}
            ]
        }
    ]
    
    return jsonify({
        "status": "success",
        "count": len(layers),
        "data": layers
    })

@property_bp.route('/api/properties/compare', methods=['GET'])
def compare_properties():
    try:
        # Get property IDs from the query parameter
        id_string = request.args.get('ids', '')
        if not id_string:
            return jsonify({
                "status": "error",
                "message": "No property IDs provided"
            }), 400
            
        # Parse IDs into a list of integers
        property_ids = [int(id) for id in id_string.split(',') if id.isdigit()]
        
        if not property_ids:
            return jsonify({
                "status": "error",
                "message": "Invalid property IDs provided"
            }), 400
            
        # Load CSV file
        csv_path = os.path.join(os.path.dirname(__file__), '../data/properti_bandung_rumah.csv')
        df = pd.read_csv(csv_path)
        
        # Filter properties by ID
        # In a real database, you'd query by ID - here we're using array index
        properties = []
        for idx, row in df.iterrows():
            if idx + 1 not in property_ids:  # Skip if not in requested IDs
                continue
                
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
            
            # Get climate scores directly from CSV
            climate_scores = {
                "lst_score": safe_float(row.get("score_LST")),
                "ndvi_score": safe_float(row.get("score_NDVI")),
                "utfvi_score": safe_float(row.get("score_UTFVI")),
                "uhi_score": safe_float(row.get("score_UHI")),
                "overall_score": safe_float(row.get("Overall_Score"))
            }
            
            # Use overall score from CSV if available, otherwise calculate it
            climate_risk_score = climate_scores["overall_score"]
            if climate_risk_score is None:
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
                "bathrooms": 2,  # Hard-coded for demo since it's not in the CSV
                "certificate": str(row.get("SERTIFIKAT", "")),
                "land_area": safe_float(row.get("LUAS TANAH (M²)")),
                "building_area": safe_float(row.get("LUAS BANGUNAN (M²)")),
                "province": str(row.get("PROVINSI", "")),
                "city": str(row.get("KABKOT", "")),
                "district": str(row.get("KECAMATAN", "")),
                "village": str(row.get("DESA", "")),
                "climate_risk_score": int(climate_risk_score) if climate_risk_score is not None else None,
                "climate_scores": climate_scores,
                "risks": {
                    "surface_temperature": get_risk_level_from_score(climate_scores.get("lst_score", 50), "surface_temperature"),
                    "heat_stress": get_risk_level_from_score(climate_scores.get("utfvi_score", 50), "heat_stress"),
                    "green_cover": get_risk_level_from_score(climate_scores.get("ndvi_score", 50), "green_cover"),
                    "heat_zone": get_risk_level_from_score(climate_scores.get("uhi_score", 50), "heat_zone"),
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
            "message": f"Failed to compare properties: {str(e)}"
        }), 500
    

@property_bp.route('/api/properties/<int:property_id>', methods=['GET'])
def get_property_by_id(property_id):
    """Get a specific property by ID"""
    try:
        # Load CSV file
        csv_path = os.path.join(os.path.dirname(__file__), '../data/properti_bandung_rumah.csv')
        df = pd.read_csv(csv_path)
        
        # In a real database, you'd query by ID - here we use the array index
        if property_id <= 0 or property_id > len(df):
            return jsonify({
                "status": "error",
                "message": f"Property with ID {property_id} not found"
            }), 404
            
        # Get the row (subtract 1 because our IDs start at 1, but DataFrame indices start at 0)
        row = df.iloc[property_id - 1]
        
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
        
        # Get climate scores directly from CSV
        climate_scores = {
            "lst_score": safe_float(row.get("score_LST")),
            "ndvi_score": safe_float(row.get("score_NDVI")),
            "utfvi_score": safe_float(row.get("score_UTFVI")),
            "uhi_score": safe_float(row.get("score_UHI")),
            "overall_score": safe_float(row.get("Overall_Score"))
        }
        
        # Use overall score from CSV if available, otherwise calculate it
        climate_risk_score = climate_scores["overall_score"]
        if climate_risk_score is None:
            climate_risk_score = calculate_mock_climate_risk(row)
        
        property_data = {
            "id": property_id,
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
            "bathrooms": 2,  # Hard-coded for demo since it's not in the CSV
            "certificate": str(row.get("SERTIFIKAT", "")),
            "land_area": safe_float(row.get("LUAS TANAH (M²)")),
            "building_area": safe_float(row.get("LUAS BANGUNAN (M²)")),
            "province": str(row.get("PROVINSI", "")),
            "city": str(row.get("KABKOT", "")),
            "district": str(row.get("KECAMATAN", "")),
            "village": str(row.get("DESA", "")),
            "climate_risk_score": int(climate_risk_score) if climate_risk_score is not None else None,
            "climate_scores": climate_scores,
            "risks": {
                "surface_temperature": get_risk_level_from_score(climate_scores.get("lst_score", 50), "surface_temperature"),
                "heat_stress": get_risk_level_from_score(climate_scores.get("utfvi_score", 50), "heat_stress"),
                "green_cover": get_risk_level_from_score(climate_scores.get("ndvi_score", 50), "green_cover"),
                "heat_zone": get_risk_level_from_score(climate_scores.get("uhi_score", 50), "heat_zone"),
            }
        }
        
        return jsonify({
            "status": "success",
            "data": property_data
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()  # Print full traceback for debugging
        
        return jsonify({
            "status": "error",
            "message": f"Failed to retrieve property: {str(e)}"
        }), 500