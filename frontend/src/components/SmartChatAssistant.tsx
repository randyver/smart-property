'use client';

import { useState, useRef, useEffect } from 'react';
import { generateResponse } from '../services/chatbot-api-service';

interface ChatAssistantProps {
  onClose: () => void;
  isOpen: boolean;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SmartChatAssistant = ({ onClose, isOpen }: ChatAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your SmartProperty assistant. How can I help you with finding climate-safe properties today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Suggested questions that users might want to ask
  const suggestedQuestions = [
    'What do the climate scores mean?',
    'How is flood risk calculated?',
    'How do I compare properties?',
    'How do climate factors affect price?',
    'How do recommendations work?',
    'Tell me about Bandung properties'
  ];
  
  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    try {
      // Format messages for the AI service
      const messageHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add the new user message
      messageHistory.push({
        role: 'user',
        content: input
      });
      
      // Get AI response
      const aiResponse = await generateResponse(messageHistory);
      
      // Add bot response
      const botResponse: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback response in case of error
      const fallbackResponse: Message = {
        role: 'assistant',
        content: "I'm having trouble connecting to my knowledge base right now. Please try again in a moment or ask a different question.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleQuestionClick = async (question: string) => {
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: question,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      // Format messages for the AI service
      const messageHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add the new user message
      messageHistory.push({
        role: 'user',
        content: question
      });
      
      // Get AI response
      const aiResponse = await generateResponse(messageHistory);
      
      // Add bot response
      const botResponse: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback response in case of error
      const fallbackResponse: Message = {
        role: 'assistant',
        content: "I'm having trouble connecting to my knowledge base right now. Please try again in a moment or ask a different question.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed bottom-4 right-4 w-80 md:w-96 h-96 flex flex-col bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-blue-600 text-white rounded-t-lg">
        <h3 className="font-bold">SmartProperty Assistant</h3>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-200"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-3 ${message.role === 'user' ? 'text-right' : ''}`}
          >
            <div 
              className={`inline-block p-3 rounded-lg max-w-[85%] ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-200'
              }`}
            >
              <p className="whitespace-pre-line">{message.content}</p>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="mb-3">
            <div className="inline-block p-3 rounded-lg bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-200">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Suggested Questions */}
      <div className="px-3 pb-2 pt-1 border-t border-gray-200 overflow-x-auto whitespace-nowrap hide-scrollbar">
        <div className="flex space-x-2">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuestionClick(question)}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 whitespace-nowrap"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
      
      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-200 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question here..."
          className="flex-1 border border-gray-300 text-black rounded-l-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </form>
      
      {/* Custom scrollbar style */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default SmartChatAssistant;