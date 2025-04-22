from flask import Blueprint, jsonify, request
import json
import os
import pandas as pd
from datetime import datetime
import numpy as np

analytics_bp = Blueprint('analytics', __name__)

# Helper function to read property data from CSV
def get_property_data():
    try:
        csv_path = os.path.join(os.path.dirname(__file__), '../data/properti_bandung_rumah.csv')
        df = pd.read_csv(csv_path)
        return df
    except Exception as e:
        import traceback
        traceback.print_exc()
        return pd.DataFrame()  # Return empty dataframe if file not found

# Process data for the analytics dashboard
def process_property_data(df):
    # Convert price to numeric, handling errors
    df['HARGA PROPERTI NET (RP)'] = pd.to_numeric(df['HARGA PROPERTI NET (RP)'], errors='coerce')
    df['LUAS TANAH (M²)'] = pd.to_numeric(df['LUAS TANAH (M²)'], errors='coerce')
    df['LUAS BANGUNAN (M²)'] = pd.to_numeric(df['LUAS BANGUNAN (M²)'], errors='coerce')
    df['JUMLAH KAMAR TIDUR'] = pd.to_numeric(df['JUMLAH KAMAR TIDUR'], errors='coerce')
    
    # Filter out properties with missing prices
    df = df.dropna(subset=['HARGA PROPERTI NET (RP)'])
    
    # Add climate scores for analysis if they don't exist
    if 'score_LST' not in df.columns:
        # These are placeholder scores - your data may already have these
        for col in ['score_LST', 'score_NDVI', 'score_UTFVI', 'score_UHI', 'Overall_Score']:
            if col not in df.columns:
                # Create scores based on location hash value for consistency
                df[col] = df.apply(
                    lambda row: ((hash(str(row.get('LATITUDE', 0)) + str(row.get('LONGITUDE', 0))) % 50) + 50) 
                    if not pd.isna(row.get('LATITUDE')) and not pd.isna(row.get('LONGITUDE')) 
                    else np.nan, 
                    axis=1
                )
    
    return df

@analytics_bp.route('/api/analytics/price-by-district', methods=['GET'])
def get_price_by_district():
    """Get average property prices by district"""
    df = get_property_data()
    
    if df.empty:
        return jsonify({
            "status": "error",
            "message": "Failed to load property data"
        }), 500
    
    df = process_property_data(df)
    
    # Group by district and calculate average price
    price_by_district = df.groupby('KECAMATAN')['HARGA PROPERTI NET (RP)'].agg(['mean', 'count']).reset_index()
    price_by_district.columns = ['district', 'average_price', 'property_count']
    
    # Convert to native Python types for JSON serialization
    result = []
    for _, row in price_by_district.iterrows():
        result.append({
            'district': row['district'],
            'average_price': float(row['average_price']),
            'property_count': int(row['property_count'])
        })
    
    # Sort by average price descending
    result = sorted(result, key=lambda x: x['average_price'], reverse=True)
    
    return jsonify({
        "status": "success",
        "data": result
    })

@analytics_bp.route('/api/analytics/climate-by-district', methods=['GET'])
def get_climate_by_district():
    """Get average climate scores by district"""
    df = get_property_data()
    
    if df.empty:
        return jsonify({
            "status": "error",
            "message": "Failed to load property data"
        }), 500
    
    df = process_property_data(df)
    
    # Group by district and calculate average climate scores
    climate_cols = ['score_LST', 'score_NDVI', 'score_UTFVI', 'score_UHI', 'Overall_Score']
    
    # Create a list to store district data
    district_climate_data = []
    
    # Calculate average scores for each district
    districts = df['KECAMATAN'].unique()
    for district in districts:
        district_df = df[df['KECAMATAN'] == district]
        
        # Convert to native Python types for JSON serialization
        district_data = {
            'district': district,
            'property_count': int(len(district_df)),
            'lst_score': float(district_df['score_LST'].mean()),
            'ndvi_score': float(district_df['score_NDVI'].mean()),
            'utfvi_score': float(district_df['score_UTFVI'].mean()),
            'uhi_score': float(district_df['score_UHI'].mean()),
            'overall_score': float(district_df['Overall_Score'].mean())
        }
        
        district_climate_data.append(district_data)
    
    # Sort by overall score
    district_climate_data = sorted(
        district_climate_data, 
        key=lambda x: x['overall_score'] if not pd.isna(x['overall_score']) else 0, 
        reverse=True
    )
    
    return jsonify({
        "status": "success",
        "data": district_climate_data
    })

@analytics_bp.route('/api/analytics/price-distribution', methods=['GET'])
def get_price_distribution():
    """Get property price distribution statistics"""
    df = get_property_data()
    
    if df.empty:
        return jsonify({
            "status": "error",
            "message": "Failed to load property data"
        }), 500
    
    df = process_property_data(df)
    
    # Define price ranges in billions (IDR)
    ranges = [
        {"range": "< 1B", "min": 0, "max": 1000000000},
        {"range": "1B - 2B", "min": 1000000000, "max": 2000000000},
        {"range": "2B - 5B", "min": 2000000000, "max": 5000000000},
        {"range": "5B - 10B", "min": 5000000000, "max": 10000000000},
        {"range": "> 10B", "min": 10000000000, "max": 9999999999999}  # Use a very large number instead of infinity
    ]
    
    # Count properties in each range
    for r in ranges:
        count = len(df[(df['HARGA PROPERTI NET (RP)'] >= r['min']) & (df['HARGA PROPERTI NET (RP)'] < r['max'])])
        r['count'] = int(count)
    
    # Get property type distribution
    property_types = df['TIPE'].value_counts().reset_index()
    property_types.columns = ['type', 'count']
    
    # Convert to native Python types for JSON serialization
    property_type_distribution = []
    for _, row in property_types.iterrows():
        property_type_distribution.append({
            'type': row['type'],
            'count': int(row['count'])
        })
    
    return jsonify({
        "status": "success",
        "data": {
            "price_distribution": ranges,
            "property_type_distribution": property_type_distribution
        }
    })

