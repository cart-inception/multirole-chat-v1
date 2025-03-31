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

      // Begin transaction to ensure both user message and AI response are saved together
      return await prisma.$transaction(async (tx) => {
        // Save the user's message
        const userMessage = await tx.message.create({
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

        // Get AI response
        const aiResponseContent = await geminiService.generateResponse(data.content, history);

        // Save the AI's response
        const aiMessage = await tx.message.create({
          data: {
            conversationId: data.conversationId,
            content: aiResponseContent,
            senderType: SenderType.AI,
          },
        });

        // Update conversation's updatedAt timestamp
        await tx.conversation.update({
          where: { id: data.conversationId },
          data: { updatedAt: new Date() },
        });

        // Return both messages
        return {
          userMessage,
          aiMessage,
        };
      });
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
}

export default new ChatService();