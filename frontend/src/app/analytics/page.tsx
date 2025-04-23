"use client";

import { useState, useEffect } from "react";
import AnalyticsChart from "@/components/AnalyticsChart";
import { analyticsAPI } from "@/services/api";
import { formatter } from "@/utils/formatter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Footer from "@/components/Footer";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [priceByDistrict, setPriceByDistrict] = useState<any[]>([]);
  const [climateByDistrict, setClimateByDistrict] = useState<any[]>([]);
  const [bedroomDistribution, setBedroomDistribution] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any>(null);
  const [climateImpactData, setClimateImpactData] = useState<any[]>([]);
  const [activeClimateMetric, setActiveClimateMetric] =
    useState<string>("overall_score");
  const [activeTab, setActiveTab] = useState<string>("price");

  // Map for climate metric labels
  const climateMetricLabels: Record<string, string> = {
    overall_score: "Overall Climate Safety",
    lst_score: "Land Surface Temperature",
    ndvi_score: "Vegetation Index (NDVI)",
    utfvi_score: "Urban Thermal Index (UTFVI)",
    uhi_score: "Urban Heat Island (UHI)",
  };

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        // Fetch dashboard summary
        const summaryResponse = await analyticsAPI.getDashboardSummary();
        setSummaryData(summaryResponse.data);

        // Fetch prices by district
        const priceResponse = await analyticsAPI.getPriceByDistrict();
        setPriceByDistrict(priceResponse.data);

        // Fetch climate scores by district
        const climateResponse = await analyticsAPI.getClimateByDistrict();
        setClimateByDistrict(climateResponse.data);

        // Fetch property distribution
        const distributionResponse =
          await analyticsAPI.getPropertyDistribution();
        setDistributionData(distributionResponse.data);

        // Fetch bedroom distribution
        const bedroomResponse = await analyticsAPI.getBedroomDistribution();
        setBedroomDistribution(bedroomResponse.data);

        // Fetch climate impact
        const impactResponse = await analyticsAPI.getClimateImpact();
        setClimateImpactData(impactResponse.data);
      } catch (err) {
        setError("Failed to load analytics data. Please refresh the page.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Transform district data for climate metric chart
  const getClimateDataForChart = () => {
    if (!climateByDistrict || climateByDistrict.length === 0) return [];

    return climateByDistrict
      .filter(
        (district) =>
          district[activeClimateMetric] !== null &&
          !isNaN(district[activeClimateMetric])
      )
      .sort((a, b) => b[activeClimateMetric] - a[activeClimateMetric])
      .slice(0, 10) // Top 10 districts
      .map((district) => ({
        district: district.district,
        score: district[activeClimateMetric],
        count: district.property_count,
      }));
  };

  // Format property distribution data
  const getPriceDistributionData = () => {
    if (!distributionData) return [];
    return distributionData.price_distribution || [];
  };

  // Format property type distribution
  const getPropertyTypeData = () => {
    if (!distributionData) return [];
    return distributionData.property_type_distribution || [];
  };

  // Format climate impact data for selected factor
  const getClimateImpactData = (factorName: string) => {
    if (!climateImpactData || climateImpactData.length === 0) return [];

    const factor = climateImpactData.find((item) => item.factor === factorName);
    if (!factor || !factor.data) return [];

    return factor.data.map((item: any) => ({
      range: item.score_range,
      impact: item.price_impact_percentage,
      count: item.property_count,
    }));
  };

  // Get climate correlation data for different climate metrics
  const getClimateCorrelationData = () => {
    if (!climateImpactData || climateImpactData.length === 0) return [];

    const data: any[] = [];

    // Extract data for each climate factor
    climateImpactData.forEach((factor) => {
      if (factor.data && factor.data.length > 0) {
        factor.data.forEach((item: any) => {
          data.push({
            factor: factor.factor,
            range: item.score_range,
            impact: item.price_impact_percentage,
            count: item.property_count,
          });
        });
      }
    });

    return data;
  };

  return (
    <main className="h-screen flex flex-col mt-20">
      {/* Main content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Property Market Analytics
            </h2>
            <div className="text-sm text-gray-500">
              {summaryData && `Last updated: ${summaryData.last_updated}`}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-700 mb-6">
              <p>{error}</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-sm font-medium text-gray-500">
                    Total Properties
                  </h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {summaryData?.total_properties.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-sm font-medium text-gray-500">
                    Average Price
                  </h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {formatter.formatCurrency(summaryData?.average_price || 0)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-sm font-medium text-gray-500">
                    Climate Safe Properties
                  </h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {formatter.formatPercentage(
                      summaryData?.climate_safe_percentage || 0,
                      1
                    )}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-sm font-medium text-gray-500">
                    Avg Climate Score
                  </h3>
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${formatter.getClimateScoreColor(
                        summaryData?.avg_climate_scores?.overall
                      )}`}
                    ></div>
                    <p className="text-2xl font-bold text-gray-800">
                      {Math.round(
                        summaryData?.avg_climate_scores?.overall || 0
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <Tabs
                defaultValue="price"
                className="mb-6"
                onValueChange={setActiveTab}
              >
                <TabsList className="mb-4 bg-transparent border-b border-gray-200 w-full justify-start space-x-4 rounded-none p-0">
                  <TabsTrigger
                    value="price"
                    className="px-4 py-2 rounded-t-md data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
                  >
                    Price Analysis
                  </TabsTrigger>
                  <TabsTrigger
                    value="climate"
                    className="px-4 py-2 rounded-t-md data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
                  >
                    Climate Analysis
                  </TabsTrigger>
                  <TabsTrigger
                    value="property"
                    className="px-4 py-2 rounded-t-md data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
                  >
                    Property Types
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="price" className="mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {priceByDistrict.length > 0 && (
                      <AnalyticsChart
                        type="horizontalBar"
                        data={priceByDistrict.slice(0, 10)}
                        xKey="district"
                        yKey="average_price"
                        title="Average Property Price by District"
                        dataKey="Price"
                        height={400}
                        currency={true}
                        sorting="desc"
                      />
                    )}

                    {getPriceDistributionData().length > 0 && (
                      <AnalyticsChart
                        type="pie"
                        data={getPriceDistributionData()}
                        xKey="range"
                        yKey="count"
                        title="Property Price Distribution"
                        height={400}
                        colors={[
                          "#93C5FD",
                          "#60A5FA",
                          "#3B82F6",
                          "#2563EB",
                          "#1D4ED8",
                        ]}
                        showLabels={true}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {bedroomDistribution.length > 0 && (
                      <AnalyticsChart
                        type="bar"
                        data={bedroomDistribution}
                        xKey="bedrooms"
                        yKey="count"
                        title="Property Distribution by Bedrooms"
                        height={350}
                        colors={["#3B82F6"]}
                        dataKey="Properties"
                      />
                    )}

                    {getPropertyTypeData().length > 0 && (
                      <AnalyticsChart
                        type="pie"
                        data={getPropertyTypeData()}
                        xKey="type"
                        yKey="count"
                        title="Property Type Distribution"
                        height={350}
                        colors={[
                          "#10B981",
                          "#34D399",
                          "#6EE7B7",
                          "#A7F3D0",
                          "#D1FAE5",
                        ]}
                        showLabels={true}
                      />
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="climate" className="mt-0">
                  {/* Climate Score Selector */}
                  <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <h3 className="font-medium mb-2 text-black">
                      Climate Metric
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(climateMetricLabels).map(
                        ([key, label]) => (
                          <button
                            key={key}
                            onClick={() => setActiveClimateMetric(key)}
                            className={`px-3 py-1 text-sm rounded-md ${
                              activeClimateMetric === key
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            }`}
                          >
                            {label}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {getClimateDataForChart().length > 0 && (
                      <AnalyticsChart
                        type="horizontalBar"
                        data={getClimateDataForChart()}
                        xKey="district"
                        yKey="score"
                        title={`${climateMetricLabels[activeClimateMetric]} by District`}
                        height={400}
                        colors={["#10B981"]}
                        dataKey="Climate Score"
                      />
                    )}

                    {climateImpactData.length > 0 &&
                      activeClimateMetric === "overall_score" && (
                        <AnalyticsChart
                          type="bar"
                          data={getClimateImpactData("Overall Climate Score")}
                          xKey="range"
                          yKey="impact"
                          title="Impact of Climate Score on Property Price"
                          height={400}
                          percentage={true}
                          colors={["#3B82F6"]}
                          dataKey="Price Impact"
                        />
                      )}

                    {climateImpactData.length > 0 &&
                      activeClimateMetric === "lst_score" && (
                        <AnalyticsChart
                          type="bar"
                          data={getClimateImpactData("LST Score")}
                          xKey="range"
                          yKey="impact"
                          title="Impact of Land Surface Temperature on Property Price"
                          height={400}
                          percentage={true}
                          colors={["#EF4444"]}
                          dataKey="Price Impact"
                        />
                      )}

                    {climateImpactData.length > 0 &&
                      activeClimateMetric === "ndvi_score" && (
                        <AnalyticsChart
                          type="bar"
                          data={getClimateImpactData("NDVI Score")}
                          xKey="range"
                          yKey="impact"
                          title="Impact of Vegetation Index on Property Price"
                          height={400}
                          percentage={true}
                          colors={["#10B981"]}
                          dataKey="Price Impact"
                        />
                      )}

                    {climateImpactData.length > 0 &&
                      activeClimateMetric === "utfvi_score" && (
                        <AnalyticsChart
                          type="bar"
                          data={getClimateImpactData("UTFVI Score")}
                          xKey="range"
                          yKey="impact"
                          title="Impact of Urban Thermal Index on Property Price"
                          height={400}
                          percentage={true}
                          colors={["#F59E0B"]}
                          dataKey="Price Impact"
                        />
                      )}

                    {climateImpactData.length > 0 &&
                      activeClimateMetric === "uhi_score" && (
                        <AnalyticsChart
                          type="bar"
                          data={getClimateImpactData("UHI Score")}
                          xKey="range"
                          yKey="impact"
                          title="Impact of Urban Heat Island on Property Price"
                          height={400}
                          percentage={true}
                          colors={["#8B5CF6"]}
                          dataKey="Price Impact"
                        />
                      )}
                  </div>

                  {/* Climate analysis text */}
                  <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h3 className="text-lg font-bold mb-4 text-black">
                      Climate Impact Analysis
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Our analysis shows how climate factors affect property
                      values across different districts. Properties in areas
                      with better environmental quality and lower climate risks
                      consistently command higher prices and maintain better
                      value over time.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-black">
                      <div className="border p-4 rounded-md">
                        <h4 className="font-bold mb-2">Key Findings</h4>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                          <li>
                            Properties with high vegetation index (NDVI) show up
                            to 15% higher valuation
                          </li>
                          <li>
                            Areas with lower surface temperatures typically have
                            higher property values
                          </li>
                          <li>
                            Urban heat island effect correlates with reduced
                            property prices
                          </li>
                          <li>
                            Climate-safe properties maintain value better over
                            time
                          </li>
                        </ul>
                      </div>

                      <div className="border p-4 rounded-md">
                        <h4 className="font-bold mb-2">Recommendations</h4>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                          <li>
                            Prioritize districts with higher overall climate
                            scores
                          </li>
                          <li>
                            Consider properties with good vegetation coverage
                          </li>
                          <li>
                            Look for areas with effective urban cooling
                            strategies
                          </li>
                          <li>
                            Invest in climate-forward property improvements to
                            increase value
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="property" className="mt-0">
                  <div className="grid grid-cols-1 gap-6 mb-6">
                    {/* Average price per square meter by district */}
                    {priceByDistrict.length > 0 && (
                      <AnalyticsChart
                        type="horizontalBar"
                        data={priceByDistrict.slice(0, 10).map((district) => ({
                          ...district,
                          property_count: district.property_count || 0,
                        }))}
                        xKey="district"
                        yKey={["average_price", "property_count"]}
                        title="Price and Property Count by District"
                        height={400}
                        stacked={false}
                        dataKey="Value"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Distribution of climate scores */}
                    {summaryData && summaryData.avg_climate_scores && (
                      <div className="bg-white p-4 rounded-lg shadow-md text-black">
                        <h3 className="font-bold text-lg mb-4">
                          Average Climate Scores
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">
                                Land Surface Temperature
                              </span>
                              <span className="text-sm font-medium">
                                {Math.round(
                                  summaryData.avg_climate_scores.lst || 0
                                )}
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-500"
                                style={{
                                  width: `${summaryData.avg_climate_scores.lst}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">
                                Vegetation Index (NDVI)
                              </span>
                              <span className="text-sm font-medium">
                                {Math.round(
                                  summaryData.avg_climate_scores.ndvi || 0
                                )}
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500"
                                style={{
                                  width: `${summaryData.avg_climate_scores.ndvi}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">
                                Urban Thermal Index (UTFVI)
                              </span>
                              <span className="text-sm font-medium">
                                {Math.round(
                                  summaryData.avg_climate_scores.utfvi || 0
                                )}
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-500"
                                style={{
                                  width: `${summaryData.avg_climate_scores.utfvi}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">
                                Urban Heat Island (UHI)
                              </span>
                              <span className="text-sm font-medium">
                                {Math.round(
                                  summaryData.avg_climate_scores.uhi || 0
                                )}
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500"
                                style={{
                                  width: `${summaryData.avg_climate_scores.uhi}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium font-bold">
                                Overall Climate Score
                              </span>
                              <span className="text-sm font-medium font-bold">
                                {Math.round(
                                  summaryData.avg_climate_scores.overall || 0
                                )}
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600"
                                style={{
                                  width: `${summaryData.avg_climate_scores.overall}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Property characteristics summary */}
                    <div className="bg-white p-4 rounded-lg shadow-md text-black">
                      <h3 className="font-bold text-lg mb-4">
                        Property Market Overview
                      </h3>
                      <div className="space-y-4">
                        <p className="text-gray-700">
                          The Bandung property market shows significant
                          variation in prices across different districts, with
                          climate factors playing an important role in property
                          valuation.
                        </p>

                        <div className="border-t border-b py-4">
                          <h4 className="font-medium mb-2">Price Analysis</h4>
                          <ul className="space-y-2 text-gray-700">
                            <li className="flex justify-between">
                              <span>Price Range:</span>
                              <span className="font-medium">
                                {distributionData &&
                                  distributionData.price_distribution &&
                                  `${formatter.formatCurrency(
                                    distributionData.price_distribution[0].min
                                  )} - ${formatter.formatCurrency(
                                    distributionData.price_distribution[
                                      distributionData.price_distribution
                                        .length - 1
                                    ].max || 0
                                  )}`}
                              </span>
                            </li>
                            <li className="flex justify-between">
                              <span>Average Price:</span>
                              <span className="font-medium">
                                {formatter.formatCurrency(
                                  summaryData?.average_price || 0
                                )}
                              </span>
                            </li>
                            <li className="flex justify-between">
                              <span>Most Common Property Type:</span>
                              <span className="font-medium">
                                {getPropertyTypeData().length > 0 &&
                                  getPropertyTypeData().sort(
                                    (
                                      a: { count: number },
                                      b: { count: number }
                                    ) => b.count - a.count
                                  )[0].type}
                              </span>
                            </li>
                          </ul>
                        </div>

                        <p className="text-gray-700">
                          Properties with higher climate safety scores tend to
                          command premium prices, suggesting that environmental
                          factors are increasingly important in the Bandung real
                          estate market.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
      <Footer/>
    </main>
  );
}
