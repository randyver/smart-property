'use client';

interface ClimateScoresProps {
  scores: {
    lst_score: number | null;
    ndvi_score: number | null;
    utfvi_score: number | null;
    uhi_score: number | null;
    overall_score: number | null;
  };
  compact?: boolean;
  className?: string;
}

export default function ClimateScores({ 
  scores, 
  compact = false, 
  className = '' 
}: ClimateScoresProps) {
  
  // Get color class based on score
  const getScoreColor = (score: number | null | undefined): string => {
    if (score == null) return "bg-gray-500";
    if (score >= 85) return "bg-green-600"; // Darker green for better contrast
    if (score >= 75) return "bg-green-500"; // Medium green
    if (score >= 65) return "bg-yellow-500"; // Yellow
    if (score >= 55) return "bg-orange-500"; // Orange
    return "bg-red-600"; // Red for poor scores
  };
  
  // Get text color class based on score
  const getTextColor = (score: number | null | undefined): string => {
    if (score == null) return "text-gray-500";
    if (score >= 60) return "text-green-700"; 
    if (score >= 40) return "text-yellow-700"; 
    if (score >= 20) return "text-orange-700"; 
    return "text-red-700"; 
  };
  
  // Get label based on score
  const getScoreLabel = (score: number | null | undefined): string => {
    if (score == null) return "No data";
    if (score >= 80) return "Sangat Baik";
    if (score >= 60) return "Baik";
    if (score >= 40) return "Sedang";
    if (score >= 20) return "Buruk";
    return "Sangat Buruk";
  };
  
  // Score explanations for tooltips
  const scoreExplanations = {
    lst_score: "Land Surface Temperature - Menunjukkan suhu permukaan tanah di sekitar properti",
    ndvi_score: "Normalized Difference Vegetation Index - Mengukur ketersediaan ruang hijau di sekitar properti",
    utfvi_score: "Urban Thermal Field Variance Index - Mengukur variasi suhu perkotaan", 
    uhi_score: "Urban Heat Island - Mengukur efek pulau panas perkotaan di sekitar properti",
    overall_score: "Overall Climate Score - Skor keseluruhan keamanan iklim properti"
  };
  
  // Compact version for sidebars and cards
  if (compact) {
    return (
      <div className={`flex flex-col space-y-1 ${className}`}>
        <div className="grid grid-cols-5 gap-1">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${getScoreColor(scores.lst_score)}`}></div>
            <span className="text-xs mt-1">LST</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${getScoreColor(scores.ndvi_score)}`}></div>
            <span className="text-xs mt-1">NDVI</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${getScoreColor(scores.utfvi_score)}`}></div>
            <span className="text-xs mt-1">UTFVI</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${getScoreColor(scores.uhi_score)}`}></div>
            <span className="text-xs mt-1">UHI</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${getScoreColor(scores.overall_score)}`}></div>
            <span className="text-xs mt-1">Overall</span>
          </div>
        </div>
      </div>
    );
  }
  
  // Full detailed version
  return (
    <div className={`flex flex-col space-y-2 ${className} text-black`}>
      <h4 className="font-bold text-sm mb-1">Detailed Climate Scores</h4>
      
      <div className="space-y-3">
        <div className="flex items-center">
          <div className="w-1/3">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${getScoreColor(scores.lst_score)} mr-2`}></div>
              <span className="text-sm font-medium">LST Score</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Land Surface Temperature</p>
          </div>
          <div className="w-2/3">
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreColor(scores.lst_score)}`}
                style={{ width: `${scores.lst_score || 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className={`text-xs ${getTextColor(scores.lst_score)}`}>
                {scores.lst_score || 'N/A'}
              </span>
              <span className="text-xs text-gray-600">
                {getScoreLabel(scores.lst_score)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="w-1/3">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${getScoreColor(scores.ndvi_score)} mr-2`}></div>
              <span className="text-sm font-medium">NDVI Score</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Vegetation Index</p>
          </div>
          <div className="w-2/3">
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreColor(scores.ndvi_score)}`}
                style={{ width: `${scores.ndvi_score || 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className={`text-xs ${getTextColor(scores.ndvi_score)}`}>
                {scores.ndvi_score || 'N/A'}
              </span>
              <span className="text-xs text-gray-600">
                {getScoreLabel(scores.ndvi_score)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="w-1/3">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${getScoreColor(scores.utfvi_score)} mr-2`}></div>
              <span className="text-sm font-medium">UTFVI Score</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Urban Thermal Index</p>
          </div>
          <div className="w-2/3">
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreColor(scores.utfvi_score)}`}
                style={{ width: `${scores.utfvi_score || 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className={`text-xs ${getTextColor(scores.utfvi_score)}`}>
                {scores.utfvi_score || 'N/A'}
              </span>
              <span className="text-xs text-gray-600">
                {getScoreLabel(scores.utfvi_score)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="w-1/3">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${getScoreColor(scores.uhi_score)} mr-2`}></div>
              <span className="text-sm font-medium">UHI Score</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Urban Heat Island</p>
          </div>
          <div className="w-2/3">
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreColor(scores.uhi_score)}`}
                style={{ width: `${scores.uhi_score || 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className={`text-xs ${getTextColor(scores.uhi_score)}`}>
                {scores.uhi_score || 'N/A'}
              </span>
              <span className="text-xs text-gray-600">
                {getScoreLabel(scores.uhi_score)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="w-1/3">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${getScoreColor(scores.overall_score)} mr-2`}></div>
              <span className="text-sm font-medium">Overall Score</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Climate Safety Rating</p>
          </div>
          <div className="w-2/3">
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreColor(scores.overall_score)}`}
                style={{ width: `${scores.overall_score || 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className={`text-xs ${getTextColor(scores.overall_score)} font-bold`}>
                {scores.overall_score || 'N/A'}
              </span>
              <span className="text-xs text-gray-600">
                {getScoreLabel(scores.overall_score)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}