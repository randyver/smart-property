"use client";

import { useState, useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Footer from "@/components/Footer";
import { developerAPI, climateAPI } from "@/services/api";
import DeveloperForm from "@/components/DeveloperForm";
import ClimateScorePanel from "@/components/ClimateScorePanel";
import PredictionResultPanel from "@/components/PredictionResultPanel";

export default function DeveloperPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const resultsPanelRef = useRef<HTMLDivElement>(null);

  // Lokasi yang dipilih
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);

  // Skor iklim
  const [climateScores, setClimateScores] = useState<{
    lst_score: number | null;
    ndvi_score: number | null;
    utfvi_score: number | null;
    uhi_score: number | null;
    overall_score: number | null;
  } | null>(null);

  // Loading state untuk skor iklim
  const [loadingClimateScores, setLoadingClimateScores] = useState(false);

  // Hasil prediksi harga
  const [prediction, setPrediction] = useState<number | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  // State untuk menyimpan faktor prediksi
  const [predictionFactors, setPredictionFactors] = useState<{
    basePrice: number;
    certificateImpact: number;
    propertyTypeImpact: number;
    bedroomsImpact: number;
    climateImpact: number;
  } | null>(null);

  // Ambil MAPID API key dari environment
  const MAPID_API_KEY = "68045407ce3f3583122422c9";

  // Inisialisasi peta
  useEffect(() => {
    if (mapInstance.current || !mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://basemap.mapid.io/styles/basic/style.json?key=${MAPID_API_KEY}`,
      center: [107.6096, -6.9147], // Default ke Bandung
      zoom: 12,
    });

    map.on("load", () => {
      setMapLoaded(true);
      console.log("Map style fully loaded");
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    
    // Tambahkan handler klik ke peta
    map.on("click", async (e) => {
      const { lng, lat } = e.lngLat;
      console.log(`Clicked at: ${lng}, ${lat}`);

      // Hapus marker yang ada jika ada
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Buat marker baru di lokasi yang diklik
      const marker = new maplibregl.Marker({ color: "#3B82F6" })
        .setLngLat([lng, lat])
        .addTo(map);
      
      markerRef.current = marker;

      // Tetapkan lokasi yang dipilih
      setSelectedLocation({
        latitude: lat,
        longitude: lng,
      });

      // Dapatkan skor iklim untuk lokasi yang dipilih
      await getClimateScores(lat, lng);

      // Reset prediksi
      setPrediction(null);
      setPredictionError(null);
    });

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [MAPID_API_KEY]);

  // Dapatkan skor iklim untuk lokasi dari API backend
  const getClimateScores = async (lat: number, lng: number) => {
    try {
      setLoadingClimateScores(true);
      setClimateScores(null);

      // Panggil API untuk mendapatkan skor iklim yang sebenarnya
      const response = await climateAPI.getLocationScores(lat, lng);
      console.log("Climate scores response:", response);
      
      // Periksa apakah kita mendapatkan respons yang valid
      if (response.status === "success" && response.data) {
        setClimateScores(response.data);
      } else {
        throw new Error("Respons tidak valid dari API iklim");
      }
    } catch (error) {
      console.error("Error fetching climate scores:", error);
      
      // Tetapkan skor default jika API gagal
      setClimateScores({
        lst_score: 70,
        ndvi_score: 65,
        utfvi_score: 75,
        uhi_score: 68,
        overall_score: 70
      });
      
      // Tampilkan pesan kesalahan kepada pengguna
      setPredictionError("Tidak dapat mengambil data iklim untuk lokasi ini. Menggunakan nilai default sebagai gantinya.");
    } finally {
      setLoadingClimateScores(false);
    }
  };

  // Tangani pengiriman formulir
  const handlePredictPrice = async (formData: {
    bedrooms: string;
    landArea: string;
    certificate: string;
    propertyType: string;
    landPricePerMeter: string;
  }) => {
    if (!selectedLocation) {
      setPredictionError("Silakan pilih lokasi di peta terlebih dahulu");
      return;
    }

    // Validasi formulir
    if (!formData.bedrooms || !formData.landArea || !formData.certificate || 
        !formData.propertyType || !formData.landPricePerMeter) {
      setPredictionError("Harap isi semua kolom");
      return;
    }

    setIsPredicting(true);
    setPredictionError(null);

    try {
      // Konversi climateScores dari objek yang mungkin null ke tipe Record
      const climateScoresRecord = climateScores ? 
        {...climateScores} as Record<string, number | null> : 
        undefined;

      // Panggil API sebenarnya untuk prediksi harga
      const response = await developerAPI.predictPrice({
        location: selectedLocation,
        bedrooms: parseInt(formData.bedrooms),
        landArea: parseFloat(formData.landArea),
        certificate: formData.certificate,
        propertyType: formData.propertyType,
        landPricePerMeter: parseFloat(formData.landPricePerMeter),
        climateScores: climateScoresRecord
      });
      
      if (response.status === "success") {
        // Tetapkan harga yang diprediksi
        setPrediction(response.predicted_price);
        
        // Simpan faktor prediksi untuk ditampilkan
        setPredictionFactors({
          basePrice: response.factors.basePrice || 0,
          certificateImpact: response.factors.certificateImpact || 0,
          propertyTypeImpact: response.factors.propertyTypeImpact || 0,
          bedroomsImpact: response.factors.bedroomsImpact || 0,
          climateImpact: response.factors.climateImpact || 0
        });

        // Scroll ke hasil prediksi
        setTimeout(() => {
          if (resultsPanelRef.current) {
            resultsPanelRef.current.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 100);
      } else {
        throw new Error("Gagal memprediksi harga: " + (response.message || "Kesalahan tidak diketahui"));
      }
    } catch (error) {
      console.error("Error predicting price:", error);
      setPredictionError("Gagal memprediksi harga. Silakan coba lagi.");
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <main className="pt-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Pengembangan Properti</h1>
        <p className="text-gray-600 mb-8">
          Sistem ini membantu pengembang dan investor properti memperkirakan harga properti berdasarkan data lokasi dan skor iklim.
          Klik pada peta untuk memilih lokasi bangunan, masukkan detail properti, dan dapatkan prediksi harga serta rekomendasi pengembangan oleh AI.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kontainer Peta */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div ref={mapContainer} className="h-[420px]" />
            </div>
            
            {/* Placeholder message when no prediction yet */}
            {!prediction && !predictionFactors && (
              <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                <p className="text-blue-800 font-medium">Hasil prediksi harga properti akan ditampilkan di sini setelah Anda mengisi form.</p>
                <p className="text-blue-600 text-sm mt-1">Pastikan untuk memilih lokasi di peta dan mengisi semua detail properti.</p>
              </div>
            )}
            
            {/* Panel Hasil Prediksi di bawah peta */}
            {prediction !== null && predictionFactors !== null && (
              <div ref={resultsPanelRef} className="mt-4">
                <PredictionResultPanel 
                  prediction={prediction} 
                  predictionFactors={predictionFactors} 
                />
              </div>
            )}
          </div>

          {/* Formulir Input */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {selectedLocation ? (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Detail Lokasi</h2>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Koordinat:</p>
                  <p className="font-medium">
                    Lat: {selectedLocation.latitude.toFixed(6)}, Lng: {selectedLocation.longitude.toFixed(6)}
                  </p>
                </div>

                {/* Analisis Iklim */}
                <ClimateScorePanel 
                  climateScores={climateScores} 
                  isLoading={loadingClimateScores} 
                />

                {/* Formulir Developer */}
                <DeveloperForm 
                  onSubmit={handlePredictPrice}
                  isLoading={isPredicting}
                  error={predictionError}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <div className="bg-blue-50 p-6 rounded-full mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Pilih Lokasi Bangunan</h3>
                <p className="text-gray-600 text-center mb-3">
                  Klik di mana saja pada peta untuk memilih lokasi untuk properti yang diusulkan.
                </p>
                <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                  <p className="text-sm text-yellow-700">
                    Sistem akan secara otomatis menganalisis data iklim untuk lokasi yang dipilih, termasuk Suhu Permukaan Tanah, Indeks Vegetasi, efek Pulau Panas Perkotaan, dan Tekanan Panas.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}