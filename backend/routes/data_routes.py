# backend/routes/data_routes.py
from flask import Blueprint, jsonify, request
import os
import json
from math import ceil

data_bp = Blueprint('data', __name__)

@data_bp.route('/api/data/geojson/<string:layer_name>', methods=['GET'])
def get_paginated_geojson(layer_name):
    """Get paginated GeoJSON data"""
    try:
        valid_layers = ['lst', 'ndvi', 'uhi', 'utfvi']
        if layer_name not in valid_layers:
            return jsonify({"error": "Invalid layer"}), 400

        # Get pagination params
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 100))
        
        geojson_path = os.path.join(
            os.path.dirname(__file__), 
            f'../data/geojson/{layer_name}.geojson'
        )

        if not os.path.exists(geojson_path):
            return jsonify({"error": "Data not found"}), 404

        with open(geojson_path, 'r') as f:
            full_data = json.load(f)
        
        features = full_data.get('features', [])
        total_features = len(features)
        total_pages = ceil(total_features / per_page)

        # Paginate features
        start = (page - 1) * per_page
        end = start + per_page
        paginated_features = features[start:end]

        return jsonify({
            "page": page,
            "per_page": per_page,
            "total_features": total_features,
            "total_pages": total_pages,
            "features": paginated_features,
            "type": "FeatureCollection"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500