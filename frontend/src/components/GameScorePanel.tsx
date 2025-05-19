"use client";

import React from "react";

interface GameScorePanelProps {
  score: number;
  climateScore: number;
  round: number;
  budget: number;
  weather: string | null;
  weatherCountdown: number | null;
  weatherEvents: Array<{
    type: string;
    icon: React.ReactNode;
    label: string;
    effect: string;
  }>;
}

export const GameScorePanel: React.FC<GameScorePanelProps> = ({
  score,
  climateScore,
  round,
  budget,
  weather,
  weatherCountdown,
  weatherEvents
}) => {
  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(1)}jt`;
    }
    return `Rp ${value.toLocaleString('id-ID')}`;
  };
  
  // Get climate score color
  const getClimateScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-green-400";
    if (score >= 40) return "bg-yellow-500";
    if (score >= 20) return "bg-orange-500";
    return "bg-red-500";
  };
  
  // Get climate score label
  const getClimateScoreLabel = (score: number) => {
    if (score >= 80) return "Sangat Baik";
    if (score >= 60) return "Baik";
    if (score >= 40) return "Sedang";
    if (score >= 20) return "Buruk";
    return "Sangat Buruk";
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="font-bold text-gray-800 mb-3">Status Permainan</h2>
      
      <div className="flex justify-between items-center border-b pb-2 mb-2">
        <div className="text-gray-600">Ronde</div>
        <div className="font-bold text-lg">{round}/10</div>
      </div>
      
      <div className="flex justify-between items-center border-b pb-2 mb-2">
        <div className="text-gray-600">Anggaran</div>
        <div className="font-bold text-lg">{formatCurrency(budget)}</div>
      </div>
      
      <div className="flex justify-between items-center border-b pb-2 mb-2">
        <div className="text-gray-600">Skor</div>
        <div className="font-bold text-lg">{score}</div>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Skor Iklim</span>
          <span className="font-bold">{climateScore}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${getClimateScoreColor(climateScore)}`}
            style={{ width: `${climateScore}%` }}
          ></div>
        </div>
        <div className="flex justify-center mt-1">
          <span className="text-xs text-gray-600">
            {getClimateScoreLabel(climateScore)}
          </span>
        </div>
      </div>
      
      {/* Current weather */}
      {weather && (
        <div className="mt-3 pt-2 border-t">
          <h3 className="font-medium text-gray-800 mb-2">Kondisi Iklim</h3>
          <div className="flex items-center bg-blue-50 p-2 rounded-md">
            {weatherEvents.find(w => w.type === weather)?.icon}
            <div className="ml-2">
              <div className="text-sm font-medium">
                {weatherEvents.find(w => w.type === weather)?.label}
              </div>
              <div className="text-xs text-gray-600">
                {weatherEvents.find(w => w.type === weather)?.effect}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};