"use client";

import React from "react";

interface BuildingMaterialProps {
  material: {
    id: string;
    icon: React.ReactNode;
    label: string;
    cost: number;
    score: number;
    climateImpact: number;
  };
  selected: boolean;
  onSelect: () => void;
  disabled: boolean;
  formatter: {
    formatCurrency: (value: number) => string;
  };
}

export const BuildingMaterial: React.FC<BuildingMaterialProps> = ({ 
  material, 
  selected, 
  onSelect, 
  disabled,
  formatter
}) => {
  // Handle click with preventDefault to avoid unwanted scrolling
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default browser behavior
    if (!disabled) {
      onSelect();
    }
  };
  
  return (
    <button
      type="button" // Explicitly set type to avoid form submission behavior
      className={`border rounded-md p-2 flex flex-col items-center justify-center text-sm transition-all ${
        selected 
          ? 'bg-blue-100 border-blue-500 shadow-sm' 
          : disabled 
            ? 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed'
            : 'bg-white border-gray-300 hover:bg-gray-50'
      }`}
      onClick={handleClick}
      disabled={disabled}
    >
      <div className="w-6 h-6 flex items-center justify-center mb-1">
        {material.icon}
      </div>
      <div className="font-medium text-gray-800">{material.label}</div>
      <div className="text-xs text-gray-600">{formatter.formatCurrency(material.cost)}</div>
      <div className="flex justify-between w-full mt-1 text-xs">
        <span className="text-blue-600">+{material.score}</span>
        <span className={material.climateImpact >= 0 ? "text-green-600" : "text-red-600"}>
          {material.climateImpact > 0 ? "+" : ""}{material.climateImpact}
        </span>
      </div>
    </button>
  );
};