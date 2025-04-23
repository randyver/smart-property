# backend/routes/data_routes.py
from flask import Blueprint, jsonify, send_from_directory, current_app
import os
import json

data_bp = Blueprint('data', __name__)

@data_bp.route('/api/data/geojson/<string:layer_name>', methods=['GET'])
def get_geojson_data(layer_name):
    """Get GeoJSON data for a specific climate layer"""
    try:
        # Define valid layer names
        valid_layers = ['lst', 'ndvi', 'uhi', 'utfvi']
        
        if layer_name not in valid_layers:
            return jsonify({
                "status": "error",
                "message": f"Invalid layer name. Must be one of: {', '.join(valid_layers)}"
            }), 400
        
        # Path to the GeoJSON file
        geojson_path = os.path.join(os.path.dirname(__file__), f'../data/geojson/{layer_name}.geojson')
        
        # Check if file exists
        if not os.path.exists(geojson_path):
            return jsonify({
                "status": "error",
                "message": f"GeoJSON file for {layer_name} not found"
            }), 404
            
        # Read the GeoJSON file
        with open(geojson_path, 'r') as f:
            geojson_data = json.load(f)
        
        return jsonify({
            "status": "success",
            "data": geojson_data
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        
        return jsonify({
            "status": "error",
            "message": f"Failed to load GeoJSON data: {str(e)}"
        }), 500

# Add a route to serve static files if needed
@data_bp.route('/api/data/static/<path:filename>', methods=['GET'])
def get_static_data(filename):
    """Serve static data files"""
    try:
        data_dir = os.path.join(os.path.dirname(__file__), '../data')
        return send_from_directory(data_dir, filename)
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to serve file: {str(e)}"
        }), 500