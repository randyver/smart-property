"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info } from "lucide-react";

interface ClimateScoreInfoProps {
  className?: string;
}

export default function ClimateScoreInfo({
  className = "",
}: ClimateScoreInfoProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`text-blue-600 text-sm flex items-center hover:underline ${className}`}
        >
          <Info className="w-4 h-4 mr-1" />
          Apa itu Skor Iklim?
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 xl:w-full z-[100]">
        <div className="space-y-3">
          <h3 className="font-bold text-gray-800 mb-2">
            Tentang Skor Iklim
          </h3>

          <div className="space-y-3 text-sm text-gray-600">
            <p>
              Skor Iklim adalah indikator yang menunjukkan seberapa aman
              lokasi properti dari risiko perubahan iklim dan kondisi
              lingkungan.
            </p>

            <div>
              <h4 className="font-medium text-gray-700">
                LST (Land Surface Temperature)
              </h4>
              <p>
                Suhu permukaan tanah di area properti. Skor yang tinggi
                menunjukkan suhu yang lebih rendah dan nyaman.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-700">
                NDVI (Normalized Difference Vegetation Index)
              </h4>
              <p>
                Mengukur ketersediaan ruang hijau di sekitar properti. Skor yang
                tinggi menunjukkan lebih banyak vegetasi.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-700">
                UTFVI (Urban Thermal Field Variance Index)
              </h4>
              <p>
                Mengukur variasi suhu di wilayah urban. Skor yang tinggi
                menunjukkan variasi suhu yang lebih stabil.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-700">
                UHI (Urban Heat Island)
              </h4>
              <p>
                Mengukur efek pulau panas perkotaan. Skor yang tinggi
                menunjukkan area dengan efek UHI yang minimal.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-700">Skor Keseluruhan</h4>
              <p>
                Nilai keseluruhan yang menggabungkan semua parameter di atas
                untuk menilai tingkat keamanan iklim suatu properti.
              </p>
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
                  <span>40-59: Cukup</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-red-600 mr-2"></span>
                  <span>0-39: Buruk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
