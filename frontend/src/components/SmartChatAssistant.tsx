'use client';

import { useState, useRef, useEffect } from 'react';
import { generateResponse } from '../services/chatbot-api-service';
import { Bot, Send, X } from 'lucide-react';

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
      content: 'Selamat datang pada SmartProperty Assistant! Aku bisa membantu kamu mencari informasi properti ramah iklim. Apa yang ingin kamu tahu?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  
  const suggestedQuestions = [
    'Apa itu Score Iklim?',
    'Apa itu UHI, UTFVI, LST, dan NDVI?',
    'Apa itu Properti Ramah Iklim?',
    'Dampak iklim pada harga?',
    'Properti terbaik di Bandung?'
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
        content: "Maaf, saya sedang kesulitan mengakses basis pengetahuan. Silakan coba lagi atau ajukan pertanyaan lain.",
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
        content: "Maaf, saya sedang kesulitan mengakses basis pengetahuan. Silakan coba lagi atau ajukan pertanyaan lain.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const formatMessage = (content: string) => {
    // Split by newlines and add <p> tags
    const paragraphs = content.split('\n\n').filter(Boolean);
    
    if (paragraphs.length <= 1) {
      return <p className="whitespace-pre-line">{content}</p>;
    }
    
    return (
      <>
        {paragraphs.map((paragraph, idx) => (
          <p key={idx} className="mb-2 whitespace-pre-line">
            {paragraph}
          </p>
        ))}
      </>
    );
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed bottom-4 right-4 w-[90%] max-w-md h-[500px] md:h-[550px] flex flex-col bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      {/* Header with chatbot icon */}
      <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-blue-600 text-white rounded-t-lg relative">
        <div className="flex items-center space-x-2">
          <Bot size={20} />
          <h3 className="font-bold">SmartProperty Assistant</h3>
        </div>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-blue-700 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>
      
      {/* Messages Container */}
      <div 
        ref={messageContainerRef}
        className="flex-1 p-3 sm:p-4 overflow-y-auto bg-gray-50 custom-scrollbar"
      >
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-3 ${message.role === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}
          >
            <div className="flex items-end gap-2 max-w-full">
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
                  <Bot size={18} />
                </div>
              )}
              
              <div 
                className={`rounded-xl px-3 py-2 text-sm ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none break-words' 
                    : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-200 break-words'
                } max-w-[85%]`}
              >
                {formatMessage(message.content)}
              </div>
              
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className={`text-xs text-gray-500 mt-1 ${message.role === 'user' ? 'text-right mr-10' : 'ml-10'}`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="mb-3 flex items-end gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
              <Bot size={18} />
            </div>
            <div className="rounded-xl px-3 py-2 bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-200">
              <div className="flex items-center space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Suggested Questions - Improved scrolling and responsive design */}
      <div className="px-3 py-2 bg-white border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-1.5">Pertanyaan Cepat:</p>
        <div className="overflow-x-auto pb-1 custom-scrollbar -mx-1 px-1">
          <div className="flex gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuestionClick(question)}
                className="px-3 py-1.5 text-xs bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 whitespace-nowrap flex-shrink-0 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Input Area - Enhanced with focus state and responsive design */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-200 flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik pertanyaanmu disini..."
          className="flex-1 border border-gray-300 text-sm sm:text-base text-black rounded-l-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded-r-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 flex items-center justify-center"
          disabled={isTyping}
        >
          <Send size={20} className="transform rotate-45" />
        </button>
      </form>
      
      {/* Custom scrollbar style */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #CBD5E0;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #A0AEC0;
        }
      `}</style>
    </div>
  );
};

export default SmartChatAssistant;