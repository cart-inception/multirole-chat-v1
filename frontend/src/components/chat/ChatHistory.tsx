import { useEffect, useRef } from 'react';
import { Message } from '../../api/chat.api';
import MessageBubble from './MessageBubble';
import Spinner from '../ui/Spinner';

interface ChatHistoryProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatHistory = ({ messages, isLoading }: ChatHistoryProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // If no messages yet, show a welcome/instructions message
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-gray-500">
        <div className="text-center max-w-md">
          <h3 className="text-xl font-medium text-gray-900 mb-2">Welcome to Gemini Chat</h3>
          <p className="mb-4">
            This is a chat application powered by Google's Gemini AI. Start a conversation
            by typing a message below.
          </p>
          <p className="text-sm">
            You can ask questions, get information, or just chat about anything!
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* Messages list */}
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      
      {/* Loading indicator for AI response */}
      {isLoading && (
        <div className="flex items-center justify-start mb-4">
          <div className="bg-gray-100 px-4 py-2 rounded-lg rounded-bl-none">
            <div className="flex items-center">
              <Spinner size="sm" color="primary" />
              <span className="ml-2 text-gray-500">Gemini is thinking...</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatHistory;