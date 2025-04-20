from flask import Blueprint, jsonify, request
import json
import random
from datetime import datetime, timedelta

analytics_bp = Blueprint('analytics', __name__)

# Mock data for demonstration purposes
def generate_price_trend_data():
    """Generate mock price trend data for the last 12 months"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365)
    
    # Generate monthly data points
    months = []
    current_date = start_date
    while current_date <= end_date:
        months.append(current_date.strftime("%Y-%m"))
        # Move to next month
        if current_date.month == 12:
            current_date = current_date.replace(year=current_date.year+1, month=1)
        else:
            current_date = current_date.replace(month=current_date.month+1)
    
    # Generate price trends for different regions
    regions = {
        "Central Jakarta": {
            "base_price": 25000000,  # IDR per square meter
            "trend": [random.uniform(0.98, 1.03) for _ in range(len(months))]
        },
        "North Jakarta": {
            "base_price": 18000000,
            "trend": [random.uniform(0.97, 1.04) for _ in range(len(months))]
        },
        "West Jakarta": {
            "base_price": 20000000,
            "trend": [random.uniform(0.99, 1.02) for _ in range(len(months))]
        },
        "South Jakarta": {
            "base_price": 30000000,
            "trend": [random.uniform(0.98, 1.05) for _ in range(len(months))]
        },
        "East Jakarta": {
            "base_price": 15000000,
            "trend": [random.uniform(0.96, 1.03) for _ in range(len(months))]
        }
    }
    
    # Calculate price trends
    result = []
    for region, data in regions.items():
        price = data["base_price"]
        prices = []
        
        # Apply trend factors
        for factor in data["trend"]:
            price *= factor
            prices.append(round(price))
        
        result.append({
            "region": region,
            "data": [{"month": month, "price": price} for month, price in zip(months, prices)]
        })
    
    return result

def generate_climate_risk_data():
    """Generate mock climate risk data for different regions"""
    regions = ["Central Jakarta", "North Jakarta", "West Jakarta", "South Jakarta", "East Jakarta"]
    risk_factors = ["flood_risk", "temperature", "air_quality", "landslide_risk", "green_space"]
    
    result = []
    for region in regions:
        region_data = {
            "region": region,
            "overall_score": random.randint(50, 95)
        }
        
        # Generate random scores for each risk factor
        for factor in risk_factors:
            region_data[factor] = random.randint(30, 100)
        
        result.append(region_data)
    
    return result

@analytics_bp.route('/api/analytics/price-trends', methods=['GET'])
def get_price_trends():
    """Get property price trends over time"""
    region = request.args.get('region', default=None)
    
    trend_data = generate_price_trend_data()
    
    # Filter by region if specified
    if region:
        trend_data = [item for item in trend_data if item["region"] == region]
    
    return jsonify({
        "status": "success",
        "data": trend_data
    })

@analytics_bp.route('/api/analytics/climate-risks', methods=['GET'])
def get_climate_risks():
    """Get climate risk analysis by region"""
    risk_data = generate_climate_risk_data()
    
    return jsonify({
        "status": "success",
        "data": risk_data
    })

@analytics_bp.route('/api/analytics/property-distribution', methods=['GET'])
def get_property_distribution():
    """Get property distribution statistics"""
    # Generate mock distribution data
    price_ranges = [
        {"range": "< 1B", "count": random.randint(50, 200)},
        {"range": "1B - 2B", "count": random.randint(100, 300)},
        {"range": "2B - 5B", "count": random.randint(80, 250)},
        {"range": "5B - 10B", "count": random.randint(30, 120)},
        {"range": "> 10B", "count": random.randint(10, 50)}
    ]
    
    property_types = [
        {"type": "House", "count": random.randint(200, 500)},
        {"type": "Apartment", "count": random.randint(150, 400)},
        {"type": "Villa", "count": random.randint(50, 150)},
        {"type": "Townhouse", "count": random.randint(80, 200)},
        {"type": "Land", "count": random.randint(30, 100)}
    ]
    
    return jsonify({
        "status": "success",
        "data": {
            "price_distribution": price_ranges,
            "property_type_distribution": property_types
        }
    })

@analytics_bp.route('/api/analytics/climate-impact', methods=['GET'])
def get_climate_impact():
    """Get analysis of climate impact on property prices"""
    impact_factors = [
        {
            "factor": "Flood Risk",
            "impact_percentage": random.uniform(-30, -15),
            "affected_regions": ["North Jakarta", "East Jakarta"],
            "description": "Properties in flood-prone areas show significant price depreciation"
        },
        {
            "factor": "Air Quality",
            "impact_percentage": random.uniform(-20, -5),
            "affected_regions": ["Central Jakarta", "West Jakarta"],
            "description": "Poor air quality correlates with moderate price reductions"
        },
        {
            "factor": "Green Space Proximity",
            "impact_percentage": random.uniform(10, 25),
            "affected_regions": ["South Jakarta"],
            "description": "Properties near parks and green spaces command premium prices"
        },
        {
            "factor": "Urban Heat Island",
            "impact_percentage": random.uniform(-15, -5),
            "affected_regions": ["Central Jakarta", "East Jakarta"],
            "description": "Areas with higher surface temperatures show lower property values"
        }
    ]
    
    return jsonify({
        "status": "success",
        "data": impact_factors
    })

@analytics_bp.route('/api/analytics/dashboard-summary', methods=['GET'])
def get_dashboard_summary():
    """Get summary statistics for the analytics dashboard"""
    total_properties = random.randint(800, 1500)
    average_price = random.randint(2000000000, 3500000000)  # In IDR
    climate_safe_percentage = random.randint(40, 70)
    price_trend = random.uniform(-5, 15)  # Annual percentage change
    
    return jsonify({
        "status": "success",
        "data": {
            "total_properties": total_properties,
            "average_price": average_price,
            "climate_safe_percentage": climate_safe_percentage,
            "price_trend": price_trend,
            "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    })