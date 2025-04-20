import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'smartproperty')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'postgres')

# API Keys
MAPID_API_KEY = os.getenv('MAPID_API_KEY', '')

# Application configuration
DEBUG = os.getenv('DEBUG', 'True') == 'True'
TESTING = os.getenv('TESTING', 'False') == 'True'
SECRET_KEY = os.getenv('SECRET_KEY', 'dev_secret_key')

# Database URI
DATABASE_URI = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# GIS Configuration
DEFAULT_BBOX = {
    'min_lon': 106.7,  # Default to Jakarta area
    'min_lat': -6.3,
    'max_lon': 106.9,
    'max_lat': -6.1
}

# Climate risk parameters
CLIMATE_PARAMETERS = [
    'temperature', 
    'rainfall',
    'flood_risk',
    'landslide_risk',
    'air_quality'
]

# Property price factors
PRICE_FACTORS = [
    'location',
    'land_area',
    'building_area',
    'facilities',
    'accessibility',
    'disaster_risk',
    'environmental_quality',
    'market_trend'
]