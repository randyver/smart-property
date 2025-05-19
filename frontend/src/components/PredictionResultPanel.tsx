"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Building, Ruler, CheckCircle2 } from "lucide-react";

interface PredictionResultPanelProps {
  prediction: number;
  predictionFactors: {
    basePrice: number;
    certificateImpact: number;
    propertyTypeImpact: number;
    bedroomsImpact: number;
    climateImpact: number;
  };
}

export default function PredictionResultPanel({
  prediction,
  predictionFactors,
}: PredictionResultPanelProps) {
  // State for AI recommendation
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Format harga untuk tampilan
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Function to generate AI recommendation using OpenRouter
  const generateAIRecommendation = async () => {
    setIsLoadingAI(true);
    setAiError(null);
    console.log("climate impact: ", predictionFactors.climateImpact);
    try {
      // Configuration for OpenRouter API
      const OPENROUTER_API_URL =
        "https://openrouter.ai/api/v1/chat/completions";
      const OPENROUTER_API_KEY =
        "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";

      // Create a detailed prompt based on the prediction data
      const propertyDetails = `
        Harga Properti yang Diprediksi: ${formatPrice(prediction)}
        Harga Tanah per meter: ${formatPrice(predictionFactors.basePrice)}
        Sertifikat: ${predictionFactors.certificateImpact}
        Jenis Properti: ${predictionFactors.propertyTypeImpact}
        Kamar Tidur: ${predictionFactors.bedroomsImpact}
        Skor Iklim: ${predictionFactors.climateImpact}
      `;

      // Prepare the system message
      const systemMessage = {
        role: "system",
        content: `Anda adalah asisten AI untuk SmartProperty, platform yang membantu pengembang dan investor properti mendapatkan prediksi harga dan rekomendasi pengembangan.
        
        Berdasarkan data prediksi harga properti, berikan rekomendasi pengembangan yang terstruktur dalam dua kategori utama:
        1. "Berdasarkan Analisis Iklim" - Fokus pada bagaimana meningkatkan nilai properti dengan mempertimbangkan faktor iklim dan lingkungan
        2. "Berdasarkan Nilai Pasar" - Fokus pada fitur dan karakteristik properti yang dapat meningkatkan nilai jualnya di pasar
        
        Untuk setiap kategori, berikan 3-4 poin rekomendasi spesifik dan praktis. Jika dampak iklim negatif, berikan lebih banyak saran terkait iklim. Jika dampak sertifikat atau jenis properti rendah, berikan lebih banyak saran untuk meningkatkan aspek tersebut.
        
        Gunakan bahasa Indonesia yang jelas dan profesional. Buat rekomendasi yang dapat ditindaklanjuti.
        
        FORMAT RESPONS ANDA SEPERTI INI:
        ## Berdasarkan Analisis Iklim
        - Rekomendasi 1
        - Rekomendasi 2
        - Rekomendasi 3
        
        ## Berdasarkan Nilai Pasar
        - Rekomendasi 1
        - Rekomendasi 2
        - Rekomendasi 3`,
      };

      // Prepare the user message
      const userMessage = {
        role: "user",
        content: `Tolong berikan rekomendasi pengembangan untuk properti dengan data prediksi berikut:\n\n${propertyDetails}`,
      };

      // Prepare the request payload
      const payload = {
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [systemMessage, userMessage],
        temperature: 0.2,
        max_tokens: 1000,
      };

      // Make the API request
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://smartproperty.app",
          "X-Title": "SmartProperty AI Recommendation",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Extract the AI's recommendation
      if (data.choices && data.choices.length > 0) {
        setAiRecommendation(data.choices[0].message.content);
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (error) {
      console.error("Error generating AI recommendation:", error);
      setAiError("Gagal mendapatkan rekomendasi AI. Silakan coba lagi nanti.");

      // Fallback recommendation if API fails
      setAiRecommendation(`
## Berdasarkan Analisis Iklim
- Pertimbangkan untuk menanam pohon atau tanaman di sekitar properti untuk meningkatkan skor NDVI
- Gunakan material atap yang reflektif untuk mengurangi penyerapan panas
- Pertimbangkan sistem drainase yang baik untuk mengurangi risiko banjir

## Berdasarkan Nilai Pasar
- Fokus pada fitur yang meningkatkan efisiensi energi untuk nilai jual lebih tinggi
- Sesuaikan jumlah kamar tidur dengan permintaan pasar di area tersebut
- Pertimbangkan untuk memperoleh sertifikat SHM untuk nilai properti yang lebih tinggi`);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Generate AI recommendation when component mounts
  useEffect(() => {
    generateAIRecommendation();
  }, [prediction]); // Re-generate when prediction changes

  // Function to format the recommendation text with proper formatting
  // Function to format the recommendation text with proper formatting
  const formatRecommendation = (text: string) => {
    if (!text) return null;

    // Split the text by sections (## headers)
    const sections = text.split(/(?=##)/);

    // Function to process text and convert asterisks to bold formatting
    const processBoldText = (content: string) => {
      // Replace **bold text** patterns with <strong> tags
      return content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    };

    return (
      <>
        {sections.map((section, index) => {
          // Skip empty sections
          if (!section.trim()) return null;

          // Split section into title and content
          const lines = section.split("\n").filter((line) => line.trim());
          const title = lines[0].replace(/^##\s*/, "");

          // Extract items, remove leading asterisks, and process bold text
          const items = lines
            .slice(1)
            .map((line) => line.trim())
            .filter(
              (line) =>
                line.startsWith("-") ||
                line.startsWith("•") ||
                line.startsWith("*")
            );

          return (
            <div key={index} className={index > 0 ? "mt-6" : ""}>
              <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                {items.map((item, idx) => {
                  // Remove leading markers and any asterisks used for bullet points
                  let cleanItem = item.replace(/^[•\-\*]+\s*/, "");

                  // Process bold text (text between double asterisks)
                  const formattedText = processBoldText(cleanItem);

                  return (
                    <li key={idx} className="flex items-start">
                      <div
                        className={
                          index === 0
                            ? "text-green-600 mr-2 mt-0.5"
                            : "text-blue-600 mr-2 mt-0.5"
                        }
                      >
                        •
                      </div>
                      <span
                        dangerouslySetInnerHTML={{ __html: formattedText }}
                      ></span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Hasil Prediksi Harga Properti
      </h2>

      <div className="grid grid-cols-1 gap-6">
        {/* Panel Hasil Harga */}
        <div className="bg-green-50 p-6 border border-green-200 rounded-lg">
          <h3 className="font-bold text-xl text-gray-800 mb-3">
            Prediksi Harga Properti
          </h3>
          <p className="text-3xl font-bold text-green-700 mb-4">
            {formatPrice(prediction)}
          </p>

          <div className="text-sm text-gray-600 mb-4">
            <p>
              Prediksi ini didasarkan pada detail properti yang Anda berikan dan
              skor iklim lokasi.
            </p>
            <p className="mt-2 italic">
              Harga properti sebenarnya dapat bervariasi tergantung pada kondisi
              pasar dan faktor lainnya.
            </p>
          </div>
        </div>

        {/* Rekomendasi dengan AI */}
        <div className="mt-6 bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="font-bold text-xl text-gray-800 mb-3">
            Rekomendasi Pengembangan
          </h3>

          {isLoadingAI ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-blue-600">
                AI sedang menganalisis, Tunggu ya!
              </span>
            </div>
          ) : aiError ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
              <p>{aiError}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              {formatRecommendation(aiRecommendation || "")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
