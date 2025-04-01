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
      set({ isLoading: true, error: null });
      
      const response = await ChatApi.sendMessage(data);
      const { userMessage, aiMessage, error: aiError } = response.data;
      
      // Update conversation with new messages
      set((state) => {
        // Handle case when the current conversation is the one being updated
        if (state.currentConversation?.id === data.conversationId) {
          const updatedMessages = [
            ...(state.currentConversation.messages || []),
            userMessage,
          ];
          
          // Only add AI message if it exists (not failed)
          if (aiMessage) {
            updatedMessages.push(aiMessage);
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
        
        return { isLoading: false, error: aiError || null };
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