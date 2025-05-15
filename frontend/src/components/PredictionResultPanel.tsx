"use client";

import { AlertTriangle, Building, Ruler, CheckCircle2 } from "lucide-react";

interface PredictionResultPanelProps {
  prediction: number;
  predictionFactors: {
    basePrice: number;
    certificateImpact: number;
    propertyTypeImpact: number;
    bedroomsImpact: number;
    climateImpact: number;
  };
}

export default function PredictionResultPanel({ prediction, predictionFactors }: PredictionResultPanelProps) {
  // Format harga untuk tampilan
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Hasil Prediksi Harga Properti</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel Hasil Harga */}
        <div className="bg-green-50 p-6 border border-green-200 rounded-lg">
          <h3 className="font-bold text-xl text-gray-800 mb-3">Estimasi Harga Properti</h3>
          <p className="text-3xl font-bold text-green-700 mb-4">
            {formatPrice(prediction)}
          </p>
          
          <div className="text-sm text-gray-600 mb-4">
            <p>Estimasi ini didasarkan pada detail properti yang Anda berikan dan skor iklim lokasi.</p>
            <p className="mt-2 italic">Harga properti sebenarnya dapat bervariasi tergantung pada kondisi pasar dan faktor lainnya.</p>
          </div>
          
          <div className="flex items-center text-sm text-blue-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
            <span>Tingkat kepercayaan: 85%</span>
          </div>
        </div>
        
        {/* Panel Faktor Harga */}
        <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg">
          <h3 className="font-bold text-xl text-gray-800 mb-3">Faktor-faktor Harga</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Nilai Tanah Dasar</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Ruler className="w-4 h-4 text-blue-600 mr-2" />
                  <span>{formatPrice(predictionFactors.basePrice)}</span>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md">Harga Dasar</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Dampak Sertifikat</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                  <span>+{predictionFactors.certificateImpact.toFixed(1)}%</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-md ${
                  predictionFactors.certificateImpact > 0 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {predictionFactors.certificateImpact > 0 ? "Positif" : "Negatif"}
                </span>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Dampak Jenis Properti</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Building className="w-4 h-4 text-purple-600 mr-2" />
                  <span>+{predictionFactors.propertyTypeImpact.toFixed(1)}%</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-md ${
                  predictionFactors.propertyTypeImpact > 0 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {predictionFactors.propertyTypeImpact > 0 ? "Positif" : "Negatif"}
                </span>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Dampak Kamar Tidur</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Building className="w-4 h-4 text-gray-600 mr-2" />
                  <span>+{predictionFactors.bedroomsImpact.toFixed(1)}%</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-md ${
                  predictionFactors.bedroomsImpact > 0 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {predictionFactors.bedroomsImpact > 0 ? "Positif" : "Negatif"}
                </span>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Dampak Skor Iklim</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                  <span>{predictionFactors.climateImpact > 0 ? "+" : ""}{predictionFactors.climateImpact.toFixed(1)}%</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-md ${
                  predictionFactors.climateImpact > 0 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {predictionFactors.climateImpact > 0 ? "Positif" : "Negatif"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Rekomendasi */}
      <div className="mt-6 bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h3 className="font-bold text-xl text-gray-800 mb-3">Rekomendasi Pengembangan</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Berdasarkan Analisis Iklim</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <div className="text-green-600 mr-2 mt-0.5">•</div>
                <span>Pertimbangkan untuk menanam pohon atau tanaman di sekitar properti untuk meningkatkan skor NDVI</span>
              </li>
              <li className="flex items-start">
                <div className="text-green-600 mr-2 mt-0.5">•</div>
                <span>Gunakan material atap yang reflektif untuk mengurangi penyerapan panas</span>
              </li>
              <li className="flex items-start">
                <div className="text-green-600 mr-2 mt-0.5">•</div>
                <span>Pertimbangkan sistem drainase yang baik untuk mengurangi risiko banjir</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Berdasarkan Nilai Pasar</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <div className="text-blue-600 mr-2 mt-0.5">•</div>
                <span>Fokus pada fitur yang meningkatkan efisiensi energi untuk nilai jual lebih tinggi</span>
              </li>
              <li className="flex items-start">
                <div className="text-blue-600 mr-2 mt-0.5">•</div>
                <span>Sesuaikan jumlah kamar tidur dengan permintaan pasar di area tersebut</span>
              </li>
              <li className="flex items-start">
                <div className="text-blue-600 mr-2 mt-0.5">•</div>
                <span>Pertimbangkan untuk memperoleh sertifikat SHM untuk nilai properti yang lebih tinggi</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}