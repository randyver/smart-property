"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

// Tipe sertifikat
const CERTIFICATE_TYPES = [
  "SHM - Sertifikat Hak Milik",
  "HGB - Hak Guna Bangunan",
];

// Tipe properti
const PROPERTY_TYPES = [
  "Rumah Seken",
  "Rumah Baru",
];

// Kabupaten and Kecamatan data
const LOCATION_DATA = {
  "Kabupaten Bandung": [
    'Cimenyan', 'Majalaya', 'Bojongsoang', 'Pameungpeuk', 'Arjasari',
    'Cileunyi', 'Margahayu', 'Margaasih', 'Dayeuhkolot', 'Ciparay',
    'Cilengkrang', 'Baleendah', 'Ciwidey', 'Rancaekek', 'Katapang',
    'Soreang', 'Paseh', 'Cikancung', 'Banjaran', 'Rancabali',
    'Cangkuang', 'Solokanjeruk', 'Cicalengka', 'Kutawaringin',
    'Pangalengan'
  ],
  "Kota Bandung": [
    'Mandalajati', 'Buahbatu', 'Kiaracondong', 'Rancasari', 'Sukajadi',
    'Gedebage', 'Coblong', 'Ujungberung', 'Cibiru', 'Antapani',
    'Arcamanik', 'Bojongloa Kidul', 'Sukasari', 'Batununggal',
    'Sumur Bandung', 'Regol', 'Andir', 'Cicendo', 'Bojongloa Kaler',
    'Astana Anyar', 'Lengkong', 'Babakan Ciparay', 'Bandung Kulon',
    'Bandung Kidul', 'Bandung Wetan', 'Cidadap', 'Cinambo',
    'Panyileukan', 'Cibeunying Kaler', 'Cibeunying Kidul'
  ]
};

interface DeveloperFormProps {
  onSubmit: (formData: {
    bedrooms: string;
    landArea: string;
    certificate: string;
    propertyType: string;
    landPricePerMeter: string;
    city: string; // New field for Kota/Kabupaten
    district: string; // New field for Kecamatan
  }) => void;
  isLoading: boolean;
  error: string | null;
  climateScores?: {
    lst_score: number | null;
    ndvi_score: number | null;
    utfvi_score: number | null;
    uhi_score: number | null;
    overall_score: number | null;
  } | null;
}

export default function DeveloperForm({ onSubmit, isLoading, error, climateScores }: DeveloperFormProps) {
  const [formData, setFormData] = useState({
    bedrooms: "",
    landArea: "",
    certificate: "",
    propertyType: "",
    landPricePerMeter: "",
    city: "", // New field for Kota/Kabupaten
    district: "" // New field for Kecamatan
  });
  
  // State to track available districts based on selected city
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  
  // Update available districts when city changes
  useEffect(() => {
    if (formData.city && LOCATION_DATA[formData.city as keyof typeof LOCATION_DATA]) {
      setAvailableDistricts(LOCATION_DATA[formData.city as keyof typeof LOCATION_DATA]);
      // Reset district when city changes
      setFormData(prev => ({...prev, district: ""}));
    } else {
      setAvailableDistricts([]);
    }
  }, [formData.city]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Include climate scores in the submission if available
    const submissionData = {
      ...formData,
      ...(climateScores && { 
        lst_score: climateScores.lst_score,
        ndvi_score: climateScores.ndvi_score,
        utfvi_score: climateScores.utfvi_score,
        uhi_score: climateScores.uhi_score,
        overall_score: climateScores.overall_score
      })
    };
    
    onSubmit(submissionData);
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
        {/* Location Selection - New addition */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kota/Kabupaten <span className="text-red-500">*</span>
          </label>
          <select
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md text-black text-sm"
          >
            <option value="">Pilih Kota/Kabupaten</option>
            {Object.keys(LOCATION_DATA).map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Pilih kota atau kabupaten lokasi properti</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kecamatan <span className="text-red-500">*</span>
          </label>
          <select
            name="district"
            value={formData.district}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md text-black text-sm"
            disabled={!formData.city}
          >
            <option value="">Pilih Kecamatan</option>
            {availableDistricts.map((district) => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Pilih kecamatan lokasi properti</p>
        </div>
        
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