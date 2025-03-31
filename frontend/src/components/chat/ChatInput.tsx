import { useState, FormEvent, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import Button from '../ui/Button';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, isLoading, disabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  // Handle keyboard shortcuts (Ctrl+Enter to submit)
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && message.trim() && !isLoading) {
      e.preventDefault();
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="flex flex-col p-4 border-t border-gray-200 bg-white"
    >
      <div className="relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || disabled}
          placeholder="Type your message here..."
          className="w-full px-4 py-3 pr-16 text-gray-900 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          rows={3}
        />
        <Button
          type="submit"
          disabled={isLoading || !message.trim() || disabled}
          isLoading={isLoading}
          className="absolute bottom-3 right-3"
          variant="primary"
          size="sm"
        >
          <Send size={16} />
        </Button>
      </div>
      <div className="mt-2 text-xs text-gray-500 text-right">
        Press Ctrl+Enter to send
      </div>
    </form>
  );
};

export default ChatInput;