"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import { House, Trees, Cloud, ArrowRight, Droplets, Sun, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameTile } from "@/components/GameTile";
import { BuildingMaterial } from "@/components/BuildingMaterial";
import { GameScorePanel } from "@/components/GameScorePanel";
import { GameIntroModal } from "@/components/GameIntroModal";
import { GameResultModal } from "@/components/GameResultModal";
import Link from "next/link";

export default function GamePage() {
  // Game board state - 8x8 grid
  const [board, setBoard] = useState<Array<Array<string | null>>>(
    Array(8).fill(null).map(() => Array(8).fill(null))
  );
  
  // Selected building material
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  
  // Game metrics
  const [score, setScore] = useState<number>(0);
  const [climateScore, setClimateScore] = useState<number>(50);
  const [round, setRound] = useState<number>(1);
  const [budget, setBudget] = useState<number>(1000000);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  
  // Weather event state
  const [currentWeather, setCurrentWeather] = useState<string | null>(null);
  const [weatherCountdown, setWeatherCountdown] = useState<number | null>(null);
  
  // Tutorial/introduction modal
  const [showIntro, setShowIntro] = useState<boolean>(true);
  // Result modal
  const [showResult, setShowResult] = useState<boolean>(false);
  
  // Weather events
  const weatherEvents = [
    { type: "rain", icon: <Droplets className="h-5 w-5" />, label: "Hujan Deras", effect: "Risiko banjir meningkat" },
    { type: "heat", icon: <Sun className="h-5 w-5" />, label: "Gelombang Panas", effect: "Suhu meningkat drastis" },
    { type: "wind", icon: <Wind className="h-5 w-5" />, label: "Angin Kencang", effect: "Risiko kerusakan meningkat" }
  ];
  
  // Building materials
  const materials = [
    { id: "house", icon: <House className="h-5 w-5" />, label: "Rumah", cost: 200000, score: 10, climateImpact: -5 },
    { id: "eco_house", icon: <House className="h-5 w-5 text-green-600" />, label: "Rumah Ramah Iklim", cost: 300000, score: 15, climateImpact: 5 },
    { id: "tree", icon: <Trees className="h-5 w-5 text-green-600" />, label: "Pohon", cost: 50000, score: 5, climateImpact: 10 },
    { id: "pond", icon: <Droplets className="h-5 w-5 text-blue-600" />, label: "Kolam Resapan", cost: 100000, score: 8, climateImpact: 15 },
    { id: "solar", icon: <Sun className="h-5 w-5 text-yellow-500" />, label: "Panel Surya", cost: 150000, score: 12, climateImpact: 20 },
  ];
  
  // Event log
  const [eventLog, setEventLog] = useState<Array<{message: string, type: string}>>([]);
  const logEndRef = useRef<HTMLDivElement>(null);
  
  // Add message to event log
  const addLog = (message: string, type: string = "info") => {
    setEventLog(prev => [...prev, { message, type }]);
    
    // We'll make the scrolling behavior optional and delay it slightly
    setTimeout(() => {
      if (logEndRef.current && !isUserInteracting) {
        logEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }, 100);
  };
  
  // Track if user is currently interacting with the game
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  
  // Handle user interaction start
  const handleInteractionStart = () => {
    setIsUserInteracting(true);
    // Reset after a short delay
    setTimeout(() => setIsUserInteracting(false), 1000);
  };
  
  // Place item on the board
  const handlePlaceItem = (row: number, col: number) => {
    if (!selectedMaterial || isGameOver) return;
    
    // Check if cell is already occupied
    if (board[row][col] !== null) {
      addLog("Lokasi sudah terisi. Pilih lokasi lain.", "warning");
      return;
    }
    
    // Find the selected material
    const material = materials.find(m => m.id === selectedMaterial);
    if (!material) return;
    
    // Check if player has enough budget
    if (budget < material.cost) {
      addLog("Anggaran tidak mencukupi untuk item ini.", "error");
      return;
    }
    
    // Place the item
    const newBoard = [...board];
    newBoard[row][col] = selectedMaterial;
    setBoard(newBoard);
    
    // Update budget, score and climate score
    setBudget(prev => prev - material.cost);
    setScore(prev => prev + material.score);
    setClimateScore(prev => Math.min(100, Math.max(0, prev + material.climateImpact)));
    
    // Add to log
    addLog(`${material.label} ditempatkan di lokasi (${row}, ${col})`, "success");
    
    // Check for adjacency bonuses (trees next to houses, etc.)
    checkForBonuses(newBoard, row, col, selectedMaterial);
  };
  
  // Check for bonus points for strategic placements
  const checkForBonuses = (board: Array<Array<string | null>>, row: number, col: number, itemType: string) => {
    // Bonus for trees adjacent to houses (improved cooling, etc.)
    if (itemType === "tree") {
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right
      
      for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;
        
        // Check boundaries
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          if (board[newRow][newCol] === "house") {
            setScore(prev => prev + 5);
            setClimateScore(prev => Math.min(100, prev + 5));
            addLog("Bonus! Pohon di dekat rumah memberikan efek pendinginan", "success");
          }
          
          if (board[newRow][newCol] === "eco_house") {
            setScore(prev => prev + 10);
            setClimateScore(prev => Math.min(100, prev + 8));
            addLog("Bonus! Pohon di dekat rumah ramah iklim meningkatkan efisiensi", "success");
          }
        }
      }
    }
    
    // Bonus for pond near houses (improved drainage)
    if (itemType === "pond") {
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]]; // all 8 directions
      
      for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;
        
        // Check boundaries
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          if (board[newRow][newCol] === "house" || board[newRow][newCol] === "eco_house") {
            setScore(prev => prev + 7);
            setClimateScore(prev => Math.min(100, prev + 7));
            addLog("Bonus! Kolam resapan di dekat rumah mengurangi risiko banjir", "success");
          }
        }
      }
    }
    
    // Bonus for solar panels on houses
    if (itemType === "solar" && row > 0 && board[row-1][col] === "house") {
      setScore(prev => prev + 15);
      setClimateScore(prev => Math.min(100, prev + 10));
      addLog("Bonus! Panel surya meningkatkan efisiensi energi rumah", "success");
    }
  };
  
  // Select a building material
  const handleSelectMaterial = (materialId: string) => {
    setSelectedMaterial(materialId);
    
    // Find the material
    const material = materials.find(m => m.id === materialId);
    if (material) {
      addLog(`Material dipilih: ${material.label} (${formatter.formatCurrency(material.cost)})`, "info");
    }
  };
  
  // Next round
  const handleNextRound = () => {
    if (isGameOver) return;
    
    // Add budget for next round
    const roundBonus = 500000 + (climateScore * 5000);
    setBudget(prev => prev + roundBonus);
    
    // Log round transition
    addLog(`Ronde ${round} selesai! Bonus anggaran: ${formatter.formatCurrency(roundBonus)}`, "round");
    
    // Generate weather event
    if (Math.random() > 0.3) { // 70% chance of weather event
      const randomEvent = weatherEvents[Math.floor(Math.random() * weatherEvents.length)];
      setCurrentWeather(randomEvent.type);
      setWeatherCountdown(2); // Weather lasts for 2 rounds
      
      addLog(`Peristiwa Iklim: ${randomEvent.label}. ${randomEvent.effect}`, "weather");
      
      // Apply weather effects
      applyWeatherEffects(randomEvent.type);
    } else if (currentWeather && weatherCountdown) {
      // Continue existing weather
      setWeatherCountdown(weatherCountdown - 1);
      if (weatherCountdown - 1 <= 0) {
        setCurrentWeather(null);
        addLog("Cuaca telah kembali normal", "weather");
      } else {
        addLog(`${weatherEvents.find(w => w.type === currentWeather)?.label} berlanjut`, "weather");
        applyWeatherEffects(currentWeather);
      }
    }
    
    // Increment round
    setRound(prev => prev + 1);
    
    // End game after 10 rounds
    if (round >= 10) {
      setIsGameOver(true);
      addLog("Permainan Selesai! Lihat hasil akhir Anda.", "success");
      setShowResult(true);
    }
  };
  
  // Apply weather effects to the game
  const applyWeatherEffects = (weatherType: string) => {
    switch (weatherType) {
      case "rain":
        // Heavy rain causes flooding unless there's good drainage
        const hasEnoughPonds = board.flat().filter(cell => cell === "pond").length >= 3;
        
        if (!hasEnoughPonds) {
          setClimateScore(prev => Math.max(0, prev - 15));
          addLog("Banjir! Skor iklim menurun karena kurangnya kolam resapan", "negative");
        } else {
          addLog("Hujan deras tertampung oleh kolam resapan. Koleksi air terjaga.", "positive");
          setScore(prev => prev + 10);
        }
        break;
        
      case "heat":
        // Extreme heat affects houses without trees nearby
        let affectedHouses = 0;
        let protectedHouses = 0;
        
        for (let row = 0; row < 8; row++) {
          for (let col = 0; col < 8; col++) {
            if (board[row][col] === "house") {
              // Check if there are trees adjacent
              const hasAdjacentTree = checkForAdjacentItems(row, col, "tree");
              
              if (!hasAdjacentTree) {
                affectedHouses++;
              } else {
                protectedHouses++;
              }
            }
          }
        }
        
        if (affectedHouses > 0) {
          setClimateScore(prev => Math.max(0, prev - (affectedHouses * 5)));
          addLog(`${affectedHouses} rumah terdampak gelombang panas karena tidak memiliki pohon di sekitarnya`, "negative");
        }
        
        if (protectedHouses > 0) {
          addLog(`${protectedHouses} rumah terlindungi dari panas berkat pohon di sekitarnya`, "positive");
        }
        break;
        
      case "wind":
        // Strong wind damages houses without proper protection
        const totalHouses = board.flat().filter(cell => cell === "house" || cell === "eco_house").length;
        
        // Eco houses are more resilient to wind
        const ecoHouses = board.flat().filter(cell => cell === "eco_house").length;
        const regularHouses = totalHouses - ecoHouses;
        
        if (regularHouses > 0) {
          setScore(prev => prev - (regularHouses * 3));
          addLog(`${regularHouses} rumah biasa mengalami kerusakan ringan akibat angin kencang`, "negative");
        }
        
        if (ecoHouses > 0) {
          addLog(`${ecoHouses} rumah ramah iklim lebih tahan terhadap angin kencang`, "positive");
        }
        break;
    }
  };
  
  // Helper function to check for adjacent items of a certain type
  const checkForAdjacentItems = (row: number, col: number, itemType: string): boolean => {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right
    
    for (const [dx, dy] of directions) {
      const newRow = row + dx;
      const newCol = col + dy;
      
      // Check boundaries
      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        if (board[newRow][newCol] === itemType) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  // Reset game
  const resetGame = () => {
    setBoard(Array(8).fill(null).map(() => Array(8).fill(null)));
    setSelectedMaterial(null);
    setScore(0);
    setClimateScore(50);
    setRound(1);
    setBudget(1000000);
    setCurrentWeather(null);
    setWeatherCountdown(null);
    setIsGameOver(false);
    
    // Reset event log without triggering auto-scroll
    setEventLog([
      {
        message: "Permainan baru dimulai! Tujuan: Bangun properti yang aman dari risiko iklim.",
        type: "info"
      },
      {
        message: "Pilih material dan tempatkan di peta untuk memulai.",
        type: "info"
      }
    ]);
    
    setShowResult(false);
  };
  
  // Formatter for currency
  const formatter = {
    formatCurrency: (value: number) => {
      if (value >= 1000000) {
        return `Rp ${(value / 1000000).toFixed(1)}jt`;
      }
      return `Rp ${value.toLocaleString('id-ID')}`;
    }
  };
  
  // Initialize game with welcome message
  useEffect(() => {
    // Set initial messages without triggering auto-scroll
    setEventLog([
      {
        message: "Selamat datang di Simulasi Properti Iklim! Bangun properti yang aman dari bencana iklim.",
        type: "info"
      },
      {
        message: "Pilih material dan tempatkan di peta untuk memulai.",
        type: "info"
      }
    ]);
  }, []);
  
  return (
    <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center mb-2 text-gray-800"
        >
          SmartProperty <span className="text-blue-600">Climate Builder</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center text-gray-600 mb-8"
        >
          Bangun properti yang aman dari bencana iklim dan maksimalkan nilai investasi Anda
        </motion.p>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Game Info */}
          <div className="lg:col-span-3 space-y-4">
            {/* Score Panel */}
            <GameScorePanel 
              score={score}
              climateScore={climateScore}
              round={round}
              budget={budget}
              weather={currentWeather}
              weatherCountdown={weatherCountdown}
              weatherEvents={weatherEvents}
            />
            
            {/* Building Materials */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="font-bold text-gray-800 mb-3">Material Bangunan</h2>
              <div className="grid grid-cols-2 gap-2">
                {materials.map(material => (
                  <BuildingMaterial
                    key={material.id}
                    material={material}
                    selected={selectedMaterial === material.id}
                    onSelect={() => handleSelectMaterial(material.id)}
                    disabled={budget < material.cost || isGameOver}
                    formatter={formatter}
                  />
                ))}
              </div>
            </div>
            
            {/* Game Controls */}
            <div className="flex justify-between space-x-3">
              <Button 
                className="flex-1" 
                variant="outline" 
                onClick={resetGame}
              >
                Reset Game
              </Button>
              
              <Button 
                className="flex-1 bg-blue-600 text-white" 
                onClick={handleNextRound}
                disabled={isGameOver}
              >
                Ronde Berikutnya <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
          
          {/* Middle Panel - Game Board */}
          <div className="lg:col-span-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="font-bold text-gray-800 mb-3">Peta Pembangunan</h2>
              
              {/* Weather indicator */}
              {currentWeather && (
                <div className="mb-3 bg-blue-50 p-2 rounded-md flex items-center text-sm border border-blue-200">
                  {weatherEvents.find(w => w.type === currentWeather)?.icon}
                  <span className="ml-2 font-medium">
                    Cuaca saat ini: {weatherEvents.find(w => w.type === currentWeather)?.label}
                  </span>
                  <span className="ml-auto text-gray-500 text-xs">
                    Berlangsung {weatherCountdown} ronde lagi
                  </span>
                </div>
              )}
              
              {/* Game Board */}
              <div 
                className="grid grid-cols-8 gap-1 w-full aspect-square" 
                style={{ maxWidth: "600px", margin: "0 auto" }}
              >
                {board.map((row, rowIndex) => 
                  row.map((cell, colIndex) => (
                    <GameTile
                      key={`${rowIndex}-${colIndex}`}
                      content={cell}
                      onClick={() => handlePlaceItem(rowIndex, colIndex)}
                      materials={materials}
                    />
                  ))
                )}
              </div>
              
              {/* Game Instructions */}
              <div className="mt-4 text-sm text-gray-600">
                <p>Klik pada material bangunan, lalu klik pada petak untuk menempatkannya.</p>
                <p className="mt-1">
                  <span className="text-blue-600 font-medium">Tip:</span> Tempatkan pohon di dekat rumah untuk mitigasi panas, dan kolam resapan untuk mengurangi banjir.
                </p>
              </div>
            </div>
          </div>
          
          {/* Right Panel - Event Log */}
          <div className="lg:col-span-3">
            {/* Event Log */}
            <div className="bg-white p-4 rounded-lg shadow-md h-full">
              <h2 className="font-bold text-gray-800 mb-2">Riwayat Kejadian</h2>
              <div 
                className="h-[600px] overflow-y-auto bg-gray-50 p-2 rounded-md text-sm"
                onMouseEnter={() => setIsUserInteracting(true)}
                onMouseLeave={() => setIsUserInteracting(false)}
                onTouchStart={() => setIsUserInteracting(true)}
                onTouchEnd={() => setTimeout(() => setIsUserInteracting(false), 1000)}
              >
                {eventLog.map((event, index) => (
                  <div 
                    key={index} 
                    className={`mb-1 p-1 rounded ${
                      event.type === "success" ? "bg-green-50 text-green-800" :
                      event.type === "warning" ? "bg-yellow-50 text-yellow-800" :
                      event.type === "error" ? "bg-red-50 text-red-800" :
                      event.type === "weather" ? "bg-blue-50 text-blue-800" :
                      event.type === "round" ? "bg-purple-50 text-purple-800 font-bold" :
                      event.type === "negative" ? "bg-red-50 text-red-800" :
                      event.type === "positive" ? "bg-green-50 text-green-800" :
                      "text-gray-800"
                    }`}
                  >
                    {event.message}
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Introduction/Tutorial Modal */}
      <GameIntroModal isOpen={showIntro} onClose={() => setShowIntro(false)} />
      
      {/* Result Modal */}
      <GameResultModal 
        isOpen={showResult} 
        onClose={() => setShowResult(false)} 
        score={score} 
        climateScore={climateScore} 
        onPlayAgain={resetGame} 
      />
      
      <Footer />
    </main>
  );
}