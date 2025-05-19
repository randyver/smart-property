"use client";

import React from "react";
import { House, Trees, Droplets, Sun } from "lucide-react";

interface GameTileProps {
  content: string | null;
  onClick: () => void;
  materials: Array<{
    id: string;
    icon: React.ReactNode;
    label: string;
    cost: number;
    score: number;
    climateImpact: number;
  }>;
}

export const GameTile: React.FC<GameTileProps> = ({ content, onClick, materials }) => {
  // Get the material object if this tile has content
  const material = content ? materials.find(m => m.id === content) : null;
  
  // Handle click with preventDefault to avoid unwanted scrolling
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default browser behavior
    onClick();
  };
  
  return (
    <div 
      className={`border rounded-md flex items-center justify-center cursor-pointer w-full aspect-square transition-all ${
        content 
          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100 shadow-sm' 
          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
      }`}
      onClick={handleClick}
    >
      {material && (
        <div className="flex items-center justify-center">
          {material.icon}
        </div>
      )}
    </div>
  );
};