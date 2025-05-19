"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { House, Trees, Droplets, Sun, AlertCircle, Info, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GameIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameIntroModal: React.FC<GameIntroModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            
            {/* Modal content */}
            <motion.div
              className="bg-white rounded-xl shadow-xl relative z-10 max-w-3xl w-full max-h-[85vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <div className="p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Selamat Datang di Climate Builder!
                  </h2>
                  <p className="text-gray-600">
                    Pelajari cara membangun properti yang aman dari bencana iklim
                  </p>
                </div>
                
                <div className="space-y-6">
                  {/* Game objective */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                      <Info className="w-5 h-5 mr-2 text-blue-600" />
                      Tujuan Permainan
                    </h3>
                    <p className="text-gray-700">
                      Bangun properti yang ramah iklim dan tangguh terhadap bencana. Kelola anggaran Anda untuk memaksimalkan 
                      nilai properti sekaligus memastikan ketahanan terhadap perubahan iklim selama 10 ronde.
                    </p>
                  </div>
                  
                  {/* Game rules */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                      Aturan Permainan
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      <li>Setiap ronde, Anda dapat menempatkan material bangunan di atas peta</li>
                      <li>Material berbeda memiliki harga, nilai skor, dan dampak iklim berbeda</li>
                      <li>Peristiwa iklim acak akan terjadi dan mempengaruhi properti Anda</li>
                      <li>Strategi penempatan material yang tepat akan memberikan bonus</li>
                      <li>Permainan berakhir setelah 10 ronde, dengan skor akhir berdasarkan nilai properti dan skor iklim</li>
                    </ul>
                  </div>
                  
                  {/* Material types */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                      <Check className="w-5 h-5 mr-2 text-blue-600" />
                      Material Bangunan
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-blue-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <House className="w-5 h-5 mr-2" />
                          <span className="font-medium">Rumah</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                          Rumah standar yang memberikan nilai skor dasar, tetapi memiliki dampak negatif pada skor iklim.
                        </p>
                      </div>
                      
                      <div className="bg-green-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <House className="w-5 h-5 mr-2 text-green-600" />
                          <span className="font-medium">Rumah Ramah Iklim</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                          Rumah dengan desain ramah iklim yang lebih mahal, tetapi meningkatkan skor iklim dan memberikan poin lebih banyak.
                        </p>
                      </div>
                      
                      <div className="bg-green-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <Trees className="w-5 h-5 mr-2 text-green-600" />
                          <span className="font-medium">Pohon</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                          Meningkatkan skor iklim dan memberikan perlindungan dari panas. Bekerja lebih baik jika ditempatkan di dekat rumah.
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <Droplets className="w-5 h-5 mr-2 text-blue-600" />
                          <span className="font-medium">Kolam Resapan</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                          Membantu mengurangi risiko banjir dan meningkatkan skor iklim. Sangat penting saat terjadi hujan deras.
                        </p>
                      </div>
                      
                      <div className="bg-yellow-50 p-3 rounded-md md:col-span-2">
                        <div className="flex items-center">
                          <Sun className="w-5 h-5 mr-2 text-yellow-600" />
                          <span className="font-medium">Panel Surya</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                          Meningkatkan efisiensi energi dan skor iklim. Memberikan bonus jika ditempatkan di dekat rumah.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tips */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Tip Strategis</h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>Tempatkan pohon di sekitar rumah untuk pendinginan alami</li>
                      <li>Bangun kolam resapan untuk antisipasi banjir</li>
                      <li>Rumah ramah iklim lebih tahan terhadap cuaca ekstrim</li>
                      <li>Panel surya di dekat rumah memberikan bonus efisiensi energi</li>
                      <li>Seimbangkan anggaran Anda antara pembangunan dan perlindungan iklim</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 text-lg" 
                    onClick={onClose}
                  >
                    Mulai Bermain
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};