import { useEffect, useRef } from 'react';
import { Message } from '../../api/chat.api';
import MessageBubble from './MessageBubble';
import { Bot, Zap, BrainCircuit } from 'lucide-react';

interface ChatHistoryProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatHistory = ({ messages, isLoading }: ChatHistoryProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Sample suggestions for empty state
  const suggestions = [
    "Explain quantum computing in simple terms",
    "Write a short story about a robot discovering emotions",
    "What are the best practices for sustainable living?",
    "Help me plan a 7-day itinerary for Japan"
  ];
  
  // If no messages yet, show a welcome/instructions message
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-gray-600 dark:text-gray-300">
        <div className="text-center max-w-xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <Bot size={32} className="text-indigo-600 dark:text-indigo-300" />
            </div>
          </div>
          
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            Welcome to Gemini Chat
          </h3>
          
          <p className="mb-6 text-lg">
            Ask anything or get creative with Google's advanced AI assistant
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl mx-auto mb-8">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="text-left p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm">
            <div className="flex items-center">
              <Zap size={16} className="mr-2 text-indigo-500" />
              <span>Instant responses</span>
            </div>
            <div className="flex items-center">
              <BrainCircuit size={16} className="mr-2 text-indigo-500" />
              <span>Trained on diverse datasets</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 thin-scrollbar">
      <div className="max-w-4xl mx-auto">
        {/* Day divider with date */}
        <div className="flex items-center justify-center my-6">
          <div className="border-t border-gray-200 dark:border-gray-700 flex-grow"></div>
          <div className="mx-4 text-xs text-gray-500 font-medium">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 flex-grow"></div>
        </div>
        
        {/* Messages list */}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {/* Loading indicator for AI response */}
        {isLoading && (
          <div className="flex w-full justify-start mb-6">
            <div className="flex-shrink-0 mr-3 mt-1">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <Bot size={18} className="text-indigo-600 dark:text-indigo-300" />
              </div>
            </div>
            
            <div className="message-bubble-ai flex items-center">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="ml-2 text-gray-500 text-sm">Gemini is thinking...</span>
            </div>
          </div>
        )}
        
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} className="h-4" />
      </div>
    </div>
  );
};

export default ChatHistory;