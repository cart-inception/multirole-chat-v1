import { Request, Response, NextFunction } from 'express';
import chatService from '../services/chat.service';
import { CreateConversationDtoType, CreateMessageDtoType } from '../dtos/chat.dto';

/**
 * Controller for chat-related endpoints
 */
class ChatController {
  constructor() {
    // Bind all methods to this instance to ensure proper 'this' context
    this.createConversation = this.createConversation.bind(this);
    this.getUserConversations = this.getUserConversations.bind(this);
    this.getConversation = this.getConversation.bind(this);
    this.deleteConversation = this.deleteConversation.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.generateConversationTitle = this.generateConversationTitle.bind(this);
  }

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
      const conversation = await chatService.getConversation(req.user.id, conversationId);
      
      return res.status(200).json({
        success: true,
        data: conversation,
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
      await chatService.deleteConversation(req.user.id, conversationId);
      
      return res.status(200).json({
        success: true,
        message: 'Conversation deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Send a message to a conversation
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
      
      const conversationId = req.params.id;
      const messageData = {
        conversationId,
        content: req.body.content,
      };
      
      // Save message to database and get AI response
      const result = await chatService.sendMessage(req.user.id, messageData);
      
      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate or update a conversation title
   */
  async generateConversationTitle(req: Request, res: Response, next: NextFunction) {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }
      
      const conversationId = req.params.id;
      const title = await chatService.generateConversationTitle(req.user.id, conversationId);
      
      return res.status(200).json({
        success: true,
        message: 'Conversation title generated successfully',
        data: { title },
      });
    } catch (error) {
      next(error);
    }
  }
}

// Create and export a single instance of the controller
export default new ChatController();