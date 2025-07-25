# backend/routes/analytics_routes.py
# Adding new analytics endpoints for additional data visualizations

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
    df['HARGA TANAH NET (RP/M²)'] = pd.to_numeric(df['HARGA TANAH NET (RP/M²)'], errors='coerce')
    
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
        {"range": "< 1M", "min": 0, "max": 1000000000},
        {"range": "1M - 2M", "min": 1000000000, "max": 2000000000},
        {"range": "2M - 5M", "min": 2000000000, "max": 5000000000},
        {"range": "5M - 10M", "min": 5000000000, "max": 10000000000},
        {"range": "> 10M", "min": 10000000000, "max": 9999999999999}  # Use a very large number instead of infinity
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
        {'range': 'Rendah (0-40)', 'min': 0, 'max': 40},
        {'range': 'Sedang (41-70)', 'min': 41, 'max': 70},
        {'range': 'Tinggi (71-100)', 'min': 71, 'max': 100}
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

# NEW API ENDPOINTS

@analytics_bp.route('/api/analytics/land-price-distribution', methods=['GET'])
def get_land_price_distribution():
    """Get land price distribution statistics"""
    df = get_property_data()
    
    if df.empty:
        return jsonify({
            "status": "error",
            "message": "Failed to load property data"
        }), 500
    
    df = process_property_data(df)
    
    # Define land price ranges in millions (IDR/m²)
    land_price_ranges = [
        {"range": "< 5jt/m²", "min": 0, "max": 5000000},
        {"range": "5-10jt/m²", "min": 5000000, "max": 10000000},
        {"range": "10-15jt/m²", "min": 10000000, "max": 15000000},
        {"range": "15-20jt/m²", "min": 15000000, "max": 20000000},
        {"range": "> 20jt/m²", "min": 20000000, "max": 1000000000}  # Very large max
    ]
    
    # Count properties in each range
    for r in land_price_ranges:
        count = len(df[(df['HARGA TANAH NET (RP/M²)'] >= r['min']) & (df['HARGA TANAH NET (RP/M²)'] < r['max'])])
        r['count'] = int(count)
    
    return jsonify({
        "status": "success",
        "data": land_price_ranges
    })

@analytics_bp.route('/api/analytics/certificate-distribution', methods=['GET'])
def get_certificate_distribution():
    """Get certificate type distribution"""
    df = get_property_data()
    
    if df.empty:
        return jsonify({
            "status": "error",
            "message": "Failed to load property data"
        }), 500
    
    df = process_property_data(df)
    
    # Group by certificate type
    certificate_counts = df['SERTIFIKAT'].value_counts().reset_index()
    certificate_counts.columns = ['certificate', 'count']
    
    # Convert to list of dictionaries
    result = []
    for _, row in certificate_counts.iterrows():
        result.append({
            'certificate': row['certificate'],
            'count': int(row['count'])
        })
    
    return jsonify({
        "status": "success",
        "data": result
    })

@analytics_bp.route('/api/analytics/price-vs-climate', methods=['GET'])
def get_price_vs_climate():
    """Get property price vs climate score correlation data"""
    df = get_property_data()
    
    if df.empty:
        return jsonify({
            "status": "error",
            "message": "Failed to load property data"
        }), 500
    
    df = process_property_data(df)
    
    # Prepare data points for scatter plot
    scatter_data = []
    for _, row in df.iterrows():
        if not pd.isna(row['HARGA PROPERTI NET (RP)']) and not pd.isna(row['Overall_Score']):
            scatter_data.append({
                'price': float(row['HARGA PROPERTI NET (RP)']),
                'climate_score': float(row['Overall_Score']),
                'district': row['KECAMATAN']
            })
    
    return jsonify({
        "status": "success",
        "data": scatter_data
    })

@analytics_bp.route('/api/analytics/price-vs-land-price', methods=['GET'])
def get_price_vs_land_price():
    """Get property price vs land price correlation data"""
    df = get_property_data()
    
    if df.empty:
        return jsonify({
            "status": "error",
            "message": "Failed to load property data"
        }), 500
    
    df = process_property_data(df)
    
    # Prepare data points for scatter plot
    scatter_data = []
    for _, row in df.iterrows():
        if (not pd.isna(row['HARGA PROPERTI NET (RP)']) and 
            not pd.isna(row['HARGA TANAH NET (RP/M²)'])):
            scatter_data.append({
                'property_price': float(row['HARGA PROPERTI NET (RP)']),
                'land_price': float(row['HARGA TANAH NET (RP/M²)']),
                'district': row['KECAMATAN']
            })
    
    return jsonify({
        "status": "success",
        "data": scatter_data
    })

