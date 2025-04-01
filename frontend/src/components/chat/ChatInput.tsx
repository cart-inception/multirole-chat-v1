import { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, isLoading, disabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  // Update debug area in sidebar instead of local state
  const updateDebug = (debugMessage: string) => {
    const debugContainer = document.getElementById('debug-container');
    if (debugContainer) {
      debugContainer.innerHTML = debugMessage;
    }
  };

  // Simple form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDebug(`Attempting to send message: "${message}"`);
    
    if (message.trim() && !isLoading && !disabled) {
      try {
        onSendMessage(message);
        updateDebug(`Message sent: "${message}"`);
        setMessage('');
      } catch (error) {
        updateDebug(`Error sending message: ${error}`);
      }
    } else {
      updateDebug(`Cannot send: isLoading=${isLoading}, disabled=${disabled}, message empty=${!message.trim()}`);
    }
  };

  // Direct send button handler to bypass form submission
  const handleSendClick = () => {
    updateDebug(`Clicked send button with message: "${message}"`);
    if (message.trim() && !isLoading && !disabled) {
      try {
        onSendMessage(message);
        updateDebug(`Message sent via button: "${message}"`);
        setMessage('');
      } catch (error) {
        updateDebug(`Error sending message via button: ${error}`);
      }
    }
  };

  return (
    <div className="sticky bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-md">
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex">
          {/* Simple input that should work reliably */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-l-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
            disabled={isLoading || disabled}
          />
          
          {/* Simple button that should work reliably */}
          <button
            type="button"
            onClick={handleSendClick}
            disabled={isLoading || disabled || !message.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
        
        <div className="text-right text-sm text-gray-500">
          {isLoading ? "Processing..." : disabled ? "Chat disabled" : "Ready to send"}
        </div>
      </form>
    </div>
  );
};

export default ChatInput;