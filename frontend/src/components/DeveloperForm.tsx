"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

// Tipe sertifikat
const CERTIFICATE_TYPES = [
  "Sertifikat Hak Milik",
  "Sertifikat Hak Guna Bangunan",
];

// Tipe properti
const PROPERTY_TYPES = [
  "Rumah Seken",
  "Rumah Baru",
];

interface DeveloperFormProps {
  onSubmit: (formData: {
    bedrooms: string;
    landArea: string;
    certificate: string;
    propertyType: string;
    landPricePerMeter: string;
  }) => void;
  isLoading: boolean;
  error: string | null;
}

export default function DeveloperForm({ onSubmit, isLoading, error }: DeveloperFormProps) {
  const [formData, setFormData] = useState({
    bedrooms: "",
    landArea: "",
    certificate: "",
    propertyType: "",
    landPricePerMeter: ""
  });
  
  // Tangani perubahan input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // Tangani pengiriman formulir
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
        <h3 className="text-lg font-bold text-blue-800 mb-2">Detail Properti</h3>
        <p className="text-sm text-blue-700">
          Isi detail properti yang Anda rencanakan untuk mendapatkan estimasi harga berdasarkan data iklim lokasi dan karakteristik properti.
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jumlah Kamar Tidur <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="bedrooms"
            value={formData.bedrooms}
            onChange={handleInputChange}
            min="1"
            max="10"
            className="w-full p-2 border border-gray-300 rounded-md text-black text-sm"
            placeholder="contoh: 3"
          />
          <p className="text-xs text-gray-500 mt-1">Masukkan angka antara 1 dan 10</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Luas Tanah (m²) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="landArea"
            value={formData.landArea}
            onChange={handleInputChange}
            min="1"
            className="w-full p-2 border border-gray-300 rounded-md text-black text-sm"
            placeholder="contoh: 200"
          />
          <p className="text-xs text-gray-500 mt-1">Luas total tanah dalam meter persegi</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jenis Sertifikat <span className="text-red-500">*</span>
          </label>
          <select
            name="certificate"
            value={formData.certificate}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md text-black text-sm"
          >
            <option value="">Pilih jenis sertifikat</option>
            {CERTIFICATE_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Jenis sertifikat mempengaruhi nilai properti dan keamanan</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jenis Properti <span className="text-red-500">*</span>
          </label>
          <select
            name="propertyType"
            value={formData.propertyType}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md text-black text-sm"
          >
            <option value="">Pilih jenis properti</option>
            {PROPERTY_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Jenis properti yang berbeda memiliki nilai pasar yang berbeda</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Harga Tanah per m² (Rp) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="landPricePerMeter"
            value={formData.landPricePerMeter}
            onChange={handleInputChange}
            min="1"
            className="w-full p-2 border border-gray-300 rounded-md text-black text-sm"
            placeholder="contoh: 5000000"
          />
          <p className="text-xs text-gray-500 mt-1">Berdasarkan harga tanah di daerah tersebut</p>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md my-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Menghitung Harga...
          </span>
        ) : "Prediksi Harga Properti"}
      </Button>
    </form>
  );
}