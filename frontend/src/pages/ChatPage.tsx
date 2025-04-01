import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chat.store';
import ChatHistory from '../components/chat/ChatHistory';
import ChatInput from '../components/chat/ChatInput';
import Alert from '../components/ui/Alert';
import { MessageSquare } from 'lucide-react';

const ChatPage = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const [isPolling, setIsPolling] = useState(false);
  
  const {
    currentConversation,
    fetchConversation,
    silentlyFetchConversation,
    createConversation,
    sendMessage,
    isLoading,
    error,
    clearError,
  } = useChatStore();

  // Handle loading conversation from URL parameter
  useEffect(() => {
    if (conversationId) {
      fetchConversation(conversationId)
        .catch(err => console.error(`Error fetching conversation: ${err.message}`));
    } else if (!currentConversation) {
      // Create a new conversation if none is active
      const createNewConversation = async () => {
        try {
          const newConversation = await createConversation({ title: 'New Conversation' });
          navigate(`/chat/${newConversation.id}`);
        } catch (error: any) {
          console.error('Failed to create new conversation', error);
        }
      };
      
      createNewConversation();
    }
  }, [conversationId]);

  // Polling mechanism to check for updates after sending a message
  useEffect(() => {
    let pollingInterval: number | null = null;
    let pollCount = 0; // Track poll count inside the effect
    
    if (isPolling && conversationId) {
      // Poll every 2 seconds for up to 60 seconds (30 polls)
      pollingInterval = window.setInterval(() => {
        silentlyFetchConversation(conversationId)
          .then((conversation) => {
            // Update poll count and check if we should stop polling
            pollCount++;
            
            const messages = conversation?.messages || [];
            
            // Stop polling if we have at least 2 messages (user + AI) and the last one is from AI
            // or if we've polled 30 times (60 seconds)
            if ((messages.length >= 2 && messages[messages.length - 1]?.senderType === 'AI') || pollCount >= 30) {
              console.log(`Polling complete after ${pollCount} attempts`);
              setIsPolling(false);
              if (pollingInterval) {
                window.clearInterval(pollingInterval);
              }
            }
          })
          .catch(() => {
            // If there's an error, increment the poll count
            pollCount++;
            if (pollCount >= 30) {
              console.log(`Polling stopped after ${pollCount} attempts due to errors`);
              setIsPolling(false);
              if (pollingInterval) {
                window.clearInterval(pollingInterval);
              }
            }
          });
      }, 2000);
    }
    
    return () => {
      if (pollingInterval) {
        window.clearInterval(pollingInterval);
      }
    };
  }, [isPolling, conversationId]);

  // Handle sending a new message
  const handleSendMessage = async (content: string) => {
    if (!currentConversation) {
      return;
    }
    
    try {
      // Start polling after sending a message
      setIsPolling(true);
      
      await sendMessage({
        conversationId: currentConversation.id,
        content,
      });
    } catch (error: any) {
      console.error(`Error sending message: ${error.message}`);
    }
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
            {currentConversation ? (
              <>
                <div className="bg-gray-50 dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div className="flex items-center">
                    <MessageSquare size={16} className="mr-2 text-indigo-600" />
                    <span className="font-medium">
                      {currentConversation.title || 'New Conversation'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {currentConversation.id}
                  </div>
                </div>
                <ChatHistory
                  messages={currentConversation?.messages || []}
                  isLoading={isLoading}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No conversation selected
              </div>
            )}
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