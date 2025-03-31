import { Router } from 'express';
import chatController from '../controllers/chat.controller';
import authMiddleware from '../middleware/auth.middleware';
import validateRequest from '../middleware/validate.middleware';
import { CreateConversationDto, CreateMessageDto } from '../dtos/chat.dto';

const router = Router();

// All chat routes require authentication
router.use(authMiddleware);

// POST /api/chat/conversations - Create a new conversation
router.post(
  '/conversations',
  validateRequest(CreateConversationDto),
  chatController.createConversation
);

// GET /api/chat/conversations - Get all user conversations
router.get('/conversations', chatController.getUserConversations);

// GET /api/chat/conversations/:id - Get a specific conversation
router.get('/conversations/:id', chatController.getConversation);

// DELETE /api/chat/conversations/:id - Delete a conversation
router.delete('/conversations/:id', chatController.deleteConversation);

// POST /api/chat/messages - Send a message and get AI response
router.post(
  '/messages',
  validateRequest(CreateMessageDto),
  chatController.sendMessage
);

export default router;