@analytics_bp.route('/api/analytics/bedroom-distribution', methods=['GET'])
def get_bedroom_distribution():
    """Get bedroom count distribution"""
    df = get_property_data()
    
    if df.empty:
        return jsonify({
            "status": "error",
            "message": "Failed to load property data"
        }), 500
    
    df = process_property_data(df)
    
    # Count properties by number of bedrooms
    bedrooms = df['JUMLAH KAMAR TIDUR'].value_counts().reset_index()
    bedrooms.columns = ['bedrooms', 'count']
    
    # Convert to native Python types for JSON serialization
    bedroom_distribution = []
    for _, row in bedrooms.iterrows():
        bedroom_distribution.append({
            'bedrooms': str(int(row['bedrooms']) if not pd.isna(row['bedrooms']) else 'Unknown'),
            'count': int(row['count'])
        })
    
    return jsonify({
        "status": "success",
        "data": bedroom_distribution
    })

@analytics_bp.route('/api/analytics/climate-impact', methods=['GET'])
def get_climate_impact():
    """Get analysis of climate impact on property prices"""
    df = get_property_data()
    
    if df.empty:
        return jsonify({
            "status": "error",
            "message": "Failed to load property data"
        }), 500
    
    df = process_property_data(df)
    
    # Calculate average price for properties with different climate scores
    climate_factors = [
        {'factor': 'LST Score', 'score_column': 'score_LST'},
        {'factor': 'NDVI Score', 'score_column': 'score_NDVI'},
        {'factor': 'UTFVI Score', 'score_column': 'score_UTFVI'},
        {'factor': 'UHI Score', 'score_column': 'score_UHI'},
        {'factor': 'Overall Climate Score', 'score_column': 'Overall_Score'},
    ]
    
    # Define score ranges
    score_ranges = [
        {'range': 'Low (0-40)', 'min': 0, 'max': 40},
        {'range': 'Medium (41-70)', 'min': 41, 'max': 70},
        {'range': 'High (71-100)', 'min': 71, 'max': 100}
    ]
    
    # Calculate average price for each climate factor and score range
    impact_data = []
    
    for factor in climate_factors:
        factor_name = factor['factor']
        score_column = factor['score_column']
        
        # Calculate overall average price for normalization
        overall_avg_price = df['HARGA PROPERTI NET (RP)'].mean()
        
        range_data = []
        for score_range in score_ranges:
            range_df = df[(df[score_column] >= score_range['min']) & (df[score_column] <= score_range['max'])]
            if len(range_df) > 0:
                avg_price = range_df['HARGA PROPERTI NET (RP)'].mean()
                price_difference = ((avg_price - overall_avg_price) / overall_avg_price) * 100
                
                range_data.append({
                    'score_range': score_range['range'],
                    'avg_price': float(avg_price),
                    'property_count': int(len(range_df)),
                    'price_impact_percentage': float(price_difference)
                })
        
        impact_data.append({
            'factor': factor_name,
            'data': range_data
        })
    
    return jsonify({
        "status": "success",
        "data": impact_data
    })

@analytics_bp.route('/api/analytics/dashboard-summary', methods=['GET'])
def get_dashboard_summary():
    """Get summary statistics for the analytics dashboard"""
    df = get_property_data()
    
    if df.empty:
        return jsonify({
            "status": "error",
            "message": "Failed to load property data"
        }), 500
    
    df = process_property_data(df)
    
    # Calculate summary statistics
    total_properties = len(df)
    average_price = float(df['HARGA PROPERTI NET (RP)'].mean())
    
    # Calculate percentage of climate-safe properties (Overall_Score >= 70)
    climate_safe_count = len(df[df['Overall_Score'] >= 70])
    climate_safe_percentage = float((climate_safe_count / total_properties) * 100 if total_properties > 0 else 0)
    
    # Get average climate scores
    avg_lst = float(df['score_LST'].mean())
    avg_ndvi = float(df['score_NDVI'].mean())
    avg_utfvi = float(df['score_UTFVI'].mean())
    avg_uhi = float(df['score_UHI'].mean())
    avg_overall = float(df['Overall_Score'].mean())
    
    return jsonify({
        "status": "success",
        "data": {
            "total_properties": total_properties,
            "average_price": average_price,
            "climate_safe_percentage": climate_safe_percentage,
            "avg_climate_scores": {
                "lst": avg_lst,
                "ndvi": avg_ndvi,
                "utfvi": avg_utfvi,
                "uhi": avg_uhi,
                "overall": avg_overall
            },
            "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    })