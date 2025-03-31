import { Message } from '../../api/chat.api';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isAI = message.senderType === 'AI';
  
  // Format the timestamp
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  return (
    <div
      className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <div className="flex flex-col max-w-[75%]">
        <div
          className={`px-4 py-2 rounded-lg ${
            isAI
              ? 'bg-gray-100 text-gray-800 rounded-bl-none'
              : 'bg-indigo-600 text-white rounded-br-none'
          }`}
        >
          {/* Handle potential multi-line messages or markdown */}
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
        <span
          className={`text-xs mt-1 ${
            isAI ? 'text-left text-gray-500' : 'text-right text-gray-400'
          }`}
        >
          {isAI ? 'Gemini AI' : 'You'} • {formattedTime}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;