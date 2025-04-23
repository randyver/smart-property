from flask import Blueprint, jsonify, request, Response
import requests
import os
from app.config import MAPID_API_KEY

map_bp = Blueprint('map', __name__)

@map_bp.route('/api/map/style', methods=['GET'])
def get_map_style():
    """Proxy endpoint for MAPID map style to protect API key"""
    try:
        style = request.args.get('style', 'basic')  # Default to basic style
        
        # Construct the MAPID style URL with our server's API key
        mapid_url = f'https://basemap.mapid.io/styles/{style}/style.json?key={MAPID_API_KEY}'
        
        # Make the request to MAPID
        response = requests.get(mapid_url)
        
        if not response.ok:
            return jsonify({
                "status": "error",
                "message": f"Failed to load map style: {response.status_code}"
            }), response.status_code
            
        # Return the response directly with proper content type
        return Response(
            response.content,
            status=response.status_code,
            content_type=response.headers.get('Content-Type', 'application/json')
        )
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error proxying map style: {str(e)}"
        }), 500

@map_bp.route('/api/map/resources/<path:resource_path>', methods=['GET'])
def get_map_resources(resource_path):
    """Proxy endpoint for MAPID resources (sprites, glyphs, fonts) to protect API key"""
    try:
        # Construct the MAPID resource URL with our server's API key
        mapid_url = f'https://basemap.mapid.io/{resource_path}?key={MAPID_API_KEY}'
        
        # Make the request to MAPID
        response = requests.get(mapid_url)
        
        if not response.ok:
            return jsonify({
                "status": "error",
                "message": f"Failed to load resource: {response.status_code}"
            }), response.status_code
            
        # Return the response directly with proper content type
        return Response(
            response.content,
            status=response.status_code,
            content_type=response.headers.get('Content-Type', 'application/octet-stream')
        )
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error proxying resource: {str(e)}"
        }), 500