"use client";

import { Property } from "@/types";
import { ReactNode } from "react";

interface AIRecommendationProps {
  property: Property;
  recommendation: string | null;
  isLoading: boolean;
  error: string | null;
  onGetRecommendation: () => void;
}

export default function AIRecommendation({ 
  property, 
  recommendation, 
  isLoading, 
  error, 
  onGetRecommendation 
}: AIRecommendationProps) {
  
  // Function to format the recommendation text with proper paragraphs and styling
  const formatRecommendation = (text: string): ReactNode => {
    if (!text) return null;
    
    // Clean up the text: remove triple dashes and replace with spacing
    const cleanedText = text.replace(/---+/g, '').replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Simple function to convert **text** to bold text
    const makeBold = (str: string) => {
      return str.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    };
    
    // Split by double line breaks to get paragraphs
    const paragraphs = cleanedText.split(/\n\s*\n/);
    
    return (
      <div className="space-y-4">
        {paragraphs.map((paragraph, idx) => {
          // Skip empty paragraphs
          if (!paragraph.trim()) return null;
          
          // Check if this is a header paragraph (like "AI Rekomendasi Properti")
          if (paragraph.trim() === "AI Rekomendasi Properti") {
            return (
              <h3 key={`header-${idx}`} className="font-bold text-xl mb-4 text-gray-800">
                {paragraph}
              </h3>
            );
          }
          
          // Check if this paragraph starts with a section name
          const sectionMatch = paragraph.match(/^(Aspek|Faktor|Rekomendasi)[A-Za-z\s]+:/);
          if (sectionMatch) {
            return (
              <h4 key={`section-${idx}`} className="font-bold text-lg mb-3 mt-5 text-gray-800">
                {paragraph.split(':')[0]}:
              </h4>
            );
          }
          
          // For regular paragraphs, split by lines to handle potential lists
          const lines = paragraph.split('\n');
          return (
            <div key={`para-${idx}`} className="mb-4">
              {lines.map((line, lineIdx) => {
                // Skip empty lines or lines that are just dashes
                if (!line.trim() || line.trim().match(/^-+$/)) return null;
                
                // Convert **text** to bold
                const htmlWithBold = makeBold(line);
                
                // Check if this is a list item (starts with - or number)
                const isListItem = line.trim().match(/^(-|\d+\.)\s/);
                
                if (isListItem) {
                  return (
                    <div key={`list-${lineIdx}`} className="flex ml-2 mb-2">
                      <span className="mr-2 font-semibold">{line.split(' ')[0]}</span>
                      <span 
                        className="text-gray-700 flex-1"
                        dangerouslySetInnerHTML={{ 
                          __html: makeBold(line.substring(line.indexOf(' ') + 1)) 
                        }}
                      />
                    </div>
                  );
                }
                
                return (
                  <p 
                    key={`line-${lineIdx}`} 
                    className="mb-2 text-gray-700"
                    dangerouslySetInnerHTML={{ __html: htmlWithBold }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="mt-6 bg-blue-50 rounded-lg border border-blue-200 p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">AI Rekomendasi Properti</h3>
      
      {recommendation ? (
        <div className="prose prose-sm max-w-none text-gray-700">
          {formatRecommendation(recommendation)}
        </div>
      ) : (
        <p className="text-gray-600 mb-4">
          Dapatkan analisis dan rekomendasi AI tentang properti ini berdasarkan data iklim, lokasi, dan value for money.
        </p>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {!recommendation && !isLoading && (
        <button
          onClick={onGetRecommendation}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
          Dapatkan Rekomendasi AI
        </button>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-blue-600">AI sedang menganalisis, Tunggu ya!</span>
        </div>
      )}
    </div>
  );
}