// frontend/src/services/chatbot-api-service.ts

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Configuration for OpenRouter API
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = "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";

// Optional fallback to local knowledge in case the API fails
import { smartPropertyKnowledge } from './smartproperty-knowledge';

/**
 * Generate a chatbot response using the OpenRouter API with DeepSeek
 * @param messageHistory Array of chat messages
 * @returns A Promise that resolves to the chatbot's response as a string
 */
export async function generateResponse(messageHistory: ChatMessage[]): Promise<string> {
  try {
    // Format the messages for the OpenAI format expected by OpenRouter
    const formattedMessages = messageHistory.map(message => ({
      role: message.role,
      content: message.content
    }));

    // Add system message to provide context about SmartProperty
    const systemMessage = {
      role: "system",
      content: `You are an assistant for SmartProperty, a platform that helps users find climate-safe properties through advanced GIS analysis and climate risk assessment. 
      
      SmartProperty evaluates properties based on climate scores including:
      - LST (Land Surface Temperature)
      - NDVI (Normalized Difference Vegetation Index)
      - UTFVI (Urban Thermal Field Variance Index)
      - UHI (Urban Heat Island)
      
      Climate scores range from 0-100, with higher scores indicating better climate safety.
      
      Provide helpful, accurate information about property climate risks, the platform features, and how users can make informed real estate decisions with climate data.
      
      Be friendly, professional, and concise in your responses.`
    };
    
    // Prepare the request payload
    const payload = {
      model: "deepseek/deepseek-chat", // Using DeepSeek model through OpenRouter
      messages: [systemMessage, ...formattedMessages],
      temperature: 0.7,
      max_tokens: 1000
    };

    // Make the API request
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://smartproperty.app", // Replace with your actual domain if needed
        "X-Title": "SmartProperty Assistant"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API request failed:", response.status, errorText);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the assistant's message from the response
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    }
    
    throw new Error('Invalid response format from API');
  } catch (error) {
    console.error('Error generating chatbot response:', error);
    
    // Fall back to local knowledge if API fails
    return getFallbackResponse(messageHistory[messageHistory.length - 1].content);
  }
}

/**
 * Provide a fallback response based on local knowledge when the API call fails
 * @param userMessage The user's latest message
 * @returns A response string
 */
function getFallbackResponse(userMessage: string): string {
  // Use the local knowledge system as a fallback
  const userMessageLower = userMessage.toLowerCase();
  
  // Check for direct matches in common questions
  for (const qa of smartPropertyKnowledge.commonQuestions) {
    if (userMessageLower.includes(qa.question.toLowerCase())) {
      return qa.answer;
    }
  }
  
  // Handle general climate score questions
  if (userMessageLower.includes('climate score') || userMessageLower.includes('what are climate')) {
    return smartPropertyKnowledge.climateScores.overview;
  }
  
  // Generic fallback message
  return "I apologize, but I'm currently having difficulty connecting to my knowledge base. SmartProperty helps you find climate-safe properties using advanced GIS analysis. For specific questions about climate scores, property comparisons, or environmental risk factors, please try again later or contact support.";
}