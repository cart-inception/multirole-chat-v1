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
  createConversation: (data: CreateConversationPayload) => Promise<Conversation>;
  deleteConversation: (conversationId: string) => Promise<void>;
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
  
  // Set the current conversation
  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation });
  },
  
  // Send a message and handle the response
  sendMessage: async (data) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await ChatApi.sendMessage(data);
      const { userMessage, aiMessage } = response.data;
      
      // Update conversation with new messages
      set((state) => {
        // Handle case when the current conversation is the one being updated
        if (state.currentConversation?.id === data.conversationId) {
          const updatedMessages = [
            ...(state.currentConversation.messages || []),
            userMessage,
            aiMessage,
          ];
          
          return {
            currentConversation: {
              ...state.currentConversation,
              messages: updatedMessages,
            },
            isLoading: false,
          };
        }
        
        return { isLoading: false };
      });
    } catch (error: any) {
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