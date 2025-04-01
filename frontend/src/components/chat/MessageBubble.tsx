import { useState } from 'react';
import { Message } from '../../api/chat.api';
import { User, Bot, Copy, Check, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';
import type { Components } from 'react-markdown';

interface MessageBubbleProps {
  message: Message;
}

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

  // Define custom components for markdown rendering
  const markdownComponents: Components = {
    // Style code blocks
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return match ? (
        <div className="relative rounded-md bg-gray-800 text-gray-100 dark:bg-gray-900 dark:text-gray-200 my-2 overflow-x-auto">
          <pre>
            <code className={`language-${match[1]}`} {...props}>
              {String(children).replace(/\n$/, '')}
            </code>
          </pre>
        </div>
      ) : (
        <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-800 rounded text-sm" {...props}>
          {children}
        </code>
      );
    },
    // Improve styling for lists
    ul({ children }) {
      return <ul className="list-disc pl-6 my-2">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="list-decimal pl-6 my-2">{children}</ol>;
    },
    // Add style for blockquotes
    blockquote({ children }) {
      return <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic text-gray-600 dark:text-gray-400 my-3">{children}</blockquote>;
    },
    // Style headings
    h1({ children }) {
      return <h1 className="text-xl font-bold my-3">{children}</h1>;
    },
    h2({ children }) {
      return <h2 className="text-lg font-bold my-2">{children}</h2>;
    },
    h3({ children }) {
      return <h3 className="text-md font-bold my-2">{children}</h3>;
    },
    // Style paragraphs
    p({ children }) {
      return <p className="mb-2 whitespace-pre-wrap">{children}</p>;
    },
    // Style tables
    table({ children }) {
      return <table className="border-collapse border border-gray-300 dark:border-gray-700 my-4 w-full">{children}</table>;
    },
    thead({ children }) {
      return <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>;
    },
    th({ children }) {
      return <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">{children}</th>;
    },
    td({ children }) {
      return <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{children}</td>;
    }
  };
  
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
        <div className={`relative ${isAI ? 'message-bubble-ai' : 'message-bubble-user'} ${isAI ? 'prose prose-sm dark:prose-invert max-w-none' : ''}`}>
          {isAI ? (
            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize, rehypeHighlight]}
                components={markdownComponents}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
          
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
          {isAI ? 'Assistant' : 'You'} <Clock size={12} className="mx-1" /> {formattedTime}
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