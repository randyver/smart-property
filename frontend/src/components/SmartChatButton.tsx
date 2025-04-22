'use client';

import { useState } from 'react';
import SmartChatAssistant from './SmartChatAssistant';

const SmartChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={toggleChat}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 relative"
          aria-label="Chat Assistant"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
              
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">1</span>
              </span>
            </>
          )}
        </button>
        
        {/* Beta label on the button when closed */}
        {!isOpen && (
          <div className="absolute bottom-[20px] right-[-40px] bg-yellow-500 text-blue-900 text-xs font-bold py-0.5 px-2 rounded-full animate-pulse shadow-md">
            BETA
          </div>
        )}
      </div>
      
      <SmartChatAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default SmartChatButton;