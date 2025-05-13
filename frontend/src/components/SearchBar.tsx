'use client';

import { useState } from 'react';

interface SearchParams {
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  min_score?: number;
  priority?: string;
}

interface SearchBarProps {
  onSearch: (params: SearchParams) => void;
  className?: string;
}

export default function SearchBar({ onSearch, className = '' }: SearchBarProps) {
  const [priceRange, setPriceRange] = useState<[number | undefined, number | undefined]>([undefined, undefined]);
  const [bedrooms, setBedrooms] = useState<number | undefined>(undefined);
  const [bathrooms, setBathrooms] = useState<number | undefined>(undefined);
  const [minScore, setMinScore] = useState<number | undefined>(undefined);
  const [priority, setPriority] = useState<string | undefined>(undefined);
  const [expanded, setExpanded] = useState(false);
  
  // Price range options
  const priceOptions = [
    { label: 'Any', min: undefined, max: undefined },
    { label: '< 1B', min: 0, max: 1000000000 },
    { label: '1B - 2B', min: 1000000000, max: 2000000000 },
    { label: '2B - 5B', min: 2000000000, max: 5000000000 },
    { label: '5B - 10B', min: 5000000000, max: 10000000000 },
    { label: '> 10B', min: 10000000000, max: undefined }
  ];
  
  // Risk priority options
  const priorityOptions = [
    { value: 'overall', label: 'Overall Safety' },
    { value: 'flood', label: 'Flood Risk' },
    { value: 'temperature', label: 'Temperature' },
    { value: 'air_quality', label: 'Air Quality' },
    { value: 'landslide', label: 'Landslide Risk' }
  ];
  
  const handleSearch = () => {
    onSearch({
      min_price: priceRange[0],
      max_price: priceRange[1],
      bedrooms,
      bathrooms,
      min_score: minScore,
      priority
    });
  };
  
  const handleReset = () => {
    setPriceRange([undefined, undefined]);
    setBedrooms(undefined);
    setBathrooms(undefined);
    setMinScore(undefined);
    setPriority(undefined);
    
    onSearch({});
  };
  
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h3 className="font-bold text-lg mb-2 md:mb-0">Find Climate-Safe Properties</h3>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 text-sm"
        >
          {expanded ? 'Basic Search' : 'Advanced Search'}
        </button>
      </div>
      
      <div className="flex flex-col space-y-4">
        {/* Price Range Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {priceOptions.map((option, index) => (
              <button
                key={index}
                className={`px-3 py-2 text-sm border rounded-md transition ${
                  priceRange[0] === option.min && priceRange[1] === option.max
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setPriceRange([option.min, option.max])}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
            <select
              value={bedrooms || ''}
              onChange={(e) => setBedrooms(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Semua</option>
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num}+</option>
              ))}
            </select>
          </div>
          
          {/* Bathrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
            <select
              value={bathrooms || ''}
              onChange={(e) => setBathrooms(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Semua</option>
              {[1, 2, 3, 4].map(num => (
                <option key={num} value={num}>{num}+</option>
              ))}
            </select>
          </div>
          
          {/* Climate Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min. Climate Score</label>
            <select
              value={minScore || ''}
              onChange={(e) => setMinScore(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Semua</option>
              <option value="50">50+</option>
              <option value="60">60+</option>
              <option value="70">70+</option>
              <option value="80">80+</option>
              <option value="90">90+</option>
            </select>
          </div>
        </div>
        
        {/* Advanced Filters */}
        {expanded && (
          <div className="pt-2 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Risk Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Priority</label>
                <select
                  value={priority || ''}
                  onChange={(e) => setPriority(e.target.value || undefined)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">No preference</option>
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            onClick={handleSearch}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}