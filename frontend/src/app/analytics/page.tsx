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
  const [activeClimateMetric, setActiveClimateMetric] = useState<string>("overall_score");
  const [activeTab, setActiveTab] = useState<string>("price");

  // New state variables for the additional analytics data
  const [landPriceDistribution, setLandPriceDistribution] = useState<any[]>([]);
  const [certificateDistribution, setCertificateDistribution] = useState<any[]>([]);
  const [priceVsClimate, setPriceVsClimate] = useState<any[]>([]);
  const [priceVsLandPrice, setPriceVsLandPrice] = useState<any[]>([]);
  const [priceVsLandArea, setPriceVsLandArea] = useState<any[]>([]);
  const [landPriceVsClimate, setLandPriceVsClimate] = useState<any[]>([]);
  const [priceByCertificate, setPriceByCertificate] = useState<any[]>([]);
  const [multiFactorAnalysis, setMultiFactorAnalysis] = useState<any[]>([]);
  
  // Active subtabs for each main tab
  const [priceSubtab, setPriceSubtab] = useState<string>("distribution");
  const [relationshipSubtab, setRelationshipSubtab] = useState<string>("priceVsClimate");

  // Map for climate metric labels
  const climateMetricLabels: Record<string, string> = {
    overall_score: "Overall Climate Safety",
    lst_score: "Suhu Permukaan Tanah (LST)",
    ndvi_score: "Indeks Vegetasi (NDVI)",
    utfvi_score: "Indeks Variansi Termal Perkotaan (UTFVI)",
    uhi_score: "Pulau Panas Perkotaan (UHI)",
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
        const distributionResponse = await analyticsAPI.getPropertyDistribution();
        setDistributionData(distributionResponse.data);

        // Fetch bedroom distribution
        const bedroomResponse = await analyticsAPI.getBedroomDistribution();
        setBedroomDistribution(bedroomResponse.data);

        // Fetch climate impact
        const impactResponse = await analyticsAPI.getClimateImpact();
        setClimateImpactData(impactResponse.data);

        // NEW DATA FETCHES

        // Fetch land price distribution
        const landPriceResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analytics/land-price-distribution`);
        const landPriceData = await landPriceResponse.json();
        if (landPriceData.status === "success") {
          setLandPriceDistribution(landPriceData.data);
        }

        // Fetch certificate distribution
        const certificateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analytics/certificate-distribution`);
        const certificateData = await certificateResponse.json();
        if (certificateData.status === "success") {
          setCertificateDistribution(certificateData.data);
        }

        // Fetch price by certificate
        const priceByCertResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analytics/price-by-certificate`);
        const priceByCertData = await priceByCertResponse.json();
        if (priceByCertData.status === "success") {
          setPriceByCertificate(priceByCertData.data);
        }

        // Fetch price vs climate data
        const priceVsClimateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analytics/price-vs-climate`);
        const priceVsClimateData = await priceVsClimateResponse.json();
        if (priceVsClimateData.status === "success") {
          setPriceVsClimate(priceVsClimateData.data);
        }

        // Fetch price vs land price data
        const priceVsLandPriceResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analytics/price-vs-land-price`);
        const priceVsLandPriceData = await priceVsLandPriceResponse.json();
        if (priceVsLandPriceData.status === "success") {
          setPriceVsLandPrice(priceVsLandPriceData.data);
        }

        // Fetch price vs land area data
        const priceVsLandAreaResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analytics/price-vs-land-area`);
        const priceVsLandAreaData = await priceVsLandAreaResponse.json();
        if (priceVsLandAreaData.status === "success") {
          setPriceVsLandArea(priceVsLandAreaData.data);
        }

        // Fetch land price vs climate data
        const landPriceVsClimateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analytics/land-price-vs-climate`);
        const landPriceVsClimateData = await landPriceVsClimateResponse.json();
        if (landPriceVsClimateData.status === "success") {
          setLandPriceVsClimate(landPriceVsClimateData.data);
        }

        // Fetch multi-factor analysis data
        const multiFactorResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analytics/multi-factor-analysis`);
        const multiFactorData = await multiFactorResponse.json();
        if (multiFactorData.status === "success") {
          setMultiFactorAnalysis(multiFactorData.data);
        }

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

  // Format certificate distribution data
  const getCertificateDistributionData = () => {
    if (!certificateDistribution) return [];
    return certificateDistribution;
  };

  // Format price by certificate data
  const getPriceByCertificateData = () => {
    if (!priceByCertificate) return [];
    return priceByCertificate.map(item => ({
      certificate: item.certificate,
      average_price: item.average_price,
      property_count: item.property_count
    }));
  };

  // Format land price distribution data
  const getLandPriceDistributionData = () => {
    if (!landPriceDistribution) return [];
    return landPriceDistribution;
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

  // Format data for the relationship charts
  const formatScatterData = (data: any[], xKey: string, yKey: string) => {
    if (!data || data.length === 0) return [];
    
    // Only take a representative sample for scatter plots (max 100 points)
    const sampleSize = Math.min(data.length, 100);
    const step = Math.max(1, Math.floor(data.length / sampleSize));
    
    const sampleData = [];
    for (let i = 0; i < data.length; i += step) {
      if (data[i] && data[i][xKey] !== undefined && data[i][yKey] !== undefined) {
        sampleData.push({
          x: data[i][xKey],
          y: data[i][yKey],
          district: data[i].district || 'Unknown'
        });
      }
    }
    
    return sampleData;
  };

  // Format multi-factor analysis data
  const getMultiFactorData = () => {
    if (!multiFactorAnalysis || multiFactorAnalysis.length === 0) return [];
    
    return multiFactorAnalysis.map(item => ({
      district: item.district,
      avg_price: item.avg_price,
      avg_climate_score: item.avg_climate_score,
      avg_land_price: item.avg_land_price,
      avg_land_area: item.avg_land_area,
      property_count: item.property_count
    }));
  };

  return (
    <main className="h-screen flex flex-col mt-20">
      {/* Main content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Analisis Pasar Properti
            </h2>
            <div className="text-sm text-gray-500">
              {summaryData && `Terakhir diperbarui: ${summaryData.last_updated}`}
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
                    Total Properti
                  </h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {summaryData?.total_properties.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-sm font-medium text-gray-500">
                    Harga Rata-rata
                  </h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {formatter.formatCurrency(summaryData?.average_price || 0)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-sm font-medium text-gray-500">
                    Properti Ramah Iklim
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
                    Skor Iklim Rata-rata
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
                    Analisis Harga
                  </TabsTrigger>
                  <TabsTrigger
                    value="climate"
                    className="px-4 py-2 rounded-t-md data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
                  >
                    Analisis Iklim
                  </TabsTrigger>
                  <TabsTrigger
                    value="property"
                    className="px-4 py-2 rounded-t-md data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
                  >
                    Jenis Properti
                  </TabsTrigger>
                  <TabsTrigger
                    value="relationships"
                    className="px-4 py-2 rounded-t-md data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
                  >
                    Hubungan Variabel
                  </TabsTrigger>
                </TabsList>

                {/* PRICE ANALYSIS TAB */}
                <TabsContent value="price" className="mt-0">
                  {/* Sub-tabs for Price Analysis */}
                  <div className="mb-4 border-b border-gray-200">
                    <div className="flex space-x-4">
                      <button
                        className={`px-4 py-2 text-sm font-medium ${
                          priceSubtab === "distribution"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => setPriceSubtab("distribution")}
                      >
                        Distribusi Harga Properti
                      </button>
                      <button
                        className={`px-4 py-2 text-sm font-medium ${
                          priceSubtab === "landDistribution"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => setPriceSubtab("landDistribution")}
                      >
                        Distribusi Harga Tanah
                      </button>
                      <button
                        className={`px-4 py-2 text-sm font-medium ${
                          priceSubtab === "certificates"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => setPriceSubtab("certificates")}
                      >
                        Sertifikat
                      </button>
                    </div>
                  </div>

                  {/* Price Distribution Content */}
                  {priceSubtab === "distribution" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      {priceByDistrict.length > 0 && (
                        <AnalyticsChart
                          type="horizontalBar"
                          data={priceByDistrict.slice(0, 10)}
                          xKey="district"
                          yKey="average_price"
                          title="Harga Properti Rata-rata per Kecamatan"
                          dataKey="Harga"
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
                          title="Distribusi Harga Properti"
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
                  )}

                  {/* Land Price Distribution Content */}
                  {priceSubtab === "landDistribution" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      {getLandPriceDistributionData().length > 0 && (
                        <AnalyticsChart
                          type="pie"
                          data={getLandPriceDistributionData()}
                          xKey="range"
                          yKey="count"
                          title="Distribusi Harga Tanah per Meter Persegi"
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

                      {multiFactorAnalysis.length > 0 && (
                        <AnalyticsChart
                          type="horizontalBar"
                          data={multiFactorAnalysis.slice(0, 10)}
                          xKey="district"
                          yKey="avg_land_price"
                          title="Harga Tanah Rata-rata per Kecamatan"
                          dataKey="Harga/m²"
                          height={400}
                          currency={true}
                          sorting="desc"
                        />
                      )}
                    </div>
                  )}

                  {/* Certificate Analysis Content */}
                  {priceSubtab === "certificates" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      {getCertificateDistributionData().length > 0 && (
                        <AnalyticsChart
                          type="pie"
                          data={getCertificateDistributionData()}
                          xKey="certificate"
                          yKey="count"
                          title="Distribusi Jenis Sertifikat"
                          height={400}
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

                      {getPriceByCertificateData().length > 0 && (
                        <AnalyticsChart
                          type="bar"
                          data={getPriceByCertificateData()}
                          xKey="certificate"
                          yKey="average_price"
                          title="Harga Rata-rata Berdasarkan Jenis Sertifikat"
                          height={400}
                          currency={true}
                          colors={["#10B981"]}
                          dataKey="Harga Rata-rata"
                        />
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {bedroomDistribution.length > 0 && (
                      <AnalyticsChart
                        type="bar"
                        data={bedroomDistribution}
                        xKey="bedrooms"
                        yKey="count"
                        title="Distribusi Properti Berdasarkan Jumlah Kamar Tidur"
                        height={350}
                        colors={["#3B82F6"]}
                        dataKey="Jumlah Properti"
                      />
                    )}

                    {getPropertyTypeData().length > 0 && (
                      <AnalyticsChart
                        type="pie"
                        data={getPropertyTypeData()}
                        xKey="type"
                        yKey="count"
                        title="Distribusi Tipe Properti"
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

                {/* CLIMATE ANALYSIS TAB */}
                <TabsContent value="climate" className="mt-0">
                  {/* Climate Score Selector */}
                  <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <h3 className="font-medium mb-2 text-black">
                      Metrik Iklim
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
                        title={`${climateMetricLabels[activeClimateMetric]} per Kecamatan`}
                        height={400}
                        colors={["#10B981"]}
                        dataKey="Skor Iklim"
                      />
                    )}

                    {climateImpactData.length > 0 &&
                      activeClimateMetric === "overall_score" && (
                        <AnalyticsChart
                          type="bar"
                          data={getClimateImpactData("Overall Climate Score")}
                          xKey="range"
                          yKey="impact"
                          title="Dampak Skor Iklim terhadap Harga Properti"
                          height={400}
                          percentage={true}
                          colors={["#3B82F6"]}
                          dataKey="Dampak ke Harga"
                        />
                      )}

                    {climateImpactData.length > 0 &&
                      activeClimateMetric === "lst_score" && (
                        <AnalyticsChart
                          type="bar"
                          data={getClimateImpactData("LST Score")}
                          xKey="range"
                          yKey="impact"
                          title="Dampak Suhu Permukaan Tanah terhadap Harga Properti"
                          height={400}
                          percentage={true}
                          colors={["#EF4444"]}
                          dataKey="Dampak ke Harga"
                        />
                      )}

                    {climateImpactData.length > 0 &&
                      activeClimateMetric === "ndvi_score" && (
                        <AnalyticsChart
                          type="bar"
                          data={getClimateImpactData("NDVI Score")}
                          xKey="range"
                          yKey="impact"
                          title="Dampak Indeks Vegetasi terhadap Harga Properti"
                          height={400}
                          percentage={true}
                          colors={["#10B981"]}
                          dataKey="Dampak ke Harga"
                        />
                      )}

                    {climateImpactData.length > 0 &&
                      activeClimateMetric === "utfvi_score" && (
                        <AnalyticsChart
                          type="bar"
                          data={getClimateImpactData("UTFVI Score")}
                          xKey="range"
                          yKey="impact"
                          title="Dampak Indeks Termal Perkotaan terhadap Harga Properti"
                          height={400}
                          percentage={true}
                          colors={["#F59E0B"]}
                          dataKey="Dampak ke Harga"
                        />
                      )}

                    {climateImpactData.length > 0 &&
                      activeClimateMetric === "uhi_score" && (
                        <AnalyticsChart
                          type="bar"
                          data={getClimateImpactData("UHI Score")}
                          xKey="range"
                          yKey="impact"
                          title="Dampak Urban Heat Island terhadap Harga Properti"
                          height={400}
                          percentage={true}
                          colors={["#8B5CF6"]}
                          dataKey="Dampak ke Harga"
                        />
                      )}
                  </div>

                  {/* Climate analysis text */}
                  <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h3 className="text-lg font-bold mb-4 text-black">
                      Analisis Dampak Iklim
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Analisis kami menunjukkan bagaimana faktor iklim
                      mempengaruhi nilai properti di berbagai distrik. Properti
                      di daerah dengan kualitas lingkungan yang lebih baik dan
                      risiko iklim yang lebih rendah secara konsisten memiliki
                      harga yang lebih tinggi dan mempertahankan nilai yang
                      lebih baik dari waktu ke waktu.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-black">
                      <div className="border p-4 rounded-md">
                        <h4 className="font-bold mb-2">Temuan Utama</h4>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                          <li>
                            Properti dengan indeks vegetasi tinggi (NDVI)
                            menunjukkan valuasi hingga 15% lebih tinggi
                          </li>
                          <li>
                            Daerah dengan suhu permukaan lebih rendah umumnya
                            memiliki nilai properti yang lebih tinggi
                          </li>
                          <li>
                            Efek pulau panas perkotaan berhubungan dengan
                            penurunan harga properti
                          </li>
                          <li>
                            Properti yang aman terhadap iklim mempertahankan
                            nilai lebih baik dari waktu ke waktu
                          </li>
                        </ul>
                      </div>

                      <div className="border p-4 rounded-md">
                        <h4 className="font-bold mb-2">Rekomendasi</h4>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                          <li>
                            Prioritaskan distrik dengan skor iklim keseluruhan
                            yang lebih tinggi
                          </li>
                          <li>
                            Pertimbangkan properti dengan cakupan vegetasi yang
                            baik
                          </li>
                          <li>
                            Cari daerah dengan strategi pendinginan perkotaan
                            yang efektif
                          </li>
                          <li>
                            Investasikan dalam perbaikan properti yang mendukung
                            iklim untuk meningkatkan nilai
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
                        title="Harga dan Jumlah Properti per Kecamatan"
                        height={400}
                        stacked={false}
                        dataKey="Nilai"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Distribution of climate scores */}
                    {summaryData && summaryData.avg_climate_scores && (
                      <div className="bg-white p-4 rounded-lg shadow-md text-black">
                        <h3 className="font-bold text-lg mb-4">
                          Rata-rata Skor Iklim
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">
                                Suhu Permukaan Tanah (LST)
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
                                Indeks Vegetasi (NDVI)
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
                                Indeks Termal Perkotaan (UTFVI)
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
                                Pulau Panas Perkotaan (UHI)
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
                                Skor Iklim Keseluruhan
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
                        Ikhtisar Pasar Properti
                      </h3>
                      <div className="space-y-4">
                        <p className="text-gray-700">
                          Pasar properti di Bandung menunjukkan variasi harga
                          yang signifikan di berbagai distrik, dengan faktor
                          iklim yang memainkan peran penting dalam penilaian
                          properti.
                        </p>

                        <div className="border-t border-b py-4">
                          <h4 className="font-medium mb-2">Analisis Harga</h4>
                          <ul className="space-y-2 text-gray-700">
                            <li className="flex justify-between">
                              <span>Harga Rata-rata:</span>
                              <span className="font-medium">
                                {formatter.formatCurrency(
                                  summaryData?.average_price || 0
                                )}
                              </span>
                            </li>
                            <li className="flex justify-between">
                              <span>Jenis Properti Paling Umum:</span>
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
                          Properti dengan skor keselamatan iklim yang lebih
                          tinggi cenderung mematok harga premium, yang
                          menunjukkan bahwa faktor lingkungan semakin penting
                          dalam pasar real estat di Bandung.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* RELATIONSHIPS TAB */}
                <TabsContent value="relationships" className="mt-0">
                  {/* Sub-tabs for Relationship Analysis */}
                  <div className="mb-4 border-b border-gray-200">
                    <div className="flex space-x-4 overflow-x-auto pb-1">
                      <button
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                          relationshipSubtab === "priceVsClimate"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => setRelationshipSubtab("priceVsClimate")}
                      >
                        Harga vs Skor Iklim
                      </button>
                      <button
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                          relationshipSubtab === "priceVsLandPrice"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => setRelationshipSubtab("priceVsLandPrice")}
                      >
                        Harga Properti vs Harga Tanah
                      </button>
                      <button
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                          relationshipSubtab === "priceVsLandArea"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => setRelationshipSubtab("priceVsLandArea")}
                      >
                        Harga vs Luas Tanah
                      </button>
                      <button
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                          relationshipSubtab === "landPriceVsClimate"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => setRelationshipSubtab("landPriceVsClimate")}
                      >
                        Harga Tanah vs Skor Iklim
                      </button>
                      <button
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                          relationshipSubtab === "multiFactorAnalysis"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => setRelationshipSubtab("multiFactorAnalysis")}
                      >
                        Analisis Multi-Faktor
                      </button>
                    </div>
                  </div>

                  {/* Price vs Climate */}
                  {relationshipSubtab === "priceVsClimate" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {priceVsClimate.length > 0 && (
                        <div className="bg-white p-4 rounded-lg shadow-md col-span-2 py-12">
                          <h3 className="font-bold text-lg mb-4 text-gray-800">
                            Hubungan Harga Properti dengan Skor Iklim
                          </h3>
                          <div className="h-80">
                            <AnalyticsChart
                              type="line"
                              data={formatScatterData(priceVsClimate, "climate_score", "price")}
                              xKey="x"
                              yKey="y"
                              title=""
                              dataKey="Harga"
                              height={300}
                              currency={true}
                              colors={["#3B82F6"]}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Price vs Land Price */}
                  {relationshipSubtab === "priceVsLandPrice" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {priceVsLandPrice.length > 0 && (
                        <div className="bg-white p-4 rounded-lg shadow-md col-span-2 py-12">
                          <h3 className="font-bold text-lg mb-4 text-gray-800">
                            Hubungan Harga Properti dengan Harga Tanah
                          </h3>
                          <div className="h-80">
                            <AnalyticsChart
                              type="line"
                              data={formatScatterData(priceVsLandPrice, "land_price", "property_price")}
                              xKey="x"
                              yKey="y"
                              title=""
                              dataKey="Harga Properti"
                              height={300}
                              currency={true}
                              colors={["#10B981"]}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Price vs Land Area */}
                  {relationshipSubtab === "priceVsLandArea" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {priceVsLandArea.length > 0 && (
                        <div className="bg-white p-4 rounded-lg shadow-md col-span-2 py-12">
                          <h3 className="font-bold text-lg mb-4 text-gray-800">
                            Hubungan Harga Properti dengan Luas Tanah
                          </h3>
                          <div className="h-80">
                            <AnalyticsChart
                              type="line"
                              data={formatScatterData(priceVsLandArea, "land_area", "property_price")}
                              xKey="x"
                              yKey="y"
                              title=""
                              dataKey="Harga Properti"
                              height={300}
                              currency={true}
                              colors={["#F59E0B"]}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Land Price vs Climate */}
                  {relationshipSubtab === "landPriceVsClimate" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {landPriceVsClimate.length > 0 && (
                        <div className="bg-white p-4 rounded-lg shadow-md col-span-2 py-12">
                          <h3 className="font-bold text-lg mb-4 text-gray-800">
                            Hubungan Harga Tanah dengan Skor Iklim
                          </h3>
                          <div className="h-80">
                            <AnalyticsChart
                              type="line"
                              data={formatScatterData(landPriceVsClimate, "climate_score", "land_price")}
                              xKey="x"
                              yKey="y"
                              title=""
                              dataKey="Harga Tanah/m²"
                              height={300}
                              currency={true}
                              colors={["#8B5CF6"]}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Multi-Factor Analysis */}
                  {relationshipSubtab === "multiFactorAnalysis" && (
                    <div className="grid grid-cols-1 gap-6 mb-6">
                      {multiFactorAnalysis.length > 0 && (
                        <div className="bg-white p-4 rounded-lg shadow-md">
                          <h3 className="font-bold text-lg mb-4 text-gray-800">
                            Analisis Multi-Faktor Berdasarkan Kecamatan
                          </h3>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Kecamatan
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Harga Rata-rata
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Harga Tanah/m²
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Luas Tanah Rata-rata
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Skor Iklim
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Jumlah Properti
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {multiFactorAnalysis
                                  .sort((a, b) => b.avg_price - a.avg_price)
                                  .slice(0, 10)
                                  .map((item, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {item.district}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatter.formatCurrency(item.avg_price)}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatter.formatCurrency(item.avg_land_price)}/m²
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {Math.round(item.avg_land_area)} m²
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center">
                                          <div
                                            className={`w-2 h-2 rounded-full ${formatter.getClimateScoreColor(
                                              item.avg_climate_score
                                            )} mr-2`}
                                          ></div>
                                          <span>{Math.round(item.avg_climate_score)}</span>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.property_count}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="mt-4 text-gray-700">
                            <p>
                              Tabel ini menyajikan analisis komprehensif dari berbagai faktor yang memengaruhi pasar properti di tiap kecamatan.
                              Anda dapat melihat bagaimana harga properti, harga tanah, skor iklim, dan luas tanah bervariasi di berbagai wilayah.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    <Footer />
    </main>
  );
}