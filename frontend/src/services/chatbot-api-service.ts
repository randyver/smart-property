// Chatbot service that uses the backend proxy API
// Path: frontend/src/services/chatbot-api-service.ts

import { smartPropertyKnowledge } from './smartproperty-knowledge';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const CHATBOT_API_ENDPOINT = `${API_BASE_URL}/api/chatbot/message`;

export async function generateResponse(messageHistory: ChatMessage[]): Promise<string> {
  try {
    // First, check if we have a direct match in our knowledge base
    // This provides instant responses without waiting for API
    const lastUserMessage = messageHistory[messageHistory.length - 1].content.toLowerCase();
    const localKnowledgeResponse = getResponseFromLocalKnowledge(lastUserMessage);
    
    // If we have a good match locally, return it without API call
    if (localKnowledgeResponse) {
      return localKnowledgeResponse;
    }
    
    // Call the backend API with the message history
    const response = await fetch(CHATBOT_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messageHistory
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'success' && data.response) {
      return data.response;
    }
    
    throw new Error('Invalid response from API');
  } catch (error) {
    console.error('Error generating chatbot response:', error);
    
    // If API call fails, fall back to local response generation
    return getFallbackResponse(messageHistory[messageHistory.length - 1].content);
  }
}

// Function to get responses directly from our knowledge base
function getResponseFromLocalKnowledge(userMessage: string): string | null {
  // Match common questions exactly
  for (const qa of smartPropertyKnowledge.commonQuestions) {
    if (userMessage.includes(qa.question.toLowerCase())) {
      return qa.answer;
    }
  }
  
  // Handle questions about climate scores
  if (userMessage.includes('climate score') || userMessage.includes('climate safety')) {
    return smartPropertyKnowledge.climateScores.overview + '\n\n' + 
           smartPropertyKnowledge.climateScores.components.map(comp => 
             `${comp.name}: ${comp.description}`
           ).join('\n\n');
  }
  
  // Handle questions about specific climate metrics
  if (userMessage.includes('lst') || userMessage.includes('land surface temperature')) {
    const component = smartPropertyKnowledge.climateScores.components.find(c => c.name.includes('LST'));
    return component ? `${component.name}: ${component.description}\n\nImpact on property value: ${component.impactOnPrice}` : null;
  }
  
  if (userMessage.includes('ndvi') || userMessage.includes('vegetation')) {
    const component = smartPropertyKnowledge.climateScores.components.find(c => c.name.includes('NDVI'));
    return component ? `${component.name}: ${component.description}\n\nImpact on property value: ${component.impactOnPrice}` : null;
  }
  
  if (userMessage.includes('utfvi') || userMessage.includes('thermal field')) {
    const component = smartPropertyKnowledge.climateScores.components.find(c => c.name.includes('UTFVI'));
    return component ? `${component.name}: ${component.description}\n\nImpact on property value: ${component.impactOnPrice}` : null;
  }
  
  if (userMessage.includes('uhi') || userMessage.includes('heat island')) {
    const component = smartPropertyKnowledge.climateScores.components.find(c => c.name.includes('UHI'));
    return component ? `${component.name}: ${component.description}\n\nImpact on property value: ${component.impactOnPrice}` : null;
  }
  
  // Handle questions about flood risk
  if (userMessage.includes('flood')) {
    return `Flood Risk Assessment: ${smartPropertyKnowledge.riskLevels.floodRisk.veryLow}\n\n` +
           `Properties with low flood risk ("Very Low" or "Low" ratings) tend to maintain their value better during extreme weather events and rainy seasons.`;
  }
  
  // Handle questions about comparing properties
  if (userMessage.includes('compare') || userMessage.includes('comparison')) {
    return smartPropertyKnowledge.platformFeatures.propertyComparison;
  }
  
  // No exact match found
  return null;
}

// Fallback responses for when the API fails
function getFallbackResponse(userMessage: string): string {
  const normalizedMessage = userMessage.toLowerCase();
  
  // Predefined responses based on keywords
  if (normalizedMessage.includes('climate') || normalizedMessage.includes('score')) {
    return 'Climate scores measure how safe a property is from climate risks. The scoring includes LST (Land Surface Temperature), NDVI (Vegetation Index), UTFVI (Urban Thermal Field), and UHI (Urban Heat Island). Scores range from 0-100, with higher scores indicating better climate safety.';
  } else if (normalizedMessage.includes('flood') || normalizedMessage.includes('risk')) {
    return 'Flood risk is calculated based on historical data, elevation, and proximity to water bodies. Properties with higher flood risk scores have better drainage systems and are situated in areas less prone to flooding.';
  } else if (normalizedMessage.includes('compare') || normalizedMessage.includes('comparison')) {
    return 'You can compare properties by clicking the "Compare" button on property cards. Select up to 3 properties and then click the "Compare" button to see a detailed side-by-side comparison.';
  } else if (normalizedMessage.includes('price') || normalizedMessage.includes('cost')) {
    return 'Property prices are influenced by location, size, amenities, and climate safety. Our data shows that properties with better climate scores often command a premium of 5-15% over similar properties with lower scores.';
  } else if (normalizedMessage.includes('recommend') || normalizedMessage.includes('suggestion')) {
    return 'Our recommendation engine analyzes your preferences and prioritizes properties with better climate safety scores. Visit the Recommendations page to set your preferences.';
  } else if (normalizedMessage.includes('bandung') || normalizedMessage.includes('location')) {
    return 'Our platform currently focuses on properties in Bandung, Indonesia. Bandung has varying climate safety profiles across its districts.';
  } else if (normalizedMessage.includes('hello') || normalizedMessage.includes('hi')) {
    return 'Hello! How can I help you with finding climate-safe properties today?';
  } else {
    return "I can help you with understanding climate scores, finding properties, comparing options, and learning about our recommendation system. What would you like to know?";
  }
}

export default {
  generateResponse
};