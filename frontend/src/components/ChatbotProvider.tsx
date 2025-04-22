'use client';

import { useState, useEffect } from 'react';
import SmartChatButton from './SmartChatButton';

// This component can be added to your app layout to provide the chatbot functionality
const ChatbotProvider = () => {
  const [isMounted, setIsMounted] = useState(false);
  
  // Only render the chat button on the client-side to avoid hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null;
  }
  
  return <SmartChatButton />;
};

export default ChatbotProvider;