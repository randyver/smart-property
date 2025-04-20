'use client';

import { useState, useEffect } from 'react';
import AnalyticsChart from '@/components/AnalyticsChart';
import { analyticsAPI } from '@/services/api';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [priceData, setPriceData] = useState<any[]>([]);
  const [riskData, setRiskData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any>(null);
  const [impactData, setImpactData] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(undefined);
  
  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard summary
        const summaryResponse = await analyticsAPI.getDashboardSummary();
        setSummaryData(summaryResponse.data);
        
        // Fetch price trends
        const priceResponse = await analyticsAPI.getPriceTrends(selectedRegion);
        setPriceData(priceResponse.data);
        
        // Fetch climate risks
        const riskResponse = await analyticsAPI.getClimateRisks();
        setRiskData(riskResponse.data);
        
        // Fetch property distribution
        const distributionResponse = await analyticsAPI.getPropertyDistribution();
        setDistributionData(distributionResponse.data);
        
        // Fetch climate impact
        const impactResponse = await analyticsAPI.getClimateImpact();
        setImpactData(impactResponse.data);
        
      } catch (err) {
        setError('Failed to load analytics data. Please refresh the page.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [selectedRegion]);
  
  // Format price trend data for chart
  const formatPriceData = () => {
    if (!priceData || priceData.length === 0) return [];
    
    // If region is selected, filter for that region
    const regionData = selectedRegion
      ? priceData.find(item => item.region === selectedRegion)
      : priceData[0]; // Default to first region
      
    if (!regionData) return [];
    
    return regionData.data.map((item: any) => ({
      month: item.month,
      price: item.price / 1000000 // Convert to millions for display
    }));
  };
  
  // Format climate risk data for radar chart
  const formatRiskData = () => {
    if (!riskData || riskData.length === 0) return [];
    
    return riskData.map(item => ({
      region: item.region,
      score: item.overall_score
    }));
  };
  
  // Format property distribution data
  const formatDistributionData = () => {
    if (!distributionData) return [];
    return distributionData.price_distribution || [];
  };
  
  // Format property type distribution
  const formatPropertyTypeData = () => {
    if (!distributionData) return [];
    return distributionData.property_type_distribution || [];
  };
  
  // Format climate impact data
  const formatImpactData = () => {
    if (!impactData || impactData.length === 0) return [];
    
    return impactData.map(item => ({
      factor: item.factor,
      impact: item.impact_percentage
    }));
  };
  
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-4 py-2">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-700">SmartProperty</h1>
          <nav className="flex space-x-4">
            <a href="/" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Map</a>
            <a href="/analytics" className="px-3 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">Analytics</a>
            <a href="/recommendation" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Recommendations</a>
          </nav>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Property Market Analytics</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <p>Loading analytics data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-700 mb-6">
              <p>{error}</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">Total Properties</h3>
                  <p className="text-2xl font-bold">{summaryData?.total_properties.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">Average Price</h3>
                  <p className="text-2xl font-bold">Rp {(summaryData?.average_price / 1000000000).toFixed(1)} B</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">Climate Safe Properties</h3>
                  <p className="text-2xl font-bold">{summaryData?.climate_safe_percentage}%</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">Annual Price Trend</h3>
                  <p className={`text-2xl font-bold ${summaryData?.price_trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {summaryData?.price_trend >= 0 ? '+' : ''}{summaryData?.price_trend.toFixed(1)}%
                  </p>
                </div>
              </div>
              
              {/* Region Selector */}
              <div className="mb-6 bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium mb-2">Select Region</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedRegion(undefined)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      !selectedRegion ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    All Regions
                  </button>
                  {priceData.map(item => (
                    <button
                      key={item.region}
                      onClick={() => setSelectedRegion(item.region)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        selectedRegion === item.region ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {item.region}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <AnalyticsChart
                  type="line"
                  data={formatPriceData()}
                  xKey="month"
                  yKey="price"
                  title={`Property Price Trends ${selectedRegion ? `- ${selectedRegion}` : ''}`}
                  dataKey="Price (millions IDR)"
                  height={300}
                />
                
                <AnalyticsChart
                  type="bar"
                  data={formatRiskData()}
                  xKey="region"
                  yKey="score"
                  title="Climate Safety Score by Region"
                  dataKey="Safety Score"
                  height={300}
                  colors={['#3b82f6']}
                />
              </div>
              
              {/* Charts Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <AnalyticsChart
                  type="pie"
                  data={formatDistributionData()}
                  xKey="range"
                  yKey="count"
                  title="Property Price Distribution"
                  height={300}
                  colors={['#38bdf8', '#60a5fa', '#818cf8', '#a78bfa', '#c084fc']}
                />
                
                <AnalyticsChart
                  type="pie"
                  data={formatPropertyTypeData()}
                  xKey="type"
                  yKey="count"
                  title="Property Type Distribution"
                  height={300}
                  colors={['#4ade80', '#34d399', '#2dd4bf', '#22d3ee', '#38bdf8']}
                />
              </div>
              
              {/* Charts Row 3 */}
              <div className="mb-6">
                <AnalyticsChart
                  type="bar"
                  data={formatImpactData()}
                  xKey="factor"
                  yKey="impact"
                  title="Climate Factor Impact on Property Prices (%)"
                  height={300}
                  colors={['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#22d3ee']}
                />
              </div>
              
              {/* Additional climate analysis section */}
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h3 className="text-lg font-bold mb-4">Climate Impact Analysis</h3>
                <p className="text-gray-700 mb-4">
                  Our analysis shows how climate factors affect property values across different regions.
                  Properties in areas with better environmental quality and lower climate risks consistently
                  command higher prices and maintain better value over time.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="border p-4 rounded-md">
                    <h4 className="font-bold mb-2">Key Findings</h4>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>Properties in flood-prone areas show up to 30% lower valuation</li>
                      <li>Proximity to green spaces increases property value by 10-25%</li>
                      <li>Poor air quality correlates with 5-20% price reduction</li>
                      <li>Urban heat islands reduce property value by 5-15%</li>
                    </ul>
                  </div>
                  
                  <div className="border p-4 rounded-md">
                    <h4 className="font-bold mb-2">Recommendations</h4>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>Prioritize investments in South Jakarta for climate-safe properties</li>
                      <li>Focus development on areas with existing green infrastructure</li>
                      <li>Implement climate adaptation measures in East Jakarta to increase property values</li>
                      <li>Consider climate-forward renovations to increase property resilience</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Last updated info */}
              <div className="text-right text-sm text-gray-500">
                Last updated: {summaryData?.last_updated}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}