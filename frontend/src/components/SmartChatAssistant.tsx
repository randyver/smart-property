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
    'Bagaimana risiko banjir dihitung?',
    'Bagaimana cara membandingkan properti?',
    'Dampak iklim pada harga?',
    'Bagaimana rekomendasi bekerja?',
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
        content: "Sorry, I am having difficulty accessing the knowledge base at the moment. Please try again or ask another question.",
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
        content: "Sorry, I am having difficulty accessing the knowledge base at the moment. Please try again or ask another question.",
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
    <div className="fixed bottom-4 right-4 w-80 md:w-96 h-[500px] flex flex-col bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      {/* Header with Beta label */}
      <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-blue-600 text-white rounded-t-lg relative">
        <div className="flex items-center">
          <h3 className="font-bold">SmartProperty Assistant</h3>
          {/* <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-blue-900 text-xs font-bold rounded-full">BETA</span> */}
        </div>
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
      
      {/* Messages Container - Using grid for better message bubbles */}
      <div 
        ref={messageContainerRef}
        className="flex-1 p-4 overflow-y-auto bg-gray-50 custom-scrollbar"
      >
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-4 ${message.role === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}
          >
            <div className="flex items-end gap-2">
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                </div>
              )}
              
              <div 
                className={`rounded-xl px-4 py-2 max-w-[75%] text-sm ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none break-words' 
                    : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-200 break-words'
                }`}
              >
                {formatMessage(message.content)}
              </div>
              
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white">
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
          <div className="mb-4 flex items-end gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
            </div>
            <div className="rounded-xl px-4 py-2 bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-200">
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
      
      {/* Suggested Questions - Improved scrolling */}
      <div className="px-3 py-2 bg-white border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">Quick Questions:</p>
        <div className="overflow-x-auto pb-1 custom-scrollbar">
          <div className="flex space-x-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuestionClick(question)}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 whitespace-nowrap flex-shrink-0"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Input Area - Enhanced with focus state */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-200 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question here..."
          className="flex-1 border border-gray-300 text-black rounded-l-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
          disabled={isTyping}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </form>
      
      {/* Custom scrollbar style */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
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