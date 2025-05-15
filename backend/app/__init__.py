# backend/app/__init__.py
from flask import Flask
from flask_cors import CORS
from routes.test_routes import test_bp
from routes.property_routes import property_bp
from routes.analytics_routes import analytics_bp
from routes.data_routes import data_bp
from routes.developer_routes import developer_bp

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})  # Enable CORS for all /api routes
    
    # Register blueprints
    app.register_blueprint(test_bp)
    app.register_blueprint(property_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(data_bp)
    app.register_blueprint(developer_bp)
    
    return app