// Chatbot service that uses the backend proxy API or falls back to local knowledge
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
  if (userMessage.includes('climate score') || userMessage.includes('climate safety') || userMessage.includes('what are climate')) {
    return smartPropertyKnowledge.climateScores.overview + '\n\n' + 
           'Climate scores are composed of several key factors:\n\n' +
           smartPropertyKnowledge.climateScores.components.map(comp => 
             `${comp.name}: ${comp.description}`
           ).join('\n\n') + '\n\n' +
           'Score ranges:\n' +
           Object.entries(smartPropertyKnowledge.climateScores.scoreMeaning)
             .map(([range, meaning]) => `${range}: ${meaning}`)
             .join('\n');
  }
  
  // Handle questions about specific climate metrics
  if (userMessage.includes('lst') || userMessage.includes('land surface temperature')) {
    const component = smartPropertyKnowledge.climateScores.components.find(c => c.name.includes('LST'));
    return component ? 
      `${component.name}: ${component.description}\n\n${component.detailedExplanation}\n\nImpact on property value: ${component.impactOnPrice}\n\nIn Bandung: ${component.bandungContext}` : null;
  }
  
  if (userMessage.includes('ndvi') || userMessage.includes('vegetation')) {
    const component = smartPropertyKnowledge.climateScores.components.find(c => c.name.includes('NDVI'));
    return component ? 
      `${component.name}: ${component.description}\n\n${component.detailedExplanation}\n\nImpact on property value: ${component.impactOnPrice}\n\nIn Bandung: ${component.bandungContext}` : null;
  }
  
  if (userMessage.includes('utfvi') || userMessage.includes('thermal field')) {
    const component = smartPropertyKnowledge.climateScores.components.find(c => c.name.includes('UTFVI'));
    return component ? 
      `${component.name}: ${component.description}\n\n${component.detailedExplanation}\n\nImpact on property value: ${component.impactOnPrice}\n\nIn Bandung: ${component.bandungContext}` : null;
  }
  
  if (userMessage.includes('uhi') || userMessage.includes('heat island')) {
    const component = smartPropertyKnowledge.climateScores.components.find(c => c.name.includes('UHI'));
    return component ? 
      `${component.name}: ${component.description}\n\n${component.detailedExplanation}\n\nImpact on property value: ${component.impactOnPrice}\n\nIn Bandung: ${component.bandungContext}` : null;
  }
  
  // Handle questions about flood risk
  if (userMessage.includes('flood')) {
    return `${smartPropertyKnowledge.riskLevels.floodRisk.explanation}\n\n` +
           'Flood risk levels:\n' +
           `Very Low: ${smartPropertyKnowledge.riskLevels.floodRisk.veryLow}\n` +
           `Low: ${smartPropertyKnowledge.riskLevels.floodRisk.low}\n` +
           `Medium: ${smartPropertyKnowledge.riskLevels.floodRisk.medium}\n` +
           `High: ${smartPropertyKnowledge.riskLevels.floodRisk.high}\n` +
           `Very High: ${smartPropertyKnowledge.riskLevels.floodRisk.veryHigh}\n\n` +
           `Price impact: ${smartPropertyKnowledge.priceImpacts.floodRisk}`;
  }
  
  // Handle questions about comparing properties
  if (userMessage.includes('compare') || userMessage.includes('comparison')) {
    return smartPropertyKnowledge.commonQuestions.find(
      q => q.question.toLowerCase().includes('compare')
    )?.answer || smartPropertyKnowledge.platformFeatures.propertyComparison;
  }
  
  // Handle questions about recommendations
  if (userMessage.includes('recommend') || userMessage.includes('suggestion')) {
    return smartPropertyKnowledge.commonQuestions.find(
      q => q.question.toLowerCase().includes('recommendation')
    )?.answer || smartPropertyKnowledge.platformFeatures.recommendations;
  }
  
  // Handle questions about Bandung properties
  if (userMessage.includes('bandung') || userMessage.includes('best propert')) {
    return smartPropertyKnowledge.commonQuestions.find(
      q => q.question.toLowerCase().includes('best properties')
    )?.answer || `${smartPropertyKnowledge.bandungSpecific.overview}\n\n` +
    'Different areas of Bandung have distinct climate profiles:\n\n' +
    `North: ${smartPropertyKnowledge.bandungSpecific.districts.north}\n\n` +
    `Central: ${smartPropertyKnowledge.bandungSpecific.districts.central}\n\n` +
    `South: ${smartPropertyKnowledge.bandungSpecific.districts.south}\n\n` +
    `East: ${smartPropertyKnowledge.bandungSpecific.districts.east}\n\n` +
    `West: ${smartPropertyKnowledge.bandungSpecific.districts.west}`;
  }
  
  // Handle questions about price impact
  if (userMessage.includes('price') || userMessage.includes('value') || userMessage.includes('cost')) {
    return smartPropertyKnowledge.commonQuestions.find(
      q => q.question.toLowerCase().includes('affect property value')
    )?.answer || `${smartPropertyKnowledge.priceImpacts.overview}\n\n` +
    'Climate factors affect property prices in different ways:\n\n' +
    `Flood Risk: ${smartPropertyKnowledge.priceImpacts.floodRisk}\n\n` +
    `Temperature: ${smartPropertyKnowledge.priceImpacts.temperature}\n\n` +
    `Air Quality: ${smartPropertyKnowledge.priceImpacts.airQuality}\n\n` +
    `Green Space: ${smartPropertyKnowledge.priceImpacts.greenSpace}`;
  }
  
  // No exact match found
  return null;
}

function getFallbackResponse(content: string): string | PromiseLike<string> {
  throw new Error('Function not implemented.');
}
