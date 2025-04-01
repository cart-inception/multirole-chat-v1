import { useState } from 'react';
import { Message } from '../../api/chat.api';
import { User, Bot, Copy, Check, Clock } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

// Function to detect and format code blocks in messages
const formatMessageContent = (content: string) => {
  // Split by code block markers
  const parts = content.split(/```([\s\S]*?)```/);
  
  if (parts.length === 1) {
    // No code blocks found, just return the text
    return <p className="whitespace-pre-wrap">{content}</p>;
  }
  
  return (
    <>
      {parts.map((part, index) => {
        // Even indices are regular text, odd indices are code
        if (index % 2 === 0) {
          return part ? <p key={index} className="whitespace-pre-wrap mb-2">{part}</p> : null;
        } else {
          // This is a code block
          return (
            <div key={index} className="relative rounded-md bg-gray-800 text-gray-100 dark:bg-gray-900 dark:text-gray-200 font-mono text-sm p-3 my-2 overflow-x-auto">
              <pre>{part}</pre>
            </div>
          );
        }
      })}
    </>
  );
};

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isAI = message.senderType === 'AI';
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Format the timestamp
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  return (
    <div className={`flex w-full group animate-fade-in ${isAI ? 'justify-start' : 'justify-end'} mb-6`}>
      {/* Avatar for AI messages */}
      {isAI && (
        <div className="flex-shrink-0 mr-3 mt-1">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
            <Bot size={18} className="text-indigo-600 dark:text-indigo-300" />
          </div>
        </div>
      )}
      
      <div className={`flex flex-col ${isAI ? 'items-start' : 'items-end'} max-w-[85%]`}>
        <div className={`relative ${isAI ? 'message-bubble-ai' : 'message-bubble-user'}`}>
          {formatMessageContent(message.content)}
          
          {/* Copy button */}
          <button 
            onClick={handleCopy}
            className={`absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity
              ${isAI 
                ? 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700' 
                : 'text-white hover:bg-indigo-700'}`}
            aria-label="Copy message content"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        
        {/* Timestamp */}
        <div className={`flex items-center text-xs mt-1 px-2 ${isAI ? 'text-gray-500' : 'text-gray-500'}`}>
          {isAI ? 'Gemini AI' : 'You'} <Clock size={12} className="mx-1" /> {formattedTime}
        </div>
      </div>
      
      {/* Avatar for user messages */}
      {!isAI && (
        <div className="flex-shrink-0 ml-3 mt-1">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;