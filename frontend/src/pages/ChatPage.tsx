import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chat.store';
import ChatHistory from '../components/chat/ChatHistory';
import ChatInput from '../components/chat/ChatInput';
import Alert from '../components/ui/Alert';

const ChatPage = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  
  const {
    currentConversation,
    fetchConversation,
    createConversation,
    sendMessage,
    isLoading,
    error,
    clearError,
  } = useChatStore();

  // Handle loading conversation from URL parameter
  useEffect(() => {
    if (conversationId) {
      fetchConversation(conversationId);
    } else if (!currentConversation) {
      // Create a new conversation if none is active
      const createNewConversation = async () => {
        try {
          const newConversation = await createConversation({ title: 'New Conversation' });
          navigate(`/chat/${newConversation.id}`);
        } catch (error) {
          console.error('Failed to create new conversation', error);
        }
      };
      
      createNewConversation();
    }
  }, [conversationId, fetchConversation, createConversation, currentConversation, navigate]);

  // Handle sending a new message
  const handleSendMessage = async (content: string) => {
    if (!currentConversation) return;
    
    await sendMessage({
      conversationId: currentConversation.id,
      content,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="p-4">
          <Alert type="error" message={error} onClose={clearError} />
        </div>
      )}
      
      {!currentConversation && isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-hidden flex flex-col">
            <ChatHistory
              messages={currentConversation?.messages || []}
              isLoading={isLoading}
            />
          </div>
          
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            disabled={!currentConversation}
          />
        </>
      )}
    </div>
  );
};

export default ChatPage;