import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chat.store';
import ChatHistory from '../components/chat/ChatHistory';
import ChatInput from '../components/chat/ChatInput';
import Alert from '../components/ui/Alert';
import { MessageSquare, RefreshCw } from 'lucide-react';

const ChatPage = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  
  const {
    currentConversation,
    fetchConversation,
    createConversation,
    sendMessage,
    isLoading,
    error,
    clearError,
  } = useChatStore();

  const addDebugMessage = (message: string) => {
    console.log("Debug:", message);
    setDebugInfo(prev => [...prev, `${new Date().toISOString().slice(11, 19)}: ${message}`]);
  };

  // Handle loading conversation from URL parameter
  useEffect(() => {
    addDebugMessage(`ChatPage mounted/updated: conversationId=${conversationId}, hasCurrentConversation=${!!currentConversation}`);
    
    if (conversationId) {
      addDebugMessage(`Fetching conversation with ID: ${conversationId}`);
      fetchConversation(conversationId)
        .then(() => addDebugMessage(`Conversation fetched successfully`))
        .catch(err => addDebugMessage(`Error fetching conversation: ${err.message}`));
    } else if (!currentConversation) {
      // Create a new conversation if none is active
      addDebugMessage(`No current conversation, creating a new one`);
      const createNewConversation = async () => {
        try {
          const newConversation = await createConversation({ title: 'New Conversation' });
          addDebugMessage(`New conversation created: ${newConversation.id}`);
          navigate(`/chat/${newConversation.id}`);
        } catch (error: any) {
          addDebugMessage(`Failed to create new conversation: ${error.message}`);
          console.error('Failed to create new conversation', error);
        }
      };
      
      createNewConversation();
    }
  }, [conversationId]);

  // Manual conversation refresh
  const handleRefreshConversation = () => {
    if (conversationId) {
      addDebugMessage(`Manually refreshing conversation: ${conversationId}`);
      fetchConversation(conversationId)
        .then(() => addDebugMessage(`Conversation refreshed successfully`))
        .catch(err => addDebugMessage(`Error refreshing conversation: ${err.message}`));
    }
  };

  // Handle sending a new message
  const handleSendMessage = async (content: string) => {
    addDebugMessage(`Sending message: "${content}"`);
    
    if (!currentConversation) {
      addDebugMessage(`Error: No current conversation`);
      return;
    }
    
    try {
      addDebugMessage(`Sending to conversation: ${currentConversation.id}`);
      await sendMessage({
        conversationId: currentConversation.id,
        content,
      });
      addDebugMessage(`Message sent successfully, waiting for AI response`);
    } catch (error: any) {
      addDebugMessage(`Error sending message: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Debug panel - only in development */}
      <div className="bg-gray-100 p-2 text-xs font-mono">
        <div className="flex justify-between items-center mb-1">
          <div>
            <span className="font-bold">Debug Info</span> (Conv ID: {conversationId || 'none'})
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleRefreshConversation}
              className="p-1 bg-blue-100 hover:bg-blue-200 rounded"
              title="Refresh conversation"
            >
              <RefreshCw size={14} />
            </button>
            <button 
              onClick={() => setDebugInfo([])}
              className="p-1 bg-red-100 hover:bg-red-200 rounded"
              title="Clear debug logs"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="max-h-32 overflow-y-auto bg-white p-1 border border-gray-300 rounded">
          {debugInfo.length > 0 ? (
            debugInfo.map((msg, i) => (
              <div key={i} className="break-all">{msg}</div>
            ))
          ) : (
            <div className="text-gray-400">No debug messages yet</div>
          )}
        </div>
      </div>
      
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
                <div className="bg-white p-2 border-b border-gray-200 flex justify-between items-center">
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