"use client";

import RiskIndicator from "@/components/RiskIndicator";

interface ClimateScorePanelProps {
  climateScores: {
    lst_score: number | null;
    ndvi_score: number | null;
    utfvi_score: number | null;
    uhi_score: number | null;
    overall_score: number | null;
  } | null;
  isLoading: boolean;
}

export default function ClimateScorePanel({ climateScores, isLoading }: ClimateScorePanelProps) {
  // Mendapatkan warna berdasarkan skor
  const getScoreColor = (score: number | null | undefined): string => {
    if (score == null) return "bg-gray-400";
    if (score >= 85) return "bg-green-600";
    if (score >= 75) return "bg-green-500";
    if (score >= 65) return "bg-yellow-500";
    if (score >= 55) return "bg-orange-500";
    return "bg-red-600";
  };

  return (
    <div className="mb-6">
      <h3 className="font-bold text-gray-800 mb-2">Analisis Iklim</h3>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {['lst', 'ndvi', 'utfvi', 'uhi'].map(metric => (
            <div key={metric} className="border rounded-lg p-3 bg-gradient-to-br from-gray-50 to-white animate-pulse">
              <p className="text-xs text-gray-400 mb-1">{metric.toUpperCase()}</p>
              <div className="h-6 bg-gray-200 rounded-md"></div>
              <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden w-full"></div>
            </div>
          ))}
        </div>
      ) : climateScores ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="border rounded-lg p-3 bg-gradient-to-br from-red-50 to-white">
            <p className="text-xs text-gray-500 mb-1">Suhu Permukaan Tanah (LST)</p>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${getScoreColor(climateScores.lst_score)} mr-2`}></div>
              <span className="text-lg font-bold">{climateScores.lst_score}</span>
              <span className="text-xs text-gray-500 ml-1">/100</span>
            </div>
            <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreColor(climateScores.lst_score)}`}
                style={{ width: `${climateScores.lst_score}%` }}
              ></div>
            </div>
          </div>
          
          <div className="border rounded-lg p-3 bg-gradient-to-br from-green-50 to-white">
            <p className="text-xs text-gray-500 mb-1">Indeks Vegetasi (NDVI)</p>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${getScoreColor(climateScores.ndvi_score)} mr-2`}></div>
              <span className="text-lg font-bold">{climateScores.ndvi_score}</span>
              <span className="text-xs text-gray-500 ml-1">/100</span>
            </div>
            <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreColor(climateScores.ndvi_score)}`}
                style={{ width: `${climateScores.ndvi_score}%` }}
              ></div>
            </div>
          </div>
          
          <div className="border rounded-lg p-3 bg-gradient-to-br from-purple-50 to-white">
            <p className="text-xs text-gray-500 mb-1">Pulau Panas Perkotaan (UHI)</p>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${getScoreColor(climateScores.uhi_score)} mr-2`}></div>
              <span className="text-lg font-bold">{climateScores.uhi_score}</span>
              <span className="text-xs text-gray-500 ml-1">/100</span>
            </div>
            <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreColor(climateScores.uhi_score)}`}
                style={{ width: `${climateScores.uhi_score}%` }}
              ></div>
            </div>
          </div>
          
          <div className="border rounded-lg p-3 bg-gradient-to-br from-yellow-50 to-white">
            <p className="text-xs text-gray-500 mb-1">Indeks Varian Termal (UTFVI)</p>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${getScoreColor(climateScores.utfvi_score)} mr-2`}></div>
              <span className="text-lg font-bold">{climateScores.utfvi_score}</span>
              <span className="text-xs text-gray-500 ml-1">/100</span>
            </div>
            <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreColor(climateScores.utfvi_score)}`}
                style={{ width: `${climateScores.utfvi_score}%` }}
              ></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 text-gray-600 text-sm rounded-md">
          Pilih lokasi di peta untuk melihat analisis iklim.
        </div>
      )}
      
      {climateScores && (
        <div className="mt-3 border rounded-lg p-3 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50">
          <p className="text-xs text-gray-500 mb-1">Skor Keamanan Iklim Keseluruhan</p>
          <div className="flex items-center">
            <RiskIndicator score={climateScores.overall_score || 0} size="sm" showLabel={false} />
            <div className="ml-3">
              <span className="text-xl font-bold text-blue-700">{climateScores.overall_score}</span>
              <span className="text-xs text-gray-500 ml-1">/100</span>
              <p className="text-xs text-gray-500 mt-0.5">
                {climateScores.overall_score && climateScores.overall_score >= 80 
                  ? "Kondisi iklim sangat baik" 
                  : climateScores.overall_score && climateScores.overall_score >= 60
                  ? "Kondisi iklim baik"
                  : climateScores.overall_score && climateScores.overall_score >= 40
                  ? "Kondisi iklim sedang"
                  : "Kondisi iklim menantang"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}