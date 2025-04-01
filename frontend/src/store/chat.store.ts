import { create } from 'zustand';
import ChatApi, {
  Conversation,
  Message,
  CreateConversationPayload,
  CreateMessagePayload,
} from '../api/chat.api';

// Type for the chat store state
interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions for conversations
  fetchConversations: () => Promise<void>;
  fetchConversation: (conversationId: string) => Promise<void>;
  silentlyFetchConversation: (conversationId: string) => Promise<Conversation>;
  createConversation: (data: CreateConversationPayload) => Promise<Conversation>;
  deleteConversation: (conversationId: string) => Promise<void>;
  generateConversationTitle: (conversationId: string) => Promise<string>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  
  // Actions for messages
  sendMessage: (data: CreateMessagePayload) => Promise<void>;
  
  // Utility actions
  clearError: () => void;
}

// Create the chat store
export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  conversations: [],
  currentConversation: null,
  isLoading: false,
  error: null,
  
  // Fetch all conversations
  fetchConversations: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await ChatApi.getConversations();
      
      set({
        conversations: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch conversations';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  // Fetch a specific conversation
  fetchConversation: async (conversationId) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await ChatApi.getConversation(conversationId);
      
      set({
        currentConversation: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch conversation';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  // Silently fetch a conversation without changing loading state (for polling)
  silentlyFetchConversation: async (conversationId) => {
    try {
      const response = await ChatApi.getConversation(conversationId);
      const fetchedConversation = response.data;
      
      // Only update if the messages have changed (new message or message content changed)
      const currentConvo = get().currentConversation;
      if (currentConvo && currentConvo.id === fetchedConversation.id) {
        const currentMsgCount = currentConvo.messages?.length || 0;
        const newMsgCount = fetchedConversation.messages?.length || 0;
        
        // Check if we have a new message or if the last message content has changed
        if (newMsgCount > currentMsgCount || 
            (currentMsgCount > 0 && newMsgCount > 0 && 
             currentConvo.messages?.[currentMsgCount - 1]?.content !== 
             fetchedConversation.messages?.[newMsgCount - 1]?.content)) {
          
          set({
            currentConversation: fetchedConversation,
          });
        }
      }
      
      return fetchedConversation;
    } catch (error: any) {
      // Silent error handling - just return current conversation
      return get().currentConversation || {} as Conversation;
    }
  },
  
  // Create a new conversation
  createConversation: async (data) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await ChatApi.createConversation(data);
      const newConversation = response.data;
      
      // Add to conversations list and set as current
      set((state) => ({
        conversations: [newConversation, ...state.conversations],
        currentConversation: newConversation,
        isLoading: false,
      }));
      
      return newConversation;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create conversation';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },
  
  // Delete a conversation
  deleteConversation: async (conversationId) => {
    try {
      set({ isLoading: true, error: null });
      
      await ChatApi.deleteConversation(conversationId);
      
      // Remove from conversations list and reset current if needed
      set((state) => ({
        conversations: state.conversations.filter(c => c.id !== conversationId),
        currentConversation: state.currentConversation?.id === conversationId
          ? null
          : state.currentConversation,
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete conversation';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  // Generate a title for a conversation
  generateConversationTitle: async (conversationId) => {
    try {
      set({ isLoading: true, error: null });
      
      const title = await ChatApi.generateConversationTitle(conversationId);
      
      // Update conversation title in state
      set((state) => {
        // Update in conversations list
        const updatedConversations = state.conversations.map(c => 
          c.id === conversationId ? { ...c, title } : c
        );
        
        // Update current conversation if it matches
        const updatedCurrentConversation = 
          state.currentConversation?.id === conversationId
            ? { ...state.currentConversation, title }
            : state.currentConversation;
        
        return {
          conversations: updatedConversations,
          currentConversation: updatedCurrentConversation,
          isLoading: false,
        };
      });
      
      return title;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to generate conversation title';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },
  
  // Set the current conversation
  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation });
  },
  
  // Send a message and handle the response
  sendMessage: async (data) => {
    try {
      // Create a temporary message to show immediately in the UI
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId: data.conversationId,
        content: data.content,
        senderType: 'USER',
        timestamp: new Date().toISOString(),
      };
      
      // Optimistically update the UI with the user's message
      set((state) => {
        if (state.currentConversation?.id === data.conversationId) {
          return {
            currentConversation: {
              ...state.currentConversation,
              messages: [
                ...(state.currentConversation.messages || []),
                tempUserMessage,
              ],
            },
            isLoading: true,
            error: null,
          };
        }
        return { isLoading: true, error: null };
      });
      
      // Now send the actual API request
      const response = await ChatApi.sendMessage(data);
      const { 
        userMessage, 
        aiMessage, 
        error: aiError, 
        processingStatus, 
        retryable, 
        message 
      } = response.data;
      
      // Update conversation with the real messages (replacing the temp one)
      set((state) => {
        // Handle case when the current conversation is the one being updated
        if (state.currentConversation?.id === data.conversationId) {
          // Filter out the temporary message
          const filteredMessages = state.currentConversation.messages?.filter(
            msg => msg.id !== tempUserMessage.id
          ) || [];
          
          // Add the real user message
          const updatedMessages = [...filteredMessages, userMessage];
          
          // Only add AI message if it exists (not failed)
          if (aiMessage) {
            updatedMessages.push(aiMessage);
          }
          
          // If we're in a processing state, don't show an error yet
          // The frontend can poll for updates or retry
          if (processingStatus === 'processing' && retryable) {
            return {
              currentConversation: {
                ...state.currentConversation,
                messages: updatedMessages,
              },
              isLoading: false,
              // Don't set an error for retryable/processing status
              error: null,
            };
          }
          
          return {
            currentConversation: {
              ...state.currentConversation,
              messages: updatedMessages,
            },
            isLoading: false,
            // If there was an AI error, set it in the state
            error: aiError || null,
          };
        }
        
        // If we're in a processing state, don't show an error yet
        if (processingStatus === 'processing' && retryable) {
          return { isLoading: false, error: null };
        }
        
        return { isLoading: false, error: aiError || null };
      });
      
      // If we're in a processing state and it's retryable, try again after a delay
      if (processingStatus === 'processing' && retryable) {
        // Wait 2 seconds before retrying
        setTimeout(async () => {
          try {
            // Silently fetch the conversation to see if the AI response has arrived
            const conversation = await get().silentlyFetchConversation(data.conversationId);
            
            // Update the current conversation with the latest data
            set({ currentConversation: conversation });
          } catch (error) {
            console.error('Error retrying to fetch conversation:', error);
            // Only set an error after retry fails
            set({ 
              error: 'The AI service is taking longer than expected to respond. Please try again later.' 
            });
          }
        }, 2000);
      }
    } catch (error: any) {
      // Don't immediately show network errors to the user
      // These might be transient issues that resolve themselves
      if (error.message?.includes('network') || 
          error.message?.includes('timeout') || 
          error.status === 429 || 
          error.status === 504) {
        console.warn('Transient error during message send, will retry:', error);
        
        // Try silently fetching the conversation after a short delay
        setTimeout(async () => {
          try {
            if (!data.conversationId) return;
            
            const conversation = await get().silentlyFetchConversation(data.conversationId);
            set({ 
              currentConversation: conversation,
              isLoading: false,
              error: null
            });
          } catch (retryError) {
            // Only show error after retry fails
            const errorMessage = error.response?.data?.message || 'Failed to send message';
            set({ error: errorMessage, isLoading: false });
          }
        }, 1000);
        
        // Don't show an error yet
        set({ isLoading: false });
        return;
      }
      
      // For other errors, show them immediately
      const errorMessage = error.response?.data?.message || 'Failed to send message';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

export default useChatStore;