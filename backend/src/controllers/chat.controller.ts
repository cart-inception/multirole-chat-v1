import { Request, Response, NextFunction } from 'express';
import chatService from '../services/chat.service';
import { CreateConversationDtoType, CreateMessageDtoType } from '../dtos/chat.dto';

/**
 * Controller for chat-related endpoints
 */
export class ChatController {
  /**
   * Create a new conversation
   */
  async createConversation(req: Request, res: Response, next: NextFunction) {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }
      
      const conversationData: CreateConversationDtoType = req.body;
      const conversation = await chatService.createConversation(req.user.id, conversationData);
      
      return res.status(201).json({
        success: true,
        message: 'Conversation created successfully',
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all conversations for the authenticated user
   */
  async getUserConversations(req: Request, res: Response, next: NextFunction) {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }
      
      const conversations = await chatService.getUserConversations(req.user.id);
      
      return res.status(200).json({
        success: true,
        data: conversations,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific conversation by ID
   */
  async getConversation(req: Request, res: Response, next: NextFunction) {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }
      
      const conversationId = req.params.id;
      const conversation = await chatService.getConversation(conversationId, req.user.id);
      
      return res.status(200).json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send a message and get AI response
   */
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }
      
      const messageData: CreateMessageDtoType = req.body;
      const messages = await chatService.sendMessage(req.user.id, messageData);
      
      return res.status(201).json({
        success: true,
        message: 'Message sent and AI response generated',
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(req: Request, res: Response, next: NextFunction) {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }
      
      const conversationId = req.params.id;
      await chatService.deleteConversation(conversationId, req.user.id);
      
      return res.status(200).json({
        success: true,
        message: 'Conversation deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ChatController();