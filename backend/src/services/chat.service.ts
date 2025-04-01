import { PrismaClient, SenderType } from '@prisma/client';
import { ApiError } from '../middleware/error.middleware';
import geminiService from './gemini.service';
import {
  CreateConversationDtoType,
  CreateMessageDtoType,
} from '../dtos/chat.dto';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Service for chat-related operations
 */
export class ChatService {
  /**
   * Create a new conversation for a user
   */
  async createConversation(userId: string, data: CreateConversationDtoType) {
    try {
      // Create a new conversation
      const conversation = await prisma.conversation.create({
        data: {
          userId,
          title: data.title || 'New Conversation', // Default title if none provided
        },
      });

      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw new ApiError('Failed to create conversation', 500);
    }
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string) {
    try {
      const conversations = await prisma.conversation.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        include: {
          // Include the last message for each conversation
          messages: {
            orderBy: { timestamp: 'desc' },
            take: 1,
          },
        },
      });

      return conversations;
    } catch (error) {
      console.error('Error fetching user conversations:', error);
      throw new ApiError('Failed to fetch conversations', 500);
    }
  }

  /**
   * Get a specific conversation by ID
   */
  async getConversation(conversationId: string, userId: string) {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { timestamp: 'asc' } } },
      });

      if (!conversation) {
        throw new ApiError('Conversation not found', 404);
      }

      // Ensure user owns this conversation
      if (conversation.userId !== userId) {
        throw new ApiError('Not authorized to access this conversation', 403);
      }

      return conversation;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error fetching conversation:', error);
      throw new ApiError('Failed to fetch conversation', 500);
    }
  }

  /**
   * Send a message and get AI response
   */
  async sendMessage(userId: string, data: CreateMessageDtoType) {
    try {
      // First, verify the conversation exists and belongs to the user
      const conversation = await prisma.conversation.findUnique({
        where: { id: data.conversationId },
        include: { 
          messages: {
            orderBy: { timestamp: 'asc' },
          } 
        },
      });

      if (!conversation) {
        throw new ApiError('Conversation not found', 404);
      }

      if (conversation.userId !== userId) {
        throw new ApiError('Not authorized to access this conversation', 403);
      }

      // Step 1: Save the user's message first
      const userMessage = await prisma.message.create({
        data: {
          conversationId: data.conversationId,
          content: data.content,
          senderType: SenderType.USER,
        },
      });

      // Prepare conversation history for context
      const history = conversation.messages.map(message => ({
        role: message.senderType === SenderType.USER ? 'user' : 'model',
        content: message.content,
      }));

      try {
        // Step 2: Get AI response - this can take longer
        const aiResponseContent = await geminiService.generateResponse(data.content, history);

        // Step 3: Save the AI's response
        const aiMessage = await prisma.message.create({
          data: {
            conversationId: data.conversationId,
            content: aiResponseContent,
            senderType: SenderType.AI,
          },
        });

        // Step 4: Update conversation's updatedAt timestamp
        await prisma.conversation.update({
          where: { id: data.conversationId },
          data: { updatedAt: new Date() },
        });

        // Auto update conversation title
        await this.autoUpdateConversationTitle(userId, data.conversationId);

        // Return both messages
        return {
          userMessage,
          aiMessage,
        };
      } catch (error) {
        console.error("Error generating or saving AI response:", error);
        
        // Even if AI response fails, we want to return the user message
        // and indicate there was a problem with AI response
        return {
          userMessage,
          error: error instanceof ApiError 
            ? error.message 
            : "Failed to generate AI response. Please try again."
        };
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error sending message:', error);
      throw new ApiError('Failed to send message', 500);
    }
  }

  /**
   * Delete a conversation and all its messages
   */
  async deleteConversation(conversationId: string, userId: string) {
    try {
      // First, verify the conversation exists and belongs to the user
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });

      if (!conversation) {
        throw new ApiError('Conversation not found', 404);
      }

      if (conversation.userId !== userId) {
        throw new ApiError('Not authorized to delete this conversation', 403);
      }

      // Delete the conversation (messages will be cascaded due to relation in schema)
      await prisma.conversation.delete({
        where: { id: conversationId },
      });

      return { success: true };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error deleting conversation:', error);
      throw new ApiError('Failed to delete conversation', 500);
    }
  }

  /**
   * Generate a title for a conversation based on its content
   * @param conversationId The ID of the conversation
   */
  async generateConversationTitle(userId: string, conversationId: string): Promise<string> {
    try {
      // Get conversation from database
      const conversation = await prisma.conversation.findFirstOrThrow({
        where: {
          id: conversationId,
          userId,
        },
        include: {
          messages: true,
        },
      });
      
      // Format messages for the AI service
      const messages = conversation.messages.map(msg => ({
        role: msg.senderType === SenderType.USER ? 'user' : 'assistant',
        content: msg.content,
      }));
      
      // Generate title using Gemini API
      const title = await geminiService.generateConversationTitle(messages);
      
      // Update conversation title in database
      await prisma.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          title,
        },
      });
      
      return title;
    } catch (error) {
      console.error('Error generating conversation title:', error);
      return 'New Conversation';
    }
  }

  /**
   * Automatically update conversation title after a few messages
   * @param userId The user ID
   * @param conversationId The conversation ID
   */
  async autoUpdateConversationTitle(userId: string, conversationId: string): Promise<void> {
    try {
      // Get conversation
      const conversation = await prisma.conversation.findFirstOrThrow({
        where: {
          id: conversationId,
          userId,
        },
        include: {
          messages: true,
        },
      });
      
      // Only update title if it's still the default or if we have enough context
      if (
        (conversation.title === 'New Conversation' || !conversation.title) &&
        conversation.messages.length >= 2
      ) {
        await this.generateConversationTitle(userId, conversationId);
      }
    } catch (error) {
      console.error('Error auto-updating conversation title:', error);
    }
  }
}

export default new ChatService();