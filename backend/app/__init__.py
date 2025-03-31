from flask import Flask
from flask_cors import CORS
from routes.test_routes import test_bp

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS
    
    # Register blueprints
    app.register_blueprint(test_bp)
    
    return app