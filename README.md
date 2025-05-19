# SmartProperty - Climate-Safe Property Analytics Platform

SmartProperty is an innovative property analytics platform that helps users find climate-safe properties through advanced GIS analysis. By evaluating properties based on climate risk parameters such as Land Surface Temperature (LST), Vegetation Index (NDVI), Urban Heat Island (UHI), and Urban Thermal Field Variance (UTFVI), SmartProperty enables homebuyers and developers to make informed decisions about real estate investments in the face of climate change.

This application was developed by Team El Nino La Nina for the MAPID Web GIS Competition 2025.

## Key Features

- **Interactive Climate Map**: Explore properties with various climate risk overlays for comprehensive spatial analysis.
- **Property Comparison**: Compare multiple properties side-by-side based on climate risk factors.
- **Climate Analytics Dashboard**: Visualize property market trends and climate impacts across different districts.
- **Developer Tools**: Predict property prices based on climate factors and location data.
- **Climate Builder Game**: Learn about climate-resilient development through an interactive simulation.
- **AI Assistant**: Get personalized recommendations and answers about climate-safe properties.

## Technical Stack

### Frontend
- Next.js 14 (React framework)
- Tailwind CSS for styling
- MapLibre GL JS for interactive maps
- Recharts for data visualization
- Framer Motion for animations

### Backend
- Flask (Python web framework)
- PostgreSQL database for property and climate data
- GeoJSON for spatial data
- XGBoost for price prediction models
- Pandas for data processing and analytics

## Climate Parameters Explained

SmartProperty evaluates properties using the following climate parameters:

- **LST (Land Surface Temperature)**: Measures ground temperature, with lower scores indicating hotter areas that may require more cooling and energy.
- **NDVI (Normalized Difference Vegetation Index)**: Measures vegetation coverage, with higher scores indicating greener areas that provide natural cooling and better air quality.
- **UTFVI (Urban Thermal Field Variance Index)**: Measures temperature fluctuations in urban areas, identifying heat pockets and thermal comfort.
- **UHI (Urban Heat Island)**: Measures how much warmer an area is compared to surrounding rural areas due to urban development.
- **Overall Climate Score**: A composite score (0-100) that evaluates a property's overall climate safety, with higher scores indicating better climate resilience.

## Use Cases

- Homebuyers can find properties with lower climate risks for long-term value retention.
- Developers can identify optimal areas for climate-resilient construction.
- Researchers can analyze climate impact on property values across different districts.
- Urban planners can use data to guide climate-adaptive urban development.
- Property investors can make informed decisions based on climate risk assessment.

## Project Structure

- `/frontend`: Next.js application with user interface components.
- `/backend`: Flask application with API endpoints and data processing.
- `/data`: Climate and property datasets (GeoJSON, CSV).

## Team Members

- Emery Fathan Zwageri (Institut Teknologi Bandung) - AI Engineer
- Randy Verdian (Institut Teknologi Bandung) - Fullstack Developer
- Hega Fauzia Avilah (Universitas Indonesia) - Spatial Data Analyst
- Moch Kahfi Tri Agfria S. (Universitas Indonesia) - Spatial Data Analyst

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- Python (v3.8 or higher)
- PostgreSQL (v14.0 or higher)

### Installation

1. Clone the repository

    ```bash
    git clone https://github.com/your-username/smartproperty.git
    cd smartproperty
    ```

2. Set up the frontend

    ```bash
    cd frontend
    npm install
    npm run dev
    ```

3. Set up the backend

    ```bash
    cd backend
    pip install -r requirements.txt
    python run.py
    ```

4. Create a `.env` file in the root directory with the following variables:

    ```
    NEXT_PUBLIC_API_URL=http://localhost:5000
    MAPID_API_KEY=your_mapid_api_key
    ```

## Running the Application

- **Frontend**: `npm run dev` (from the `frontend` directory).
- **Backend**: `python run.py` (from the `backend` directory).

## License

© 2025 SmartProperty Team. All rights reserved.