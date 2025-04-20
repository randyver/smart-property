from flask import Flask
from flask_cors import CORS
from routes.test_routes import test_bp
from routes.property_routes import property_bp
from routes.analytics_routes import analytics_bp

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS
    
    # Register blueprints
    app.register_blueprint(test_bp)
    app.register_blueprint(property_bp)
    app.register_blueprint(analytics_bp)
    
    return app