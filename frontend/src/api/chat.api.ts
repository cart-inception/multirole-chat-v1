import api from './index';

// Types for request payloads
export interface CreateConversationPayload {
  title?: string;
}

export interface CreateMessagePayload {
  conversationId: string;
  content: string;
}

// Types for responses
export interface Conversation {
  id: string;
  userId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderType: 'USER' | 'AI';
  content: string;
  timestamp: string;
}

export interface MessagesResponse {
  userMessage: Message;
  aiMessage: Message;
}

// Chat API service
const ChatApi = {
  // Create a new conversation
  createConversation: async (data: CreateConversationPayload) => {
    const response = await api.post<{ success: boolean; message: string; data: Conversation }>(
      '/chat/conversations',
      data
    );
    return response.data;
  },
  
  // Get all conversations for the current user
  getConversations: async () => {
    const response = await api.get<{ success: boolean; data: Conversation[] }>(
      '/chat/conversations'
    );
    return response.data;
  },
  
  // Get a specific conversation by ID
  getConversation: async (conversationId: string) => {
    const response = await api.get<{ success: boolean; data: Conversation }>(
      `/chat/conversations/${conversationId}`
    );
    return response.data;
  },
  
  // Delete a conversation
  deleteConversation: async (conversationId: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/chat/conversations/${conversationId}`
    );
    return response.data;
  },
  
  // Send a message and get AI response
  sendMessage: async (data: CreateMessagePayload) => {
    const response = await api.post<{ 
      success: boolean; 
      message: string; 
      data: MessagesResponse;
    }>(
      '/chat/messages',
      data
    );
    return response.data;
  },
};

export default ChatApi;