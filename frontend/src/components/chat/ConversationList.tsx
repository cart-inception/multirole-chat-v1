import { Trash2 } from 'lucide-react';
import { Conversation } from '../../api/chat.api';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  isLoading: boolean;
}

const ConversationList = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  isLoading,
}: ConversationListProps) => {
  // Format the conversation date (show just the date, not time)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // If no conversations and loading, show skeleton
  if (conversations.length === 0 && isLoading) {
    return (
      <div className="h-full p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-2 p-2 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  // If no conversations, show empty state
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-gray-500">
        <p className="text-center">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <ul>
        {conversations.map((conversation) => (
          <li
            key={conversation.id}
            className={`p-2 m-2 rounded-md cursor-pointer hover:bg-gray-100 relative ${
              activeConversationId === conversation.id ? 'bg-indigo-50' : ''
            }`}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="flex justify-between items-center">
              <div className="truncate pr-8">
                <h3 className="font-medium text-gray-900 truncate">
                  {conversation.title || 'New Conversation'}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {conversation.messages?.[0]?.content || 'No messages yet'}
                </p>
              </div>
              <div className="absolute right-2 flex items-center">
                <span className="text-xs text-gray-400 mr-2">
                  {formatDate(conversation.updatedAt)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                  className="text-gray-400 hover:text-red-500 focus:outline-none"
                  title="Delete conversation"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationList;