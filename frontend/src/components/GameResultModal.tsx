"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Share2, Home, ShieldCheck, CloudRain, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface GameResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  climateScore: number;
  onPlayAgain: () => void;
}

export const GameResultModal: React.FC<GameResultModalProps> = ({ 
  isOpen, 
  onClose, 
  score, 
  climateScore,
  onPlayAgain
}) => {
  // Calculate final score and rating
  const finalScore = score + (climateScore * 2);
  
  // Get rating based on score
  const getRating = () => {
    if (finalScore >= 1000) return "Pengembang Premier";
    if (finalScore >= 750) return "Perencana Ahli";
    if (finalScore >= 500) return "Pengembang Terampil";
    if (finalScore >= 300) return "Pembangun Kawasan";
    return "Pemula";
  };
  
  // Get climate safety level
  const getClimateLevel = () => {
    if (climateScore >= 80) return "Sangat Tahan Iklim";
    if (climateScore >= 60) return "Tahan Iklim";
    if (climateScore >= 40) return "Cukup Tahan";
    if (climateScore >= 20) return "Rentan";
    return "Sangat Rentan";
  };
  
  // Get climate score color
  const getClimateScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-green-500";
    if (score >= 40) return "text-yellow-500";
    if (score >= 20) return "text-orange-500";
    return "text-red-500";
  };
  
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
            />
            
            {/* Modal content */}
            <motion.div
              className="bg-white rounded-xl shadow-xl relative z-10 max-w-2xl w-full"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="p-6">
                <div className="text-center">
                  <Award className="h-16 w-16 text-blue-600 mx-auto mb-2" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    Pembangunan Selesai!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Anda telah menyelesaikan 10 ronde pembangunan properti
                  </p>
                </div>
                
                {/* Score results */}
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-5 mb-6 shadow-sm border border-blue-100">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-bold text-gray-800">Skor Akhir:</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{finalScore}</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Home className="h-4 w-4 text-gray-600 mr-2" />
                        <span className="text-gray-700">Nilai Properti:</span>
                      </div>
                      <div className="font-bold">{score}</div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <ShieldCheck className="h-4 w-4 text-gray-600 mr-2" />
                        <span className="text-gray-700">Skor Iklim:</span>
                      </div>
                      <div className={`font-bold ${getClimateScoreColor(climateScore)}`}>
                        {climateScore}/100
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="flex items-center">
                        <CloudRain className="h-4 w-4 text-gray-600 mr-2" />
                        <span className="text-gray-700">Ketahanan Iklim:</span>
                      </div>
                      <div className={`font-bold ${getClimateScoreColor(climateScore)}`}>
                        {getClimateLevel()}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Achievement and rating */}
                <div className="bg-blue-100 rounded-lg p-4 mb-6 text-center">
                  <h3 className="text-lg font-bold text-blue-800 mb-1">Peringkat Anda</h3>
                  <p className="text-xl font-bold text-blue-900">{getRating()}</p>
                </div>
                
                {/* Feedback based on performance */}
                <div className="mb-6">
                  <h3 className="font-bold text-gray-800 mb-2">Analisis Kinerja:</h3>
                  
                  {finalScore >= 750 ? (
                    <p className="text-gray-700">
                      Luar biasa! Anda berhasil membangun properti dengan nilai tinggi sekaligus 
                      mempertahankan ketahanan terhadap perubahan iklim. Strategi penempatan 
                      material Anda sangat efektif.
                    </p>
                  ) : finalScore >= 500 ? (
                    <p className="text-gray-700">
                      Kerja bagus! Anda membangun kawasan yang seimbang antara nilai properti 
                      dan ketahanan iklim. Dengan sedikit peningkatan pada manajemen risiko 
                      iklim, Anda bisa mencapai hasil yang lebih baik.
                    </p>
                  ) : finalScore >= 300 ? (
                    <p className="text-gray-700">
                      Hasil yang cukup baik. Anda telah menunjukkan pemahaman dasar tentang 
                      pembangunan properti dan ketahanan iklim. Pertimbangkan untuk lebih 
                      memperhatikan penempatan pohon dan kolam resapan pada permainan berikutnya.
                    </p>
                  ) : (
                    <p className="text-gray-700">
                      Ini adalah awal yang baik! Pembangunan properti yang seimbang dengan 
                      ketahanan iklim memang membutuhkan strategi. Coba lagi dan pertimbangkan 
                      untuk menempatkan lebih banyak material ramah iklim di sekitar rumah Anda.
                    </p>
                  )}
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Button 
                    className="flex-1" 
                    variant="outline"
                    onClick={onPlayAgain}
                  >
                    Main Lagi
                  </Button>
                  
                  <Button 
                    className="flex-1" 
                    variant="outline"
                    onClick={onClose}
                  >
                    Tutup
                  </Button>
                  
                  <Link href="/maps" className="flex-1">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Lihat Peta Sebenarnya
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};