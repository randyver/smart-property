# SmartProperty WebGIS Application

SmartProperty is a WebGIS system designed to support sustainable urban planning by identifying climate-friendly property areas. The system leverages GIS-based property price analysis to provide insights into the economic value of an area and its environmental impact and sustainability.

## Features

- Interactive property map with climate risk layers
- Property search and filtering based on various criteria
- Climate risk assessment for properties
- Price trend analytics and visualization
- Property comparison tool
- Climate-safe property recommendations

## Tech Stack

### Backend
- Python 3.9
- Flask
- PostgreSQL
- TensorFlow & Scikit-learn for ML models
- GeoPandas for spatial data processing

### Frontend
- Next.js
- React
- TypeScript
- TailwindCSS
- Recharts for data visualization
- MapLibre GL for map rendering
- MAPID for base maps and GIS layers

## Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- Node.js 18+ (for local development)
- Python 3.9+ (for local development)
- MAPID API Key (sign up at [MAPID](https://mapid.io/))

## Installation

### Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/smart-property.git
   cd smart-property
   ```

2. Create a `.env` file in the root directory with your MAPID API key:
   ```
   MAPID_API_KEY=your_mapid_api_key_here
   ```

3. Start the application using Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Manual Installation (Development)

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows, use: venv\Scripts\activate
   ```

3. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with the necessary configuration:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=smartproperty
   DB_USER=postgres
   DB_PASSWORD=postgres
   MAPID_API_KEY=your_mapid_api_key_here
   DEBUG=True
   ```

5. Start the Flask development server:
   ```bash
   python run.py
   ```

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install the required packages:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with the necessary configuration:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_MAPID_API_KEY=your_mapid_api_key_here
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

5. The frontend will be available at http://localhost:3000

## API Endpoints

### Property API

- `GET /api/properties` - Get properties with optional filtering
- `GET /api/properties/:id` - Get details for a specific property
- `GET /api/properties/compare?ids=1,2,3` - Compare multiple properties
- `GET /api/properties/recommend` - Get property recommendations
- `POST /api/price/predict` - Predict property price

### Climate API

- `GET /api/climate/risk-layers` - Get available climate risk map layers

### Analytics API

- `GET /api/analytics/price-trends` - Get property price trends
- `GET /api/analytics/climate-risks` - Get climate risk analysis
- `GET /api/analytics/property-distribution` - Get property distribution statistics
- `GET /api/analytics/climate-impact` - Get climate impact analysis
- `GET /api/analytics/dashboard-summary` - Get summary for dashboard

## Project Structure

```
smart-property/
├── backend/               # Flask backend
│   ├── app/               # Application code
│   │   ├── __init__.py    # App initialization
│   │   ├── config.py      # Configuration
│   │   ├── models/        # Database models
│   │   └── services/      # Business logic
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── Dockerfile         # Docker configuration
│   ├── requirements.txt   # Python dependencies
│   └── run.py             # Application entry point
├── frontend/              # Next.js frontend
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── app/           # Next.js app directory
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   ├── .env.local         # Environment variables
│   └── package.json       # Node.js dependencies
├── docker-compose.yml     # Docker Compose configuration
└── README.md              # Documentation
```

## Database Setup

By default, the application uses PostgreSQL. The database will be automatically created when using Docker Compose. For manual setup:

1. Install PostgreSQL
2. Create a database named `smartproperty`
3. Update the `.env` file with your database credentials

## Testing the Connection

1. After starting both the backend and frontend, navigate to http://localhost:3000
2. Click on "Test Backend Connection" to verify that the backend is accessible
3. You should see a success message if the connection is established properly

## Troubleshooting

- If you encounter CORS issues, make sure your backend is running and accessible from the frontend
- Check that your MAPID API key is correctly set in the environment variables
- If the map doesn't load, verify that your MAPID API key has the necessary permissions
- For database connection issues, check the database credentials in your environment variables

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- MAPID for providing the WebGIS platform
- The development team: Randy Verdian, Hega Fauzia Avilah, Emery Fathan Zwageri, and Moch Kahfi Tri Agfria S.