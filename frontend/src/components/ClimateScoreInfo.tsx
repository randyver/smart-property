'use client';

import { useState } from 'react';

interface ClimateScoreInfoProps {
  className?: string;
}

export default function ClimateScoreInfo({ className = '' }: ClimateScoreInfoProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-blue-600 text-sm flex items-center hover:underline"
        aria-expanded={isOpen}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          className="w-5 h-5 mr-1"
        >
          <path 
            fillRule="evenodd" 
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" 
            clipRule="evenodd" 
          />
        </svg>
        Apa itu Climate Score?
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-2 w-72 bg-white rounded-md shadow-lg p-4 border border-gray-200">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              className="w-5 h-5"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" 
                clipRule="evenodd" 
              />
            </svg>
          </button>
          
          <h3 className="font-bold text-gray-800 mb-2">Tentang Climate Score</h3>
          
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              Climate Score adalah indikator yang menunjukkan seberapa aman lokasi properti dari 
              risiko perubahan iklim dan kondisi lingkungan.
            </p>
            
            <div>
              <h4 className="font-medium text-gray-700">LST (Land Surface Temperature)</h4>
              <p>Suhu permukaan tanah di area properti. Skor tinggi menunjukkan suhu yang lebih rendah dan nyaman.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700">NDVI (Normalized Difference Vegetation Index)</h4>
              <p>Mengukur ketersediaan ruang hijau di sekitar properti. Skor tinggi menunjukkan lebih banyak vegetasi.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700">UTFVI (Urban Thermal Field Variance Index)</h4>
              <p>Mengukur variasi suhu perkotaan. Skor tinggi menunjukkan variasi suhu yang lebih stabil.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700">UHI (Urban Heat Island)</h4>
              <p>Mengukur efek pulau panas perkotaan. Skor tinggi menunjukkan area dengan efek UHI yang minimal.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700">Overall Score</h4>
              <p>Nilai keseluruhan yang menggabungkan semua parameter di atas untuk menilai keamanan iklim properti.</p>
            </div>
            
            <div className="pt-2">
              <h4 className="font-medium text-gray-700">Panduan Skor:</h4>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-600 mr-2"></span>
                  <span>80-100: Sangat Baik</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                  <span>60-79: Baik</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                  <span>40-59: Sedang</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-2"></span>
                  <span>20-39: Buruk</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-red-600 mr-2"></span>
                  <span>0-19: Sangat Buruk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}