"use client";

import { useState, useRef, useEffect } from "react";
import { generateResponse } from "../services/chatbot-api-service";
import { Bot, Send, X } from "lucide-react";

interface ChatAssistantProps {
  onClose: () => void;
  isOpen: boolean;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const STORAGE_KEY = "smartPropertyChatMessages";

const SmartChatAssistant = ({ onClose, isOpen }: ChatAssistantProps) => {
  // Initialize messages from localStorage or default message
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const savedMessages = localStorage.getItem(STORAGE_KEY);
      if (savedMessages) {
        try {
          // Parse saved messages and convert timestamp strings back to Date objects
          return JSON.parse(savedMessages).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        } catch (error) {
          console.error("Error parsing saved messages:", error);
        }
      }
    }
    // Default initial message if nothing in localStorage
    return [
      {
        role: "assistant",
        content:
          "Selamat datang pada SmartProperty Assistant! Aku bisa membantu kamu mencari informasi properti ramah iklim. Apa yang ingin kamu tahu?",
        timestamp: new Date(),
      },
    ];
  });
  
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Apa itu Score Iklim?",
    "Apa itu UHI, UTFVI, LST, dan NDVI?",
    "Apa itu Properti Ramah Iklim?",
    "Dampak iklim pada harga?",
    "Properti terbaik di Bandung?",
  ];

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === "") return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Format messages for the AI service
      const messageHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add the new user message
      messageHistory.push({
        role: "user",
        content: input,
      });

      // Get AI response
      const aiResponse = await generateResponse(messageHistory);

      // Add bot response
      const botResponse: Message = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error getting AI response:", error);

      // Fallback response in case of error
      const fallbackResponse: Message = {
        role: "assistant",
        content:
          "Maaf, saya sedang kesulitan mengakses basis pengetahuan. Silakan coba lagi atau ajukan pertanyaan lain.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuestionClick = async (question: string) => {
    // Add user message
    const userMessage: Message = {
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Format messages for the AI service
      const messageHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add the new user message
      messageHistory.push({
        role: "user",
        content: question,
      });

      // Get AI response
      const aiResponse = await generateResponse(messageHistory);

      // Add bot response
      const botResponse: Message = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error getting AI response:", error);

      // Fallback response in case of error
      const fallbackResponse: Message = {
        role: "assistant",
        content:
          "Maaf, saya sedang kesulitan mengakses basis pengetahuan. Silakan coba lagi atau ajukan pertanyaan lain.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  // Function to clear chat history
  const clearChatHistory = () => {
    const initialMessage = {
      role: "assistant" as const,
      content:
        "Selamat datang pada SmartProperty Assistant! Aku bisa membantu kamu mencari informasi properti ramah iklim. Apa yang ingin kamu tahu?",
      timestamp: new Date(),
    };
    
    setMessages([initialMessage]);
    // This will trigger the useEffect to update localStorage
  };

  const formatMessage = (content: string) => {
    // First, ensure all line breaks are preserved by detecting different list patterns
    const preprocessLines = (text: string) => {
      // Split text into lines
      const lines = text.split("\n");
      const processedLines = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Check if line starts with a checkmark, bullet, or other list marker
        if (/^[✓✅•\-\*]/.test(line)) {
          // If this is a line that starts with a list marker,
          // ensure it has a line break before it if it's not the first line
          if (i > 0 && processedLines.length > 0) {
            const lastLine: string = processedLines[processedLines.length - 1];
            // If the previous line doesn't end with a line break, add one
            if (!lastLine.endsWith("\n")) {
              processedLines[processedLines.length - 1] = lastLine + "\n";
            }
          }
          processedLines.push(line);
        }
        // Handle continued list items (line breaks within a list item)
        else if (
          i > 0 &&
          /^[✓✅•\-\*]/.test(lines[i - 1].trim()) &&
          line !== "" &&
          !line.match(/^[#✓✅•\-\*\d]/) &&
          !line.match(/^[A-Z][\w\s]+:/)
        ) {
          // This looks like a continuation of a previous list item
          // Append to the previous line rather than creating a new line
          processedLines[processedLines.length - 1] += " " + line;
        } else {
          processedLines.push(line);
        }
      }

      return processedLines.join("\n");
    };

    // Process markdown-style formatting
    const processFormatting = (text: string) => {
      // Handle checkmark items specifically: ✓ Text or ✅ Text
      // This pattern ensures we capture the entire line, including any wrapped content
      text = text.replace(
        /^([✓✅])\s+(.+)$/gm,
        '<div class="flex items-start mb-2"><span class="text-green-500 mr-2 flex-shrink-0">$1</span><span>$2</span></div>'
      );

      // Handle bullet points with location names and specifics in parentheses
      // Example: • Pantai Utara Jakarta (ancaman rob) - turun 25%
      text = text.replace(
        /^([•\-\*])\s+([^(]+)(\s*\([^)]+\))?\s*(-\s*[^•\-\*\n]+)?$/gm,
        '<div class="flex items-start mb-2"><span class="mr-2 flex-shrink-0">$1</span><span class="flex-1">$2$3$4</span></div>'
      );

      // Handle multi-line bullet points with location names that wrap to next line
      text = text.replace(
        /^([•\-\*])\s+([^(]+)(\s*\([^)]+\))?\s*(-\s*[^•\-\*\n]+)?(.+)$/gm,
        (match, bullet, name, parenthetical = "", dash = "", rest = "") => {
          return `<div class="flex items-start mb-2">
                  <span class="mr-2 flex-shrink-0">${bullet}</span>
                  <span class="flex-1">${name}${parenthetical || ""}${
            dash || ""
          }${rest || ""}</span>
                </div>`;
        }
      );

      // The rest of your formatting rules
      // Headers with multiple hash symbols and emojis
      text = text.replace(
        /^(#{1,3})\s+([\p{Emoji}\p{Symbol}\p{Punctuation}]*)\s*(.*?)$/gmu,
        (match, hashes, emoji, title) => {
          const level = hashes.length;
          const sizeClass =
            level === 1 ? "text-xl" : level === 2 ? "text-lg" : "text-base";
          const marginClass =
            level === 1 ? "mt-5 mb-3" : level === 2 ? "mt-4 mb-2" : "mt-3 mb-2";

          return `<h${level} class="font-bold ${sizeClass} ${marginClass} flex items-center">
                  ${emoji ? `<span class="mr-2">${emoji}</span>` : ""}
                  <span>${title}</span>
                </h${level}>`;
        }
      );

      // Bold text
      text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

      // Italic text
      text = text.replace(/\*([^\*]+)\*/g, "<em>$1</em>");

      // URLs to links
      text = text.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
      );

      // Numbered lists
      text = text.replace(
        /^(\d+)\.\s(.+)$/gm,
        '<div class="flex items-start mb-2"><span class="mr-2 flex-shrink-0">$1.</span><span>$2</span></div>'
      );

      return text;
    };

    // Process content with improved list handling
    const processContent = (text: string) => {
      // First preprocess to ensure proper line breaks for lists
      text = preprocessLines(text);

      // Split by double newlines to identify paragraphs
      const paragraphs = text.split("\n\n").filter(Boolean);
      let formattedParagraphs = [];

      for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i].trim();

        // Skip empty paragraphs
        if (!paragraph) continue;

        // Check if this is a header
        if (/^(#{1,3})\s+/.test(paragraph)) {
          formattedParagraphs.push(processFormatting(paragraph));
          continue;
        }

        // Check if this is a list paragraph
        const isListParagraph = paragraph
          .split("\n")
          .some((line) => /^[✓✅•\-\*\d]/.test(line.trim()));

        if (isListParagraph) {
          // Split the paragraph into lines
          const lines = paragraph.split("\n");
          let formattedLines = [];

          for (const line of lines) {
            if (line.trim()) {
              formattedLines.push(processFormatting(line));
            }
          }

          formattedParagraphs.push(
            `<div class="list-container my-2">${formattedLines.join("")}</div>`
          );
        } else {
          // Regular paragraph
          formattedParagraphs.push(
            `<p class="mb-3">${processFormatting(paragraph)}</p>`
          );
        }
      }

      return formattedParagraphs.join("");
    };

    // Apply the improved processing
    const formattedContent = processContent(content);

    return (
      <div
        dangerouslySetInnerHTML={{ __html: formattedContent }}
        className="chat-formatted-message"
      />
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
        <div className="flex items-center">
          {/* Clear chat button */}
          <button
            onClick={clearChatHistory}
            className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-blue-700 transition-colors mr-2"
            aria-label="Clear chat"
            title="Hapus riwayat chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-blue-700 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={messageContainerRef}
        className="flex-1 p-3 sm:p-4 overflow-y-auto bg-gray-50 custom-scrollbar"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-3 ${
              message.role === "user"
                ? "flex flex-col items-end"
                : "flex flex-col items-start"
            }`}
          >
            <div className="flex items-end gap-2 max-w-full">
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
                  <Bot size={18} />
                </div>
              )}

              <div
                className={`rounded-xl px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none break-words"
                    : "bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-200 break-words"
                } max-w-[85%]`}
              >
                {formatMessage(message.content)}
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div
              className={`text-xs text-gray-500 mt-1 ${
                message.role === "user" ? "text-right mr-10" : "ml-10"
              }`}
            >
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
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
                <div
                  className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
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
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-gray-200 flex items-center"
      >
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
          background: #cbd5e0;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
      `}</style>
    </div>
  );
};

export default SmartChatAssistant;