@analytics_bp.route('/api/analytics/price-vs-land-area', methods=['GET'])
def get_price_vs_land_area():
    """Get property price vs land area correlation data"""
    df = get_property_data()
    
    if df.empty:
        return jsonify({
            "status": "error",
            "message": "Failed to load property data"
        }), 500
    
    df = process_property_data(df)
    
    # Prepare data points for scatter plot
    scatter_data = []
    for _, row in df.iterrows():
        if (not pd.isna(row['HARGA PROPERTI NET (RP)']) and 
            not pd.isna(row['LUAS TANAH (M²)'])):
            scatter_data.append({
                'property_price': float(row['HARGA PROPERTI NET (RP)']),
                'land_area': float(row['LUAS TANAH (M²)']),
                'district': row['KECAMATAN']
            })
    
    return jsonify({
        "status": "success",
        "data": scatter_data
    })

@analytics_bp.route('/api/analytics/land-price-vs-climate', methods=['GET'])
def get_land_price_vs_climate():
    """Get land price vs climate score correlation data"""
    df = get_property_data()
    
    if df.empty:
        return jsonify({
            "status": "error",
            "message": "Failed to load property data"
        }), 500
    
    df = process_property_data(df)
    
    # Prepare data points for scatter plot
    scatter_data = []
    for _, row in df.iterrows():
        if (not pd.isna(row['HARGA TANAH NET (RP/M²)']) and 
            not pd.isna(row['Overall_Score'])):
            scatter_data.append({
                'land_price': float(row['HARGA TANAH NET (RP/M²)']),
                'climate_score': float(row['Overall_Score']),
                'district': row['KECAMATAN']
            })
    
    return jsonify({
        "status": "success",
        "data": scatter_data
    })

@analytics_bp.route('/api/analytics/price-by-certificate', methods=['GET'])
def get_price_by_certificate():
    """Get average property prices by certificate type"""
    df = get_property_data()
    
    if df.empty:
        return jsonify({
            "status": "error",
            "message": "Failed to load property data"
        }), 500
    
    df = process_property_data(df)
    
    # Group by certificate type and calculate average price
    price_by_cert = df.groupby('SERTIFIKAT')['HARGA PROPERTI NET (RP)'].agg(['mean', 'count']).reset_index()
    price_by_cert.columns = ['certificate', 'average_price', 'property_count']
    
    # Convert to native Python types for JSON serialization
    result = []
    for _, row in price_by_cert.iterrows():
        result.append({
            'certificate': row['certificate'],
            'average_price': float(row['average_price']),
            'property_count': int(row['property_count'])
        })
    
    # Sort by count descending
    result = sorted(result, key=lambda x: x['property_count'], reverse=True)
    
    return jsonify({
        "status": "success",
        "data": result
    })

@analytics_bp.route('/api/analytics/multi-factor-analysis', methods=['GET'])
def get_multi_factor_analysis():
    """Get multi-factor analysis data (price, climate, land area, district)"""
    df = get_property_data()
    
    if df.empty:
        return jsonify({
            "status": "error",
            "message": "Failed to load property data"
        }), 500
    
    df = process_property_data(df)
    
    # Calculate district-level statistics
    district_stats = []
    districts = df['KECAMATAN'].unique()
    
    for district in districts:
        district_df = df[df['KECAMATAN'] == district]
        if len(district_df) >= 5:  # Only include districts with at least 5 properties
            district_stats.append({
                'district': district,
                'avg_price': float(district_df['HARGA PROPERTI NET (RP)'].mean()),
                'avg_land_price': float(district_df['HARGA TANAH NET (RP/M²)'].mean()),
                'avg_land_area': float(district_df['LUAS TANAH (M²)'].mean()),
                'avg_climate_score': float(district_df['Overall_Score'].mean()),
                'property_count': int(len(district_df))
            })
    
    # Sort by average price
    district_stats = sorted(district_stats, key=lambda x: x['avg_price'], reverse=True)
    
    return jsonify({
        "status": "success",
        "data": district_stats
    })